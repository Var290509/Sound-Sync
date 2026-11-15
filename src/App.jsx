import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeView from './views/HomeView';
import HostView from './views/HostView';
import ListenerView from './views/ListenerView';
import GuideView from './views/GuideView';
import FaqView from './views/FaqView';
import AboutView from './views/AboutView';
import PrivacyView from './views/PrivacyView';
import TermsView from './views/TermsView';
import ContactView from './views/ContactView';
import { useTheme } from './context/ThemeContext';
import { 
  Sparkles, 
  Radio, 
  Headphones, 
  Volume2, 
  Wifi, 
  BookOpen, 
  HelpCircle, 
  Info, 
  ShieldCheck, 
  FileText, 
  Mail,
  Heart
} from 'lucide-react';

const VALID_TABS = ['home', 'host', 'listener', 'guide', 'faq', 'about', 'privacy', 'terms', 'contact'];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialJoinCode, setInitialJoinCode] = useState('');
  const { theme } = useTheme();

  // Handle URL parameters (?join=CODE) and hash navigation (#guide, #privacy, etc.)
  useEffect(() => {
    // 1. Check Query Parameters for Room Code
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setInitialJoinCode(joinCode.toUpperCase());
      setActiveTab('listener');
      return;
    }

    // 2. Check Hash Route
    const parseHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (VALID_TABS.includes(hash)) {
        setActiveTab(hash);
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      history.pushState(null, '', window.location.pathname);
    } else {
      window.location.hash = tab;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg text-theme-text transition-colors duration-300">
      {/* Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <HomeView onSelectTab={handleSelectTab} />
        )}
        {activeTab === 'host' && (
          <HostView onSelectTab={handleSelectTab} />
        )}
        {activeTab === 'listener' && (
          <ListenerView
            initialRoomCode={initialJoinCode}
            onSelectTab={handleSelectTab}
          />
        )}
        {activeTab === 'guide' && (
          <GuideView onSelectTab={handleSelectTab} />
        )}
        {activeTab === 'faq' && (
          <FaqView onSelectTab={handleSelectTab} />
        )}
        {activeTab === 'about' && (
          <AboutView onSelectTab={handleSelectTab} />
        )}
        {activeTab === 'privacy' && (
          <PrivacyView />
        )}
        {activeTab === 'terms' && (
          <TermsView />
        )}
        {activeTab === 'contact' && (
          <ContactView onSelectTab={handleSelectTab} />
        )}
      </main>

      {/* Comprehensive AdSense-Compliant Multi-Column Footer */}
      <footer className="border-t border-theme-border/70 py-12 bg-theme-surface/70 backdrop-blur-md mt-20 text-xs text-theme-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Description */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleSelectTab('home')}>
                <img
                  src="/logo.png"
                  alt="Sound Sync Logo"
                  className="w-8 h-8 rounded-xl border border-theme-accent/40 object-cover"
                />
                <span className="font-bold font-display text-theme-text text-base">
                  Sound Sync
                </span>
              </div>
              <p className="text-theme-muted leading-relaxed">
                Connect to your surroundings and stream studio-grade audio to any device over WiFi with sub-10ms latency.
              </p>
              <div className="pt-2 font-mono text-[11px] text-theme-muted/80">
                <span>Crafted by </span>
                <span className="font-bold text-theme-accent">VIK-V-VKS</span>
                <span className="italic"> (sharp & rythamic)</span>
              </div>
            </div>

            {/* Col 2: Audio Relay Tools */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold uppercase tracking-wider text-theme-text text-xs">
                Audio Relay Tools
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleSelectTab('home')} className="hover:text-theme-accent transition-colors">
                    Home & Visualizer
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectTab('host')} className="hover:text-theme-accent transition-colors">
                    Host Audio Broadcast
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectTab('listener')} className="hover:text-theme-accent transition-colors">
                    Connect Receiver (Listener)
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Knowledge & Documentation */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold uppercase tracking-wider text-theme-text text-xs">
                Resources & Guides
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleSelectTab('guide')} className="hover:text-theme-accent transition-colors">
                    User Guide & Documentation
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectTab('faq')} className="hover:text-theme-accent transition-colors">
                    FAQ & Troubleshooting
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectTab('about')} className="hover:text-theme-accent transition-colors">
                    About Sound Sync & Team
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & Support */}
            <div className="space-y-3">
              <h4 className="font-mono font-bold uppercase tracking-wider text-theme-text text-xs">
                Compliance & Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleSelectTab('contact')} className="hover:text-theme-accent transition-colors">
                    Contact & Support
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectTab('privacy')} className="hover:text-theme-accent transition-colors">
                    Privacy Policy (GDPR / CCPA)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectTab('terms')} className="hover:text-theme-accent transition-colors">
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* AdSense Notice & Copyright Bottom Bar */}
          <div className="pt-6 border-t border-theme-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-theme-muted/70">
            <p>
              © {new Date().getFullYear()} Sound Sync by VIK-V-VKS. All rights reserved. Open-source wireless audio relay over WebRTC.
            </p>
            <p className="max-w-md">
              Sound Sync uses Google AdSense and third-party advertising cookies to sustain free operations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
