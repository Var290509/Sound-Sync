import { socket } from './socket';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10,
};

// Force ultra-low latency Opus settings in SDP
function optimizeSdpForLowLatency(sdp) {
  return sdp.replace(
    /a=fmtp:(\d+) (.*)/g,
    'a=fmtp:$1 $2;stereo=1;sprop-stereo=1;maxptime=10;minptime=10;useinbandfec=1'
  );
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
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('[WebRTC Host] Remote description set for listener:', senderId);
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
        pc.addTrack(track, stream);
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

  updateAudioTrack(newStream) {
    if (!newStream) return;
    const newTrack = newStream.getAudioTracks()[0];
    if (!newTrack) return;

    this.peers.forEach((pc) => {
      const senders = pc.getSenders();
      const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
      if (audioSender) {
        audioSender.replaceTrack(newTrack);
      } else {
        pc.addTrack(newTrack, newStream);
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

  async handleOffer(hostId, offer) {
    if (this.pc) {
      this.pc.close();
    }

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
    socket.off('webrtc-offer');
    socket.off('ice-candidate');
  }
}
