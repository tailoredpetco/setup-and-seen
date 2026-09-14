const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM, VirtualConsole} = require('jsdom');
const root = 'netlify-site/';
const route = '/services/vehicle-advert-management';
const origin = 'https://www.setupandseen.co.uk';
const read = name => fs.readFileSync(root + name, 'utf8');
const markup = read('services/vehicle-advert-management/index.html');
const d = new JSDOM(markup, {url: origin + route}).window.document;
assert.equal(d.querySelectorAll('h1').length, 1);
// Keep the complete service copy, including FAQ headings, free of singular voice.
assert.equal(d.querySelector('h1 em').textContent, 'Leave the adverts to us.');
assert.match(d.querySelector('.vehicle-intro').textContent, /We prepare your descriptions/);
assert.match(d.querySelector('.vehicle-fit').textContent, /We handle the agreed preparation/);
assert.equal(d.querySelector('.service-page-cta h2').textContent, 'Tell us about your stock.');
assert.match(d.querySelector('.service-page-cta p:not(.eyebrow)').textContent, /We will check the setup/);
for (const el of d.querySelectorAll('.vehicle-service h1, .vehicle-service h2, .vehicle-service h3, .vehicle-service p, .vehicle-service a, .vehicle-service li, .vehicle-service summary')) {
  assert.doesNotMatch(el.textContent, /\b(?:I|me|my|mine|myself)\b/, 'Use plural business voice: ' + el.textContent);
}

assert.equal(d.querySelector('link[rel=canonical]').href, origin + route);
assert.match(d.title, /Vehicle Advert Management/);
assert.equal(d.querySelectorAll('.vehicle-package').length, 1);
assert.match(d.querySelector('.vehicle-price').textContent, /^From £300 per month$/);
assert.match(d.querySelector('.vehicle-package').textContent, /active-stock limit/);
assert.match(d.querySelector('.vehicle-package').textContent, /cancellation notice/);
assert.match(d.querySelector('.vehicle-package').textContent, /not mean unlimited/);
assert.match(d.querySelector('.vehicle-package').textContent, /eight new vehicle listings/);
assert.match(d.querySelector('.vehicle-package').textContent, /one existing stock-management system/);
assert.match(d.querySelector('.vehicle-package').textContent, /allowance.*agreed in your quote/);
assert.match(d.querySelector('.vehicle-exclusions').textContent, /Advertising subscriptions/);
assert.ok(!d.querySelector('.service-proof'), 'Do not imply unverified service case studies.');
assert.equal(d.querySelectorAll('.faq-list details').length, 9);
const graph = [...d.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)).find(o => o['@graph'])['@graph'];
const faq = graph.find(x => x['@type'] === 'FAQPage');
[...d.querySelectorAll('.faq-list details')].forEach((detail, i) => {
  assert.equal(detail.querySelector('p').textContent, faq.mainEntity[i].acceptedAnswer.text);
  assert.equal(detail.querySelector('summary').childNodes[0].textContent, faq.mainEntity[i].name);
  assert.doesNotMatch(faq.mainEntity[i].name, /\b(?:I|me|my|mine|myself)\b/);
});
for (const a of d.querySelectorAll('.vehicle-service a.button')) {
  assert.equal(a.href, origin + '/?service=Vehicle%20advert%20management#contact');
}
const marketing = new JSDOM(read('services/marketing-support/index.html')).window.document;
assert.equal(marketing.querySelectorAll('#vehicle-advert-support').length, 1);
assert.equal(marketing.querySelector('#vehicle-advert-support a').getAttribute('href'), route);
const homeMarkup = read('index.html');
const home = new JSDOM(homeMarkup).window.document;
assert.equal(home.querySelectorAll('nav a[href="' + route + '"]').length, 0);
assert.ok(!home.querySelector('#services').textContent.includes('Vehicle advert'));
assert.equal([...home.querySelectorAll('option')].filter(o => o.value === 'Vehicle advert management').length, 1);
assert.ok(read('_redirects').includes(route + ' ' + route + '/index.html 200!'));
assert.ok(read('sitemap.xml').includes('<loc>' + origin + route + '</loc>'));
assert.match(read('assets/vehicle-advert-service.css'), /vehicle-breadcrumb\{position:static;flex-direction:row/);

(async () => {
  const jsdomErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => jsdomErrors.push(String(error.stack || error)));
  const dom = new JSDOM(homeMarkup, {url: origin + '/?service=Vehicle%20advert%20management#contact', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole});
  const w = dom.window;
  // Track real observers so teardown cannot call into an already closed window.
  const observers = [];
  const OriginalMutationObserver = w.MutationObserver;
  w.MutationObserver = class extends OriginalMutationObserver {
    constructor(callback) { super(callback); observers.push(this); }
  };
  w.matchMedia = () => ({matches: true}); w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.localStorage.setItem('setup-and-seen-cookie-consent', 'rejected');
  let posts = [];
  w.fetch = async (url, options) => {posts.push({url, body: new URLSearchParams(options.body)}); return {ok: true};};
  w.eval(read('site-interactions-sep13.js'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  const form = w.document.querySelector('form[name=enquiry]');
  assert.equal(form.elements.service.value, 'Vehicle advert management');
  assert.equal(form.checkValidity(), false);
  form.elements.name.value = 'Local automated QA';
  form.elements.email.value = 'qa@example.invalid';
  form.elements.message.value = 'Intercepted test only, no real enquiry is sent.';
  form.elements['privacy-consent'].checked = true;
  form.dispatchEvent(new w.Event('submit', {bubbles: true, cancelable: true}));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(posts.length, 1);
  assert.equal(posts[0].url, '/');
  assert.equal(posts[0].body.get('service'), 'Vehicle advert management');
  assert.equal(posts[0].body.get('form-name'), 'enquiry');
  assert.equal(posts[0].body.get('website'), '');
  assert.ok(form.querySelector('.enquiry-confirmation'));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(jsdomErrors, [], 'No unhandled errors during enquiry interactions');
  observers.forEach(observer => observer.disconnect());
  dom.window.close();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(jsdomErrors, [], 'No unhandled errors after window teardown');
  console.log('Vehicle service scope, navigation, metadata, FAQ and intercepted enquiry tests passed.');
})().catch(error => {console.error(error); process.exitCode = 1;});
