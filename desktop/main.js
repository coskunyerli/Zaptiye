// Zaptiye — masaüstü uygulaması (Electron).
// Sayfa uygulamanın içinde durur ve küçük bir yerel sunucudan (http://localhost:47823) açılır:
// YouTube gömülü oynatıcısı (Hata 153 olmasın diye) gerçek bir http adresi görmek istiyor.
const { app, BrowserWindow, shell, webFrameMain } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 47823;   // sabit: ayarlar (localStorage) bu adrese bağlı saklanır
const WEB = path.join(__dirname, 'web');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null, port = PORT;

// ---------- Yerel sunucu (yalnızca bu bilgisayardan erişilir) ----------
function startServer(p){
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'canli-yayinlar.html';
      const file = path.normalize(path.join(WEB, rel));
      if (!file.startsWith(WEB) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      });
      fs.createReadStream(file).pipe(res);
    });
    srv.once('error', reject);
    srv.listen(p, '127.0.0.1', () => resolve(p));
  });
}

// ---------- Pencere boyutunu hatırla ----------
const stateFile = () => path.join(app.getPath('userData'), 'pencere.json');
function loadState(){ try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch (e) { return { width: 1400, height: 860 }; } }
function saveState(){
  if (!win || win.isDestroyed()) return;
  try { fs.writeFileSync(stateFile(), JSON.stringify({ ...win.getNormalBounds(), maximized: win.isMaximized() })); } catch (e) {}
}

// YouTube oynatıcısına eklenen köprü: altyazı ve ses dili seçimi (Android uygulamasıyla aynı dosya)
let bridge = '';
try { bridge = 'var ZAPTIYE_BLOCK=/(?!)/,ZAPTIYE_MAXFPS=0;' + fs.readFileSync(path.join(WEB, 'yt-bridge.js'), 'utf8'); } catch (e) {}

function createWindow(){
  const st = loadState();
  win = new BrowserWindow({
    x: st.x, y: st.y, width: st.width || 1400, height: st.height || 860, minWidth: 720, minHeight: 480,
    title: 'Zaptiye', backgroundColor: '#121418', autoHideMenuBar: true, show: false,
    icon: path.join(WEB, 'icon.ico'),
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  win.setMenu(null);
  if (st.maximized) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.on('close', saveState);

  // "YouTube'da aç" gibi bağlantılar varsayılan tarayıcıda açılsın
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(`http://localhost:${port}/`)) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); }
  });

  // YouTube oynatıcı çerçevesi yüklenince köprüyü ekle (altyazı / ses dili düğmeleri bununla çalışır)
  win.webContents.on('did-frame-finish-load', (e, isMain, pid, rid) => {
    if (isMain || !bridge) return;
    const f = webFrameMain.fromId(pid, rid);
    if (f && /^https:\/\/www\.youtube(-nocookie)?\.com\/embed\//.test(f.url)) f.executeJavaScript(bridge).catch(() => {});
  });

  // Kısayollar: F11 tam ekran, F5 yenile, Ctrl+Shift+I geliştirici araçları
  win.webContents.on('before-input-event', (e, i) => {
    if (i.type !== 'keyDown') return;
    if (i.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    else if (i.key === 'F5') { win.webContents.reload(); e.preventDefault(); }
    else if (i.control && i.shift && i.key.toLowerCase() === 'i') { win.webContents.toggleDevTools(); e.preventDefault(); }
  });

  win.loadURL(`http://localhost:${port}/canli-yayinlar.html`);
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(async () => {
  // Sabit adres doluysa yakındaki bir adresi dene (o durumda ayarlar ayrı saklanır)
  for (let p = PORT; p < PORT + 10; p++) {
    try { port = await startServer(p); break; } catch (e) { if (p === PORT + 9) { app.quit(); return; } }
  }
  createWindow();
});
app.on('window-all-closed', () => app.quit());
