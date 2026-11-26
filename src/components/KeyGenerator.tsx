import React, { useState } from 'react';
import { Sparkles, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';
import { KeyDuration, KeyTier, LicenseKeyRecord } from '../types';
import { createLicenseKey, TIER_DESCRIPTIONS, DURATION_SECONDS_MAP } from '../utils/crypto';
import { sounds } from '../utils/audio';

interface KeyGeneratorProps {
  onKeysGenerated: (newKeys: LicenseKeyRecord[]) => void;
}

export const KeyGenerator: React.FC<KeyGeneratorProps> = ({ onKeysGenerated }) => {
  const [tier, setTier] = useState<KeyTier>('VIP');
  const [duration, setDuration] = useState<KeyDuration>('7D');
  const [clientName, setClientName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const durationOptions: { id: KeyDuration; label: string; sub: string }[] = [
    { id: '1H', label: '1 HOUR', sub: '3,600s' },
    { id: '1D', label: '1 DAY', sub: '24 Hours' },
    { id: '7D', label: '7 DAYS', sub: 'Standard Pass' },
    { id: '30D', label: '30 DAYS', sub: 'Monthly' },
    { id: 'LIFETIME', label: 'LIFETIME', sub: 'Permanent' },
  ];

  const quantityOptions = [1, 5, 10, 25];

  const handleGenerate = async () => {
    sounds.playClick();
    setIsGenerating(true);

    try {
      const generatedList: LicenseKeyRecord[] = [];

      for (let i = 0; i < quantity; i++) {
        const itemClientName = quantity === 1 
          ? clientName 
          : clientName 
            ? `${clientName} (#${i + 1})` 
            : `Bulk Batch #${i + 1}`;

        const record = await createLicenseKey({
          tier,
          duration,
          clientName: itemClientName
        });
        generatedList.push(record);
      }

      setTimeout(() => {
        sounds.playKeyGenerated();
        onKeysGenerated(generatedList);
        setIsGenerating(false);
      }, 350);
    } catch (err) {
      console.error('Error generating key:', err);
      setIsGenerating(false);
    }
  };

  const currentDurationSeconds = DURATION_SECONDS_MAP[duration];
  const simulatedExpiryDate = new Date(Date.now() + currentDurationSeconds * 1000);

  return (
    <div className="relative bg-[#080d1c] border border-cyan-500/30 rounded-2xl p-5 sm:p-7 shadow-[0_0_35px_rgba(0,240,255,0.08)] mb-8">
      {/* Visual Accent Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <h2 className="text-base sm:text-lg font-bold font-mono tracking-wider text-slate-100 uppercase">
            License Generation Engine
          </h2>
        </div>
        <div className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1.5 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/30">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>CIPHER: HMAC-SHA256</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tier Selector */}
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            1. Select License Access Tier
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {(['VIP', 'PREMIUM', 'ENTERPRISE', 'ADMIN'] as KeyTier[]).map((t) => {
              const isSelected = tier === t;
              const meta = TIER_DESCRIPTIONS[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setTier(t);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                      : 'bg-[#0a1020] border-slate-800 hover:border-slate-700 hover:bg-[#0e162c]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {t}
                    </span>
                    <Shield className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    {meta.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validity Duration Selector */}
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            2. Select Validity Duration
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {durationOptions.map((opt) => {
              const isSelected = duration === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setDuration(opt.id);
                  }}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'bg-[#0a1020] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-mono text-xs font-bold tracking-wider">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{opt.sub}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between px-1">
            <span>Estimated Expiry:</span>
            <span className="text-cyan-300">
              {duration === 'LIFETIME'
                ? 'Permanent / Lifetime Access (~Year 2126)'
                : simulatedExpiryDate.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Client Name & Quantity row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
              3. Client / Licensee Name or Note (Optional)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Satoru Gojo · Discord ID #7721 · Node 01"
              className="w-full bg-[#050813] border border-cyan-500/30 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
              4. Quantity
            </label>
            <div className="flex items-center gap-1.5 bg-[#050813] border border-slate-800 p-1 rounded-lg">
              {quantityOptions.map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setQuantity(qty);
                  }}
                  className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    quantity === qty
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {qty}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Payload Preview */}
        <div className="bg-[#050814] border border-cyan-500/20 rounded-xl p-3.5 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Layers className="w-3.5 h-3.5" />
              CIPHER PAYLOAD SPECIFICATION
            </span>
            <span className="text-slate-500">FORMAT: JUJUTSU-[TIER]-[DUR]-[KID]-[EXPHEX]-[SIG]</span>
          </div>
          <div className="text-slate-300 break-all bg-[#090e1f] px-3 py-2 rounded border border-slate-800/80">
            <span className="text-cyan-400">JUJUTSU</span>-
            <span className="text-violet-400 font-bold">{tier}</span>-
            <span className="text-amber-400 font-bold">{duration}</span>-
            <span className="text-slate-400">[8-HEX-KID]</span>-
            <span className="text-slate-400">[EXPHEX]</span>-
            <span className="text-emerald-400">[16-HEX-HMAC]</span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-mono font-black text-sm sm:text-base py-4 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.4)] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2.5"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>COMPUTING HMAC-SHA256 CIPHER...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>
                {quantity === 1
                  ? 'GENERATE ENCRYPTED KEY'
                  : `GENERATE ${quantity} ENCRYPTED KEYS IN BULK`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
