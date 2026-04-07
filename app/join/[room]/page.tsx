'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const COLORS = [
  { id: 'red', label: 'Red', dot: '#ef4444', bg: 'bg-red-500/20', border: 'border-red-500/60' },
  { id: 'blue', label: 'Blue', dot: '#3b82f6', bg: 'bg-blue-500/20', border: 'border-blue-500/60' },
  { id: 'green', label: 'Green', dot: '#22c55e', bg: 'bg-emerald-500/20', border: 'border-emerald-500/60' },
  { id: 'orange', label: 'Orange', dot: '#f97316', bg: 'bg-orange-500/20', border: 'border-orange-500/60' },
] as const

type ColorId = typeof COLORS[number]['id']

const MOCK_PLAYERS = [
  { name: 'Jordan', color: '#3b82f6', ready: true },
  { name: 'Sam', color: '#22c55e', ready: false },
]

const TAKEN_COLORS = new Set(
  MOCK_PLAYERS.map(p => COLORS.find(c => c.dot === p.color)?.id).filter(Boolean) as ColorId[]
)

const DEFAULT_COLOR = (COLORS.find(c => !TAKEN_COLORS.has(c.id)) ?? COLORS[0]).id

function PlayerLobby({ name, dotColor }: { name: string; dotColor: string }) {
  return (
    <div className="rounded-xl border border-[#38BDF8]/20 bg-[#0E1117] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#38BDF8]/10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 glow-pulse" />
        <span className="f-cinzel text-[10px] text-[#38BDF8] tracking-[0.3em] uppercase">Waiting for players</span>
      </div>
      <div className="divide-y divide-[#1A2235]">
        {name.trim().length > 0 && (
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: dotColor }}>
              {name[0].toUpperCase()}
            </div>
            <span className="f-body text-sm text-[#F0E6CC] font-semibold flex-1">{name} (You)</span>
            <span className="f-cinzel text-[10px] text-emerald-400 font-semibold tracking-wide">Ready</span>
          </div>
        )}
        {MOCK_PLAYERS.map(p => (
          <div key={p.name} className="flex items-center gap-3 px-5 py-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: p.color }}>
              {p.name[0]}
            </div>
            <span className="f-body text-sm text-[#6B7A99] flex-1">{p.name}</span>
            <span className={`f-cinzel text-[10px] font-semibold tracking-wide ${p.ready ? 'text-emerald-400' : 'text-[#3A4A5A]'}`}>
              {p.ready ? 'Ready' : 'Waiting...'}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="w-8 h-8 rounded-full border border-dashed border-[#2A3347]" />
          <span className="f-body text-sm text-[#2A3347]">Open slot</span>
        </div>
      </div>
    </div>
  )
}

export default function JoinRoomPage() {
  const router = useRouter()
  const params = useParams()
  const room = (params.room as string).toUpperCase()

  const [selected, setSelected] = useState<ColorId>(DEFAULT_COLOR)
  const [name, setName] = useState('')

  const selectedColor = COLORS.find(c => c.id === selected)!
  const canJoin = name.trim().length > 0

  const handleJoin = () => {
    if (!canJoin) return
    // TODO: connect to room via WebSocket
  }

  return (
    <div className="min-h-screen bg-[#0E1117] text-[#F0E6CC]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;600&display=swap');
        .f-title  { font-family: 'Cinzel Decorative', serif; }
        .f-cinzel { font-family: 'Cinzel', serif; }
        .f-body   { font-family: 'Crimson Pro', serif; }
        @keyframes glowPulse { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
        @keyframes dotFade   { 0%,100% { opacity: .03 } 50% { opacity: .08 } }
        .glow-pulse { animation: glowPulse 2.5s ease-in-out infinite; }
        .dot-fade   { animation: dotFade 5s ease-in-out infinite; }
        .cyan-glow  { text-shadow: 0 0 40px rgba(56,189,248,.6), 0 0 80px rgba(56,189,248,.2); }
        input:focus { outline: none; border-color: #38BDF8 !important; }
        input::placeholder { color: #2A3347; }
      `}</style>

      <div className="flex min-h-screen">

        <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-12 border-r border-[#38BDF8]/20 bg-[#090D13] relative overflow-hidden">

          <svg className="absolute inset-0 w-full h-full pointer-events-none dot-fade" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 12 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={col * 100 + 50}
                  cy={row * 80 + 40}
                  r="1.5"
                  fill="#38BDF8"
                />
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
            <p className="f-cinzel text-[#38BDF8] text-xs tracking-[0.4em] uppercase mb-4">Room {room}</p>
            <h1 className="f-title text-5xl text-[#F0E6CC] leading-tight cyan-glow mb-6">
              Take Your<br />Seat
            </h1>
            <p className="f-body text-[#6B7A99] text-lg leading-relaxed max-w-sm mb-10">
              Pick your color and enter your name.
              Your spot will appear in the lobby instantly.
            </p>

            <div className="max-w-sm">
              <PlayerLobby name={name} dotColor={selectedColor.dot} />
            </div>
          </div>

          <div className="flex gap-6 relative z-10">
            <span className="f-cinzel text-[10px] text-[#38BDF8]/20 tracking-[0.3em] uppercase">Open Source</span>
            <span className="f-cinzel text-[10px] text-[#38BDF8]/20 tracking-[0.3em] uppercase">Local LAN or Cloud</span>
            <span className="f-cinzel text-[10px] text-[#38BDF8]/20 tracking-[0.3em] uppercase">No Account Required</span>
          </div>
        </div>

        <div className="flex flex-col justify-center w-full lg:w-[460px] lg:flex-shrink-0 px-4 lg:px-12 py-10">

          <button
            onClick={() => router.push('/join')}
            className="f-cinzel flex items-center gap-2 text-[#6B7A99] hover:text-[#F0E6CC] text-xs tracking-widest uppercase transition-colors duration-200 mb-10"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <svg viewBox="0 0 28 28" className="w-6 h-6">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="#C8861A" stroke="#F0C060" strokeWidth="1" />
              <text x="14" y="18" textAnchor="middle" fill="#0E1117" fontSize="10" fontWeight="900" fontFamily="Cinzel Decorative, serif">H</text>
            </svg>
            <span className="f-cinzel text-[#C8861A] text-xs tracking-[0.35em] uppercase">Hybrid Catan</span>
          </div>

          <div className="mb-8">
            <div className="f-cinzel text-[10px] text-[#38BDF8] tracking-[0.3em] uppercase mb-1">Room {room}</div>
            <h1 className="f-title text-3xl text-[#F0E6CC] cyan-glow mb-2">Join Game</h1>
            <p className="f-body text-[#6B7A99] text-sm">Choose your color and enter your name</p>
          </div>

          <div className="rounded-xl border border-[#2A3347] bg-[#161C27] p-6 mb-4">
            <div className="mb-6">
              <label className="f-cinzel block text-[10px] text-[#6B7A99] tracking-[0.3em] uppercase mb-3">
                Choose Your Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map(c => {
                  const taken = TAKEN_COLORS.has(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => !taken && setSelected(c.id)}
                      disabled={taken}
                      className={`h-14 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all duration-200
                        ${taken
                          ? 'bg-[#0E1117] border-[#2A3347] opacity-30 cursor-not-allowed'
                          : selected === c.id
                            ? `${c.bg} ${c.border}`
                            : 'bg-[#0E1117] border-[#2A3347] hover:border-[#3A4A5A]'
                        }`}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ background: c.dot }} />
                      <span className="f-cinzel text-[9px] font-bold tracking-widest uppercase text-[#6B7A99]">
                        {taken ? 'Taken' : c.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="f-cinzel block text-[10px] text-[#6B7A99] tracking-[0.3em] uppercase mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-[#0E1117] border border-[#2A3347] rounded-lg px-4 py-3 text-[#F0E6CC] text-sm transition-colors duration-200"
              />
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={!canJoin}
            className={`f-cinzel w-full py-4 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 mb-4
              ${canJoin
                ? 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-[#0E1117] hover:from-[#7DD3FC] hover:to-[#0EA5E9] hover:scale-[1.02]'
                : 'bg-[#161C27] text-[#3A4A5A] border border-[#2A3347] cursor-not-allowed'
              }`}
          >
            Join Game
          </button>

          <div className="lg:hidden">
            <PlayerLobby name={name} dotColor={selectedColor.dot} />
          </div>

        </div>
      </div>
    </div>
  )
}
