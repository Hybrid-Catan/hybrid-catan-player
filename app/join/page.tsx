'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode } from 'lucide-react'

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
    <div className="min-h-screen bg-[#0A0D14] text-[#F0E6CC]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;600&display=swap');
        .f-title  { font-family: 'Cinzel Decorative', serif; }
        .f-cinzel { font-family: 'Cinzel', serif; }
        .f-body   { font-family: 'Crimson Pro', serif; }

        @keyframes dotPulse  { 0%,100% { opacity: .06 } 50% { opacity: .18 } }
        @keyframes glowPulse { 0%,100% { opacity: .5 } 50% { opacity: 1 } }

        .dot-pulse  { animation: dotPulse 4s ease-in-out infinite; }
        .glow-pulse { animation: glowPulse 2.5s ease-in-out infinite; }

        .amber-glow { text-shadow: 0 0 30px rgba(240,192,96,.7), 0 0 60px rgba(240,192,96,.3), 0 0 100px rgba(240,192,96,.1); }
        .white-glow { text-shadow: 0 0 20px rgba(255,255,255,.4), 0 0 50px rgba(240,192,96,.2); }

        input:focus { outline: none; border-color: #C8861A !important; box-shadow: 0 0 0 3px rgba(200,134,26,.12); }
        input::placeholder { color: #2A3347; }
        input { text-transform: uppercase; letter-spacing: 0.25em; }
      `}</style>

      <div className="flex min-h-screen">

        <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-12 border-r border-[#C8861A]/15 bg-[#070A10] relative overflow-hidden">

          <svg className="absolute inset-0 w-full h-full pointer-events-none dot-pulse" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 14 }, (_, row) =>
              Array.from({ length: 9 }, (_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={col * 110 + 55}
                  cy={row * 90 + 45}
                  r="1.5"
                  fill="#C8861A"
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

          <div className="relative z-10 flex flex-col gap-12">
            <div>
              <p className="f-cinzel text-[#F0C060] text-sm tracking-[0.5em] uppercase mb-5 flex items-center gap-2">
                <span className="inline-block w-8 h-px bg-[#F0C060]/60" />
                Join a Game
              </p>
              <h1 className="f-title text-6xl text-white leading-[1.1] white-glow mb-5">
                Got a<br />
                <span className="amber-glow text-[#F0C060]">Code?</span>
              </h1>
              <p className="f-body text-[#8A9AB8] text-lg leading-relaxed max-w-sm">
                Enter the room code from your host, or scan the QR code to jump straight in.
              </p>
            </div>

            <div className="flex flex-col gap-4 max-w-xs">
              {[
                { icon: '📱', label: 'Scan QR', desc: 'Point your camera at the QR on the host screen' },
                { icon: '⌨️', label: 'Enter Code', desc: 'Type the 6-character room code shown on the host' },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#C8861A]/25 bg-[#C8861A]/5 text-lg">
                    {f.icon}
                  </div>
                  <div>
                    <p className="f-cinzel text-xs text-[#F0C060] tracking-widest uppercase mb-0.5">{f.label}</p>
                    <p className="f-body text-sm text-[#8A9AB8]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6 relative z-10">
            {['Open Source', 'Local LAN or Cloud', 'No Account Required'].map(t => (
              <span key={t} className="f-cinzel text-[11px] text-[#F0C060]/70 tracking-[0.3em] uppercase">{t}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center w-full lg:w-[460px] lg:flex-shrink-0 px-4 lg:px-12 py-10 bg-[#0A0D14]">

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
            <p className="f-cinzel text-[11px] text-[#F0C060]/80 tracking-[0.4em] uppercase mb-2 flex items-center gap-2">
              <span className="inline-block w-5 h-px bg-[#F0C060]/40" />
              Join a Game
            </p>
            <h1 className="f-title text-3xl text-white mb-2">Join Game</h1>
            <p className="f-body text-[#8A9AB8] text-base">Enter the room code to continue</p>
          </div>

          {/* room code input */}
          <div className="rounded-xl border border-[#1E2D42] bg-[#0E1520] p-6 mb-4">
            <label className="f-cinzel block text-[11px] text-[#F0C060] tracking-[0.35em] uppercase mb-3">
              Room Code
            </label>
            <div className="relative mb-1">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.slice(0, 6))}
                onKeyDown={handleKeyDown}
                placeholder="ABC123"
                maxLength={6}
                className="w-full bg-[#070A10] border border-[#1E2D42] rounded-lg px-4 py-4 text-[#F0E6CC] text-lg font-bold transition-all duration-200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 f-cinzel text-xs text-[#6B7A99]">
                {code.length}/6
              </span>
            </div>
            <p className="f-cinzel text-[11px] text-[#8A9AB8] tracking-[0.25em] uppercase mt-2">
              6-character alphanumeric · case insensitive
            </p>
          </div>

          <button
            onClick={handleEnter}
            disabled={!canEnter}
            className={`f-cinzel w-full py-4 rounded-xl text-sm font-bold tracking-[0.2em] uppercase transition-all duration-500 ease-out mb-8
              ${canEnter
                ? 'bg-gradient-to-br from-[#D4921E] to-[#A86B10] text-[#060A10] hover:from-[#E0A030] hover:to-[#B87818] hover:shadow-[0_4px_20px_rgba(200,134,26,0.45)] active:opacity-80'
                : 'bg-[#0E1520] text-[#2A3A50] border border-[#1E2D42] cursor-not-allowed'
              }`}
          >
            Enter Room →
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#1E2D42]" />
            <span className="f-cinzel text-[11px] text-[#6B7A99] tracking-[0.3em] uppercase">or</span>
            <div className="flex-1 h-px bg-[#1E2D42]" />
          </div>

          {/* qr scan */}
          <div className="rounded-xl border border-[#1E2D42] bg-[#0E1520] p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg border border-[#C8861A]/20 bg-[#070A10] flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6 text-[#C8861A]/50" strokeWidth={1.5} />
            </div>
            <div>
              <p className="f-cinzel text-xs text-[#F0C060] tracking-widest uppercase mb-0.5">Scan QR Code</p>
              <p className="f-body text-base text-[#8A9AB8]">Point your camera at the QR shown on the host screen</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
