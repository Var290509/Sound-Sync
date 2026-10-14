import React from 'react';
import VercelLiquidHero from '../components/VercelLiquidHero';
import { Radio, Headphones, Wifi, Zap, Volume2, ShieldCheck, ArrowRight, Laptop, Smartphone, Speaker } from 'lucide-react';

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

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section with Skiper12 Liquid Fluid Simulation (Center Triangle replaced with Music Lines) */}
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
              LISTENER
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

      {/* Related Photos & Features (Requested in sketch: "Add some related photos about the website") */}
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
    </div>
  );
}
