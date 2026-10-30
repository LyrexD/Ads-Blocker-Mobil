import { registerPlugin, Capacitor } from '@capacitor/core';

export interface AndroidIntentOption {
  id: string;
  title: string;
  desc: string;
  intentUrl: string;
  recommendedFor: string;
}

export const ANDROID_INTENTS: AndroidIntentOption[] = [
  {
    id: 'wireless',
    title: 'Ağ & İnternet (En Yaygın)',
    desc: 'Doğrudan Özel DNS ayarının bulunduğu Ağ menüsünü açar.',
    intentUrl: 'intent:#Intent;action=android.settings.WIRELESS_SETTINGS;end',
    recommendedFor: 'Tüm Android 9-15 Cihazlar (Xiaomi, Pixel, Oppo, vb.)',
  },
  {
    id: 'network-operator',
    title: 'Bağlantı & Özel DNS Menüsü',
    desc: 'Özel DNS seçeneğini içeren bağlantı ayarlarını açar.',
    intentUrl: 'intent:#Intent;action=android.settings.NETWORK_OPERATOR_SETTINGS;end',
    recommendedFor: 'Android 10, 11, 12, 13, 14, 15',
  },
  {
    id: 'samsung',
    title: 'Samsung Galaxy (Diğer Bağlantı Ayarları)',
    desc: 'Samsung One UI için bağlantı ayarları sayfasını hedefler.',
    intentUrl: 'intent:#Intent;action=com.android.settings.WIFI_SETTINGS;end',
    recommendedFor: 'Samsung One UI (S20, S21, S22, S23, S24, A serisi)',
  },
  {
    id: 'main-settings',
    title: 'Genel Sistem Ayarları',
    desc: 'Ayar menüsünün ana sayfasını açar (Özel DNS aratabilirsiniz).',
    intentUrl: 'intent:#Intent;action=android.settings.SETTINGS;end',
    recommendedFor: 'Tüm Cihazlar (Yedek Seçenek)',
  },
];

export interface SystemDnsPluginInterface {
  getDnsStatus(): Promise<{
    hasPermission: boolean;
    mode: string;
    specifier: string;
    vpnRunning?: boolean;
    success: boolean;
    error?: string;
  }>;
  getVpnStatus(): Promise<{
    running: boolean;
  }>;
  startDnsVpn(options: { hostname?: string }): Promise<{
    success: boolean;
    running?: boolean;
    error?: string;
  }>;
  stopDnsVpn(): Promise<{
    success: boolean;
    running?: boolean;
  }>;
  setDnsMode(options: {
    mode: string;
    hostname: string;
  }): Promise<{
    success: boolean;
    mode?: string;
    hostname?: string;
    error?: string;
    message?: string;
  }>;
  openSetting(options: { target: string }): Promise<void>;
}

export const SystemDns = registerPlugin<SystemDnsPluginInterface>('SystemDns');

export async function isVpnActive(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await SystemDns.getDnsStatus();
      return status.mode === 'hostname' && status.specifier === 'dns.adguard.com';
    } catch (e) {
      console.error('getDnsStatus error:', e);
    }
  }
  return false;
}

export async function startLocalDns(hostname: string = '94.140.14.14'): Promise<{ success: boolean; error?: string }> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await SystemDns.startDnsVpn({ hostname });
      return res;
    } catch (e: any) {
      console.error('startDnsVpn error:', e);
      return { success: false, error: e.message || String(e) };
    }
  }
  return { success: false, error: 'NOT_NATIVE' };
}

export async function stopLocalDns(): Promise<{ success: boolean }> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await SystemDns.stopDnsVpn();
      return res;
    } catch (e) {
      console.error('stopDnsVpn error:', e);
    }
  }
  return { success: true };
}

export async function setPrivateDns(mode: 'hostname' | 'off', hostname: string): Promise<{ success: boolean; error?: string }> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'NOT_NATIVE' };
  }

  try {
    return await SystemDns.setDnsMode({ mode, hostname });
  } catch (e: any) {
    console.error('setDnsMode error:', e);
    return { success: false, error: e.message || String(e) };
  }
}

export function openAndroidIntent(intentUrl: string) {
  if (Capacitor.isNativePlatform()) {
    let target = 'wireless';
    if (intentUrl.includes('NETWORK_OPERATOR')) target = 'network_operator';
    else if (intentUrl.includes('WIFI_SETTINGS')) target = 'wifi';
    else if (intentUrl.includes('SETTINGS')) target = 'settings';

    SystemDns.openSetting({ target }).catch(() => {
      try {
        window.location.href = intentUrl;
      } catch (err) {
        console.error('Failed to open Android intent:', err);
      }
    });
    return;
  }

  try {
    window.location.href = intentUrl;
  } catch (err) {
    console.error('Failed to open Android intent:', err);
  }
}
