import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  PlusSquare,
  ShieldCheck,
  Zap,
  Truck,
  QrCode,
  ArrowRight,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export const DownloadAppPage: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // If prompt isn't supported yet or already triggered
      alert("To install: tap your browser's menu (⋮ on Chrome or Share ⎋ on Safari) and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  const currentUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#E15712] via-[#FF550D] to-[#2FA0E1]" />

          {/* Official App Logo */}
          <div className="inline-block relative mb-6">
            <img
              src="/logo.png"
              alt="Mama Shopping Center App"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-contain mx-auto shadow-lg border border-slate-100 p-1 bg-white"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Mama Shopping Center <span className="text-[#E15712]">Mobile App</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Kampala's freshest supermarket experience directly in your pocket. Instant grocery orders, live delivery updates, and exclusive daily discounts.
          </p>

          {/* Quick Install Action */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {isInstalled ? (
              <div className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-sm shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>App is Already Installed on this Device!</span>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#E15712] hover:bg-[#c4470a] text-white rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-5 h-5" />
                <span>Install Mobile App Now</span>
              </button>
            )}

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#E15712]" />
              <span>Browse Supermarket Web</span>
            </Link>
          </div>
        </div>

        {/* Scan to Download / Open on Phone */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#E15712] text-xs font-bold">
                <QrCode className="w-4 h-4" />
                <span>Scan from Any Smartphone Camera</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Scan with your Phone to Download Instantly
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Point your iPhone or Android camera at the QR code. Tap the pop-up notification to open Mama Shopping Center and add it directly to your home screen!
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  {copied ? '✓ URL Copied to Clipboard!' : 'Copy Mobile App Link'}
                </button>
                <span className="text-[11px] text-slate-400 self-center font-mono">
                  {currentUrl}
                </span>
              </div>
            </div>

            {/* QR Code Graphic */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                <img
                  src="/mama_mobile_app_qr.png"
                  alt="Mama Shopping Center Mobile QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                />
              </div>
              <span className="mt-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Mama Shopping Center Mobile QR
              </span>
            </div>
          </div>
        </div>

        {/* 2-Step Instructions for Android & iPhone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Android Chrome Instructions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Android (Google Chrome)</h3>
                <span className="text-[11px] text-slate-400">Takes 5 seconds</span>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-[#E15712] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>Open the site in Google Chrome on your Android phone.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-[#E15712] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span>Tap the top <strong>"Install"</strong> banner, or tap the three dots <strong>(⋮)</strong> in Chrome.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-[#E15712] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. The official Mama icon will appear on your app drawer!</span>
              </li>
            </ol>
          </div>

          {/* iOS Safari Instructions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2FA0E1] flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Apple iPhone (Safari)</h3>
                <span className="text-[11px] text-slate-400">iOS 14+</span>
              </div>
            </div>

            <ol className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2FA0E1] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>Open the site in <strong>Safari</strong> on your iPhone.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2FA0E1] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span>Tap the <strong>Share button</strong> <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" /> at the bottom of the screen.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2FA0E1] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>Scroll down and select <strong>"Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" /></strong>. Done!</span>
              </li>
            </ol>
          </div>

        </div>

        {/* Supermarket Guarantees */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-bold tracking-tight">Why Shop Through the Mama App?</h3>
            <p className="text-xs text-slate-400 mt-1">Direct from our Kampala supermarket shelves to your kitchen.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#E15712] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">100% Genuine Supermarket Stock</h4>
              <p className="text-xs text-slate-400 leading-relaxed">No 3rd party brokers. We personally inspect, pack, and chill every order.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-[#2FA0E1] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Live Kampala Delivery Tracking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Follow your order step-by-step from dispatch to your door.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">MTN & Airtel Mobile Money</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Instant, secure payments in Ugandan Shillings (UGX) with 0 hassle.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
