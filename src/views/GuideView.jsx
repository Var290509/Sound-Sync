import React from 'react';
import { 
  BookOpen, 
  Wifi, 
  Radio, 
  Headphones, 
  Sliders, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  Volume2,
  Laptop,
  Smartphone
} from 'lucide-react';

export default function GuideView({ onSelectTab }) {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-16 text-theme-text">
      {/* Header Banner */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-theme-accent/30 bg-theme-accent/10 text-theme-accent">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Complete Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-theme-text">
          User Guide & Audio Architecture
        </h1>
        <p className="text-base sm:text-lg text-theme-muted max-w-2xl mx-auto">
          Learn how to stream ultra-low latency audio across your devices over local WiFi with Sound Sync.
        </p>
      </div>

      {/* Table of Contents */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-md">
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-theme-accent mb-4">
          Guide Contents
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <a href="#how-it-works" className="flex items-center gap-2 text-theme-muted hover:text-theme-accent transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
            <span>1. How Sound Sync Works (Audio over WiFi)</span>
          </a>
          <a href="#host-setup" className="flex items-center gap-2 text-theme-muted hover:text-theme-accent transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
            <span>2. Host Setup: Tab, Screen, Mic & File</span>
          </a>
          <a href="#listener-setup" className="flex items-center gap-2 text-theme-muted hover:text-theme-accent transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
            <span>3. Receiver / Listener Setup on Phones & PCs</span>
          </a>
          <a href="#latency-tuning" className="flex items-center gap-2 text-theme-muted hover:text-theme-accent transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
            <span>4. Latency Optimization & Buffer Modes</span>
          </a>
          <a href="#audio-specs" className="flex items-center gap-2 text-theme-muted hover:text-theme-accent transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
            <span>5. Audio Specifications & Opus Codec</span>
          </a>
          <a href="#use-cases" className="flex items-center gap-2 text-theme-muted hover:text-theme-accent transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
            <span>6. Real-World Use Cases</span>
          </a>
        </div>
      </div>

      {/* Section 1: How It Works */}
      <section id="how-it-works" className="space-y-4 rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center font-bold">
            1
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-theme-text">
            How Sound Sync Works (Audio over WiFi Architecture)
          </h2>
        </div>

        <p className="text-sm text-theme-muted leading-relaxed">
          Traditional wireless audio transmission relies on Bluetooth, which suffers from strict distance limits (typically 10 meters), audio compression artifacts, and inherent hardware latency of 150ms to 300ms. Sound Sync bypasses these hardware limitations by utilizing your local Wireless Area Network (WLAN / WiFi) combined with peer-to-peer <strong>WebRTC (Web Real-Time Communication)</strong> technology.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border">
            <Cpu className="w-5 h-5 text-theme-accent mb-2" />
            <h4 className="font-bold text-sm text-theme-text">1. Audio Capture</h4>
            <p className="text-xs text-theme-muted mt-1 leading-relaxed">
              The host captures audio directly from browser tabs, desktop outputs, or microphones at pristine 48kHz sampling rates using the HTML5 Web Audio API.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border">
            <Wifi className="w-5 h-5 text-theme-accent mb-2" />
            <h4 className="font-bold text-sm text-theme-text">2. P2P Direct Relay</h4>
            <p className="text-xs text-theme-muted mt-1 leading-relaxed">
              Audio packets travel directly over your local WiFi router via encrypted DTLS/SRTP WebRTC peer connections without traversing distant media servers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border">
            <Zap className="w-5 h-5 text-theme-accent mb-2" />
            <h4 className="font-bold text-sm text-theme-text">3. Hardware Playback</h4>
            <p className="text-xs text-theme-muted mt-1 leading-relaxed">
              Receiver devices decode the stream via native AudioContext hardware destinations with custom jitter buffer tuning down to 5 milliseconds.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Host Setup */}
      <section id="host-setup" className="space-y-4 rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center font-bold">
            2
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-theme-text">
            Host Setup: Streaming Tab, Screen, Mic, or Files
          </h2>
        </div>

        <p className="text-sm text-theme-muted leading-relaxed">
          Hosting an audio broadcast takes seconds and requires no server installation, driver downloads, or admin privileges.
        </p>

        <div className="space-y-3 pt-2">
          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-theme-text">Step 1: Open Transmitter Mode</h4>
              <p className="text-xs text-theme-muted mt-0.5">
                Navigate to the <strong>Host</strong> tab. Enter a recognizable Room Name (e.g. "Living Room PC") and Device Name.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-theme-text">Step 2: Choose Your Audio Source</h4>
              <ul className="text-xs text-theme-muted mt-1 space-y-1 list-disc list-inside">
                <li><strong>Tab / Screen</strong>: When prompted by your browser, pick the specific Chrome tab (YouTube, Spotify, video) and ensure the <em>"Also share tab audio"</em> switch is toggled ON.</li>
                <li><strong>Microphone</strong>: Stream live speech, presentations, or audio input from connected USB microphones and mixers.</li>
                <li><strong>Audio File</strong>: Pick local MP3, WAV, FLAC, or AAC files from your disk for zero-latency local music playback.</li>
                <li><strong>Latency Beep</strong>: Transmits a precise rhythmic test tone to measure and visually verify acoustic delay.</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-theme-text">Step 3: Share Room Code or QR Code</h4>
              <p className="text-xs text-theme-muted mt-0.5">
                Click <strong>"Host Room & Start Broadcast"</strong>. Your private 6-character room code will be displayed. You can also click <strong>"Mobile QR"</strong> for mobile phones to connect in one tap.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onSelectTab('host')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-theme-accent text-theme-bg hover:bg-theme-accentHover transition-all shadow-md"
          >
            <span>Launch Host Screen Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Section 3: Listener Setup */}
      <section id="listener-setup" className="space-y-4 rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center font-bold">
            3
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-theme-text">
            Receiver / Listener Setup on Phones & PCs
          </h2>
        </div>

        <p className="text-sm text-theme-muted leading-relaxed">
          Any device with a modern web browser can act as a sound receiver — including Android phones, iPhones, iPads, MacBooks, Windows PCs, and smart TVs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-theme-bg/60 border border-theme-border space-y-2">
            <Smartphone className="w-6 h-6 text-theme-accent" />
            <h4 className="font-bold text-sm text-theme-text">Connecting from a Mobile Phone</h4>
            <ol className="text-xs text-theme-muted space-y-1.5 list-decimal list-inside">
              <li>Ensure your phone is connected to the same WiFi as the host machine.</li>
              <li>Scan the host screen's QR code or open Sound Sync and tap <strong>Connect (Listener)</strong>.</li>
              <li>Enter the 6-character code and tap <strong>Connect</strong>.</li>
              <li>If prompted by iOS/Android autoplay policy, tap <em>"Unmute & Play Audio"</em> to allow hardware playback.</li>
            </ol>
          </div>

          <div className="p-5 rounded-2xl bg-theme-bg/60 border border-theme-border space-y-2">
            <Laptop className="w-6 h-6 text-theme-accent" />
            <h4 className="font-bold text-sm text-theme-text">Connecting from a Second PC / Laptop</h4>
            <ol className="text-xs text-theme-muted space-y-1.5 list-decimal list-inside">
              <li>Open Sound Sync on the secondary computer.</li>
              <li>Click <strong>Connect your device (Listener)</strong>.</li>
              <li>Type the 6-character code and click <strong>Connect</strong>.</li>
              <li>Plug your external studio speakers or headphones into the headphone jack.</li>
            </ol>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onSelectTab('listener')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-theme-accent text-theme-bg hover:bg-theme-accentHover transition-all shadow-md"
          >
            <span>Open Listener Screen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Section 4: Latency Tuning & Buffer Modes */}
      <section id="latency-tuning" className="space-y-4 rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center font-bold">
            4
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-theme-text">
            Latency Optimization & Buffer Modes
          </h2>
        </div>

        <p className="text-sm text-theme-muted leading-relaxed">
          Sound Sync gives you full real-time control over the audio jitter buffer. You can tune your latency profile depending on whether you are gaming, watching movies, or hosting a multi-room house party:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-accent/50 space-y-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-theme-accent/20 text-theme-accent">
              5 - 10 ms
            </span>
            <h4 className="font-bold text-sm text-theme-text">Ultra-Low Mode</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Minimum jitter buffer target (0.005s). Designed for competitive gaming, musical instrument monitoring, and video sync with zero perceptible lip-sync delay. Requires clean 5GHz WiFi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border space-y-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-theme-surfaceHover text-theme-text">
              20 - 30 ms
            </span>
            <h4 className="font-bold text-sm text-theme-text">Balanced Mode</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Default operational mode (0.025s buffer). Absorbs occasional WiFi packet retransmissions while maintaining undetectable delay for YouTube videos, podcasts, and daily streaming.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border space-y-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-theme-surfaceHover text-theme-text">
              60 - 80 ms
            </span>
            <h4 className="font-bold text-sm text-theme-text">High Stability Mode</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Deep packet queue (0.070s buffer). Prevents audio dropouts in congested 2.4GHz WiFi environments or when streaming music across multiple rooms through thick walls.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Audio Specifications */}
      <section id="audio-specs" className="space-y-4 rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center font-bold">
            5
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-theme-text">
            Audio Specifications & Opus Codec Implementation
          </h2>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border border-theme-border rounded-2xl overflow-hidden">
            <thead className="bg-theme-bg/80 border-b border-theme-border font-mono text-theme-accent uppercase">
              <tr>
                <th className="p-3">Specification</th>
                <th className="p-3">Sound Sync Configuration</th>
                <th className="p-3">Standard Bluetooth (SBC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border/60 text-theme-muted">
              <tr>
                <td className="p-3 font-semibold text-theme-text">Audio Codec</td>
                <td className="p-3 text-theme-accent font-mono font-semibold">Opus (RFC 6716)</td>
                <td className="p-3">Legacy SBC / AAC</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-theme-text">Sampling Rate</td>
                <td className="p-3 font-mono">48,000 Hz (48 kHz Studio)</td>
                <td className="p-3 font-mono">44.1 kHz</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-theme-text">Channel Configuration</td>
                <td className="p-3 font-mono">Full Stereo (2 channels)</td>
                <td className="p-3 font-mono">Stereo / Joint Stereo</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-theme-text">Max Bitrate</td>
                <td className="p-3 font-mono">256 kbps Variable/CBR</td>
                <td className="p-3 font-mono">Up to 328 kbps (lossy)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-theme-text">Packet Frame Size</td>
                <td className="p-3 text-theme-accent font-mono font-semibold">5 ms (Ultra-Fast)</td>
                <td className="p-3 font-mono">50 - 150 ms</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-theme-text">Typical Latency</td>
                <td className="p-3 text-emerald-400 font-mono font-bold">~2 to 10 ms (WiFi)</td>
                <td className="p-3 font-mono text-rose-400">150 to 250 ms</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-theme-text">Max Simultaneous Listeners</td>
                <td className="p-3 font-mono">Unlimited (WiFi bandwidth dependent)</td>
                <td className="p-3 font-mono">1 to 2 devices</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6: Real-World Use Cases */}
      <section id="use-cases" className="space-y-4 rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center font-bold">
            6
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-theme-text">
            Popular Real-World Use Cases
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border space-y-1.5">
            <h4 className="font-bold text-sm text-theme-text">Late Night Movie Listening</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Watch movies on your large PC or smart TV without waking family or roommates. Stream the TV audio directly to your phone with your favorite wired earbuds.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border space-y-1.5">
            <h4 className="font-bold text-sm text-theme-text">Turn Old Phone into Desktop Speaker</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Have an old phone or tablet sitting in a drawer? Prop it on your desk, connect to Sound Sync, and use its speakers as an instant dedicated wireless computer monitor.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border space-y-1.5">
            <h4 className="font-bold text-sm text-theme-text">Multi-Room Party Sound</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Place multiple phones connected to Bluetooth or AUX speakers across your living room, kitchen, and patio. Broadcast music from your laptop for synchronized multi-room sound.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border space-y-1.5">
            <h4 className="font-bold text-sm text-theme-text">Wireless Audio Relay for Musicians</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Check mixes from your digital audio workstation (DAW) in real-time on real phone speakers and consumer earbuds without exporting and transferring MP3 files.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
