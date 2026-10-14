import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e7 // 10MB buffer for high-fidelity audio chunks
});

const PORT = process.env.PORT || 3001;

// Get Local LAN IPv4 addresses
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address
        });
      }
    }
  }
  return addresses;
}

// In-memory Room Storage
// roomCode -> { roomName, hostId, hostDeviceName, createdAt, listeners: Map(socketId -> { deviceName, joinedAt, ping }) }
const rooms = new Map();

// Generate readable 6-character room code (e.g. "SYNC88", "BEAT42")
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

// API endpoint for network discovery
app.get('/api/network-info', (req, res) => {
  const ips = getLocalIpAddresses();
  res.json({
    port: PORT,
    addresses: ips,
    primaryIp: ips.length > 0 ? ips[0].address : 'localhost'
  });
});

// Socket.IO signaling & audio transmission
io.on('connection', (socket) => {
  let currentRoom = null;
  let isHost = false;

  // 1. Host creates a room
  socket.on('create-room', ({ roomName, hostDeviceName }, callback) => {
    const roomCode = generateRoomCode();
    rooms.set(roomCode, {
      roomName: roomName || 'Sound Sync Lounge',
      hostId: socket.id,
      hostDeviceName: hostDeviceName || 'Host Device',
      createdAt: Date.now(),
      audioSource: 'tab',
      isStreaming: false,
      listeners: new Map()
    });

    currentRoom = roomCode;
    isHost = true;
    socket.join(roomCode);

    if (typeof callback === 'function') {
      callback({
        success: true,
        roomCode,
        roomName: rooms.get(roomCode).roomName
      });
    }

    console.log(`[Sound Sync] Room created: ${roomCode} by "${hostDeviceName}"`);
  });

  // 2. Listener joins a room
  socket.on('join-room', ({ roomCode, listenerDeviceName }, callback) => {
    const code = (roomCode || '').trim().toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Room not found. Please check the code.' });
      }
      return;
    }

    currentRoom = code;
    isHost = false;
    socket.join(code);

    const listenerInfo = {
      socketId: socket.id,
      deviceName: listenerDeviceName || 'Wireless Listener',
      joinedAt: Date.now(),
      ping: 0
    };

    room.listeners.set(socket.id, listenerInfo);

    if (typeof callback === 'function') {
      callback({
        success: true,
        roomCode: code,
        roomName: room.roomName,
        hostDeviceName: room.hostDeviceName,
        audioSource: room.audioSource,
        isStreaming: room.isStreaming
      });
    }

    // Notify Host about new listener
    io.to(room.hostId).emit('listener-joined', {
      listenerId: socket.id,
      deviceName: listenerInfo.deviceName,
      joinedAt: listenerInfo.joinedAt
    });

    // Broadcast updated listener count
    io.to(code).emit('listener-count-update', {
      count: room.listeners.size,
      listeners: Array.from(room.listeners.values())
    });

    console.log(`[Sound Sync] Listener "${listenerInfo.deviceName}" joined room: ${code}`);
  });

  // 3. WebRTC Signaling: Host -> Listener Offer
  socket.on('webrtc-offer', ({ targetId, offer }) => {
    io.to(targetId).emit('webrtc-offer', {
      senderId: socket.id,
      offer
    });
  });

  // 4. WebRTC Signaling: Listener -> Host Answer
  socket.on('webrtc-answer', ({ targetId, answer }) => {
    io.to(targetId).emit('webrtc-answer', {
      senderId: socket.id,
      answer
    });
  });

  // 5. WebRTC ICE Candidate exchange
  socket.on('ice-candidate', ({ targetId, candidate }) => {
    io.to(targetId).emit('ice-candidate', {
      senderId: socket.id,
      candidate
    });
  });

  // 6. Audio status change from Host
  socket.on('host-audio-state', ({ isStreaming, audioSource }) => {
    if (currentRoom && isHost) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.isStreaming = isStreaming;
        if (audioSource) room.audioSource = audioSource;
        socket.to(currentRoom).emit('host-audio-state', {
          isStreaming,
          audioSource: room.audioSource
        });
      }
    }
  });

  // 7. Binary Fallback Streaming: Socket.IO audio chunk broadcast
  socket.on('audio-stream-chunk', (chunk) => {
    if (currentRoom && isHost) {
      // Forward directly to listeners in the room
      socket.to(currentRoom).emit('audio-stream-chunk', chunk);
    }
  });

  // 8. Ping / Latency probe
  socket.on('ping-check', (clientTimestamp, callback) => {
    if (typeof callback === 'function') {
      callback({
        clientTimestamp,
        serverTimestamp: Date.now()
      });
    }
  });

  // 9. Host reports ping for listener
  socket.on('report-listener-ping', ({ listenerId, ping }) => {
    if (currentRoom && isHost) {
      const room = rooms.get(currentRoom);
      if (room && room.listeners.has(listenerId)) {
        room.listeners.get(listenerId).ping = ping;
        io.to(currentRoom).emit('listener-count-update', {
          count: room.listeners.size,
          listeners: Array.from(room.listeners.values())
        });
      }
    }
  });

  // 10. Disconnection
  socket.on('disconnect', () => {
    if (!currentRoom) return;

    if (isHost) {
      // Host left, notify all listeners
      io.to(currentRoom).emit('host-disconnected', {
        message: 'The Host has stopped streaming and left the room.'
      });
      rooms.delete(currentRoom);
      console.log(`[Sound Sync] Host disconnected, room ${currentRoom} closed.`);
    } else {
      // Listener left
      const room = rooms.get(currentRoom);
      if (room) {
        room.listeners.delete(socket.id);
        io.to(room.hostId).emit('listener-left', { listenerId: socket.id });
        io.to(currentRoom).emit('listener-count-update', {
          count: room.listeners.size,
          listeners: Array.from(room.listeners.values())
        });
      }
      console.log(`[Sound Sync] Listener disconnected from ${currentRoom}`);
    }
  });
});

// Serve frontend in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Sound Sync Server</title></head>
        <body style="font-family:sans-serif; background:#070F1E; color:#FAF6EE; padding:40px; text-align:center;">
          <h1 style="color:#D4AF37;">Sound Sync Audio Relay Server</h1>
          <p>Server is running on port ${PORT}.</p>
          <p>To run the frontend in development mode: <code>npm run dev</code></p>
          <p>To build frontend for production: <code>npm run build</code></p>
        </body>
        </html>
      `);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log('====================================================');
  console.log('   🎵 SOUND SYNC - AUDIO RELAY SERVER READY 🎵     ');
  console.log('====================================================');
  console.log(` Local:    http://localhost:${PORT}`);
  ips.forEach(ip => {
    console.log(` Network:  http://${ip.address}:${PORT} (${ip.interface})`);
  });
  console.log(' Connect other devices on your WiFi to stream audio!');
  console.log('====================================================');
});
