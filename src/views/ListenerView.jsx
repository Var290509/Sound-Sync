import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import { WebRTCListener } from '../lib/webrtc';
import SegmentedCodeInput from '../components/SegmentedCodeInput';
import AudioVisualizer from '../components/AudioVisualizer';
import { 
  Headphones, 
  Wifi, 
  Volume2, 
  VolumeX, 
  Signal, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  AlertCircle,
  Play,
  StopCircle,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export default function ListenerView({ initialRoomCode = '', onSelectTab }) {
  // Input fields from Sketch 3
  const [deviceName, setDeviceName] = useState(() => {
    return 'Listener ' + (navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Device');
  });
  const [code, setCode] = useState(initialRoomCode);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [audioStream, setAudioStream] = useState(null);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const [pingMs, setPingMs] = useState(12);
  const [bufferMode, setBufferMode] = useState('ultra'); // 'ultra', 'balanced', 'stable'

  const audioElementRef = useRef(null);
  const webRtcListenerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Check URL query parameters for auto-fill room code (e.g. when scanned from QR code)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setCode(joinCode.toUpperCase());
    }
  }, []);

  // Initialize Web Audio Context for audio output and visualizer
  const setupAudioContext = (stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass({
        latencyHint: bufferMode === 'ultra' ? 'interactive' : 'playback',
        sampleRate: 48000,
      });

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);

      const source = ctx.createMediaStreamSource(stream);
      source.connect(gain);
      gain.connect(analyser);
      gain.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      gainNodeRef.current = gain;

      if (ctx.state === 'suspended') {
        setNeedsAudioUnlock(true);
      }
    } catch (e) {
      console.error('AudioContext setup error:', e);
    }
  };

  // Browser Autoplay Policy Unlock
  const handleUnlockAudio = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        setNeedsAudioUnlock(false);
      });
    }
    if (audioElementRef.current) {
      audioElementRef.current.play().then(() => {
        setNeedsAudioUnlock(false);
      }).catch(() => {});
    }
  };

  // 1. Connect to Host via Socket & WebRTC
  const handleConnect = () => {
    if (!deviceName.trim()) {
      setErrorMsg('Please enter your device name.');
      return;
    }
    if (!code || code.length < 4) {
      setErrorMsg('Please enter a valid room code.');
      return;
    }

    setErrorMsg('');
    setIsConnecting(true);

    socket.emit('join-room', {
      roomCode: code.toUpperCase(),
      listenerDeviceName: deviceName.trim()
    }, (res) => {
      setIsConnecting(false);
      if (res.success) {
        setIsConnected(true);
        setRoomInfo(res);

        // Start WebRTC listener
        webRtcListenerRef.current = new WebRTCListener(
          (stream) => {
            console.log('[Listener View] Audio stream received, hooking up audio element & context');
            setAudioStream(stream);

            if (audioElementRef.current) {
              audioElementRef.current.srcObject = stream;
              audioElementRef.current.play().catch((err) => {
                console.warn('Autoplay blocked, user interaction required:', err);
                setNeedsAudioUnlock(true);
              });
            }

            setupAudioContext(stream);
          },
          (state) => {
            console.log('[Listener View] Connection state changed:', state);
          }
        );

        // Setup ping probe to host
        const pingInterval = setInterval(() => {
          const start = Date.now();
          socket.emit('ping-check', start, () => {
            const rtt = Date.now() - start;
            setPingMs(Math.max(4, Math.floor(rtt / 2)));
          });
        }, 3000);

        // Cleanup on unmount / disconnect
        return () => clearInterval(pingInterval);
      } else {
        setErrorMsg(res.error || 'Failed to join room. Verify the code.');
      }
    });
  };

  // Listen to Host disconnecting
  useEffect(() => {
    const handleHostDisconnected = ({ message }) => {
      setErrorMsg(message || 'The host has ended the audio stream.');
      handleDisconnect();
    };

    socket.on('host-disconnected', handleHostDisconnected);
    return () => {
      socket.off('host-disconnected', handleHostDisconnected);
    };
  }, []);

  // Disconnect from room
  const handleDisconnect = () => {
    if (webRtcListenerRef.current) {
      webRtcListenerRef.current.destroy();
      webRtcListenerRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }
    setIsConnected(false);
    setAudioStream(null);
    setRoomInfo(null);
    socket.disconnect();
    socket.connect();
  };

  // Adjust volume
  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioContextRef.current) {
      const target = isMuted ? 0 : newVol;
      gainNodeRef.current.gain.setTargetAtTime(target, audioContextRef.current.currentTime, 0.01);
    }
    if (audioElementRef.current) {
      audioElementRef.current.volume = isMuted ? 0 : Math.min(1.0, newVol);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (gainNodeRef.current && audioContextRef.current) {
      const target = nextMuted ? 0 : volume;
      gainNodeRef.current.gain.setTargetAtTime(target, audioContextRef.current.currentTime, 0.01);
    }
    if (audioElementRef.current) {
      audioElementRef.current.volume = nextMuted ? 0 : Math.min(1.0, volume);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 space-y-8">
      {/* Hidden audio element for WebRTC playback */}
      <audio ref={audioElementRef} autoPlay playsInline />

      {/* Header matching Sketch 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-theme-border gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-theme-accent/15 border border-theme-accent/40 text-theme-accent mb-2">
            <Headphones className="w-3.5 h-3.5" />
            <span>RECEIVER MODE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-theme-text">
            Connect
          </h2>
          <p className="text-sm text-theme-muted mt-1">
            Connect your device to receive and play low-latency audio over WiFi.
          </p>
        </div>

        {isConnected && (
          <button
            onClick={handleDisconnect}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
          >
            <StopCircle className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="text-xs mt-0.5 opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* STATE 1: Connect Form (Exact inputs from Sketch 3) */}
      {!isConnected ? (
        <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="space-y-6">
            {/* Input 1: Name of device (from sketch 3) */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-theme-muted mb-2 tracking-wider">
                Name of device
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. My Phone, Living Room Speaker, Laptop"
                className="w-full px-4 py-3.5 rounded-2xl bg-theme-bg border border-theme-border text-theme-text font-medium text-base outline-none focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20 transition-all"
              />
            </div>

            {/* Input 2: Code with Segmented boxes (from sketch 3: Code [ ][ ][ ][ ][ ][ ]) */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-theme-muted mb-2 tracking-wider text-center">
                Code (Enter 6-Character Room Code)
              </label>
              <SegmentedCodeInput
                value={code}
                onChange={setCode}
                length={6}
                disabled={isConnecting}
              />
            </div>
          </div>

          {/* Action Button from Sketch 3: "Connect" */}
          <div className="pt-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full group py-4 px-6 rounded-2xl font-bold font-display text-base text-theme-bg bg-theme-accent hover:bg-theme-accentHover shadow-[0_0_25px_var(--color-glow)] transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Wifi className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>{isConnecting ? 'Connecting to Room...' : 'Connect'}</span>
            </button>
            <p className="text-xs text-center text-theme-muted mt-3">
              Connect to the same WiFi network as the host machine for best performance.
            </p>
          </div>
        </div>
      ) : (
        /* STATE 2: Active Audio Playback Station */
        <div className="space-y-6">
          {/* Audio Autoplay Security Unlock Banner (if browser paused audio) */}
          {needsAudioUnlock && (
            <div className="p-6 rounded-3xl bg-theme-accent/20 border-2 border-theme-accent text-center animate-pulse-slow shadow-xl">
              <h4 className="font-bold text-lg text-theme-accent mb-2">
                Tap to Start Sound
              </h4>
              <p className="text-xs text-theme-text max-w-sm mx-auto mb-4">
                Your browser requires a quick tap to allow audio playback through your speakers/headphones.
              </p>
              <button
                onClick={handleUnlockAudio}
                className="px-6 py-3 rounded-2xl bg-theme-accent text-theme-bg font-bold font-display text-sm hover:bg-theme-accentHover shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Unmute & Play Audio
              </button>
            </div>
          )}

          {/* Connected Session Card */}
          <div className="rounded-3xl bg-theme-surface border border-theme-accent/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CONNECTED TO HOST</span>
                </div>
                <h3 className="text-2xl font-black font-display text-theme-text">
                  {roomInfo?.roomName || 'Sound Sync Stream'}
                </h3>
                <p className="text-xs font-mono text-theme-muted mt-1">
                  Host Device: <span className="text-theme-accent font-semibold">{roomInfo?.hostDeviceName}</span>
                </p>
              </div>

              {/* Ping / Latency Gauge */}
              <div className="p-4 rounded-2xl bg-theme-bg/80 border border-theme-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center">
                  <Signal className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-theme-accent">
                    ~{pingMs} ms
                  </div>
                  <div className="text-xs text-theme-muted font-medium">
                    WiFi Network Latency
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Audio Spectrum Visualizer */}
          <AudioVisualizer
            analyserNode={analyserRef.current}
            isPlaying={true}
            height={110}
            barsCount={50}
          />

          {/* Audio Controls (Volume & Buffer) */}
          <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 shadow-xl space-y-6">
            <h4 className="text-sm font-bold font-display uppercase tracking-wider text-theme-text flex items-center gap-2">
              <Sliders className="w-4 h-4 text-theme-accent" />
              <span>Listener Controls</span>
            </h4>

            {/* Volume Slider with Boost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-theme-muted">Master Volume</span>
                <span className="text-theme-accent font-bold">
                  {isMuted ? 'MUTED' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleMute}
                  className="p-3 rounded-2xl bg-theme-surfaceHover border border-theme-border text-theme-text hover:text-theme-accent transition-all"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-theme-border rounded-lg appearance-none cursor-pointer accent-theme-accent"
                />
              </div>
            </div>

            {/* Buffer & Latency Tuning */}
            <div className="space-y-2 pt-2 border-t border-theme-border">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-theme-muted">Latency Optimization Mode</span>
                <span className="text-theme-accent font-bold uppercase">{bufferMode}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBufferMode('ultra')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    bufferMode === 'ultra'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold shadow-sm'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <div className="text-xs">Ultra Low</div>
                  <div className="text-[10px] text-theme-muted">5-15ms (Live)</div>
                </button>
                <button
                  onClick={() => setBufferMode('balanced')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    bufferMode === 'balanced'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold shadow-sm'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <div className="text-xs">Balanced</div>
                  <div className="text-[10px] text-theme-muted">25-40ms (Sync)</div>
                </button>
                <button
                  onClick={() => setBufferMode('stable')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    bufferMode === 'stable'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold shadow-sm'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <div className="text-xs">High Stability</div>
                  <div className="text-[10px] text-theme-muted">60-90ms (Party)</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
