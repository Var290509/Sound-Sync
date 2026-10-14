import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import { audioEngine } from '../lib/audioEngine';
import { WebRTCHost } from '../lib/webrtc';
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
  Signal
} from 'lucide-react';

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
  const [audioVolume, setAudioVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [networkIp, setNetworkIp] = useState('localhost');
  const [localPort, setLocalPort] = useState(3001);

  const webRtcHostRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch local LAN network IP for quick mobile connect
  useEffect(() => {
    const apiBase = import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : '';
    fetch(`${apiBase}/api/network-info`)
      .then((res) => res.json())
      .then((data) => {
        if (data.primaryIp) setNetworkIp(data.primaryIp);
        if (data.port) setLocalPort(data.port);
      })
      .catch(() => {});
  }, []);

  // Listen to socket listener updates
  useEffect(() => {
    const handleListenerCountUpdate = ({ count, listeners }) => {
      setConnectedListeners(listeners || []);
    };

    socket.on('listener-count-update', handleListenerCountUpdate);

    return () => {
      socket.off('listener-count-update', handleListenerCountUpdate);
    };
  }, []);

  // Construct shareable link for mobile phones
  const getJoinUrl = () => {
    if (typeof window === 'undefined') return '';
    const port = window.location.port;
    const protocol = window.location.protocol;
    const host = networkIp && networkIp !== 'localhost' ? networkIp : window.location.hostname;
    return `${protocol}//${host}${port ? `:${port}` : ''}/?join=${roomCode}`;
  };

  // 1. Create Room & Start Hosting
  const handleStartHosting = async () => {
    if (!roomName.trim() || !deviceName.trim()) {
      setErrorMsg('Please enter both room name and device name.');
      return;
    }
    setErrorMsg('');

    socket.emit('create-room', { roomName, hostDeviceName: deviceName }, (res) => {
      if (res.success) {
        setRoomCode(res.roomCode);
        setIsHosting(true);

        // Initialize WebRTC Host controller
        webRtcHostRef.current = new WebRTCHost(() => audioEngine.getStream());
      } else {
        setErrorMsg('Failed to create room. Please try again.');
      }
    });
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
        stream = await audioEngine.startTestTone();
      }

      if (stream) {
        setIsStreaming(true);
        setSelectedSource(sourceType);

        // Update WebRTC track for all listeners
        if (webRtcHostRef.current) {
          webRtcHostRef.current.updateAudioTrack(stream);
        }

        // Notify server that host is active
        socket.emit('host-audio-state', {
          isStreaming: true,
          audioSource: sourceType,
        });
      }
    } catch (err) {
      console.error('Audio start error:', err);
      setErrorMsg(err.message || 'Could not start audio stream.');
    }
  };

  // Handle local file selection
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const stream = await audioEngine.playAudioFile(file, true);
      setIsStreaming(true);
      setSelectedSource('file');

      if (webRtcHostRef.current) {
        webRtcHostRef.current.updateAudioTrack(stream);
      }

      socket.emit('host-audio-state', {
        isStreaming: true,
        audioSource: 'file',
      });
    } catch (err) {
      setErrorMsg('Error reading audio file: ' + err.message);
    }
  };

  // Stop Audio Stream
  const handleStopAudioStream = () => {
    audioEngine.stopAll();
    setIsStreaming(false);
    socket.emit('host-audio-state', {
      isStreaming: false,
      audioSource: selectedSource,
    });
  };

  // Stop Entire Hosting Session
  const handleCloseSession = () => {
    handleStopAudioStream();
    if (webRtcHostRef.current) {
      webRtcHostRef.current.destroy();
      webRtcHostRef.current = null;
    }
    setIsHosting(false);
    setRoomCode('');
    setConnectedListeners([]);
    socket.disconnect();
    socket.connect();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getJoinUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-8">
      {/* Title Header matching Sketch 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-theme-border gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-theme-accent text-theme-bg mb-2">
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
          </div>

          {/* Action Button from Sketch: "Share the audio (Tab/Screen) - Project to sound" */}
          <div className="pt-4">
            <button
              onClick={handleStartHosting}
              className="w-full group py-4 px-6 rounded-2xl font-bold font-display text-base text-theme-bg bg-theme-accent hover:bg-theme-accentHover shadow-[0_0_25px_var(--color-glow)] transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99]"
            >
              <ScreenShare className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Share the audio (Tab / Screen)</span>
              <span className="text-xs opacity-75 font-normal tracking-wide">
                — Project to sound
              </span>
            </button>
            <p className="text-xs text-center text-theme-muted mt-3">
              Generates a private 6-character room code & low-latency WiFi channel.
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

              {/* Connected Listeners Counter */}
              <div className="p-4 rounded-2xl bg-theme-bg/80 border border-theme-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-theme-text">
                    {connectedListeners.length}
                  </div>
                  <div className="text-xs text-theme-muted font-medium">
                    Connected Listeners
                  </div>
                </div>
              </div>
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

              {/* Source 4: Latency Test Tone */}
              <button
                onClick={() => handleStartAudioStream('tone')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedSource === 'tone' && isStreaming
                    ? 'border-theme-accent bg-theme-accent/15 text-theme-accent shadow-sm'
                    : 'border-theme-border bg-theme-bg/60 text-theme-text hover:border-theme-borderHover'
                }`}
              >
                <Activity className="w-5 h-5 mb-2" />
                <div className="text-xs font-bold">Sync Test Tone</div>
                <div className="text-[10px] text-theme-muted mt-0.5">Verify zero latency</div>
              </button>
            </div>

            {/* Stream Status Bar & Stop Action */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <span className="text-xs font-mono font-medium text-theme-text">
                  {isStreaming ? `BROADCASTING LIVE (${selectedSource.toUpperCase()})` : 'STREAM PAUSED'}
                </span>
              </div>

              {isStreaming ? (
                <button
                  onClick={handleStopAudioStream}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop Stream</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStartAudioStream(selectedSource)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-theme-accent text-theme-bg hover:bg-theme-accentHover transition-all shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Audio Stream</span>
                </button>
              )}
            </div>
          </div>

          {/* Master Spectrum Visualizer */}
          <AudioVisualizer
            analyserNode={audioEngine.getAnalyser()}
            isPlaying={isStreaming}
            height={110}
            barsCount={54}
          />

          {/* Connected Listeners List */}
          <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold font-display uppercase tracking-wider text-theme-text flex items-center gap-2">
                <Users className="w-4 h-4 text-theme-accent" />
                <span>Connected Devices ({connectedListeners.length})</span>
              </h4>
              <span className="text-xs font-mono text-theme-muted">
                WiFi Peer-to-Peer
              </span>
            </div>

            {connectedListeners.length === 0 ? (
              <div className="p-8 rounded-2xl bg-theme-bg/40 border border-dashed border-theme-border text-center">
                <Wifi className="w-8 h-8 text-theme-muted/50 mx-auto mb-2" />
                <p className="text-xs text-theme-muted font-medium">
                  Waiting for devices to join on your WiFi...
                </p>
                <p className="text-[11px] text-theme-muted/70 mt-1">
                  Open Sound Sync on another device or scan the QR code.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {connectedListeners.map((listener) => (
                  <div
                    key={listener.socketId}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-theme-bg border border-theme-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-theme-accent/15 border border-theme-accent/30 text-theme-accent flex items-center justify-center font-bold text-xs">
                        {listener.deviceName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-theme-text">
                          {listener.deviceName}
                        </div>
                        <div className="text-[10px] font-mono text-theme-muted flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-400">● Streaming</span>
                          <span>•</span>
                          <span>WiFi Latency: ~12ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-theme-surface text-theme-accent border border-theme-border">
                        LOW LATENCY
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal for Mobile Phone Connection */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        joinUrl={getJoinUrl()}
        roomCode={roomCode}
      />
    </div>
  );
}
