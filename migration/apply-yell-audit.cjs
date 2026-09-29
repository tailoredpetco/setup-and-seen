// Durable corrections verified against the 28 September 2026 Yell summary.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {JSDOM} = require('jsdom');
const root = path.resolve('netlify-site');
const bootstrap = fs.readFileSync('migration/analytics-consent.js', 'utf8');
fs.writeFileSync(path.join(root, 'analytics-consent.js'), bootstrap);
const version = crypto.createHash('sha256').update(bootstrap).digest('hex').slice(0, 12);
const marketing = fs.readFileSync('migration/marketing-consent.js', 'utf8');
fs.writeFileSync(path.join(root, 'marketing-consent.js'), marketing);
const marketingVersion = crypto.createHash('sha256').update(marketing).digest('hex').slice(0, 12);
const runtimeVersion = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'site-interactions-sep13.js'))).digest('hex').slice(0, 12);
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const label = (d, selector, value) => {
  const element = d.querySelector(selector);
  if (!element) throw new Error('Missing audited element: '+selector);
  const arrow = d.createElement('span'); arrow.setAttribute('aria-hidden','true'); arrow.textContent = element.querySelector('span')?.textContent.trim() || '→';
  element.textContent = value;
  if (arrow) { element.append(' ', arrow); }
};
let count = 0;
for (const file of walk(root).filter(f => f.endsWith('.html') && !f.endsWith('/404.html'))) {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8')), d = dom.window.document;
  for (const script of d.querySelectorAll('script')) {
    if (/googletagmanager\.com\/gtag\/js/.test(script.src) || script.textContent.includes('var analyticsConsent=') || script.src.includes('/analytics-consent.js')) script.remove();
    if (script.src.includes('/site-interactions-sep13.js')) script.src = '/site-interactions-sep13.js?v='+runtimeVersion;
    if (script.src.includes('/marketing-consent.js')) script.remove();
  }
  const script = d.createElement('script'); script.src='/analytics-consent.js?v='+version; d.head.append(script);
  const marketingScript = d.createElement('script'); marketingScript.src='/marketing-consent.js?v='+marketingVersion; d.head.append(marketingScript);
  if (file === path.join(root, 'index.html')) {
    d.querySelector('.hero-lead').textContent='We design mobile-friendly websites, branding and social media for small businesses. Clear design helps customers understand what you do and get in touch.';
    const services = [...d.querySelectorAll('.service-card')];
    services[0].querySelector('h3').textContent='Website design';
    services[0].querySelector('.service-kicker').textContent='Website design & development';
    services[0].querySelector('h3 + p').textContent='Mobile-friendly website design for sole traders and small businesses, with clear services and a simple route to enquiry.';
    services[1].querySelector('h3').textContent='Branding';
    services[1].querySelector('.service-kicker').textContent='Identity & visual direction';
    services[1].querySelector('h3 + p').textContent='Branding for small businesses, from logo and brand identity design to colours and typography that work together.';
    label(d, '.service-card a[href="/services/website-design"]', 'Explore website design');
    label(d, '.service-card a[href="/services/branding-logo-design"]', 'Explore branding services');
    label(d, '.home-resource-links a[href="/services/website-hosting-care"]', 'Website hosting and care');
    label(d, '.hero-case-study', 'View The Office Partner project');
    for (const [href, title] of [['/packages#website-starter','Website Starter details'],['/packages#business-launch','Business Launch details'],['/packages#set-up-and-seen','Complete package details']]) label(d, '.price-card a[href="'+href+'"]', title);
    for (const card of d.querySelectorAll('#work article')) {
      const name = card.querySelector('strong')?.textContent.trim();
      for (const a of card.querySelectorAll('a')) {
        if (/^Read case study/.test(a.textContent.trim())) { a.textContent='Read '+name+' case study'; }
        else if (/^Visit website/.test(a.textContent.trim())) { a.textContent='Visit '+name+' website'; }
      }
    }
    d.querySelector('.studio-location').textContent='Based in Worcestershire · Working UK-wide';
    label(d, '.october-offer-banner a[href="/website-offer"]', 'View £199 website offer');
  }
  if (file === path.join(root, 'privacy/index.html')) {
    for (const el of d.querySelectorAll('p')) if (el.textContent.startsWith('Last updated ')) el.textContent='Last updated 29 September 2026';
    const heading = [...d.querySelectorAll('h2')].find(e => e.textContent === 'Cookies and similar technology');
    heading.nextElementSibling.textContent='Essential technology supports security and reliable operation. Analytics and marketing cookies are optional and have separate choices. Google Analytics loads only with analytics consent; the Meta pixel loads only with marketing consent. Choose “Reject optional”, “Accept all”, or “Choose cookies” to select each purpose. A previous analytics choice does not give consent to Meta tracking. You can withdraw either consent using Cookie settings, change your choices and select “Save choices”, or reject both. Withdrawal stops further tracking for that purpose and removes the first-party cookies set by this website. It does not automatically delete information already collected; contact us about a data-rights request.';
    for (const row of d.querySelectorAll('.cookie-table tr')) if (row.textContent.includes('Google Analytics consent-mode signals')) row.remove();
    const table = d.querySelector('.cookie-table tbody');
    for (const [name,purpose,duration] of [
      ['setup-and-seen-marketing-consent','Essential local storage that remembers your separate marketing-cookie choice.','Until you change the choice or clear your browser storage'],
      ['_fbp / _fbc','Meta advertising cookies used only after marketing consent to help attribute website visits and enquiries to Facebook and Instagram ads. _fbc may be set when you follow a Meta ad.','Typically up to 3 months']
    ]) if (![...table.rows].some(row=>row.cells[0].textContent.trim()===name)) {
      const row=table.insertRow();for(const value of [name,purpose,duration]) row.insertCell().textContent=value;
    }
    const cookieNote = d.querySelector('.cookie-table-wrap').nextElementSibling;
    cookieNote.textContent='Google advertising storage, Google Signals and Google advertising-personalisation features remain disabled. With separate marketing consent, Meta Platforms Ireland Limited receives page-view and successful-enquiry events, along with technical information such as the page address, browser information, IP address and advertising identifiers. Meta uses this to measure and optimise ads and may associate activity with a Meta account. We do not include enquiry messages, names, email addresses or phone numbers in our Meta event payloads; automatic advanced matching and automatic event detection are disabled. Google and Meta may process information outside the UK under their applicable international-transfer safeguards. The Meta Privacy Policy explains Meta’s use and retention of this information.';
    const metaLink=d.createElement('a');metaLink.href='https://www.facebook.com/privacy/policy/';metaLink.textContent='Read Meta’s Privacy Policy';metaLink.target='_blank';metaLink.rel='noreferrer noopener';cookieNote.append(' ',metaLink,'.');
  }
  fs.writeFileSync(file, dom.serialize().replace(/^[ \t]+$/gm, '')); dom.window.close(); count++;
}
console.log('Applied audit corrections and consent-gated Analytics to '+count+' pages.');
