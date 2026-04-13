'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HostPage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)

  const canHost = roomName.trim().length > 0

  const handleHost = () => {
    // TODO: create room
  }

  return (
    <div className="min-h-screen bg-[#0E1117] text-[#F0E6CC]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;600&display=swap');
        .f-title  { font-family: 'Cinzel Decorative', serif; }
        .f-cinzel { font-family: 'Cinzel', serif; }
        .f-body   { font-family: 'Crimson Pro', serif; }
        .blue-glow { text-shadow: 0 0 40px rgba(74,155,200,.8), 0 0 80px rgba(74,155,200,.3); }
        input:focus { outline: none; border-color: #4A9BC8 !important; }
        input::placeholder { color: #2A3347; }
      `}</style>

      <div className="flex min-h-screen">

        <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-12 border-r border-[#2A3347] bg-[#0A0D14] relative overflow-hidden">

          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 5 }, (_, row) =>
              Array.from({ length: 4 }, (_, col) => {
                const x = col * 160 + (row % 2 === 0 ? 0 : 80)
                const y = row * 140
                const pts = Array.from({ length: 6 }, (_, i) => {
                  const a = (Math.PI / 180) * (60 * i - 30)
                  return `${x + 60 * Math.cos(a)},${y + 60 * Math.sin(a)}`
                }).join(' ')
                return <polygon key={`${row}-${col}`} points={pts} fill="none" stroke="#4A9BC8" strokeWidth="1" />
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
            <p className="f-cinzel text-[#4A9BC8] text-sm tracking-[0.5em] uppercase mb-5 flex items-center gap-2">
              <span className="inline-block w-8 h-px bg-[#4A9BC8]/60" />
              Host a Game
            </p>
            <h1 className="f-title text-5xl text-[#F0E6CC] leading-tight mb-6">
              Ready<br />
              <span className="blue-glow text-[#8FCFE8]">to Play</span>
            </h1>
            <p className="f-body text-[#8A9AB8] text-lg leading-relaxed max-w-sm mb-10">
              Set up your board, frame it with the camera, and send the link.
              Everyone joins straight from their phone — nothing to install.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: '📷', title: 'Board Tracking', desc: 'Camera watches the board so nothing gets missed' },
                { icon: '📡', title: 'Instant Sync', desc: 'Every move shows up for all players right away' },
                { icon: '⚙️', title: 'Rules Built In', desc: 'Bad placements get flagged before they cause arguments' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#4A9BC8]/25 bg-[#4A9BC8]/10 text-lg">
                    {f.icon}
                  </div>
                  <div>
                    <p className="f-cinzel text-[11px] text-[#4A9BC8] tracking-widest uppercase mb-0.5">{f.title}</p>
                    <p className="f-body text-sm text-[#8A9AB8]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6 relative z-10">
            {['Open Source', 'Local LAN or Cloud', 'No Account Required'].map(t => (
              <span key={t} className="f-cinzel text-[11px] text-[#4A9BC8]/70 tracking-[0.3em] uppercase">{t}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center w-full lg:w-[460px] lg:flex-shrink-0 px-4 lg:px-12 py-10">

          <button
            onClick={() => router.push('/')}
            className="f-cinzel flex items-center gap-2 text-[#8A9AB8] hover:text-[#F0E6CC] text-sm tracking-widest uppercase transition-colors duration-200 mb-12"
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
            <p className="f-cinzel text-[11px] text-[#4A9BC8]/80 tracking-[0.4em] uppercase mb-2 flex items-center gap-2">
              <span className="inline-block w-5 h-px bg-[#4A9BC8]/40" />
              Host a Game
            </p>
            <h1 className="f-title text-3xl text-white mb-2">Host Game</h1>
            <p className="f-body text-[#8A9AB8] text-base">Name your room and you&apos;re good to go</p>
          </div>

          <div className="rounded-xl border border-[#2A3347] bg-[#161C27] p-6 mb-4">

            <div className="mb-6">
              <label className="f-cinzel block text-[11px] text-[#4A9BC8] tracking-[0.35em] uppercase mb-3">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="Let's Play Catan"
                className="w-full bg-[#0E1117] border border-[#2A3347] rounded-lg px-4 py-3 text-[#F0E6CC] text-sm transition-colors duration-200"
              />
            </div>

            <div>
              <label className="f-cinzel block text-[11px] text-[#4A9BC8] tracking-[0.35em] uppercase mb-3">
                Max Players
              </label>
              <div className="flex gap-2">
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setMaxPlayers(n)}
                    className={`flex-1 py-3 rounded-lg border-2 f-cinzel text-sm font-bold tracking-widest transition-all duration-200
                      ${maxPlayers === n
                        ? 'bg-[#4A9BC8]/20 border-[#4A9BC8]/60 text-[#8FCFE8]'
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
            className={`f-cinzel w-full py-4 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all duration-500 ease-out
              ${canHost
                ? 'bg-gradient-to-br from-[#2A7BA8] to-[#1A5A80] text-white hover:from-[#3A8BC0] hover:to-[#2A6E98] hover:shadow-[0_4px_20px_rgba(74,155,200,0.45)] active:opacity-80'
                : 'bg-[#0E1520] text-[#2A3A50] border border-[#1E2D42] cursor-not-allowed'
              }`}
          >
            Create Room →
          </button>

        </div>
      </div>
    </div>
  )
}
