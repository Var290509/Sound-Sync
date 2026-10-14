import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Smartphone, Wifi, QrCode as QrIcon } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, joinUrl, roomCode }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (joinUrl && isOpen) {
      QRCode.toDataURL(joinUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0B192C',
          light: '#FAF7F2',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [joinUrl, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-theme-surface border border-theme-accent/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-surfaceHover border border-transparent hover:border-theme-border transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-theme-accent/15 border border-theme-accent/40 text-theme-accent flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold font-display text-theme-text">
          Scan to Connect Phone
        </h3>
        <p className="text-xs text-theme-muted mt-1 max-w-xs mx-auto">
          Scan with your phone camera or tablet connected to the same WiFi network.
        </p>

        {/* QR Code Canvas */}
        <div className="my-6 p-4 rounded-2xl bg-white border-2 border-theme-accent/40 inline-block shadow-lg">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Room QR Code" className="w-56 h-56 mx-auto rounded-lg" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-500 font-mono">
              Generating QR...
            </div>
          )}
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs text-theme-muted font-medium">Room Code:</span>
          <span className="font-mono text-lg font-extrabold text-theme-accent tracking-widest px-3 py-1 rounded-xl bg-theme-accent/10 border border-theme-accent/40">
            {roomCode}
          </span>
        </div>

        {/* Direct Link Copy */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-theme-bg border border-theme-border text-left">
          <input
            type="text"
            readOnly
            value={joinUrl}
            className="flex-1 bg-transparent text-xs font-mono text-theme-muted outline-none px-2 truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-theme-accent text-theme-bg hover:bg-theme-accentHover transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
