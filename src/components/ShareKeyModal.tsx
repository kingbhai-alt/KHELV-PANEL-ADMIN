import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageSquare, Send } from 'lucide-react';
import { LicenseKeyRecord } from '../types';
import { sounds } from '../utils/audio';

interface ShareKeyModalProps {
  keyRecord: LicenseKeyRecord | null;
  onClose: () => void;
}

export const ShareKeyModal: React.FC<ShareKeyModalProps> = ({ keyRecord, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!keyRecord) return null;

  const expiryDateString = keyRecord.duration === 'LIFETIME' 
    ? 'Permanent / Lifetime Access' 
    : new Date(keyRecord.expirySeconds * 1000).toLocaleString();

  // Template 1: Discord Markdown
  const discordTemplate = `⚡ **KHELV PENEL // OFFICIAL LICENSE KEY** ⚡
───────────────────────────────────
🔑 **License Key:**
\`\`\`
${keyRecord.key}
\`\`\`
👤 **Client:** ${keyRecord.clientName || 'Authorized User'}
🏷️ **Access Tier:** ${keyRecord.tier}
⏳ **Duration:** ${keyRecord.duration}
📅 **Expires:** ${expiryDateString}
───────────────────────────────────
*Instructions:* Paste the key into Khelv Penel to activate access.`;

  // Template 2: Telegram / WhatsApp Friendly
  const chatTemplate = `✨ KHELV PENEL - LICENSE KEY ✨

Key:
${keyRecord.key}

Tier: ${keyRecord.tier}
Duration: ${keyRecord.duration}
Client: ${keyRecord.clientName || 'General Access'}
Valid Until: ${expiryDateString}

Paste into your Khelv Penel app to unlock features immediately.`;

  const handleCopy = (text: string, type: string) => {
    sounds.playCopySuccess();
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#080d1c] border-2 border-cyan-400 rounded-2xl p-6 shadow-[0_0_45px_rgba(0,240,255,0.25)]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-cyan-300 p-1 rounded-lg hover:bg-cyan-950/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
              Dispatch License Message
            </h3>
            <p className="text-xs text-cyan-400/80 font-mono">
              Quickly copy client delivery templates
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Discord Template */}
          <div className="bg-[#050814] border border-cyan-500/20 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Discord Markdown Template
              </span>
              <button
                type="button"
                onClick={() => handleCopy(discordTemplate, 'discord')}
                className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  copiedType === 'discord'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                }`}
              >
                {copiedType === 'discord' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'discord' ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-[#070b1b] p-2.5 rounded border border-slate-800/80 overflow-x-auto whitespace-pre-wrap max-h-32">
              {discordTemplate}
            </pre>
          </div>

          {/* Telegram / WhatsApp Template */}
          <div className="bg-[#050814] border border-cyan-500/20 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-violet-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-violet-400" />
                Telegram / WhatsApp Template
              </span>
              <button
                type="button"
                onClick={() => handleCopy(chatTemplate, 'telegram')}
                className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  copiedType === 'telegram'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-violet-400 hover:bg-violet-300 text-slate-950'
                }`}
              >
                {copiedType === 'telegram' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'telegram' ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-[#070b1b] p-2.5 rounded border border-slate-800/80 overflow-x-auto whitespace-pre-wrap max-h-32">
              {chatTemplate}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
