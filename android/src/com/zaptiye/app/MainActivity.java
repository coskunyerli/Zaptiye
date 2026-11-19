package com.zaptiye.app;

import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import android.webkit.CookieManager;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Zaptiye — Android TV uygulaması (sunucu gerekmez).
 * Sayfa APK'nın içinde (assets) durur. Uygulama onu sahte bir https adresinden
 * kendi içinde sunar; YouTube oynatıcısı bir web sitesinde gömülüymüş gibi çalışır.
 */
public class MainActivity extends Activity {

    private static final String HOST = "zaptiye.app";
    private static final String START = "https://" + HOST + "/canli-yayinlar.html?tv=1";

    private WebView web;
    private FrameLayout root;
    private View customView;
    private WebChromeClient.CustomViewCallback customCallback;
    private long lastBack = 0;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#121418"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#121418"));
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setUserAgentString(s.getUserAgentString() + " Zaptiye-AndroidTV/3.0");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return asset(u.getPath());
                // YouTube oynatıcı sayfası: video biçimi filtresini ekle (TV kutusu AV1/VP9'u takılarak oynatır)
                if ("www.youtube.com".equals(u.getHost()) && u.getPath() != null && u.getPath().startsWith("/embed/")
                        && "GET".equals(req.getMethod())) {
                    String zc = u.getQueryParameter("zc");
                    // zc = h264 | vp9 | auto. Köprü (altyazı/ses seçimi) her durumda eklenir; "auto"da biçim filtresi yok.
                    if (zc != null) {
                        String zf = u.getQueryParameter("zf");   // en fazla kare/sn (0 = sınır yok)
                        int fps = 0; try { if (zf != null) fps = Integer.parseInt(zf); } catch (NumberFormatException e) { }
                        return embedWithCodec(req, "auto".equals(zc) ? "(?!)" : "vp9".equals(zc) ? "av01" : "av01|vp0?9|vp8", fps);
                    }
                }
                return null;   // diğer her şey normal internetten gelir
            }
            @Override
            public void onPageFinished(WebView v, String url) { web.requestFocus(View.FOCUS_DOWN); }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onShowCustomView(View view, CustomViewCallback cb) {
                if (customView != null) { cb.onCustomViewHidden(); return; }
                customView = view; customCallback = cb;
                root.addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                web.setVisibility(View.GONE);
            }
            @Override
            public void onHideCustomView() { hideCustom(); }
            @Override
            public boolean onConsoleMessage(android.webkit.ConsoleMessage m) {
                // sorun giderme için: adb logcat -s Zaptiye
                android.util.Log.i("Zaptiye", m.message());
                return true;
            }
        });

        if (state != null) web.restoreState(state); else web.loadUrl(START);
    }

    private static final Map<String, String> TYPES = new HashMap<>();
    static {
        TYPES.put("html", "text/html"); TYPES.put("json", "application/json");
        TYPES.put("svg", "image/svg+xml"); TYPES.put("png", "image/png");
        TYPES.put("js", "text/javascript"); TYPES.put("css", "text/css");
    }

    /** APK içindeki dosyayı döndür; yoksa 404 (ör. config.json konmadıysa). */
    private WebResourceResponse asset(String path) {
        String p = (path == null || path.equals("/") || path.isEmpty()) ? "canli-yayinlar.html" : path.substring(1);
        String ext = p.contains(".") ? p.substring(p.lastIndexOf('.') + 1).toLowerCase() : "";
        String mime = TYPES.containsKey(ext) ? TYPES.get(ext) : "application/octet-stream";
        Map<String, String> h = new HashMap<>();
        h.put("Cache-Control", "no-cache");
        h.put("Referrer-Policy", "strict-origin-when-cross-origin");
        try {
            InputStream in = getAssets().open("web/" + p);
            return new WebResourceResponse(mime, "utf-8", 200, "OK", h, in);
        } catch (IOException e) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", h, new ByteArrayInputStream(new byte[0]));
        }
    }

    /**
     * YouTube oynatıcı sayfasına eklenen betik (assets/web/yt-bridge.js): biçim filtresi + altyazı/ses köprüsü.
     * Filtre, oynatıcıya "bu cihaz şu biçimleri oynatamaz" der; oynatıcı da H.264'ü seçer (h264ify yöntemi).
     */
    private String bridge;
    private String codecScript(String blocked, int maxFps) {
        if (bridge == null) {
            try (InputStream in = getAssets().open("web/yt-bridge.js")) {
                ByteArrayOutputStream o = new ByteArrayOutputStream();
                byte[] b = new byte[8192]; int n;
                while ((n = in.read(b)) > 0) o.write(b, 0, n);
                bridge = o.toString("UTF-8");
            } catch (IOException e) { bridge = ""; }
        }
        return "<script>var ZAPTIYE_BLOCK=/" + blocked + "/i,ZAPTIYE_MAXFPS=" + maxFps + ";" + bridge + "</script>";
    }

    /** Oynatıcı sayfasını kendimiz indirip başına biçim filtresini ekleriz. Hata olursa normal yükleme yapılır. */
    private WebResourceResponse embedWithCodec(WebResourceRequest req, String blocked, int maxFps) {
        HttpURLConnection c = null;
        try {
            String url = req.getUrl().toString();
            c = (HttpURLConnection) new URL(url).openConnection();
            c.setConnectTimeout(10000); c.setReadTimeout(15000);
            c.setInstanceFollowRedirects(true);
            for (Map.Entry<String, String> h : req.getRequestHeaders().entrySet()) {
                if (!"accept-encoding".equalsIgnoreCase(h.getKey())) c.setRequestProperty(h.getKey(), h.getValue());
            }
            // YouTube gömülü oynatıcı, sayfanın adresini (Referer) görmek ister; yoksa Hata 153 verir
            if (c.getRequestProperty("Referer") == null) c.setRequestProperty("Referer", "https://" + HOST + "/");
            CookieManager cm = CookieManager.getInstance();
            String ck = cm.getCookie(url);
            if (ck != null) c.setRequestProperty("Cookie", ck);
            int code = c.getResponseCode();
            List<String> set = c.getHeaderFields().get("Set-Cookie");
            if (set != null) for (String s : set) cm.setCookie(url, s);
            if (code != 200) return null;
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            InputStream in = c.getInputStream();
            byte[] b = new byte[16384]; int n;
            while ((n = in.read(b)) > 0) buf.write(b, 0, n);
            in.close();
            String html = buf.toString("UTF-8");
            int head = html.indexOf("<head");
            int at = head >= 0 ? html.indexOf('>', head) + 1 : 0;
            html = html.substring(0, at) + codecScript(blocked, maxFps) + html.substring(at);
            Map<String, String> h = new HashMap<>();
            h.put("Cache-Control", "no-cache");
            return new WebResourceResponse("text/html", "utf-8", 200, "OK", h, new ByteArrayInputStream(html.getBytes("UTF-8")));
        } catch (Exception e) {
            return null;
        } finally {
            if (c != null) c.disconnect();
        }
    }

    private void hideCustom() {
        if (customView == null) return;
        root.removeView(customView);
        customView = null;
        web.setVisibility(View.VISIBLE);
        if (customCallback != null) customCallback.onCustomViewHidden();
        customCallback = null;
        web.requestFocus();
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        int k = e.getKeyCode();
        // Menü tuşu: sayfanın Ayarlar penceresini aç (API anahtarı, kanallar)
        if (k == KeyEvent.KEYCODE_MENU) {
            if (e.getAction() == KeyEvent.ACTION_UP) web.evaluateJavascript("document.getElementById('openSet').click()", null);
            return true;
        }
        if (k == KeyEvent.KEYCODE_BACK) {
            if (e.getAction() == KeyEvent.ACTION_UP) onBack();
            return true;
        }
        return super.dispatchKeyEvent(e);
    }

    /** Geri: önce sayfaya sor (tam ekrandan çık / ayarları kapat), sonra çift basışla çık. */
    private void onBack() {
        if (customView != null) { hideCustom(); return; }
        web.evaluateJavascript("(window.tvBack && window.tvBack()) ? 'y' : 'n'", r -> {
            if (r != null && r.contains("y")) return;
            long now = System.currentTimeMillis();
            if (now - lastBack < 2000) finish();
            else { lastBack = now; Toast.makeText(this, "Çıkmak için Geri'ye tekrar bas", Toast.LENGTH_SHORT).show(); }
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onDestroy() { if (web != null) web.destroy(); super.onDestroy(); }
}
