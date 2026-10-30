package com.autodns.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.VpnService;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SystemDnsPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @CapacitorPlugin(name = "SystemDns")
    public static class SystemDnsPlugin extends Plugin {
        private static final String TAG = "SystemDnsPlugin";

        @PluginMethod
        public void getVpnStatus(PluginCall call) {
            JSObject ret = new JSObject();
            ret.put("running", DnsVpnService.isRunning);
            call.resolve(ret);
        }

        @PluginMethod
        public void startDnsVpn(PluginCall call) {
            String dns = call.getString("hostname", "94.140.14.14");
            Intent vpnIntent = VpnService.prepare(getContext());
            if (vpnIntent != null) {
                startActivityForResult(call, vpnIntent, "vpnResult");
            } else {
                startVpnService(dns);
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("running", true);
                call.resolve(ret);
            }
        }

        @ActivityCallback
        private void vpnResult(PluginCall call, ActivityResult result) {
            if (result.getResultCode() == Activity.RESULT_OK) {
                String dns = call.getString("hostname", "94.140.14.14");
                startVpnService(dns);
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("running", true);
                call.resolve(ret);
            } else {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", "PERMISSION_DENIED");
                call.resolve(ret);
            }
        }

        private void startVpnService(String dns) {
            Intent intent = new Intent(getContext(), DnsVpnService.class);
            intent.putExtra("dns", dns != null ? dns : "94.140.14.14");
            getContext().startService(intent);
        }

        @PluginMethod
        public void stopDnsVpn(PluginCall call) {
            Intent intent = new Intent(getContext(), DnsVpnService.class);
            intent.setAction(DnsVpnService.ACTION_STOP);
            getContext().startService(intent);
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("running", false);
            call.resolve(ret);
        }

        @PluginMethod
        public void getDnsStatus(PluginCall call) {
            JSObject ret = new JSObject();
            try {
                ContentResolver cr = getContext().getContentResolver();
                String mode = Settings.Global.getString(cr, "private_dns_mode");
                String specifier = Settings.Global.getString(cr, "private_dns_specifier");

                int perm = getContext().checkCallingOrSelfPermission("android.permission.WRITE_SECURE_SETTINGS");
                boolean hasPermission = (perm == PackageManager.PERMISSION_GRANTED);

                ret.put("hasPermission", hasPermission);
                ret.put("mode", mode != null ? mode : "opportunistic");
                ret.put("specifier", specifier != null ? specifier : "");
                ret.put("vpnRunning", DnsVpnService.isRunning);
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                ret.put("hasPermission", false);
                ret.put("vpnRunning", DnsVpnService.isRunning);
                ret.put("error", e.getMessage());
                ret.put("success", false);
                call.resolve(ret);
            }
        }

        @PluginMethod
        public void setDnsMode(PluginCall call) {
            String mode = call.getString("mode", "adguard");
            String hostname = call.getString("hostname", "dns.adguard.com");
            JSObject ret = new JSObject();

            try {
                ContentResolver cr = getContext().getContentResolver();
                boolean modeWritten;
                if ("adguard".equalsIgnoreCase(mode) || "hostname".equalsIgnoreCase(mode)) {
                    if (hostname == null || hostname.trim().isEmpty()) {
                        ret.put("success", false);
                        ret.put("error", "INVALID_HOSTNAME");
                        ret.put("message", "DNS ana bilgisayarı boş olamaz.");
                        call.resolve(ret);
                        return;
                    }
                    boolean hostnameWritten = Settings.Global.putString(cr, "private_dns_specifier", hostname.trim());
                    modeWritten = Settings.Global.putString(cr, "private_dns_mode", "hostname");
                    if (!hostnameWritten || !modeWritten) {
                        ret.put("success", false);
                        ret.put("error", "WRITE_FAILED");
                        ret.put("message", "Android Özel DNS ayarını kabul etmedi.");
                        call.resolve(ret);
                        return;
                    }
                } else if ("off".equalsIgnoreCase(mode)) {
                    modeWritten = Settings.Global.putString(cr, "private_dns_mode", "off");
                } else {
                    modeWritten = Settings.Global.putString(cr, "private_dns_mode", "opportunistic");
                }

                String actualMode = Settings.Global.getString(cr, "private_dns_mode");
                String actualHostname = Settings.Global.getString(cr, "private_dns_specifier");
                boolean modeMatches = "hostname".equalsIgnoreCase(mode)
                        ? "hostname".equals(actualMode) && hostname.trim().equals(actualHostname)
                        : mode.equalsIgnoreCase(actualMode);
                if (!modeWritten || !modeMatches) {
                    ret.put("success", false);
                    ret.put("error", "WRITE_FAILED");
                    ret.put("message", "Özel DNS ayarı yazılamadı veya Android tarafından uygulanmadı.");
                    ret.put("mode", actualMode != null ? actualMode : "unknown");
                    ret.put("hostname", actualHostname != null ? actualHostname : "");
                    call.resolve(ret);
                    return;
                }

                ret.put("success", true);
                ret.put("mode", actualMode);
                ret.put("hostname", actualHostname != null ? actualHostname : "");
                call.resolve(ret);
            } catch (SecurityException se) {
                ret.put("success", false);
                ret.put("error", "PERMISSION_DENIED");
                ret.put("message", "WRITE_SECURE_SETTINGS izni henüz verilmemiş.");
                call.resolve(ret);
            } catch (Exception e) {
                ret.put("success", false);
                ret.put("error", "UNKNOWN_ERROR");
                ret.put("message", e.getMessage());
                call.resolve(ret);
            }
        }

        @PluginMethod
        public void openSetting(PluginCall call) {
            String target = call.getString("target", "wireless");
            Intent intent;
            try {
                if ("wireless".equals(target)) {
                    intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
                } else if ("network_operator".equals(target)) {
                    intent = new Intent(Settings.ACTION_NETWORK_OPERATOR_SETTINGS);
                } else if ("wifi".equals(target)) {
                    intent = new Intent(Settings.ACTION_WIFI_SETTINGS);
                } else {
                    intent = new Intent(Settings.ACTION_SETTINGS);
                }
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
                call.resolve();
            } catch (Exception e) {
                try {
                    intent = new Intent(Settings.ACTION_SETTINGS);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                    call.resolve();
                } catch (Exception ex) {
                    call.reject("Could not open settings: " + ex.getMessage());
                }
            }
        }
    }
}
