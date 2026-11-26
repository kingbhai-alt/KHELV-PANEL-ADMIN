import React, { useState } from 'react';
import { ShieldCheck, Volume2, VolumeX, Lock, Key, Check } from 'lucide-react';
import { sounds } from '../utils/audio';
import { MASTER_SECRET } from '../utils/crypto';

interface HeaderProps {
  onLock: () => void;
  onOpenVerifier: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLock, onOpenVerifier }) => {
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const handleLock = () => {
    sounds.playClick();
    onLock();
  };

  const handleCopySecret = () => {
    sounds.playCopySuccess();
    navigator.clipboard.writeText(MASTER_SECRET);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070b16]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg tracking-wider text-slate-100">
                KHELV PENEL
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-400/40 text-cyan-300">
                HMAC-SHA256
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              High-Security Cryptographic Key Generator & Key Vault
            </p>
          </div>
        </div>

        {/* Status & Secret quick info */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono bg-[#090f20] px-3 py-1.5 rounded-lg border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-400">CIPHER:</span>
          <span className="text-cyan-400 font-semibold truncate max-w-[220px]" title={MASTER_SECRET}>
            KHELV_PENEL_CIPHER_...984712
          </span>
          <button
            onClick={handleCopySecret}
            className="text-[10px] text-cyan-300 hover:text-cyan-200 underline cursor-pointer ml-1"
          >
            {copiedSecret ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3 h-3" /> Copied
              </span>
            ) : (
              'Copy Secret'
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Key Verifier / Inspector */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenVerifier();
            }}
            className="px-3 py-1.5 bg-[#0e162b] hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Key Verifier</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
            }`}
            title={isMuted ? 'Unmute Audio Sound Effects' : 'Mute Audio Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Lock Terminal (Logout) */}
          <button
            onClick={handleLock}
            className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/40 hover:border-rose-400 text-rose-300 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-[0_0_10px_rgba(244,63,94,0.15)]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Terminal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
