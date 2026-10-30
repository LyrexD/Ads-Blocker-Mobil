import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed PWA, render a subtle installed badge or nothing
  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Uygulama Yüklü</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 3000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          type="button"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Telefona Yükle</span>
        </button>
        {justInstalled && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg">
            Uygulama ana ekranınıza eklendi!
          </div>
        )}
      </>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Ana Ekrana Ekle</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white">iPhone / iPad Kurulumu</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 mt-0.5">1</span>
                  <p>Safari tarayıcısının altındaki <strong className="text-white">Paylaş</strong> (kare içinde yukarı ok) butonuna dokunun.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 mt-0.5">2</span>
                  <p>Aşağı kaydırın ve <strong className="text-white">Ana Ekrana Ekle</strong> seçeneğini seçin.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 mt-0.5">3</span>
                  <p>Sağ üstteki <strong className="text-white">Ekle</strong> butonuna basarak tek tıkla erişin.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-slate-800 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => {
        alert('Bu uygulamayı Android ana ekranınıza eklemek için Chrome menüsünden (üç nokta) "Ana Ekrana Ekle" veya "Uygulamayı Yükle" seçeneğini kullanabilirsiniz.');
      }}
      type="button"
      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition"
      title="Uygulama olarak kullan"
    >
      <Download className="w-3.5 h-3.5 text-emerald-400" />
      <span>Yükle</span>
    </button>
  );
};
