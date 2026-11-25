import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, QrCode as QrIcon } from 'lucide-react';
import { LicenseKeyRecord } from '../types';
import { sounds } from '../utils/audio';

interface QrCodeModalProps {
  keyRecord: LicenseKeyRecord | null;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ keyRecord, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!keyRecord || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      keyRecord.key,
      {
        width: 260,
        margin: 2,
        color: {
          dark: '#00f0ff', // Cyber cyan
          light: '#040714', // Deep cyber dark
        },
        errorCorrectionLevel: 'H',
      },
      (error) => {
        if (error) console.error('QR code generation failed:', error);
        else if (canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL('image/png'));
        }
      }
    );
  }, [keyRecord]);

  if (!keyRecord) return null;

  const handleCopy = () => {
    sounds.playCopySuccess();
    navigator.clipboard.writeText(keyRecord.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sounds.playClick();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `khelv-penel-qr-${keyRecord.kid}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#080d1c] border-2 border-cyan-400 rounded-2xl p-6 shadow-[0_0_45px_rgba(0,240,255,0.3)]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-cyan-300 p-1 rounded-lg hover:bg-cyan-950/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-400 mb-2">
            <QrIcon className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
            Encrypted License QR
          </h3>
          <p className="text-xs text-cyan-400/80 font-mono">
            Scan to redeem in Khelv Penel App
          </p>
        </div>

        {/* QR Canvas Container with Cyber Glow */}
        <div className="flex justify-center p-3 bg-[#030611] rounded-xl border border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.15)] mb-4">
          <canvas ref={canvasRef} className="rounded-lg shadow-inner" />
        </div>

        {/* Key String Box */}
        <div className="bg-[#040814] border border-cyan-500/20 rounded-lg p-2.5 font-mono text-xs text-cyan-300 break-all select-all text-center mb-4">
          {keyRecord.key}
        </div>

        {/* Metadata info */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-5 px-1">
          <span>Tier: <strong className="text-cyan-300">{keyRecord.tier}</strong></span>
          <span>Duration: <strong className="text-violet-300">{keyRecord.duration}</strong></span>
          <span>KID: <strong className="text-slate-200">{keyRecord.kid}</strong></span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`py-2.5 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED!' : 'COPY KEY'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="py-2.5 px-3 bg-[#0e162b] hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 rounded-lg font-mono text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>SAVE PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
