import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeView from './views/HomeView';
import HostView from './views/HostView';
import ListenerView from './views/ListenerView';
import { useTheme } from './context/ThemeContext';
import { Sparkles, Radio, Headphones, Volume2, Wifi } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [initialJoinCode, setInitialJoinCode] = useState('');
  const { theme } = useTheme();

  // Check URL query parameters on initial load (e.g. ?join=SYNC88)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setInitialJoinCode(joinCode.toUpperCase());
      setActiveTab('listener');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg text-theme-text transition-colors duration-300">
      {/* Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <HomeView onSelectTab={setActiveTab} />
        )}
        {activeTab === 'host' && (
          <HostView onSelectTab={setActiveTab} />
        )}
        {activeTab === 'listener' && (
          <ListenerView
            initialRoomCode={initialJoinCode}
            onSelectTab={setActiveTab}
          />
        )}
      </main>

      {/* Modern Footer with signature from sketches */}
      <footer className="border-t border-theme-border/70 py-8 bg-theme-surface/50 backdrop-blur-md mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-muted">
          <div className="flex items-center gap-2">
            <span className="font-bold font-display text-theme-text text-sm">
              Sound Sync
            </span>
            <span>—</span>
            <span>Connect to your surroundings</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Crafted by</span>
            <span className="font-bold text-theme-accent">VIK-V-VKS</span>
            <span className="italic opacity-80">(sharp & rythamic)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
