# Zaptiye

**Kanalları zapt eder.** Zaptiye, seçtiğin YouTube kanallarının canlı yayınlarını ve son videolarını tek ekranda toplar. Kumandayla ya da fareyle kanaldan kanala geçersin, televizyon izler gibi.

## Neden var?

YouTube'un ana sayfası sana kendi seçtiklerini gösterir. Takip ettiğin kanalların hangisinin şu an yayında olduğunu görmek için tek tek bakman gerekir. Zaptiye bunu tersine çevirir: kanalları sen seçersin, uygulama hangisinin canlı olduğunu, hangisinin ne zaman yayına gireceğini ve son günlerde ne yüklediğini gösterir.

Haber, teknoloji, ürün incelemesi ya da istediğin herhangi bir konudaki kanallar için kullanılabilir.

## Özellikler

- **Canlı yayınlar:** Listedeki kanallardan şu an yayında olanlar izleyici sayısına göre sıralanır.
- **Yaklaşan yayınlar:** Planlanmış yayınlar başlama saatiyle görünür.
- **Son videolar:** Son birkaç günün videoları. Kaç gün geriye bakılacağını sen seçersin. Shorts ve 5 dakikadan kısa videolar gösterilmez.
- **Listeler ve sekmeler:** Kanalları konulara ayırırsın (Haber, Teknoloji, Spor…). Sabitlediğin listeler sekme olur. Sekmeler sığmazsa yan tarafa dikey liste olarak geçer.
- **İzlenecekler:** Sonra izlemek istediğin videoları kaydedersin. Kaldığın yerden devam eder.
- **TV modu:** Kayıtlı videolar baştan değil, rastgele bir yerinden başlar. Televizyonu açıp bir kanala denk gelmek gibi.
- **Altyazı ve ses dili:** Altyazıyı açıp kapatabilir, dilini seçebilirsin; Türkçe altyazı yoksa otomatik Türkçe çeviri sunulur. Birden çok dilde seslendirilmiş videolarda ses dili değişir. Bu ikisi Android TV ve masaüstü uygulamalarında var.
- **Hız:** Normal, 1,5x ve 2x. Bu ayar Android TV'de var.
- **TV kutularında akıcı oynatma:** Android TV uygulaması YouTube'dan H.264 ve 30 kare/sn sürümü ister. Böylece Mi Box gibi kutular videoyu takılmadan oynatır.

## Üç uygulama

Üçü de aynı sayfayı ([canli-yayinlar.html](canli-yayinlar.html)) kullanır. Sayfada yapılan bir değişiklik üçüne de yansır.

| Uygulama | Nerede çalışır | Kurulum |
|---|---|---|
| **Android TV** | Android TV, Google TV, Mi Box, telefon | [ANDROID-TV-KURULUM.md](ANDROID-TV-KURULUM.md) |
| **Masaüstü** | Windows (Electron). Kurulum dosyası ya da taşınabilir tek dosya | [MASAUSTU-KURULUM.md](MASAUSTU-KURULUM.md) |
| **Web (CasaOS / Docker)** | Ev sunucusu. Evdeki her cihazdan tarayıcıyla açılır | [casaos/CASAOS-KURULUM.md](casaos/CASAOS-KURULUM.md) |

Android TV ve masaüstü uygulamaları sunucu gerektirmez; sayfa uygulamanın içindedir ve doğrudan YouTube'a bağlanır.

**Hazır dosyalar:** APK ve Windows kurulum dosyaları [Releases](https://github.com/coskunyerli/Zaptiye/releases) sayfasında. APK'yı TV'ye en kolay **File Manager Plus** ile kurarsın: APK'yı USB bellekle ya da File Manager Plus'ın uzaktan erişim özelliğiyle TV'ye kopyala, açıp **Yükle** de.

## Başlamak için: YouTube API anahtarı

Zaptiye, kanalların durumunu YouTube Data API ile öğrenir. Bunun için ücretsiz bir anahtar gerekir:

1. [console.cloud.google.com](https://console.cloud.google.com)'da bir proje aç.
2. **YouTube Data API v3**'ü etkinleştir.
3. **Kimlik bilgileri → API anahtarı oluştur**. Anahtar `AIza` ile başlar.
4. Uygulamayı aç; ilk açılışta **⚙ Ayarlar** açılır. Anahtarı yapıştır ve kaydet.

Anahtar yalnızca senin cihazında saklanır. Günlük ücretsiz kota normal kullanıma fazlasıyla yeter, çünkü yalnızca açık sekmedeki kanallar kontrol edilir. Anahtarı her cihazda ayrı ayrı girmek istemezsen [config.ornek.json](config.ornek.json) dosyasını `config.json` olarak kopyalayıp anahtarını içine yazabilirsin.

## Kullanım

- **Sekmeler:** Üstteki sekmeler listelerindir. Birine bas; o listedeki kanallar kontrol edilir.
- **İzlemek:** Sağdaki canlı yayınlardan ya da alttaki son videolardan birine bas.
- **☰ Listeler:** Yeni liste oluşturursun, düzenlersin, silersin ya da sekmeye sabitlersin. Listenin adına basılı tutmak da sabitler.
- **İzlenecekler'e eklemek:** Kartın köşesindeki **＋**'ya bas. TV'de videonun üstünde OK'e basılı tut.
- **⚙ Ayarlar:** API anahtarı, kaç günlük video gösterileceği, TV'de video kalitesi, video biçimi ve kare hızı.

TV kumandasıyla kullanımın ayrıntıları [ANDROID-TV-KURULUM.md](ANDROID-TV-KURULUM.md) içinde.

## Listeler

İstediğin kadar liste oluşturabilirsin. Uygulama üç hazır listeyle gelir: **Haber**, **Teknoloji** ve **Ürün İnceleme**. Bunları değiştirebilir, silebilir ya da yenilerini ekleyebilirsin.

Bir liste, her satırda bir kanal olan düz bir metindir:

```
Kanal adı | @kullaniciadi
```

Örnek:

```
Webtekno | @webteknotv
Barış Özcan | UCv6jcPwFujuTIwFQ11jt1Yw
Linus Tech Tips | @LinusTechTips
```

- **Ad:** Ekranda görünen isimdir; istediğin gibi yazabilirsin.
- **`@kullaniciadi`:** Kanalın YouTube adresindeki addır. `youtube.com/@webteknotv` için `@webteknotv` yazılır.
- **`UC…` ile başlayan kimlik:** Kullanıcı adında Türkçe harf varsa ya da kanal bulunamıyorsa kullanılır. Kanal sayfasında **Hakkında → Kanalı paylaş → Kanal kimliğini kopyala** ile alınır.

Bulunamayan kanallar "Yayında olmayan kanallar" bölümünde ⚠ işaretiyle görünür.

## Yapay zekâ ile kanal listesi hazırlamak

Yeni bir konu için liste hazırlamanın en kolay yolu bir yapay zekâ asistanına (Claude, ChatGPT vb.) sormaktır. Şöyle bir istek yazabilirsin:

> Sağlık ve beslenme konusunda Türkçe içerik üreten, aktif ve güvenilir 15 YouTube kanalı listele. Her satır `Kanal adı | @kullaniciadi` biçiminde olsun. Kullanıcı adlarını kanalın YouTube adresinden doğrula; emin olmadığın kanalı listeye koyma. Kullanıcı adında Türkçe harf varsa `UC` ile başlayan kanal kimliğini yaz. Sadece listeyi ver, açıklama yazma.

Sonra:

1. Çıkan listeyi kopyala.
2. Uygulamada **☰ Listeler → + Yeni liste** ile yeni bir liste aç, ad ver ve listeyi yapıştır.
3. **Kaydet**'e bas. ⚠ ile işaretlenen kanallar bulunamamıştır; onları düzelt ya da sil.

**Dikkat:** Yapay zekâ kullanıcı adlarını bazen yanlış hatırlar ya da uydurur. Web'de arama yapabilen bir asistan kullanırsan sonuç daha doğru olur. Yine de ⚠ işaretlerine bak.

## Herkese açık: istediğin gibi değiştir

Zaptiye herkese açıktır ve [MIT lisansı](LICENSE) ile yayınlanır. Kodu indirebilir, kullanabilir, istediğin gibi değiştirebilir, dağıtabilir, hatta ticari olarak kullanabilirsin. İzin almana gerek yok. Tek koşul: dağıttığın kopyada lisans metni ([LICENSE](LICENSE)) bulunmalı. Yazılım "olduğu gibi" verilir, herhangi bir garanti yoktur.

## Yapay zekâ ile geliştirmek

Proje küçük ve düz yazılmıştır: çerçeve (framework) yok, derleme adımı neredeyse yok. Bu yüzden yapay zekâ kod asistanlarıyla (Claude Code, Cursor, GitHub Copilot vb.) geliştirmeye çok uygundur. Bu projenin kendisi de büyük ölçüde Claude Code ile yazıldı.

Asistana proje klasörünü açıp ne istediğini sade bir dille anlatman yeterli. Örnekler:

- "Canlı yayın kartlarında yayının kaç dakikadır sürdüğünü göster."
- "Son videolarda bir kanalı gizleme seçeneği ekle."
- "Sekmeleri sürükleyip sıralayabileyim."
- "Açık tema ekle."

Asistan için kısa bir harita:

| Dosya / klasör | Ne var |
|---|---|
| `canli-yayinlar.html` | Uygulamanın tamamı: arayüz, YouTube API çağrıları, listeler, oynatıcı, TV kumandası. Çoğu değişiklik burada yapılır |
| `android/` | Android TV uygulaması. `MainActivity.java` sayfayı WebView'da açar. `yt-bridge.js` YouTube oynatıcısına eklenir (video biçimi, altyazı, ses dili). `build.ps1` APK'yı Gradle olmadan derler |
| `desktop/` | Electron masaüstü uygulaması. `main.js` pencereyi ve yerel sunucuyu yönetir. `npm run dist` kurulum dosyasını üretir |
| `casaos/` | Ev sunucusu için nginx ayarı, `docker-compose.yml`, simgeler ve sayfanın kopyası |
| `config.ornek.json` | Hazır ayar ve liste şablonu |

Değişiklikten sonra:

- **Android TV:** `android\build.ps1` ile APK'yı yeniden derle.
- **Masaüstü:** `desktop` klasöründe `npm run dist`.
- **CasaOS:** `casaos\canli-yayinlar.html` dosyasını sunucuya yükle.

## Bilmen gerekenler

- Videolar YouTube'un resmi gömülü oynatıcısıyla oynatılır. Reklamlar ve YouTube kuralları geçerlidir.
- Altyazı ve ses dili seçimi, YouTube oynatıcısının belgelenmemiş özelliklerini kullanır. YouTube oynatıcısını değiştirirse bu düğmeler çalışmayabilir. Videolar yine oynar.
