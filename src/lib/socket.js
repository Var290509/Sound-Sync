import { io } from 'socket.io-client';

// Determine socket URL based on environment
const getSocketUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  if (typeof window === 'undefined') return 'http://localhost:3001';
  // If Vite dev server (port 5173), connect to server on port 3001 on the same hostname (LAN IP)
  const isDev = window.location.port === '5173';
  if (isDev) {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  // In production, server serves the static build on the same port
  return window.location.origin;
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('[Sound Sync] Connected to signaling server, socket ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.warn('[Sound Sync] Socket connection error:', err.message);
});
