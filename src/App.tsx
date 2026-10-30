import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Power, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { playToggleSound, triggerHaptic } from './utils/audioHaptics';
import { openAndroidIntent, isVpnActive, stopLocalDns, setPrivateDns } from './utils/androidIntents';

export default function App() {
  const [currentMode, setCurrentMode] = useState<'adguard' | 'auto'>('auto');
  const [selectedHostname, setSelectedHostname] = useState<string>('dns.adguard.com');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dns_sound_fx');
      return saved !== 'false';
    }
    return true;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync actual VPN status on launch
  useEffect(() => {
    isVpnActive().then((active) => {
      setCurrentMode(active ? 'adguard' : 'auto');
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('dns_sound_fx', String(soundEnabled));
  }, [soundEnabled]);

  const handleMainButtonClick = async () => {
    if (soundEnabled) {
      playToggleSound(currentMode === 'adguard' ? 'auto' : 'adguard');
    }
    triggerHaptic([40]);

    if (currentMode === 'adguard') {
      // Turn OFF
      const res = await setPrivateDns('off', selectedHostname);
      if (res.success) {
        await stopLocalDns();
        setCurrentMode('auto');
        showToast('KORUMA KAPATILDI — Normal bağlantı aktif');
      } else {
        showToast(res.error === 'PERMISSION_DENIED'
          ? 'Özel DNS izni yok. Android ayarlarından DNS’i kapatın.'
          : 'DNS kapatılamadı. Ayarlardan yeniden deneyin.');
      }
    } else {
      // Turn ON
      showToast('Bağlantı başlatılıyor...');
      const res = await setPrivateDns('hostname', selectedHostname);
      if (res.success) {
        await stopLocalDns();
        setCurrentMode('adguard');
        showToast('KORUMA AÇILDI — Reklamlar ve takipçiler engelleniyor');
      } else if (res.error === 'PERMISSION_DENIED') {
        setCurrentMode('auto');
        showToast('Sistem DNS izni yok. Ayarlardan Özel DNS’i elle açın.');
      } else {
        setCurrentMode('auto');
        showToast('DNS değiştirilemedi. Android sürümünüz desteklemiyor olabilir.');
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const isAdguard = currentMode === 'adguard';

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between p-5 select-none relative overflow-hidden">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center w-full max-w-md mx-auto pt-2 z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            AdGuard DNS
          </span>
          {isAdguard && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold animate-pulse">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Aktif Koruma</span>
            </span>
          )}
        </div>

        {/* Settings Gear button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic([30]);
            setIsSettingsOpen(true);
          }}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-90 transition shadow-lg"
          aria-label="Ayarlar"
        >
          <Settings className="w-6 h-6 text-slate-200 animate-in fade-in" />
        </button>
      </div>

      {/* Center: The ONE BIG BUTTON */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto z-10 py-6">
        
        {/* Ambient background glow */}
        <div
          className={`absolute w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isAdguard
              ? 'bg-emerald-500/25 scale-110 opacity-100'
              : 'bg-slate-700/10 scale-90 opacity-40'
          }`}
        />

        {/* The Big Button */}
        <button
          type="button"
          onClick={handleMainButtonClick}
          className={`relative flex flex-col items-center justify-center w-72 h-72 sm:w-80 sm:h-80 rounded-full transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer ${
            isAdguard
              ? 'bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-700 shadow-[0_0_60px_rgba(16,185,129,0.45)] border-4 border-emerald-300/40 ring-8 ring-emerald-500/20'
              : 'bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 shadow-[0_0_30px_rgba(0,0,0,0.6)] border-4 border-slate-700 ring-8 ring-slate-800/30'
          }`}
        >
          {isAdguard && (
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-200/50 animate-[spin_20s_linear_infinite]" />
          )}

          <div className="mb-3 transition-transform duration-300">
            {isAdguard ? (
              <ShieldCheck className="w-24 h-24 sm:w-28 sm:h-28 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] animate-in zoom-in-75 duration-200" />
            ) : (
              <Power className="w-20 h-20 sm:w-24 sm:h-24 text-slate-400 drop-shadow animate-in zoom-in-75 duration-200" />
            )}
          </div>

          <span className="text-xl sm:text-2xl font-black tracking-wide uppercase drop-shadow-md text-white text-center leading-tight">
            {isAdguard ? 'KORUMA AÇIK' : 'KORUMA KAPALI'}
          </span>

          <span className={`text-xs sm:text-sm font-semibold mt-1 px-3 py-0.5 rounded-full ${
            isAdguard
              ? 'bg-emerald-950/40 text-emerald-100 border border-emerald-400/30'
              : 'bg-slate-900/60 text-slate-400 border border-slate-700/50'
          }`}>
            {isAdguard ? 'Reklamlar Engelleniyor' : 'Dokun ve Koru'}
          </span>
        </button>

        <p className="mt-8 text-center text-sm sm:text-base font-medium text-slate-400 max-w-xs leading-relaxed">
          {isAdguard
            ? 'Kapatmak için düğmeye dokunun.'
            : 'Reklamları engellemek için düğmeye dokunun.'}
        </p>

        {/* Fast shortcut to Android settings */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic([30]);
            openAndroidIntent('intent:#Intent;action=android.settings.WIRELESS_SETTINGS;end');
          }}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Android Ayarlarında Aç</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="w-full max-w-md mx-auto text-center pb-2 z-10">
        <span className="text-[11px] text-slate-600 font-medium">
          AdGuard DNS • 94.140.14.14
        </span>
      </div>

      {/* Big Friendly Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm rounded-2xl bg-emerald-600 text-white font-bold text-center py-3.5 px-5 shadow-2xl shadow-emerald-950 text-sm flex items-center justify-center gap-2 border border-emerald-400/40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check className="w-5 h-5 shrink-0 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Toast */}
      <OfflineIndicator />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedHostname={selectedHostname}
        onSelectHostname={setSelectedHostname}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        currentMode={currentMode}
      />
    </div>
  );
}
