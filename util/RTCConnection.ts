
// RTCConnection.ts (utility file)
export const pc = new RTCPeerConnection({
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
    ],
});

// Handle ICE candidates
pc.onicecandidate = (event) => {
    if (event.candidate) {
        // send candidate to the player via signaling
        console.log("ICE candidate:", event.candidate);
    }
};