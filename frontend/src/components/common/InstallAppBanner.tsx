import React, { useState, useEffect } from 'react';
import { Download, X, ShoppingBag } from 'lucide-react';

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed before
      const dismissed = localStorage.getItem('mama_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('mama_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="lg:hidden bg-slate-900 text-white px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <img
          src="/logo.png"
          alt="Mama App Icon"
          className="w-8 h-8 rounded-lg bg-white p-0.5 object-contain shrink-0 shadow-xs"
        />
        <div>
          <span className="font-bold block text-white leading-tight">Install Mama App</span>
          <span className="text-[10px] text-slate-400">Shop faster & track deliveries directly</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 bg-[#E15712] hover:bg-[#c4470a] text-white font-bold rounded-lg text-[11px] shadow-xs"
        >
          Install
        </button>
        <button onClick={handleDismiss} className="p-1 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
