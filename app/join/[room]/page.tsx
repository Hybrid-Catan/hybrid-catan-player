'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from 'next/navigation'
import { getGame } from '@/lib/api/game/getGame'
import { addPlayer } from '@/lib/api/game/addPlayer'
import { startGame } from '@/lib/api/game/startGame'

const COLORS = [
  { id: 'RED', label: 'Red', dot: '#ef4444', bg: 'bg-red-500/20', border: 'border-red-500/60', playerIndex: 0 },
  { id: 'BLUE', label: 'Blue', dot: '#3b82f6', bg: 'bg-blue-500/20', border: 'border-blue-500/60', playerIndex: 1 },
  { id: 'WHITE', label: 'White', dot: '#f0e6cc', bg: 'bg-stone-300/20', border: 'border-stone-300/60', playerIndex: 2 },
  { id: 'ORANGE', label: 'Orange', dot: '#f97316', bg: 'bg-orange-500/20', border: 'border-orange-500/60', playerIndex: 3 },
] as const

type ColorId = typeof COLORS[number]['id']

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
]

type RTCStatus = "idle" | "connecting" | "connected" | "error"

function PlayerLobby({ gameState, name, colorId }: any) {
  return (
    <div className="rounded-xl border border-[#C8861A]/20 bg-[#0E1117] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#C8861A]/15 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 glow-pulse" />
        <span className="f-cinzel text-[11px] text-[#F0C060] tracking-[0.3em] uppercase">Waiting for players</span>
      </div>
      <div className="divide-y divide-[#1A2235]">
        {gameState?.players?.map((p: any) => {
          const color = COLORS.find(c => c.id === p.color)?.dot || '#fff'
          return (
            <div key={p.playerId} className="flex items-center gap-3 px-5 py-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                style={{ background: color }}
              >
                {p.name[0]}
              </div>
              <span className="f-body text-sm text-[#F0E6CC] flex-1">{p.name}</span>
              <span className="f-cinzel text-[10px] text-emerald-400">Joined</span>
            </div>
          )
        })}
        {Array.from({ length: Math.max(0, 4 - (gameState?.players?.length ?? 0)) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-center gap-3 px-5 py-3">
            <div className="w-8 h-8 rounded-full border border-dashed border-[#2A3347]" />
            <span className="f-body text-sm text-[#4A5875]">Open slot</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RTCStatusBadge({ status }: { status: RTCStatus }) {
  const map = {
    idle: { dot: 'bg-[#2A3347]', label: 'Board not connected', text: 'text-[#4A5875]' },
    connecting: { dot: 'bg-yellow-400 animate-pulse', label: 'Connecting to board…', text: 'text-yellow-400' },
    connected: { dot: 'bg-emerald-500 animate-pulse', label: 'Board stream ready', text: 'text-emerald-400' },
    error: { dot: 'bg-red-500', label: 'Board connection failed', text: 'text-red-400' },
  }
  const s = map[status]
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E2D42] bg-[#0A0D14]">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      <span className={`f-cinzel text-[10px] tracking-[0.3em] uppercase ${s.text}`}>{s.label}</span>
    </div>
  )
}

export default function JoinRoomPage() {
  const router = useRouter()
  const { room } = useParams()
  const roomId = (room as string).toUpperCase()

  const [color, setColor] = useState<ColorId>('RED')
  const [name, setName] = useState('')
  const [gameState, setGameState] = useState<any>(null)
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const [myPlayerIndex, setMyPlayerIndex] = useState<number | null>(null)
  const [rtcStatus, setRtcStatus] = useState<RTCStatus>('idle')

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([])
  const remoteDescSet = useRef(false)

  const takenColors = new Set(gameState?.players?.map((p: any) => p.color) ?? [])
  const selectedColor = COLORS.find(c => c.id === color)!
  const canJoin = name.trim().length > 0 && !takenColors.has(color)

    useEffect(() => {
    let cancelled = false

    async function load() {
      const data = await getGame(roomId)
      if (!cancelled && data.success) {
        setGameState(data.data)
      }
    }
    // Initial fetch
    load()
    // Poll every 2 seconds
    const interval = setInterval(load, 2000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [roomId])

  // Once we have a playerId + playerIndex, open the WebRTC signaling connection
  // so the host can stream the board to the game page
  useEffect(() => {
    if (!myPlayerId || myPlayerIndex === null) return

    const wsUrl = process.env.NEXT_PUBLIC_HOST_WS
    if (!wsUrl) {
      console.warn('[RTC] NEXT_PUBLIC_HOST_WS not set — skipping WebRTC handshake')
      return
    }

    // Store player info in sessionStorage so /game/[room] can pick it up
    sessionStorage.setItem(`hc_playerId_${roomId}`, myPlayerId)
    sessionStorage.setItem(`hc_playerIndex_${roomId}`, String(myPlayerIndex))
    sessionStorage.setItem(`hc_playerColor_${roomId}`, color)

    setRtcStatus('connecting')

    iceCandidateBuffer.current = []
    remoteDescSet.current = false

    const socket = new WebSocket(wsUrl)
    socketRef.current = socket

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    pcRef.current = pc

    // We don't render video here - the game page does.
    // We just complete the handshake and store the peer connection state
    // in sessionStorage flags so the game page knows a connection is live.
    pc.ontrack = () => {
      setRtcStatus('connected')
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'ice',
          candidate: event.candidate,
          gameId: roomId,
        }))
      }
    }

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      if (state === 'failed') {
        setRtcStatus('error')
        pc.restartIce()
      }
    }

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'join_room',
        gameId: roomId,
        playerIndex: myPlayerIndex,
        playerColor: color,
        playerId: myPlayerId,
      }))
    }

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data as string)
      if (data.gameId && data.gameId !== roomId) return

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
          gameId: roomId,
          playerIndex: myPlayerIndex,
        }))

      } else if (data.type === 'ice') {
        if (!data.candidate) return
        if (!remoteDescSet.current) {
          iceCandidateBuffer.current.push(data.candidate)
        } else {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.warn)
        }
      } else if (data.type === 'host_disconnected') {
        setRtcStatus('error')
        if (pcRef.current) pcRef.current.close()
      }
    }

    socket.onerror = () => setRtcStatus('error')

    return () => {
      pc.close()
      socket.close()
      pcRef.current = null
      socketRef.current = null
    }
  }, [myPlayerId, myPlayerIndex])

  const handleJoin = async () => {
    const data = await addPlayer({
      gameId: roomId,
      name,
      color,
      sequence: gameState.players.length + 1,
    })
    if (!data.success) {
      // Someone grabbed the color first
      if (data.error === 'COLOR_TAKEN') {
        // Refresh lobby state immediately
        const refreshed = await getGame(roomId)
        if (refreshed.success) {
          setGameState(refreshed.data)
        }
        alert('That color was just taken by another player.')
        return
      }
    }
    if (data.success) {
      setGameState(data.data)
      const myPlayer = data.data.players.find((p: any) => p.name === name && p.color === color)
      if (myPlayer) {
        setMyPlayerId(myPlayer.playerId)
        const colorMeta = COLORS.find(c => c.id === color)
        setMyPlayerIndex(colorMeta?.playerIndex ?? gameState.players.length + 1)
      }
    }
  }

  const handleStart = async () => {
    const data = await startGame(gameState)
    if (data.success) {
      router.push(`/game/${roomId}?playerId=${myPlayerId}`)
    }
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#F0E6CC]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;600&display=swap');
        .f-title  { font-family: 'Cinzel Decorative', serif; }
        .f-cinzel { font-family: 'Cinzel', serif; }
        .f-body   { font-family: 'Crimson Pro', serif; }

        @keyframes glowPulse { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
        @keyframes dotFade   { 0%,100% { opacity: .06 } 50% { opacity: .18 } }
        .glow-pulse { animation: glowPulse 2.5s ease-in-out infinite; }
        .dot-fade   { animation: dotFade 5s ease-in-out infinite; }

        .amber-glow { text-shadow: 0 0 30px rgba(240,192,96,.7), 0 0 60px rgba(240,192,96,.3), 0 0 100px rgba(240,192,96,.1); }
        .white-glow { text-shadow: 0 0 20px rgba(255,255,255,.4), 0 0 50px rgba(240,192,96,.2); }

        input:focus { outline: none; border-color: #C8861A !important; box-shadow: 0 0 0 3px rgba(200,134,26,.12); }
        input::placeholder { color: #2A3347; }
      `}</style>

      <div className="flex min-h-screen">

        {/* ── Left panel (desktop) ── */}
        <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-12 border-r border-[#C8861A]/15 bg-[#070A10] relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none dot-fade" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 12 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => (
                <circle key={`${row}-${col}`} cx={col * 100 + 50} cy={row * 80 + 40} r="1.5" fill="#C8861A" />
              ))
            )}
          </svg>

          <div className="flex items-center gap-3 relative z-10">
            <svg viewBox="0 0 28 28" className="w-7 h-7">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="#C8861A" stroke="#F0C060" strokeWidth="1" />
              <text x="14" y="18" textAnchor="middle" fill="#0E1117" fontSize="10" fontWeight="900" fontFamily="Cinzel Decorative, serif">H</text>
            </svg>
            <span className="f-cinzel text-[#C8861A] text-xs tracking-[0.35em] uppercase">Hybrid Catan</span>
          </div>

          <div className="relative z-10">
            <p className="f-cinzel text-[#F0C060] text-sm tracking-[0.5em] uppercase mb-5 flex items-center gap-2">
              <span className="inline-block w-8 h-px bg-[#F0C060]/60" />
              Room {roomId}
            </p>
            <h1 className="f-title text-6xl text-white leading-[1.1] white-glow mb-5">
              Take Your<br />
              <span className="amber-glow text-[#F0C060]">Seat</span>
            </h1>
            <p className="f-body text-[#8A9AB8] text-lg leading-relaxed max-w-sm mb-10">
              Pick your color and enter your name.
              Your spot will appear in the lobby instantly.
            </p>
            <div className="max-w-sm">
              <PlayerLobby gameState={gameState} name={name} colorId={color} />
            </div>
          </div>

          <div className="flex gap-6 relative z-10">
            {['Open Source', 'Local LAN or Cloud', 'No Account Required'].map(t => (
              <span key={t} className="f-cinzel text-[11px] text-[#F0C060]/70 tracking-[0.3em] uppercase">{t}</span>
            ))}
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div className="flex flex-col justify-center w-full lg:w-[460px] lg:flex-shrink-0 px-4 lg:px-12 py-10 bg-[#0A0D14]">

          <button
            onClick={() => router.push('/join')}
            className="f-cinzel flex items-center gap-2 text-[#8A9AB8] hover:text-[#F0E6CC] text-sm tracking-widest uppercase transition-colors duration-200 mb-12"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <svg viewBox="0 0 28 28" className="w-6 h-6">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="#C8861A" stroke="#F0C060" strokeWidth="1" />
              <text x="14" y="18" textAnchor="middle" fill="#0E1117" fontSize="10" fontWeight="900" fontFamily="Cinzel Decorative, serif">H</text>
            </svg>
            <span className="f-cinzel text-[#C8861A] text-xs tracking-[0.35em] uppercase">Hybrid Catan</span>
          </div>

          <div className="mb-8">
            <p className="f-cinzel text-[11px] text-[#F0C060]/80 tracking-[0.4em] uppercase mb-2 flex items-center gap-2">
              <span className="inline-block w-5 h-px bg-[#F0C060]/40" />
              Room {roomId}
            </p>
            <h1 className="f-title text-3xl text-white mb-2">Join Game</h1>
            <p className="f-body text-[#8A9AB8] text-base">Choose your color and enter your name</p>
          </div>

          {!myPlayerId ? (
            <>
              {/* Color + name form */}
              <div className="rounded-xl border border-[#1E2D42] bg-[#0E1520] p-6 mb-4">
                <div className="mb-6">
                  <label className="f-cinzel block text-[11px] text-[#F0C060] tracking-[0.35em] uppercase mb-3">
                    Choose Your Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map(c => {
                      const taken = takenColors.has(c.id)
                      return (
                        <button
                          key={c.id}
                          onClick={() => !taken && setColor(c.id)}
                          disabled={taken}
                          className={`h-14 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer
                            ${taken
                              ? 'bg-[#0E1117] border-[#2A3347] opacity-30 cursor-not-allowed'
                              : color === c.id
                                ? `${c.bg} ${c.border}`
                                : 'bg-[#0E1117] border-[#2A3347] hover:border-[#3A4A5A]'
                            }`}
                        >
                          <div className="w-4 h-4 rounded-full mx-auto" style={{ background: c.dot }} />
                          <span className="f-cinzel text-[10px] font-bold tracking-widest uppercase text-[#8A9AB8]">
                            {taken ? 'Taken' : c.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="f-cinzel block text-[11px] text-[#F0C060] tracking-[0.35em] uppercase mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canJoin && handleJoin()}
                    placeholder="e.g. Alex"
                    className="w-full bg-[#070A10] border border-[#1E2D42] rounded-lg px-4 py-3 text-[#F0E6CC] text-sm transition-all duration-200"
                  />
                </div>
              </div>

              <button
                onClick={handleJoin}
                disabled={!canJoin}
                className={`f-cinzel w-full py-4 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all duration-500 ease-out mb-4
                  ${canJoin
                    ? 'bg-gradient-to-br from-[#D4921E] to-[#A86B10] text-[#060A10] hover:from-[#E0A030] hover:to-[#B87818] hover:shadow-[0_4px_20px_rgba(200,134,26,0.45)] active:opacity-80'
                    : 'bg-[#0E1520] text-[#2A3A50] border border-[#1E2D42] cursor-not-allowed'
                  }`}
              >
                Join Game →
              </button>
            </>
          ) : (
            /* Post-join: show board connection status */
            <div className="rounded-xl border border-[#1E2D42] bg-[#0E1520] p-6 mb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: COLORS.find(c => c.id === color)?.dot }}
                >
                  {name[0]}
                </div>
                <div>
                  <p className="f-cinzel text-sm text-[#F0E6CC] font-bold">{name}</p>
                  <p className="f-cinzel text-[10px] text-[#C8861A] tracking-widest uppercase">{color} · Joined</p>
                </div>
                <span className="ml-auto f-cinzel text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded">
                  ✓ Seat reserved
                </span>
              </div>

              <div className="border-t border-[#1E2D42] pt-4">
                <p className="f-cinzel text-[10px] text-[#6B7A99] tracking-[0.3em] uppercase mb-2">Board Connection</p>
                <RTCStatusBadge status={rtcStatus} />
                {rtcStatus === 'connected' && (
                  <p className="f-body text-xs text-[#6B7A99] mt-2">
                    The board stream is ready — you'll see it live once the game starts.
                  </p>
                )}
                {rtcStatus === 'error' && (
                  <p className="f-body text-xs text-red-400/70 mt-2">
                    Could not reach the host camera. The game will still work but you won't see the board stream.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mobile lobby */}
          <div className="lg:hidden mt-4">
            <PlayerLobby gameState={gameState} name={name} colorId={color} />
          </div>

          <button
            onClick={handleStart}
            disabled={!myPlayerId}
            className={`w-full p-4 rounded-xl font-bold mt-10 f-cinzel text-sm tracking-[0.15em] uppercase transition-all duration-300
              ${myPlayerId
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white hover:from-emerald-500 hover:to-emerald-700 hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:opacity-80'
                : 'bg-[#0E1520] border border-[#1E2D42] text-[#2A3A50] cursor-not-allowed opacity-40'
              }`}
          >
            Start Game →
          </button>
        </div>
      </div>
    </div>
  )
}