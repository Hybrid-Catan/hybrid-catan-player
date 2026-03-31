"use client";
import { useEffect, useRef } from "react";

export default function Player() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const socket = new WebSocket(process.env.NEXT_PUBLIC_HOST_WS!);

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        pc.ontrack = (event) => {
            if (videoRef.current) videoRef.current.srcObject = event.streams[0];
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "ice", candidate: event.candidate }));
            }
        };

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "offer") {
                await pc.setRemoteDescription(data.offer);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({ type: "answer", answer }));

            } else if (data.type === "ice") {
                await pc.addIceCandidate(data.candidate);
            }
        };

        socket.onerror = (err) => console.error("Player WS error:", err);

        return () => {
            socket.close();
            pc.close();
        };
    }, []);

    return <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />;
}