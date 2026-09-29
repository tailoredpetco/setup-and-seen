/* Meta is loaded only after separate marketing consent on the live domain. */
(function () {
  'use strict';
  var pixelId = '1474496937961839';
  var key = 'setup-and-seen-marketing-consent';
  var granted = false;
  var started = false;
  var pageTracked = false;
  var live = /^(www\.)?setupandseen\.co\.uk$/.test(window.location.hostname);

  function safePage() {
    // Do not send arbitrary query-string content to the advertising platform.
    var allowed = {utm_source: 1, utm_medium: 1, utm_campaign: 1, utm_content: 1, utm_term: 1, fbclid: 1, finder: 1};
    var safe = true;
    new URLSearchParams(window.location.search).forEach(function (value, name) {
      if (!allowed[name] || !/^[a-zA-Z0-9_.-]{1,300}$/.test(value)) safe = false;
    });
    return safe;
  }

  function start() {
    if (!granted || !live || !safePage()) return false;
    if (!started) {
      var fbq = window.fbq;
      if (!fbq) {
        fbq = window.fbq = function () {
          if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
          else fbq.queue.push(arguments);
        };
        window._fbq = fbq;
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = '2.0';
        fbq.queue = [];
      }
      fbq('consent', 'grant');
      fbq('set', 'autoConfig', false, pixelId);
      fbq('init', pixelId);
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.dataset.consentMarketing = '';
      document.head.appendChild(script);
      started = true;
    }
    if (!pageTracked) {
      window.fbq('trackSingle', pixelId, 'PageView');
      pageTracked = true;
    }
    return true;
  }

  function clearCookies() {
    ['', window.location.hostname, 'setupandseen.co.uk'].forEach(function (domain) {
      ['_fbp', '_fbc'].forEach(function (name) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
      });
    });
  }

  window.setUpAndSeenMarketingConsent = function (choice) {
    granted = choice === true;
    if (!granted) {
      if (started && typeof window.fbq === 'function') {
        // Drop events still waiting for the SDK, then revoke before it can send.
        if (!window.fbq.callMethod && window.fbq.queue) {
          window.fbq.queue = window.fbq.queue.filter(function (event) { return event[0] !== 'trackSingle'; });
          pageTracked = false;
        }
        window.fbq('consent', 'revoke');
      }
      clearCookies();
      return;
    }
    if (started) window.fbq('consent', 'grant');
    start();
  };

  window.setUpAndSeenTrackLead = function () {
    if (!start()) return;
    // No form values, contact details, service text or monetary value are sent.
    window.fbq('trackSingle', pixelId, 'Lead');
  };

  var accepted = false;
  try { accepted = window.localStorage.getItem(key) === 'accepted'; } catch (error) {}
  window.setUpAndSeenMarketingConsent(accepted);
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) {
      window.setUpAndSeenMarketingConsent(event.key !== null && event.newValue === 'accepted');
    }
  });
})();
