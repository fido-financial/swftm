/*
 * Vanilla cookie consent banner for the static SWFTM site (US opt-out model).
 *
 * Mirrors apps/web/src/lib/consent.ts + ConsentBanner.tsx. The fido_consent
 * cookie format and Consent Mode signal mapping must stay in sync with those.
 * Consent defaults + GPC are handled earlier by assets/gtm.js; this only
 * renders the opt-out UI and applies runtime updates.
 */
(function (w, d) {
  'use strict';
  var COOKIE = 'fido_consent';
  var VERSION = 1;
  var MAX_AGE = 396 * 24 * 60 * 60;
  var PRIVACY_URL = 'https://fidohq.ai/privacy';

  function readConsent() {
    var cookies = (d.cookie || '').split(';');
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split('=');
      var name = parts.shift().replace(/^\s+|\s+$/g, '');
      if (name === COOKIE) {
        try {
          var parsed = JSON.parse(decodeURIComponent(parts.join('=')));
          if (parsed && parsed.v === VERSION &&
            (parsed.ads === 'granted' || parsed.ads === 'denied') &&
            (parsed.analytics === 'granted' || parsed.analytics === 'denied')) {
            return parsed;
          }
        } catch (e) { /* fall through */ }
        return null;
      }
    }
    return null;
  }

  function gpcEnabled() {
    try { return w.navigator && w.navigator.globalPrivacyControl === true; }
    catch (e) { return false; }
  }

  function gtag() { (w.dataLayer = w.dataLayer || []).push(arguments); }

  function choose(value) {
    var state = { v: VERSION, ads: value, analytics: value, ts: new Date().getTime(), src: 'user' };
    try {
      d.cookie = COOKIE + '=' + encodeURIComponent(JSON.stringify(state)) +
        '; Path=/; Max-Age=' + MAX_AGE + '; SameSite=Lax; Secure';
    } catch (e) { /* ignore */ }
    gtag('consent', 'update', {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value
    });
    (w.dataLayer = w.dataLayer || []).push({
      event: 'consent_update',
      ad_consent: value,
      analytics_consent: value
    });
    remove();
  }

  var node = null;
  function remove() {
    if (node && node.parentNode) node.parentNode.removeChild(node);
    node = null;
  }

  function render() {
    if (node) return;
    node = d.createElement('div');
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-label', 'Cookie consent');
    node.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
      'background:rgba(255,255,255,0.97);border-top:1px solid rgba(31,27,22,0.15);' +
      'padding:16px 20px;box-shadow:0 -4px 24px rgba(0,0,0,0.08);' +
      'font-family:inherit;color:#1F1B16;';
    node.innerHTML =
      '<div style="max-width:960px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px;' +
      'align-items:center;justify-content:space-between;">' +
      '<p style="margin:0;font-size:14px;line-height:1.5;max-width:620px;">' +
      'We use cookies for analytics and advertising. You can opt out anytime — see our ' +
      '<a href="' + PRIVACY_URL + '" style="color:#C84F0F;text-decoration:underline;">Privacy Policy</a>.</p>' +
      '<div style="display:flex;gap:8px;flex-shrink:0;">' +
      '<button type="button" data-consent="denied" style="cursor:pointer;border:1px solid rgba(31,27,22,0.3);' +
      'background:transparent;color:#1F1B16;border-radius:8px;padding:8px 14px;font-size:14px;">Reject all</button>' +
      '<button type="button" data-consent="granted" style="cursor:pointer;border:1px solid #C84F0F;' +
      'background:#FF671A;color:#fff;border-radius:8px;padding:8px 14px;font-size:14px;">Accept all</button>' +
      '</div></div>';
    node.querySelector('[data-consent="denied"]').addEventListener('click', function () { choose('denied'); });
    node.querySelector('[data-consent="granted"]').addEventListener('click', function () { choose('granted'); });
    d.body.appendChild(node);
  }

  // Let a footer link reopen the chooser.
  w.openConsentPreferences = render;

  function init() {
    if (!readConsent() && !gpcEnabled()) render();
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);
