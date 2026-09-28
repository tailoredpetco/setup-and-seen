// Durable corrections verified against the 28 September 2026 Yell summary.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {JSDOM} = require('jsdom');
const root = path.resolve('netlify-site');
const bootstrap = fs.readFileSync('migration/analytics-consent.js', 'utf8');
fs.writeFileSync(path.join(root, 'analytics-consent.js'), bootstrap);
const version = crypto.createHash('sha256').update(bootstrap).digest('hex').slice(0, 12);
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
  }
  const script = d.createElement('script'); script.src='/analytics-consent.js?v='+version; d.head.append(script);
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
    for (const el of d.querySelectorAll('p')) if (el.textContent.startsWith('Last updated ')) el.textContent='Last updated 28 September 2026';
    const heading = [...d.querySelectorAll('h2')].find(e => e.textContent === 'Cookies and similar technology');
    heading.nextElementSibling.textContent='The website uses essential technology required for security, access and reliable operation. Google Analytics is optional and loads only after you select “Accept analytics”. Before you accept, and when you reject analytics, we do not load the Google Analytics tag or send analytics measurements. After you accept, the cookies below may be used to understand visits and page use. You can withdraw consent at any time using Cookie settings, then “Reject analytics”. This disables further Analytics measurement and removes the Analytics cookies set by this website. Information already collected before withdrawal is not automatically deleted; contact us if you wish to make a data-rights request.';
    for (const row of d.querySelectorAll('.cookie-table tr')) if (row.textContent.includes('Google Analytics consent-mode signals')) row.remove();
  }
  fs.writeFileSync(file, dom.serialize().replace(/^[ \t]+$/gm, '')); dom.window.close(); count++;
}
console.log('Applied audit corrections and consent-gated Analytics to '+count+' pages.');
