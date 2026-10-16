import React from 'react';
import { Menu, Sun, Moon, Sparkles, Wifi, Radio, Headphones, Layers } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function Header({ onToggleSidebar, activeTab, onSelectTab, connectedPeersCount = 0 }) {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: THEMES.IVORY,
      label: '1. Ivory',
      colorPreview: '#FAF7F2',
      borderPreview: '#BFA15F',
      textPreview: '#1C1917'
    },
    {
      id: THEMES.GOLD,
      label: '2. Gold',
      colorPreview: '#0F0D09',
      borderPreview: '#E5B842',
      textPreview: '#FFFBF0'
    },
    {
      id: THEMES.NAVY,
      label: '3. Deep Atlas Navy',
      colorPreview: '#060D17',
      borderPreview: '#38BDF8',
      textPreview: '#F0F4F8'
    },
  ];

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-theme-bg/80 border-b border-theme-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle & Branding */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 rounded-2xl bg-theme-surface hover:bg-theme-surfaceHover border border-theme-border text-theme-text hover:text-theme-accent transition-all duration-200 shadow-sm"
            aria-label="Toggle Sidebar Menu"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('home')}>
            <img
              src="/logo.png"
              alt="Sound Sync Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl shadow-[0_0_15px_var(--color-glow)] border border-theme-accent/40 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-display text-theme-text">
                  Sound Sync
                </h1>
                <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded-full border border-theme-accent/40 bg-theme-accent/10 text-theme-accent font-semibold">
                  v1.0 WiFi
                </span>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted font-medium tracking-wide">
                — Connect to your surroundings
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick navigation pills (desktop) */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-theme-surface border border-theme-border">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'home'
                ? 'bg-theme-accent text-theme-bg font-semibold shadow-sm'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('host')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'host'
                ? 'bg-theme-accent text-theme-bg font-semibold shadow-sm'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Host Broadcast</span>
          </button>
          <button
            onClick={() => onSelectTab('listener')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'listener'
                ? 'bg-theme-accent text-theme-bg font-semibold shadow-sm'
                : 'text-theme-muted hover:text-theme-text'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Connect Listener</span>
          </button>
        </div>

        {/* Right: Theme Selector from Sketch + WiFi Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Dropdown / Pills specified in sketches: 1. Ivory, 2. Gold, 3. Deep Atlas Navy */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-theme-surface border border-theme-border text-xs">
            {themes.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={`Switch to ${t.label} theme`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 font-medium ${
                    isActive
                      ? 'bg-theme-accent text-theme-bg font-bold shadow-sm'
                      : 'text-theme-muted hover:text-theme-text hover:bg-theme-surfaceHover'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border"
                    style={{
                      backgroundColor: t.colorPreview,
                      borderColor: t.borderPreview
                    }}
                  />
                  <span className="hidden lg:inline">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Connected Peers Badge */}
          {connectedPeersCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{connectedPeersCount} connected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
