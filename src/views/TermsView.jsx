import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TermsView() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-16 text-theme-text">
      {/* Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-theme-accent/30 bg-theme-accent/10 text-theme-accent">
          <FileText className="w-3.5 h-3.5" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-theme-text">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-theme-muted">
          Last Updated: November 15, 2026 | Effective Date: Immediately
        </p>
      </div>

      {/* Main Content Container */}
      <div className="rounded-3xl bg-theme-surface border border-theme-border p-6 sm:p-10 shadow-xl space-y-8 text-sm leading-relaxed text-theme-muted">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using the website and services of <strong>Sound Sync</strong> (located at{' '}
            <a href="https://sound-sync-vik-v-vks.vercel.app/" className="text-theme-accent underline">
              https://sound-sync-vik-v-vks.vercel.app/
            </a>
            ), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            2. Description of Service
          </h2>
          <p>
            Sound Sync is a browser-based, peer-to-peer audio relay utility created by VIK-V-VKS. It allows users to capture audio from personal devices (such as browser tabs, microphones, and audio files) and relay it in real-time to other connected devices across local networks using WebRTC technology.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            3. Acceptable Use Policy
          </h2>
          <p>You agree to use Sound Sync only for lawful purposes. You agree not to:</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Broadcast copyrighted audio material without proper authorization or fair use rights.</li>
            <li>Use the service to eavesdrop, record private conversations without consent, or violate wiretapping laws.</li>
            <li>Attempt to interfere with, disrupt, or flood the signaling servers or peer connections.</li>
            <li>Reverse engineer or misuse signaling protocols to transmit malicious payloads or harass other users.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            4. Intellectual Property Rights
          </h2>
          <p>
            The software, visual styling, source code, logos, and UI designs of Sound Sync are the intellectual property of VIK-V-VKS and contributors, protected under international copyright and open-source licensing.
          </p>
          <p>
            Users retain all ownership and copyright to any original audio streams or files they transmit through the platform.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            5. Disclaimer of Warranties
          </h2>
          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border font-mono text-xs">
            "SOUND SYNC IS PROVIDED ON AN 'AS IS' AND 'AS AVAILABLE' BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, JITTER-FREE, OR ERROR-FREE."
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            6. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, in no event shall VIK-V-VKS, its developers, or contributors be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including damages for loss of profits, goodwill, data, or equipment malfunction arising out of the use or inability to use the service.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            7. Advertisements and External Links
          </h2>
          <p>
            Sound Sync displays advertisements provided by Google AdSense and third-party advertising partners. We do not endorse or assume responsibility for the content, privacy policies, or practices of any third-party websites or services advertised on our platform.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-theme-text">
            8. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed and construed in accordance with applicable laws without regard to conflict of law principles. Any failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3 pt-4 border-t border-theme-border">
          <h2 className="text-xl font-bold font-display text-theme-text">
            9. Contact Information
          </h2>
          <p>
            If you have questions about these Terms, please contact us at:
          </p>
          <div className="p-4 rounded-2xl bg-theme-bg/60 border border-theme-border font-mono text-xs text-theme-accent">
            <span>Sound Sync Legal Department (VIK-V-VKS)</span><br />
            <span>Email: soundsync.relay@gmail.com</span>
          </div>
        </section>
      </div>
    </div>
  );
}
