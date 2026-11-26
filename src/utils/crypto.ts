import { KeyDuration, KeyTier, LicenseKeyRecord, VerificationResult } from '../types';

export const MASTER_SECRET = 'JUJUTSU_KEY_CIPHER_2026_MASTER_SECRET_984712';

export const DURATION_SECONDS_MAP: Record<KeyDuration, number> = {
  '1H': 60 * 60, // 3,600s
  '1D': 24 * 60 * 60, // 86,400s
  '7D': 7 * 24 * 60 * 60, // 604,800s
  '30D': 30 * 24 * 60 * 60, // 2,592,000s
  'LIFETIME': 100 * 365 * 24 * 60 * 60, // ~100 years (3,153,600,000s)
};

export const TIER_DESCRIPTIONS: Record<KeyTier, { label: string; badgeColor: string; description: string }> = {
  VIP: {
    label: 'VIP TIER',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
    description: 'High-speed cursed energy access & standard predictions'
  },
  PREMIUM: {
    label: 'PREMIUM TIER',
    badgeColor: 'border-violet-500/40 text-violet-400 bg-violet-950/30',
    description: 'Unlimited queries, low-latency live signal feed'
  },
  ENTERPRISE: {
    label: 'ENTERPRISE TIER',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
    description: 'Multi-node concurrent pipelines & direct terminal API'
  },
  ADMIN: {
    label: 'ADMIN ROOT',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-950/30',
    description: 'Supreme unrestricted privileges across all cyber sectors'
  }
};

/**
 * Generates an 8-character uppercase hex string (KID)
 */
export function generateKid(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(4);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }
  // Fallback
  return Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, '0')
    .toUpperCase();
}

/**
 * Computes HMAC-SHA256 signature and returns the first 16 uppercase hex characters
 */
export async function computeHmacSig(payload: string, secret = MASTER_SECRET): Promise<string> {
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await window.crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const fullHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return fullHex.slice(0, 16);
}

/**
 * Generates a cryptographically signed license key
 */
export async function createLicenseKey(options: {
  tier: KeyTier;
  duration: KeyDuration;
  clientName?: string;
  customKid?: string;
  customExpirySeconds?: number;
}): Promise<LicenseKeyRecord> {
  const { tier, duration, clientName, customKid, customExpirySeconds } = options;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const durationSec = DURATION_SECONDS_MAP[duration];
  const expirySeconds = customExpirySeconds ?? (nowSeconds + durationSec);

  // Format EXPHEX
  const expHex = expirySeconds.toString(16).toUpperCase();

  // KID (8 hex uppercase)
  const kid = (customKid && customKid.trim().length === 8 ? customKid.trim() : generateKid()).toUpperCase();

  // Payload structure: "JJS:" + TIER + ":" + DURATION + ":" + KID + ":" + expirySeconds
  const payload = `JJS:${tier}:${duration}:${kid}:${expirySeconds}`;

  // Compute 16-hex HMAC-SHA256
  const sig = await computeHmacSig(payload);

  // Full key format: JUJUTSU-[TIER]-[DURATION]-[KID]-[EXPHEX]-[SIG]
  const key = `JUJUTSU-${tier}-${duration}-${kid}-${expHex}-${sig}`;

  const record: LicenseKeyRecord = {
    id: `key_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    key,
    tier,
    duration,
    kid,
    expHex,
    expirySeconds,
    sig,
    payload,
    clientName: clientName?.trim() || undefined,
    createdAt: Date.now(),
    status: 'ACTIVE'
  };

  return record;
}

/**
 * Verifies any license key against the Master Secret
 */
export async function verifyLicenseKey(rawKey: string): Promise<VerificationResult> {
  const trimmed = rawKey.trim().toUpperCase();
  const parts = trimmed.split('-');

  // Must match JUJUTSU-[TIER]-[DURATION]-[KID]-[EXPHEX]-[SIG]
  if (parts.length !== 6 || parts[0] !== 'JUJUTSU') {
    return {
      valid: false,
      reason: 'Invalid format. Expected format: JUJUTSU-[TIER]-[DURATION]-[KID]-[EXPHEX]-[SIG]'
    };
  }

  const [, tierStr, durationStr, kid, expHex, sig] = parts;

  // Validate Tier
  const validTiers: KeyTier[] = ['VIP', 'PREMIUM', 'ENTERPRISE', 'ADMIN'];
  if (!validTiers.includes(tierStr as KeyTier)) {
    return {
      valid: false,
      reason: `Invalid tier "${tierStr}". Must be VIP, PREMIUM, ENTERPRISE, or ADMIN.`
    };
  }

  // Validate Duration
  const validDurations: KeyDuration[] = ['1H', '1D', '7D', '30D', 'LIFETIME'];
  if (!validDurations.includes(durationStr as KeyDuration)) {
    return {
      valid: false,
      reason: `Invalid duration code "${durationStr}". Must be 1H, 1D, 7D, 30D, or LIFETIME.`
    };
  }

  // Validate KID (8 hex)
  if (!/^[0-9A-F]{8}$/.test(kid)) {
    return {
      valid: false,
      reason: `Invalid Key ID (KID) "${kid}". Must be exactly 8 hexadecimal characters.`
    };
  }

  // Parse Expiry
  const expirySeconds = parseInt(expHex, 16);
  if (isNaN(expirySeconds) || expirySeconds <= 0) {
    return {
      valid: false,
      reason: `Invalid Expiry Hex "${expHex}". Cannot be parsed into Unix seconds.`
    };
  }

  // Validate Sig format
  if (!/^[0-9A-F]{16}$/.test(sig)) {
    return {
      valid: false,
      reason: `Invalid signature "${sig}". Must be exactly 16 hexadecimal characters.`
    };
  }

  // Reconstruct payload and recompute signature
  const payload = `JJS:${tierStr}:${durationStr}:${kid}:${expirySeconds}`;
  const computedSig = await computeHmacSig(payload);

  const signatureMatches = computedSig === sig;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const isExpired = nowSeconds > expirySeconds;
  const expiryDate = new Date(expirySeconds * 1000);

  if (!signatureMatches) {
    return {
      valid: false,
      reason: 'HMAC-SHA256 signature mismatch! Key has been forged or modified.',
      tier: tierStr as KeyTier,
      duration: durationStr as KeyDuration,
      kid,
      expHex,
      expirySeconds,
      expiryDate,
      sig,
      computedSig,
      payload
    };
  }

  return {
    valid: true,
    isExpired,
    tier: tierStr as KeyTier,
    duration: durationStr as KeyDuration,
    kid,
    expHex,
    expirySeconds,
    expiryDate,
    sig,
    computedSig,
    payload
  };
}

/**
 * Format relative time remaining
 */
export function formatTimeRemaining(expirySeconds: number): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const diff = expirySeconds - nowSeconds;

  if (diff <= 0) return 'EXPIRED';

  const days = Math.floor(diff / 86400);
  if (days > 3650) return 'LIFETIME (Permanent)';
  if (days > 0) return `${days}d ${Math.floor((diff % 86400) / 3600)}h left`;

  const hours = Math.floor(diff / 3600);
  if (hours > 0) return `${hours}h ${Math.floor((diff % 3600) / 60)}m left`;

  const minutes = Math.floor(diff / 60);
  return `${minutes}m ${diff % 60}s left`;
}
