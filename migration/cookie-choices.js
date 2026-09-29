function installStaticOfferCookieConsent() {
  var settingsButton = document.querySelector('.cookie-settings');
  if (!settingsButton || settingsButton.dataset.staticConsentBound === 'true') return;
  settingsButton.dataset.staticConsentBound = 'true';
  var analyticsKey = 'setup-and-seen-cookie-consent';
  var marketingKey = 'setup-and-seen-marketing-consent';

  function stored(key) {
    try { return window.localStorage.getItem(key) || ''; } catch (error) { return ''; }
  }
  function save(analytics, marketing) {
    try {
      window.localStorage.setItem(analyticsKey, analytics ? 'accepted' : 'rejected');
      window.localStorage.setItem(marketingKey, marketing ? 'accepted' : 'rejected');
    } catch (error) {}
    if (typeof window.setUpAndSeenAnalyticsConsent === 'function') window.setUpAndSeenAnalyticsConsent(analytics);
    if (typeof window.setUpAndSeenMarketingConsent === 'function') window.setUpAndSeenMarketingConsent(marketing);
  }
  function showBanner() {
    var existing = document.querySelector('.cookie-banner');
    if (existing) existing.remove();
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie choices');
    banner.innerHTML = '<div class="cookie-copy"><strong>Cookies on Set Up &amp; Seen</strong>' +
      '<p>Optional cookies help us understand visits (Google Analytics) and measure our Facebook and Instagram ads (Meta). Choose what to allow. <a href="/privacy">Privacy &amp; cookies</a>.</p>' +
      '<div class="cookie-preferences" hidden><label><input type="checkbox" name="consent-analytics"> Analytics <span>Understand visits with Google Analytics.</span></label>' +
      '<label><input type="checkbox" name="consent-marketing"> Marketing <span>Measure ads and enquiries with Meta.</span></label></div></div>' +
      '<div class="cookie-actions"><button type="button" class="cookie-reject">Reject optional</button><button type="button" class="cookie-manage" aria-expanded="false">Choose cookies</button><button type="button" class="cookie-accept">Accept all</button><button type="button" class="cookie-save" hidden>Save choices</button></div>';
    document.body.appendChild(banner);
    settingsButton.setAttribute('aria-expanded', 'true');
    var analytics = banner.querySelector('[name="consent-analytics"]');
    var marketing = banner.querySelector('[name="consent-marketing"]');
    analytics.checked = stored(analyticsKey) === 'accepted';
    marketing.checked = stored(marketingKey) === 'accepted';
    function finish(a, m) {
      save(a, m);
      banner.remove();
      settingsButton.setAttribute('aria-expanded', 'false');
      settingsButton.focus({preventScroll: true});
    }
    banner.querySelector('.cookie-reject').addEventListener('click', function () { finish(false, false); });
    banner.querySelector('.cookie-accept').addEventListener('click', function () { finish(true, true); });
    banner.querySelector('.cookie-save').addEventListener('click', function () { finish(analytics.checked, marketing.checked); });
    banner.querySelector('.cookie-manage').addEventListener('click', function () {
      banner.querySelector('.cookie-preferences').hidden = false;
      banner.querySelector('.cookie-save').hidden = false;
      banner.querySelector('.cookie-accept').hidden = true;
      banner.querySelector('.cookie-manage').hidden = true;
      banner.classList.add('cookie-banner-customise');
      analytics.focus({preventScroll: true});
    });
  }
  settingsButton.addEventListener('click', showBanner);
  if (!stored(analyticsKey) || !stored(marketingKey)) showBanner();
}
