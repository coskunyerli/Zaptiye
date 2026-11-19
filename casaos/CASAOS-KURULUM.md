# Zaptiye — CasaOS'a kurulum

Uygulama tek bir HTML dosyası. Sunucuda hazır `nginx` imajı bu dosyayı sunar; imaj derlemek gerekmez.

CasaOS için gereken her şey bu **`casaos`** klasöründe:

| Dosya | Ne işe yarar |
|---|---|
| `canli-yayinlar.html` | Uygulamanın kendisi |
| `nginx.conf` | Web sunucusu ayarı |
| `icon.svg`, `icon-192.png`, `icon-512.png` | Simgeler (tarayıcı sekmesi, telefonda ana ekran, CasaOS ana ekranı) |
| `docker-compose.yml` | CasaOS'a kurulum tanımı (sunucuya yüklenmez, 2. adımda yapıştırılır) |

## 1. Dosyaları sunucuya koy

CasaOS'ta **Files** uygulamasını aç, `DATA` → `AppData` içinde **`zaptiye`** adında bir klasör oluştur ve içine `casaos` klasöründeki şu dosyaları yükle: `canli-yayinlar.html`, `nginx.conf`, `icon.svg`, `icon-192.png`, `icon-512.png`.

Sonuç: `/DATA/AppData/zaptiye/canli-yayinlar.html`, `/DATA/AppData/zaptiye/nginx.conf` ve simge dosyaları.

(SSH ile yapmak istersen bilgisayarda `casaos` klasöründeyken:)

```
scp canli-yayinlar.html nginx.conf icon.svg icon-192.png icon-512.png KULLANICI@CASAOS_IP:/DATA/AppData/zaptiye/
```

## 2. Uygulamayı CasaOS'a ekle

1. CasaOS ana ekranında **+** → **Install a customized app** (Özel uygulama kur).
2. Sağ üstteki **Import** düğmesine bas.
3. `docker-compose.yml` dosyasının içeriğini yapıştır (ya da dosyayı yükle) → **Submit** → **Install**.

SSH ile yapmak istersen: `docker-compose.yml` dosyasını sunucuya kopyala ve aynı klasörde `docker compose up -d` çalıştır.

## 3. Aç

Tarayıcıdan: `http://CASAOS_IP:8765` (ör. `http://192.168.1.50:8765`). CasaOS ana ekranındaki Zaptiye simgesi de aynı adresi açar.

**Simge:** CasaOS simge için bir internet adresi ister. Kurulumdan sonra ana ekranda uygulamaya sağ tık (ya da üç nokta) → **Settings** → **Icon URL** alanına `http://CASAOS_IP:8765/icon-512.png` yaz ve kaydet. (Kurulum sırasında aynı alanı Import ekranında da doldurabilirsin.)

8765 portu doluysa `docker-compose.yml` içindeki `"8765:80"` ve `port_map: "8765"` satırlarındaki 8765'i başka bir sayıyla değiştir.

## 4. API anahtarı

- Ayarlar her cihazın kendi tarayıcısında saklanır. Telefon, tablet, bilgisayar: her birinde ilk açılışta anahtarı bir kez girersin. Anahtar sunucuya kaydedilmez.
- Anahtarı Google Cloud'da adrese göre sınırladıysan, **Uygulama kısıtlamaları → HTTP yönlendirenleri** listesine yeni adresi ekle: `http://192.168.1.50:8765/*` (kendi IP'n ile).

## Ortak ayarlar: config.json (isteğe bağlı, Android TV için önerilir)

Proje klasöründeki `config.ornek.json` dosyasını kopyala, adını `config.json` yap, `"key"` satırına API anahtarını yaz ve `/DATA/AppData/zaptiye/` klasörüne koy. Böylece anahtarı ve kanal listesini her cihazda ayrı ayrı girmen gerekmez. Bir cihazda Ayarlar'dan kaydedilen değerler, o cihazda bu dosyanın önüne geçer.

Not: Dosya ev ağındaki herkes tarafından okunabilir ve içinde API anahtarın var.

## Güncelleme

Asıl sayfa proje klasöründeki `canli-yayinlar.html` dosyasıdır (Android ve masaüstü uygulamaları da onu kullanır). Sayfa değişince `casaos` klasöründeki kopya da güncellenir; sen yalnızca `casaos\canli-yayinlar.html` dosyasını sunucudaki `/DATA/AppData/zaptiye/` klasörüne üzerine yaz ve tarayıcıda sayfayı yenile. Konteyneri yeniden başlatmak gerekmez.

## İnternete açmak istersen

Ev ağı dışından erişim için modemden port açmak yerine CasaOS'taki Tailscale / ZeroTier gibi bir VPN uygulamasını kullan. Sayfayı herkese açarsan başkaları da açabilir, ama izlemek için herkesin kendi API anahtarını girmesi gerekir.
