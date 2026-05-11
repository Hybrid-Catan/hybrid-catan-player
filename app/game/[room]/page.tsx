'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import type { GameState, Player } from '@/utils/types'
import { buildRoad } from "@/lib/api/build/buildRoad";
import { buildSettlement } from "@/lib/api/build/buildSettlement";
import { buildCity } from "@/lib/api/build/buildCity";
import { getGame } from "@/lib/api/game/getGame";
import { confirmSetupRoad } from "@/lib/api/turn/setup";
import { rollDice } from "@/lib/api/turn/buffer";

const COLOR_MAP: Record<Player['color'], string> = {
  RED: '#ef4444',
  BLUE: '#3b82f6',
  WHITE: '#f0e6cc',
  ORANGE: '#f97316',
}

const RESOURCES = [
  { id: 'WOOD', label: 'Wood', color: '#4A7C4E', emoji: '🌲' },
  { id: 'BRICK', label: 'Brick', color: '#B85C38', emoji: '🧱' },
  { id: 'WOOL', label: 'Sheep', color: '#7DAF5A', emoji: '🐑' },
  { id: 'WHEAT', label: 'Wheat', color: '#C8A84B', emoji: '🌾' },
  { id: 'ORE', label: 'Ore', color: '#7A8FA8', emoji: '⛏️' },
] as const

type ResourceId = typeof RESOURCES[number]['id']

const BUILD_COSTS: Record<string, Partial<Record<ResourceId, number>>> = {
  Road: { WOOD: 1, BRICK: 1 },
  Settlement: { WOOD: 1, BRICK: 1, WOOL: 1, WHEAT: 1 },
  City: { WHEAT: 2, ORE: 3 },
}

function canAfford(resources: Record<ResourceId, number>, cost: Partial<Record<ResourceId, number>>) {
  return Object.entries(cost).every(([r, n]) => resources[r as ResourceId] >= (n ?? 0))
}

function totalCards(resources: Record<string, number>) {
  return Object.values(resources).reduce((a, b) => a + b, 0)
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
}

function Die({ value }: { value: number }) {
  return (
    <svg viewBox="0 0 100 100" className="w-10 h-10">
      <rect x="6" y="6" width="88" height="88" rx="18" fill="#161C27" stroke="#2A3347" strokeWidth="2" />
      {(DOT_POSITIONS[value] ?? []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="7.5" fill="#F0E6CC" />
      ))}
    </svg>
  )
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
]

type StreamStatus = "idle" | "connecting" | "connected" | "host_gone" | "error"

// ── Board Camera Panel ────────────────────────────────────────────────────────
function BoardCamera({
  streamStatus,
  videoRef,
  onRetry,
}: {
  streamStatus: StreamStatus
  videoRef: React.RefObject<HTMLVideoElement>
  onRetry: () => void
}) {
  return (
    <div className="relative rounded-xl border border-[#2A3347] overflow-hidden bg-[#060A10]" style={{ aspectRatio: '16/9' }}>
      {/* Corner brackets */}
      {(['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'] as const).map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-4 h-4 pointer-events-none`} style={{
          borderTop: i < 2 ? '1.5px solid rgba(200,134,26,.5)' : undefined,
          borderBottom: i >= 2 ? '1.5px solid rgba(200,134,26,.5)' : undefined,
          borderLeft: i % 2 === 0 ? '1.5px solid rgba(200,134,26,.5)' : undefined,
          borderRight: i % 2 === 1 ? '1.5px solid rgba(200,134,26,.5)' : undefined,
        }} />
      ))}

      {/* Video element — always mounted so the stream can attach */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-contain transition-opacity duration-500 ${streamStatus === 'connected' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* ── Connecting / handshaking ── */}
      {(streamStatus === 'idle' || streamStatus === 'connecting') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060A10]">
          <div className="w-10 h-10 border-2 border-[#C8861A] border-t-transparent rounded-full animate-spin" />
          <p className="f-cinzel text-[10px] tracking-[0.3em] uppercase text-[#4A5875]">
            {streamStatus === 'idle' ? 'Initialising stream…' : 'Connecting to board…'}
          </p>
        </div>
      )}

      {/* ── Host gone ── */}
      {streamStatus === 'host_gone' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#060A10]/95 backdrop-blur-sm">
          <div style={{ animation: 'pulseRing 2s ease-in-out infinite' }}>
            <svg viewBox="0 0 80 80" className="w-16 h-16">
              <polygon
                points={Array.from({ length: 6 }, (_, i) => {
                  const a = (Math.PI / 180) * (60 * i - 30)
                  return `${40 + 34 * Math.cos(a)},${40 + 34 * Math.sin(a)}`
                }).join(' ')}
                fill="rgba(234,179,8,.08)" stroke="rgba(234,179,8,.5)" strokeWidth="1.5"
              />
              <text x="40" y="47" textAnchor="middle" fontSize="22">⏸</text>
            </svg>
          </div>
          <div className="text-center space-y-1">
            <p className="f-cinzel text-xs tracking-[0.25em] uppercase text-yellow-400">Host disconnected</p>
            <p className="f-body text-xs text-[#4A5875] max-w-[200px]">Reconnecting automatically when host returns.</p>
          </div>
          <button
            onClick={onRetry}
            className="mt-1 px-5 py-1.5 f-cinzel text-[10px] tracking-[0.3em] uppercase border border-[#C8861A]/40 text-[#C8861A] hover:border-[#C8861A] hover:bg-[#C8861A]/10 transition-all duration-300"
            style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {streamStatus === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060A10]/95">
          <span className="text-3xl">⚠️</span>
          <p className="f-cinzel text-[10px] tracking-widest uppercase text-red-400">Stream unavailable</p>
          <button
            onClick={onRetry}
            className="px-5 py-1.5 f-cinzel text-[10px] tracking-[0.3em] uppercase border border-red-500/40 text-red-400 hover:border-red-400 hover:bg-red-500/10 transition-all duration-300"
            style={{ clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)' }}
          >
            🔄 Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default function GamePage() {
  const params = useParams()
  const room = (params.room as string).toUpperCase()
  const searchParams = useSearchParams()
  const myPlayerId = searchParams.get('playerId') ?? ''

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [dice, setDice] = useState<[number, number]>([1, 1])
  const [resources, setResources] = useState<Record<ResourceId, number>>(
    { WOOD: 0, BRICK: 0, WOOL: 0, WHEAT: 0, ORE: 0 }
  )
  const [setupStep, setSetupStep] = useState<'settlement' | 'road'>('settlement')
  const [buildOpen, setBuildOpen] = useState(false)
  const [tradeOpen, setTradeOpen] = useState(false)
  const [tradeMode, setTradeMode] = useState<'bank' | 'player'>('bank')
  const [bankGive, setBankGive] = useState<ResourceId | null>(null)
  const [bankGet, setBankGet] = useState<ResourceId | null>(null)
  const [offerGive, setOfferGive] = useState<Partial<Record<ResourceId, number>>>({})
  const [offerRequest, setOfferRequest] = useState<Partial<Record<ResourceId, number>>>({})
  const [targetPlayer, setTargetPlayer] = useState<string | null>(null)
  const [sentOffer, setSentOffer] = useState<string | null>(null)

  // ── WebRTC ────────────────────────────────────────────────────────────────
  const boardVideoRef = useRef<HTMLVideoElement | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([])
  const remoteDescSet = useRef(false)
  const playerIndexRef = useRef<number>(0)
  const playerColorRef = useRef<string>('')

  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle')

  // ── Game polling ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const data = await getGame(room)
      if (data.success) {
        setGameState(data.data)
        const player = data.data.players.find((p: any) => p.playerId === myPlayerId)
        if (player) setResources(player.resourceCards as Record<ResourceId, number>)
      }
    }
    load()
    const interval = setInterval(load, 2000)
    return () => clearInterval(interval)
  }, [room])

  // ── WebRTC session ────────────────────────────────────────────────────────
  function startRTCSession() {
    const wsUrl = process.env.NEXT_PUBLIC_HOST_WS
    if (!wsUrl) {
      console.warn('[RTC] NEXT_PUBLIC_HOST_WS not set — skipping board stream')
      return
    }

    // Read player context set by the join page
    const storedIndex = sessionStorage.getItem(`hc_playerIndex_${room}`)
    const storedColor = sessionStorage.getItem(`hc_playerColor_${room}`)
    const storedId    = sessionStorage.getItem(`hc_playerId_${room}`)

    const playerIndex = storedIndex !== null ? Number(storedIndex) : 1
    const playerColor = storedColor ?? ''
    playerIndexRef.current = playerIndex
    playerColorRef.current = playerColor

    // Clean up any previous session
    pcRef.current?.close()
    socketRef.current?.close()
    iceCandidateBuffer.current = []
    remoteDescSet.current = false

    setStreamStatus('connecting')

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    pcRef.current = pc

    pc.ontrack = (event) => {
      const [stream] = event.streams
      if (boardVideoRef.current) {
        boardVideoRef.current.srcObject = stream
      }
      setStreamStatus('connected')
    }

    pc.onicecandidate = (event) => {
      const ws = socketRef.current
      if (event.candidate && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ice',
          candidate: event.candidate,
          gameId: room,
        }))
      }
    }

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      if (state === 'failed') {
        pc.restartIce()
      }
      if (state === 'disconnected') {
        setStreamStatus('host_gone')
      }
    }

    const socket = new WebSocket(wsUrl)
    socketRef.current = socket

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'join_room',
        gameId: room,
        playerIndex,
        playerColor,
        playerId: storedId ?? myPlayerId,
      }))
    }

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data as string)

      if (data.type === 'host_disconnected') {
        setStreamStatus('host_gone')
        if (boardVideoRef.current) boardVideoRef.current.srcObject = null
        pc.close()
        return
      }

      if (data.type === 'host_reconnected') {
        startRTCSession()
        return
      }

      if (data.gameId && data.gameId !== room) return

      if (data.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
        remoteDescSet.current = true

        for (const candidate of iceCandidateBuffer.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.warn)
        }
        iceCandidateBuffer.current = []

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        socket.send(JSON.stringify({
          type: 'answer',
          answer,
          gameId: room,
          playerIndex,
        }))

      } else if (data.type === 'ice') {
        if (!data.candidate) return
        if (!remoteDescSet.current) {
          iceCandidateBuffer.current.push(data.candidate)
        } else {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.warn)
        }
      }
    }

    socket.onerror = () => setStreamStatus('error')
    socket.onclose  = () => {
      // Only flag as error if we were previously live — avoids false alarms on clean unmount
      setStreamStatus(prev => prev === 'connected' ? 'host_gone' : prev)
    }
  }

  useEffect(() => {
    startRTCSession()
    return () => {
      pcRef.current?.close()
      socketRef.current?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room])

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E1117] text-white">
        Loading...
      </div>
    )
  }

  const currentTurnPlayer = gameState.players[0]
  const isMyTurn = currentTurnPlayer.playerId === myPlayerId
  const myPlayer = gameState.players.find(p => p.playerId === myPlayerId) ?? gameState.players[0]
  const otherPlayers = gameState.players.filter(p => p.playerId !== myPlayerId)

  const me = {
    name: myPlayer.name,
    color: myPlayer.color,
    victoryPoints: myPlayer.victoryPoints,
    resources,
  }

  const isSetupPhase = gameState.phase === 'SETUP_1' || gameState.phase === 'SETUP_2'
  const setupPhaseNum = gameState.phase === 'SETUP_2' ? 2 : 1

  function toggleTrade() {
    setTradeOpen(v => !v)
    setBuildOpen(false)
    setGameState(prev => prev ? { ...prev, phase: 'TRADE' } : prev)
  }
  function toggleBuild() {
    setBuildOpen(v => !v)
    setTradeOpen(false)
    setGameState(prev => prev ? { ...prev, phase: 'BUILD' } : prev)
  }
  async function handleBuild(item: string) {
    let result;
    if (item === 'Road')       result = await buildRoad(gameState)
    else if (item === 'Settlement') result = await buildSettlement(gameState)
    else if (item === 'City')  result = await buildCity(gameState)
    if (!result.success) { alert(result.error); return }
    setGameState(result.data)
  }

  function adjustOffer(
    map: Partial<Record<ResourceId, number>>,
    set: (v: Partial<Record<ResourceId, number>>) => void,
    id: ResourceId, delta: number, max?: number
  ) {
    const cur  = map[id] ?? 0
    const next = Math.min(Math.max(cur + delta, 0), max ?? Infinity)
    set({ ...map, [id]: next })
  }

  const myTotalCards = totalCards(me.resources)
  const diceSum = dice[0] + dice[1]

  // ── Sub-components ────────────────────────────────────────────────────────
  const resourceGrid = (
    <div className="grid grid-cols-5 gap-2 lg:gap-3">
      {RESOURCES.map(r => {
        const count  = me.resources[r.id]
        const active = count > 0
        return (
          <div key={r.id}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-200
              ${active ? 'border-[#2A3347] bg-[#161C27]' : 'border-[#161C27] bg-[#0A0D14] opacity-50'}`}>
            <span className="text-2xl leading-none">{r.emoji}</span>
            <span className="f-cinzel text-xl font-black leading-none" style={{ color: active ? r.color : '#2A3347' }}>
              {count}
            </span>
            <span className="f-cinzel text-[9px] tracking-widest uppercase text-[#6B7A99]">{r.label}</span>
          </div>
        )
      })}
    </div>
  )

  const playerList = (
    <div className="space-y-2">
      {otherPlayers.map(p => (
        <div key={p.playerId}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-[#0A0D14]"
          style={{ borderColor: '#161C27' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: COLOR_MAP[p.color] }}>
            {p.name[0]}
          </div>
          <span className="f-body text-base flex-1" style={{ color: '#8A9AB8' }}>{p.name}</span>
          <span className="f-cinzel text-xs text-[#8A9AB8]">{totalCards(p.resourceCards)} cards</span>
          <span className="f-cinzel text-sm font-bold text-[#C8861A]">{p.victoryPoints} VP</span>
        </div>
      ))}
    </div>
  )

  const bankCanTrade = bankGive !== null && bankGet !== null && me.resources[bankGive] >= 4

  const tradePanel = tradeOpen && (
    <div className="slide-up space-y-4 pt-4 border-t border-[#2A3347]">
      <div className="flex gap-1 p-1 bg-[#0A0D14] rounded-lg">
        {(['bank', 'player'] as const).map(mode => (
          <button key={mode} onClick={() => setTradeMode(mode)}
            className={`flex-1 py-2 rounded-md f-cinzel text-xs tracking-widest uppercase transition-all
              ${tradeMode === mode ? 'bg-[#2A3347] text-[#F0E6CC]' : 'text-[#6B7A99] hover:text-[#8A9AB8]'}`}>
            {mode === 'bank' ? 'Bank (4:1)' : 'Player'}
          </button>
        ))}
      </div>

      {tradeMode === 'bank' ? (
        <div className="space-y-3">
          <div>
            <p className="f-cinzel text-[10px] tracking-widest uppercase text-[#6B7A99] mb-2">You Give ×4</p>
            <div className="grid grid-cols-5 gap-1.5">
              {RESOURCES.map(r => {
                const enough   = me.resources[r.id] >= 4
                const selected = bankGive === r.id
                return (
                  <button key={r.id} disabled={!enough}
                    onClick={() => { setBankGive(selected ? null : r.id); if (bankGet === r.id) setBankGet(null) }}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border transition-all
                      ${selected ? 'border-[#C8861A] bg-[#C8861A]/15' : enough ? 'border-[#2A3347] bg-[#0A0D14] hover:border-[#3A4357]' : 'border-[#161C27] bg-[#090C12] opacity-30 cursor-not-allowed'}`}>
                    <span className="text-lg leading-none">{r.emoji}</span>
                    <span className="f-cinzel text-sm font-bold" style={{ color: enough ? r.color : '#2A3347' }}>
                      {me.resources[r.id]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p className="f-cinzel text-[10px] tracking-widest uppercase text-[#6B7A99] mb-2">You Get ×1</p>
            <div className="grid grid-cols-5 gap-1.5">
              {RESOURCES.map(r => {
                const disabled = r.id === bankGive
                const selected = bankGet === r.id
                return (
                  <button key={r.id} disabled={disabled}
                    onClick={() => setBankGet(selected ? null : r.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border transition-all
                      ${selected ? 'border-[#38BDF8] bg-[#38BDF8]/10' : disabled ? 'border-[#161C27] bg-[#090C12] opacity-30 cursor-not-allowed' : 'border-[#2A3347] bg-[#0A0D14] hover:border-[#3A4357]'}`}>
                    <span className="text-lg leading-none">{r.emoji}</span>
                    <span className="f-cinzel text-[10px] text-[#8A9AB8]">{r.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <button disabled={!bankCanTrade}
            onClick={() => {
              if (!bankGive || !bankGet) return
              setResources(prev => ({
                ...prev,
                [bankGive]: prev[bankGive] - 4,
                [bankGet]: prev[bankGet] + 1,
              }))
              setBankGive(null); setBankGet(null); setTradeOpen(false)
            }}
            className={`w-full py-3 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase transition-all
              ${bankCanTrade ? 'bg-gradient-to-br from-[#D4921E] to-[#A86B10] text-[#0E1117] active:scale-[0.98]' : 'bg-[#0A0D14] border border-[#161C27] text-[#2A3347] cursor-not-allowed'}`}>
            Confirm Trade
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="f-cinzel text-[10px] tracking-widest uppercase text-[#6B7A99] mb-2">You Offer</p>
            <div className="grid grid-cols-5 gap-1.5">
              {RESOURCES.map(r => {
                const given   = offerGive[r.id] ?? 0
                const maxGive = me.resources[r.id]
                return (
                  <div key={r.id} className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg border border-[#2A3347] bg-[#0A0D14]">
                    <span className="text-base leading-none">{r.emoji}</span>
                    <span className="f-cinzel text-sm font-bold" style={{ color: given > 0 ? r.color : '#2A3347' }}>{given}</span>
                    <div className="flex gap-1">
                      <button onClick={() => adjustOffer(offerGive, setOfferGive, r.id, -1)}
                        disabled={given === 0}
                        className="w-5 h-5 rounded text-xs bg-[#161C27] text-[#8A9AB8] disabled:opacity-30 hover:bg-[#2A3347]">−</button>
                      <button onClick={() => adjustOffer(offerGive, setOfferGive, r.id, 1, maxGive)}
                        disabled={given >= maxGive}
                        className="w-5 h-5 rounded text-xs bg-[#161C27] text-[#8A9AB8] disabled:opacity-30 hover:bg-[#2A3347]">+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <p className="f-cinzel text-[10px] tracking-widest uppercase text-[#6B7A99] mb-2">You Request</p>
            <div className="grid grid-cols-5 gap-1.5">
              {RESOURCES.map(r => {
                const requested   = offerRequest[r.id] ?? 0
                const target      = otherPlayers.find(p => p.name === targetPlayer)
                const maxRequest  = target ? totalCards(target.resourceCards) : 0
                return (
                  <div key={r.id} className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg border border-[#2A3347] bg-[#0A0D14]">
                    <span className="text-base leading-none">{r.emoji}</span>
                    <span className="f-cinzel text-sm font-bold" style={{ color: requested > 0 ? r.color : '#2A3347' }}>{requested}</span>
                    <div className="flex gap-1">
                      <button onClick={() => adjustOffer(offerRequest, setOfferRequest, r.id, -1)}
                        disabled={requested === 0}
                        className="w-5 h-5 rounded text-xs bg-[#161C27] text-[#8A9AB8] disabled:opacity-30 hover:bg-[#2A3347]">−</button>
                      <button onClick={() => adjustOffer(offerRequest, setOfferRequest, r.id, 1, maxRequest)}
                        disabled={requested >= maxRequest}
                        className="w-5 h-5 rounded text-xs bg-[#161C27] text-[#8A9AB8] disabled:opacity-30 hover:bg-[#2A3347]">+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <p className="f-cinzel text-[10px] tracking-widest uppercase text-[#6B7A99] mb-2">Send To</p>
            <div className="flex gap-2">
              {otherPlayers.map(p => (
                <button key={p.playerId} onClick={() => {
                  if (targetPlayer !== p.name) { setOfferGive({}); setOfferRequest({}) }
                  setTargetPlayer(targetPlayer === p.name ? null : p.name)
                }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all f-body text-sm
                    ${targetPlayer === p.name ? 'border-[#38BDF8]/60 bg-[#38BDF8]/10 text-[#F0E6CC]' : 'border-[#2A3347] bg-[#0A0D14] text-[#8A9AB8] hover:border-[#3A4357]'}`}>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: COLOR_MAP[p.color] }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          {sentOffer ? (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/5">
              <span className="f-cinzel text-sm text-[#38BDF8] tracking-wide">Offer sent to {sentOffer}</span>
            </div>
          ) : (() => {
            const canSend = !!targetPlayer && Object.values(offerGive).some(v => v > 0) && Object.values(offerRequest).some(v => v > 0)
            return (
              <button disabled={!canSend}
                onClick={() => {
                  setSentOffer(targetPlayer)
                  setTimeout(() => { setSentOffer(null); setOfferGive({}); setOfferRequest({}); setTargetPlayer(null); setTradeOpen(false) }, 2000)
                }}
                className={`w-full py-3 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase transition-all
                  ${canSend ? 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-[#0E1117] active:scale-[0.98]' : 'bg-[#0A0D14] border border-[#161C27] text-[#2A3347] cursor-not-allowed'}`}>
                Send Offer
              </button>
            )
          })()}
        </div>
      )}
    </div>
  )

  const buildPanel = buildOpen && (
    <div className="slide-up space-y-2 pt-4 border-t border-[#2A3347]">
      {Object.entries(BUILD_COSTS).map(([item, cost]) => {
        const affordable = canAfford(me.resources, cost)
        const costStr    = Object.entries(cost).map(([r, n]) => `${n} ${r}`).join(' · ')
        return (
          <button key={item} disabled={!affordable} onClick={() => handleBuild(item)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200
              ${affordable
                ? 'border-[#C8861A]/40 bg-[#C8861A]/10 hover:bg-[#C8861A]/15 active:scale-[0.98]'
                : 'border-[#1A2235] bg-[#0A0D14] opacity-35 cursor-not-allowed'
              }`}>
            <span className="f-cinzel text-sm text-[#F0E6CC]">{item}</span>
            <span className="f-body text-sm text-[#8A9AB8]">{costStr}</span>
          </button>
        )
      })}
    </div>
  )

  const actionBar = (
    <div className="flex gap-2 pt-4 border-t border-[#2A3347]">
      {isMyTurn && gameState.phase === 'ROLL' ? (
        <button
          onClick={async () => {
            const result = await rollDice(gameState)
            setDice(result.dice)
            setGameState(result.gameState)
          }}
          className="flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase
            bg-gradient-to-br from-[#D4921E] to-[#A86B10] text-[#0E1117]
            hover:from-[#E8A52A] hover:to-[#C07E18] active:scale-[0.98] transition-all">
          Roll Dice
        </button>
      ) : (
        <>
          <button onClick={toggleBuild} disabled={!isMyTurn}
            className={`flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase transition-all duration-200
              ${!isMyTurn
                ? 'bg-[#0A0D14] border border-[#161C27] text-[#2A3347] cursor-not-allowed'
                : buildOpen
                  ? 'bg-[#C8861A]/10 border border-[#C8861A]/50 text-[#F0E6CC] active:scale-[0.98]'
                  : 'bg-[#161C27] border border-[#2A3347] text-[#F0E6CC] hover:border-[#C8861A]/50 active:scale-[0.98]'
              }`}>
            Build
          </button>
          <button onClick={toggleTrade} disabled={!isMyTurn}
            className={`flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase transition-all duration-200
              ${!isMyTurn
                ? 'bg-[#0A0D14] border border-[#161C27] text-[#2A3347] cursor-not-allowed'
                : tradeOpen
                  ? 'bg-[#38BDF8]/10 border border-[#38BDF8]/50 text-[#F0E6CC] active:scale-[0.98]'
                  : 'bg-[#161C27] border border-[#2A3347] text-[#F0E6CC] hover:border-[#38BDF8]/40 active:scale-[0.98]'
              }`}>
            Trade
          </button>
          <button disabled={!isMyTurn}
            className={`flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase transition-all duration-200
              ${isMyTurn
                ? 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-[#0E1117] active:scale-[0.98]'
                : 'bg-[#0A0D14] border border-[#161C27] text-[#2A3347] cursor-not-allowed'
              }`}>
            End Turn
          </button>
        </>
      )}
    </div>
  )

  const setupInstructionCard = (
    <div className={`rounded-xl border p-5 text-center space-y-3
      ${setupStep === 'settlement'
        ? 'border-[#C8861A]/40 bg-[#C8861A]/10'
        : 'border-[#38BDF8]/40 bg-[#38BDF8]/10'}`}>
      <div className="text-4xl">{setupStep === 'settlement' ? '🏘️' : '🛤️'}</div>
      <p className="f-cinzel text-sm font-bold text-[#F0E6CC]">
        {setupStep === 'settlement' ? 'Place a Settlement' : 'Place a Road'}
      </p>
      <p className="f-body text-sm text-[#8A9AB8]">
        {setupStep === 'settlement'
          ? 'Place your settlement token on any valid intersection of the physical board.'
          : 'Place a road token on any edge adjacent to your new settlement.'}
      </p>
    </div>
  )

  const setupProgress = (
    <div className="space-y-2">
      {gameState.players.map(p => {
        const isCurrentTurnPlayer = p.playerId === currentTurnPlayer.playerId
        const isMe = p.playerId === myPlayerId
        return (
          <div key={p.playerId}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-[#0A0D14]"
            style={{ borderColor: isCurrentTurnPlayer ? `${COLOR_MAP[p.color]}99` : '#161C27' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: COLOR_MAP[p.color] }}>
              {p.name[0]}
            </div>
            <span className="f-body text-base flex-1" style={{ color: isMe ? '#F0E6CC' : '#8A9AB8' }}>
              {isMe ? me.name : p.name}
              {isMe && <span className="f-cinzel text-[9px] text-[#C8861A] tracking-widest uppercase ml-2">you</span>}
              {isCurrentTurnPlayer && !isMe && <span className="f-cinzel text-[9px] text-[#38BDF8] tracking-widest uppercase ml-2">placing</span>}
            </span>
            <div className="flex items-center gap-3 f-cinzel text-xs">
              <span style={{ color: p.pieces.settlementsPlaced > 0 ? '#C8861A' : '#2A3347' }}>
                {p.pieces.settlementsPlaced > 0 ? '🏘️' : '○'} {p.pieces.settlementsPlaced}
              </span>
              <span style={{ color: p.pieces.roadsPlaced > 0 ? '#8A9AB8' : '#2A3347' }}>
                {'—'} {p.pieces.roadsPlaced}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )

  const setupActionBar = (
    <div className="flex gap-2 pt-4 border-t border-[#2A3347]">
      {isMyTurn ? (
        setupStep === 'settlement' ? (
          <button
            onClick={() => setSetupStep('road')}
            className="flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase
              bg-gradient-to-br from-[#D4921E] to-[#A86B10] text-[#0E1117] active:scale-[0.98] transition-all">
            Confirm Settlement ✓
          </button>
        ) : (
          <button
            onClick={async () => {
              setSetupStep('settlement')
              const result = await confirmSetupRoad(gameState)
              if (!result.success) { alert(result.error); return }
              setGameState(result.data)
            }}
            className="flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase
              bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-[#0E1117] active:scale-[0.98] transition-all">
            Confirm Road ✓
          </button>
        )
      ) : (
        <div className="flex-1 py-4 rounded-xl border border-[#2A3347] bg-[#0A0D14] flex items-center justify-center">
          <span className="f-cinzel text-sm text-[#6B7A99] tracking-[0.15em] uppercase">
            Waiting for {currentTurnPlayer.name}...
          </span>
        </div>
      )}
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0E1117] text-[#F0E6CC]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;600&display=swap');
        .f-cinzel { font-family: 'Cinzel', serif; }
        .f-body   { font-family: 'Crimson Pro', serif; }
        @keyframes slideUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes hexFade   { 0%,100%{opacity:.03} 50%{opacity:.07} }
        @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.15);opacity:1} }
        .slide-up  { animation: slideUp .2s ease both; }
        .hex-fade  { animation: hexFade 5s ease-in-out infinite; }
        .amber-glow { text-shadow: 0 0 20px rgba(200,134,26,.7); }
      `}</style>

      {/* ════ MOBILE ════ */}
      <div className="flex flex-col min-h-screen lg:hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A3347]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_MAP[me.color] }} />
            <span className="f-cinzel text-xs tracking-widest uppercase text-[#8A9AB8]">{me.name}</span>
          </div>
          <span className="f-cinzel text-[11px] tracking-[0.3em] uppercase text-[#6B7A99]">{room}</span>
          <div className="flex items-center gap-1.5">
            <span className="f-cinzel text-sm font-black text-[#C8861A]">{me.victoryPoints}</span>
            <span className="f-cinzel text-[10px] text-[#6B7A99] tracking-wide uppercase">VP</span>
          </div>
        </div>

        {/* Board camera — always visible on mobile */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="f-cinzel text-[10px] tracking-[0.35em] uppercase text-[#8A9AB8]">Board</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                streamStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                streamStatus === 'error'     ? 'bg-red-500' :
                streamStatus === 'host_gone' ? 'bg-yellow-400' :
                                               'bg-yellow-400 animate-pulse'
              }`} />
              <span className="f-cinzel text-[9px] tracking-widest uppercase text-[#6B7A99]">
                {streamStatus === 'connected' ? 'Live' :
                 streamStatus === 'host_gone' ? 'Host gone' :
                 streamStatus === 'error'     ? 'Error' : 'Connecting…'}
              </span>
            </div>
          </div>
          <BoardCamera
            streamStatus={streamStatus}
            videoRef={boardVideoRef}
            onRetry={startRTCSession}
          />
        </div>

        {/* Turn banner */}
        <div className={`mx-4 mt-3 px-4 py-3 rounded-xl flex items-center justify-between border
          ${isMyTurn ? 'border-[#C8861A]/40 bg-[#C8861A]/10' : 'border-[#2A3347] bg-[#090C12]'}`}>
          <div>
            {isMyTurn
              ? <p className="f-cinzel text-sm font-bold text-[#F0C060] amber-glow">Your Turn</p>
              : <p className="f-body text-sm text-[#8A9AB8]">
                  <span className="font-semibold" style={{ color: COLOR_MAP[currentTurnPlayer.color] }}>{currentTurnPlayer.name}</span>{`'s turn`}
                </p>
            }
            <p className="f-cinzel text-[10px] text-[#6B7A99] tracking-widest uppercase mt-0.5">
              {isSetupPhase
                ? (isMyTurn ? (setupStep === 'settlement' ? 'Place your settlement' : 'Place your road') : 'Placing pieces')
                : (gameState.phase === 'ROLL' ? 'Roll to start' : 'Taking action')}
            </p>
          </div>
          {isSetupPhase ? (
            <span className="f-cinzel text-[10px] tracking-widest uppercase text-[#F0E6CC] border border-[#C8861A]/60 bg-[#C8861A]/15 rounded-lg px-3 py-1.5">
              Setup {setupPhaseNum}/2
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <Die value={dice[0]} />
              <Die value={dice[1]} />
              <span className="f-cinzel text-xl font-black w-7 text-center">{diceSum}</span>
            </div>
          )}
        </div>

        {/* Main content */}
        {isSetupPhase ? (
          <>
            {isMyTurn && <div className="px-4 pt-4">{setupInstructionCard}</div>}
            <div className="px-4 pt-4 flex-1">
              <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8] block mb-3">Setup Progress</span>
              {setupProgress}
            </div>
            <div className="px-4 py-6">{setupActionBar}</div>
          </>
        ) : (
          <>
            <div className="px-4 pt-4">
              <div className="flex items-baseline justify-between mb-3">
                <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8]">Resources</span>
                <span className="f-body text-xs text-[#8A9AB8]">{myTotalCards} cards</span>
              </div>
              {resourceGrid}
            </div>
            <div className="px-4 pt-4 flex-1">
              <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8] block mb-3">Players</span>
              {playerList}
            </div>
            {buildOpen && <div className="px-4">{buildPanel}</div>}
            {tradeOpen && <div className="px-4">{tradePanel}</div>}
            <div className="px-4 py-6">{actionBar}</div>
          </>
        )}
      </div>

      {/* ════ DESKTOP ════ */}
      <div className="hidden lg:block relative min-h-screen">

        <svg className="absolute inset-0 w-full h-full pointer-events-none hex-fade" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 7 }, (_, row) =>
            Array.from({ length: 10 }, (_, col) => {
              const x = col * 180 + (row % 2 === 0 ? 0 : 90)
              const y = row * 156
              const pts = Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI / 180) * (60 * i - 30)
                return `${x + 80 * Math.cos(a)},${y + 80 * Math.sin(a)}`
              }).join(' ')
              return <polygon key={`${row}-${col}`} points={pts} fill="none" stroke="#C8861A" strokeWidth="1" />
            })
          )}
        </svg>

        {/* Three-column layout: left sidebar | board | right sidebar */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-5 min-h-screen">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 28 28" className="w-7 h-7">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="#C8861A" stroke="#F0C060" strokeWidth="1" />
                <text x="14" y="18" textAnchor="middle" fill="#0E1117" fontSize="10" fontWeight="900" fontFamily="Cinzel Decorative, serif">H</text>
              </svg>
              <div>
                <span className="f-cinzel text-[#C8861A] text-sm tracking-[0.3em] uppercase">Hybrid Catan</span>
                <span className="f-cinzel text-[#6B7A99] text-[11px] tracking-[0.25em] uppercase block">{room}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: COLOR_MAP[me.color] }} />
              <span className="f-cinzel text-sm text-[#8A9AB8] tracking-widest uppercase">{me.name}</span>
              <div className="flex items-center gap-1.5 pl-3 border-l border-[#2A3347]">
                <span className="f-cinzel text-base font-black text-[#C8861A]">{me.victoryPoints}</span>
                <span className="f-cinzel text-xs text-[#6B7A99] uppercase">VP</span>
              </div>
            </div>
          </div>

          {/* ── Turn banner ── */}
          <div className={`flex items-center justify-between px-6 py-4 rounded-xl border
            ${isMyTurn ? 'border-[#C8861A]/40 bg-[#C8861A]/10' : 'border-[#2A3347] bg-[#161C27]'}`}>
            <div>
              {isMyTurn
                ? <p className="f-cinzel text-xl font-bold text-[#F0C060] amber-glow">Your Turn</p>
                : <p className="f-body text-xl text-[#8A9AB8]">
                    <span className="font-semibold" style={{ color: COLOR_MAP[currentTurnPlayer.color] }}>{currentTurnPlayer.name}</span>{`'s turn`}
                  </p>
              }
              <p className="f-cinzel text-xs text-[#6B7A99] tracking-widest uppercase mt-1">
                {isSetupPhase
                  ? (isMyTurn ? (setupStep === 'settlement' ? 'Place your settlement' : 'Place your road') : 'Placing pieces')
                  : (gameState.phase === 'ROLL' ? 'Roll to start' : 'Taking action')}
              </p>
            </div>
            {isSetupPhase ? (
              <span className="f-cinzel text-xs tracking-widest uppercase text-[#F0E6CC] border border-[#C8861A]/60 bg-[#C8861A]/15 rounded-lg px-4 py-2">
                Setup {setupPhaseNum} / 2
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <Die value={dice[0]} />
                <Die value={dice[1]} />
                <span className="f-cinzel text-3xl font-black w-10 text-center">{diceSum}</span>
              </div>
            )}
          </div>

          {/* ── Three-column content ── */}
          <div className="grid grid-cols-[280px_1fr_320px] gap-5 flex-1">

            {/* LEFT: standings / setup progress */}
            <div className="rounded-xl border border-[#2A3347] bg-[#161C27] p-5 flex flex-col gap-4 self-start">
              <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8]">
                {isSetupPhase ? 'Setup Progress' : 'Standings'}
              </span>

              {isSetupPhase ? setupProgress : (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-[#0A0D14]"
                    style={{ borderColor: isMyTurn ? `${COLOR_MAP[me.color]}99` : '#161C27' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: COLOR_MAP[me.color] }}>
                      {me.name[0]}
                    </div>
                    <span className="f-body text-base flex-1 text-[#F0E6CC]">
                      {me.name}
                      <span className="f-cinzel text-[9px] text-[#C8861A] tracking-widest uppercase ml-2">you</span>
                    </span>
                    <span className="f-cinzel text-xs text-[#8A9AB8]">{myTotalCards} cards</span>
                    <span className="f-cinzel text-sm font-bold text-[#C8861A]">{me.victoryPoints} VP</span>
                  </div>
                  {playerList}
                </>
              )}
            </div>

            {/* CENTER: board camera */}
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-[#2A3347] bg-[#161C27] p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8]">Physical Board</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      streamStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                      streamStatus === 'error'     ? 'bg-red-500' :
                      streamStatus === 'host_gone' ? 'bg-yellow-400 animate-pulse' :
                                                     'bg-yellow-400 animate-pulse'
                    }`} />
                    <span className="f-cinzel text-[10px] tracking-widest uppercase text-[#6B7A99]">
                      {streamStatus === 'connected' ? 'Live stream' :
                       streamStatus === 'host_gone' ? 'Host disconnected' :
                       streamStatus === 'error'     ? 'Stream error' : 'Connecting…'}
                    </span>
                  </div>
                </div>
                <BoardCamera
                  streamStatus={streamStatus}
                  videoRef={boardVideoRef}
                  onRetry={startRTCSession}
                />
              </div>

              {/* Setup instruction card floats below board on desktop */}
              {isSetupPhase && isMyTurn && setupInstructionCard}

              {/* Waiting card when not your setup turn */}
              {isSetupPhase && !isMyTurn && (
                <div className="flex items-center justify-center py-6 rounded-xl border border-[#2A3347] bg-[#0A0D14]">
                  <div className="text-center space-y-2">
                    <div className="text-3xl opacity-30">⏳</div>
                    <p className="f-cinzel text-xs text-[#6B7A99] tracking-widest uppercase">
                      {currentTurnPlayer.name} is placing pieces
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: resources + actions */}
            <div className="rounded-xl border border-[#2A3347] bg-[#161C27] p-5 flex flex-col gap-5 self-start">
              {!isSetupPhase && (
                <>
                  <div className="flex items-baseline justify-between">
                    <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8]">Resources</span>
                    <span className="f-body text-sm text-[#8A9AB8]">{myTotalCards} cards</span>
                  </div>
                  {resourceGrid}
                </>
              )}
              <div className="flex-1" />
              {buildPanel}
              {tradePanel}
              {isSetupPhase ? setupActionBar : actionBar}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}