# DNS Hızlı Geçiş

Android için tek dokunuşla Otomatik DNS ve AdGuard Özel DNS arasında geçiş sağlayan mobil uygulama.

## Özellikler

- Otomatik DNS ile AdGuard DNS arasında hızlı geçiş
- Android intent ve sistem ayarları yönlendirmeleri
- DNS ayarları ve tanılama arayüzü
- PWA kurulum desteği

## Geliştirme

Gereksinimler: Node.js 20+ ve npm. Android derlemesi için ayrıca Android Studio, Android SDK ve Java 17 gerekir.

```bash
npm ci
npm run dev
```

Web üretim derlemesi:

```bash
npm run build
```

## Android

Capacitor yapılandırması `com.autodns.app` uygulama kimliğini kullanır. Web varlıklarını derleyip Android Studio projesini açmak için:

```bash
npm ci
npm run build
npx cap sync android
npx cap open android
```

Android Studio'dan cihazınıza/emülatörünüze derleyip yükleyebilirsiniz. İmzalama anahtarları veya yerel SDK ayarları depoya eklenmemelidir.
