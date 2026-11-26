import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  Terminal, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { verifyLicenseKey, MASTER_SECRET, formatTimeRemaining } from '../utils/crypto';
import { VerificationResult } from '../types';
import { sounds } from '../utils/audio';

interface KeyVerifierModalProps {
  initialKey?: string;
  onClose: () => void;
}

const EXAMPLE_KEY = 'JUJUTSU-VIP-7D-E1E4C16F-6AD8A904-4855686F134E9907';

export const KeyVerifierModal: React.FC<KeyVerifierModalProps> = ({ initialKey = '', onClose }) => {
  const [inputKey, setInputKey] = useState(initialKey || '');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (initialKey) {
      handleVerify(initialKey);
    }
  }, [initialKey]);

  const handleVerify = async (keyToVerify = inputKey) => {
    if (!keyToVerify.trim()) return;
    sounds.playClick();
    setIsVerifying(true);

    try {
      const res = await verifyLicenseKey(keyToVerify);
      setResult(res);
      if (res.valid) {
        sounds.playAccessGranted();
      } else {
        sounds.playAccessDenied();
      }
    } catch (err) {
      console.error(err);
      setResult({
        valid: false,
        reason: 'Error occurred during cryptographic verification.'
      });
      sounds.playAccessDenied();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoadExample = () => {
    sounds.playClick();
    setInputKey(EXAMPLE_KEY);
    handleVerify(EXAMPLE_KEY);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#080d1c] border-2 border-cyan-400 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.25)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-cyan-300 p-1 rounded-lg hover:bg-cyan-950/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-cyan-500/30">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
              Cryptographic Key Inspector & Verifier
            </h3>
            <p className="text-xs text-cyan-400/80 font-mono">
              Validates HMAC-SHA256 signatures against Jujutsu Master Secret
            </p>
          </div>
        </div>

        {/* Input area */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
              <span>Paste License Key to Inspect:</span>
              <button
                type="button"
                onClick={handleLoadExample}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Load Prompt Example Key
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="JUJUTSU-TIER-DURATION-KID-EXPHEX-SIG"
                className="flex-1 bg-[#050813] border border-cyan-500/30 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-xs font-mono text-cyan-300 outline-none uppercase transition-all"
              />
              <button
                type="button"
                disabled={isVerifying || !inputKey.trim()}
                onClick={() => handleVerify()}
                className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <span>VERIFY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Master Secret Check info */}
          <div className="text-[11px] font-mono text-slate-400 bg-[#050814] p-2.5 rounded border border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              MASTER SECRET VERIFICATION CIPHER:
            </span>
            <span className="text-cyan-300 font-bold">{MASTER_SECRET}</span>
          </div>
        </div>

        {/* Result Area */}
        {result && (
          <div className="space-y-4">
            {/* Status Banner */}
            {result.valid ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-3 text-emerald-300 font-mono text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-emerald-200">
                    CRYPTOGRAPHIC SIGNATURE AUTHENTIC
                  </div>
                  <p className="text-emerald-400/90 mt-0.5">
                    This license key is genuine. The HMAC-SHA256 signature strictly matches the Master Secret.
                  </p>
                  {result.isExpired && (
                    <div className="mt-2 text-amber-300 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      NOTE: While authentic, this key's validity period has elapsed (EXPIRED).
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3 text-rose-300 font-mono text-xs">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-rose-200">
                    SIGNATURE VERIFICATION FAILED
                  </div>
                  <p className="text-rose-400/90 mt-0.5">
                    {result.reason || 'Signature does not match HMAC-SHA256 Master Secret. Key is forged or invalid.'}
                  </p>
                </div>
              </div>
            )}

            {/* Breakdown Grid */}
            {result.tier && (
              <div className="bg-[#050814] border border-cyan-500/20 rounded-xl p-4 font-mono text-xs space-y-3">
                <div className="text-cyan-400 font-bold tracking-wider text-[11px] uppercase border-b border-slate-800 pb-2">
                  Key Component Deconstruction
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 text-[10px] block">ACCESS TIER</span>
                    <span className="text-cyan-300 font-bold">{result.tier}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">DURATION CODE</span>
                    <span className="text-violet-300 font-bold">{result.duration}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">KEY IDENTIFIER (KID)</span>
                    <span className="text-slate-200">{result.kid}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">EXPIRY HEX</span>
                    <span className="text-slate-200">{result.expHex}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">UNIX TIMESTAMP</span>
                    <span className="text-amber-300 tabular-nums">{result.expirySeconds}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">EXPIRY DATE</span>
                    <span className="text-slate-300 tabular-nums">
                      {result.expiryDate ? result.expiryDate.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Payload & Sig Details */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div>
                    <span className="text-slate-500 text-[10px] block">RAW CIPHER PAYLOAD (HMAC INPUT)</span>
                    <div className="bg-[#070c1a] px-2.5 py-1.5 rounded border border-slate-800 text-slate-300 text-[11px] break-all">
                      {result.payload}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">PROVIDED SIGNATURE</span>
                      <div className="bg-[#070c1a] px-2.5 py-1.5 rounded border border-slate-800 text-slate-300 text-[11px]">
                        {result.sig}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">EXPECTED HMAC SIGNATURE</span>
                      <div className={`px-2.5 py-1.5 rounded border text-[11px] font-bold ${
                        result.valid ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}>
                        {result.computedSig}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
