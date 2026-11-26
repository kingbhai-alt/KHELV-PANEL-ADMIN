import React, { useState, useEffect } from 'react';
import { LicenseKeyRecord, KeyStatus } from './types';
import { getStoredKeys, saveKeys } from './utils/storage';
import { AdminLockScreen } from './components/AdminLockScreen';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { KeyGenerator } from './components/KeyGenerator';
import { GeneratedKeyBanner } from './components/GeneratedKeyBanner';
import { KeyTable } from './components/KeyTable';
import { QrCodeModal } from './components/QrCodeModal';
import { ShareKeyModal } from './components/ShareKeyModal';
import { KeyVerifierModal } from './components/KeyVerifierModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('KHELV_PENEL_ADMIN_AUTH') === 'true';
    }
    return false;
  });

  const [keys, setKeys] = useState<LicenseKeyRecord[]>([]);
  const [recentlyGenerated, setRecentlyGenerated] = useState<LicenseKeyRecord[]>([]);

  // Modals state
  const [qrModalKey, setQrModalKey] = useState<LicenseKeyRecord | null>(null);
  const [shareModalKey, setShareModalKey] = useState<LicenseKeyRecord | null>(null);
  const [inspectKey, setInspectKey] = useState<string | null>(null);
  const [showVerifierModal, setShowVerifierModal] = useState(false);

  // Load keys on mount
  useEffect(() => {
    const existing = getStoredKeys();
    if (existing.length === 0) {
      // Seed initial example key from user prompt
      const seedKey: LicenseKeyRecord = {
        id: 'key_prompt_example',
        key: 'KHELVPENEL-VIP-7D-E1E4C16F-6B49D200-0D55223298696F20',
        tier: 'VIP',
        duration: '7D',
        kid: 'E1E4C16F',
        expHex: '6B49D200',
        expirySeconds: 1800000000,
        sig: '0D55223298696F20',
        payload: 'KLP:VIP:7D:E1E4C16F:1800000000',
        clientName: 'Khelv Penel Demo',
        createdAt: Date.now() - 3600000,
        status: 'ACTIVE'
      };
      setKeys([seedKey]);
      saveKeys([seedKey]);
    } else {
      setKeys(existing);
    }
  }, []);

  const handleUnlock = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('KHELV_PENEL_ADMIN_AUTH', 'true');
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('KHELV_PENEL_ADMIN_AUTH');
  };

  const handleKeysGenerated = (newKeys: LicenseKeyRecord[]) => {
    const updated = [...newKeys, ...keys];
    setKeys(updated);
    saveKeys(updated);
    setRecentlyGenerated(newKeys);
    // Smooth scroll to top if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = (id: string, newStatus: KeyStatus) => {
    const updated = keys.map((k) =>
      k.id === id
        ? {
            ...k,
            status: newStatus,
            revokedAt: newStatus === 'REVOKED' ? Date.now() : undefined,
          }
        : k
    );
    setKeys(updated);
    saveKeys(updated);
  };

  const handleDeleteKey = (id: string) => {
    const updated = keys.filter((k) => k.id !== id);
    setKeys(updated);
    saveKeys(updated);
    if (recentlyGenerated.some((k) => k.id === id)) {
      setRecentlyGenerated((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const handleClearAll = () => {
    setKeys([]);
    saveKeys([]);
    setRecentlyGenerated([]);
  };

  const handleOpenVerifier = (keyString?: string) => {
    setInspectKey(keyString || '');
    setShowVerifierModal(true);
  };

  if (!isAuthenticated) {
    return <AdminLockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background cyber grid & glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-10 w-[500px] h-[400px] bg-blue-600/5 rounded-full blur-[140px]" />
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* Navigation Header */}
      <Header onLock={handleLock} onOpenVerifier={() => handleOpenVerifier('')} />

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Live Stats */}
        <StatsBar keys={keys} />

        {/* Recently Generated Banner */}
        {recentlyGenerated.length > 0 && (
          <GeneratedKeyBanner
            keys={recentlyGenerated}
            onClose={() => setRecentlyGenerated([])}
            onOpenQr={(key) => setQrModalKey(key)}
            onOpenShare={(key) => setShareModalKey(key)}
          />
        )}

        {/* Generator Controls */}
        <KeyGenerator onKeysGenerated={handleKeysGenerated} />

        {/* Vault & History Table */}
        <KeyTable
          keys={keys}
          onUpdateStatus={handleUpdateStatus}
          onDeleteKey={handleDeleteKey}
          onClearAll={handleClearAll}
          onOpenQr={(key) => setQrModalKey(key)}
          onOpenShare={(key) => setShareModalKey(key)}
          onInspectKey={(keyString) => handleOpenVerifier(keyString)}
        />
      </main>

      {/* Modals */}
      {qrModalKey && (
        <QrCodeModal
          keyRecord={qrModalKey}
          onClose={() => setQrModalKey(null)}
        />
      )}

      {shareModalKey && (
        <ShareKeyModal
          keyRecord={shareModalKey}
          onClose={() => setShareModalKey(null)}
        />
      )}

      {showVerifierModal && (
        <KeyVerifierModal
          initialKey={inspectKey || ''}
          onClose={() => {
            setShowVerifierModal(false);
            setInspectKey(null);
          }}
        />
      )}
    </div>
  );
}
