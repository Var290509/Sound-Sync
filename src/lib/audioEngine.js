/**
 * AudioEngine - Web Audio API coordinator for Sound Sync
 * Handles multi-source audio capture, 48kHz stereo processing,
 * ultra-low-latency scheduling, and real-time visualizer analysis.
 */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.gainNode = null;
    this.currentStream = null;
    this.mediaStreamSource = null;
    this.streamDestination = null;
    this.silentSource = null;
    this.fileSource = null;
    this.oscillator = null;
    this.isToneActive = false;
    this.volume = 1.0;
    this.isMuted = false;
    this.onPcmChunk = null; // Callback for binary audio chunk fallback
    this.processorNode = null;
  }

  // Ensure AudioContext is initialized and unlocked by user interaction
  async initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass({
        latencyHint: 'interactive',
        sampleRate: 48000,
      });

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.6; // Snappier response

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

      this.streamDestination = this.audioCtx.createMediaStreamDestination();

      // Chain: source -> gain -> analyser -> streamDestination
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.streamDestination);

      // Attach continuous silent carrier so streamDestination.stream ALWAYS has an active audio track
      this.startSilentCarrier();

      // Setup PCM chunk processor for binary fallback streaming
      this.setupPcmProcessor();
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Creates a zero-volume continuous source to keep track active from second zero
  startSilentCarrier() {
    try {
      const osc = this.audioCtx.createOscillator();
      const silentGain = this.audioCtx.createGain();
      silentGain.gain.setValueAtTime(0.0, this.audioCtx.currentTime); // 100% silent zero-amplitude carrier
      osc.connect(silentGain);
      silentGain.connect(this.streamDestination);
      osc.start();
      this.silentSource = osc;
    } catch (e) {
      console.warn('Silent carrier initialization warning:', e);
    }
  }

  // Setup ScriptProcessor to sample audio chunks for WebSocket fallback streaming
  setupPcmProcessor() {
    try {
      // Buffer size 1024 at 48kHz is ~21ms of audio (ultra-low latency)
      const bufferSize = 1024;
      const processor = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
      this.analyser.connect(processor);
      // ScriptProcessor requires connection to destination to fire onaudioprocess
      const nullGain = this.audioCtx.createGain();
      nullGain.gain.value = 0;
      processor.connect(nullGain);
      nullGain.connect(this.audioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (typeof this.onPcmChunk === 'function') {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32 to Int16 PCM for compact, fast network transfer
          const pcm16 = new Int16Array(inputData.length);
          let hasAudio = false;
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            if (Math.abs(pcm16[i]) > 50) hasAudio = true;
          }
          if (hasAudio) {
            this.onPcmChunk(pcm16.buffer);
          }
        }
      };
      this.processorNode = processor;
    } catch (err) {
      console.warn('PCM processor setup warning:', err);
    }
  }

  getAudioContext() {
    return this.audioCtx;
  }

  getAnalyser() {
    return this.analyser;
  }

  getStream() {
    return this.streamDestination ? this.streamDestination.stream : null;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(2.0, val));
    if (this.gainNode && this.audioCtx) {
      const target = this.isMuted ? 0 : this.volume;
      this.gainNode.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.01);
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.gainNode && this.audioCtx) {
      const target = this.isMuted ? 0 : this.volume;
      this.gainNode.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.01);
    }
  }

  // 1. Capture Tab / Screen Audio
  async captureDisplayMedia() {
    await this.initContext();
    this.cleanupCurrentSources();

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 2,
          sampleRate: 48000,
        },
      });

      const audioTracks = displayStream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        displayStream.getTracks().forEach((t) => t.stop());
        throw new Error(
          'No audio track detected! Make sure you check "Share audio" or "Share system audio" in the browser share dialog.'
        );
      }

      // Immediately stop video tracks to completely free WiFi bandwidth and CPU for audio
      displayStream.getVideoTracks().forEach((vt) => {
        try { vt.stop(); } catch (e) {}
      });

      this.currentStream = displayStream;
      this.mediaStreamSource = this.audioCtx.createMediaStreamSource(
        new MediaStream([audioTracks[0]])
      );
      this.mediaStreamSource.connect(this.gainNode);

      // Listen for when user clicks "Stop sharing" on the browser banner
      audioTracks[0].onended = () => {
        this.cleanupCurrentSources();
      };

      return this.getStream();
    } catch (err) {
      console.error('Failed to capture display media audio:', err);
      throw err;
    }
  }

  // 2. Capture Microphone / Line-in Audio
  async captureMicrophone() {
    await this.initContext();
    this.cleanupCurrentSources();

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 2,
          sampleRate: 48000,
        },
      });

      this.currentStream = micStream;
      this.mediaStreamSource = this.audioCtx.createMediaStreamSource(micStream);
      this.mediaStreamSource.connect(this.gainNode);

      return this.getStream();
    } catch (err) {
      console.error('Failed to capture microphone:', err);
      throw err;
    }
  }

  // 3. Play Local Audio File and Stream
  async playAudioFile(file, shouldPlayLocally = true) {
    await this.initContext();
    this.cleanupCurrentSources();

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

    const bufferSource = this.audioCtx.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.loop = true;

    bufferSource.connect(this.gainNode);
    if (shouldPlayLocally) {
      this.gainNode.connect(this.audioCtx.destination);
    }

    bufferSource.start(0);
    this.fileSource = bufferSource;

    return this.getStream();
  }

  // 4. Start Latency Test Tone (Rhythmic Beeps for measuring physical latency)
  async startTestTone() {
    await this.initContext();
    this.cleanupCurrentSources();

    const osc = this.audioCtx.createOscillator();
    const pulseGain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // High clear A5 note

    pulseGain.gain.setValueAtTime(0, this.audioCtx.currentTime);

    // Schedule rhythmic pulses every 1.0 second (clear 100ms blip)
    const scheduleBeeps = () => {
      if (!this.isToneActive || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      pulseGain.gain.setValueAtTime(0, now);
      pulseGain.gain.linearRampToValueAtTime(0.8, now + 0.01);
      pulseGain.gain.linearRampToValueAtTime(0, now + 0.12);
    };

    scheduleBeeps();
    const interval = setInterval(scheduleBeeps, 1000);
    this.toneInterval = interval;
    this.isToneActive = true;

    osc.connect(pulseGain);
    pulseGain.connect(this.gainNode);
    osc.start();

    this.oscillator = osc;
    return this.getStream();
  }

  cleanupCurrentSources() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((t) => t.stop());
      this.currentStream = null;
    }
    if (this.mediaStreamSource) {
      try {
        this.mediaStreamSource.disconnect();
      } catch (e) {}
      this.mediaStreamSource = null;
    }
    if (this.fileSource) {
      try {
        this.fileSource.stop();
        this.fileSource.disconnect();
      } catch (e) {}
      this.fileSource = null;
    }
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {}
      this.oscillator = null;
    }
    if (this.toneInterval) {
      clearInterval(this.toneInterval);
      this.toneInterval = null;
    }
    this.isToneActive = false;
  }

  stopAll() {
    this.cleanupCurrentSources();
    if (this.gainNode && this.audioCtx) {
      try {
        this.gainNode.disconnect(this.audioCtx.destination);
      } catch (e) {}
    }
  }
}

export const audioEngine = new AudioEngine();
