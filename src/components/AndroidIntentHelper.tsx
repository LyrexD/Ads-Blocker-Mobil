import React, { useState } from 'react';
import { ANDROID_INTENTS, openAndroidIntent } from '../utils/androidIntents';
import { Smartphone, ChevronRight, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { triggerHaptic } from '../utils/audioHaptics';

interface AndroidIntentHelperProps {
  selectedHostname: string;
}

export const AndroidIntentHelper: React.FC<AndroidIntentHelperProps> = ({ selectedHostname }) => {
  const [selectedBrand, setSelectedBrand] = useState<'general' | 'samsung' | 'xiaomi'>('general');

  const handleLaunch = (intentUrl: string) => {
    triggerHaptic([30]);
    openAndroidIntent(intentUrl);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Android Ayar Kısayolları</h3>
            <p className="text-[11px] text-slate-400">Telefon modelinize göre en uygun menüyü doğrudan açın</p>
          </div>
        </div>
      </div>

      {/* Brand selector tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSelectedBrand('general')}
          className={`py-1.5 px-2 rounded-xl transition-all ${
            selectedBrand === 'general'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Genel / Pixel
        </button>
        <button
          type="button"
          onClick={() => setSelectedBrand('samsung')}
          className={`py-1.5 px-2 rounded-xl transition-all ${
            selectedBrand === 'samsung'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Samsung
        </button>
        <button
          type="button"
          onClick={() => setSelectedBrand('xiaomi')}
          className={`py-1.5 px-2 rounded-xl transition-all ${
            selectedBrand === 'xiaomi'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Xiaomi / Poco
        </button>
      </div>

      {/* Brand-specific guidance and direct intent trigger */}
      <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs mb-3 space-y-2">
        {selectedBrand === 'general' && (
          <>
            <p className="text-slate-300">
              <strong className="text-white">Genel Android (10, 11, 12, 13, 14, 15):</strong><br />
              <span className="text-slate-400">Ayarlar &gt; Ağ ve İnternet &gt; Özel DNS (Private DNS)</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLaunch('intent:#Intent;action=android.settings.WIRELESS_SETTINGS;end')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition"
              >
                <span>Ağ Menüsünü Aç</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleLaunch('intent:#Intent;action=android.settings.NETWORK_OPERATOR_SETTINGS;end')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
              >
                <span>Özel DNS Menüsü</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {selectedBrand === 'samsung' && (
          <>
            <p className="text-slate-300">
              <strong className="text-white">Samsung One UI:</strong><br />
              <span className="text-slate-400">Ayarlar &gt; Bağlantılar &gt; Diğer Bağlantı Ayarları &gt; Özel DNS</span>
            </p>
            <button
              type="button"
              onClick={() => handleLaunch('intent:#Intent;action=com.android.settings.WIFI_SETTINGS;end')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition"
            >
              <span>Samsung Bağlantı Menüsünü Aç</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {selectedBrand === 'xiaomi' && (
          <>
            <p className="text-slate-300">
              <strong className="text-white">Xiaomi / Redmi / POCO (MIUI / HyperOS):</strong><br />
              <span className="text-slate-400">Ayarlar &gt; Bağlantı ve Paylaşım &gt; Özel DNS</span>
            </p>
            <button
              type="button"
              onClick={() => handleLaunch('intent:#Intent;action=android.settings.WIRELESS_SETTINGS;end')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition"
            >
              <span>Xiaomi Bağlantı Ayarlarını Aç</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* 3 Step Interactive Walkthrough */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Tek Tıkla Geçiş Adımları</h4>
        
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            1
          </div>
          <div className="text-xs">
            <span className="text-slate-200 font-medium">Özel DNS Moduna Geçerken:</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Üstteki yeşil butona tıklayınca <code className="text-emerald-400 font-mono font-semibold">{selectedHostname}</code> otomatik kopyalanır. Menüyü açıp yapıştırın ve Kaydet'e basın.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            2
          </div>
          <div className="text-xs">
            <span className="text-slate-200 font-medium">Otomatik DNS Moduna Geçerken:</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Butona tekrar basıp menüyü açın, listeden <strong className="text-slate-200">"Otomatik"</strong> seçeneğini işaretleyip Kaydet'e basın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
