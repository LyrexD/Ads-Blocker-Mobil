package com.autodns.app;

import android.content.Intent;
import android.net.VpnService;
import android.os.ParcelFileDescriptor;
import android.util.Log;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class DnsVpnService extends VpnService {
    private static final String TAG = "DnsVpnService";
    public static final String ACTION_STOP = "com.autodns.app.STOP";
    public static volatile boolean isRunning = false;

    private ParcelFileDescriptor vpnInterface = null;
    private Thread workerThread = null;
    private ExecutorService dnsThreadPool = null;
    private volatile boolean keepRunning = false;

    private String primaryDns = "94.140.14.14";
    private String secondaryDns = "94.140.15.15";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopVpn();
            return START_NOT_STICKY;
        }

        if (intent != null && intent.hasExtra("dns")) {
            String customDns = intent.getStringExtra("dns");
            if (customDns != null && !customDns.trim().isEmpty()) {
                primaryDns = customDns.trim();
            }
        }

        startVpn();
        return START_STICKY;
    }

    private synchronized void startVpn() {
        if (isRunning) return;

        try {
            Builder builder = new Builder();
            builder.setSession("AdGuard DNS");
            builder.addAddress("10.233.233.2", 30);
            builder.addDnsServer(primaryDns);
            builder.addRoute(primaryDns, 32);

            try {
                builder.addDnsServer(secondaryDns);
                builder.addRoute(secondaryDns, 32);
            } catch (Exception ignored) {}

            builder.setMtu(1500);
            builder.setBlocking(true);

            vpnInterface = builder.establish();
            if (vpnInterface == null) {
                Log.e(TAG, "VPN establish failed");
                stopSelf();
                return;
            }

            isRunning = true;
            keepRunning = true;
            dnsThreadPool = Executors.newFixedThreadPool(4);

            workerThread = new Thread(this::runVpnLoop, "DnsVpnLoop");
            workerThread.start();
            Log.i(TAG, "AdGuard DNS VPN started successfully with DNS: " + primaryDns);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start VPN", e);
            stopVpn();
        }
    }

    private void runVpnLoop() {
        if (vpnInterface == null) return;
        FileInputStream in = new FileInputStream(vpnInterface.getFileDescriptor());
        FileOutputStream out = new FileOutputStream(vpnInterface.getFileDescriptor());
        byte[] buffer = new byte[2048];

        while (keepRunning) {
            try {
                int length = in.read(buffer);
                if (length <= 0) continue;

                // IPv4 only, UDP only
                if ((buffer[0] >> 4) != 4) continue;
                int ihl = (buffer[0] & 0x0F) * 4;
                if (length < ihl + 8) continue;
                int protocol = buffer[9] & 0xFF;
                if (protocol != 17) continue; // 17 = UDP

                // Copy packet for worker thread
                byte[] packet = new byte[length];
                System.arraycopy(buffer, 0, packet, 0, length);

                if (dnsThreadPool != null && !dnsThreadPool.isShutdown()) {
                    dnsThreadPool.execute(() -> handleDnsPacket(packet, out));
                }
            } catch (Exception e) {
                if (!keepRunning) break;
                Log.w(TAG, "Error in VPN loop: " + e.getMessage());
            }
        }
    }

    private void handleDnsPacket(byte[] packet, FileOutputStream out) {
        DatagramSocket socket = null;
        try {
            int ihl = (packet[0] & 0x0F) * 4;
            int srcPort = ((packet[ihl] & 0xFF) << 8) | (packet[ihl + 1] & 0xFF);
            int dstPort = ((packet[ihl + 2] & 0xFF) << 8) | (packet[ihl + 3] & 0xFF);
            int udpLen = ((packet[ihl + 4] & 0xFF) << 8) | (packet[ihl + 5] & 0xFF);

            if (dstPort != 53 || udpLen <= 8 || packet.length < ihl + udpLen) return;

            byte[] srcIp = new byte[]{packet[12], packet[13], packet[14], packet[15]};
            byte[] dstIp = new byte[]{packet[16], packet[17], packet[18], packet[19]};

            int dnsPayloadLen = udpLen - 8;
            byte[] dnsPayload = new byte[dnsPayloadLen];
            System.arraycopy(packet, ihl + 8, dnsPayload, 0, dnsPayloadLen);

            socket = new DatagramSocket();
            protect(socket);
            socket.setSoTimeout(3000);

            InetAddress targetDns = InetAddress.getByAddress(dstIp);
            DatagramPacket outPacket = new DatagramPacket(dnsPayload, dnsPayloadLen, targetDns, 53);
            socket.send(outPacket);

            byte[] responseBuffer = new byte[1500];
            DatagramPacket inPacket = new DatagramPacket(responseBuffer, responseBuffer.length);
            socket.receive(inPacket);

            int respDnsLen = inPacket.getLength();
            byte[] replyPacket = buildIpv4UdpPacket(dstIp, srcIp, 53, srcPort, inPacket.getData(), respDnsLen);

            synchronized (out) {
                out.write(replyPacket);
            }
        } catch (Exception e) {
            // ignore timeout
        } finally {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
        }
    }

    private byte[] buildIpv4UdpPacket(byte[] srcIp, byte[] dstIp, int srcPort, int dstPort, byte[] payload, int payloadLen) {
        int ipHeaderLen = 20;
        int udpHeaderLen = 8;
        int totalLen = ipHeaderLen + udpHeaderLen + payloadLen;
        byte[] pkt = new byte[totalLen];

        // IPv4 Header
        pkt[0] = 0x45; // Version 4, IHL 5
        pkt[1] = 0;    // DSCP/ECN
        pkt[2] = (byte) ((totalLen >> 8) & 0xFF);
        pkt[3] = (byte) (totalLen & 0xFF);
        pkt[4] = 0; pkt[5] = 0; // Identification
        pkt[6] = 0x40; pkt[7] = 0; // Don't fragment
        pkt[8] = 64;   // TTL
        pkt[9] = 17;   // Protocol 17 = UDP
        pkt[10] = 0; pkt[11] = 0; // Checksum placeholder

        // IPs
        System.arraycopy(srcIp, 0, pkt, 12, 4);
        System.arraycopy(dstIp, 0, pkt, 16, 4);

        // IP Checksum
        int ipChecksum = computeChecksum(pkt, 0, ipHeaderLen);
        pkt[10] = (byte) ((ipChecksum >> 8) & 0xFF);
        pkt[11] = (byte) (ipChecksum & 0xFF);

        // UDP Header
        pkt[20] = (byte) ((srcPort >> 8) & 0xFF);
        pkt[21] = (byte) (srcPort & 0xFF);
        pkt[22] = (byte) ((dstPort >> 8) & 0xFF);
        pkt[23] = (byte) (dstPort & 0xFF);
        int udpTotal = udpHeaderLen + payloadLen;
        pkt[24] = (byte) ((udpTotal >> 8) & 0xFF);
        pkt[25] = (byte) (udpTotal & 0xFF);
        pkt[26] = 0; pkt[27] = 0; // UDP checksum 0 (disabled in IPv4)

        // Payload
        System.arraycopy(payload, 0, pkt, 28, payloadLen);

        return pkt;
    }

    private int computeChecksum(byte[] buf, int offset, int length) {
        int sum = 0;
        for (int i = 0; i < length; i += 2) {
            int high = (buf[offset + i] & 0xFF) << 8;
            int low = (i + 1 < length) ? (buf[offset + i + 1] & 0xFF) : 0;
            sum += (high | low);
        }
        while ((sum >> 16) > 0) {
            sum = (sum & 0xFFFF) + (sum >> 16);
        }
        return ~sum & 0xFFFF;
    }

    private synchronized void stopVpn() {
        keepRunning = false;
        isRunning = false;

        if (dnsThreadPool != null) {
            dnsThreadPool.shutdownNow();
            dnsThreadPool = null;
        }

        if (workerThread != null) {
            workerThread.interrupt();
            workerThread = null;
        }

        try {
            if (vpnInterface != null) {
                vpnInterface.close();
                vpnInterface = null;
            }
        } catch (Exception ignored) {}

        stopSelf();
        Log.i(TAG, "AdGuard DNS VPN stopped");
    }

    @Override
    public void onDestroy() {
        stopVpn();
        super.onDestroy();
    }
}
