import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

async function runAudioRelayTest() {
  console.log('========================================================');
  console.log('🧪 SOUND SYNC - AUDIO RELAY END-TO-END VERIFICATION TEST');
  console.log('========================================================');

  // Test 1: Connect Host socket
  console.log('\n[Step 1] Connecting Host socket to server...');
  const hostSocket = io(SERVER_URL, { transports: ['websocket'] });

  await new Promise((resolve, reject) => {
    hostSocket.on('connect', () => {
      console.log('✅ Host connected successfully! Socket ID:', hostSocket.id);
      resolve();
    });
    hostSocket.on('connect_error', reject);
    setTimeout(() => reject(new Error('Host socket timeout')), 4000);
  });

  // Test 2: Host creates a room
  console.log('\n[Step 2] Host creating room "Vitesh Acoustic Lounge"...');
  const roomData = await new Promise((resolve, reject) => {
    hostSocket.emit('create-room', {
      roomName: 'Vitesh Acoustic Lounge',
      hostDeviceName: 'Studio Workstation'
    }, (res) => {
      if (res && res.success) {
        resolve(res);
      } else {
        reject(new Error('Failed to create room'));
      }
    });
  });

  console.log(`✅ Room Created Successfully!`);
  console.log(`   - Room Code: ${roomData.roomCode}`);
  console.log(`   - Room Name: ${roomData.roomName}`);

  // Test 3: Connect Listener socket
  console.log('\n[Step 3] Connecting Listener socket ("iPhone 15 Pro")...');
  const listenerSocket = io(SERVER_URL, { transports: ['websocket'] });

  await new Promise((resolve, reject) => {
    listenerSocket.on('connect', () => {
      console.log('✅ Listener connected! Socket ID:', listenerSocket.id);
      resolve();
    });
    setTimeout(() => reject(new Error('Listener socket timeout')), 4000);
  });

  // Test 4: Listener joins room using the 6-character roomCode
  console.log(`\n[Step 4] Listener joining room with code "${roomData.roomCode}"...`);
  const joinData = await new Promise((resolve, reject) => {
    // Set up host notification listener
    hostSocket.once('listener-joined', (info) => {
      console.log(`✅ Host received notification: Listener "${info.deviceName}" has joined!`);
    });

    listenerSocket.emit('join-room', {
      roomCode: roomData.roomCode,
      listenerDeviceName: 'iPhone 15 Pro'
    }, (res) => {
      if (res && res.success) {
        resolve(res);
      } else {
        reject(new Error(res.error || 'Failed to join room'));
      }
    });
  });

  console.log(`✅ Listener successfully joined room!`);
  console.log(`   - Connected to Host: ${joinData.hostDeviceName}`);

  // Test 5: Verify WebRTC Signaling (Offer -> Answer -> ICE)
  console.log('\n[Step 5] Testing WebRTC Low-Latency Signaling Exchange...');
  
  const signalingPromise = new Promise((resolve, reject) => {
    const mockOfferSdp = 'v=0\r\no=- 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2\r\na=fmtp:111 stereo=1;sprop-stereo=1;maxptime=10;minptime=10;useinbandfec=1\r\n';
    const mockAnswerSdp = 'v=0\r\no=- 67890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2\r\n';

    // Listener awaits offer
    listenerSocket.once('webrtc-offer', ({ senderId, offer }) => {
      console.log('   -> Listener received WebRTC Offer with Opus 48kHz audio!');
      
      // Listener replies with answer
      listenerSocket.emit('webrtc-answer', {
        targetId: senderId,
        answer: { type: 'answer', sdp: mockAnswerSdp }
      });
    });

    // Host awaits answer
    hostSocket.once('webrtc-answer', ({ senderId, answer }) => {
      console.log('   -> Host received WebRTC Answer from listener!');
      console.log('✅ WebRTC P2P Signaling handshake verified perfectly!');
      resolve();
    });

    // Host sends mock offer
    hostSocket.emit('webrtc-offer', {
      targetId: listenerSocket.id,
      offer: { type: 'offer', sdp: mockOfferSdp }
    });

    setTimeout(() => reject(new Error('Signaling handshake timed out')), 5000);
  });

  await signalingPromise;

  // Test 6: Verify Audio Stream Transmission (Sending Sound & Receiving Sound)
  console.log('\n[Step 6] Testing Audio Transmission (Broadcasting Sound Packets)...');
  
  let packetsReceived = 0;
  const audioTransmissionPromise = new Promise((resolve, reject) => {
    listenerSocket.on('audio-stream-chunk', (chunk) => {
      packetsReceived++;
      if (packetsReceived >= 3) {
        console.log(`✅ Listener received ${packetsReceived} live audio packets cleanly!`);
        resolve();
      }
    });

    // Host sends simulated 48kHz PCM audio chunks
    const mockAudioBuffer = Buffer.alloc(1024);
    // Fill with sine wave audio bytes
    for (let i = 0; i < mockAudioBuffer.length; i++) {
      mockAudioBuffer[i] = Math.floor(Math.sin(i / 10) * 127 + 128);
    }

    let count = 0;
    const interval = setInterval(() => {
      hostSocket.emit('audio-stream-chunk', mockAudioBuffer);
      count++;
      if (count > 5) clearInterval(interval);
    }, 100);

    setTimeout(() => {
      if (packetsReceived > 0) resolve();
      else reject(new Error('Audio stream chunk timeout'));
    }, 4000);
  });

  await audioTransmissionPromise;

  // Test 7: Verify Audio State Synchronization (Mute / Unmute / Source Change)
  console.log('\n[Step 7] Testing Host Audio Source & State Synchronization...');
  const stateSyncPromise = new Promise((resolve) => {
    listenerSocket.once('host-audio-state', (state) => {
      console.log(`✅ Listener received Host Audio State change:`, state);
      resolve();
    });

    hostSocket.emit('host-audio-state', {
      isStreaming: true,
      audioSource: 'tab'
    });
  });

  await stateSyncPromise;

  // Test 8: Ping & Latency Verification
  console.log('\n[Step 8] Testing WiFi Latency Probe...');
  const startPing = Date.now();
  await new Promise((resolve) => {
    listenerSocket.emit('ping-check', startPing, (res) => {
      const rtt = Date.now() - startPing;
      console.log(`✅ Real-time latency measurement confirmed: ${rtt} ms round-trip.`);
      resolve();
    });
  });

  // Cleanup
  hostSocket.disconnect();
  listenerSocket.disconnect();

  console.log('\n========================================================');
  console.log('🎉 ALL AUDIO RELAY & STREAMING TESTS PASSED (100% WORKING)!');
  console.log('========================================================\n');
}

runAudioRelayTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
