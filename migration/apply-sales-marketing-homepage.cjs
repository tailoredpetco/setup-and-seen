// Approved September repositioning. Run after the earlier audits and before bundling.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {JSDOM} = require('jsdom');
const root = path.join(__dirname, '../netlify-site'), file = path.join(root, 'index.html');
const dom = new JSDOM(fs.readFileSync(file, 'utf8')), d = dom.window.document;
const q = s => d.querySelector(s), text = (s, value) => { q(s).textContent = value; };
const html = (s, value) => { q(s).innerHTML = value; };
d.body.classList.add('sales-marketing-home');
const title = 'Sales & Marketing Support Worcestershire | Set Up & Seen';
const description = 'Sales and marketing support for small businesses. Websites, branding, social media, advertising and email marketing. Based in Worcestershire, working UK-wide.';
d.title = title;
for (const s of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) q(s).content = title;
for (const s of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) q(s).content = description;
text('.hero-copy .eyebrow', 'Worcestershire based · Working UK-wide');
html('.hero-copy h1', 'Sales &amp; marketing<br>support for<br><em>small businesses.</em>');
text('.hero-lead', 'From a stronger brand and a better website to social media, advertising and everyday marketing support. We bring it together, so your business is easier to find, understand and choose.');
html('.hero-actions', '<a class="button primary" href="#contact">Tell us what you need <span aria-hidden="true">↗</span></a><a class="text-link" href="#work">See our work <span aria-hidden="true">↓</span></a>');
q('.home-offer-note')?.remove();
text('.hero-copy .reassurance', 'One project or ongoing support · Clear scope and costs');
text('.home-project-label', 'A complete business launch');
text('.hero-project-stamp .home-project-scope', 'One identity, carried through the website, social media and branded email.');
// Keep the offer discoverable without placing a large promotion before the introduction.
html('.october-offer-banner', '<p><span>Starting with a website?</span> <strong>A one-page website. £199 one-off.</strong></p><a class="october-offer-button" href="/website-offer">Explore the offer <span aria-hidden="true">↗</span></a>');
text('#services .eyebrow', 'How we can help');
html('#services h2', 'The right support.<br><em>All in one place.</em>');
text('#services .section-heading > p', 'Launch your business, refresh how it looks or get help with the marketing that keeps being put off. Choose a single project or support that continues as your business grows.');
const services = [
 ['Your place online', 'Website design', 'New websites and thoughtful updates, with clear services, genuine examples of your work and an easy way for customers to get in touch.', '/services/website-design', 'Explore website design'],
 ['A recognisable identity', 'Branding', 'Logos, colour, typography and branded materials that give your business a consistent, professional presence.', '/services/branding-logo-design', 'Explore branding'],
 ['A presence with purpose', 'Social media', 'Profile set-up, content planning and designed posts that reflect your business and give people a reason to follow and enquire.', '/services/social-media-management', 'Explore social media support'],
 ['Reach potential customers', 'Advertising', 'Facebook, Instagram and Google campaigns, with focused messages, considered creative and a clear next step. Advertising spend is agreed separately.', '/services/marketing-support', 'Discuss advertising'],
 ['Stay in touch', 'Email marketing', 'Newsletters and campaign emails that keep your business in mind, explain your offers and guide readers to the next step.', '/services/marketing-support', 'Discuss email marketing'],
 ['From strategy to everyday support', 'Marketing support', 'Practical planning, copywriting, campaign materials and ongoing help. We agree the priorities and take care of the work you need support with.', '/services/marketing-support', 'Explore marketing support']
];
html('.service-grid', services.map(([k,h,p,url,label]) => `<article class="service-card"><p class="service-kicker">${k}</p><h3>${h}</h3><p>${p}</p><a class="service-link" href="${url}">${label}</a></article>`).join(''));
html('#services .home-resource-links', '<a href="/services/website-audit">Website reviews</a><a href="/services/website-hosting-care">Hosting &amp; care</a><a href="/advice">Advice &amp; guides</a>');
html('.work-heading h2', 'Good work.<br><em>Made for real businesses.</em>');
text('.work-heading > p', 'A closer look at the websites, identities and social content we create. Each project has its own scope, agreed around the business and its customers.');
for (const el of d.querySelectorAll('.portfolio-meta > span')) el.textContent = el.textContent.replace(/^\d+\s*·\s*/, '');
d.querySelectorAll('[data-marketing-example], [data-portfolio-invitation]').forEach(el => el.remove());
const portfolioAmp = '<img class="portfolio-brand-amp" src="/assets/marketing-work/original-ampersand-white.svg" alt="&amp;" width="128" height="121" style="display:inline-block;width:.85em;height:.8em;max-width:none;vertical-align:-.04em;object-fit:contain">';
const examples = [
 {kind:'Brand identity',name:'Set Up & Seen',scope:'Visual identity · Branded materials',copy:'Our original wordmark, colours and typography, brought together across the website and branded materials.',src:'/assets/marketing-work/brand-card.webp',alt:'Set Up and Seen blue brand card with original wordmark and the message A clear presence. A confident next step.',cls:'brand',width:2008,height:1300,href:'/services/branding-logo-design',label:'Explore branding services'}
];
for (const e of examples) {
 const card = d.createElement('article'); card.className = 'portfolio-card marketing-example '+e.cls;card.dataset.marketingExample='';
 card.innerHTML = `<a class="portfolio-image" href="${e.href}"><img src="${e.src}" alt="${e.alt}" width="${e.width}" height="${e.height}" loading="lazy" decoding="async"><span class="portfolio-view">${e.label} ↗</span></a><div class="portfolio-meta"><span>${e.kind}</span><strong>${e.name}</strong><small>${e.scope}</small><p>${e.copy}</p><div class="portfolio-actions"><a href="${e.href}">${e.label} <span aria-hidden="true">↗</span></a></div></div>`;
 if(e.cls==='brand') {
  card.querySelector('.portfolio-meta > strong').innerHTML='Set Up '+portfolioAmp+' Seen';
  // Present the original supplied artwork straight on, using the portfolio image ratio.
  card.querySelector('.portfolio-image').classList.add('brand-artwork');card.id='our-brand-identity';
  card.querySelector('.portfolio-image').setAttribute('aria-label','Explore Set Up and Seen branding services');
  card.querySelector('.portfolio-image').innerHTML='<span class="brand-wordmark-panel"><img src="/assets/marketing-work/original-wordmark-colour.svg" alt="Set Up and Seen original logo" width="807" height="175" loading="lazy" decoding="async"></span><span class="brand-message-panel"><span>A clear presence.<br>A confident next step.</span></span>';
 }
 q('.portfolio-grid').append(card);
}
const invitation=d.createElement('article');
invitation.className='portfolio-card portfolio-invitation';invitation.dataset.portfolioInvitation='';
invitation.setAttribute('aria-labelledby','next-project-title');invitation.id='your-next-chapter';
invitation.innerHTML='<a class="portfolio-image invitation-artwork" href="#contact" aria-label="Your business deserves to be here. Tell us what you need."><span class="portfolio-monitor"><span class="device-display"><img src="/assets/marketing-work/our-website-desktop.jpg" alt="Set Up and Seen’s actual website presented on a desktop display" width="1348" height="842" loading="lazy" decoding="async"></span><span class="monitor-stand" aria-hidden="true"></span><span class="monitor-foot" aria-hidden="true"></span></span><span class="portfolio-laptop" aria-hidden="true"><span class="device-display"><img src="/assets/marketing-work/our-website-desktop.jpg" alt="" width="1348" height="842" loading="lazy" decoding="async"></span><span class="laptop-base"></span></span></a><div class="portfolio-meta"><span>Your next chapter</span><strong id="next-project-title">Your business deserves to be here</strong><small>Websites · Branding · Marketing</small><p>Are you ready to get set up '+portfolioAmp+' seen?</p><div class="portfolio-actions"><a href="#contact">Tell us what you need <span aria-hidden="true">↗</span></a></div></div>';
q('[data-marketing-example]').before(invitation);
text('#pricing .section-heading .eyebrow', 'Website options');
html('#pricing .section-heading h2', 'A professional website.<br><em>A clear starting point.</em>');
text('#pricing .section-heading > p', 'Our website options sit alongside the wider marketing services. For branding, campaigns or ongoing support, tell us what you need and we will prepare a tailored quote.');
html('.approach h2', 'A clear plan.<br><em>Work you can feel proud of.</em>');
text('.approach .section-heading > p', 'Whether it is a website, a brand or a campaign, you know what is included, what it costs and what happens next.');
html('.approach .steps', [
 ['Start with a conversation','Tell us about your business, your customers and what you would like help with.'],
 ['Agree the right support','We confirm the scope, price, timings and review stages in writing before work begins.'],
 ['Create and refine','We develop the agreed work, share it with you and use your feedback to refine it.'],
 ['Put it to work','After approval, we arrange the launch or handover and any ongoing support you have chosen.']
 ].map(([h,p])=>`<article><h3>${h}</h3><p>${p}</p></article>`).join(''));
html('.studio-summary', '<p>Small businesses need good marketing, and someone to help get it done.</p><p>Based in Worcestershire and working across the UK, we bring strategy, branding, websites, social media and advertising together. You can come to us for a specific piece of work or for ongoing support.</p><a class="text-link" href="#contact">Talk to us about your business <span aria-hidden="true">↗</span></a>');
text('.studio-principles div:first-child dd', 'Work shaped by your business and customers.');
text('.studio-principles div:last-child dt', 'Support that fits');
text('.studio-principles div:last-child dd', 'A single project or ongoing help, with the scope agreed together.');
const next = q('#enquiry-next-steps');
const note = d.createElement('p');note.id=next.id;note.className='contact-next-steps';
note.innerHTML='<strong>A conversation first.</strong> We will discuss what you need, then confirm the scope, price and next steps in writing. No payment is taken when you enquire.';
next.replaceWith(note);
text('.footer-top > p', 'Sales and marketing support for small businesses. From strategy to everyday support, brought together.');
const select=q('select[name="service"]');
const group=[...select.querySelectorAll('optgroup')].find(g=>['Branding and visibility','Branding and marketing'].includes(g.label));
group.label='Branding and marketing';
for(const name of ['Advertising campaigns','Email marketing']) if(![...select.options].some(o=>o.value===name)){const o=d.createElement('option');o.textContent=name;group.append(o);}
const extraFaqs = [
 ['Can you help with more than a website?', 'Yes. We provide branding, social media, advertising, email marketing, copywriting and ongoing marketing support. Tell us what you need; we will agree the priorities, scope and costs before work starts.'],
 ['Can we start with one project?', 'Yes. You can start with a single piece of work or discuss ongoing support. There is no need to choose a complete launch package. Any ongoing arrangement and its terms are agreed in your written proposal.']
];
for (const [question,answer] of extraFaqs) {
 if ([...d.querySelectorAll('.faq-list summary')].some(e=>e.textContent.startsWith(question))) continue;
 const detail=d.createElement('details');detail.innerHTML=`<summary>${question}<span aria-hidden="true">+</span></summary><p>${answer}</p>`;q('.faq-list').prepend(detail);
}
text('.faq-group h3', 'Working together');
text('.faq-intro > p:not(.eyebrow)', 'The essentials about our services, costs and getting started.');
for (const script of d.querySelectorAll('script[type="application/ld+json"]')) {
 const data=JSON.parse(script.textContent);
 if(Array.isArray(data['@type']) && data['@type'].includes('Organization'))data.description=description;
 if(data['@type']==='FAQPage')data.mainEntity=[...d.querySelectorAll('.faq-list details')].map(e=>({'@type':'Question',name:e.querySelector('summary').firstChild.textContent,acceptedAnswer:{'@type':'Answer',text:e.querySelector('p').textContent}}));
 script.textContent=JSON.stringify(data);
}
// Use the original native ampersand artwork, with the real character for accessibility.
const amp=q('h2 .brand-ampersand').cloneNode(true), heading=q('.hero h1'), first=heading.firstChild;
const parts=first.textContent.split('&');first.replaceWith(d.createTextNode(parts[0]),amp,d.createTextNode(parts[1]));
const main=q('main');
for(const s of ['.hero','.october-offer-banner','#services','#work','#pricing','#approach','#about','.health-check-strip','#faqs','#contact'])main.append(q(s));
// Fold the new native layout into the existing single stylesheet bundle.
const css=fs.readFileSync(path.join(__dirname,'homepage-review.css'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'sales-marketing-homepage.css'),'utf8');
const name='homepage-review-'+crypto.createHash('sha256').update(css).digest('hex').slice(0,12)+'.css';
fs.writeFileSync(path.join(root,'assets',name),css);q('link[data-homepage-review]').href='/assets/'+name;
fs.writeFileSync(file,dom.serialize());dom.window.close();
console.log('Applied broader sales and marketing homepage using approved portfolio artwork.');
