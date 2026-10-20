import Peer from 'peerjs';

const PEER_CONFIG = {
  host: '0.peerjs.com',
  port: 443,
  secure: true,
  path: '/',
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
    ],
    iceCandidatePoolSize: 10,
  },
  debug: 1,
};

/**
 * PeerHost - Manages broadcasting audio and metadata to listener devices
 * Uses public PeerJS cloud signaling (zero custom backend required; runs anywhere, including Vercel)
 */
export class PeerHost {
  constructor(roomCode, roomName, hostDeviceName, getStreamFn, callbacks = {}) {
    this.roomCode = roomCode.toUpperCase();
    this.roomName = roomName;
    this.hostDeviceName = hostDeviceName;
    this.getStream = getStreamFn;
    this.callbacks = callbacks; // onListenerChange, onStatusChange, onError

    this.peer = null;
    this.activeCalls = new Map(); // listenerPeerId -> mediaConnection
    this.dataConnections = new Map(); // listenerPeerId -> dataConnection
    this.listeners = new Map(); // listenerPeerId -> { deviceName, joinedAt, ping }
    this.isStreaming = false;
    this.audioSource = 'tab';

    this.initPeer();
  }

  initPeer() {
    const peerId = `soundsync-${this.roomCode}`;
    this.peer = new Peer(peerId, PEER_CONFIG);

    this.peer.on('open', (id) => {
      console.log('[PeerHost] Registered with cloud signaling. Host ID:', id);
      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange('ready');
      }
    });

    // 1. Handle incoming DataChannel from a new Listener
    this.peer.on('connection', (conn) => {
      const listenerId = conn.peer;
      const deviceName = conn.metadata?.deviceName || 'Wireless Device';
      console.log(`[PeerHost] Listener connected: ${deviceName} (${listenerId})`);

      this.dataConnections.set(listenerId, conn);
      this.listeners.set(listenerId, {
        id: listenerId,
        deviceName,
        joinedAt: Date.now(),
        ping: 10,
      });

      conn.on('open', () => {
        // Send initial room details to listener
        conn.send({
          type: 'room-info',
          roomCode: this.roomCode,
          roomName: this.roomName,
          hostDeviceName: this.hostDeviceName,
          isStreaming: this.isStreaming,
          audioSource: this.audioSource,
        });

        this.notifyListenersChanged();

        // Immediately call the listener with the audio stream
        this.callListener(listenerId);
      });

      // Handle ping/pong messages for real-time P2P WiFi latency gauge
      conn.on('data', (data) => {
        if (data && data.type === 'ping') {
          conn.send({ type: 'pong', clientTime: data.clientTime });
        } else if (data && data.type === 'report-ping') {
          const info = this.listeners.get(listenerId);
          if (info) {
            info.ping = data.ping;
            this.notifyListenersChanged();
          }
        }
      });

      conn.on('close', () => {
        this.handleListenerLeft(listenerId);
      });

      conn.on('error', (err) => {
        console.warn(`[PeerHost] Data connection error with ${listenerId}:`, err);
        this.handleListenerLeft(listenerId);
      });
    });

    // 2. Handle if listener calls host directly
    this.peer.on('call', (call) => {
      const stream = this.getStream();
      console.log('[PeerHost] Answering incoming media call with audio stream');
      call.answer(stream || undefined);
      this.activeCalls.set(call.peer, call);
    });

    this.peer.on('error', (err) => {
      console.error('[PeerHost] Peer error:', err);
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
    });
  }

  // Call listener with current audio stream
  callListener(listenerId) {
    const stream = this.getStream();
    if (!stream || !this.peer) return;

    try {
      console.log(`[PeerHost] Calling listener ${listenerId} with audio stream`);
      const call = this.peer.call(listenerId, stream);
      if (call) {
        this.activeCalls.set(listenerId, call);
        call.on('close', () => {
          this.activeCalls.delete(listenerId);
        });
        call.on('error', (err) => {
          console.warn(`[PeerHost] Call error with ${listenerId}:`, err);
          this.activeCalls.delete(listenerId);
        });
      }
    } catch (err) {
      console.warn(`[PeerHost] Failed to call listener ${listenerId}:`, err);
    }
  }

  // Update audio track when host switches sources (Tab -> Mic -> Tone -> File)
  updateAudioTrack(newStream) {
    if (!newStream) return;
    const newTrack = newStream.getAudioTracks()[0];
    if (!newTrack) return;

    // Update senders on all active calls
    this.activeCalls.forEach((call, listenerId) => {
      try {
        const pc = call.peerConnection;
        if (pc) {
          const senders = pc.getSenders();
          const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
          if (audioSender) {
            audioSender.replaceTrack(newTrack).catch((err) => {
              console.warn(`[PeerHost] replaceTrack error for ${listenerId}:`, err);
            });
          } else {
            pc.addTrack(newTrack, newStream);
          }
        }
      } catch (err) {
        console.warn(`[PeerHost] Failed to update track for ${listenerId}:`, err);
      }
    });

    // For any connected listener that didn't have an active call, start one
    this.dataConnections.forEach((conn, listenerId) => {
      if (!this.activeCalls.has(listenerId)) {
        this.callListener(listenerId);
      }
    });
  }

  setAudioState(isStreaming, audioSource) {
    this.isStreaming = isStreaming;
    if (audioSource) this.audioSource = audioSource;

    // Broadcast state to all listeners
    this.dataConnections.forEach((conn) => {
      try {
        conn.send({
          type: 'host-audio-state',
          isStreaming,
          audioSource: this.audioSource,
        });
      } catch (e) {}
    });
  }

  handleListenerLeft(listenerId) {
    console.log('[PeerHost] Listener left:', listenerId);
    this.listeners.delete(listenerId);
    this.dataConnections.delete(listenerId);
    const call = this.activeCalls.get(listenerId);
    if (call) {
      call.close();
      this.activeCalls.delete(listenerId);
    }
    this.notifyListenersChanged();
  }

  notifyListenersChanged() {
    if (this.callbacks.onListenerChange) {
      this.callbacks.onListenerChange(Array.from(this.listeners.values()));
    }
  }

  destroy() {
    this.activeCalls.forEach((call) => call.close());
    this.activeCalls.clear();
    this.dataConnections.forEach((conn) => conn.close());
    this.dataConnections.clear();
    this.listeners.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

/**
 * PeerListener - Connects to Host room, receives audio stream, and tracks true P2P latency
 */
export class PeerListener {
  constructor(roomCode, deviceName, callbacks = {}) {
    this.roomCode = roomCode.toUpperCase();
    this.deviceName = deviceName;
    this.callbacks = callbacks; // onStream, onStateChange, onPing, onRoomInfo, onError

    this.peer = null;
    this.hostConn = null;
    this.activeCall = null;
    this.pingInterval = null;
    this.playoutDelay = 0.005; // 5ms ultra-low latency default
    this.receiver = null;

    this.initPeer();
  }

  initPeer() {
    // Generate unique listener peer ID
    const randomId = Math.random().toString(36).substring(2, 9);
    const peerId = `soundsync-listener-${randomId}`;

    this.peer = new Peer(peerId, PEER_CONFIG);

    this.peer.on('open', (id) => {
      console.log('[PeerListener] Registered with cloud signaling. Listener ID:', id);
      this.connectToHost();
    });

    // Handle incoming call from Host
    this.peer.on('call', (call) => {
      console.log('[PeerListener] Incoming call from host, answering...');
      this.activeCall = call;
      call.answer(); // Answer without sending local mic

      call.on('stream', (remoteStream) => {
        console.log('[PeerListener] Remote audio stream received!');
        
        // Find audio receiver and apply ultra-low latency hints
        try {
          const pc = call.peerConnection;
          if (pc) {
            const receivers = pc.getReceivers();
            const audioReceiver = receivers.find((r) => r.track && r.track.kind === 'audio');
            if (audioReceiver) {
              this.receiver = audioReceiver;
              this.applyPlayoutDelay(this.playoutDelay);
            }
          }
        } catch (e) {
          console.warn('[PeerListener] Receiver tuning error:', e);
        }

        if (this.callbacks.onStream) {
          this.callbacks.onStream(remoteStream);
        }
      });

      call.on('close', () => {
        console.log('[PeerListener] Audio call closed');
      });

      call.on('error', (err) => {
        console.warn('[PeerListener] Call error:', err);
      });
    });

    this.peer.on('error', (err) => {
      console.error('[PeerListener] Peer error:', err);
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
    });
  }

  connectToHost() {
    const hostPeerId = `soundsync-${this.roomCode}`;
    console.log(`[PeerListener] Connecting to Host: ${hostPeerId}...`);

    this.hostConn = this.peer.connect(hostPeerId, {
      metadata: { deviceName: this.deviceName },
    });

    this.hostConn.on('open', () => {
      console.log('[PeerListener] Connected to Host DataChannel successfully!');
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange('connected');
      }

      // Start real-time P2P latency ping loop
      this.startPingLoop();
    });

    this.hostConn.on('data', (data) => {
      if (!data) return;

      if (data.type === 'pong') {
        const rtt = Date.now() - data.clientTime;
        const oneWay = Math.max(2, Math.floor(rtt / 2));
        if (this.callbacks.onPing) {
          this.callbacks.onPing(oneWay);
        }
        // Report ping back to host
        if (this.hostConn && this.hostConn.open) {
          this.hostConn.send({ type: 'report-ping', ping: oneWay });
        }
      } else if (data.type === 'room-info') {
        if (this.callbacks.onRoomInfo) {
          this.callbacks.onRoomInfo(data);
        }
      } else if (data.type === 'host-audio-state') {
        if (this.callbacks.onHostAudioState) {
          this.callbacks.onHostAudioState(data);
        }
      }
    });

    this.hostConn.on('close', () => {
      console.log('[PeerListener] Host disconnected');
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange('disconnected');
      }
    });

    this.hostConn.on('error', (err) => {
      console.warn('[PeerListener] Host connection error:', err);
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
    });
  }

  startPingLoop() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.hostConn && this.hostConn.open) {
        this.hostConn.send({ type: 'ping', clientTime: Date.now() });
      }
    }, 2000);
  }

  setPlayoutDelay(seconds) {
    this.playoutDelay = seconds;
    this.applyPlayoutDelay(seconds);
  }

  applyPlayoutDelay(seconds) {
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

  destroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.activeCall) {
      this.activeCall.close();
      this.activeCall = null;
    }
    if (this.hostConn) {
      this.hostConn.close();
      this.hostConn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
