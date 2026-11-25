import React from 'react';
import { Key, CheckCircle, ClockAlert, Ban } from 'lucide-react';
import { LicenseKeyRecord } from '../types';

interface StatsBarProps {
  keys: LicenseKeyRecord[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ keys }) => {
  const total = keys.length;
  const active = keys.filter((k) => k.status === 'ACTIVE').length;
  const expired = keys.filter((k) => k.status === 'EXPIRED').length;
  const revoked = keys.filter((k) => k.status === 'REVOKED').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-[#090e1d] border border-cyan-500/20 rounded-xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <Key className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-mono text-slate-400">TOTAL GENERATED</div>
          <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">{total}</div>
        </div>
      </div>

      <div className="bg-[#090e1d] border border-emerald-500/20 rounded-xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-mono text-slate-400">ACTIVE LICENSES</div>
          <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">{active}</div>
        </div>
      </div>

      <div className="bg-[#090e1d] border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <ClockAlert className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-mono text-slate-400">EXPIRED KEYS</div>
          <div className="text-xl font-mono font-bold text-amber-400 tabular-nums">{expired}</div>
        </div>
      </div>

      <div className="bg-[#090e1d] border border-rose-500/20 rounded-xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
          <Ban className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-mono text-slate-400">REVOKED KEYS</div>
          <div className="text-xl font-mono font-bold text-rose-400 tabular-nums">{revoked}</div>
        </div>
      </div>
    </div>
  );
};
