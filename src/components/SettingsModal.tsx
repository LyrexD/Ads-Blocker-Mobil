import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  ExternalLink, 
  Activity, 
  Sliders, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Globe, 
  Copy, 
  Check, 
  Download,
  HelpCircle
} from 'lucide-react';
import { AndroidIntentHelper } from './AndroidIntentHelper';
import { DnsDiagnostics } from './DnsDiagnostics';
import { QuickSettingsTileGuide } from './QuickSettingsTileGuide';
import { PWAInstallButton } from './PWAInstallButton';
import { openAndroidIntent } from '../utils/androidIntents';
import { triggerHaptic } from '../utils/audioHaptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHostname: string;
  onSelectHostname: (hostname: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentMode: 'adguard' | 'auto';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedHostname,
  onSelectHostname,
  soundEnabled,
  onToggleSound,
  currentMode,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'android' | 'speed' | 'guide'>('general');
  const [copied, setCopied] = useState(false);
  const [customHost, setCustomHost] = useState('');

  if (!isOpen) return null;

  const copyHostname = () => {
    navigator.clipboard.writeText(selectedHostname);
    setCopied(true);
    triggerHaptic([30]);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customHost.trim()) {
      onSelectHostname(customHost.trim().toLowerCase());
      setCustomHost('');
      triggerHaptic([30]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-200">
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ayarlar ve Araçlar</h2>
              <p className="text-[11px] text-slate-400">DNS yapılandırması ve gelişmiş seçenekler</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/60 border-b border-slate-800 text-xs overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'general' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Genel Ayarlar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'android' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Android Menüleri
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('speed')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'speed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hız & Teşhis Testi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
              activeTab === 'guide' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bildirim Kutusu & ADB
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'general' && (
            <div className="space-y-4">
              
              {/* Direct Android Setting Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 to-slate-900 border border-blue-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">Android Telefon Ayarları</span>
                  <Smartphone className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-slate-300">
                  Telefonun kendi Özel DNS menüsünü açmak için alttaki butona dokunun:
                </p>
                <button
                  type="button"
                  onClick={() => openAndroidIntent('intent:#Intent;action=android.settings.WIRELESS_SETTINGS;end')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Android Özel DNS Menüsünü Aç</span>
                </button>
              </div>

              {/* DNS Hostname selector */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Kullanılan DNS Adresi</span>
                
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                  <code className="text-xs font-mono font-bold text-emerald-400">{selectedHostname}</code>
                  <button
                    type="button"
                    onClick={copyHostname}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Hazır Adresler:</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectHostname('dns.adguard.com')}
                      className={`text-left p-2 rounded-xl text-xs border transition ${
                        selectedHostname === 'dns.adguard.com'
                          ? 'bg-emerald-950/50 border-emerald-500 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>dns.adguard.com</div>
                      <div className="text-[10px] text-slate-400 font-normal">Standart AdGuard (Tüm reklam ve izleyicileri engeller)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectHostname('family.adguard-dns.com')}
                      className={`text-left p-2 rounded-xl text-xs border transition ${
                        selectedHostname === 'family.adguard-dns.com'
                          ? 'bg-emerald-950/50 border-emerald-500 text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>family.adguard-dns.com</div>
                      <div className="text-[10px] text-slate-400 font-normal">AdGuard Aile (Yetişkin içerik ve reklam engelleme)</div>
                    </button>
                  </div>
                </div>

                {/* Custom DNS input */}
                <form onSubmit={handleCustomSubmit} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Farklı bir DNS ana makinesi yaz..."
                    value={customHost}
                    onChange={(e) => setCustomHost(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                  >
                    Kaydet
                  </button>
                </form>
              </div>

              {/* Sound & Haptic toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Tıklama Sesleri</span>
                    <span className="text-[11px] text-slate-400">Düğmeye basıldığında sesli geri bildirim ver</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Install PWA Button */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                    <Download className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Ana Ekrana Ekle / Yükle</span>
                    <span className="text-[11px] text-slate-400">Tarayıcı çubuğu olmadan tam uygulama gibi çalışsın</span>
                  </div>
                </div>
                <PWAInstallButton />
              </div>

              {/* FAQ */}
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2 text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Basit Bilgi</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ananeniz için sadece ana ekrandaki büyük butona basması yeterlidir. Yeşil yandığında reklamlar engellenir, gri yandığında telefon kendi varsayılan internetine döner.
                </p>
              </div>

            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-4">
              <AndroidIntentHelper selectedHostname={selectedHostname} />
            </div>
          )}

          {activeTab === 'speed' && (
            <div className="space-y-4">
              <DnsDiagnostics currentMode={currentMode} selectedHostname={selectedHostname} />
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <QuickSettingsTileGuide />
            </div>
          )}
        </div>

        {/* Footer close button */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Tamam (Kapat)
          </button>
        </div>

      </div>
    </div>
  );
};
