// Sayfayı ve gerekli dosyaları ana klasörden desktop/web içine kopyalar (uygulamaya gömülür).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(__dirname, 'web');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const files = ['canli-yayinlar.html', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon.ico', 'config.json'];
for (const f of files) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(out, f));
}
// Pencere simgesi: ana klasörde yoksa desktop/build içindekini kullan
if (!fs.existsSync(path.join(out, 'icon.ico'))) fs.copyFileSync(path.join(__dirname, 'build', 'icon.ico'), path.join(out, 'icon.ico'));
// YouTube oynatıcısına eklenen köprü (altyazı / ses dili) Android uygulamasıyla ortak
fs.copyFileSync(path.join(root, 'android', 'yt-bridge.js'), path.join(out, 'yt-bridge.js'));
// CasaOS klasöründeki kopyayı da güncel tut
const cas = path.join(root, 'casaos');
if (fs.existsSync(cas)) fs.copyFileSync(path.join(root, 'canli-yayinlar.html'), path.join(cas, 'canli-yayinlar.html'));
console.log('web dosyalari hazir' + (fs.existsSync(path.join(out, 'config.json')) ? ' (config.json dahil: uygulamayi paylasma)' : ''));
