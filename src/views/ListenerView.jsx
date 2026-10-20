import React, { useState, useEffect, useRef } from 'react';
import { PeerListener } from '../lib/peerRelay';
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
  const [pingMs, setPingMs] = useState(6);
  const [bufferMode, setBufferMode] = useState('ultra'); // 'ultra', 'balanced', 'stable'

  const audioElementRef = useRef(null);
  const peerListenerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Clean up peer on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (peerListenerRef.current) {
        peerListenerRef.current.destroy();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (peerListenerRef.current) {
        peerListenerRef.current.destroy();
      }
    };
  }, []);

  // Check URL query parameters for auto-fill room code (e.g. when scanned from QR code)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setCode(joinCode.toUpperCase());
    }
  }, []);

  // Setup Visualizer only (avoids double playback and audio collisions)
  const setupVisualizerOnly = (stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass({
          latencyHint: 'interactive',
          sampleRate: 48000,
        });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Connect analyser to a zero-gain node on ctx.destination so browser never puts Web Audio graph to sleep
      const nullGain = ctx.createGain();
      nullGain.gain.value = 0;
      analyser.connect(nullGain);
      nullGain.connect(ctx.destination);

      analyserRef.current = analyser;
    } catch (e) {
      console.warn('[Listener View] Visualizer setup warning:', e);
    }
  };

  // Browser Autoplay Policy Unlock
  const handleUnlockAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.play().then(() => {
        setNeedsAudioUnlock(false);
      }).catch(() => {});
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        setNeedsAudioUnlock(false);
      });
    }
  };

  // Adjust latency buffer mode dynamically
  const handleBufferModeChange = (mode) => {
    setBufferMode(mode);
    const delay = mode === 'ultra' ? 0.005 : mode === 'balanced' ? 0.025 : 0.070;
    if (peerListenerRef.current) {
      peerListenerRef.current.setPlayoutDelay(delay);
    }
  };

  // 1. Connect to Host via direct P2P WebRTC
  const handleConnect = () => {
    if (!deviceName.trim()) {
      setErrorMsg('Please enter your device name.');
      return;
    }
    if (!code || code.length < 4) {
      setErrorMsg('Please enter a valid 6-character room code.');
      return;
    }

    setErrorMsg('');
    setIsConnecting(true);

    // CRITICAL: Prime HTML5 audio element with a playable silent wav data URL inside the click gesture
    if (audioElementRef.current) {
      audioElementRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioElementRef.current.play().catch(() => {});
    }

    // Prime Web Audio API context
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass({
          latencyHint: 'interactive',
          sampleRate: 48000,
        });
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    } catch (e) {}

    // Initialize PeerListener
    peerListenerRef.current = new PeerListener(
      code.toUpperCase(),
      deviceName.trim(),
      {
        onStream: (stream) => {
          console.log('[Listener View] Remote audio stream received, connecting to audio element');
          setAudioStream(stream);

          if (audioElementRef.current) {
            audioElementRef.current.removeAttribute('src');
            audioElementRef.current.src = '';
            audioElementRef.current.srcObject = stream;
            audioElementRef.current.volume = isMuted ? 0 : Math.min(1.0, volume);
            audioElementRef.current.play().then(() => {
              setNeedsAudioUnlock(false);
            }).catch((err) => {
              console.warn('[Listener View] Autoplay blocked, user interaction required:', err);
              setNeedsAudioUnlock(true);
            });
          }

          setupVisualizerOnly(stream);
        },
        onPing: (ping) => {
          setPingMs(ping);
        },
        onRoomInfo: (info) => {
          setRoomInfo(info);
          setIsConnected(true);
          setIsConnecting(false);
        },
        onHostAudioState: (state) => {
          setRoomInfo((prev) => prev ? { ...prev, isStreaming: state.isStreaming, audioSource: state.audioSource } : prev);
        },
        onStateChange: (state) => {
          console.log('[Listener View] Connection state changed:', state);
          if (state === 'connected') {
            setIsConnected(true);
            setIsConnecting(false);
          } else if (state === 'disconnected') {
            setErrorMsg('Host has disconnected or ended the stream.');
            handleDisconnect();
          }
        },
        onError: (err) => {
          setIsConnecting(false);
          console.error('[Listener View] Peer listener error:', err);
          if (err.type === 'peer-unavailable') {
            setErrorMsg('Room not found. Please verify the 6-character room code on the host screen.');
          } else {
            setErrorMsg(err.message || 'Connection failed. Please verify code.');
          }
        },
      }
    );
  };

  // Disconnect from room
  const handleDisconnect = () => {
    if (peerListenerRef.current) {
      peerListenerRef.current.destroy();
      peerListenerRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setAudioStream(null);
    setRoomInfo(null);
  };

  // Adjust volume
  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (audioElementRef.current) {
      audioElementRef.current.volume = isMuted ? 0 : Math.min(1.0, newVol);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
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
                  Host Device: <span className="text-theme-accent font-semibold">{roomInfo?.hostDeviceName || 'Host'}</span>
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

            {/* Volume Slider */}
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
                  onClick={() => handleBufferModeChange('ultra')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    bufferMode === 'ultra'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold shadow-sm'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <div className="text-xs">Ultra Low</div>
                  <div className="text-[10px] text-theme-muted">5-10ms (Live)</div>
                </button>
                <button
                  onClick={() => handleBufferModeChange('balanced')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    bufferMode === 'balanced'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold shadow-sm'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <div className="text-xs">Balanced</div>
                  <div className="text-[10px] text-theme-muted">20-30ms (Sync)</div>
                </button>
                <button
                  onClick={() => handleBufferModeChange('stable')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    bufferMode === 'stable'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold shadow-sm'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <div className="text-xs">High Stability</div>
                  <div className="text-[10px] text-theme-muted">60-80ms (Party)</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
