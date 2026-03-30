'use client'
import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   Primary:  #C8861A  Catan gold/amber
   Accent:   #38BDF8  Circuit-board cyan
   Dark:     #0E1117
   Surface:  #161C27
   Border:   #2A3347
   Text:     #F0E6CC  warm parchment
   Muted:    #6B7A99
───────────────────────────────────────────── */

// ── Hex SVG helper ──────────────────────────────────────────────────────────
interface MiniHexProps {
  x: number;
  y: number;
  size: number;
  fill: string;
  opacity?: number;
  stroke?: string;
}
const MiniHex = ({ x, y, size, fill, opacity = 1, stroke = "transparent" }: MiniHexProps) => {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${x + size * Math.cos(a)},${y + size * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="1" opacity={opacity} />;
};

// ── Skewed CTA button ───────────────────────────────────────────────────────
interface HexBtnProps {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
  className?: string;
}
const HexBtn = ({ children, primary = false, onClick, className = "" }: HexBtnProps) => (
  <button
    onClick={onClick}
    className={`relative inline-flex items-center justify-center gap-2 px-8 py-3
      font-bold tracking-[0.15em] uppercase text-sm border-0 outline-none cursor-pointer
      transition-all duration-300
      ${primary
        ? "bg-gradient-to-br from-[#D4921E] to-[#A86B10] text-[#0E1117] hover:from-[#E8A52A] hover:to-[#C07E18] hover:scale-105"
        : "bg-transparent border border-[#38BDF8]/40 text-[#38BDF8] hover:border-[#38BDF8] hover:bg-[#38BDF8]/10"
      } ${className}`}
    style={{ clipPath: "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)" }}
  >
    {children}
  </button>
);

// ── Section label ────────────────────────────────────────────────────────────
interface SectionLabelProps {
  children: React.ReactNode;
}
const SectionLabel = ({ children }: SectionLabelProps) => (
  <div className="flex items-center justify-center gap-3 mb-4">
    <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#C8861A]" />
    <span className="text-[#C8861A] text-[11px] tracking-[0.45em] uppercase font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
      {children}
    </span>
    <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#C8861A]" />
  </div>
);

// ── Resource row in phone ────────────────────────────────────────────────────
type GlowVariant = "amber" | "cyan" | "default";

interface ResRowProps {
  emoji: string;
  name: string;
  count: number;
  glow: GlowVariant;
}
const ResRow = ({ emoji, name, count, glow }: ResRowProps) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-semibold
    ${glow === "amber" ? "border-[#C8861A]/40 bg-[#C8861A]/10 text-[#F0C060]"
      : glow === "cyan" ? "border-[#38BDF8]/30 bg-[#38BDF8]/08 text-[#7DD3FC]"
        : "border-[#2A3347] bg-[#1A2235]/60 text-[#8A99BB]"}`}>
    <span>{emoji}</span>
    <span className="flex-1">{name}</span>
    <span className={`font-black tabular-nums
      ${glow === "amber" ? "text-[#F0C060]" : glow === "cyan" ? "text-[#38BDF8]" : "text-[#6B7A99]"}`}>
      {count}
    </span>
  </div>
);

// ── Feature card ─────────────────────────────────────────────────────────────
type AccentVariant = "amber" | "cyan";

interface FeatCardProps {
  icon: string;
  title: string;
  desc: string;
  accent?: AccentVariant;
}
const FeatCard = ({ icon, title, desc, accent = "amber" }: FeatCardProps) => (
  <div className={`group relative p-6 rounded-lg border transition-all duration-300 hover:-translate-y-1 overflow-hidden
    ${accent === "cyan"
      ? "border-[#38BDF8]/15 bg-gradient-to-br from-[#38BDF8]/05 to-transparent hover:border-[#38BDF8]/40"
      : "border-[#C8861A]/15 bg-gradient-to-br from-[#C8861A]/05 to-transparent hover:border-[#C8861A]/40"}`}>
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className={`text-sm tracking-widest uppercase mb-2 font-black
      ${accent === "cyan" ? "text-[#7DD3FC]" : "text-[#F0C060]"}`}
      style={{ fontFamily: "'Cinzel', serif" }}>
      {title}
    </h3>
    <p className="text-[#6B7A99] text-sm leading-relaxed">{desc}</p>
    <div className={`absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500
      ${accent === "cyan"
        ? "bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent"
        : "bg-gradient-to-r from-transparent via-[#C8861A] to-transparent"}`} />
  </div>
);

// ── Step row ─────────────────────────────────────────────────────────────────
interface StepRowProps {
  num: string;
  icon: string;
  title: string;
  desc: string;
}
const StepRow = ({ num, icon, title, desc }: StepRowProps) => (
  <div className="flex gap-5 items-start group">
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center
      border border-[#C8861A]/50 bg-[#C8861A]/10 text-[#C8861A] font-black text-sm
      group-hover:border-[#C8861A] group-hover:bg-[#C8861A]/20 transition-all duration-300"
      style={{ clipPath: "polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)", fontFamily: "'Cinzel', serif" }}>
      {num}
    </div>
    <div className="pt-1">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <h4 className="text-[#F0E6CC] font-bold text-sm tracking-wide">{title}</h4>
      </div>
      <p className="text-[#6B7A99] text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

// ── Tech card ─────────────────────────────────────────────────────────────────
interface TechCardProps {
  icon: string;
  layer: string;
  tags: string[];
  desc: string;
  glow: "amber" | "cyan";
}
const TechCard = ({ icon, layer, tags, desc, glow }: TechCardProps) => (
  <div className={`p-5 rounded-lg border transition-all duration-300 hover:-translate-y-1
    ${glow === "cyan"
      ? "border-[#38BDF8]/20 bg-gradient-to-b from-[#38BDF8]/05 to-[#161C27] hover:border-[#38BDF8]/50"
      : "border-[#C8861A]/20 bg-gradient-to-b from-[#C8861A]/05 to-[#161C27] hover:border-[#C8861A]/50"}`}>
    <div className="text-2xl mb-3">{icon}</div>
    <p className={`text-xs tracking-[0.3em] uppercase font-black mb-2
      ${glow === "cyan" ? "text-[#38BDF8]" : "text-[#C8861A]"}`}
      style={{ fontFamily: "'Cinzel', serif" }}>
      {layer}
    </p>
    <p className="text-[#6B7A99] text-xs leading-relaxed mb-3">{desc}</p>
    <div className="flex flex-wrap gap-1">
      {tags.map(t => (
        <span key={t} className="px-2 py-0.5 text-[10px] rounded border border-[#2A3347] text-[#4A5875] bg-[#0E1117]">{t}</span>
      ))}
    </div>
  </div>
);

// ── Resources state type ──────────────────────────────────────────────────────
interface Resources {
  wood: number;
  brick: number;
  sheep: number;
  wheat: number;
  ore: number;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function HybridCatanLanding() {
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [resources, setResources] = useState<Resources>({ wood: 3, brick: 2, sheep: 1, wheat: 4, ore: 2 });
  const [log, setLog] = useState<string[]>([
    "🎲 Game started — 3 players joined",
    "🏠 Red placed settlement on node #12",
    "🛣️ Blue built road on edge #45",
    "📡 CV detected city upgrade",
  ]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const rollDice = () => {
    if (rolling) return;
    setRolling(true);
    let n = 0;
    const iv = setInterval(() => {
      setDice(Math.floor(Math.random() * 11) + 2);
      n++;
      if (n >= 10) {
        clearInterval(iv);
        const final = Math.floor(Math.random() * 11) + 2;
        setDice(final);
        setRolling(false);
        const msgs: Record<number, string> = { 7: "🚨 Robber activated — move it!", 2: "🎯 Snake eyes!", 12: "🎯 Boxcars!" };
        const entry = msgs[final] ?? `⚡ Resources distributed for ${final}`;
        setLog(l => [entry, ...l].slice(0, 5));
        if (final !== 7) setResources(r => ({
          ...r,
          wood: r.wood + (Math.random() > 0.6 ? 1 : 0),
          wheat: r.wheat + (Math.random() > 0.6 ? 1 : 0),
        }));
      }
    }, 70);
  };

  // !! In Next.js: place image in /public/ and reference as "/your-image.png"
  const BG = "/catan-bg.png";

  return (
    <div className="min-h-screen text-[#F0E6CC] overflow-x-hidden bg-[#0E1117]">

      {/* ── FONTS + KEYFRAMES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        .f-title  { font-family:'Cinzel Decorative',serif; }
        .f-cinzel { font-family:'Cinzel',serif; }
        .f-body   { font-family:'Crimson Pro',serif; }
        @keyframes floatY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glowPulse{ 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes hexFade { 0%,100%{opacity:.05} 50%{opacity:.12} }
        @keyframes scanLine{ 0%{top:-10%} 100%{top:110%} }
        .float      { animation:floatY 6s ease-in-out infinite; }
        .glow-pulse { animation:glowPulse 2.5s ease-in-out infinite; }
        .hex-fade   { animation:hexFade 4s ease-in-out infinite; }
        .amber-glow { text-shadow:0 0 40px rgba(200,134,26,.8),0 0 80px rgba(200,134,26,.3); }
        .hero-shadow{ text-shadow:0 4px 32px rgba(0,0,0,.95),0 0 80px rgba(0,0,0,.8); }
        .card-glow  { box-shadow:0 0 0 1px rgba(200,134,26,.08),0 20px 60px rgba(0,0,0,.6); }
      `}</style>

      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-[#0A0D14]/95 backdrop-blur-xl border-b border-[#C8861A]/20 py-3"
        : "bg-transparent py-5"
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <img
                src="/favicon.ico"
                alt="Logo"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <div className="f-title text-[#C8861A] text-sm tracking-wider leading-none">HYBRID</div>
              <div className="f-cinzel text-[#F0E6CC]/50 text-[9px] tracking-[0.45em] uppercase leading-none">CATAN</div>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            {[["How It Works", "#how"], ["Features", "#features"], ["Tech Stack", "#tech"], ["Demo", "#play"]].map(([l, h]) => (
              <a key={l} href={h}
                className="f-cinzel text-[11px] tracking-[0.25em] uppercase text-[#6B7A99] hover:text-[#C8861A] transition-colors duration-300">
                {l}
              </a>
            ))}
          </div>

          <HexBtn primary>Join Game</HexBtn>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          HERO — full viewport with background image
      ════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={BG}
            alt="Hybrid Catan Game Platform background"
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.38) saturate(1.15)" }}
          />
        </div>

        {/* Layered gradient overlays — keep text legible everywhere */}
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(14,17,23,0.65) 0%, transparent 35%, transparent 55%, rgba(14,17,23,0.95) 100%)" }} />
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 35%, rgba(14,17,23,0.6) 100%)" }} />

        {/* Subtle circuit lines at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-[2] pointer-events-none">
          <svg viewBox="0 0 1440 120" className="w-full opacity-25" preserveAspectRatio="none">
            <path d="M0,60 L180,60 L200,40 L380,40 L400,60 L680,60 L700,30 L880,30 L900,60 L1160,60 L1180,40 L1440,40"
              fill="none" stroke="#38BDF8" strokeWidth="1" />
            <circle cx="200" cy="40" r="3" fill="#38BDF8" />
            <circle cx="700" cy="30" r="3" fill="#C8861A" />
            <circle cx="900" cy="60" r="3" fill="#38BDF8" />
            <circle cx="1180" cy="40" r="3" fill="#C8861A" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-28">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 rounded
            border border-[#38BDF8]/30 bg-[#38BDF8]/08 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] glow-pulse" />
            <span className="f-cinzel text-[#38BDF8] text-[11px] tracking-[0.4em] uppercase">
              Mixed Reality Board Gaming
            </span>
          </div>

          {/* Title */}
          <h1 className="f-title leading-none hero-shadow">
            <div className="text-[clamp(2.8rem,8.5vw,7rem)] text-[#F0E6CC] tracking-[0.06em]">
              HYBRID
            </div>
            <div className="text-[clamp(4rem,13vw,11rem)] text-[#C8861A] amber-glow tracking-[0.04em] -mt-3">
              CATAN
            </div>
          </h1>

          {/* Sub-rule */}
          <div className="flex items-center justify-center gap-5 mt-3 mb-8">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#C8861A]/70" />
            <span className="f-cinzel text-[#F0E6CC]/45 text-[11px] tracking-[0.55em] uppercase">
              Game Platform
            </span>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#C8861A]/70" />
          </div>

          <p className="f-body text-[#C8B882] text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-12 hero-shadow">
            Place your pieces on a physical board — our camera sees everything,
            enforces every rule, and syncs every player in real time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <HexBtn primary>⚔️ Start a Game</HexBtn>
            <HexBtn>▶ Watch Demo</HexBtn>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { val: "Zero", label: "Manual Tracking" },
              { val: "30 FPS", label: "CV Detection" },
              { val: "<50ms", label: "Sync Latency" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center px-3 py-3
                border border-[#C8861A]/15 bg-[#0E1117]/40 backdrop-blur-sm rounded">
                <div className="f-title text-xl text-[#C8861A] amber-glow">{val}</div>
                <div className="f-cinzel text-[9px] tracking-widest text-[#4A5875] uppercase mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 float">
          <div className="f-cinzel text-[10px] tracking-[0.4em] text-[#3A4A5A] uppercase">Explore</div>
          <svg className="w-5 h-5 text-[#C8861A]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURE STRIP
      ════════════════════════════════════════ */}
      <section className="border-y border-[#C8861A]/12 bg-gradient-to-r from-[#0E1117] via-[#161C27] to-[#0E1117] py-6">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#C8861A]/12">
          {[
            { icon: "📷", title: "Camera Sees All", desc: "Overhead CV tracks every tile, road, and settlement in real time" },
            { icon: "⚙️", title: "Server Rules All", desc: "Automatic rule enforcement — no disputes over legality" },
            { icon: "📱", title: "Phone Has It All", desc: "Your resource wallet, dice, and actions — all on your device" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 px-8 py-4">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <div className="f-cinzel text-xs text-[#C8861A] tracking-widest uppercase">{title}</div>
                <div className="f-body text-[#6B7A99] text-sm mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section id="how" className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>The System</SectionLabel>
            <h2 className="f-title text-4xl md:text-5xl text-[#F0E6CC] amber-glow">How It Works</h2>
            <p className="f-body text-[#6B7A99] text-lg mt-4 max-w-xl mx-auto">
              Physical board. Digital brain. A seamless loop that runs itself.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Pipeline */}
            <div className="relative">
              {/* Decorative hex bg */}
              <div className="absolute -inset-10 pointer-events-none hex-fade">
                <svg viewBox="0 0 420 420" className="w-full h-full">
                  {([[100, 80, 44, "#C8861A"], [280, 55, 34, "#38BDF8"], [55, 210, 30, "#38BDF8"],
                  [330, 210, 50, "#C8861A"], [155, 330, 40, "#38BDF8"], [310, 340, 28, "#C8861A"]] as [number, number, number, string][])
                    .map(([x, y, s, f], i) => <MiniHex key={i} x={x} y={y} size={s} fill={f} />)}
                </svg>
              </div>

              <div className="relative space-y-2">
                {[
                  { icon: "📷", label: "Camera", sub: "10–30 FPS overhead capture", c: "amber" },
                  { icon: "👁️", label: "CV Engine", sub: "Object detection & board state mapping", c: "cyan" },
                  { icon: "⚙️", label: "Game Server", sub: "Rule engine & authoritative state", c: "amber" },
                  { icon: "📡", label: "WebSocket Layer", sub: "Real-time broadcast via Socket.IO", c: "cyan" },
                  { icon: "📱", label: "Player Apps", sub: "Resources, dice, actions, animations", c: "amber" },
                ].map(({ icon, label, sub, c }, i) => (
                  <div key={label}>
                    <div className={`flex items-center gap-4 px-5 py-4 rounded-lg border transition-all duration-300 hover:scale-[1.02]
                      ${c === "amber"
                        ? "border-[#C8861A]/30 bg-gradient-to-r from-[#C8861A]/10 to-transparent hover:border-[#C8861A]/60"
                        : "border-[#38BDF8]/25 bg-gradient-to-r from-[#38BDF8]/08 to-transparent hover:border-[#38BDF8]/50"}`}>
                      <span className="text-2xl w-8 text-center">{icon}</span>
                      <div className="flex-1">
                        <div className={`f-cinzel text-sm tracking-wider ${c === "amber" ? "text-[#F0C060]" : "text-[#7DD3FC]"}`}>{label}</div>
                        <div className="text-[#4A5875] text-xs mt-0.5 f-body">{sub}</div>
                      </div>
                      <span className={`w-2 h-2 rounded-full glow-pulse flex-shrink-0 ${c === "amber" ? "bg-[#C8861A]" : "bg-[#38BDF8]"}`} />
                    </div>
                    {i < 4 && (
                      <div className="flex items-end pl-[2.6rem] py-0.5">
                        <div className="w-px h-5 bg-gradient-to-b from-[#C8861A]/40 to-[#38BDF8]/25" />
                      </div>
                    )}
                  </div>
                ))}
                <p className="f-cinzel text-[9px] text-[#2A3347] tracking-[0.3em] uppercase text-right mt-2 pr-1">
                  Player actions loop back into Game Server for validation
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-10">
              {[
                {
                  num: "01", icon: "🏠", title: "Set up your physical board",
                  desc: "Use your real Catan set — tiles, pieces, everything. No modifications. Just play like you normally would."
                },
                {
                  num: "02", icon: "👁️", title: "Camera watches automatically",
                  desc: "An overhead camera feeds frames to our CV engine, detecting settlements, cities, roads and the robber by color and shape."
                },
                {
                  num: "03", icon: "🔒", title: "Server validates every move",
                  desc: "Distance rule, road adjacency, resource costs — checked server-side before any action is accepted."
                },
                {
                  num: "04", icon: "⚡", title: "All phones sync instantly",
                  desc: "Resources, VP, dice, and turn order broadcast to every player's device over WebSocket the moment anything changes."
                },
              ].map(s => <StepRow key={s.num} {...s} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          LIVE DEMO — phone mockup
      ════════════════════════════════════════ */}
      <section id="play" className="py-28 px-4 relative overflow-hidden">

        {/* Hex tile bg pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
          <svg viewBox="0 0 900 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 5 }, (_, r) =>
              Array.from({ length: 9 }, (_, c) => {
                const x = c * 110 + (r % 2 === 0 ? 0 : 55);
                const y = r * 95 + 60;
                return <MiniHex key={`${r}-${c}`} x={x} y={y} size={48} fill="#C8861A" stroke="#F0C060" opacity={1} />;
              })
            ).flat()}
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Interactive Demo</SectionLabel>
            <h2 className="f-title text-4xl md:text-5xl text-[#F0E6CC]">Your Pocket Catan</h2>
            <p className="f-body text-[#6B7A99] text-lg mt-4 max-w-lg mx-auto">
              This is the player app — resource wallet, dice, and live game feed in your hand.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start justify-items-center">

            {/* Phone frame */}
            <div className="w-72 rounded-[2.5rem] border-4 border-[#2A3347] bg-[#080C14] overflow-hidden card-glow">
              {/* Status bar */}
              <div className="bg-[#050810] px-6 pt-3 pb-2 flex justify-between items-center">
                <span className="f-cinzel text-[10px] text-[#2A3347]">9:41</span>
                <div className="w-20 h-4 bg-[#080C14] rounded-full" />
                <span className="f-cinzel text-[10px] text-[#2A3347]">⚡ 87%</span>
              </div>

              {/* App header */}
              <div className="px-4 pt-3 pb-3 border-b border-[#C8861A]/20"
                style={{ background: "linear-gradient(135deg,rgba(200,134,26,.18) 0%,rgba(56,189,248,.06) 100%)" }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="f-cinzel text-[9px] text-[#C8861A] tracking-[0.3em] uppercase">Your Turn</div>
                    <div className="f-title text-[#F0C060] text-lg mt-0.5">Player Red</div>
                  </div>
                  <div className="text-right">
                    <div className="f-cinzel text-[9px] text-[#6B7A99] tracking-widest uppercase">Round</div>
                    <div className="f-title text-[#F0E6CC] text-lg">7</div>
                  </div>
                </div>
                {([
                  ["bg-red-500", "R", true] as [string, string, boolean],
                  ["bg-blue-500", "B", false] as [string, string, boolean],
                  ["bg-emerald-600", "G", false] as [string, string, boolean]
                ]).map(([col, l, act]) => (
                  <div
                    key={l} // key is always a string
                    className={`w-6 h-6 rounded-full ${col} flex items-center justify-center text-[9px] font-black text-white
      ${act ? "ring-2 ring-[#F0C060] ring-offset-1 ring-offset-[#080C14]" : "opacity-50"}`}
                  >
                    {l}
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div className="p-4 space-y-1.5">
                <div className="f-cinzel text-[9px] text-[#4A5875] tracking-[0.4em] uppercase mb-2">Resources</div>
                <ResRow emoji="🌲" name="Wood" count={resources.wood} glow={resources.wood >= 2 ? "amber" : "default"} />
                <ResRow emoji="🧱" name="Brick" count={resources.brick} glow={resources.brick >= 2 ? "amber" : "default"} />
                <ResRow emoji="🐑" name="Sheep" count={resources.sheep} glow="default" />
                <ResRow emoji="🌾" name="Wheat" count={resources.wheat} glow={resources.wheat >= 2 ? "amber" : "default"} />
                <ResRow emoji="⛰️" name="Ore" count={resources.ore} glow="cyan" />
              </div>

              <div className="mx-4 border-t border-[#2A3347]" />

              {/* Dice */}
              <div className="p-4">
                <button
                  onClick={rollDice}
                  disabled={rolling}
                  className="w-full py-3 rounded-lg border border-[#C8861A]/40
                    f-title text-[#F0C060] text-lg tracking-wider
                    hover:border-[#C8861A] transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  style={{ background: "linear-gradient(135deg,rgba(200,134,26,.15) 0%,transparent 100%)" }}
                >
                  {rolling ? "🎲  ..." : dice !== null ? `🎲  ${dice}` : "🎲  Roll Dice"}
                </button>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[["🏠 Build", "amber"], ["🤝 Trade", "cyan"]].map(([label, col]) => (
                    <button key={label}
                      className={`py-2 rounded f-cinzel text-[10px] tracking-widest uppercase transition-all duration-200
                        ${col === "amber"
                          ? "border border-[#C8861A]/25 text-[#C8861A]/70 hover:border-[#C8861A]/60 hover:text-[#C8861A]"
                          : "border border-[#38BDF8]/25 text-[#38BDF8]/70 hover:border-[#38BDF8]/60 hover:text-[#38BDF8]"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* VP */}
              <div className="mx-4 mb-4 p-3 rounded-lg border border-[#2A3347] bg-[#050810]">
                <div className="f-cinzel text-[9px] text-[#4A5875] tracking-[0.35em] uppercase mb-2">Victory Points</div>
                {[["Red", 7, "bg-red-500"], ["Blue", 5, "bg-blue-500"], ["Green", 4, "bg-emerald-600"]].map(([name, vp, col]) => (
                  <div key={name} className="flex items-center gap-2 mb-1">
                    <span className="f-cinzel text-[9px] text-[#4A5875] w-9">{name}</span>
                    <div className="flex-1 h-1.5 bg-[#161C27] rounded-full overflow-hidden">
                      <div className={`h-full ${col} rounded-full`} style={{ width: `${(vp as number) * 10}%` }} />
                    </div>
                    <span className="f-cinzel text-[9px] text-[#4A5875] w-4 text-right">{vp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Log + build panel */}
            <div className="w-full max-w-md space-y-4">
              {/* Live feed */}
              <div className="rounded-xl border border-[#2A3347] bg-[#0E1117] overflow-hidden card-glow">
                <div className="px-5 py-3 border-b border-[#2A3347] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 glow-pulse" />
                  <span className="f-cinzel text-xs text-[#C8861A] tracking-[0.25em] uppercase">Live Game Feed</span>
                </div>
                <div className="p-4 space-y-2">
                  {log.map((entry, i) => (
                    <div key={i} className={`px-3 py-2 rounded f-body text-sm transition-all duration-300
                      ${i === 0
                        ? "border border-[#C8861A]/30 bg-[#C8861A]/08 text-[#F0C060]"
                        : "text-[#4A5875]"}`}>
                      {entry}
                    </div>
                  ))}
                </div>
              </div>

              {/* Build menu */}
              <div className="rounded-xl border border-[#2A3347] bg-[#0E1117] overflow-hidden card-glow">
                <div className="px-5 py-3 border-b border-[#2A3347]">
                  <span className="f-cinzel text-xs text-[#38BDF8] tracking-[0.25em] uppercase">Build Menu</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                  {[
                    { label: "Road", cost: "🧱 + 🌲", can: true },
                    { label: "Settlement", cost: "🧱 + 🌲 + 🐑 + 🌾", can: true },
                    { label: "City", cost: "🌾🌾 + ⛰️⛰️⛰️", can: false },
                    { label: "Dev Card", cost: "🌾 + ⛰️ + 🐑", can: false },
                  ].map(({ label, cost, can }) => (
                    <button key={label}
                      className={`p-3 rounded-lg border text-left transition-all duration-200
                        ${can
                          ? "border-[#C8861A]/40 bg-[#C8861A]/08 hover:border-[#C8861A] hover:bg-[#C8861A]/15 cursor-pointer"
                          : "border-[#2A3347] bg-[#0A0F18] opacity-40 cursor-not-allowed"}`}>
                      <div className={`f-cinzel text-xs tracking-wider ${can ? "text-[#F0C060]" : "text-[#4A5875]"}`}>{label}</div>
                      <div className="text-[10px] mt-1 text-[#4A5875]">{cost}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="px-4 py-3 rounded-lg border border-[#38BDF8]/15 bg-[#38BDF8]/04 flex gap-3">
                <span className="text-[#38BDF8] text-sm mt-0.5 flex-shrink-0">💡</span>
                <p className="f-body text-sm text-[#6B7A99] leading-relaxed">
                  When you physically place a piece on the board, the camera detects it automatically — no button press needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section id="features" className="py-28 px-4"
        style={{ background: "linear-gradient(to bottom,rgba(22,28,39,.5) 0%,transparent 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Capabilities</SectionLabel>
            <h2 className="f-title text-4xl md:text-5xl text-[#F0E6CC]">Everything, Automated</h2>
            <p className="f-body text-[#6B7A99] text-lg mt-4 max-w-md mx-auto">
              No referee. No manual counting. No disputes. Just play.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🎲", title: "Server Dice", desc: "Tamper-proof rolls generated server-side and broadcast simultaneously to every player.", accent: "amber" as AccentVariant },
              { icon: "📦", title: "Auto Resources", desc: "Settlements and cities receive resources the instant dice settle. Ports detected from board position.", accent: "cyan" as AccentVariant },
              { icon: "👁️", title: "Computer Vision", desc: "Color-based CV with shape detection tracks every piece frame by frame, even under partial occlusion.", accent: "amber" as AccentVariant },
              { icon: "⚡", title: "<50ms Sync", desc: "Socket.IO ensures all player apps reflect the exact same game state within milliseconds.", accent: "cyan" as AccentVariant },
              { icon: "🔒", title: "Rule Engine", desc: "Distance rule, road adjacency, longest road, largest army — enforced server-side, every action.", accent: "amber" as AccentVariant },
              { icon: "🚨", title: "Robber & Theft", desc: "Move the physical robber — the camera detects the new tile, blocks resources, and steals automatically.", accent: "cyan" as AccentVariant },
              { icon: "🤝", title: "Hybrid Trading", desc: "Player-to-player and bank trades via app. Port bonuses computed from live CV board data.", accent: "amber" as AccentVariant },
              { icon: "🏆", title: "Live VP Count", desc: "Every settlement, city, longest road, largest army, and dev card tallied live on every screen.", accent: "cyan" as AccentVariant },
              { icon: "📱", title: "Join by Link", desc: "Players join on any phone browser — no app store, no account. Scan or tap a link and you're in.", accent: "amber" as AccentVariant },
            ].map(f => <FeatCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TECH STACK
      ════════════════════════════════════════ */}
      <section id="tech" className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Engineering</SectionLabel>
            <h2 className="f-title text-4xl md:text-5xl text-[#F0E6CC]">Production Stack</h2>
            <p className="f-body text-[#6B7A99] text-lg mt-4 max-w-md mx-auto">
              A distributed real-time system with computer vision at its core.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: "📷", layer: "CV Engine", tags: ["Python", "OpenCV", "PyTorch"], desc: "Frame capture, board rectification, object detection, change diffing", glow: "amber" as const },
              { icon: "⚙️", layer: "Game Server", tags: ["Node.js", "Express", "Socket.IO"], desc: "Rule engine, authoritative state, event processing, broadcast", glow: "cyan" as const },
              { icon: "🗄️", layer: "Database", tags: ["PostgreSQL", "Prisma"], desc: "Sessions, event logs, game snapshots, replay analytics", glow: "amber" as const },
              { icon: "📱", layer: "Player App", tags: ["React", "Three.js", "WebSocket"], desc: "Resource UI, board visualization, dice roller, action dispatch", glow: "cyan" as const },
            ].map(t => <TechCard key={t.layer} {...t} />)}
          </div>

          {/* Data flow bar */}
          <div className="rounded-xl border border-[#2A3347] bg-[#0E1117] p-6 card-glow">
            <div className="f-cinzel text-[10px] text-[#4A5875] tracking-[0.4em] uppercase mb-5">End-to-End Data Flow</div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["📷 Camera", "→", "👁️ CV Engine", "→", "⚙️ Game Server", "↔", "📡 WebSocket", "→", "📱 All Players"].map((item, i) => (
                <span key={i} className={
                  item === "→" || item === "↔"
                    ? "text-[#C8861A]/50 font-bold text-lg"
                    : "px-3 py-2 bg-[#161C27] border border-[#2A3347] rounded f-cinzel text-xs text-[#6B7A99] tracking-wide"
                }>{item}</span>
              ))}
            </div>
            <p className="f-cinzel text-[9px] text-[#2A3347] tracking-[0.3em] uppercase text-center mt-4">
              Player actions and CV events both flow back into the game server for validation
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA — hero image reused, bottom strip
      ════════════════════════════════════════ */}
      <section className="relative py-36 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={BG} alt="" className="w-full h-full object-cover object-top"
            style={{ filter: "brightness(0.18) saturate(0.9)" }} />
        </div>
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "linear-gradient(to bottom,#0E1117 0%,transparent 30%,transparent 70%,#0E1117 100%)" }} />

        {/* Decorative hexes */}
        <div className="absolute inset-0 z-[2] pointer-events-none flex items-center justify-center" style={{ opacity: 0.08 }}>
          <svg viewBox="0 0 700 420" className="w-full max-w-4xl">
            {([[80, 210, 72], [350, 60, 95], [620, 210, 72], [200, 360, 54], [480, 360, 60]] as [number, number, number][]).map(([x, y, s], i) => (
              <MiniHex key={i} x={x} y={y} size={s} fill="#C8861A" stroke="#F0C060" opacity={1} />
            ))}
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <SectionLabel>Ready to Play?</SectionLabel>
          <h2 className="f-title text-5xl md:text-7xl text-[#F0E6CC] mb-3 hero-shadow">
            Settle the
          </h2>
          <h2 className="f-title text-5xl md:text-7xl text-[#C8861A] mb-8 amber-glow hero-shadow">
            Frontier
          </h2>
          <p className="f-body text-xl text-[#C8B882] max-w-lg mx-auto mb-10 hero-shadow">
            Set up your board. Point the camera. Open the link on your phone.
            The rest takes care of itself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <HexBtn primary>⚔️ Host a Game</HexBtn>
            <HexBtn>📖 Read the Docs</HexBtn>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 f-cinzel text-[10px] tracking-[0.35em] uppercase text-[#2A3347]">
            {["Open Source", "Local LAN or Cloud", "No Account Required", "Works on Any Phone"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="border-t border-[#C8861A]/10 py-10 px-6 bg-[#060810]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 40 40" className="w-9 h-9">
              <MiniHex x={20} y={20} size={18} fill="#C8861A" stroke="#F0C060" opacity={1} />
              <text x="20" y="24.5" textAnchor="middle" fill="#0E1117" fontSize="10" fontWeight="900" fontFamily="Cinzel Decorative,serif">H</text>
            </svg>
            <div>
              <div className="f-title text-[#C8861A] text-sm tracking-wider">HYBRID CATAN</div>
              <div className="f-cinzel text-[#2A3347] text-[9px] tracking-[0.4em] uppercase">Game Platform</div>
            </div>
          </div>
          <p className="f-cinzel text-[10px] text-[#2A3347] tracking-[0.2em] uppercase text-center">
            Built with Python · OpenCV · Node.js · React · Socket.IO
          </p>
          <div className="flex gap-6">
            {["Docs", "GitHub", "Discord", "Issues"].map(l => (
              <a key={l} href="#" className="f-cinzel text-[10px] tracking-[0.25em] uppercase text-[#2A3347] hover:text-[#C8861A] transition-colors duration-300">{l}</a>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-[#12192A] pt-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C8861A]/20" />
            <span className="f-cinzel text-[9px] text-[#1A2235] tracking-[0.5em] uppercase">Not affiliated with Catan GmbH</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C8861A]/20" />
          </div>
        </div>
      </footer>

    </div>
  );
}