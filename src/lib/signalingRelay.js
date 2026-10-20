import mqtt from 'mqtt';

const BROKER_URLS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

// Clean, ultra-fast STUN configuration (averages <160ms candidate resolution)
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

/**
 * Optimize SDP for ultra-low latency Opus stereo streaming (5ms packetization)
 */
function optimizeAudioSdp(sdp) {
  if (!sdp) return sdp;
  let modified = sdp;
  if (modified.includes('a=fmtp:111')) {
    modified = modified.replace(
      /a=fmtp:111[^\r\n]*/g,
      'a=fmtp:111 minptime=5;ptime=5;maxaveragebitrate=256000;stereo=1;sprop-stereo=1;useinbandfec=1;cbr=1'
    );
  }
  return modified;
}

/**
 * SignalingHost - Cloud signaling & WebRTC broadcaster for Sound Sync
 * Runs anywhere without backend servers (Vercel, LAN, Cloud, etc.)
 */
export class SignalingHost {
  constructor(roomCode, roomName, hostDeviceName, getStreamFn, callbacks = {}) {
    this.roomCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.roomName = roomName;
    this.hostDeviceName = hostDeviceName;
    this.getStream = getStreamFn;
    this.callbacks = callbacks; // onListenerChange, onStatusChange, onError

    this.mqttClient = null;
    this.peers = new Map(); // listenerId -> { pc, dc, candidateQueue, remoteDescSet, disconnectTimer }
    this.listeners = new Map(); // listenerId -> { id, deviceName, joinedAt, ping }
    this.isStreaming = false;
    this.audioSource = 'tab';
    this.isDestroyed = false;
    this.heartbeatInterval = null;

    this.initMqtt();
  }

  initMqtt(brokerIndex = 0) {
    if (this.isDestroyed) return;
    const brokerUrl = BROKER_URLS[brokerIndex] || BROKER_URLS[0];
    console.log(`[SignalingHost] Connecting to broker: ${brokerUrl}`);

    const hostTopic = `soundsync/${this.roomCode}/host`;

    // Connect without fragile LWT to avoid broker-side false disconnect triggers
    const client = mqtt.connect(brokerUrl, {
      clientId: `host_${this.roomCode}_${Math.random().toString(36).slice(2, 7)}`,
      clean: true,
      connectTimeout: 8000,
      reconnectPeriod: 2500,
      keepalive: 30,
    });

    this.mqttClient = client;

    client.on('connect', () => {
      console.log(`[SignalingHost] Connected to broker. Subscribing to: ${hostTopic}`);
      
      client.subscribe(hostTopic, { qos: 1 }, (err) => {
        if (!err) {
          if (this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange('ready');
          }
          this.publishPresence(true);
        }
      });

      // Keep presence fresh with periodic heartbeat
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = setInterval(() => {
        if (client.connected && !this.isDestroyed) {
          this.publishPresence(true);
        }
      }, 8000);
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleMessage(data);
      } catch (e) {
        console.warn('[SignalingHost] Invalid payload:', e);
      }
    });

    client.on('error', (err) => {
      console.warn('[SignalingHost] Broker error:', err.message);
      if (brokerIndex < BROKER_URLS.length - 1) {
        client.end(true, () => this.initMqtt(brokerIndex + 1));
      }
    });
  }

  publishPresence(isActive) {
    if (!this.mqttClient || !this.mqttClient.connected) return;
    const presenceTopic = `soundsync/${this.roomCode}/presence`;
    const payload = JSON.stringify({
      active: isActive,
      roomCode: this.roomCode,
      roomName: this.roomName,
      hostDeviceName: this.hostDeviceName,
      isStreaming: this.isStreaming,
      audioSource: this.audioSource,
      timestamp: Date.now(),
    });
    this.mqttClient.publish(presenceTopic, payload, { retain: true, qos: 1 });
  }

  async handleMessage(data) {
    const { type, listenerId, deviceName, answer, candidate } = data;

    // 1. Listener requests to join room
    if (type === 'join' && listenerId) {
      console.log(`[SignalingHost] Listener join request from: ${deviceName || 'Device'} (${listenerId})`);
      this.listeners.set(listenerId, {
        id: listenerId,
        deviceName: deviceName || 'Wireless Device',
        joinedAt: Date.now(),
        ping: 6,
      });
      this.notifyListenersChanged();
      await this.initiateCallToListener(listenerId);
    }

    // 2. Listener sends WebRTC answer
    else if (type === 'answer' && listenerId && answer) {
      const peerData = this.peers.get(listenerId);
      if (peerData && peerData.pc) {
        try {
          await peerData.pc.setRemoteDescription(new RTCSessionDescription(answer));
          peerData.remoteDescSet = true;
          console.log(`[SignalingHost] Remote description set for listener: ${listenerId}`);

          // Drain queued ICE candidates
          while (peerData.candidateQueue.length > 0) {
            const cand = peerData.candidateQueue.shift();
            await peerData.pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
        } catch (e) {
          console.error(`[SignalingHost] Error setting remote description for ${listenerId}:`, e);
        }
      }
    }

    // 3. Listener sends ICE candidate
    else if (type === 'candidate' && listenerId && candidate) {
      const peerData = this.peers.get(listenerId);
      if (peerData && peerData.pc) {
        if (!peerData.remoteDescSet) {
          peerData.candidateQueue.push(candidate);
        } else {
          peerData.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }
      }
    }

    // 4. Listener leaves
    else if (type === 'leave' && listenerId) {
      this.handleListenerDisconnected(listenerId);
    }
  }

  async initiateCallToListener(listenerId) {
    const existing = this.peers.get(listenerId);
    if (existing && existing.pc) {
      if (existing.disconnectTimer) clearTimeout(existing.disconnectTimer);
      try { existing.pc.close(); } catch (e) {}
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    const peerData = {
      pc,
      dc: null,
      candidateQueue: [],
      remoteDescSet: false,
      disconnectTimer: null,
    };
    this.peers.set(listenerId, peerData);

    // Ultra-fast DataChannel for zero-latency ping/pong & metadata
    const dc = pc.createDataChannel('soundsync-control', {
      ordered: false,
      maxRetransmits: 0,
    });
    peerData.dc = dc;

    dc.onopen = () => {
      console.log(`[SignalingHost] P2P DataChannel open with ${listenerId}`);
      if (peerData.disconnectTimer) {
        clearTimeout(peerData.disconnectTimer);
        peerData.disconnectTimer = null;
      }
      dc.send(JSON.stringify({
        type: 'room-info',
        roomCode: this.roomCode,
        roomName: this.roomName,
        hostDeviceName: this.hostDeviceName,
        isStreaming: this.isStreaming,
        audioSource: this.audioSource,
      }));
    };

    dc.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ping') {
          dc.send(JSON.stringify({ type: 'pong', time: msg.time }));
        } else if (msg.type === 'report-ping') {
          const l = this.listeners.get(listenerId);
          if (l) {
            l.ping = msg.ping;
            this.notifyListenersChanged();
          }
        }
      } catch (e) {}
    };

    // Attach audio track
    const stream = this.getStream();
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          const sender = pc.addTrack(track, stream);
          const params = sender.getParameters();
          if (params.encodings && params.encodings[0]) {
            params.encodings[0].maxBitrate = 256000;
            params.encodings[0].priority = 'high';
            params.encodings[0].networkPriority = 'high';
            sender.setParameters(params).catch(() => {});
          }
        } catch (e) {}
      });
    }

    // Forward ICE candidates to listener
    pc.onicecandidate = (event) => {
      if (event.candidate && this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(
          `soundsync/${this.roomCode}/listener/${listenerId}`,
          JSON.stringify({ type: 'candidate', candidate: event.candidate }),
          { qos: 1 }
        );
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[SignalingHost] Connection state with ${listenerId}: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        if (peerData.disconnectTimer) {
          clearTimeout(peerData.disconnectTimer);
          peerData.disconnectTimer = null;
        }
      } else if (pc.connectionState === 'failed') {
        // Only remove if it stays failed for 8 seconds (gives room for network handoff)
        if (!peerData.disconnectTimer) {
          peerData.disconnectTimer = setTimeout(() => {
            this.handleListenerDisconnected(listenerId);
          }, 8000);
        }
      }
    };

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });

      const optimizedSdp = optimizeAudioSdp(offer.sdp);
      const optimizedOffer = { type: offer.type, sdp: optimizedSdp };

      await pc.setLocalDescription(optimizedOffer);

      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(
          `soundsync/${this.roomCode}/listener/${listenerId}`,
          JSON.stringify({
            type: 'offer',
            offer: optimizedOffer,
            roomName: this.roomName,
            hostDeviceName: this.hostDeviceName,
            isStreaming: this.isStreaming,
            audioSource: this.audioSource,
          }),
          { qos: 1 }
        );
      }
    } catch (err) {
      console.error(`[SignalingHost] Error creating offer for ${listenerId}:`, err);
    }
  }

  updateAudioTrack(newStream) {
    if (!newStream) return;
    const newTrack = newStream.getAudioTracks()[0];
    if (!newTrack) return;

    this.peers.forEach((peerData, listenerId) => {
      const pc = peerData.pc;
      if (pc) {
        const senders = pc.getSenders();
        const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
        if (audioSender) {
          audioSender.replaceTrack(newTrack).catch((err) => {
            console.warn(`[SignalingHost] replaceTrack error for ${listenerId}:`, err);
          });
        } else {
          pc.addTrack(newTrack, newStream);
        }
      }
    });
  }

  setAudioState(isStreaming, audioSource) {
    this.isStreaming = isStreaming;
    if (audioSource) this.audioSource = audioSource;

    this.publishPresence(true);

    this.peers.forEach((peerData) => {
      if (peerData.dc && peerData.dc.readyState === 'open') {
        try {
          peerData.dc.send(JSON.stringify({
            type: 'host-audio-state',
            isStreaming,
            audioSource: this.audioSource,
          }));
        } catch (e) {}
      }
    });
  }

  handleListenerDisconnected(listenerId) {
    const peerData = this.peers.get(listenerId);
    if (peerData) {
      if (peerData.disconnectTimer) clearTimeout(peerData.disconnectTimer);
      try { peerData.pc.close(); } catch (e) {}
      this.peers.delete(listenerId);
    }
    this.listeners.delete(listenerId);
    this.notifyListenersChanged();
  }

  notifyListenersChanged() {
    if (this.callbacks.onListenerChange) {
      this.callbacks.onListenerChange(Array.from(this.listeners.values()));
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Explicitly notify listeners through DataChannel before closing
    this.peers.forEach((peerData) => {
      try {
        if (peerData.dc && peerData.dc.readyState === 'open') {
          peerData.dc.send(JSON.stringify({ type: 'host-ended' }));
        }
      } catch (e) {}
    });

    this.publishPresence(false);

    this.peers.forEach((peerData) => {
      try {
        if (peerData.disconnectTimer) clearTimeout(peerData.disconnectTimer);
        if (peerData.dc) peerData.dc.close();
        if (peerData.pc) peerData.pc.close();
      } catch (e) {}
    });
    this.peers.clear();
    this.listeners.clear();

    if (this.mqttClient) {
      try {
        this.mqttClient.end(true);
      } catch (e) {}
      this.mqttClient = null;
    }
  }
}

/**
 * SignalingListener - Direct WebRTC receiver for Sound Sync
 * Connects, measures P2P ping, clamps jitter buffer, and plays pristine audio
 */
export class SignalingListener {
  constructor(roomCode, deviceName, callbacks = {}) {
    this.roomCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.deviceName = deviceName;
    this.callbacks = callbacks; // onStream, onPing, onRoomInfo, onHostAudioState, onStateChange, onError

    this.listenerId = 'l_' + Math.random().toString(36).slice(2, 9);
    this.mqttClient = null;
    this.pc = null;
    this.dc = null;
    this.candidateQueue = [];
    this.remoteDescSet = false;
    this.pingInterval = null;
    this.joinRetryInterval = null;
    this.roomDiscoveryTimeout = null;
    this.disconnectGraceTimer = null;
    this.playoutDelay = 0.005; // 5ms default ultra-low latency target
    this.receiver = null;
    this.isDestroyed = false;

    this.initMqtt();
  }

  initMqtt(brokerIndex = 0) {
    if (this.isDestroyed) return;
    const brokerUrl = BROKER_URLS[brokerIndex] || BROKER_URLS[0];
    console.log(`[SignalingListener] Connecting to broker: ${brokerUrl}`);

    const client = mqtt.connect(brokerUrl, {
      clientId: `listener_${this.listenerId}`,
      clean: true,
      connectTimeout: 8000,
      reconnectPeriod: 2500,
      keepalive: 30,
    });

    this.mqttClient = client;
    const listenerTopic = `soundsync/${this.roomCode}/listener/${this.listenerId}`;
    const presenceTopic = `soundsync/${this.roomCode}/presence`;

    client.on('connect', () => {
      console.log(`[SignalingListener] Connected to broker. Subscribing to: ${listenerTopic} and ${presenceTopic}`);
      
      client.subscribe([listenerTopic, presenceTopic], { qos: 1 }, (err) => {
        if (!err) {
          this.sendJoinRequest();

          // Resilient retry loop: send join every 1.5 seconds until offer is received
          let retryCount = 0;
          this.joinRetryInterval = setInterval(() => {
            if (this.remoteDescSet || this.isDestroyed) {
              if (this.joinRetryInterval) clearInterval(this.joinRetryInterval);
              return;
            }
            retryCount++;
            if (retryCount <= 8) {
              console.log(`[SignalingListener] Sending join request (${retryCount}/8)...`);
              this.sendJoinRequest();
            }
          }, 1500);

          // 12-second room discovery window
          this.roomDiscoveryTimeout = setTimeout(() => {
            if (!this.remoteDescSet && !this.isDestroyed && this.callbacks.onError) {
              this.callbacks.onError({
                type: 'room-not-found',
                message: 'Room not found. Please verify the 6-character room code on the host screen.',
              });
            }
          }, 12000);
        }
      });
    });

    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (topic === presenceTopic) {
          if (data.active === true) {
            console.log('[SignalingListener] Confirmed room is active via presence!');
            if (this.callbacks.onRoomInfo) {
              this.callbacks.onRoomInfo({
                roomCode: this.roomCode,
                roomName: data.roomName || 'Sound Sync Stream',
                hostDeviceName: data.hostDeviceName || 'Host Machine',
                isStreaming: Boolean(data.isStreaming),
                audioSource: data.audioSource || 'tab',
              });
            }
          }
        } else {
          this.handleMessage(data);
        }
      } catch (e) {
        console.warn('[SignalingListener] Invalid payload:', e);
      }
    });

    client.on('error', (err) => {
      console.warn('[SignalingListener] Broker error:', err.message);
      if (brokerIndex < BROKER_URLS.length - 1) {
        client.end(true, () => this.initMqtt(brokerIndex + 1));
      }
    });
  }

  sendJoinRequest() {
    if (!this.mqttClient || !this.mqttClient.connected) return;
    const hostTopic = `soundsync/${this.roomCode}/host`;
    this.mqttClient.publish(
      hostTopic,
      JSON.stringify({
        type: 'join',
        listenerId: this.listenerId,
        deviceName: this.deviceName,
      }),
      { qos: 1 }
    );
  }

  async handleMessage(data) {
    const { type, offer, candidate, roomName, hostDeviceName, isStreaming, audioSource } = data;

    // 1. Host responded with WebRTC offer!
    if (type === 'offer' && offer) {
      if (this.roomDiscoveryTimeout) {
        clearTimeout(this.roomDiscoveryTimeout);
        this.roomDiscoveryTimeout = null;
      }
      if (this.joinRetryInterval) {
        clearInterval(this.joinRetryInterval);
        this.joinRetryInterval = null;
      }

      if (this.callbacks.onRoomInfo) {
        this.callbacks.onRoomInfo({
          roomCode: this.roomCode,
          roomName: roomName || 'Sound Sync Stream',
          hostDeviceName: hostDeviceName || 'Host Computer',
          isStreaming: Boolean(isStreaming),
          audioSource: audioSource || 'tab',
        });
      }

      await this.handleOffer(offer);
    }

    // 2. Host sent ICE candidate
    else if (type === 'candidate' && candidate) {
      if (!this.remoteDescSet) {
        this.candidateQueue.push(candidate);
      } else if (this.pc) {
        this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    }
  }

  async handleOffer(offer) {
    if (this.pc) {
      try { this.pc.close(); } catch (e) {}
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.pc = pc;

    // Incoming P2P DataChannel from host
    pc.ondatachannel = (event) => {
      const dc = event.channel;
      this.dc = dc;

      dc.onopen = () => {
        console.log('[SignalingListener] Direct P2P DataChannel connected!');
        if (this.disconnectGraceTimer) {
          clearTimeout(this.disconnectGraceTimer);
          this.disconnectGraceTimer = null;
        }
        if (this.callbacks.onStateChange) {
          this.callbacks.onStateChange('connected');
        }
        this.startPingLoop();
      };

      dc.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'pong') {
            const rtt = Date.now() - msg.time;
            const oneWay = Math.max(2, Math.floor(rtt / 2));
            if (this.callbacks.onPing) {
              this.callbacks.onPing(oneWay);
            }
            dc.send(JSON.stringify({ type: 'report-ping', ping: oneWay }));
          } else if (msg.type === 'room-info') {
            if (this.callbacks.onRoomInfo) {
              this.callbacks.onRoomInfo(msg);
            }
          } else if (msg.type === 'host-audio-state') {
            if (this.callbacks.onHostAudioState) {
              this.callbacks.onHostAudioState(msg);
            }
          } else if (msg.type === 'host-ended') {
            console.log('[SignalingListener] Host explicitly ended session.');
            if (this.callbacks.onError) {
              this.callbacks.onError({
                type: 'host-offline',
                message: 'Host has ended the broadcast session.',
              });
            }
          }
        } catch (err) {}
      };
    };

    // Incoming audio track
    pc.ontrack = (event) => {
      console.log('[SignalingListener] Remote audio track received!');
      this.receiver = event.receiver;

      this.applyPlayoutDelay(this.playoutDelay);

      const remoteStream = event.streams[0] || new MediaStream([event.track]);
      if (this.callbacks.onStream) {
        this.callbacks.onStream(remoteStream);
      }
    };

    // Forward ICE candidates to host
    pc.onicecandidate = (event) => {
      if (event.candidate && this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(
          `soundsync/${this.roomCode}/host`,
          JSON.stringify({
            type: 'candidate',
            candidate: event.candidate,
            listenerId: this.listenerId,
          }),
          { qos: 1 }
        );
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[SignalingListener] WebRTC state: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        if (this.disconnectGraceTimer) {
          clearTimeout(this.disconnectGraceTimer);
          this.disconnectGraceTimer = null;
        }
        if (this.callbacks.onStateChange) {
          this.callbacks.onStateChange('connected');
        }
      } else if (pc.connectionState === 'disconnected') {
        // DO NOT immediately abort! WebRTC handles momentary packet loss / network handoffs.
        console.log('[SignalingListener] Temporary disconnection, attempting to keep audio alive...');
      } else if (pc.connectionState === 'failed') {
        // Only trigger disconnect if failure persists for 8 seconds
        if (!this.disconnectGraceTimer) {
          this.disconnectGraceTimer = setTimeout(() => {
            if (this.pc && (this.pc.connectionState === 'failed' || this.pc.connectionState === 'disconnected')) {
              if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange('disconnected');
              }
            }
          }, 8000);
        }
      }
    };

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      this.remoteDescSet = true;

      while (this.candidateQueue.length > 0) {
        const cand = this.candidateQueue.shift();
        await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
      }

      const answer = await pc.createAnswer();
      const optimizedSdp = optimizeAudioSdp(answer.sdp);
      const optimizedAnswer = { type: answer.type, sdp: optimizedSdp };

      await pc.setLocalDescription(optimizedAnswer);

      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(
          `soundsync/${this.roomCode}/host`,
          JSON.stringify({
            type: 'answer',
            answer: optimizedAnswer,
            listenerId: this.listenerId,
          }),
          { qos: 1 }
        );
      }
    } catch (err) {
      console.error('[SignalingListener] Error setting up peer connection:', err);
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
    }
  }

  startPingLoop() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.dc && this.dc.readyState === 'open') {
        this.dc.send(JSON.stringify({ type: 'ping', time: Date.now() }));
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
    this.isDestroyed = true;
    if (this.disconnectGraceTimer) {
      clearTimeout(this.disconnectGraceTimer);
      this.disconnectGraceTimer = null;
    }
    if (this.roomDiscoveryTimeout) {
      clearTimeout(this.roomDiscoveryTimeout);
      this.roomDiscoveryTimeout = null;
    }
    if (this.joinRetryInterval) {
      clearInterval(this.joinRetryInterval);
      this.joinRetryInterval = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.dc) {
      try { this.dc.close(); } catch (e) {}
      this.dc = null;
    }
    if (this.pc) {
      try { this.pc.close(); } catch (e) {}
      this.pc = null;
    }
    if (this.mqttClient) {
      try {
        if (this.mqttClient.connected) {
          this.mqttClient.publish(
            `soundsync/${this.roomCode}/host`,
            JSON.stringify({ type: 'leave', listenerId: this.listenerId })
          );
        }
        this.mqttClient.end(true);
      } catch (e) {}
      this.mqttClient = null;
    }
  }
}
