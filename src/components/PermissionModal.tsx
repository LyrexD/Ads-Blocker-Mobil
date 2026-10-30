import React, { useState } from 'react';
import { X, ShieldAlert, Copy, Check, ExternalLink, Terminal, Smartphone } from 'lucide-react';
import { openAndroidIntent } from '../utils/androidIntents';
import { triggerHaptic } from '../utils/audioHaptics';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHostname: string;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  selectedHostname,
}) => {
  const [copied, setCopied] = useState(false);
  const adbCommand = 'adb shell pm grant com.autodns.app android.permission.WRITE_SECURE_SETTINGS';

  if (!isOpen) return null;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(adbCommand);
    setCopied(true);
    triggerHaptic([30]);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenSettings = () => {
    navigator.clipboard.writeText(selectedHostname);
    triggerHaptic([30]);
    openAndroidIntent('intent:#Intent;action=android.settings.WIRELESS_SETTINGS;end');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 p-5 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sistem Ayarı İzni Gerekli</h3>
              <p className="text-[11px] text-slate-400">Doğrudan Özel DNS değiştirmek için</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-300 leading-relaxed">
          Android işletim sistemi, uygulamaların sistem genelindeki <span className="font-semibold text-white">Özel DNS</span> ayarını doğrudan değiştirebilmesi için 1 defalık güvenlik izni (<code className="text-amber-300">WRITE_SECURE_SETTINGS</code>) gerektirir.
        </p>

        {/* 1. Method: ADB Command */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>1. Yöntem: ADB Komutu (1 Defalık)</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 break-all select-all relative group">
            {adbCommand}
          </div>
          <button
            type="button"
            onClick={handleCopyCommand}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-lg shadow-emerald-950/40"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Komut Panoya Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>ADB Komutunu Kopyala</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-400 italic">
            * Bilgisayar veya telefondaki Shizuku uygulaması ile bu komutu bir kez çalıştırdığınızda buton artık her zaman doğrudan çalışır.
          </p>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase font-bold">veya</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* 2. Method: Manual Settings */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>2. Yöntem: Manuel Olarak Ayarla</span>
          </div>
          <button
            type="button"
            onClick={handleOpenSettings}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-98 border border-slate-700"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Android Ayarlarında Aç ({selectedHostname})</span>
          </button>
          <p className="text-[10px] text-slate-400">
            DNS adresi panonuza kopyalanır ve telefonun Ağ & İnternet menüsü açılır.
          </p>
        </div>

      </div>
    </div>
  );
};
