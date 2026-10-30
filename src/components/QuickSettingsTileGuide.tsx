import React, { useState } from 'react';
import { Terminal, Sliders, Copy, Check, Sparkles, HelpCircle, Layers, Cpu } from 'lucide-react';
import { triggerHaptic } from '../utils/audioHaptics';

export const QuickSettingsTileGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tile' | 'adb' | 'macro'>('tile');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const adbAdguardCmd = `adb shell settings put global private_dns_mode hostname && adb shell settings put global private_dns_specifier dns.adguard.com`;
  const adbAutoCmd = `adb shell settings put global private_dns_mode opportunistic`;
  const termuxToggleScript = `#!/data/data/com.termux/files/usr/bin/bash
current=$(settings get global private_dns_mode)
if [ "$current" = "hostname" ]; then
  settings put global private_dns_mode opportunistic
  echo "Otomatik DNS'e geçildi"
else
  settings put global private_dns_mode hostname
  settings put global private_dns_specifier dns.adguard.com
  echo "AdGuard DNS aktif edildi"
fi`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    triggerHaptic([25]);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Bildirim Çubuğu & Otomasyon</h3>
          <p className="text-[11px] text-slate-400">Ekran kilidini açmadan tek tıkla değiştirmek için yöntemler</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('tile')}
          className={`py-1.5 px-2 rounded-xl transition-all ${
            activeTab === 'tile' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hızlı Ayar Kutusu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('adb')}
          className={`py-1.5 px-2 rounded-xl transition-all ${
            activeTab === 'adb' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ADB / Shizuku
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('macro')}
          className={`py-1.5 px-2 rounded-xl transition-all ${
            activeTab === 'macro' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Macrodroid / Tasker
        </button>
      </div>

      {/* Tab 1: Quick Settings Tile */}
      {activeTab === 'tile' && (
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Bildirim Paneli Hızlı Kutucuğu (Quick Tile)</span>
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Telefonunuzun bildirim çubuğunu 2 kere aşağı kaydırıp Özel DNS kutucuğu ekleyebilirsiniz:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
              <li>Bildirim çubuğunu aşağı kaydırıp <strong className="text-white">Düzenle (Kalem simgesi)</strong>ne dokunun.</li>
              <li>Aşağıdaki etkin olmayan kutucuklar arasında <strong className="text-white">"Özel DNS"</strong> veya <strong className="text-white">"Private DNS"</strong> bulun.</li>
              <li>Kutucuğu yukarı sürükleyip en başa bırakın.</li>
              <li>Artık herhangi bir uygulamadayken tek dokunuşla Özel DNS'i açıp kapatabilirsiniz!</li>
            </ol>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p>
              Eğer telefonunuzda hazır kutucuk yoksa, Google Play'den ücretsiz <strong>"Tile Shortcuts"</strong> veya <strong>"SystemUI Tuner"</strong> yükleyerek doğrudan tek tık DNS butonu oluşturabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: ADB / Shizuku */}
      {activeTab === 'adb' && (
        <div className="space-y-3 text-xs">
          <p className="text-[11px] text-slate-300">
            Android'de menülere hiç girmeden komut satırından tek tıkla değiştirmek için komutlar (Root gerektirmez):
          </p>

          {/* Command 1: Switch to AdGuard */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400">1. AdGuard Özel DNS'e Geçiş Komutu</span>
              <button
                type="button"
                onClick={() => copyToClipboard(adbAdguardCmd, 'adguard')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold"
              >
                {copiedCmd === 'adguard' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'adguard' ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
            <code className="block p-2 rounded-xl bg-black/60 font-mono text-[10px] text-emerald-300 break-all select-all">
              {adbAdguardCmd}
            </code>
          </div>

          {/* Command 2: Switch to Auto */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400">2. Otomatik DNS'e Geçiş Komutu</span>
              <button
                type="button"
                onClick={() => copyToClipboard(adbAutoCmd, 'auto')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold"
              >
                {copiedCmd === 'auto' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'auto' ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
            <code className="block p-2 rounded-xl bg-black/60 font-mono text-[10px] text-blue-300 break-all select-all">
              {adbAutoCmd}
            </code>
          </div>

          {/* Termux Script */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-400">3. Termux / Shizuku Otomatik Toggle Scripti</span>
              <button
                type="button"
                onClick={() => copyToClipboard(termuxToggleScript, 'script')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold"
              >
                {copiedCmd === 'script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'script' ? 'Kopyalandı' : 'Scripti Al'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Bu script tek çalıştırmada durumu kontrol eder; Otomatik ise AdGuard'a, AdGuard ise Otomatik'e alır.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: MacroDroid / Tasker */}
      {activeTab === 'macro' && (
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>MacroDroid / Tasker ile Ana Ekran Butonu</span>
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Telefonunuzun ana ekranına tek tıkla basıp değiştiren bir masaüstü widget düğmesi koyabilirsiniz:
            </p>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <p><strong>Tetikleyici (Trigger):</strong> Ana Ekran Widget Dokunuşu (Widget Button)</p>
              <p><strong>Eylem (Action):</strong> Sistem Ayarını Değiştir (System Setting)</p>
              <div className="bg-black/50 p-2 rounded-xl font-mono text-[10px] space-y-1 text-slate-300">
                <div>Tablo: <strong>global</strong></div>
                <div>Ayar Adı: <strong>private_dns_mode</strong></div>
                <div>Değer: <strong>hostname</strong> (Özel DNS için) / <strong>opportunistic</strong> (Otomatik için)</div>
                <div>Ana Makine: <strong>dns.adguard.com</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
