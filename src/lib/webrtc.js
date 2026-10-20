import { socket } from './socket';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' }
  ],
  iceCandidatePoolSize: 10,
};

// Force ultra-low latency Opus settings in SDP
export function optimizeSdpForLowLatency(sdp) {
  if (!sdp) return sdp;

  // Find Opus payload type from rtpmap (e.g., "a=rtpmap:111 opus/48000/2")
  const opusMatch = sdp.match(/a=rtpmap:(\d+)\s+opus\/48000\/2/i);
  if (!opusMatch) return sdp;
  const pt = opusMatch[1];

  const targetParams = 'minptime=10;maxptime=10;ptime=10;cbr=1;stereo=1;sprop-stereo=1;usedtx=0;maxaveragebitrate=128000';

  const fmtpRegex = new RegExp(`a=fmtp:${pt}\\s+(.*)`);
  if (fmtpRegex.test(sdp)) {
    sdp = sdp.replace(fmtpRegex, (match, existingParams) => {
      const cleanParams = existingParams
        .split(';')
        .filter((p) => !/^(minptime|maxptime|ptime|cbr|stereo|sprop-stereo|usedtx|maxaveragebitrate)=/i.test(p.trim()))
        .join(';');
      return `a=fmtp:${pt} ${cleanParams ? cleanParams + ';' : ''}${targetParams}`;
    });
  } else {
    // Insert a=fmtp right after a=rtpmap line
    sdp = sdp.replace(
      new RegExp(`(a=rtpmap:${pt}\\s+opus\\/48000\\/2\r?\n)`),
      `$1a=fmtp:${pt} ${targetParams}\r\n`
    );
  }

  return sdp;
}

/**
 * WebRTCHost - Manages peer connections from the Host to multiple Listeners
 */
export class WebRTCHost {
  constructor(getStreamFn) {
    this.getStream = getStreamFn;
    this.peers = new Map(); // listenerId -> RTCPeerConnection
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    socket.on('listener-joined', async ({ listenerId }) => {
      console.log('[WebRTC Host] New listener joined, initiating call:', listenerId);
      await this.connectToListener(listenerId);
    });

    socket.on('webrtc-answer', async ({ senderId, answer }) => {
      const pc = this.peers.get(senderId);
      if (pc) {
        try {
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('[WebRTC Host] Remote description set for listener:', senderId);
          }
        } catch (err) {
          console.error('[WebRTC Host] Error setting remote description:', err);
        }
      }
    });

    socket.on('ice-candidate', async ({ senderId, candidate }) => {
      const pc = this.peers.get(senderId);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('[WebRTC Host] Error adding ICE candidate:', err);
        }
      }
    });

    socket.on('listener-left', ({ listenerId }) => {
      this.disconnectListener(listenerId);
    });
  }

  async connectToListener(listenerId) {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peers.set(listenerId, pc);

    const stream = this.getStream();
    if (stream) {
      stream.getTracks().forEach((track) => {
        const sender = pc.addTrack(track, stream);
        // Optimize sender encoding parameters if supported
        try {
          const params = sender.getParameters();
          if (params.encodings && params.encodings[0]) {
            params.encodings[0].maxBitrate = 128000;
            params.encodings[0].networkPriority = 'high';
            params.encodings[0].priority = 'high';
            sender.setParameters(params).catch(() => {});
          }
        } catch (e) {}
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          targetId: listenerId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC Host] Connection state with ${listenerId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.disconnectListener(listenerId);
      }
    };

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });

      const optimizedSdp = optimizeSdpForLowLatency(offer.sdp);
      const modifiedOffer = new RTCSessionDescription({
        type: offer.type,
        sdp: optimizedSdp,
      });

      await pc.setLocalDescription(modifiedOffer);

      socket.emit('webrtc-offer', {
        targetId: listenerId,
        offer: modifiedOffer,
      });
    } catch (err) {
      console.error('[WebRTC Host] Failed to create offer:', err);
    }
  }

  async renegotiate(listenerId) {
    const pc = this.peers.get(listenerId);
    if (!pc || pc.signalingState !== 'stable') return;

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      const optimizedSdp = optimizeSdpForLowLatency(offer.sdp);
      const modifiedOffer = new RTCSessionDescription({
        type: offer.type,
        sdp: optimizedSdp,
      });
      await pc.setLocalDescription(modifiedOffer);
      socket.emit('webrtc-offer', {
        targetId: listenerId,
        offer: modifiedOffer,
      });
    } catch (err) {
      console.error(`[WebRTC Host] Renegotiation error with ${listenerId}:`, err);
    }
  }

  updateAudioTrack(newStream) {
    if (!newStream) return;
    const newTrack = newStream.getAudioTracks()[0];
    if (!newTrack) return;

    this.peers.forEach((pc, listenerId) => {
      const senders = pc.getSenders();
      const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
      if (audioSender) {
        audioSender.replaceTrack(newTrack).catch((err) => {
          console.warn('[WebRTC Host] replaceTrack error:', err);
        });
      } else {
        pc.addTrack(newTrack, newStream);
        this.renegotiate(listenerId);
      }
    });
  }

  disconnectListener(listenerId) {
    const pc = this.peers.get(listenerId);
    if (pc) {
      pc.close();
      this.peers.delete(listenerId);
      console.log('[WebRTC Host] Closed peer connection with:', listenerId);
    }
  }

  destroy() {
    this.peers.forEach((pc) => pc.close());
    this.peers.clear();
    socket.off('listener-joined');
    socket.off('webrtc-answer');
    socket.off('ice-candidate');
    socket.off('listener-left');
  }
}

/**
 * WebRTCListener - Manages receiving audio on a connected device
 */
export class WebRTCListener {
  constructor(onTrackReceived, onConnectionStateChange) {
    this.onTrackReceived = onTrackReceived;
    this.onConnectionStateChange = onConnectionStateChange;
    this.pc = null;
    this.remoteStream = null;
    this.receiver = null;
    this.playoutDelay = 0.005; // 5ms default ultra-low latency target
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    socket.on('webrtc-offer', async ({ senderId, offer }) => {
      console.log('[WebRTC Listener] Received offer from host:', senderId);
      await this.handleOffer(senderId, offer);
    });

    socket.on('ice-candidate', async ({ senderId, candidate }) => {
      if (this.pc && candidate) {
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('[WebRTC Listener] Error adding candidate:', err);
        }
      }
    });
  }

  setPlayoutDelay(seconds) {
    this.playoutDelay = seconds;
    if (this.receiver) {
      try {
        if ('playoutDelayHint' in this.receiver) {
          this.receiver.playoutDelayHint = seconds;
        }
        if ('jitterBufferTarget' in this.receiver) {
          this.receiver.jitterBufferTarget = seconds;
        }
      } catch (e) {}
    }
  }

  async handleOffer(hostId, offer) {
    // If connection already exists and is stable, do renegotiation without destroying PC
    if (!this.pc || this.pc.connectionState === 'closed' || this.pc.connectionState === 'failed') {
      if (this.pc) this.pc.close();

      this.pc = new RTCPeerConnection(RTC_CONFIG);

      this.pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            targetId: hostId,
            candidate: event.candidate,
          });
        }
      };

      this.pc.ontrack = (event) => {
        console.log('[WebRTC Listener] Received remote audio track!');
        this.receiver = event.receiver;

        // Apply ultra-low latency playout delay hints
        this.setPlayoutDelay(this.playoutDelay);

        this.remoteStream = event.streams[0] || new MediaStream([event.track]);
        if (typeof this.onTrackReceived === 'function') {
          this.onTrackReceived(this.remoteStream);
        }
      };

      this.pc.onconnectionstatechange = () => {
        const state = this.pc.connectionState;
        console.log(`[WebRTC Listener] Connection state: ${state}`);
        if (typeof this.onConnectionStateChange === 'function') {
          this.onConnectionStateChange(state);
        }
      };
    }

    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.pc.createAnswer();
      const optimizedSdp = optimizeSdpForLowLatency(answer.sdp);
      const modifiedAnswer = new RTCSessionDescription({
        type: answer.type,
        sdp: optimizedSdp,
      });

      await this.pc.setLocalDescription(modifiedAnswer);

      socket.emit('webrtc-answer', {
        targetId: hostId,
        answer: modifiedAnswer,
      });
    } catch (err) {
      console.error('[WebRTC Listener] Failed to handle offer:', err);
    }
  }

  destroy() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.receiver = null;
    this.remoteStream = null;
    socket.off('webrtc-offer');
    socket.off('ice-candidate');
  }
}
