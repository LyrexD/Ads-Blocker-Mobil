import React, { useState } from 'react';
import { X, Check, Shield, Users, Globe, Edit3 } from 'lucide-react';
import { triggerHaptic } from '../utils/audioHaptics';

export interface DnsPreset {
  id: string;
  name: string;
  hostname: string;
  description: string;
  features: string[];
}

export const DNS_PRESETS: DnsPreset[] = [
  {
    id: 'adguard-default',
    name: 'AdGuard Standart (Önerilen)',
    hostname: 'dns.adguard.com',
    description: 'Tüm uygulamalardaki reklamları, analiz takipçilerini ve zararlı siteleri engeller.',
    features: ['Reklam Engelleme', 'Gizlilik Koruması', 'Hızlı Yanıt Süresi'],
  },
  {
    id: 'adguard-family',
    name: 'AdGuard Aile Koruması',
    hostname: 'family.adguard-dns.com',
    description: 'Yetişkin içerikli siteleri engeller ve güvenli arama modunu zorunlu kılar.',
    features: ['Ebeveyn Kontrolü', 'Güvenli Arama', 'Reklam Engelleme'],
  },
  {
    id: 'adguard-unfiltered',
    name: 'AdGuard Filtresiz DNS',
    hostname: 'unfiltered.adguard-dns.com',
    description: 'Hiçbir engelleme yapmadan şifreli DNS sorguları sağlar (maksimum hız).',
    features: ['Sıfır Günlük Kaydı', 'Şifreli DoT', 'Orijinal İçerik'],
  },
];

interface DnsPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHostname: string;
  onSelectHostname: (hostname: string) => void;
}

export const DnsPresetsModal: React.FC<DnsPresetsModalProps> = ({
  isOpen,
  onClose,
  selectedHostname,
  onSelectHostname,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (host: string) => {
    triggerHaptic([30]);
    onSelectHostname(host);
    onClose();
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      handleSelect(customInput.trim().toLowerCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Özel DNS Sunucusu Seç</h3>
            <p className="text-[11px] text-slate-400">AdGuard veya özel sunucu adresi belirleyin</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mt-4">
          {DNS_PRESETS.map((preset) => {
            const isSelected = selectedHostname === preset.hostname;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelect(preset.hostname)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{preset.name}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <code className="text-xs font-mono font-bold text-emerald-400 block mb-1">
                  {preset.hostname}
                </code>
                <p className="text-slate-400 text-[11px] mb-2">{preset.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {preset.features.map((feat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}

          {/* Custom Hostname option */}
          <div className="pt-2">
            {!showCustom ? (
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-dashed border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold"
              >
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Başka Bir Özel DNS Adresi Yaz</span>
              </button>
            ) : (
              <form onSubmit={handleSaveCustom} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Özel Ana Makine Adı (Hostname):
                </label>
                <input
                  type="text"
                  placeholder="örn: custom.dns.net"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    Ayarla
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustom(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Vazgeç
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
