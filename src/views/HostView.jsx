import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../lib/audioEngine';
import { SignalingHost } from '../lib/signalingRelay';
import AudioVisualizer from '../components/AudioVisualizer';
import QRCodeModal from '../components/QRCodeModal';
import { 
  Radio, 
  ScreenShare, 
  Mic, 
  FileAudio, 
  Activity, 
  QrCode, 
  Copy, 
  Check, 
  Users, 
  Volume2, 
  VolumeX, 
  StopCircle, 
  Play, 
  Wifi, 
  AlertCircle,
  Sparkles,
  Signal,
  Bell
} from 'lucide-react';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function HostView({ onSelectTab }) {
  // Form fields as sketched in the drawing
  const [roomName, setRoomName] = useState('Living Room Sound');
  const [deviceName, setDeviceName] = useState('Host Computer');
  
  // Host state
  const [isHosting, setIsHosting] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [selectedSource, setSelectedSource] = useState('tab'); // 'tab', 'mic', 'file', 'tone'
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectedListeners, setConnectedListeners] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  const signalingHostRef = useRef(null);
  const fileInputRef = useRef(null);

  // Screen Wake Lock while hosting to prevent laptop/phone sleep & WebSocket throttling
  useEffect(() => {
    let wakeLock = null;
    if (isHosting && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((wl) => {
        wakeLock = wl;
      }).catch(() => {});
    }
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [isHosting]);

  // Clean up host on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (signalingHostRef.current) {
        signalingHostRef.current.destroy();
      }
      audioEngine.stopAll();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (signalingHostRef.current) {
        signalingHostRef.current.destroy();
      }
      audioEngine.stopAll();
    };
  }, []);

  // Construct shareable link for mobile phones
  const getJoinUrl = () => {
    if (typeof window === 'undefined') return '';
    const host = window.location.host;
    const protocol = window.location.protocol;
    return `${protocol}//${host}/?join=${roomCode}`;
  };

  // 1. Create Room & Start Hosting
  const handleStartHosting = async () => {
    if (!roomName.trim() || !deviceName.trim()) {
      setErrorMsg('Please enter both room name and device name.');
      return;
    }
    setErrorMsg('');

    try {
      // Pre-initialize Web Audio context inside this user gesture
      await audioEngine.initContext();
    } catch (err) {
      console.warn('[Host View] AudioContext init warning:', err);
    }

    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setIsHosting(true);

    // Initialize SignalingHost via high-reliability cloud broker with retained presence
    signalingHostRef.current = new SignalingHost(
      newCode,
      roomName,
      deviceName,
      () => audioEngine.getStream(),
      {
        onListenerChange: (listeners) => {
          setConnectedListeners(listeners);
        },
        onStatusChange: (status) => {
          console.log('[Host View] Signaling status:', status);
        },
        onError: (err) => {
          console.error('[Host View] Signaling error:', err);
          setErrorMsg(err.message || 'Connection notification');
        },
      }
    );

    // Automatically prompt or start the selected audio source inside the gesture
    try {
      await handleStartAudioStream(selectedSource);
    } catch (e) {
      // If user cancelled browser screen share dialog, room remains open ready for them to retry
      console.log('[Host View] Initial audio source selection note:', e.message);
    }
  };

  // 2. Start Audio Stream (Tab/Screen or other sources)
  const handleStartAudioStream = async (sourceType = selectedSource) => {
    setErrorMsg('');
    try {
      let stream = null;

      if (sourceType === 'tab') {
        stream = await audioEngine.captureDisplayMedia();
      } else if (sourceType === 'mic') {
        stream = await audioEngine.captureMicrophone();
      } else if (sourceType === 'tone') {
        stream = await audioEngine.startTestTone(true);
      }

      if (stream) {
        setIsStreaming(true);
        setSelectedSource(sourceType);

        // Update WebRTC track and broadcast state for all listeners
        if (signalingHostRef.current) {
          signalingHostRef.current.updateAudioTrack(stream);
          signalingHostRef.current.setAudioState(true, sourceType);
        }
      }
    } catch (err) {
      console.error('Audio start error:', err);
      // Don't show scary error if user simply closed screen picker dialog
      if (err.name !== 'NotAllowedError') {
        setErrorMsg(err.message || 'Could not start audio stream.');
      }
    }
  };

  // Handle local file selection
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    try {
      const stream = await audioEngine.playAudioFile(file, true);
      if (stream) {
        setIsStreaming(true);
        setSelectedSource('file');
        if (signalingHostRef.current) {
          signalingHostRef.current.updateAudioTrack(stream);
          signalingHostRef.current.setAudioState(true, 'file');
        }
      }
    } catch (err) {
      setErrorMsg('Failed to play local audio file: ' + err.message);
    }
  };

  // Stop broadcasting audio
  const handleStopAudioStream = () => {
    audioEngine.stopAll();
    setIsStreaming(false);
    if (signalingHostRef.current) {
      signalingHostRef.current.setAudioState(false, selectedSource);
    }
  };

  // Close session completely
  const handleCloseSession = () => {
    if (signalingHostRef.current) {
      signalingHostRef.current.destroy();
      signalingHostRef.current = null;
    }
    audioEngine.stopAll();
    setIsHosting(false);
    setIsStreaming(false);
    setConnectedListeners([]);
    setRoomCode('');
  };

  const handleCopyLink = () => {
    const url = getJoinUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-theme-accent/10 text-theme-accent border border-theme-accent/30 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>TRANSMITTER MODE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-theme-text">
            HOST
          </h2>
          <p className="text-sm text-theme-muted mt-1">
            Broadcast low-latency WiFi audio from this machine to any connected devices.
          </p>
        </div>

        {isHosting && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-theme-surface hover:bg-theme-surfaceHover border border-theme-border text-theme-text transition-all"
            >
              <QrCode className="w-4 h-4 text-theme-accent" />
              <span>Mobile QR</span>
            </button>
            <button
              onClick={handleCloseSession}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
            >
              <StopCircle className="w-4 h-4" />
              <span>End Broadcast</span>
            </button>
          </div>
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

      {/* STATE 1: Initial Setup Form (Exact inputs from Sketch 2) */}
      {!isHosting ? (
        <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Note Banner requested by user */}
          <div className="p-4 sm:p-5 rounded-2xl bg-theme-accent/10 border border-theme-accent/40 flex items-start gap-3.5 shadow-sm">
            <Sparkles className="w-5 h-5 text-theme-accent shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-theme-text leading-relaxed">
              <span className="font-bold text-theme-accent uppercase tracking-wider block mb-1">
                📌 Note for Host Setup:
              </span>
              Please change or customize the <strong className="text-theme-accent font-semibold">Name of the room</strong> and <strong className="text-theme-accent font-semibold">Name of the device</strong> below to enter and host your broadcast so connecting listener devices can recognize your session.
            </div>
          </div>

          <div className="space-y-4">
            {/* Input 1: Name of the room (from sketch) */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-theme-muted mb-2 tracking-wider">
                Name of the room
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Living Room, Studio PC, Party Sound"
                className="w-full px-4 py-3.5 rounded-2xl bg-theme-bg border border-theme-border text-theme-text font-medium text-base outline-none focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20 transition-all"
              />
            </div>

            {/* Input 2: Name of the device (from sketch) */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-theme-muted mb-2 tracking-wider">
                Name of the device
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. Vardhan's Laptop, Main Rig"
                className="w-full px-4 py-3.5 rounded-2xl bg-theme-bg border border-theme-border text-theme-text font-medium text-base outline-none focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20 transition-all"
              />
            </div>

            {/* Audio Source Preference Selector */}
            <div className="pt-2">
              <label className="block text-xs font-mono font-semibold uppercase text-theme-muted mb-2 tracking-wider">
                Audio Source to Stream
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedSource('tab')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedSource === 'tab'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <ScreenShare className="w-4 h-4 mb-1" />
                  <div className="text-xs">Tab / Screen</div>
                  <div className="text-[10px] text-theme-muted">System sound</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSource('mic')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedSource === 'mic'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <Mic className="w-4 h-4 mb-1" />
                  <div className="text-xs">Microphone</div>
                  <div className="text-[10px] text-theme-muted">Voice relay</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSource('tone')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedSource === 'tone'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <Activity className="w-4 h-4 mb-1" />
                  <div className="text-xs">Latency Beep</div>
                  <div className="text-[10px] text-theme-muted">Sync test pulse</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSource('file')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedSource === 'file'
                      ? 'border-theme-accent bg-theme-accent/15 text-theme-accent font-bold'
                      : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                  }`}
                >
                  <FileAudio className="w-4 h-4 mb-1" />
                  <div className="text-xs">Audio File</div>
                  <div className="text-[10px] text-theme-muted">MP3 / WAV file</div>
                </button>
              </div>
            </div>
          </div>

          {/* Action Button from Sketch: "Share the audio (Tab/Screen) - Project to sound" */}
          <div className="pt-4">
            <button
              onClick={handleStartHosting}
              className="w-full group py-4 px-6 rounded-2xl font-bold font-display text-base text-theme-bg bg-theme-accent hover:bg-theme-accentHover shadow-[0_0_25px_var(--color-glow)] transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99]"
            >
              <ScreenShare className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Host Room & Start Broadcast</span>
              <span className="text-xs opacity-75 font-normal tracking-wide">
                — Project to sound
              </span>
            </button>
            <p className="text-xs text-center text-theme-muted mt-3">
              Generates a private 6-character room code & ultra-low latency WiFi channel.
            </p>
          </div>
        </div>
      ) : (
        /* STATE 2: Active Broadcasting Control Center */
        <div className="space-y-6">
          {/* Room Code & Share Card */}
          <div className="rounded-3xl bg-theme-surface border border-theme-accent/60 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-mono text-theme-muted uppercase tracking-wider">
                  Active Room Code
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-theme-accent tracking-widest px-4 py-2 rounded-2xl bg-theme-accent/10 border border-theme-accent/40 shadow-sm">
                    {roomCode}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    title="Copy direct join link"
                    className="p-3 rounded-2xl bg-theme-surfaceHover border border-theme-border text-theme-muted hover:text-theme-text hover:border-theme-accent transition-all"
                  >
                    {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-theme-muted mt-2">
                  Tell listeners to enter this code on their device or scan the QR code.
                </p>
              </div>

              {/* Status & Listeners Counter */}
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-theme-bg/80 border border-theme-border flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono text-theme-text">
                      {connectedListeners.length}
                    </div>
                    <div className="text-xs text-theme-muted font-medium">
                      Connected Devices
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Streaming Status Badge */}
            <div className="mt-5 pt-4 border-t border-theme-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="text-xs font-mono font-bold tracking-wider uppercase">
                  {isStreaming ? (
                    <span className="text-emerald-400">
                      LIVE BROADCAST ACTIVE ({selectedSource.toUpperCase()})
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      AUDIO PAUSED — SELECT SOURCE BELOW TO BROADCAST
                    </span>
                  )}
                </span>
              </div>

              {isStreaming && (
                <button
                  onClick={handleStopAudioStream}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                >
                  Pause Audio
                </button>
              )}
            </div>
          </div>

          {/* Audio Source Switcher */}
          <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold font-display uppercase tracking-wider text-theme-text">
              Select Audio Source to Stream
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Source 1: Tab / Screen */}
              <button
                onClick={() => handleStartAudioStream('tab')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedSource === 'tab' && isStreaming
                    ? 'border-theme-accent bg-theme-accent/15 text-theme-accent shadow-sm'
                    : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                }`}
              >
                <ScreenShare className="w-5 h-5 mb-2" />
                <div className="text-xs font-bold">Tab / Screen</div>
                <div className="text-[10px] text-theme-muted mt-0.5">Project system sound</div>
              </button>

              {/* Source 2: Microphone */}
              <button
                onClick={() => handleStartAudioStream('mic')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedSource === 'mic' && isStreaming
                    ? 'border-theme-accent bg-theme-accent/15 text-theme-accent shadow-sm'
                    : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                }`}
              >
                <Mic className="w-5 h-5 mb-2" />
                <div className="text-xs font-bold">Microphone</div>
                <div className="text-[10px] text-theme-muted mt-0.5">Line-in / Voice relay</div>
              </button>

              {/* Source 3: Local Music File */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedSource === 'file' && isStreaming
                    ? 'border-theme-accent bg-theme-accent/15 text-theme-accent shadow-sm'
                    : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                }`}
              >
                <FileAudio className="w-5 h-5 mb-2" />
                <div className="text-xs font-bold">Audio File</div>
                <div className="text-[10px] text-theme-muted mt-0.5">Stream MP3/WAV</div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Source 4: Latency Beep Test */}
              <button
                onClick={() => handleStartAudioStream('tone')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedSource === 'tone' && isStreaming
                    ? 'border-theme-accent bg-theme-accent/15 text-theme-accent shadow-sm'
                    : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                }`}
              >
                <Activity className="w-5 h-5 mb-2" />
                <div className="text-xs font-bold">Latency Beep</div>
                <div className="text-[10px] text-theme-muted mt-0.5">Rhythmic sync pulse</div>
              </button>
            </div>
          </div>

          {/* Live Audio Visualizer */}
          <AudioVisualizer
            analyserNode={audioEngine.getAnalyser()}
            isPlaying={isStreaming}
            height={110}
            barsCount={50}
          />

          {/* Volume Control */}
          <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-theme-muted uppercase tracking-wider">
                Host Broadcast Gain
              </span>
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
                max="2.0"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-theme-border rounded-lg appearance-none cursor-pointer accent-theme-accent"
              />
            </div>
          </div>

          {/* Connected Listeners List */}
          {connectedListeners.length > 0 && (
            <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 shadow-xl space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-theme-muted">
                Active Receiver Devices ({connectedListeners.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectedListeners.map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-2xl bg-theme-bg/60 border border-theme-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-semibold text-theme-text">
                        {l.deviceName}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-theme-accent font-bold">
                      ~{l.ping || 6}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code Modal for Phone Users */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={getJoinUrl()}
        roomCode={roomCode}
      />
    </div>
  );
}
