/*
 * Consent Mode v2 bootstrap + GTM container loader.
 *
 * US opt-out model: non-essential signals default to 'granted', but a stored
 * choice or Global Privacy Control flips them to 'denied' BEFORE the container
 * loads. GPC is a mandatory opt-out and overrides a stored grant (without
 * clobbering an explicit stored choice, so it returns if GPC is disabled).
 *
 * The container only loads on production hosts — never on dev/preview/local —
 * so internal traffic doesn't pollute analytics/ads. The fido_consent cookie
 * format and signal mapping are shared with apps/web/src/lib/consent.ts; keep
 * them in sync. The React banner updates consent at runtime via window.gtag.
 */
(function (w, d) {
  'use strict';
  var COOKIE = 'fido_consent';
  var VERSION = 1;
  var MAX_AGE = 396 * 24 * 60 * 60;
  var PRODUCTION_HOSTS = {
    'fidohq.ai': 1,
    'www.fidohq.ai': 1,
    'swftm.fidohq.ai': 1,
    'fidofinancial.ai': 1,
    'www.fidofinancial.ai': 1,
    'swftm.fidofinancial.ai': 1,
    'swftm.com': 1,
    'www.swftm.com': 1
  };

  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  w.gtag = gtag;

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
            return { ads: parsed.ads, analytics: parsed.analytics };
          }
        } catch (e) { /* fall through to no stored consent */ }
        return null;
      }
    }
    return null;
  }

  function writeConsent(state) {
    try {
      d.cookie = COOKIE + '=' + encodeURIComponent(JSON.stringify(state)) +
        '; Path=/; Max-Age=' + MAX_AGE + '; SameSite=Lax; Secure';
    } catch (e) { /* ignore */ }
  }

  var gpc = false;
  try { gpc = !!(w.navigator && w.navigator.globalPrivacyControl === true); } catch (e) {}

  var stored = readConsent();
  var ads, analytics;
  if (gpc) {
    // GPC overrides a stored grant. Only persist a fresh opt-out when nothing
    // is stored, so an explicit stored choice survives GPC being disabled.
    ads = 'denied';
    analytics = 'denied';
    if (!stored) {
      writeConsent({ v: VERSION, ads: ads, analytics: analytics, ts: new Date().getTime(), src: 'gpc' });
    }
  } else if (stored) {
    ads = stored.ads;
    analytics = stored.analytics;
  } else {
    ads = 'granted';
    analytics = 'granted';
  }

  gtag('consent', 'default', {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: analytics,
    security_storage: 'granted',
    functionality_storage: 'granted',
    personalization_storage: 'granted',
    wait_for_update: 500
  });

  // Load the GTM container only on production marketing hosts.
  var host = '';
  try { host = (w.location && w.location.hostname) || ''; } catch (e) {}
  if (PRODUCTION_HOSTS[host]) {
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(w, d, 'script', 'dataLayer', 'GTM-NM3S8477');
  }
})(window, document);
