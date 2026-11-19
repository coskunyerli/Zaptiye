# Zaptiye — Android TV uygulaması

APK dosyası: [GitHub Releases](https://github.com/coskunyerli/Zaptiye/releases) sayfasındaki `Zaptiye-AndroidTV-….apk` ya da kendin derlersen `android\Zaptiye.apk`.

**Sunucu gerekmez.** Sayfa APK'nın içinde. Uygulama TV'de doğrudan YouTube'a bağlanır, tıpkı bilgisayardaki gibi. CasaOS kurulumu artık isteğe bağlı; yalnızca sayfayı tarayıcıdan açmak istersen gerekir.

## 1. API anahtarı: iki yol

**Yol 1: Anahtarı APK'nın içine koy (önerilen, TV'de bir şey yazmazsın)**

1. Proje klasöründe `config.ornek.json` dosyasını kopyala ve adını `config.json` yap.
2. `"key"` satırına kendi anahtarını yaz. İstersen kanal listesini de düzenle.
3. APK'yı yeniden derle:

```
powershell -ExecutionPolicy Bypass -File android\build.ps1
```

Bu durumda APK'nın içinde anahtarın olur; APK dosyasını başkasıyla paylaşma.

**Yol 2: TV'de gir**

`config.json` olmadan derlenen APK ilk açılışta Ayarlar penceresini açar. Anahtarı kumandayla bir kez yazarsın, sonra hatırlanır. Ayarlar'ı tekrar açmak için üst çubuktaki **⚙ Ayarlar** düğmesini kullan (aşağıya bak).

**Anahtarı adrese göre sınırladıysan:** Google Cloud'da anahtarın **HTTP yönlendirenleri** listesine `https://zaptiye.app/*` ekle. Uygulama kendini bu adres olarak tanıtır.

## 2. TV'ye kur

### Yol A: File Manager Plus ile (önerilen)

Bilgisayar ya da geliştirici ayarı gerekmez.

1. TV'de Google Play'den **File Manager Plus** uygulamasını kur.
2. APK'yı TV'ye getir. İki yol var:
   - **USB bellek:** APK'yı ([GitHub Releases](https://github.com/coskunyerli/Zaptiye/releases)'ten indirdiğin `Zaptiye-AndroidTV-….apk` ya da kendi derlediğin `android\Zaptiye.apk`) belleğe kopyala ve belleği TV'ye tak.
   - **Ağ üzerinden:** File Manager Plus'ta **Uzaktan erişim (Remote access)** özelliğini aç. Ekranda bir adres görünür; bilgisayardan bu adrese bağlanıp APK'yı TV'ye kopyala.
3. File Manager Plus'ta APK dosyasını bul ve aç, **Yükle**'ye bas.
4. TV ilk seferde bilinmeyen kaynaktan kurulum izni ister: **Ayarlar**'a geçip **File Manager Plus** için izni aç, geri dönüp yeniden **Yükle**'ye bas. (İzin yeri TV'ye göre değişir; genelde **Ayarlar → Uygulamalar → Güvenlik ve kısıtlamalar → Bilinmeyen kaynaklar**.)
5. Kurulum bitince **Aç**'a bas. Zaptiye TV'nin uygulama listesinde de görünür.

**Güncelleme:** Yeni APK'yı aynı yolla açıp **Yükle** de; eski sürümün üzerine kurulur, ayarların ve listelerin silinmez.

### Yol B: Bilgisayardan ADB ile

Geliştiriciler ve sık güncelleyenler için.

1. TV'de **Ayarlar → Cihaz tercihleri → Hakkında** yolunu izle. **Android TV işletim sistemi derlemesi** satırına 7 kez bas.
2. **Ayarlar → Cihaz tercihleri → Geliştirici seçenekleri** içinde **USB hata ayıklama**yı (bazı TV'lerde "Ağ üzerinden hata ayıklama") aç.
3. TV'nin IP adresine bak: **Ayarlar → Ağ ve İnternet → bağlı ağ**.
4. Bilgisayarda:

```
adb connect TV_IP:5555
adb install -r android\Zaptiye.apk
```

İlk bağlantıda TV'de çıkan izin sorusuna **İzin ver** de.

## Kumanda

| Tuş | Listede | İzlerken (tam ekran) |
|---|---|---|
| Yön tuşları | Kartlar ve düğmeler arasında gezin | ◀ ▶ 30 sn geri/ileri · ▲ ▼ önceki/sonraki kanal |
| OK | Videoyu küçük oynatıcıda aç | Durdur (seçenek çubuğu açılır) |
| OK basılı | İzleneceklere ekle / çıkar | İzleneceklere ekle / çıkar |
| Geri | İki kez basınca uygulamadan çık | Küçük oynatıcıya dön |
| Menü (≡) (varsa) | Ayarlar'ı açar | — |

**Oynatıcı:** Bir video seçince tam ekran açılmaz, küçük oynatıcıda başlar ve odak altındaki **⛶ Tam ekran** düğmesine gelir; OK ile tam ekrana geçersin. Küçük oynatıcının kendisine gelip OK'e basmak da tam ekran yapar. Videonun altındaki düğmeler: **⛶ Tam ekran · ❚❚ Duraklat / ▶ Oynat · ⏩ Hız · ↺ Baştan izle · 🎲 Rastgele yer · 💬 Altyazı · 🔊 Ses dili · ＋ Sonra izle**.

**Hız:** ⏩ Hız düğmesiyle **Normal, 1,5x ve 2x** arasında seçim yaparsın. Seçtiğin hız sonraki videolarda da kalır (uygulama kapanınca Normal'e döner). Canlı yayınlarda hız değiştirilemediği için bu düğme görünmez.

**Altyazı ve ses dili:** 💬 Altyazı penceresinde altyazıyı kapatır ya da dil seçersin; videoda Türkçe altyazı yoksa **Türkçe (otomatik çeviri)** seçeneği çıkar. 🔊 Ses dili, birden çok dilde seslendirilmiş videolarda (ör. MrBeast) sesi değiştirir; tek dilli videolarda "tek ses dili var" yazar. Bu düğmeler video başladıktan birkaç saniye sonra görünür.

**Tam ekranda duraklatınca** altta bir çubuk açılır: **▶ Devam · 💬 Altyazı · 🔊 Ses dili · ↺ Baştan · ＋ Sonra izle · ⤡ Küçült**. ◀ ▶ ile seç, OK'e bas.

**Ayarları sonradan değiştirmek:** Listede yön tuşlarıyla en üste çık ve sağdaki **⚙ Ayarlar** düğmesine gelip OK'e bas. Kumandanda Menü tuşu varsa o da Ayarlar'ı açar. Pencerede yön tuşlarıyla gezinirsin. Kanal listesi kutusundan çıkmak için metnin en başında ▲, en sonunda ▼ bas. Değişikliği kaydetmek için **Kaydet ve kontrol et**'e bas; kaydetmeden çıkmak için Geri'ye bas. Ayarların TV'de saklanır ve APK güncellemelerinde silinmez.

## Listeler ve sekmeler

Kanallarını konulara göre listelere ayırabilirsin: Haber, Teknoloji, Sağlık, Popüler… Sabitlediğin listeler üstte **sekme** olarak görünür. Sekmeler sığmazsa solda dikey liste olur.

- **Yeni liste:** Sekmelerin sonundaki **☰ Listeler** → **+ Yeni liste**. Ad ver, kanalları yaz (`Ad | @kullaniciadi`), **Kaydet**.
- **Sekmeye sabitle / kaldır:** ☰ Listeler penceresinde listenin adının üstünde **OK'e basılı tut** (yaklaşık yarım saniye). Ya da yanındaki **📌** düğmesine bas. Üstteki bir sekmede OK'e basılı tutmak da onu sekmelerden kaldırır.
- **Sabit olmayan bir listeyi açmak:** ☰ Listeler'de adına kısa bas. Liste kesik çizgili geçici bir sekme olarak açılır.
- **Düzenle / sil:** ☰ Listeler → **✎ Düzenle**. Silmek için **Listeyi sil**'e iki kez bas.
- **Kota:** Yalnızca açık sekmedeki kanallar kontrol edilir. Sekmeler arasında geçerken son sonuç hemen görünür, sonra güncellenir.

Bilgisayarda da aynısı geçerli: 📌 düğmesi, fareyle basılı tutma ya da sağ tık.

## İzlenecekler

Sonra izlemek istediğin videoları **İzlenecekler** sekmesinde toplarsın. Bu liste API kotası harcamaz.

- **Eklemek (TV):** Herhangi bir sekmede videonun üstünde **OK'e basılı tut**. İzlerken de OK'e basılı tutarsan o video eklenir; kısa basış yine durdur/oynat yapar. Kayıtlı videoların köşesinde ✓ görünür.
- **Eklemek (bilgisayar):** Kartın köşesindeki **＋** düğmesine bas, sağ tıkla ya da oynatıcının altındaki **＋ İzleneceklere ekle** düğmesine bas.
- **Kaldığın yerden devam:** İzlenecekler'deki bir videoyu açtığında kaldığın yerden başlar (TV modu bu listede rastgele başlatmaz). Sonuna kadar izlenen video "İZLENDİ ✓" olarak işaretlenir.
- **Çıkarmak:** İzlenecekler sekmesinde videonun üstünde OK'e basılı tut (bilgisayarda köşedeki ✕).

## Video takılıyorsa

**Video biçimi (en önemli ayar):** YouTube, gömülü oynatıcıya çoğu zaman AV1 biçimini gönderir. Mi Box gibi TV kutuları AV1'i donanımla çözemez; video takılır ve donar. Uygulama bu yüzden YouTube'a yalnızca **H.264** oynatabildiğini söyler; H.264'ü her TV kutusu donanımla, akıcı oynatır (en fazla 1080p). **Ayarlar → Video biçimi** ile değiştirebilirsin:

- **H.264 — en akıcı (önerilen, varsayılan)**
- **VP9 — daha net, AV1 kapalı:** Mi Box S VP9'u da donanımla çözer; görüntü biraz daha net olur. Takılırsa H.264'e dön.
- **YouTube seçsin:** Eski davranış.

**Kare hızı:** 60 kare/sn videolar (oyun, spor, bazı teknoloji kanalları) TV kutusunu çok yorar ve yer yer takılır. **Ayarlar → Kare hızı** varsayılan olarak **En fazla 30 kare/sn**'dir: bu videolar YouTube'un 30 kare/sn sürümüyle oynar. Bedeli çözünürlüktür; YouTube 60 kare/sn videoların 30 kare/sn sürümünü genelde en fazla 360p–480p verir. Normal (30 kare/sn) videolar bundan etkilenmez. Akıcılık yerine netlik istersen **60 kare/sn'ye izin ver**'i seç.

Hangi biçimin oynadığını görmek istersen bilgisayardan `adb logcat -s Zaptiye` çalıştır ve bir video aç; birkaç saniye sonra "oynatilan bicim: avc1…" gibi bir satır çıkar (`avc1` = H.264, `vp09` = VP9, `av01` = AV1).

**Video kalitesi:** Hâlâ takılıyorsa **Ayarlar → Video kalitesi (tam ekran)** ayarını değiştir. Varsayılan **Orta (~720p)**. Hâlâ takılıyorsa **Düşük (~480p)** seç.

YouTube, kaliteyi oynatıcının ekrandaki boyutuna göre seçiyor. Uygulama tam ekranda oynatıcıyı seçtiğin kaliteye denk gelen boyutta açıp ekrana büyütüyor; böylece TV kutusu daha düşük çözünürlüklü bir videoyu çözmek zorunda kalıyor. Bunun yan etkisi olarak YouTube'un düğmeleri biraz iri görünür. YouTube bağlantına göre seçtiğinden daha düşük bir kalite de seçebilir.

İzlerken arkadaki liste çizilmez ve yenilenmez. Liste, Geri ile döndüğünde güncellenir.

## Güncelleme

`canli-yayinlar.html` dosyasını değiştirdiğinde TV'ye yansıması için APK'yı yeniden derleyip kurman gerekir (`build.ps1`, ardından File Manager Plus ile ya da `adb install -r ...` ile kur). Ayarlar ve API anahtarı güncellemede silinmez.

`android\zaptiye.keystore` dosyasını sakla (ilk derlemede oluşur). Başka bir anahtarla imzalanan sürüm eskisinin üzerine kurulmaz.
