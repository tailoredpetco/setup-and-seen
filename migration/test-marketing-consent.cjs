const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
const source = fs.readFileSync('netlify-site/marketing-consent.js', 'utf8');
const analytics = fs.readFileSync('netlify-site/analytics-consent.js', 'utf8');
const runtime = fs.readFileSync('netlify-site/site-interactions-sep13.js', 'utf8');
const html = fs.readFileSync('netlify-site/website-offer/index.html', 'utf8');
const key = 'setup-and-seen-marketing-consent';
function scenario({marketing, oldAnalytics, url = 'https://www.setupandseen.co.uk/website-offer', blocked = false} = {}) {
  const dom = new JSDOM(html, {url, runScripts: 'outside-only', pretendToBeVisual: true});
  const w = dom.window, d = w.document, observers = [];
  const Observer = w.MutationObserver;
  w.MutationObserver = class extends Observer {constructor(...args) {super(...args); observers.push(this);}};
  w.matchMedia = () => ({matches: false}); w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  if (marketing) w.localStorage.setItem(key, marketing);
  if (oldAnalytics) w.localStorage.setItem('setup-and-seen-cookie-consent', oldAnalytics);
  if (blocked) Object.defineProperty(w, 'localStorage', {get() {throw Error('Storage blocked');}});
  w.eval(analytics); w.eval(source); w.eval(runtime);
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  return {w, d, close() {observers.forEach(o => o.disconnect()); w.close();}};
}
const tags = s => s.d.querySelectorAll('script[src^="https://connect.facebook.net/"]').length;
const events = s => Array.from(s.w.fbq?.queue || [], args => Array.from(args)).filter(a => a[0] === 'trackSingle');
for (const options of [{}, {marketing: 'rejected'}, {oldAnalytics: 'accepted'}, {blocked: true},
  {marketing: 'accepted', url: 'https://preview.netlify.app/website-offer'},
  {marketing: 'accepted', url: 'https://www.setupandseen.co.uk/website-offer?email=private@example.com'}]) {
  const s = scenario(options);
  assert.equal(tags(s), 0); s.w.setUpAndSeenTrackLead(); assert.equal(events(s).length, 0); s.close();
}
const s = scenario({oldAnalytics: 'accepted'});
assert.ok(s.d.querySelector('.cookie-banner'));
s.d.querySelector('.cookie-manage').click();
s.d.querySelector('[name="consent-analytics"]').checked = false;
s.d.querySelector('[name="consent-marketing"]').checked = true;
s.d.querySelector('.cookie-save').click();
assert.equal(tags(s), 1); assert.equal(s.w['ga-disable-G-C860VPVLNT'], true);
assert.equal(s.w.localStorage.getItem(key), 'accepted');
assert.deepEqual(events(s), [['trackSingle', '1474496937961839', 'PageView']]);
s.w.setUpAndSeenMarketingConsent(true); assert.equal(tags(s), 1); assert.equal(events(s).length, 1);
s.d.cookie = '_fbp=test; path=/; domain=setupandseen.co.uk';
s.d.cookie = '_fbc=test; path=/'; s.d.cookie = 'essential=keep; path=/';
s.d.querySelector('.cookie-settings').click(); s.d.querySelector('.cookie-reject').click();
assert.equal(events(s).length, 0); // Withdrawal cancels events queued before SDK arrival.
assert.doesNotMatch(s.d.cookie, /_fb[pc]=/); assert.match(s.d.cookie, /essential=keep/);
s.w.setUpAndSeenTrackLead(); assert.equal(events(s).length, 0);
s.w.setUpAndSeenMarketingConsent(true); assert.equal(tags(s), 1);
s.w.dispatchEvent(new s.w.StorageEvent('storage', {key, newValue: 'rejected'}));
s.w.setUpAndSeenTrackLead(); assert.equal(events(s).length, 0); s.close();

(async () => {
  for (const [consent, ok, valid] of [[true,true,true], [false,true,true], [true,false,true], [true,true,false]]) {
    const t = scenario({marketing: consent ? 'accepted' : 'rejected'});
    const form = t.d.querySelector('form[name="enquiry"]'); let requests = 0;
    t.w.fetch = async () => {requests++; return {ok};};
    if (valid) {
      form.elements.name.value = 'Private Test Name'; form.elements.email.value = 'private@example.invalid';
      form.elements.message.value = 'Private message must not reach Meta'; form.elements['privacy-consent'].checked = true;
    }
    form.dispatchEvent(new t.w.Event('submit', {bubbles: true, cancelable: true}));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(requests, valid ? 1 : 0);
    assert.equal(events(t).filter(a => a[2] === 'Lead').length, consent && ok && valid ? 1 : 0);
    assert.ok(events(t).every(a => a.length === 3));
    assert.doesNotMatch(JSON.stringify(events(t)), /Private|private@|message/);
    assert.equal(!!form.querySelector('.enquiry-confirmation'), ok && valid);
    t.close();
  }
  console.log('Meta consent and enquiry checks passed: separate choices, no prior-consent inheritance, preview/query protection, withdrawal, invalid/failed forms, and successful Lead without form data. Network mocked.');
})().catch(error => {console.error(error); process.exitCode = 1;});
