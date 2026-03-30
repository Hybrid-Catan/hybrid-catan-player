import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ── Hex SVG tile component ──────────────────────────────────────────────────
const HexTile = ({
  x,
  y,
  size = 60,
  fill = "#1a2e1a",
  stroke = "#2d4a2d",
  label = "",
  labelColor = "#6b8f6b",
  delay = 0,
}: {
  x: number;
  y: number;
  size?: number;
  fill?: string;
  stroke?: string;
  label?: string;
  labelColor?: string;
  delay?: number;
}) => {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`;
  }).join(" ");

  return (
    <g style={{ animationDelay: `${delay}ms` }} className="animate-pulse">
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        opacity="0.6"
      />
      {label && (
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill={labelColor}
          fontSize="11"
          fontFamily="serif"
        >
          {label}
        </text>
      )}
    </g>
  );
};

// ── Animated board SVG ──────────────────────────────────────────────────────
const HexBoard = () => {
  const tiles = [
    { x: 300, y: 120, fill: "#1a2e1a", label: "🌲", delay: 0 },
    { x: 370, y: 80, fill: "#2d2010", label: "🌾", delay: 150 },
    { x: 440, y: 120, fill: "#1a1a2e", label: "⛰️", delay: 300 },
    { x: 510, y: 80, fill: "#1e2a1e", label: "🐑", delay: 450 },
    { x: 265, y: 180, fill: "#2a1a10", label: "🧱", delay: 600 },
    { x: 335, y: 200, fill: "#1a2e1a", label: "🌲", delay: 100 },
    { x: 405, y: 160, fill: "#2d2010", label: "🌾", delay: 250 },
    { x: 475, y: 200, fill: "#1a1a2e", label: "⛰️", delay: 400 },
    { x: 545, y: 160, fill: "#1e2a1e", label: "🐑", delay: 550 },
    { x: 300, y: 260, fill: "#2d2010", label: "🌾", delay: 200 },
    { x: 370, y: 280, fill: "#2a2a1a", label: "🏜️", delay: 350 },
    { x: 440, y: 240, fill: "#1a2e1a", label: "🌲", delay: 500 },
    { x: 510, y: 280, fill: "#2a1a10", label: "🧱", delay: 650 },
  ];

  return (
    <svg
      viewBox="0 0 800 380"
      className="w-full max-w-2xl opacity-30"
      xmlns="http://www.w3.org/2000/svg"
    >
      {tiles.map((t, i) => (
        <HexTile key={i} x={t.x} y={t.y} size={55} fill={t.fill} delay={t.delay} />
      ))}
      {/* roads */}
      <line x1="335" y1="145" x2="370" y2="105" stroke="#c47d3a" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
      <line x1="405" y1="185" x2="440" y2="145" stroke="#c47d3a" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
      <line x1="475" y1="175" x2="510" y2="105" stroke="#3a6bc4" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
      {/* settlements */}
      <rect x="326" y="137" width="18" height="18" fill="#e87a2c" rx="2" opacity="0.9" />
      <rect x="431" y="137" width="18" height="18" fill="#3a6bc4" rx="2" opacity="0.9" />
      <rect x="396" y="177" width="18" height="18" fill="#e87a2c" rx="2" opacity="0.9" />
      {/* city */}
      <rect x="500" y="97" width="22" height="22" fill="#3a6bc4" rx="3" opacity="0.9" />
      <rect x="503" y="83" width="16" height="16" fill="#3a6bc4" rx="2" opacity="0.7" />
      {/* robber */}
      <circle cx="371" cy="282" r="10" fill="#333" stroke="#666" strokeWidth="2" opacity="0.8" />
      <text x="371" y="287" textAnchor="middle" fill="#999" fontSize="10">R</text>
    </svg>
  );
};

// ── Resource pill ────────────────────────────────────────────────────────────
const ResourcePill = ({
  emoji,
  name,
  count,
  color,
}: {
  emoji: string;
  name: string;
  count: number;
  color: string;
}) => (
  <div
    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${color} text-sm font-medium`}
  >
    <span>{emoji}</span>
    <span>{name}</span>
    <Badge variant="secondary" className="ml-auto text-xs">
      {count}
    </Badge>
  </div>
);

// ── Feature card ─────────────────────────────────────────────────────────────
const FeatureCard = ({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) => (
  <Card className="bg-zinc-900/60 border-zinc-800 hover:border-amber-800/60 transition-all duration-300 hover:-translate-y-1 group">
    <CardHeader className="pb-2">
      <div className="text-3xl mb-2">{icon}</div>
      <CardTitle className="text-amber-200 text-base font-semibold tracking-wide">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </CardContent>
  </Card>
);

// ── Step card ────────────────────────────────────────────────────────────────
const StepCard = ({
  num,
  title,
  desc,
  accent,
}: {
  num: string;
  title: string;
  desc: string;
  accent: string;
}) => (
  <div className="flex gap-4 items-start">
    <div
      className={`flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center border ${accent} font-mono text-sm font-bold`}
    >
      {num}
    </div>
    <div>
      <p className="text-amber-100 font-semibold mb-1 text-sm">{title}</p>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

// ── Tech badge ───────────────────────────────────────────────────────────────
const TechBadge = ({ label }: { label: string }) => (
  <span className="px-2 py-1 text-xs rounded border border-zinc-700 text-zinc-400 bg-zinc-900">
    {label}
  </span>
);

// ── Main landing page ────────────────────────────────────────────────────────
export default function HybridCatanLanding() {
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [resources, setResources] = useState({
    wood: 3,
    brick: 2,
    sheep: 1,
    wheat: 4,
    ore: 2,
  });
  const [log, setLog] = useState<string[]>([
    "🎲 Game started — 3 players joined",
    "🏠 Red placed settlement on node #12",
    "🛣️ Blue built road on edge #45",
  ]);

  const rollDice = () => {
    if (rolling) return;
    setRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * 11) + 2);
      count++;
      if (count >= 8) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 11) + 2;
        setDiceResult(final);
        setRolling(false);
        const msgs: Record<number, string> = {
          7: "🚨 Robber activated — move it!",
          6: "⚡ Resources distributed for 6",
          8: "⚡ Resources distributed for 8",
          2: "🎯 Snake eyes!",
          12: "🎯 Boxcars!",
        };
        const msg = msgs[final] ?? `⚡ Resources distributed for ${final}`;
        setLog((l) => [msg, ...l].slice(0, 6));
        if (final !== 7) {
          setResources((r) => ({
            ...r,
            wood: r.wood + (Math.random() > 0.5 ? 1 : 0),
            wheat: r.wheat + (Math.random() > 0.5 ? 1 : 0),
          }));
        }
      }
    }, 80);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-amber-600 rounded-sm rotate-45 flex items-center justify-center">
            <div className="-rotate-45 text-xs font-black text-zinc-950">H</div>
          </div>
          <span className="font-bold tracking-widest text-amber-200 text-sm uppercase">
            Hybrid Catan
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-zinc-500">
          {["How it works", "Features", "Tech", "Play"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="hover:text-amber-300 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold tracking-wider text-xs uppercase"
        >
          Join Game
        </Button>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 overflow-hidden">
        {/* background board */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <HexBoard />
        </div>
        {/* radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#09090b_80%)] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Badge
            variant="outline"
            className="border-amber-800 text-amber-400 bg-amber-950/40 tracking-widest uppercase text-xs mb-6"
          >
            Mixed Reality Board Gaming
          </Badge>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-6 leading-none">
            <span className="text-amber-200">HYBRID</span>
            <br />
            <span className="text-amber-600">CATAN</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Physical board. Digital brain. Real-time everything.
            <br />
            Place pieces in the real world — let the camera handle the rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-black tracking-widest uppercase text-sm px-8"
            >
              Start a Game
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:border-amber-700 hover:text-amber-300 font-bold tracking-widest uppercase text-sm px-8"
            >
              Watch Demo
            </Button>
          </div>

          {/* live indicators */}
          <div className="mt-14 flex flex-wrap justify-center gap-6">
            {[
              { val: "Real-time", label: "CV Detection" },
              { val: "Zero", label: "Manual Tracking" },
              { val: "All", label: "Devices Supported" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-amber-400">{s.val}</div>
                <div className="text-xs text-zinc-600 tracking-widest uppercase mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-700 text-xs tracking-widest uppercase animate-bounce">
          <span>Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-amber-700 to-transparent" />
        </div>
      </section>

      {/* ── LIVE DEMO WIDGET ── */}
      <section id="play" className="py-24 px-4 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="border-amber-800 text-amber-400 bg-amber-950/40 tracking-widest uppercase text-xs mb-4"
            >
              Interactive Demo
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-amber-200 tracking-tight">
              Your Phone, Your Wallet
            </h2>
            <p className="text-zinc-500 mt-3 text-sm md:text-base max-w-md mx-auto">
              This is what the player app looks like in your hand — resources, dice, and live game log.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* phone mockup */}
            <div className="flex justify-center">
              <div className="w-72 rounded-3xl border-4 border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl shadow-amber-950/20">
                {/* status bar */}
                <div className="bg-zinc-950 px-6 py-2 flex justify-between text-xs text-zinc-600">
                  <span>9:41</span>
                  <span>🔋 87%</span>
                </div>
                {/* app header */}
                <div className="bg-amber-900/30 border-b border-amber-900/40 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-600 tracking-widest uppercase">Your Turn</p>
                    <p className="text-amber-200 font-bold text-sm">Player Red</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div className="w-3 h-3 rounded-full bg-green-600" />
                  </div>
                </div>

                {/* resources */}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-zinc-600 tracking-widest uppercase mb-3">Resources</p>
                  <ResourcePill emoji="🌲" name="Wood" count={resources.wood} color="border-green-900/60 text-green-400 bg-green-950/20" />
                  <ResourcePill emoji="🧱" name="Brick" count={resources.brick} color="border-red-900/60 text-red-400 bg-red-950/20" />
                  <ResourcePill emoji="🐑" name="Sheep" count={resources.sheep} color="border-zinc-700 text-zinc-300 bg-zinc-800/40" />
                  <ResourcePill emoji="🌾" name="Wheat" count={resources.wheat} color="border-amber-900/60 text-amber-400 bg-amber-950/20" />
                  <ResourcePill emoji="⛰️" name="Ore" count={resources.ore} color="border-blue-900/60 text-blue-400 bg-blue-950/20" />
                </div>

                <Separator className="bg-zinc-800" />

                {/* dice */}
                <div className="p-4">
                  <div
                    className="w-full h-16 rounded-lg border border-zinc-700 bg-zinc-800/60 flex items-center justify-center cursor-pointer hover:bg-amber-900/20 hover:border-amber-700 transition-all"
                    onClick={rollDice}
                  >
                    <span className="text-3xl">
                      {rolling ? "🎲" : diceResult ? `🎲 ${diceResult}` : "🎲 Roll Dice"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400 text-xs hover:border-amber-700 hover:text-amber-300">
                      🏠 Build
                    </Button>
                    <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400 text-xs hover:border-amber-700 hover:text-amber-300">
                      🤝 Trade
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* game log */}
            <div className="space-y-4">
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-300 text-sm tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Game Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {log.map((entry, i) => (
                    <div
                      key={i}
                      className={`text-sm py-2 px-3 rounded border ${i === 0
                          ? "border-amber-800/50 bg-amber-950/20 text-amber-300"
                          : "border-zinc-800 text-zinc-500"
                        } transition-all`}
                    >
                      {entry}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-zinc-400 text-sm tracking-widest uppercase">
                    Victory Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: "Red", vp: 7, color: "bg-red-500" },
                      { name: "Blue", vp: 5, color: "bg-blue-500" },
                      { name: "Green", vp: 4, color: "bg-green-600" },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${p.color}`} />
                        <span className="text-sm text-zinc-400 w-12">{p.name}</span>
                        <div className="flex-1 bg-zinc-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${p.color} opacity-70`}
                            style={{ width: `${(p.vp / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">{p.vp}/10</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="border-amber-800 text-amber-400 bg-amber-950/40 tracking-widest uppercase text-xs mb-4"
            >
              The System
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-amber-200 tracking-tight">
              How It Works
            </h2>
            <p className="text-zinc-500 mt-3 text-sm max-w-md mx-auto">
              A camera watches the board. A server runs the brain. Your phone is the interface.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* pipeline visual */}
            <Card className="bg-zinc-900/60 border-zinc-800 overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[
                    { icon: "📷", label: "Camera", desc: "Watches the board 10–30 FPS", color: "border-amber-800/60 bg-amber-950/20" },
                    { icon: "🧠", label: "CV Engine", desc: "Detects settlements, roads, robber", color: "border-blue-800/60 bg-blue-950/20" },
                    { icon: "⚙️", label: "Game Server", desc: "Validates rules, manages state", color: "border-green-800/60 bg-green-950/20" },
                    { icon: "📡", label: "WebSocket", desc: "Broadcasts to all players", color: "border-purple-800/60 bg-purple-950/20" },
                    { icon: "📱", label: "Player Apps", desc: "Resources, dice, animations", color: "border-red-800/60 bg-red-950/20" },
                  ].map((step, i) => (
                    <div key={step.label}>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${step.color}`}>
                        <span className="text-xl">{step.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-zinc-200">{step.label}</p>
                          <p className="text-xs text-zinc-500">{step.desc}</p>
                        </div>
                      </div>
                      {i < 4 && (
                        <div className="flex justify-center my-1">
                          <div className="w-px h-4 bg-zinc-700" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* steps */}
            <div className="space-y-8">
              {[
                { num: "01", title: "Place pieces physically", desc: "Use real Catan pieces. No digital input needed for the board — just play naturally.", accent: "border-amber-700 text-amber-500" },
                { num: "02", title: "Camera detects changes", desc: "Computer vision maps each hex, road, settlement and city to a node ID in real time.", accent: "border-blue-700 text-blue-500" },
                { num: "03", title: "Server validates everything", desc: "Distance rules, resource costs, road connectivity — all enforced automatically.", accent: "border-green-700 text-green-500" },
                { num: "04", title: "Your phone updates instantly", desc: "Resources, animations, turn order — synced to every player via WebSocket.", accent: "border-purple-700 text-purple-500" },
              ].map((s) => (
                <StepCard key={s.num} {...s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-4 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="outline"
              className="border-amber-800 text-amber-400 bg-amber-950/40 tracking-widest uppercase text-xs mb-4"
            >
              Capabilities
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-amber-200 tracking-tight">
              Everything, Automated
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🎲", title: "Digital Dice", desc: "Server-generated rolls broadcast to all players simultaneously — no disputes." },
              { icon: "📦", title: "Auto Resource Distribution", desc: "Each roll triggers instant resource grants. Cities give double. No counting cards." },
              { icon: "👁️", title: "Computer Vision Detection", desc: "Color-based CV tracks settlements, roads, robber position frame by frame." },
              { icon: "⚡", title: "Real-Time Sync", desc: "WebSocket layer ensures every player sees state updates within milliseconds." },
              { icon: "🚨", title: "Rule Enforcement", desc: "Distance rules, road adjacency, resource costs — validated server-side every action." },
              { icon: "🔄", title: "Hybrid Trading", desc: "Player-to-player or bank trades via app. Port bonuses detected from board position." },
              { icon: "🗺️", title: "Robber Tracking", desc: "Move the physical robber — CV detects the new tile and blocks resources automatically." },
              { icon: "🏆", title: "Victory Points", desc: "Longest road, largest army, settlements, cities — all computed and displayed live." },
              { icon: "📱", title: "No App Install", desc: "Players join via link on any mobile or desktop browser. Zero friction." },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section id="tech" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge
              variant="outline"
              className="border-amber-800 text-amber-400 bg-amber-950/40 tracking-widest uppercase text-xs mb-4"
            >
              Engineering
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-amber-200 tracking-tight">
              Production-Grade Stack
            </h2>
            <p className="text-zinc-500 mt-3 text-sm max-w-md mx-auto">
              CV pipeline → event-driven backend → real-time sync → interactive frontend.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                layer: "CV Engine",
                icon: "📷",
                tags: ["Python", "OpenCV", "PyTorch"],
                desc: "Frame capture, board rectification, object detection",
              },
              {
                layer: "Game Server",
                icon: "⚙️",
                tags: ["Node.js", "Express", "Socket.IO"],
                desc: "Rule engine, state management, event processing",
              },
              {
                layer: "Database",
                icon: "🗄️",
                tags: ["PostgreSQL", "Prisma"],
                desc: "Game sessions, event logs, state snapshots",
              },
              {
                layer: "Player App",
                icon: "📱",
                tags: ["React", "Three.js", "WebSocket"],
                desc: "Resource UI, board viz, action dispatcher",
              },
            ].map((t) => (
              <Card key={t.layer} className="bg-zinc-900/60 border-zinc-800 hover:border-amber-800/40 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <CardTitle className="text-amber-300 text-xs tracking-widest uppercase">
                    {t.layer}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-zinc-500 text-xs leading-relaxed">{t.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.tags.map((tag) => (
                      <TechBadge key={tag} label={tag} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* architecture flow */}
          <Card className="mt-8 bg-zinc-900/40 border-zinc-800">
            <CardContent className="p-6">
              <p className="text-xs text-zinc-600 tracking-widest uppercase mb-4">Data Flow</p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                {["Camera", "→", "CV Engine", "→", "Game Server", "↔", "WebSocket", "→", "Player Apps"].map(
                  (item, i) => (
                    <span
                      key={i}
                      className={
                        item === "→" || item === "↔"
                          ? "text-amber-800"
                          : "px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 text-xs font-mono"
                      }
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
              <div className="mt-3 flex justify-center">
                <span className="text-xs text-zinc-600">Player Actions feed back into Game Server for validation</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 bg-gradient-to-t from-amber-950/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-amber-200 tracking-tight mb-6">
            Ready to play?
          </h2>
          <p className="text-zinc-500 text-lg mb-10 max-w-md mx-auto">
            Set up the board. Open the link. Let the camera do the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-black tracking-widest uppercase text-sm px-10"
            >
              Host a Game
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:border-amber-700 hover:text-amber-300 font-bold tracking-widest uppercase text-sm px-10"
            >
              View on GitHub
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-zinc-700 text-xs tracking-widest uppercase">
            <span>Open Source</span>
            <span>·</span>
            <span>Local LAN or Cloud</span>
            <span>·</span>
            <span>No Account Required</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-900 py-8 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber-700 rounded-sm rotate-45 flex items-center justify-center">
              <div className="-rotate-45 text-xs font-black text-zinc-950">H</div>
            </div>
            <span className="font-bold tracking-widest text-amber-800 text-xs uppercase">
              Hybrid Catan
            </span>
          </div>
          <p className="text-zinc-700 text-xs tracking-wide">
            Built with Computer Vision · Node.js · React · Socket.IO
          </p>
          <div className="flex gap-6 text-xs text-zinc-700 tracking-widest uppercase">
            <a href="#" className="hover:text-amber-600 transition-colors">Docs</a>
            <a href="#" className="hover:text-amber-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-amber-600 transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}