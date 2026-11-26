export type KeyTier = 'VIP' | 'PREMIUM' | 'ENTERPRISE' | 'ADMIN';

export type KeyDuration = '1H' | '1D' | '7D' | '30D' | 'LIFETIME';

export type KeyStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface LicenseKeyRecord {
  id: string; // unique ID
  key: string; // full JUJUTSU-TIER-DURATION-KID-EXPHEX-SIG
  tier: KeyTier;
  duration: KeyDuration;
  kid: string; // 8-char hex
  expHex: string; // Hex representation of expiry seconds
  expirySeconds: number; // Unix timestamp in seconds
  sig: string; // 16-char hex signature
  payload: string; // JJS:TIER:DURATION:KID:expirySeconds
  clientName?: string;
  createdAt: number; // ms timestamp
  status: KeyStatus;
  revokedAt?: number;
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
  isExpired?: boolean;
  tier?: KeyTier;
  duration?: KeyDuration;
  kid?: string;
  expHex?: string;
  expirySeconds?: number;
  expiryDate?: Date;
  sig?: string;
  computedSig?: string;
  payload?: string;
}
