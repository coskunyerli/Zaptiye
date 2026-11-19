# Zaptiye — Windows masaüstü uygulaması

Zaptiye bilgisayarda kendi penceresinde açılan bir uygulamadır (Electron). Tarayıcı, `.bat` dosyası ya da ayrı bir sunucu gerekmez.

## Kurulum dosyaları

`desktop\release` klasöründe iki dosya var:

| Dosya | Ne işe yarar |
|---|---|
| `Zaptiye-Kurulum-3.4.0.exe` | **Kurulum (önerilen).** Çift tıkla, kurulum yerini seç, bitir. Masaüstüne ve Başlat menüsüne **Zaptiye** kısayolu ekler. Ayarlar → Uygulamalar'dan kaldırılabilir. Yönetici izni istemez. |
| `Zaptiye-Tasinabilir-3.4.0.exe` | **Taşınabilir.** Kurulum yok; tek dosya, USB bellekte bile çalışır. Her açılışta kendini geçici klasöre açtığı için 10–15 sn geç başlar. |

Dosyalar imzasız olduğu için Windows ilk çalıştırmada "Windows bilgisayarınızı korudu" uyarısı gösterebilir: **Ek bilgi → Yine de çalıştır**.

Kurulum ve taşınabilir sürüm ayarları aynı yerde saklar (`%APPDATA%\Zaptiye`): API anahtarı ve listeler ikisinde de geçerlidir, kaldırıp yeniden kurunca da silinmez.

## Yeniden derleme

Bilgisayarda Node.js kurulu olmalı. `desktop` klasöründe:

```
npm install
npm run dist
```

Derlemeden denemek için: `npm start`.

`config.json` (bkz. `config.ornek.json`) proje klasöründe varsa uygulamaya gömülür; o zaman API anahtarı her bilgisayarda hazır gelir. Bu durumda kurulum dosyasını başkasıyla paylaşma.

Uygulama simgesi `desktop\build\icon.ico` dosyasından gelir.

## Kullanım

- İlk açılışta **⚙ Ayarlar** açılır; YouTube API anahtarını gir.
- Videonun altında **💬 Altyazı** ve **🔊 Ses dili** düğmeleri var (TV uygulamasındakiyle aynı).
- **F11:** tam ekran · **F5:** yenile · **Ctrl+Shift+I:** geliştirici araçları
- "YouTube'da aç ↗" bağlantıları varsayılan tarayıcında açılır.

## Teknik not

Uygulama sayfayı kendi içinde `http://localhost:47823` adresinden sunar; YouTube oynatıcısı gerçek bir http adresi görmek istiyor (yoksa Hata 153). API anahtarını Google Cloud'da adrese göre sınırladıysan `http://localhost:*` zaten kapsar.
