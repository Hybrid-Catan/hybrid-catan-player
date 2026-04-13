'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

const RESOURCES = [
  { id: 'wood', label: 'Wood', color: '#4A7C4E', emoji: '🌲' },
  { id: 'brick', label: 'Brick', color: '#B85C38', emoji: '🧱' },
  { id: 'sheep', label: 'Sheep', color: '#7DAF5A', emoji: '🐑' },
  { id: 'wheat', label: 'Wheat', color: '#C8A84B', emoji: '🌾' },
  { id: 'ore', label: 'Ore', color: '#7A8FA8', emoji: '⛏️' },
] as const

type ResourceId = typeof RESOURCES[number]['id']

const BUILD_COSTS: Record<string, Partial<Record<ResourceId, number>>> = {
  Road: { wood: 1, brick: 1 },
  Settlement: { wood: 1, brick: 1, sheep: 1, wheat: 1 },
  City: { wheat: 2, ore: 3 },
}

const MOCK_STATE = {
  me: {
    name: 'Alex',
    color: '#ef4444',
    vp: 2,
    resources: { wood: 2, brick: 1, sheep: 3, wheat: 1, ore: 0 } as Record<ResourceId, number>,
  },
  turn: {
    player: 'Jordan',
    color: '#3b82f6',
    isMyTurn: false,
    phase: 'action' as 'roll' | 'action',
    dice: [3, 5] as [number, number],
  },
  players: [
    { name: 'Jordan', color: '#3b82f6', vp: 3, cards: 4 },
    { name: 'Sam', color: '#22c55e', vp: 2, cards: 2 },
    { name: 'Mia', color: '#f97316', vp: 1, cards: 1 },
  ],
}

function canAfford(resources: Record<ResourceId, number>, cost: Partial<Record<ResourceId, number>>) {
  return Object.entries(cost).every(([r, n]) => resources[r as ResourceId] >= (n ?? 0))
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

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const room = (params.room as string).toUpperCase()
  const { turn } = MOCK_STATE
  const me = {
    ...MOCK_STATE.me,
    name: searchParams.get('name') ?? MOCK_STATE.me.name,
    color: searchParams.get('color') ?? MOCK_STATE.me.color,
  }
  const players = MOCK_STATE.players.filter(p => p.color !== me.color)

  const [buildOpen, setBuildOpen] = useState(false)

  const totalCards = Object.values(me.resources).reduce((a, b) => a + b, 0)
  const diceSum = turn.dice[0] + turn.dice[1]

  const resourceGrid = (
    <div className="grid grid-cols-5 gap-2 lg:gap-3">
      {RESOURCES.map(r => {
        const count = me.resources[r.id]
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
      {players.map(p => {
        const isActive = turn.player === p.name
        return (
          <div key={p.name}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-[#0A0D14]"
            style={{ borderColor: isActive ? `${p.color}99` : '#161C27' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: p.color }}>
              {p.name[0]}
            </div>
            <span className="f-body text-base flex-1" style={{ color: isActive ? '#F0E6CC' : '#8A9AB8' }}>
              {p.name}
            </span>
            <span className="f-cinzel text-xs text-[#8A9AB8]">{p.cards} cards</span>
            <span className="f-cinzel text-sm font-bold text-[#C8861A]">{p.vp} VP</span>
          </div>
        )
      })}
    </div>
  )

  const buildPanel = buildOpen && (
    <div className="slide-up space-y-2 pt-4 border-t border-[#2A3347]">
      {Object.entries(BUILD_COSTS).map(([item, cost]) => {
        const affordable = canAfford(me.resources, cost)
        const costStr = Object.entries(cost).map(([r, n]) => `${n} ${r}`).join(' · ')
        return (
          <button key={item} disabled={!affordable}
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
      {turn.isMyTurn && turn.phase === 'roll' ? (
        <button className="flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase
          bg-gradient-to-br from-[#D4921E] to-[#A86B10] text-[#0E1117]
          hover:from-[#E8A52A] hover:to-[#C07E18] active:scale-[0.98] transition-all">
          Roll Dice
        </button>
      ) : (
        <>
          <button onClick={() => setBuildOpen(v => !v)} disabled={!turn.isMyTurn}
            className={`flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase transition-all duration-200
              ${!turn.isMyTurn
                ? 'bg-[#0A0D14] border border-[#161C27] text-[#2A3347] cursor-not-allowed'
                : buildOpen
                  ? 'bg-[#C8861A]/10 border border-[#C8861A]/50 text-[#F0E6CC] active:scale-[0.98]'
                  : 'bg-[#161C27] border border-[#2A3347] text-[#F0E6CC] hover:border-[#C8861A]/50 active:scale-[0.98]'
              }`}>
            Build
          </button>
          <button disabled={!turn.isMyTurn}
            className={`flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase transition-all duration-200
              ${turn.isMyTurn
                ? 'bg-[#161C27] border border-[#2A3347] text-[#F0E6CC] hover:border-[#38BDF8]/40 active:scale-[0.98]'
                : 'bg-[#0A0D14] border border-[#161C27] text-[#2A3347] cursor-not-allowed'
              }`}>
            Trade
          </button>
          <button disabled={!turn.isMyTurn}
            className={`flex-1 py-4 rounded-xl f-cinzel text-sm font-bold tracking-[0.15em] uppercase transition-all duration-200
              ${turn.isMyTurn
                ? 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-[#0E1117] active:scale-[0.98]'
                : 'bg-[#0A0D14] border border-[#161C27] text-[#2A3347] cursor-not-allowed'
              }`}>
            End Turn
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0E1117] text-[#F0E6CC]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;600&display=swap');
        .f-cinzel { font-family: 'Cinzel', serif; }
        .f-body   { font-family: 'Crimson Pro', serif; }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes hexFade { 0%,100%{opacity:.03} 50%{opacity:.07} }
        .slide-up { animation: slideUp .2s ease both; }
        .hex-fade { animation: hexFade 5s ease-in-out infinite; }
        .amber-glow { text-shadow: 0 0 20px rgba(200,134,26,.7); }
      `}</style>

      {/* Mobile */}
      <div className="flex flex-col min-h-screen lg:hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A3347]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: me.color }} />
            <span className="f-cinzel text-xs tracking-widest uppercase text-[#8A9AB8]">{me.name}</span>
          </div>
          <span className="f-cinzel text-[11px] tracking-[0.3em] uppercase text-[#6B7A99]">{room}</span>
          <div className="flex items-center gap-1.5">
            <span className="f-cinzel text-sm font-black text-[#C8861A]">{me.vp}</span>
            <span className="f-cinzel text-[10px] text-[#6B7A99] tracking-wide uppercase">VP</span>
          </div>
        </div>

        <div className={`px-5 py-3.5 flex items-center justify-between border-b border-[#2A3347]
          ${turn.isMyTurn ? 'bg-[#C8861A]/10' : 'bg-[#090C12]'}`}>
          <div>
            {turn.isMyTurn
              ? <p className="f-cinzel text-sm font-bold text-[#F0C060] amber-glow">Your Turn</p>
              : <p className="f-body text-sm text-[#8A9AB8]">
                  <span className="font-semibold" style={{ color: turn.color }}>{turn.player}</span>{`'s turn`}
                </p>
            }
            <p className="f-cinzel text-[10px] text-[#6B7A99] tracking-widest uppercase mt-0.5">
              {turn.phase === 'roll' ? 'Roll to start' : 'Taking action'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Die value={turn.dice[0]} />
            <Die value={turn.dice[1]} />
            <span className="f-cinzel text-xl font-black w-7 text-center">{diceSum}</span>
          </div>
        </div>

        <div className="px-5 pt-5 pb-4">
          <div className="flex items-baseline justify-between mb-3">
            <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8]">Resources</span>
            <span className="f-body text-xs text-[#8A9AB8]">{totalCards} cards</span>
          </div>
          {resourceGrid}
        </div>

        <div className="px-5 pb-4 flex-1">
          <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8] block mb-3">Players</span>
          {playerList}
        </div>

        {buildOpen && <div className="px-5">{buildPanel}</div>}

        <div className="px-5 pb-6">{actionBar}</div>
      </div>

      {/* Desktop */}
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

        <div className="relative z-10 max-w-4xl mx-auto px-8 py-10 flex flex-col gap-6 min-h-screen">

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
              <div className="w-3 h-3 rounded-full" style={{ background: me.color }} />
              <span className="f-cinzel text-sm text-[#8A9AB8] tracking-widest uppercase">{me.name}</span>
              <div className="flex items-center gap-1.5 pl-3 border-l border-[#2A3347]">
                <span className="f-cinzel text-base font-black text-[#C8861A]">{me.vp}</span>
                <span className="f-cinzel text-xs text-[#6B7A99] uppercase">VP</span>
              </div>
            </div>
          </div>

          <div className={`flex items-center justify-between px-6 py-4 rounded-xl border
            ${turn.isMyTurn ? 'border-[#C8861A]/40 bg-[#C8861A]/10' : 'border-[#2A3347] bg-[#161C27]'}`}>
            <div>
              {turn.isMyTurn
                ? <p className="f-cinzel text-xl font-bold text-[#F0C060] amber-glow">Your Turn</p>
                : <p className="f-body text-xl text-[#8A9AB8]">
                    <span className="font-semibold" style={{ color: turn.color }}>{turn.player}</span>{`'s turn`}
                  </p>
              }
              <p className="f-cinzel text-xs text-[#6B7A99] tracking-widest uppercase mt-1">
                {turn.phase === 'roll' ? 'Roll to start' : 'Taking action'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Die value={turn.dice[0]} />
              <Die value={turn.dice[1]} />
              <span className="f-cinzel text-3xl font-black w-10 text-center">{diceSum}</span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1.4fr] gap-6 flex-1">

            <div className="rounded-xl border border-[#2A3347] bg-[#161C27] p-6 flex flex-col gap-4">
              <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8]">Standings</span>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-[#0A0D14]"
                style={{ borderColor: turn.isMyTurn ? `${me.color}99` : '#161C27' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: me.color }}>
                  {me.name[0]}
                </div>
                <span className="f-body text-base flex-1 text-[#F0E6CC]">
                  {me.name}
                  <span className="f-cinzel text-[9px] text-[#C8861A] tracking-widest uppercase ml-2">you</span>
                </span>
                <span className="f-cinzel text-xs text-[#8A9AB8]">{totalCards} cards</span>
                <span className="f-cinzel text-sm font-bold text-[#C8861A]">{me.vp} VP</span>
              </div>

              {playerList}
            </div>

            <div className="rounded-xl border border-[#2A3347] bg-[#161C27] p-6 flex flex-col gap-5">
              <div className="flex items-baseline justify-between">
                <span className="f-cinzel text-[11px] tracking-[0.35em] uppercase text-[#8A9AB8]">Resources</span>
                <span className="f-body text-sm text-[#8A9AB8]">{totalCards} cards</span>
              </div>

              {resourceGrid}

              <div className="flex-1" />

              {buildPanel}
              {actionBar}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
