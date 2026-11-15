import React, { useState } from 'react';
import { 
  Home, 
  Radio, 
  Headphones, 
  X, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Info, 
  ShieldCheck, 
  FileText, 
  Mail,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ isOpen, onClose, activeTab, onSelectTab }) {
  const { theme } = useTheme();

  // The 7 members specified in the user sketch:
  // V - Vitesh
  // I - Ishitwa
  // K - Kowshik
  // V - Vardhan
  // V - Varshith
  // K - Karthik
  // S - Srinidhi
  const authors = [
    { letter: 'V', name: 'Vitesh', role: 'Architect' },
    { letter: 'I', name: 'Ishitwa', role: 'DSP Engineer' },
    { letter: 'K', name: 'Kowshik', role: 'Network Lead' },
    { letter: '-', name: null, role: null },
    { letter: 'V', name: 'Vardhan', role: 'Full-Stack Developer' },
    { letter: '-', name: null, role: null },
    { letter: 'V', name: 'Varshith', role: 'UI/UX Designer' },
    { letter: 'K', name: 'Karthik', role: 'Audio Protocols' },
    { letter: 'S', name: 'Srinidhi', role: 'Quality & Optimization' },
  ];

  const [hoveredLetter, setHoveredLetter] = useState(null);

  const mainNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      description: 'Overview & Sound Visualizer',
    },
    {
      id: 'host',
      label: 'Share Audio (HOST)',
      icon: Radio,
      badge: 'HOST',
      description: 'Stream tab/mic to WiFi devices',
    },
    {
      id: 'listener',
      label: 'Connect your device (Listener)',
      icon: Headphones,
      badge: 'CLIENT',
      description: 'Receive & play low-latency audio',
    },
  ];

  const resourceNavItems = [
    {
      id: 'guide',
      label: 'User Guide & Docs',
      icon: BookOpen,
      description: 'WiFi audio setup & buffer tuning',
    },
    {
      id: 'faq',
      label: 'FAQ & Troubleshooting',
      icon: HelpCircle,
      description: 'Answers to connection & delay issues',
    },
    {
      id: 'about',
      label: 'About Sound Sync',
      icon: Info,
      description: 'Mission & VIK-V-VKS team story',
    },
    {
      id: 'contact',
      label: 'Contact & Support',
      icon: Mail,
      description: 'Direct support & feedback channel',
    },
  ];

  const legalNavItems = [
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: ShieldCheck,
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      icon: FileText,
    },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 sm:w-88 bg-theme-surface border-r border-theme-border z-50 flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-theme-border">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onSelectTab('home'); onClose(); }}>
              <img
                src="/logo.png"
                alt="Sound Sync"
                className="w-10 h-10 rounded-2xl border border-theme-accent/40 shadow-sm object-cover"
              />
              <div>
                <span className="font-bold text-lg tracking-tight text-theme-text font-display block">
                  Sound Sync
                </span>
                <span className="text-xs text-theme-muted font-medium">
                  Connect to your surroundings
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-surfaceHover border border-transparent hover:border-theme-border transition-all"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main App Navigation */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-theme-muted px-2 block mb-2">
              Audio Relay Tools
            </span>
            <nav className="space-y-1.5">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full group flex items-start gap-3 p-3 rounded-2xl text-left transition-all duration-200 border ${
                      isActive
                        ? 'bg-theme-accent/15 border-theme-accent/50 text-theme-accent font-semibold shadow-[0_0_20px_var(--color-glow)]'
                        : 'border-transparent text-theme-text hover:bg-theme-surfaceHover hover:border-theme-border/70'
                    }`}
                  >
                    <div
                      className={`mt-0.5 p-2 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-theme-accent text-theme-bg'
                          : 'bg-theme-surfaceHover text-theme-muted group-hover:text-theme-text'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                              isActive
                                ? 'bg-theme-accent text-theme-bg'
                                : 'bg-theme-surfaceHover text-theme-muted border border-theme-border'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-theme-muted truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Knowledge & Resources */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-theme-muted px-2 block mb-2">
              Resources & Support
            </span>
            <nav className="space-y-1">
              {resourceNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full group flex items-center gap-3 p-2.5 rounded-xl text-left transition-all text-xs border ${
                      isActive
                        ? 'bg-theme-accent/15 border-theme-accent/40 text-theme-accent font-bold'
                        : 'border-transparent text-theme-muted hover:text-theme-text hover:bg-theme-surfaceHover'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-theme-accent shrink-0" />
                    <span className="font-medium flex-1">{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Legal / Policy Links */}
          <div className="pt-2 border-t border-theme-border/60">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-theme-muted px-2 block mb-2">
              Compliance & Legal
            </span>
            <div className="flex items-center gap-3 px-2 text-xs text-theme-muted">
              {legalNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`hover:text-theme-accent underline transition-colors ${
                    activeTab === item.id ? 'text-theme-accent font-bold' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Created by VIK-V-VKS (sharp & rythamic) */}
        <div className="pt-6 border-t border-theme-border mt-6">
          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border/60 relative">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono font-medium text-theme-muted">
              <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
              <span>Created by</span>
            </div>

            {/* Interactive VIK-V-VKS Letters with Hover Tooltips */}
            <div className="flex items-center gap-1 text-base sm:text-lg font-bold font-mono tracking-wider text-theme-accent select-none">
              {authors.map((item, index) => {
                if (item.letter === '-') {
                  return (
                    <span key={index} className="text-theme-muted/50 px-0.5">
                      -
                    </span>
                  );
                }
                return (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredLetter(index)}
                    onMouseLeave={() => setHoveredLetter(null)}
                  >
                    <span
                      className={`inline-block px-1 py-0.5 rounded-md transition-all duration-150 ${
                        hoveredLetter === index
                          ? 'bg-theme-accent text-theme-bg scale-125 shadow-md'
                          : 'hover:text-theme-accentHover'
                      }`}
                    >
                      {item.letter}
                    </span>

                    {/* Hover Floating Tooltip */}
                    {hoveredLetter === index && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap bg-theme-surface border border-theme-accent/60 text-theme-text text-xs py-1.5 px-3 rounded-xl shadow-xl backdrop-blur-xl animate-fade-in pointer-events-none">
                        <div className="font-semibold text-theme-accent">
                          {item.letter} = {item.name}
                        </div>
                        <div className="text-[10px] text-theme-muted">
                          {item.role}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-theme-surface" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Subtitle from sketch */}
            <p className="text-[11px] text-theme-muted italic mt-1.5 font-medium tracking-wide">
              (sharp & rythamic)
            </p>

            {/* Hover instructions hint */}
            <p className="text-[9px] text-theme-muted/70 mt-1 font-mono">
              Hover over each letter to view creators
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
