import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Wifi, 
  Volume2, 
  Radio, 
  ShieldAlert, 
  Smartphone, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function FaqView({ onSelectTab }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Why is there no sound coming through my mobile phone after connecting?',
      category: 'Audio Playback',
      a: 'Modern mobile browsers (Chrome on Android, Safari on iOS) enforce strict Autoplay Security Policies that block sound playback until the user physically interacts with the page. When you connect, look for the yellow or accent prompt "Tap to Start Sound" or "Unmute & Play Audio" and tap it once to permit the browser audio engine to activate. Also, make sure your phone\'s physical Silent/Mute switch is turned off.'
    },
    {
      q: 'How do I share tab/system audio in Google Chrome or Microsoft Edge?',
      category: 'Host Setup',
      a: 'When you click "Host Room & Start Broadcast" and select "Tab / Screen", your browser displays a permission prompt with three tabs: "Chrome Tab", "Window", and "Entire Screen". Select the specific "Chrome Tab" playing your audio (such as YouTube or Spotify) and verify that the checkbox/toggle in the bottom-left corner labeled "Also share tab audio" is turned ON before clicking Share.'
    },
    {
      q: 'Why does it say "Room not found or host inactive"?',
      category: 'Connection',
      a: 'This notice appears if the 6-character room code was entered incorrectly or if the host closed their browser tab. Verify the exact 6 letters shown in the active room box on the host screen. Ensure both the host computer and listener device are connected to the same local WiFi router.'
    },
    {
      q: 'What is AP Isolation (Access Point Isolation) and does it affect Sound Sync?',
      category: 'Network',
      a: 'Some corporate, university, or guest WiFi networks have a security feature called "Client Isolation" or "AP Isolation" enabled. This prevents devices connected to the same router from talking directly to each other over P2P. For the best, zero-lag experience, use your home private WiFi network or create a mobile personal hotspot from your phone and connect your laptop to it.'
    },
    {
      q: 'How does Sound Sync achieve 2ms to 10ms latency compared to Bluetooth?',
      category: 'Technical',
      a: 'Bluetooth transmits audio over 2.4GHz frequency hopping with mandatory 50ms-150ms packetization frames and deep operating system buffers. Sound Sync uses direct WebRTC RTP/SRTP UDP packetization with an ultra-short 5ms Opus frame size and Web Audio API hardware scheduling, resulting in imperceptible sub-10ms transit delay over local WiFi.'
    },
    {
      q: 'Can multiple devices connect to the same host simultaneously?',
      category: 'Features',
      a: 'Yes! Sound Sync supports multi-device broadcast. Any number of phones, tablets, or secondary laptops can connect to your host room simultaneously. The host encodes the 48kHz audio track once and transmits it via WebRTC peer streams to every connected receiver.'
    },
    {
      q: 'How do I prevent my phone screen from turning off during audio streaming?',
      category: 'Mobile',
      a: 'Sound Sync automatically engages the browser Screen Wake Lock API (`navigator.wakeLock`) while actively connected in Receiver mode. Keep the Sound Sync tab active in your mobile browser. For older mobile browsers that do not support Wake Lock, adjust your phone\'s screen timeout in device Display settings to "Never" or "10 minutes".'
    },
    {
      q: 'Does Sound Sync upload or store my audio on any remote servers?',
      category: 'Privacy & Security',
      a: 'Never. Sound Sync is engineered with complete privacy in mind. Audio streams travel strictly peer-to-peer (P2P) between your devices over your local WiFi network, protected by DTLS/SRTP encryption. No voice, music, or screen capture data is ever recorded, stored, or sent to cloud servers.'
    },
    {
      q: 'How can I adjust the latency vs stability balance?',
      category: 'Tuning',
      a: 'On the Listener screen, under "Listener Controls", you will find the "Latency Optimization Mode" selector with three presets: Ultra Low (5-10ms for gaming and real-time monitoring), Balanced (20-30ms default for smooth video watching), and High Stability (60-80ms for noisy or distant 2.4GHz WiFi networks).'
    },
    {
      q: 'Can I stream microphone audio like a wireless microphone or baby monitor?',
      category: 'Host Setup',
      a: 'Yes. On the Host screen, select the "Microphone" source. Any microphone connected to your computer (built-in mic, USB mic, or audio interface) will be broadcast live to all connected devices in crisp 48kHz stereo.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-16 text-theme-text">
      {/* View Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-theme-accent/30 bg-theme-accent/10 text-theme-accent">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Troubleshooting & Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-theme-text">
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg text-theme-muted max-w-2xl mx-auto">
          Answers to common questions about WiFi audio relay, latency optimization, and device connectivity.
        </p>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-theme-surface border-theme-accent/60 shadow-xl'
                  : 'bg-theme-surface/70 border-theme-border hover:border-theme-borderHover'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 outline-none"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-theme-accent/10 text-theme-accent border border-theme-accent/30 inline-block mb-1">
                    {faq.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-display text-theme-text">
                    {faq.q}
                  </h3>
                </div>
                <div className="p-2 rounded-xl bg-theme-surfaceHover text-theme-accent shrink-0 mt-1">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-theme-muted leading-relaxed border-t border-theme-border/60 pt-4 animate-fade-in">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still need help callout */}
      <div className="p-8 rounded-3xl bg-theme-surface border border-theme-border text-center space-y-4 shadow-xl">
        <Sparkles className="w-8 h-8 text-theme-accent mx-auto" />
        <h3 className="text-xl font-bold font-display text-theme-text">
          Have an unanswered technical question?
        </h3>
        <p className="text-sm text-theme-muted max-w-lg mx-auto">
          Our engineering team is dedicated to building the lowest latency open wireless audio relay system on the web.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onSelectTab('contact')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-theme-accent text-theme-bg hover:bg-theme-accentHover transition-all shadow-md flex items-center gap-2"
          >
            <span>Contact Support & Feedback</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectTab('guide')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-theme-surfaceHover text-theme-text hover:border-theme-accent border border-theme-border transition-all"
          >
            Read Full User Guide
          </button>
        </div>
      </div>
    </div>
  );
}
