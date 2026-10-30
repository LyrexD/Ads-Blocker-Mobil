import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Copy, Check, ExternalLink, Zap, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { playToggleSound, triggerHaptic } from '../utils/audioHaptics';
import { openAndroidIntent } from '../utils/androidIntents';

interface DnsToggleHeroProps {
  currentMode: 'adguard' | 'auto';
  onToggle: () => void;
  selectedHostname: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const DnsToggleHero: React.FC<DnsToggleHeroProps> = ({
  currentMode,
  onToggle,
  selectedHostname,
  soundEnabled,
  onToggleSound,
}) => {
  const [copied, setCopied] = useState(false);
  const isAdguard = currentMode === 'adguard';

  const handleHeroClick = () => {
    if (soundEnabled) {
      playToggleSound(isAdguard ? 'auto' : 'adguard');
    }
    triggerHaptic(isAdguard ? [30] : [40, 20, 40]);
    onToggle();

    // Auto copy hostname if activating AdGuard
    if (!isAdguard) {
      navigator.clipboard.writeText(selectedHostname).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }).catch(() => {});
    }
  };

  const copyHostname = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(selectedHostname);
    setCopied(true);
    triggerHaptic([20]);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic([30]);
    // Try primary intent: android.settings.WIRELESS_SETTINGS
    openAndroidIntent('intent:#Intent;action=android.settings.WIRELESS_SETTINGS;end');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 p-5 shadow-2xl backdrop-blur-xl">
      {/* Background ambient glow effect */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isAdguard ? 'bg-emerald-500/20 opacity-100' : 'bg-cyan-500/10 opacity-60'
        }`}
      />

      {/* Top micro toolbar */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-medium text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isAdguard ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
          <span>{isAdguard ? 'Özel DNS Aktif' : 'Otomatik DNS Modu'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Giant Central 1-Click Toggle Button */}
      <div className="flex flex-col items-center justify-center my-4 relative z-10">
        <button
          type="button"
          onClick={handleHeroClick}
          aria-label="DNS Modunu Değiştir"
          className={`group relative flex items-center justify-center w-48 h-48 rounded-full transition-all duration-500 active:scale-95 focus:outline-none select-none cursor-pointer ${
            isAdguard
              ? 'shadow-[0_0_50px_rgba(16,185,129,0.35)]'
              : 'shadow-[0_0_30px_rgba(59,130,246,0.15)]'
          }`}
        >
          {/* Animated concentric rings */}
          <div
            className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 ${
              isAdguard
                ? 'border-emerald-500/40 animate-[spin_10s_linear_infinite]'
                : 'border-slate-700/60'
            }`}
          />
          <div
            className={`absolute -inset-2 rounded-full border transition-all duration-500 ${
              isAdguard ? 'border-emerald-500/20 animate-pulse' : 'border-transparent'
            }`}
          />

          {/* Inner core circle */}
          <div
            className={`relative flex flex-col items-center justify-center w-40 h-40 rounded-full transition-all duration-500 ${
              isAdguard
                ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-inner'
                : 'bg-gradient-to-tr from-slate-800 via-slate-800/90 to-slate-700 text-slate-300 border border-slate-700/80 hover:border-slate-600'
            }`}
          >
            {isAdguard ? (
              <>
                <ShieldCheck className="w-14 h-14 mb-1 drop-shadow-md text-white transition-transform group-hover:scale-105 duration-300" />
                <span className="text-xs font-black tracking-wider uppercase drop-shadow">ADGUARD</span>
                <span className="text-[10px] font-medium opacity-90">Korumalı DNS</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-12 h-12 mb-1.5 text-slate-400 transition-transform group-hover:rotate-45 duration-300" />
                <span className="text-xs font-bold tracking-wider uppercase text-slate-300">OTOMATİK</span>
                <span className="text-[10px] text-slate-400">Standart DNS</span>
              </>
            )}

            <div className="absolute bottom-2 flex items-center gap-1 text-[9px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-black/20 text-white/90">
              <Zap className="w-2.5 h-2.5 text-amber-300" />
              <span>Değiştirmek İçin Dokun</span>
            </div>
          </div>
        </button>

        {/* Current State Indicator details */}
        <div className="mt-4 text-center">
          <p className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
            {isAdguard ? (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Özel DNS: <code className="text-emerald-300 font-mono font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">{selectedHostname}</code></span>
              </>
            ) : (
              <span>Mod: <strong className="text-slate-300 font-medium">Otomatik (İnternet Sağlayıcısı)</strong></span>
            )}
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {isAdguard
              ? 'Tüm uygulamalarda ve oyunlarda reklamlar ile takipçiler filtrelenir.'
              : 'Standart bağlantı modu. Özel DNS filtresi olmadan doğrudan bağlanır.'}
          </p>
        </div>
      </div>

      {/* Copy Hostname & Quick Actions Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[11px] font-medium text-slate-400 shrink-0">DNS Sunucusu:</span>
            <code className="text-xs font-mono font-bold text-emerald-400 truncate">
              {selectedHostname}
            </code>
          </div>
          <button
            type="button"
            onClick={copyHostname}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Kopyala</span>
              </>
            )}
          </button>
        </div>

        {/* 1-Click Launch Android Settings Intent Button */}
        <button
          type="button"
          onClick={handleOpenSettings}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-blue-950/50 active:scale-[0.98] transition-all cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Android DNS Ayarını Aç (Tek Tıkla Git)</span>
        </button>

        <p className="text-[11px] text-center text-slate-400">
          Butona basınca Android <strong>Ağ ve İnternet &gt; Özel DNS</strong> ekranı açılır.
        </p>
      </div>
    </div>
  );
};
