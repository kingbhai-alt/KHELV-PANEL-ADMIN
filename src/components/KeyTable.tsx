import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  QrCode, 
  Trash2, 
  Ban, 
  RotateCcw, 
  Download, 
  Filter, 
  Database,
  ExternalLink,
  Share2
} from 'lucide-react';
import { LicenseKeyRecord, KeyTier, KeyDuration, KeyStatus } from '../types';
import { exportKeysAsCsv, exportKeysAsTxt, exportKeysAsJson } from '../utils/storage';
import { formatTimeRemaining, TIER_DESCRIPTIONS } from '../utils/crypto';
import { sounds } from '../utils/audio';

interface KeyTableProps {
  keys: LicenseKeyRecord[];
  onUpdateStatus: (id: string, newStatus: KeyStatus) => void;
  onDeleteKey: (id: string) => void;
  onClearAll: () => void;
  onOpenQr: (key: LicenseKeyRecord) => void;
  onOpenShare: (key: LicenseKeyRecord) => void;
  onInspectKey: (keyString: string) => void;
}

export const KeyTable: React.FC<KeyTableProps> = ({
  keys,
  onUpdateStatus,
  onDeleteKey,
  onClearAll,
  onOpenQr,
  onOpenShare,
  onInspectKey,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedAllFiltered, setCopiedAllFiltered] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter keys
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      const matchSearch =
        searchTerm === '' ||
        k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (k.clientName && k.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        k.kid.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTier = tierFilter === 'ALL' || k.tier === tierFilter;
      const matchStatus = statusFilter === 'ALL' || k.status === statusFilter;

      return matchSearch && matchTier && matchStatus;
    });
  }, [keys, searchTerm, tierFilter, statusFilter]);

  const handleCopy = (record: LicenseKeyRecord) => {
    sounds.playCopySuccess();
    navigator.clipboard.writeText(record.key);
    setCopiedKeyId(record.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCopyAllFiltered = () => {
    if (filteredKeys.length === 0) return;
    sounds.playCopySuccess();
    const text = filteredKeys.map((k) => k.key).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAllFiltered(true);
    setTimeout(() => setCopiedAllFiltered(false), 2000);
  };

  const handleToggleRevoke = (record: LicenseKeyRecord) => {
    sounds.playClick();
    const nextStatus: KeyStatus = record.status === 'REVOKED' ? 'ACTIVE' : 'REVOKED';
    onUpdateStatus(record.id, nextStatus);
  };

  const handleDelete = (id: string) => {
    sounds.playClick();
    onDeleteKey(id);
  };

  return (
    <div className="bg-[#080d1c] border border-cyan-500/20 rounded-2xl p-5 sm:p-7 shadow-[0_0_35px_rgba(0,240,255,0.06)]">
      {/* Table Header and Bulk Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-mono tracking-wider text-slate-100 uppercase">
              Generated Keys Vault & History
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Total {keys.length} keys archived in local database
            </p>
          </div>
        </div>

        {/* Global Export & Batch Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy All Filtered */}
          <button
            type="button"
            disabled={filteredKeys.length === 0}
            onClick={handleCopyAllFiltered}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
              copiedAllFiltered
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-[#0f172e] hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300'
            }`}
          >
            {copiedAllFiltered ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All ({filteredKeys.length})</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            disabled={keys.length === 0}
            onClick={() => {
              sounds.playClick();
              exportKeysAsCsv(filteredKeys.length > 0 ? filteredKeys : keys);
            }}
            className="px-3 py-1.5 bg-[#0f172e] hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Export Table as CSV format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Export TXT */}
          <button
            type="button"
            disabled={keys.length === 0}
            onClick={() => {
              sounds.playClick();
              exportKeysAsTxt(filteredKeys.length > 0 ? filteredKeys : keys);
            }}
            className="px-3 py-1.5 bg-[#0f172e] hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Export raw keys list as TXT"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export TXT</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            disabled={keys.length === 0}
            onClick={() => {
              sounds.playClick();
              exportKeysAsJson(keys);
            }}
            className="px-3 py-1.5 bg-[#0f172e] hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 hidden sm:flex"
            title="Download full JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON Backup</span>
          </button>

          {/* Clear All */}
          {confirmClear ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Confirm Clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-2 py-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={keys.length === 0}
              onClick={() => setConfirmClear(true)}
              className="px-2.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 hover:border-rose-400 rounded-lg font-mono text-xs font-medium transition-all cursor-pointer disabled:opacity-40"
              title="Delete all records"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-5">
        {/* Search input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search key, client name, or KID..."
            className="w-full bg-[#050813] border border-cyan-500/20 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 outline-none transition-all"
          />
        </div>

        {/* Tier filter */}
        <div className="sm:col-span-3">
          <select
            value={tierFilter}
            onChange={(e) => {
              sounds.playClick();
              setTierFilter(e.target.value);
            }}
            className="w-full bg-[#050813] border border-cyan-500/20 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Tiers (VIP, Premium, etc)</option>
            <option value="VIP">Tier: VIP</option>
            <option value="PREMIUM">Tier: PREMIUM</option>
            <option value="ENTERPRISE">Tier: ENTERPRISE</option>
            <option value="ADMIN">Tier: ADMIN</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              sounds.playClick();
              setStatusFilter(e.target.value);
            }}
            className="w-full bg-[#050813] border border-cyan-500/20 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 outline-none transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE only</option>
            <option value="EXPIRED">EXPIRED only</option>
            <option value="REVOKED">REVOKED only</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      {filteredKeys.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl bg-[#050813]">
          <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="font-mono text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
            {keys.length === 0 ? 'NO LICENSE KEYS GENERATED YET' : 'NO KEYS MATCH FILTER'}
          </h4>
          <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
            {keys.length === 0
              ? 'Use the generator above to create your first HMAC-SHA256 encrypted license key.'
              : 'Try clearing your search query or reset tier and status filters.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/10">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#050814] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">License Key</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Client / Note</th>
                <th className="py-3 px-3">Expiry / Time Left</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#070c1a]">
              {filteredKeys.map((item) => {
                const tierInfo = TIER_DESCRIPTIONS[item.tier];
                const timeLeft = formatTimeRemaining(item.expirySeconds);
                const isRevoked = item.status === 'REVOKED';
                const isExpired = item.status === 'EXPIRED';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#0c142b] transition-colors group"
                  >
                    {/* Key */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <span 
                          onClick={() => handleCopy(item)}
                          className="font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer select-all truncate max-w-[220px] sm:max-w-xs md:max-w-sm"
                          title="Click to copy full key"
                        >
                          {item.key}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item)}
                          className="text-slate-500 hover:text-cyan-300 p-1 rounded transition-colors"
                          title="Copy Key"
                        >
                          {copiedKeyId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        KID: {item.kid} · Created: {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierInfo.badgeColor}`}>
                        {item.tier}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 text-slate-300">
                      <span className="font-semibold text-violet-300">{item.duration}</span>
                    </td>

                    {/* Client Name */}
                    <td className="py-3 px-3 text-slate-300">
                      <span className="truncate max-w-[140px] block" title={item.clientName || 'Unassigned'}>
                        {item.clientName || <span className="text-slate-600 italic">None</span>}
                      </span>
                    </td>

                    {/* Expiry */}
                    <td className="py-3 px-3">
                      <div className="text-slate-200 tabular-nums">
                        {item.duration === 'LIFETIME' ? 'Permanent' : new Date(item.expirySeconds * 1000).toLocaleDateString()}
                      </div>
                      <div className={`text-[10px] tabular-nums ${isExpired ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                        {timeLeft}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {isRevoked ? (
                        <span className="text-rose-400 bg-rose-950/40 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          REVOKED
                        </span>
                      ) : isExpired ? (
                        <span className="text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Inspect / Verify against cipher */}
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            onInspectKey(item.key);
                          }}
                          className="p-1.5 bg-[#0e162b] hover:bg-cyan-950/70 border border-cyan-500/20 text-slate-400 hover:text-cyan-300 rounded transition-colors"
                          title="Inspect cryptographic components"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* View QR */}
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            onOpenQr(item);
                          }}
                          className="p-1.5 bg-[#0e162b] hover:bg-cyan-950/70 border border-cyan-500/20 text-slate-400 hover:text-cyan-300 rounded transition-colors"
                          title="View QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Share */}
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            onOpenShare(item);
                          }}
                          className="p-1.5 bg-[#0e162b] hover:bg-cyan-950/70 border border-cyan-500/20 text-slate-400 hover:text-cyan-300 rounded transition-colors"
                          title="Dispatch message template"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Revoke / Restore */}
                        <button
                          type="button"
                          onClick={() => handleToggleRevoke(item)}
                          className={`p-1.5 rounded border transition-colors ${
                            isRevoked
                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
                              : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:border-amber-400'
                          }`}
                          title={isRevoked ? 'Restore Key to Active' : 'Revoke Key'}
                        >
                          {isRevoked ? <RotateCcw className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 bg-rose-950/30 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:border-rose-400 rounded transition-colors"
                          title="Permanently remove key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
