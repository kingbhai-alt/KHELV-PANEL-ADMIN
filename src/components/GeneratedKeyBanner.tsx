import React, { useState } from 'react';
import { Copy, Check, QrCode, Share2, Sparkles, X, Layers, ExternalLink } from 'lucide-react';
import { LicenseKeyRecord } from '../types';
import { sounds } from '../utils/audio';

interface GeneratedKeyBannerProps {
  keys: LicenseKeyRecord[];
  onClose: () => void;
  onOpenQr: (key: LicenseKeyRecord) => void;
  onOpenShare: (key: LicenseKeyRecord) => void;
}

export const GeneratedKeyBanner: React.FC<GeneratedKeyBannerProps> = ({
  keys,
  onClose,
  onOpenQr,
  onOpenShare,
}) => {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!keys || keys.length === 0) return null;

  const handleCopy = (record: LicenseKeyRecord) => {
    sounds.playCopySuccess();
    navigator.clipboard.writeText(record.key);
    setCopiedKeyId(record.id);
    setTimeout(() => setCopiedKeyId(null), 2200);
  };

  const handleCopyAll = () => {
    sounds.playCopySuccess();
    const allText = keys.map((k) => k.key).join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2200);
  };

  const isBulk = keys.length > 1;
  const primaryKey = keys[0];

  return (
    <div className="relative bg-gradient-to-br from-[#071026] via-[#091533] to-[#0d1c44] border-2 border-cyan-400 rounded-2xl p-5 sm:p-6 shadow-[0_0_45px_rgba(0,240,255,0.25)] mb-8 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Corner notches */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-400 [clip-path:polygon(100%_0,0_0,100%_100%)]" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-400 text-slate-950 flex items-center justify-center font-bold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm sm:text-base text-cyan-200 uppercase tracking-wider">
              {isBulk ? `SUCCESSFULLY GENERATED ${keys.length} ENCRYPTED KEYS` : 'NEW ENCRYPTED LICENSE KEY READY'}
            </h3>
            <p className="text-[11px] font-mono text-cyan-400/80">
              Verified with Master Secret · Algorithm HMAC-SHA256
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-cyan-300 p-1.5 rounded-lg hover:bg-cyan-950/40 transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Single Key Display */}
      {!isBulk ? (
        <div className="space-y-4">
          <div className="bg-[#040814] border border-cyan-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="font-mono font-bold text-sm sm:text-lg text-cyan-300 break-all select-all tracking-wide">
              {primaryKey.key}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(primaryKey)}
                className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  copiedKeyId === primaryKey.id
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                }`}
              >
                {copiedKeyId === primaryKey.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY KEY</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenQr(primaryKey);
                }}
                className="px-3 py-2.5 bg-[#0b1428] hover:bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:border-cyan-300 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="View QR Code"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onOpenShare(primaryKey);
                }}
                className="px-3 py-2.5 bg-[#0b1428] hover:bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:border-cyan-300 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Share via Dispatch Message"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Dispatch</span>
              </button>
            </div>
          </div>

          {/* Quick metadata breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-[#050916] p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">TIER</span>
              <span className="text-cyan-300 font-bold">{primaryKey.tier}</span>
            </div>
            <div className="bg-[#050916] p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">DURATION</span>
              <span className="text-violet-300 font-bold">{primaryKey.duration}</span>
            </div>
            <div className="bg-[#050916] p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">KID</span>
              <span className="text-slate-300">{primaryKey.kid}</span>
            </div>
            <div className="bg-[#050916] p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">EXPIRY</span>
              <span className="text-amber-300 truncate block">
                {new Date(primaryKey.expirySeconds * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Bulk Display */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">
              {keys.length} keys generated simultaneously:
            </span>
            <button
              onClick={handleCopyAll}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedAll
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
              }`}
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'ALL COPIED!' : 'COPY ALL KEYS'}</span>
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {keys.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#040814] border border-cyan-500/20 hover:border-cyan-400/50 rounded-lg p-2.5 flex items-center justify-between gap-2 font-mono text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-500 text-[11px] w-6 shrink-0">#{idx + 1}</span>
                  <span className="text-cyan-300 truncate select-all">{item.key}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
                    title="Copy Key"
                  >
                    {copiedKeyId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onOpenQr(item);
                    }}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
