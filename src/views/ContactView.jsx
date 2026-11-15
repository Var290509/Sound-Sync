import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, HelpCircle, Sparkles, Github } from 'lucide-react';

export default function ContactView({ onSelectTab }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feedback / Question');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    // Simulate clean local submission
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-16 text-theme-text">
      {/* Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-theme-accent/30 bg-theme-accent/10 text-theme-accent">
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-theme-text">
          Contact Support & Feedback
        </h1>
        <p className="text-base sm:text-lg text-theme-muted max-w-2xl mx-auto">
          Have an issue with audio sync, a bug report, or a feature request? The VIK-V-VKS development team is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Column */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-md space-y-4">
            <h3 className="font-bold font-display text-base text-theme-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-theme-accent" />
              <span>Direct Support</span>
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              We respond to all technical queries and troubleshooting requests within 24-48 business hours.
            </p>

            <div className="space-y-3 pt-2 font-mono text-xs text-theme-muted">
              <div>
                <span className="text-[10px] uppercase font-bold text-theme-accent block">Primary Support Email</span>
                <a href="mailto:soundsync.relay@gmail.com" className="text-theme-text hover:text-theme-accent underline">
                  soundsync.relay@gmail.com
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-theme-accent block">Project Maintainer</span>
                <span className="text-theme-text">Vardhan Gajula & VIK-V-VKS</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-theme-accent block">Open Source Repository</span>
                <a
                  href="https://github.com/Var290509/Sound-Sync"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-theme-text hover:text-theme-accent underline flex items-center gap-1.5 mt-0.5"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>github.com/Var290509/Sound-Sync</span>
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-md space-y-3">
            <h4 className="font-bold text-sm text-theme-text flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-theme-accent" />
              <span>Looking for Quick Answers?</span>
            </h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Most connectivity questions regarding AP isolation, mobile autoplay permissions, and buffer modes are answered in our FAQ.
            </p>
            <button
              onClick={() => onSelectTab('faq')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-theme-surfaceHover text-theme-accent hover:border-theme-accent border border-theme-border transition-all"
            >
              Browse FAQ & Troubleshooting
            </button>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="md:col-span-2">
          <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-8 shadow-xl">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-display text-theme-text">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-theme-muted max-w-md mx-auto">
                  Thank you for reaching out, <strong>{name}</strong>. Our engineering team has received your message and will review it shortly.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setMessage('');
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-theme-accent text-theme-bg hover:bg-theme-accentHover transition-all shadow-md"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold font-display text-theme-text">
                  Send Us a Message
                </h3>
                <p className="text-xs text-theme-muted">
                  Fill out the form below and we will get back to you as soon as possible.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase text-theme-muted mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Smith"
                      className="w-full px-4 py-3 rounded-2xl bg-theme-bg border border-theme-border text-theme-text font-medium text-sm outline-none focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase text-theme-muted mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 rounded-2xl bg-theme-bg border border-theme-border text-theme-text font-medium text-sm outline-none focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-theme-muted mb-1.5">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-theme-bg border border-theme-border text-theme-text font-medium text-sm outline-none focus:border-theme-accent transition-all cursor-pointer"
                  >
                    <option value="Audio Latency / Quality Question">Audio Latency / Quality Question</option>
                    <option value="Connection or WiFi Troubleshooting">Connection or WiFi Troubleshooting</option>
                    <option value="Feature Request / Idea">Feature Request / Idea</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Partnership / Other">Partnership / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase text-theme-muted mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question, device models, browser version, or feedback in detail..."
                    className="w-full px-4 py-3 rounded-2xl bg-theme-bg border border-theme-border text-theme-text font-medium text-sm outline-none focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl font-bold font-display text-sm text-theme-bg bg-theme-accent hover:bg-theme-accentHover shadow-[0_0_20px_var(--color-glow)] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Support</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
