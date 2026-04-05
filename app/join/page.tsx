'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EnterCodePage() {
  const router = useRouter()
  const [code, setCode] = useState('')

  const canEnter = code.trim().length > 0

  const handleEnter = () => {
    if (!canEnter) return
    router.push(`/join/${code.trim().toUpperCase()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEnter()
  }

  return (
    <div className="min-h-screen bg-[#0E1117] text-[#F0E6CC]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;600&display=swap');
        .f-title  { font-family: 'Cinzel Decorative', serif; }
        .f-cinzel { font-family: 'Cinzel', serif; }
        .f-body   { font-family: 'Crimson Pro', serif; }
        @keyframes dotFade { 0%,100% { opacity: .03 } 50% { opacity: .08 } }
        .dot-fade  { animation: dotFade 5s ease-in-out infinite; }
        .cyan-glow { text-shadow: 0 0 40px rgba(56,189,248,.6), 0 0 80px rgba(56,189,248,.2); }
        input:focus { outline: none; border-color: #38BDF8 !important; }
        input::placeholder { color: #2A3347; }
        input { text-transform: uppercase; letter-spacing: 0.25em; }
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
            <p className="f-cinzel text-[#38BDF8] text-xs tracking-[0.4em] uppercase mb-4">Join a Game</p>
            <h1 className="f-title text-5xl text-[#F0E6CC] leading-tight cyan-glow mb-6">
              Got a<br />Code?
            </h1>
            <p className="f-body text-[#6B7A99] text-lg leading-relaxed max-w-sm mb-10">
              Enter the room code from your host, or scan the QR code to jump straight in.
            </p>

            <div className="flex flex-col gap-5 max-w-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#38BDF8]/30 bg-[#38BDF8]/08 text-lg">
                  📱
                </div>
                <div>
                  <p className="f-cinzel text-[11px] text-[#38BDF8] tracking-widest uppercase mb-0.5">Scan QR</p>
                  <p className="f-body text-sm text-[#6B7A99]">Point your camera at the QR on the host screen</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#38BDF8]/30 bg-[#38BDF8]/08 text-lg">
                  ⌨️
                </div>
                <div>
                  <p className="f-cinzel text-[11px] text-[#38BDF8] tracking-widest uppercase mb-0.5">Enter Code</p>
                  <p className="f-body text-sm text-[#6B7A99]">Type the 6-character room code shown on the host screen</p>
                </div>
              </div>
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
            <h1 className="f-title text-3xl text-[#F0E6CC] cyan-glow mb-2">Join Game</h1>
            <p className="f-body text-[#6B7A99] text-sm">Enter the room code to continue</p>
          </div>

          <div className="rounded-xl border border-[#2A3347] bg-[#161C27] p-6 mb-4">
            <label className="f-cinzel block text-[10px] text-[#6B7A99] tracking-[0.3em] uppercase mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.slice(0, 6))}
              onKeyDown={handleKeyDown}
              placeholder="ABC123"
              maxLength={6}
              className="w-full bg-[#0E1117] border border-[#2A3347] rounded-lg px-4 py-3 text-[#F0E6CC] text-sm transition-colors duration-200"
            />
          </div>

          <button
            onClick={handleEnter}
            disabled={!canEnter}
            className={`f-cinzel w-full py-4 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300
              ${canEnter
                ? 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-[#0E1117] hover:from-[#7DD3FC] hover:to-[#0EA5E9] hover:scale-[1.02]'
                : 'bg-[#161C27] text-[#3A4A5A] border border-[#2A3347] cursor-not-allowed'
              }`}
          >
            Enter Room
          </button>

        </div>
      </div>
    </div>
  )
}
