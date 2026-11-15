import React from 'react';
import { 
  Users, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Radio, 
  Headphones, 
  Code, 
  Heart, 
  Layers, 
  Zap,
  ArrowRight
} from 'lucide-react';

export default function AboutView({ onSelectTab }) {
  // The 7 members specified in the project signature:
  // V - Vitesh
  // I - Ishitwa
  // K - Kowshik
  // V - Vardhan
  // V - Varshith
  // K - Karthik
  // S - Srinidhi
  const teamMembers = [
    {
      letter: 'V',
      name: 'Vitesh',
      role: 'System Architect',
      description: 'Engineered the high-concurrency WebRTC peer mesh and client-side signaling relay architecture.'
    },
    {
      letter: 'I',
      name: 'Ishitwa',
      role: 'DSP & Audio Engineer',
      description: 'Specialized in Opus 48kHz audio packetization, jitter buffer algorithms, and digital signal processing.'
    },
    {
      letter: 'K',
      name: 'Kowshik',
      role: 'Network Protocols Lead',
      description: 'Optimized STUN/NAT traversal, carrier-grade network routing, and low-latency WiFi frame transmission.'
    },
    {
      letter: 'V',
      name: 'Vardhan',
      role: 'Full-Stack Developer',
      description: 'Built the real-time Web Audio API pipeline, responsive UI controls, and deployment automation.'
    },
    {
      letter: 'V',
      name: 'Varshith',
      role: 'UI/UX & Visual Designer',
      description: 'Created the Skiper12 fluid dynamics theme, intuitive segmented inputs, and accessible sound visualizers.'
    },
    {
      letter: 'K',
      name: 'Karthik',
      role: 'Audio Protocol Specialist',
      description: 'Engineered WebRTC SDP offer/answer munging, 5ms Opus frame sizing, and buffer mode synchronization.'
    },
    {
      letter: 'S',
      name: 'Srinidhi',
      role: 'Quality & Optimization',
      description: 'Tested cross-device browser compatibility across Android, iOS, Windows, macOS, and Linux hardware.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-16 text-theme-text">
      {/* View Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-theme-accent/30 bg-theme-accent/10 text-theme-accent">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Vision Behind Sound Sync</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-theme-text">
          About Sound Sync & VIK-V-VKS
        </h1>
        <p className="text-base sm:text-lg text-theme-muted max-w-2xl mx-auto">
          Crafted with passion to free digital sound from proprietary cables, dongles, and Bluetooth delay.
        </p>
      </div>

      {/* Mission & Background */}
      <section className="rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-10 shadow-xl space-y-6">
        <h2 className="text-2xl font-bold font-display text-theme-text">
          Our Mission: Audio Freedom for Every Device
        </h2>
        <div className="space-y-4 text-sm text-theme-muted leading-relaxed">
          <p>
            In today's digital world, millions of users own multiple smart devices: desktop PCs, laptops, mobile phones, tablets, and smart speakers. Yet connecting sound between them often requires frustrating Bluetooth pairing that disconnects across rooms, carries 200ms of lag that ruins movie lip-sync, or demands proprietary commercial desktop utilities that cost money and run heavy background drivers.
          </p>
          <p>
            <strong>Sound Sync</strong> was founded by a passionate team of student engineers and audio enthusiasts known as <strong>VIK-V-VKS (sharp & rythamic)</strong>. Our goal was simple: <em>build a zero-install, 100% web-native, open-source audio relay that works right inside the browser with physical latency under 10 milliseconds.</em>
          </p>
          <p>
            By leveraging cutting-edge web standards like WebRTC, HTML5 Web Audio API, and the Opus interactive speech and audio codec, Sound Sync transforms any web browser into a professional wireless audio transmitter or receiver in one click.
          </p>
        </div>
      </section>

      {/* Core Engineering Pillars */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-display text-theme-text">
            Core Engineering Principles
          </h2>
          <p className="text-xs text-theme-muted mt-1">
            Built from first principles for performance, privacy, and acoustic fidelity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-theme-text font-display">Sub-10ms Latency</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              We eliminated legacy media player buffering by clamping WebRTC jitter buffers down to 5ms and scheduling audio directly on the hardware sound card.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-theme-text font-display">Zero Cloud Storage</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Your audio never leaves your local network. WebRTC streams are direct peer-to-peer and encrypted with DTLS/SRTP end-to-end security.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-theme-text font-display">Universal Compatibility</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              No native apps or APK installations required. Runs seamlessly on Windows, macOS, Android, iOS, iPadOS, Linux, and Chromium browsers.
            </p>
          </div>
        </div>
      </section>

      {/* The 7 Creators: VIK-V-VKS */}
      <section className="rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-10 shadow-xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-theme-accent/10 text-theme-accent border border-theme-accent/30 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>The Engineering Team</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-theme-text">
            Meet the Creators: VIK-V-VKS
          </h2>
          <p className="text-xs text-theme-muted mt-1 italic">
            "sharp & rythamic" — Seven creators united by sound engineering and web innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-theme-bg/60 border border-theme-border/80 hover:border-theme-accent/60 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-theme-accent text-theme-bg font-mono font-bold flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {member.letter}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-theme-surface border border-theme-border text-theme-accent">
                  {member.role}
                </span>
              </div>
              <h4 className="text-base font-bold font-display text-theme-text pt-1">
                {member.name}
              </h4>
              <p className="text-xs text-theme-muted leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack Details */}
      <section className="rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-xl font-bold font-display text-theme-text flex items-center gap-2">
          <Code className="w-5 h-5 text-theme-accent" />
          <span>Technical Architecture & Open Standards</span>
        </h3>
        <p className="text-sm text-theme-muted leading-relaxed">
          Sound Sync is engineered using high-performance, modern web technologies:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-theme-bg/60 border border-theme-border text-center">
            <span className="text-xs font-mono font-bold text-theme-accent block">React 18</span>
            <span className="text-[10px] text-theme-muted">Declarative UI</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-theme-bg/60 border border-theme-border text-center">
            <span className="text-xs font-mono font-bold text-theme-accent block">WebRTC 1.0</span>
            <span className="text-[10px] text-theme-muted">P2P Media & Data</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-theme-bg/60 border border-theme-border text-center">
            <span className="text-xs font-mono font-bold text-theme-accent block">Web Audio API</span>
            <span className="text-[10px] text-theme-muted">48kHz Audio Graph</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-theme-bg/60 border border-theme-border text-center">
            <span className="text-xs font-mono font-bold text-theme-accent block">Three.js</span>
            <span className="text-[10px] text-theme-muted">Fluid Simulation</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="p-8 rounded-3xl bg-theme-surface border border-theme-accent/60 text-center space-y-4 shadow-xl">
        <h3 className="text-2xl font-bold font-display text-theme-text">
          Ready to experience low-latency sound?
        </h3>
        <p className="text-xs sm:text-sm text-theme-muted max-w-md mx-auto">
          Start broadcasting audio from your computer or connect your phone right now.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onSelectTab('host')}
            className="px-6 py-3 rounded-2xl font-bold font-display text-sm text-theme-bg bg-theme-accent hover:bg-theme-accentHover transition-all shadow-md flex items-center gap-2"
          >
            <span>Host a Stream</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectTab('listener')}
            className="px-6 py-3 rounded-2xl font-bold font-display text-sm bg-theme-surfaceHover text-theme-text hover:border-theme-accent border border-theme-border transition-all"
          >
            Connect Listener
          </button>
        </div>
      </div>
    </div>
  );
}
