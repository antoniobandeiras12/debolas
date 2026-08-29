/* ============================================================
   Radar do Bolso — JavaScript mínimo
   Funções: menu mobile, banner de cookies (consentimento),
   barra de compartilhamento
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Menu mobile ---------- */
  var menuToggle = document.querySelector('.menu-toggle');
  var mainNav = document.getElementById('main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.setAttribute(
        'aria-label',
        isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
      );
    });
  }

  /* ---------- Consentimento de cookies ---------- */
  var CONSENT_KEY = 'rb_consent';
  var banner = document.getElementById('cookie-banner');
  var prefsPanel = document.getElementById('cookie-preferences');

  function getConsent() {
    try {
      var raw = document.cookie
        .split('; ')
        .find(function (c) { return c.indexOf(CONSENT_KEY + '=') === 0; });
      if (!raw) return null;
      return JSON.parse(decodeURIComponent(raw.split('=')[1]));
    } catch (e) {
      return null;
    }
  }

  function setConsent(consent) {
    var value = encodeURIComponent(JSON.stringify(consent));
    var maxAge = 60 * 60 * 24 * 365; // 12 meses
    document.cookie =
      CONSENT_KEY + '=' + value + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
  }

  function applyConsent(consent) {
    /*
      Ponto único de carregamento de scripts não essenciais.
      Analytics e publicidade só devem ser inseridos aqui,
      condicionados ao consentimento do usuário.

      if (consent.analytics) { ...carregar script de analytics... }
      if (consent.ads) { ...carregar script de publicidade... }
    */
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
    if (prefsPanel) prefsPanel.hidden = true;
  }

  function showBanner() {
    if (banner) banner.hidden = false;
  }

  if (banner) {
    var existing = getConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      showBanner();
    }

    banner.addEventListener('click', function (event) {
      var target = event.target.closest('[data-cookie-action]');
      if (!target) return;

      var action = target.getAttribute('data-cookie-action');

      if (action === 'accept') {
        var all = { essential: true, analytics: true, ads: true };
        setConsent(all);
        applyConsent(all);
        hideBanner();
      } else if (action === 'reject') {
        var none = { essential: true, analytics: false, ads: false };
        setConsent(none);
        applyConsent(none);
        hideBanner();
      } else if (action === 'configure') {
        if (prefsPanel) prefsPanel.hidden = !prefsPanel.hidden;
      } else if (action === 'save') {
        var analytics = document.getElementById('pref-analytics');
        var ads = document.getElementById('pref-ads');
        var chosen = {
          essential: true,
          analytics: !!(analytics && analytics.checked),
          ads: !!(ads && ads.checked)
        };
        setConsent(chosen);
        applyConsent(chosen);
        hideBanner();
      }
    });
  }

  /* Reabrir preferências a partir da Política de Cookies */
  document.addEventListener('click', function (event) {
    var reopen = event.target.closest('[data-cookie-action="reopen"]');
    if (!reopen) return;
    if (banner) {
      showBanner();
      if (prefsPanel) prefsPanel.hidden = false;
      banner.scrollIntoView({ block: 'nearest' });
    }
  });

  /* ---------- Barra de compartilhamento ---------- */
  var shareBar = document.querySelector('.share-bar');

  if (shareBar) {
    shareBar.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-share]');
      if (!btn) return;

      var url = window.location.href.split('#')[0];
      var title = document.title;
      var network = btn.getAttribute('data-share');
      var shareUrl = '';

      if (network === 'whatsapp') {
        shareUrl = 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url);
      } else if (network === 'x') {
        shareUrl =
          'https://twitter.com/intent/tweet?text=' +
          encodeURIComponent(title) +
          '&url=' +
          encodeURIComponent(url);
      } else if (network === 'facebook') {
        shareUrl =
          'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
      } else if (network === 'copy') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            var original = btn.textContent;
            btn.textContent = 'Link copiado!';
            setTimeout(function () {
              btn.textContent = original;
            }, 2000);
          });
        }
        return;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
      }
    });
  }
})();
