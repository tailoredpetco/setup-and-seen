/* Basic consent mode: no Google script or measurement request before opt-in. */
(function () {
  'use strict';
  var measurementId = 'G-C860VPVLNT';
  var preferenceKey = 'setup-and-seen-cookie-consent';
  var started = false;
  window['ga-disable-' + measurementId] = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  });
  window.gtag('set', 'ads_data_redaction', true);

  function clearAnalyticsCookies() {
    var domains = ['', window.location.hostname];
    // Production Analytics cookies can be set on the parent domain.
    if (/(^|\.)setupandseen\.co\.uk$/.test(window.location.hostname)) domains.push('setupandseen.co.uk');
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
      });
    });
  }

  window.setUpAndSeenAnalyticsConsent = function (granted) {
    window['ga-disable-' + measurementId] = !granted;
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    if (!granted) { clearAnalyticsCookies(); return; }
    if (started) return;
    started = true;
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true, allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    script.dataset.consentAnalytics = '';
    document.head.appendChild(script);
  };
  var accepted = false;
  try { accepted = window.localStorage.getItem(preferenceKey) === 'accepted'; } catch (error) {}
  window.setUpAndSeenAnalyticsConsent(accepted);
  window.addEventListener('storage', function (event) {
    if (event.key === preferenceKey || event.key === null) {
      window.setUpAndSeenAnalyticsConsent(event.key !== null && event.newValue === 'accepted');
    }
  });
})();
