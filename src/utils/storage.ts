import { LicenseKeyRecord, KeyStatus } from '../types';

const STORAGE_KEY = 'JUJUTSU_LICENSE_KEYS_VAULT_V1';

export function getStoredKeys(): LicenseKeyRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: LicenseKeyRecord[] = JSON.parse(raw);

    // Refresh dynamic status (e.g. check if expired)
    const nowSec = Math.floor(Date.now() / 1000);
    return parsed.map((item) => {
      if (item.status !== 'REVOKED') {
        const isExp = item.expirySeconds < nowSec;
        return {
          ...item,
          status: (isExp ? 'EXPIRED' : 'ACTIVE') as KeyStatus
        };
      }
      return item;
    });
  } catch (err) {
    console.error('Failed to parse keys from localStorage:', err);
    return [];
  }
}

export function saveKeys(keys: LicenseKeyRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch (err) {
    console.error('Failed to persist keys to localStorage:', err);
  }
}

export function exportKeysAsCsv(keys: LicenseKeyRecord[]): void {
  const headers = ['Key', 'Tier', 'Duration', 'Client/Note', 'Status', 'Expires At', 'Expiry (Unix Sec)', 'KID', 'Created At'];
  const rows = keys.map((k) => [
    `"${k.key}"`,
    `"${k.tier}"`,
    `"${k.duration}"`,
    `"${(k.clientName || '').replace(/"/g, '""')}"`,
    `"${k.status}"`,
    `"${new Date(k.expirySeconds * 1000).toISOString()}"`,
    k.expirySeconds,
    `"${k.kid}"`,
    `"${new Date(k.createdAt).toISOString()}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `jujutsu-license-keys-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportKeysAsTxt(keys: LicenseKeyRecord[]): void {
  const txtContent = keys.map((k) => k.key).join('\n');
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, `jujutsu-license-keys-${new Date().toISOString().slice(0, 10)}.txt`);
}

export function exportKeysAsJson(keys: LicenseKeyRecord[]): void {
  const jsonContent = JSON.stringify(keys, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `jujutsu-license-vault-backup-${new Date().toISOString().slice(0, 10)}.json`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
