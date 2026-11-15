import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, Bell, Globe } from 'lucide-react';

export default function PrivacyView() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-16 text-theme-text">
      {/* Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-theme-accent/30 bg-theme-accent/10 text-theme-accent">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Legal & Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-theme-text">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-theme-muted">
          Last Updated: November 15, 2026 | Effective Date: Immediately
        </p>
      </div>

      {/* Main Policy Content Container */}
      <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-10 shadow-xl space-y-8 text-sm leading-relaxed text-theme-muted">
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            1. Introduction & Overview
          </h2>
          <p>
            Welcome to <strong>Sound Sync</strong> ("we," "our," or "us"), available at{' '}
            <a href="https://sound-sync-vik-v-vks.vercel.app/" className="text-theme-accent underline">
              https://sound-sync-vik-v-vks.vercel.app/
            </a>
            . We are committed to protecting your privacy and ensuring the transparency of our data handling practices.
          </p>
          <p>
            Sound Sync is a web-based, low-latency audio relay application that enables users to transmit audio from personal computers to mobile devices and secondary speakers over local wireless networks. This Privacy Policy explains what information is collected, how it is used, and your rights regarding your data.
          </p>
        </section>

        {/* WebRTC Audio Privacy */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text flex items-center gap-2">
            <Lock className="w-5 h-5 text-theme-accent" />
            <span>2. Peer-to-Peer (WebRTC) Audio Stream Privacy</span>
          </h2>
          <p>
            <strong>We do not record, intercept, process, or store your audio.</strong>
          </p>
          <p>
            Audio streaming on Sound Sync is facilitated directly between your devices via <strong>WebRTC (Web Real-Time Communication)</strong> peer-to-peer data and media pipelines. All audio content transmitted between the host device (transmitter) and listener device (receiver) is encrypted end-to-end using <strong>DTLS (Datagram Transport Layer Security)</strong> and <strong>SRTP (Secure Real-Time Transport Protocol)</strong>.
          </p>
          <p>
            Audio packets travel directly over your local WiFi network. No audio, voice, screen media, or tab sound ever passes through or is saved on our servers or third-party storage.
          </p>
        </section>

        {/* Google AdSense & Third-Party Advertising (MANDATORY REQUIREMENT) */}
        <section className="space-y-3 p-5 rounded-2xl bg-theme-bg/60 border border-theme-accent/40">
          <h2 className="text-xl font-bold font-display text-theme-text flex items-center gap-2">
            <Eye className="w-5 h-5 text-theme-accent" />
            <span>3. Google AdSense & Third-Party Advertising Cookies</span>
          </h2>
          <p>
            We use <strong>Google AdSense</strong> to display advertisements to support the development and free operation of Sound Sync.
          </p>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              Third-party vendors, including <strong>Google</strong>, use cookies to serve ads based on a user's prior visits to this website or other websites on the Internet.
            </li>
            <li>
              Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to Sound Sync and/or other sites on the Internet.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-accent underline font-semibold"
              >
                Google Ads Settings
              </a>
              . Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-accent underline font-semibold"
              >
                www.aboutads.info
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Log Files & Analytics */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            4. Log Files & Anonymous Technical Data
          </h2>
          <p>
            Like most modern websites, our hosting provider (Vercel) automatically logs standard, non-personally identifiable technical information when you visit the site. This includes your browser type, device operating system, internet protocol (IP) address, referring/exit pages, and date/time stamps. This information is used strictly to analyze operational uptime, prevent DDoS attacks, and administer the site.
          </p>
        </section>

        {/* Cookies and Local Storage */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            5. Cookies & HTML5 Local Storage
          </h2>
          <p>
            Sound Sync uses browser <code>localStorage</code> solely to remember your chosen visual theme preference (e.g. Gold, Ivory, or Deep Navy) and user-assigned device label for convenience across sessions. No personal identifiable information is stored in local storage.
          </p>
        </section>

        {/* Children's Privacy */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            6. Children's Information (COPPA)
          </h2>
          <p>
            Protecting children's privacy is important to us. Sound Sync does not knowingly collect any personally identifiable information from children under the age of 13. If you believe your child has provided personal information on our website, please contact us immediately, and we will promptly remove such information from our records.
          </p>
        </section>

        {/* GDPR & CCPA Rights */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text flex items-center gap-2">
            <Globe className="w-5 h-5 text-theme-accent" />
            <span>7. Data Protection Rights (GDPR & CCPA)</span>
          </h2>
          <p>
            Depending on your location (such as the European Economic Area or California), you may have certain rights under data protection laws, including:
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>The right to access, update, or delete any information we hold about you.</li>
            <li>The right to rectification if information is inaccurate or incomplete.</li>
            <li>The right to object to or restrict processing of your personal data.</li>
            <li>The right to data portability.</li>
          </ul>
          <p>
            Because Sound Sync does not require user accounts, email registration, or collect databases of personal identities, we hold no user profiles or stored audio history.
          </p>
        </section>

        {/* Policy Changes */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            8. Changes to This Privacy Policy
          </h2>
          <p>
            We may update our Privacy Policy periodically to reflect new technical capabilities or regulatory updates. Any changes will be posted on this page with an updated "Last Updated" date.
          </p>
        </section>

        {/* Contact Info */}
        <section className="space-y-3 pt-4 border-t border-theme-border">
          <h2 className="text-xl font-bold font-display text-theme-text">
            9. Contact Us Regarding Privacy
          </h2>
          <p>
            If you have questions, feedback, or concerns regarding this Privacy Policy, please reach out to the VIK-V-VKS development team:
          </p>
          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border font-mono text-xs text-theme-accent">
            <span>Project: Sound Sync (VIK-V-VKS)</span><br />
            <span>Email: soundsync.relay@gmail.com</span><br />
            <span>Repository: github.com/Var290509/Sound-Sync</span>
          </div>
        </section>
      </div>
    </div>
  );
}
