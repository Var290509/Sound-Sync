import React from 'react';
import VercelLiquidHero from '../components/VercelLiquidHero';
import { 
  Radio, 
  Headphones, 
  Wifi, 
  Zap, 
  Volume2, 
  ShieldCheck, 
  ArrowRight, 
  Laptop, 
  Smartphone, 
  Speaker,
  BookOpen,
  HelpCircle,
  Cpu,
  Check,
  X,
  Sparkles
} from 'lucide-react';

export default function HomeView({ onSelectTab }) {
  const features = [
    {
      title: 'WiFi Low-Latency Streaming',
      subtitle: 'AudioRelay Experience in Browser',
      description: 'Stream uncompressed 48kHz audio directly between your computers, phones, and tablets over your local WiFi network with under 20ms latency.',
      icon: Wifi,
      badge: 'Zero Cables',
      image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80',
      actionText: 'Host a Stream',
      tab: 'host'
    },
    {
      title: 'Multi-Device Sound Relay',
      subtitle: 'Synchronized Playback',
      description: 'Connect multiple listeners simultaneously. Turn old phones into extra speakers or share music and movie audio to multiple headphones in sync.',
      icon: Headphones,
      badge: 'Multi-Room',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      actionText: 'Connect Device',
      tab: 'listener'
    },
    {
      title: 'Tab, Screen & Mic Audio',
      subtitle: 'Universal Sound Capture',
      description: 'Project sound from any YouTube tab, Netflix, Spotify, game, or DAW directly to your wireless devices with high fidelity Opus encoding.',
      icon: Radio,
      badge: 'Universal Input',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
      actionText: 'Start Broadcasting',
      tab: 'host'
    }
  ];

  const comparisonRows = [
    { feature: 'Physical Latency', soundSync: '2 - 10 ms (Sub-frame)', bluetooth: '150 - 250 ms', audioRelayApp: '30 - 60 ms', auxCable: '< 1 ms' },
    { feature: 'Installation Required', soundSync: 'None (Pure Web Browser)', bluetooth: 'Driver Pairing', audioRelayApp: 'Desktop + Mobile App', auxCable: 'Physical Cord' },
    { feature: 'Multi-Device Broadcast', soundSync: 'Yes (Unlimited Receivers)', bluetooth: 'No (Single Pair)', audioRelayApp: 'Paid License Only', auxCable: 'Splitter Hardware' },
    { feature: 'Wireless Range', soundSync: 'Entire WiFi Coverage (~50m)', bluetooth: 'Limited (~10m line of sight)', audioRelayApp: 'WiFi Coverage', auxCable: 'Cable Length (~1.5m)' },
    { feature: 'Audio Fidelity', soundSync: '48kHz Stereo Opus (256kbps)', bluetooth: '44.1kHz SBC (lossy)', audioRelayApp: '44.1kHz - 48kHz', auxCable: 'Analog Direct' },
    { feature: 'Cost & Licenses', soundSync: '100% Free & Open Web', bluetooth: 'Hardware Dependent', audioRelayApp: 'Freemium / Premium', auxCable: 'Hardware Cost' },
  ];

  return (
    <div className="space-y-14 sm:space-y-20 pb-20 text-theme-text">
      {/* Hero Section with Skiper12 Liquid Fluid Simulation */}
      <section className="pt-2 sm:pt-6">
        <div className="text-center max-w-3xl mx-auto mb-8 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-theme-accent/30 bg-theme-accent/10 text-theme-accent mb-4">
            <span className="w-2 h-2 rounded-full bg-theme-accent animate-ping" />
            <span>Next-Gen WiFi Audio Relay</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-theme-text">
            Sound Sync
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-theme-muted font-medium max-w-xl mx-auto">
            Connect to your surroundings and stream studio-grade audio to any device over WiFi.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-theme-muted/80 max-w-2xl mx-auto leading-relaxed">
            Experience real-time wireless audio relay with physical latency under 10ms. Turn any smartphone, tablet, or secondary laptop into a wireless headphone monitor or synchronized multi-room speaker system.
          </p>
        </div>

        {/* Skiper12 Animated Liquid Hero Simulation */}
        <VercelLiquidHero
          onEnterConnectingZone={() => onSelectTab('host')}
        />
      </section>

      {/* Two Quick Action Portals (Matching sketch options) */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portal 1: Share Audio (HOST) */}
        <div
          onClick={() => onSelectTab('host')}
          className="group cursor-pointer relative overflow-hidden rounded-3xl p-8 bg-theme-surface border border-theme-border hover:border-theme-accent transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_var(--color-glow)] hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Radio className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-theme-accent text-theme-bg">
              HOST
            </span>
          </div>

          <h3 className="text-2xl font-bold font-display text-theme-text group-hover:text-theme-accent transition-colors">
            Share Audio (HOST)
          </h3>
          <p className="mt-2 text-sm text-theme-muted leading-relaxed">
            Broadcast audio from your computer's browser tab, screen, microphone, or local playlist to other devices on your WiFi.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-theme-accent">
            <span>Create a room & broadcast</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Portal 2: Connect your device (Listener) */}
        <div
          onClick={() => onSelectTab('listener')}
          className="group cursor-pointer relative overflow-hidden rounded-3xl p-8 bg-theme-surface border border-theme-border hover:border-theme-accent transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_var(--color-glow)] hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Headphones className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full border border-theme-border bg-theme-surfaceHover text-theme-text">
              CLIENT
            </span>
          </div>

          <h3 className="text-2xl font-bold font-display text-theme-text group-hover:text-theme-accent transition-colors">
            Connect your device (Listener)
          </h3>
          <p className="mt-2 text-sm text-theme-muted leading-relaxed">
            Enter the 6-character room code or scan the host QR code to receive live crystal-clear audio with low latency.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-theme-accent">
            <span>Enter code to listen</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </section>

      {/* Editorial Overview Article: The Evolution of Wireless Audio Relay */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-theme-surface border border-theme-border p-8 sm:p-10 shadow-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-theme-accent/10 text-theme-accent border border-theme-accent/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Fidelity Audio Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display text-theme-text">
            Why WiFi Audio Relay Outperforms Traditional Bluetooth
          </h2>

          <div className="space-y-4 text-sm text-theme-muted leading-relaxed">
            <p>
              For decades, consumers have relied on Bluetooth to stream sound between phones, computers, and wireless headphones. While convenient, Bluetooth operates in the heavily congested 2.4 GHz spectrum with strict power constraints. Its standard SBC and AAC codecs compress digital audio into deep hardware buffers, creating an unavoidable <strong>150ms to 250ms delay</strong>. For YouTube videos, gaming, or musical composition, this latency causes distracting lip-sync misalignment and sluggish feedback.
            </p>
            <p>
              <strong>Sound Sync</strong> solves this architectural dilemma by shifting the entire audio transport layer to your local WiFi router. Over a modern 5GHz or 2.4GHz 802.11ac/ax WiFi network, bandwidth exceeds 300 to 1200 Mbps — thousands of times higher than Bluetooth. By utilizing <strong>WebRTC peer-to-peer data channels</strong> and native <strong>HTML5 Web Audio API</strong> hardware scheduling, Sound Sync transmits uncompressed 48kHz Opus frames in 5-millisecond packets.
            </p>
            <p>
              The result is a transparent acoustic relay with a physical transit delay between <strong>2 and 10 milliseconds</strong>. What you see on your computer screen aligns perfectly with what you hear in your headphones.
            </p>
          </div>
        </div>
      </section>

      {/* Related Photos & Features */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-theme-text">
            Experience Wireless Sound Relay
          </h2>
          <p className="text-sm text-theme-muted mt-2 font-medium">
            Designed for low latency, zero hardware dongles, and pure acoustic precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group overflow-hidden rounded-3xl bg-theme-surface border border-theme-border hover:border-theme-accent/70 transition-all duration-300 shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Photo Showcase */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={feat.image}
                      alt={feat.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-surface via-theme-surface/30 to-transparent" />
                    <span className="absolute top-4 right-4 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-theme-surface/90 text-theme-accent border border-theme-border backdrop-blur-md">
                      {feat.badge}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="w-10 h-10 rounded-xl bg-theme-accent/15 border border-theme-accent/30 text-theme-accent flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold font-display text-theme-text">
                      {feat.title}
                    </h4>
                    <p className="text-xs font-mono text-theme-accent mt-0.5">
                      {feat.subtitle}
                    </p>
                    <p className="text-xs text-theme-muted mt-2.5 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => onSelectTab(feat.tab)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-theme-surfaceHover text-theme-text hover:text-theme-accent hover:border-theme-accent border border-theme-border transition-all flex items-center justify-center gap-2"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Comparison Matrix */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-10 shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-theme-text">
              Technical Comparison: Sound Sync vs Alternatives
            </h2>
            <p className="text-xs sm:text-sm text-theme-muted">
              How our browser-native WebRTC relay compares against traditional Bluetooth, desktop apps, and physical cables.
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border border-theme-border rounded-2xl overflow-hidden">
              <thead className="bg-theme-bg/80 border-b border-theme-border font-mono text-theme-accent uppercase">
                <tr>
                  <th className="p-3.5">Feature</th>
                  <th className="p-3.5 bg-theme-accent/10 text-theme-accent font-bold">Sound Sync (WiFi)</th>
                  <th className="p-3.5">Bluetooth 5.0 (SBC)</th>
                  <th className="p-3.5">AudioRelay App</th>
                  <th className="p-3.5">3.5mm AUX Cable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border/60 text-theme-muted">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-theme-surfaceHover/50 transition-colors">
                    <td className="p-3.5 font-semibold text-theme-text whitespace-nowrap">{row.feature}</td>
                    <td className="p-3.5 bg-theme-accent/5 font-semibold text-theme-accent whitespace-nowrap">{row.soundSync}</td>
                    <td className="p-3.5 whitespace-nowrap">{row.bluetooth}</td>
                    <td className="p-3.5 whitespace-nowrap">{row.audioRelayApp}</td>
                    <td className="p-3.5 whitespace-nowrap">{row.auxCable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-theme-surface border border-theme-border p-8 sm:p-10 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold font-display text-theme-text text-center mb-8">
            How Sound Sync Works Over WiFi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border/60">
              <div className="w-10 h-10 rounded-full bg-theme-accent text-theme-bg font-mono font-bold flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h5 className="font-bold text-sm text-theme-text">Host Audio Stream</h5>
              <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                Open "Share Audio", give your room a name, and choose Tab, Screen, or Mic.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border/60">
              <div className="w-10 h-10 rounded-full bg-theme-accent text-theme-bg font-mono font-bold flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h5 className="font-bold text-sm text-theme-text">Scan or Enter Code</h5>
              <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                Open Sound Sync on your phone or tablet on the same WiFi and enter the 6-character room code.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border/60">
              <div className="w-10 h-10 rounded-full bg-theme-accent text-theme-bg font-mono font-bold flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h5 className="font-bold text-sm text-theme-text">Listen in Real-Time</h5>
              <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                Sound streams instantly with sub-20ms latency and high-definition Opus acoustics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards to Documentation & Support */}
      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          onClick={() => onSelectTab('guide')}
          className="group cursor-pointer p-6 rounded-3xl bg-theme-surface border border-theme-border hover:border-theme-accent transition-all shadow-md space-y-2"
        >
          <BookOpen className="w-6 h-6 text-theme-accent mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-base text-theme-text group-hover:text-theme-accent transition-colors">
            User Guide & Documentation
          </h4>
          <p className="text-xs text-theme-muted leading-relaxed">
            Step-by-step instructions for streaming Chrome tabs, microphones, and tuning buffer modes.
          </p>
          <span className="text-xs font-semibold text-theme-accent flex items-center gap-1 pt-2">
            Read documentation <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onSelectTab('faq')}
          className="group cursor-pointer p-6 rounded-3xl bg-theme-surface border border-theme-border hover:border-theme-accent transition-all shadow-md space-y-2"
        >
          <HelpCircle className="w-6 h-6 text-theme-accent mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-base text-theme-text group-hover:text-theme-accent transition-colors">
            FAQ & Troubleshooting
          </h4>
          <p className="text-xs text-theme-muted leading-relaxed">
            Resolving AP isolation, mobile autoplay permissions, and connection diagnostics.
          </p>
          <span className="text-xs font-semibold text-theme-accent flex items-center gap-1 pt-2">
            View FAQ <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onSelectTab('about')}
          className="group cursor-pointer p-6 rounded-3xl bg-theme-surface border border-theme-border hover:border-theme-accent transition-all shadow-md space-y-2"
        >
          <Cpu className="w-6 h-6 text-theme-accent mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-base text-theme-text group-hover:text-theme-accent transition-colors">
            About VIK-V-VKS
          </h4>
          <p className="text-xs text-theme-muted leading-relaxed">
            Meet the 7 engineering creators behind Sound Sync and explore our technical architecture.
          </p>
          <span className="text-xs font-semibold text-theme-accent flex items-center gap-1 pt-2">
            Meet the team <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </section>
    </div>
  );
}
