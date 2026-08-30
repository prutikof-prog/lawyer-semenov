/*
 * Баннер согласия на файлы cookie + отложенная загрузка Яндекс.Метрики.
 * Подключается на всех страницах: <script src="cookie-consent.js" defer></script>
 *
 * Логика: до нажатия «Принять» код Метрики НЕ инициализируется.
 * Выбор посетителя хранится в localStorage 12 месяцев.
 */
(function () {
  'use strict';

  var KEY = 'pns-cookie-consent';
  var TTL = 365 * 24 * 60 * 60 * 1000; // 12 месяцев
  var COUNTER = 110848165;

  function readChoice() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || typeof v.ts !== 'number') return null;
      if (Date.now() - v.ts > TTL) return null;
      return v.value === 'accepted' ? 'accepted' : 'declined';
    } catch (e) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(KEY, JSON.stringify({ value: value, ts: Date.now() })); } catch (e) {}
  }

  function loadMetrika() {
    if (window.ym && window.ym.l) return;
    var src = 'https://mc.yandex.ru/metrika/tag.js?id=' + COUNTER;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < e.scripts.length; j++) { if (e.scripts[j].src === r) return; }
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', src, 'ym');
    window.ym(COUNTER, 'init', {
      ssr: true, webvisor: true, clickmap: true,
      referrer: document.referrer, url: location.href,
      accurateTrackBounce: true, trackLinks: true
    });
  }

  var CSS = ''
    + '.cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:300;'
    + 'background:rgba(51,51,47,.97);border-top:1px solid var(--line,rgba(216,199,154,.18));'
    + 'box-shadow:0 -8px 30px rgba(0,0,0,.35);padding:18px 24px;'
    + 'font-family:var(--sans,Inter,sans-serif);font-weight:300;'
    + 'transform:translateY(120%);transition:transform .35s ease}'
    + '.cc-banner.cc-show{transform:none}'
    + '.cc-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap}'
    + '.cc-text{flex:1 1 380px;min-width:0;font-size:14px;line-height:1.55;color:var(--text-soft,#BDB9AE)}'
    + '.cc-text a{color:var(--brass-deep,#A9895E);text-decoration:underline;text-underline-offset:2px}'
    + '.cc-text a:hover{color:var(--brass-light,#D8C79A)}'
    + '.cc-actions{display:flex;gap:10px;flex:0 0 auto;flex-wrap:wrap}'
    + '.cc-btn{cursor:pointer;border:0;border-radius:8px;padding:11px 20px;font-family:inherit;'
    + 'font-size:14px;font-weight:500;transition:transform .2s,box-shadow .2s,background .2s;white-space:nowrap}'
    + '.cc-accept{background:linear-gradient(135deg,var(--brass-light,#D8C79A),var(--brass-deep,#A9895E));color:#2B2B27}'
    + '.cc-accept:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.28)}'
    + '.cc-decline{background:transparent;border:1px solid var(--brass-deep,#A9895E);color:var(--brass-light,#D8C79A)}'
    + '.cc-decline:hover{background:rgba(216,199,154,.10)}'
    + 'body.cc-open .float-contact{bottom:150px}'
    + '@media(max-width:860px){'
    + '.cc-banner{padding:16px 14px}'
    + '.cc-inner{gap:14px}'
    + '.cc-text{flex:1 1 100%;font-size:13.5px}'
    + '.cc-actions{flex:1 1 100%}'
    + '.cc-btn{flex:1 1 0;padding:12px 12px}'
    + 'body.cc-open .float-contact{bottom:190px}'
    + '}';

  function injectCSS() {
    var s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function showBanner() {
    injectCSS();
    var b = document.createElement('div');
    b.className = 'cc-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Использование файлов cookie');
    b.innerHTML = ''
      + '<div class="cc-inner">'
      + '<div class="cc-text">Сайт использует файлы cookie и сервис веб-аналитики Яндекс.Метрика, '
      + 'чтобы понимать, какие материалы полезны посетителям. Аналитика включается только с вашего согласия. '
      + 'Подробнее – в <a href="cookies.html">политике в отношении файлов cookie</a>.</div>'
      + '<div class="cc-actions">'
      + '<button type="button" class="cc-btn cc-decline" data-cc="decline">Только необходимые</button>'
      + '<button type="button" class="cc-btn cc-accept" data-cc="accept">Принять</button>'
      + '</div></div>';
    document.body.appendChild(b);
    document.body.classList.add('cc-open');
    requestAnimationFrame(function () { b.classList.add('cc-show'); });

    b.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cc]') : null;
      if (!t) return;
      var accepted = t.getAttribute('data-cc') === 'accept';
      saveChoice(accepted ? 'accepted' : 'declined');
      b.classList.remove('cc-show');
      document.body.classList.remove('cc-open');
      setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 400);
      if (accepted) loadMetrika();
    });
  }

  function init() {
    var choice = readChoice();
    if (choice === 'accepted') { loadMetrika(); return; }
    if (choice === 'declined') return;
    showBanner();
  }

  // Позволяет посетителю пересмотреть выбор: ссылка с id="cc-reset"
  window.ccResetConsent = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
