import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff, Terminal, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface AdminLockScreenProps {
  onUnlock: () => void;
}

const MASTER_PASSWORD = '655675576694';

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Focus or sound effect
  }, []);

  const handleDigitClick = (digit: string) => {
    sounds.playKeypress();
    setError(false);
    if (password.length < 24) {
      setPassword((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    sounds.playKeypress();
    setError(false);
    setPassword((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    sounds.playKeypress();
    setPassword('');
    setError(false);
  };

  const handleQuickPasteMaster = () => {
    sounds.playClick();
    setPassword(MASTER_PASSWORD);
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      setError(true);
      setErrorMessage('Passcode required');
      sounds.playAccessDenied();
      return;
    }

    setIsVerifying(true);
    setError(false);

    setTimeout(() => {
      if (password.trim() === MASTER_PASSWORD) {
        sounds.playAccessGranted();
        setIsSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 700);
      } else {
        sounds.playAccessDenied();
        setError(true);
        setErrorMessage('ACCESS DENIED: Master cipher clearance rejected');
        setIsVerifying(false);
      }
    }, 450);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#05070f] overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Grid background */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* Frame box */}
        <div className="relative bg-[#090d1a]/95 border border-cyan-500/30 rounded-xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.12)] backdrop-blur-xl">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-400 mb-3 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              {isSuccess ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-pulse" />
              ) : (
                <Lock className="w-7 h-7" />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-slate-100 font-mono">
              JUJUTSU CYBER TERMINAL
            </h1>
            <p className="text-xs uppercase tracking-widest text-cyan-400/80 mt-1 font-mono">
              [ CLASSIFIED ADMIN KEY GENERATOR ]
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  ENTER MASTER ADMIN PASSCODE
                </span>
                <button
                  type="button"
                  onClick={handleQuickPasteMaster}
                  className="text-[11px] text-cyan-400/90 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
                  title="Auto-fill official master password: 655675576694"
                >
                  Quick Fill Pass
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  autoFocus
                  placeholder="Master Admin Passcode"
                  className={`w-full bg-[#050813] border ${
                    error ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'border-cyan-500/40 focus:border-cyan-400'
                  } rounded-lg px-4 py-3 text-slate-100 font-mono text-center text-lg tracking-[0.25em] outline-none transition-all placeholder:tracking-normal placeholder:text-slate-600`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 mt-2 text-rose-400 text-xs font-mono bg-rose-950/40 border border-rose-500/30 px-3 py-2 rounded">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isSuccess && (
                <div className="flex items-center gap-2 mt-2 text-emerald-400 text-xs font-mono bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 rounded animate-pulse">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>IDENTITY VERIFIED // BOOTING TERMINAL...</span>
                </div>
              )}
            </div>

            {/* Quick Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitClick(digit)}
                  className="h-11 bg-[#0d1424] hover:bg-cyan-950/60 active:scale-[0.98] border border-cyan-500/20 hover:border-cyan-400/50 rounded-lg text-slate-200 font-mono text-base font-semibold transition-all"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-11 bg-[#151c2d] hover:bg-rose-950/40 border border-rose-500/20 hover:border-rose-400/40 rounded-lg text-rose-300 font-mono text-xs font-medium transition-all"
              >
                CLR
              </button>
              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                className="h-11 bg-[#0d1424] hover:bg-cyan-950/60 active:scale-[0.98] border border-cyan-500/20 hover:border-cyan-400/50 rounded-lg text-slate-200 font-mono text-base font-semibold transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-11 bg-[#151c2d] hover:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400/40 rounded-lg text-cyan-300 font-mono text-xs font-medium transition-all"
              >
                DEL
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isVerifying || isSuccess}
              className="w-full mt-3 h-12 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99] text-slate-950 font-mono font-bold text-sm tracking-wider rounded-lg shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <span>VERIFYING CIPHER CLEARANCE...</span>
              ) : isSuccess ? (
                <span>TERMINAL UNLOCKED</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>AUTHORIZE ACCESS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 font-mono">
            <span>MASTER CIPHER VERIFICATION 2026 · RESTRICTED GATE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
