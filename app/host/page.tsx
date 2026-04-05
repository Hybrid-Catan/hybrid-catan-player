'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MAX_PLAYERS_OPTIONS = [2, 3, 4]

const FEATURES = [
  { icon: '📷', title: 'CV Detection', desc: 'Camera tracks every piece in real time' },
  { icon: '📡', title: 'Instant Sync', desc: 'Players see updates under 50ms' },
  { icon: '⚙️', title: 'Rule Enforcer', desc: 'No illegal moves, no disputes' },
]

export default function HostPage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)

  const canHost = roomName.trim().length > 0

  const handleHost = () => {
    if (!canHost) return
    // TODO: create room
  }

  return (
    <div className="min-h-screen bg-[#0E1117] text-[#F0E6CC]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;600&display=swap');
        .f-title  { font-family: 'Cinzel Decorative', serif; }
        .f-cinzel { font-family: 'Cinzel', serif; }
        .f-body   { font-family: 'Crimson Pro', serif; }
        @keyframes glowPulse { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
        @keyframes hexFade   { 0%,100% { opacity: .04 } 50% { opacity: .10 } }
        .glow-pulse { animation: glowPulse 2.5s ease-in-out infinite; }
        .hex-fade   { animation: hexFade 4s ease-in-out infinite; }
        .amber-glow { text-shadow: 0 0 40px rgba(200,134,26,.8), 0 0 80px rgba(200,134,26,.3); }
        input:focus { outline: none; border-color: #C8861A !important; }
        input::placeholder { color: #2A3347; }
      `}</style>

      <div className="flex min-h-screen">

        <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-12 border-r border-[#2A3347] bg-[#0A0D14] relative overflow-hidden">

          <svg className="absolute inset-0 w-full h-full pointer-events-none hex-fade" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 5 }, (_, row) =>
              Array.from({ length: 4 }, (_, col) => {
                const x = col * 160 + (row % 2 === 0 ? 0 : 80)
                const y = row * 140
                const pts = Array.from({ length: 6 }, (__, i) => {
                  const a = (Math.PI / 180) * (60 * i - 30)
                  return `${x + 60 * Math.cos(a)},${y + 60 * Math.sin(a)}`
                }).join(' ')
                return <polygon key={`${row}-${col}`} points={pts} fill="none" stroke="#C8861A" strokeWidth="1" />
              })
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
            <p className="f-cinzel text-[#C8861A] text-xs tracking-[0.4em] uppercase mb-4">Host a Game</p>
            <h1 className="f-title text-5xl text-[#F0E6CC] leading-tight amber-glow mb-6">
              Set the<br />Stage
            </h1>
            <p className="f-body text-[#6B7A99] text-lg leading-relaxed max-w-sm mb-10">
              Place your board, point the camera, and share the link.
              Your players join instantly — no installs, no accounts.
            </p>

            <div className="flex flex-col gap-4">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#C8861A]/30 bg-[#C8861A]/08 text-lg">
                    {f.icon}
                  </div>
                  <div>
                    <p className="f-cinzel text-[11px] text-[#C8861A] tracking-widest uppercase mb-0.5">{f.title}</p>
                    <p className="f-body text-sm text-[#6B7A99]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6 relative z-10">
            <span className="f-cinzel text-[10px] text-[#2A3347] tracking-[0.3em] uppercase">Open Source</span>
            <span className="f-cinzel text-[10px] text-[#2A3347] tracking-[0.3em] uppercase">Local LAN or Cloud</span>
            <span className="f-cinzel text-[10px] text-[#2A3347] tracking-[0.3em] uppercase">No Account Required</span>
          </div>
        </div>

        <div className="flex flex-col justify-center w-full lg:w-[460px] lg:flex-shrink-0 px-4 lg:px-12 py-10">

          <button
            onClick={() => router.push('/')}
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
            <h1 className="f-title text-3xl text-[#F0E6CC] amber-glow mb-2">Host a Game</h1>
            <p className="f-body text-[#6B7A99] text-sm">Set up your room and invite players</p>
          </div>

          <div className="rounded-xl border border-[#2A3347] bg-[#161C27] p-6 mb-4">

            <div className="mb-6">
              <label className="f-cinzel block text-[10px] text-[#6B7A99] tracking-[0.3em] uppercase mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="e.g. Friday Night Catan"
                className="w-full bg-[#0E1117] border border-[#2A3347] rounded-lg px-4 py-3 text-[#F0E6CC] text-sm transition-colors duration-200"
              />
            </div>

            <div>
              <label className="f-cinzel block text-[10px] text-[#6B7A99] tracking-[0.3em] uppercase mb-3">
                Max Players
              </label>
              <div className="flex gap-2">
                {MAX_PLAYERS_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setMaxPlayers(n)}
                    className={`flex-1 py-3 rounded-lg border-2 f-cinzel text-sm font-bold tracking-widest transition-all duration-200
                      ${maxPlayers === n
                        ? 'bg-[#C8861A]/20 border-[#C8861A]/60 text-[#F0C060]'
                        : 'bg-[#0E1117] border-[#2A3347] text-[#6B7A99] hover:border-[#3A4A5A]'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleHost}
            disabled={!canHost}
            className={`f-cinzel w-full py-4 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300
              ${canHost
                ? 'bg-gradient-to-br from-[#D4921E] to-[#A86B10] text-[#0E1117] hover:from-[#E8A52A] hover:to-[#C07E18] hover:scale-[1.02]'
                : 'bg-[#161C27] text-[#3A4A5A] border border-[#2A3347] cursor-not-allowed'
              }`}
          >
            Create Room
          </button>

        </div>
      </div>
    </div>
  )
}
