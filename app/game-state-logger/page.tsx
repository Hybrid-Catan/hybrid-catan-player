"use client";
import { useEffect, useRef, useState } from "react";

const MiniHex = ({ x, y, size, fill }: { x: number; y: number; size: number; fill: string }) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (60 * i - 30);
        return `${x + size * Math.cos(a)},${y + size * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} fill={fill} opacity="0.5" />;
};

interface LogEntry { ts: string; msg: string; type: "info" | "success" | "warn" | "error"; }
const LOG_COLORS: Record<LogEntry["type"], string> = {
    info: "text-[#6B7A99]", success: "text-emerald-400", warn: "text-yellow-400", error: "text-red-400",
};
function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

type ConnStatus = "idle" | "searching" | "handshaking" | "connected" | "error" | "host_gone";

const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
];

export default function Player() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([]);
    const remoteDescSet = useRef(false);
    // Store the normalised gameId so we can rejoin without re-rendering the join form
    const gameIdRef = useRef<string | null>(null);
    const playerIndexRef = useRef<number>(0);

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [inputCode, setInputCode] = useState("");
    const [hasJoined, setHasJoined] = useState(false);
    const [connStatus, setConnStatus] = useState<ConnStatus>("idle");

    function addLog(msg: string, type: LogEntry["type"] = "info") {
        setLogs(prev => [{ ts: now(), msg, type }, ...prev].slice(0, 30));
    }

    function normaliseGameId(raw: string): string {
        const upper = raw.trim().toUpperCase();
        return upper.startsWith("CATAN-") ? upper : `CATAN-${upper}`;
    }

    function handleJoin() {
        const code = inputCode.trim();
        if (code.length < 4) return;
        setHasJoined(true);
    }

    // ── Core session setup — extracted so we can call it for rejoins too ──
    function startSession(gid: string, pidx: number) {
        iceCandidateBuffer.current = [];
        remoteDescSet.current = false;

        // Tear down any existing PC/socket before creating new ones
        pcRef.current?.close();
        socketRef.current?.close();

        const wsUrl = process.env.NEXT_PUBLIC_HOST_WS!;
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;
        addLog(`Joining room: ${gid} (player ${pidx})`, "info");

        pc.ontrack = event => {
            if (videoRef.current) videoRef.current.srcObject = event.streams[0];
            setConnStatus("connected");
            addLog("Stream synchronised. Board is live.", "success");
        };

        pc.onicecandidate = event => {
            if (event.candidate && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "ice", candidate: event.candidate, gameId: gid }));
            }
        };

        pc.oniceconnectionstatechange = () => {
            const state = pc.iceConnectionState;
            addLog(`ICE → ${state}`, state === "connected" || state === "completed" ? "success" : state === "failed" ? "error" : "info");
            if (state === "failed") {
                addLog("ICE failed — attempting restart…", "warn");
                pc.restartIce();
            }
        };

        socket.onopen = () => {
            setConnStatus("searching");
            addLog("Signaling socket opened.", "success");
            socket.send(JSON.stringify({ type: "join_room", gameId: gid, playerIndex: pidx }));
            addLog(`join_room sent for ${gid}`, "info");
        };

        socket.onmessage = async event => {
            const data = JSON.parse(event.data as string);

            // ── Host disconnected ──────────────────────────────────────────
            if (data.type === "host_disconnected") {
                addLog("Host has disconnected. Waiting for them to rejoin…", "warn");
                setConnStatus("host_gone");
                // Clear the video stream
                if (videoRef.current) videoRef.current.srcObject = null;
                // Close PC — we'll rebuild it when the host comes back
                pc.close();
                return;
            }

            // ── Host reconnected — rebuild WebRTC from scratch ─────────────
            if (data.type === "host_reconnected") {
                addLog("Host is back! Re-establishing connection…", "success");
                setConnStatus("searching");
                // Start a fresh session on the same socket
                startSession(gid, pidx);
                return;
            }

            if (data.gameId !== gid) return;

            if (data.type === "offer") {
                setConnStatus("handshaking");
                addLog("SDP offer received — completing handshake…", "info");

                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                remoteDescSet.current = true;

                if (iceCandidateBuffer.current.length > 0) {
                    addLog(`Flushing ${iceCandidateBuffer.current.length} buffered ICE candidate(s)…`, "info");
                    for (const candidate of iceCandidateBuffer.current) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate))
                            .catch(e => console.warn("Buffered ICE error", e));
                    }
                    iceCandidateBuffer.current = [];
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.send(JSON.stringify({
                    type: "answer",
                    answer,
                    gameId: gid,
                    playerIndex: pidx,
                }));
                addLog("SDP answer sent.", "success");

            } else if (data.type === "ice") {
                if (!data.candidate) return;
                if (!remoteDescSet.current) {
                    iceCandidateBuffer.current.push(data.candidate);
                    addLog("ICE candidate buffered (awaiting remote desc).", "info");
                } else {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                        .catch(e => console.warn("ICE candidate error", e));
                }
            }
        };

        socket.onerror = () => {
            addLog("WebSocket connection error.", "error");
            setConnStatus("error");
        };

        socket.onclose = () => {
            addLog("Signaling socket closed.", "warn");
        };
    }

    // ── Kick off the session once hasJoined flips ────────────────────────
    useEffect(() => {
        if (!hasJoined) return;

        const gid = normaliseGameId(inputCode);
        gameIdRef.current = gid;
        // For simplicity use a fixed player index; in a real app this would be assigned by the server
        const pidx = Math.floor(Math.random() * 3) + 1; // 1–3 (0 = host/red)
        playerIndexRef.current = pidx;

        startSession(gid, pidx);

        return () => {
            pcRef.current?.close();
            socketRef.current?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasJoined]);

    function leave() {
        pcRef.current?.close();
        socketRef.current?.close();
        pcRef.current = null;
        socketRef.current = null;
        iceCandidateBuffer.current = [];
        remoteDescSet.current = false;
        gameIdRef.current = null;
        setHasJoined(false);
        setConnStatus("idle");
        setLogs([]);
        setInputCode("");
        if (videoRef.current) videoRef.current.srcObject = null;
    }

    // ── Manual "Try Again" when host is gone ─────────────────────────────
    function retryConnection() {
        const gid = gameIdRef.current;
        if (!gid) return;
        addLog("Manually retrying connection…", "info");
        setConnStatus("searching");
        startSession(gid, playerIndexRef.current);
    }

    const statusLabel: Record<ConnStatus, string> = {
        idle: "Awaiting Code…",
        searching: "Searching for host…",
        handshaking: "Handshaking…",
        connected: "Connected",
        error: "Connection Failed",
        host_gone: "Host Disconnected",
    };

    return (
        <div className="min-h-screen bg-[#0E1117] text-[#F0E6CC] flex items-center justify-center p-6">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;700&family=Crimson+Pro&display=swap');
        .f-title  { font-family:'Cinzel Decorative',serif; }
        .f-cinzel { font-family:'Cinzel',serif; }
        .f-body   { font-family:'Crimson Pro',serif; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.15);opacity:1} }
        .log-entry { animation:fadeIn .2s ease both; }
        .pulse-ring { animation:pulseRing 2s ease-in-out infinite; }
      `}</style>

            <div className="max-w-2xl w-full space-y-4">

                {!hasJoined ? (
                    /* ── Join form ─────────────────────────────────────────────── */
                    <div className="bg-[#161C27] border border-[#C8861A]/30 p-8 rounded-xl shadow-2xl text-center relative overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                            <MiniHex x={40} y={40} size={30} fill="#C8861A" />
                            <MiniHex x={550} y={250} size={40} fill="#C8861A" />
                            <MiniHex x={100} y={280} size={20} fill="#38BDF8" />
                        </svg>

                        <div className="flex items-center justify-center gap-3 mb-6">
                            <svg viewBox="0 0 40 40" className="w-10 h-10">
                                <MiniHex x={20} y={20} size={18} fill="#C8861A" />
                                <text x="20" y="24.5" textAnchor="middle" fill="#0E1117" fontSize="10" fontWeight="900" fontFamily="Cinzel Decorative,serif">H</text>
                            </svg>
                            <div>
                                <div className="f-title text-[#C8861A] text-base tracking-wider leading-none">HYBRID</div>
                                <div className="f-cinzel text-[#F0E6CC]/40 text-[9px] tracking-[0.45em] uppercase">CATAN</div>
                            </div>
                        </div>

                        <h2 className="f-cinzel text-[#C8861A] text-2xl tracking-[0.2em] uppercase mb-2">Join Session</h2>
                        <p className="f-body text-[#6B7A99] mb-8 text-sm italic">
                            Enter the 5-character code shown on the host screen,<br />or paste the full Game ID (CATAN-XXXXX)
                        </p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="e.g. AB3XY or CATAN-AB3XY"
                                value={inputCode}
                                onChange={e => setInputCode(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === "Enter" && handleJoin()}
                                maxLength={11}
                                className="w-full bg-[#0A0F18] border border-[#2A3347] focus:border-[#C8861A]
                  px-4 py-3 rounded text-center f-cinzel tracking-widest text-[#F0E6CC]
                  outline-none transition-all text-lg placeholder:text-[#2A3347] placeholder:text-sm placeholder:tracking-normal"
                            />
                            <button
                                onClick={handleJoin}
                                disabled={inputCode.trim().length < 4}
                                className="w-full bg-gradient-to-br from-[#D4921E] to-[#A86B10] text-[#0E1117]
                  py-3 f-cinzel font-bold uppercase tracking-widest
                  hover:scale-[1.02] active:scale-[0.98] transition-transform
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}
                            >
                                Connect to Board
                            </button>
                        </div>

                        <p className="f-body text-[#2A3347] text-xs mt-6">
                            Both <span className="text-[#4A5875]">XXXXX</span> and <span className="text-[#4A5875]">CATAN-XXXXX</span> formats are accepted
                        </p>
                    </div>

                ) : (
                    /* ── Active session ────────────────────────────────────────── */
                    <>
                        {/* Status bar */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${connStatus === "connected" ? "bg-emerald-500 animate-pulse" :
                                        connStatus === "error" ? "bg-red-500" :
                                            connStatus === "host_gone" ? "bg-yellow-400" :
                                                "bg-yellow-400 animate-pulse"}`}
                                />
                                <span className="f-cinzel text-[10px] tracking-widest uppercase text-[#6B7A99]">
                                    {statusLabel[connStatus]}
                                </span>
                            </div>
                            <span className="f-cinzel text-[10px] tracking-widest text-[#C8861A]"
                                style={{ textShadow: "0 0 30px rgba(200,134,26,.7)" }}>
                                {normaliseGameId(inputCode)}
                            </span>
                        </div>

                        {/* Video viewport */}
                        <div className="relative rounded-xl border border-[#2A3347] overflow-hidden bg-black aspect-video shadow-2xl">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />

                            {/* ── Host gone overlay ──────────────────────────────── */}
                            {connStatus === "host_gone" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#0A0D14]/95 backdrop-blur-sm">
                                    {/* Pulsing hex icon */}
                                    <div className="pulse-ring">
                                        <svg viewBox="0 0 90 90" className="w-20 h-20">
                                            <polygon
                                                points={Array.from({ length: 6 }, (_, i) => {
                                                    const a = (Math.PI / 180) * (60 * i - 30);
                                                    return `${45 + 38 * Math.cos(a)},${45 + 38 * Math.sin(a)}`;
                                                }).join(" ")}
                                                fill="rgba(234,179,8,.08)" stroke="rgba(234,179,8,.5)" strokeWidth="1.5"
                                            />
                                            <text x="45" y="53" textAnchor="middle" fontSize="26">⏸</text>
                                        </svg>
                                    </div>

                                    <div className="text-center space-y-1">
                                        <p className="f-cinzel text-sm tracking-[0.25em] uppercase text-yellow-400">
                                            Host has left the session
                                        </p>
                                        <p className="f-body text-xs text-[#4A5875] max-w-xs">
                                            The room is still open. You'll reconnect automatically when the host returns.
                                        </p>
                                    </div>

                                    {/* Waiting animation — dots */}
                                    <div className="flex items-center gap-1.5">
                                        {[0, 1, 2].map(i => (
                                            <span key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400/60"
                                                style={{ animation: `pulseRing 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                                        ))}
                                    </div>

                                    {/* Manual retry */}
                                    <button
                                        onClick={retryConnection}
                                        className="mt-1 px-6 py-2 f-cinzel text-[11px] tracking-[0.3em] uppercase
                      border border-[#C8861A]/40 text-[#C8861A] hover:border-[#C8861A] hover:bg-[#C8861A]/10
                      transition-all duration-300"
                                        style={{ clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)" }}
                                    >
                                        🔄 Retry Now
                                    </button>
                                </div>
                            )}

                            {/* ── Searching / handshaking overlay ───────────────── */}
                            {(connStatus === "searching" || connStatus === "handshaking") && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0E1117]/90">
                                    <div className="w-14 h-14 border-2 border-[#C8861A] border-t-transparent rounded-full animate-spin" />
                                    <p className="f-cinzel text-xs tracking-widest text-[#4A5875] uppercase">
                                        {statusLabel[connStatus]}
                                    </p>
                                </div>
                            )}

                            {/* ── Error overlay ─────────────────────────────────── */}
                            {connStatus === "error" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0E1117]/90">
                                    <span className="text-4xl">⚠️</span>
                                    <p className="f-cinzel text-xs tracking-widest text-red-400 uppercase">Connection Failed</p>
                                    <p className="f-body text-xs text-red-400/70 max-w-xs text-center">
                                        Check that the host session is active and the code is correct.
                                    </p>
                                    <button onClick={retryConnection}
                                        className="px-5 py-2 f-cinzel text-[11px] tracking-[0.3em] uppercase border border-red-500/40 text-red-400
                      hover:border-red-400 hover:bg-red-500/10 transition-all duration-300"
                                        style={{ clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)" }}>
                                        🔄 Retry
                                    </button>
                                </div>
                            )}

                            {/* ── Live badge ────────────────────────────────────── */}
                            {connStatus === "connected" && (
                                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded
                  border border-emerald-500/40 bg-[#0E1117]/80 backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="f-cinzel text-[10px] tracking-[0.3em] uppercase text-emerald-400">Live</span>
                                </div>
                            )}
                        </div>

                        {/* Connection log */}
                        {logs.length > 0 && (
                            <div className="rounded-xl border border-[#2A3347] bg-[#0E1117] overflow-hidden">
                                <div className="px-4 py-2 border-b border-[#2A3347]">
                                    <span className="f-cinzel text-[10px] text-[#38BDF8] tracking-[0.3em] uppercase">Connection Log</span>
                                </div>
                                <div className="p-3 max-h-36 overflow-y-auto space-y-0.5" style={{ scrollbarColor: "#2A3347 transparent" }}>
                                    {logs.map((entry, i) => (
                                        <div key={i} className={`log-entry flex gap-2 text-xs font-mono py-0.5 px-1 rounded ${i === 0 ? "bg-[#161C27]" : ""}`}>
                                            <span className="text-[#2A3347] flex-shrink-0">{entry.ts}</span>
                                            <span className={LOG_COLORS[entry.type]}>{entry.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button onClick={leave}
                            className="text-[#4A5875] hover:text-[#C8861A] text-[10px] f-cinzel tracking-widest uppercase transition-colors">
                            ← Leave Session
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}