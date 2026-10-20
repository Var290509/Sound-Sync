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
      this.analyser.smoothingTimeConstant = 0.6; // Snappy visualizer response

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

      this.streamDestination = this.audioCtx.createMediaStreamDestination();

      // Main audio pipeline: sources -> gainNode -> analyser -> streamDestination
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.streamDestination);

      // Attach continuous silent carrier so streamDestination.stream ALWAYS has an active audio track
      this.startSilentCarrier();
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Creates an inaudible continuous carrier to keep the WebRTC audio track permanently alive
  startSilentCarrier() {
    try {
      const osc = this.audioCtx.createOscillator();
      const silentGain = this.audioCtx.createGain();
      // 0.00001 is -100dB (inaudible), preventing WebRTC silence suppression (DTX) from putting track to sleep
      silentGain.gain.setValueAtTime(0.00001, this.audioCtx.currentTime);
      osc.connect(silentGain);
      silentGain.connect(this.streamDestination);
      osc.start();
      this.silentSource = osc;
    } catch (e) {
      console.warn('Silent carrier initialization warning:', e);
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
          'No audio track detected! In the screen share dialog, select "Chrome Tab" and make sure the "Also share tab audio" switch is turned ON.'
        );
      }

      // DO NOT call vt.stop()! In Chrome, stopping the video track terminates the screen share session!
      // Instead, disable video rendering to save CPU/GPU:
      displayStream.getVideoTracks().forEach((vt) => {
        vt.enabled = false;
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
