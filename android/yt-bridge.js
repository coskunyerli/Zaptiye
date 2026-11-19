// Zaptiye — YouTube oynatıcı sayfasının (www.youtube.com/embed/...) içine Android uygulaması tarafından eklenir.
// 1) Video biçimi filtresi: TV kutusunun takılarak oynattığı biçimleri (AV1, VP9) "desteklenmiyor" gösterir.
// 2) Köprü: uygulamanın sayfası altyazı ve ses dili listesini isteyebilir, seçim yapabilir.
// Uygulama bu dosyanın önüne `var ZAPTIYE_BLOCK = /.../i, ZAPTIYE_MAXFPS = 30;` satırını ekler.
(function () {
  var B = window.ZAPTIYE_BLOCK || /(?!)/, F = window.ZAPTIYE_MAXFPS || 0, said = 0, saidF = 0;
  function no(t) { if (!said++) console.log('ZAPTIYE codec filter: ' + t + ' engellendi'); return true; }
  // Kare hızı sınırı: YouTube "framerate=60 oynatabilir misin?" diye sorar; F'den yüksekse "hayır" deriz,
  // oynatıcı da 30 kare/sn'lik sürümü seçer (60 kare/sn videolarda bu genelde en fazla 480p demektir).
  function fpsOf(t) { var m = /framerate=(\d+(?:\.\d+)?)/i.exec(t || ''); return m ? +m[1] : 0; }
  function tooFast(fps, t) { if (F && fps > F + 1 && fps < 1000) { if (!saidF++) console.log('ZAPTIYE kare hizi siniri: ' + t + ' engellendi'); return true; } return false; }
  function bad(t) { return (B.test(t) && no(t)) || tooFast(fpsOf(t), t); }
  function wrap(o, n) {
    if (!o || !o[n]) return;
    var f = o[n];
    o[n] = function (t) { return bad(t) ? false : f.call(this, t); };
  }
  wrap(window.MediaSource, 'isTypeSupported');
  wrap(window.ManagedMediaSource, 'isTypeSupported');
  wrap(window.WebKitMediaSource, 'isTypeSupported');
  var mp = HTMLMediaElement.prototype, cpt = mp.canPlayType;
  mp.canPlayType = function (t) { return bad(t) ? '' : cpt.call(this, t); };
  var mc = navigator.mediaCapabilities;
  if (mc && mc.decodingInfo) {
    var di = mc.decodingInfo.bind(mc);
    mc.decodingInfo = function (q) {
      var v = (q && q.video) || {}, t = v.contentType || '';
      return (B.test(t) || tooFast(+v.framerate || 0, t + ' @' + v.framerate))
        ? Promise.resolve({ supported: false, smooth: false, powerEfficient: false }) : di(q);
    };
  }

  // ---------- Köprü ----------
  function P() { return document.getElementById('movie_player'); }
  function send(o) { o.zaptiye = 1; try { parent.postMessage(JSON.stringify(o), '*'); } catch (e) {} }
  function opt(p, m, o) { try { return p.getOption(m, o); } catch (e) { return null; } }
  function audioName(t) {
    try {
      var l = t.getLanguageInfo && t.getLanguageInfo();
      if (l) { var n = (l.getName && l.getName()) || l.name; if (n) return String(n); }
    } catch (e) {}
    return String(t.displayName || t.name || t.label || t.id || '?');
  }
  function audioList(p) {
    try { return (p.getAvailableAudioTracks && p.getAvailableAudioTracks()) || []; } catch (e) { return []; }
  }
  function info(p, off) {
    var tl = opt(p, 'captions', 'tracklist') || [], cur = off ? {} : (opt(p, 'captions', 'track') || {});
    var tr = opt(p, 'captions', 'translationLanguages') || [];
    var au = audioList(p), ac = -1, c = null;
    try { c = p.getAudioTrack && p.getAudioTrack(); } catch (e) {}
    var names = au.map(function (t, i) { if (c && (t === c || (t.id && t.id === c.id))) ac = i; return audioName(t); });
    send({
      cmd: 'info',
      tracks: tl.map(function (t) { return { lc: t.languageCode, name: t.displayName || t.languageName || t.languageCode, kind: t.kind || '' }; }),
      cur: cur && cur.languageCode ? { lc: cur.languageCode, tl: (cur.translationLanguage && cur.translationLanguage.languageCode) || '' } : null,
      trans: tr.map(function (t) { return { lc: t.languageCode, name: t.languageName }; }),
      audio: names, audioCur: ac
    });
  }
  window.addEventListener('message', function (e) {
    if (e.source !== parent) return;
    var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (!d || d.zaptiye !== 1) return;
    var p = P(); if (!p || !p.getOption) return send({ cmd: 'info', notReady: true });
    try {
      if (d.cmd === 'info') {
        var tl = opt(p, 'captions', 'tracklist');
        if ((!tl || !tl.length) && !d.again) {
          // Altyazı listesi, altyazı modülü yüklenince gelir. Kapalıysa listeyi okuyup yine kapatırız.
          var wasOn = !!(opt(p, 'captions', 'track') || {}).languageCode;
          p.loadModule('captions');
          setTimeout(function () { info(p, !wasOn); if (!wasOn) { try { p.setOption('captions', 'track', {}); p.unloadModule('captions'); } catch (x) {} } }, 900);
          return;
        }
        info(p);
      } else if (d.cmd === 'cc') {
        if (!d.lc) { p.setOption('captions', 'track', {}); p.unloadModule('captions'); }
        else {
          p.loadModule('captions');
          var o = { languageCode: d.lc };
          if (d.tl) o.translationLanguage = { languageCode: d.tl };
          p.setOption('captions', 'track', o);
        }
        setTimeout(function () { info(p); }, 600);
      } else if (d.cmd === 'audio') {
        var a = audioList(p);
        if (a[d.i]) p.setAudioTrack(a[d.i]);
        setTimeout(function () { info(p); }, 900);
      }
    } catch (err) { send({ cmd: 'err', msg: String(err) }); }
  });
  // Oynatıcı hazır olunca uygulamaya haber ver (altyazı/ses düğmeleri o zaman görünür)
  var n = 0, iv = setInterval(function () {
    var p = P();
    if (p && p.getOption) {
      clearInterval(iv); send({ cmd: 'ready' });
      setTimeout(function () {
        try { var s = p.getStatsForNerds && p.getStatsForNerds(); if (s) console.log('ZAPTIYE oynatilan bicim: ' + s.codecs + ' ' + s.resolution); } catch (e) {}
      }, 10000);
    }
    if (++n > 80) clearInterval(iv);
  }, 500);
})();
