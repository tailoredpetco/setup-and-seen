/* Run after the earlier maintenance passes. The October brief explicitly uses
 * I/my and identifies owned businesses; this supersedes September's studio voice.
 * Production serves netlify-site directly. This pass is repeatable for rebuilds.
 */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {JSDOM} = require('jsdom');
const root = path.resolve('netlify-site');
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const hash = value => crypto.createHash('sha256').update(value).digest('hex').slice(0,12);
const css = fs.readFileSync(path.join(__dirname,'creative-review.css'),'utf8');
const motion = fs.readFileSync(path.join(__dirname,'creative-motion.js'),'utf8');
const cssUrl = '/assets/creative-review-'+hash(css)+'.css';
const jsUrl = '/assets/creative-motion-'+hash(motion)+'.js';
fs.writeFileSync(path.join(root,cssUrl),css); fs.writeFileSync(path.join(root,jsUrl),motion);
const singular = text => text
  .replace(/\b[Ww]e[’']re\b/g,'I’m').replace(/\b[Ww]e[’']ve\b/g,'I’ve')
  .replace(/\b[Ww]e[’']ll\b/g,'I’ll').replace(/\b[Ww]e[’']d\b/g,'I’d')
  .replace(/\b[Ww]e are\b/g,'I am').replace(/\b[Ww]e were\b/g,'I was')
  .replace(/\b[Ww]e\b/g,'I').replace(/\bOur\b/g,'My').replace(/\bour\b/g,'my')
  .replace(/\bUs\b/g,'Me').replace(/\bus\b/g,'me').replace(/\bourselves\b/g,'myself')
  .replace(/\bReal client work\b/g,'Selected work');
function insert(d, html) { const t=d.createElement('template');t.innerHTML=html;return t.content; }
function updateJson(value, key='') {
  if(typeof value==='string')return key==='name'&&value.endsWith('?')?value:singular(value);
  if(Array.isArray(value))return value.map(v=>updateJson(v));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,updateJson(v,k)]));
  return value;
}
function proof(d, kind) {
 const data={
  website:['Website design in practice','A clear choice at the right moment.','The Clent Auto Repairs homepage puts a call option beside the quote request. Repair information and location sit close by, so a driver can decide how to get in touch.','/our-work/clent-auto-repairs','Explore the website decisions','<figure><img src="/clent-auto-repairs.webp" width="1200" height="750" loading="lazy" alt="Clent Auto Repairs website with call and quote options below its repair introduction"><figcaption>Clent Auto Repairs. Brand identity and website.</figcaption></figure>'],
  branding:['Branding in practice','A logo is the beginning.','For The Office Partner, I carried the navy and teal identity through the website, social designs and branded email. The original artwork below is part of that identity.','/our-work/the-office-partner','Explore the identity and launch','<figure><div class="creative-proof-brand"><img src="/assets/office-partner/logo.svg" width="1485" height="245" loading="lazy" alt="The Office Partner original navy and teal logo"></div><figcaption>The Office Partner. My own business, shown as an example of my branding work.</figcaption></figure>'],
  social:['Social design in practice','A useful message, with a recognisable identity.','This Office Partner design introduces the service, names everyday tasks and points people towards the website. The colours and lettering connect it to the wider brand.','/our-work/the-office-partner','See the social and brand work','<figure class="creative-proof-social"><img src="/assets/office-partner/facebook.webp" width="1638" height="2048" loading="lazy" alt="The Office Partner social design explaining office support in navy and teal"><figcaption>The Office Partner. My own business. This is a design example, not a claim about post performance.</figcaption></figure>'],
  marketing:['The thinking before the design','What needs to happen next?','Before suggesting a campaign, I need to understand who it is for, what you are offering and what someone should do next. Those decisions shape the wording, design and choice of channel.','/?service=Marketing%20support#contact','Talk through your priorities','<div class="creative-proof-plan"><dl><div><dt>The customer</dt><dd>A small business with a clear service to explain.</dd></div><div><dt>The message</dt><dd>What I do. Who it helps. Why it matters.</dd></div><div><dt>The next step</dt><dd>Make it easy to ask a useful question.</dd></div></dl><p class="creative-example-label">Illustrative planning example. The starting point is your business, not a fixed template.</p></div>']
 }[kind];
 const old=d.querySelector('.service-proof,.creative-proof');if(!old)return;
 old.replaceWith(insert(d,`<section class="creative-proof section-pad" aria-labelledby="service-proof-title"><div><p class="eyebrow">${data[0]}</p><h2 id="service-proof-title">${data[1]}</h2><p>${data[2]}</p><a class="creative-link" href="${data[3]}">${data[4]}</a></div>${data[5]}</section>`));
}
const changed=[];
for (const file of walk(root).filter(f=>f.endsWith('.html')&&!f.endsWith('/404.html'))) {
 const source=fs.readFileSync(file,'utf8'), rel=path.relative(root,file);
 const dom=new JSDOM(source),d=dom.window.document;
 const legal=/^(privacy|terms|website-offer\/terms|competition)(\/|$)/.test(rel);
 const walker=d.createTreeWalker(d.body,dom.window.NodeFilter.SHOW_TEXT);
 while(walker.nextNode()) {
  const n=walker.currentNode, parent=n.parentElement;
  if(!parent||parent.closest('script,style,blockquote,.testimonial-strip,.privacy-check,summary,option,optgroup'))continue;
  if(legal&&!parent.closest('.site-header,footer'))continue;
  n.nodeValue=singular(n.nodeValue);
 }
 if(!legal) {
  for(const meta of d.querySelectorAll('meta[content]'))meta.content=singular(meta.content);
  for(const script of d.querySelectorAll('script[type="application/ld+json"]'))script.textContent=JSON.stringify(updateJson(JSON.parse(script.textContent)));
  for(const el of d.querySelectorAll('[aria-label],[placeholder]'))for(const a of ['aria-label','placeholder'])if(el.hasAttribute(a))el.setAttribute(a,singular(el.getAttribute(a)));
 }
 // Owned work is evidence of design, never an independent endorsement.
 for(const quote of d.querySelectorAll('blockquote'))if(/Katie|The Tailored Pet Co/.test(quote.textContent))quote.remove();
 for(const el of d.querySelectorAll('a[href="/our-work#the-tailored-pet-co"]')) {
  const label=el.querySelector('span');if(label&&!label.textContent.includes('own business'))label.append(' · My own business');
 }
 for(const a of d.querySelectorAll('.service-proof a'))if(a.querySelector('img[src*="tailored-pet"]')){const span=a.querySelector('span');if(span&&!span.textContent.includes('own business'))span.append(' · My own business');}
 if(rel==='website-offer/index.html')for(const el of d.querySelectorAll('.campaign-work-card p,.campaign-work-card small'))if(/My work · The Office Partner/.test(el.textContent))el.textContent='The Office Partner · My own business';
 if(rel==='services/pet-business-website-design/index.html')for(const p of d.querySelectorAll('p'))if(p.textContent.startsWith('The Tailored Pet Co project'))p.textContent=p.textContent.replace('The Tailored Pet Co project','The project for my own business, The Tailored Pet Co,');
 if(rel==='index.html') {
  d.body.classList.add('creative-home');
  d.querySelectorAll('#top,.october-offer-banner,#services,#meet-set-up-and-seen,#work,#approach,.creative-showcase,.creative-marketing,.creative-process').forEach(e=>e.remove());
  const fragment=insert(d,fs.readFileSync(path.join(__dirname,'creative-home.html'),'utf8'));
  d.querySelector('#pricing').before(fragment);
  const nav=d.querySelector('.site-header nav');
  nav.innerHTML='<a href="/our-work">My work</a><a href="#services">Services</a><a href="/packages">Packages</a><a href="#about">About</a><a href="/advice">Advice</a><a class="nav-cta" href="#contact">Let’s talk</a>';
  const pricing=d.querySelector('#pricing');
  pricing.querySelector('.section-heading h2').innerHTML='Your starting point.<br><em>Room to grow.</em>';
  pricing.querySelector('.section-heading>p').textContent='Website packages are one way to start. For branding, campaigns or ongoing marketing support, tell me what you need and I’ll prepare a tailored quote.';
  const offer=pricing.querySelector('.october-package-note');
  pricing.querySelector('.pricing-grid').after(offer);
  offer.querySelector('.october-package-scope').innerHTML='Domain registration and renewal are extra. Additional standard pages are £99 each. Branding, full copywriting, shops, booking systems and other extra features are quoted separately.';
  if(!offer.querySelector('.creative-offer-deadline'))offer.querySelector('div').insertAdjacentHTML('beforeend','<p class="creative-offer-deadline">To qualify, accept the written proposal and make the agreed initial or full payment by 11:59pm UK time on 31 October 2026. Your website can launch later. An enquiry is not a booking.</p><a class="creative-link" href="/website-offer/terms">Read the offer terms</a>');
  d.querySelector('.health-check-strip')?.remove();
  d.querySelector('#about').replaceWith(insert(d,'<section class="creative-about creative-section" id="about"><div><p class="eyebrow">Independent by choice</p><h2>Creative thinking.<br><em>Practical help.</em></h2></div><div><p>I’m Maria, the person behind Set Up &amp; Seen. I work with start-ups, sole traders and small businesses in Worcestershire and across the UK.</p><p>You can come to me with one piece of work or a longer list. I’ll help you work out the priorities, agree what is needed and get on with creating it.</p><a class="creative-link" href="#contact">Tell me what you’re working on</a></div></section>'));
  const faq=d.querySelector('#faqs');
  for(const detail of faq.querySelectorAll('details'))if(/How much does|What do I need to supply|Can I choose a larger|What does sales and marketing/.test(detail.querySelector('summary').textContent))detail.remove();
  faq.querySelector('.faq-intro>p').textContent='A few useful details about working together. Package pages cover the full scope and costs.';
  const faqSchema=[...d.querySelectorAll('script[type="application/ld+json"]')].find(s=>JSON.parse(s.textContent)['@type']==='FAQPage');
  faqSchema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:[...faq.querySelectorAll('details')].map(e=>({'@type':'Question',name:e.querySelector('summary').childNodes[0].textContent,acceptedAnswer:{'@type':'Answer',text:e.querySelector('p').textContent}}))});
  const contact=d.querySelector('#contact');
  contact.querySelector('h2').innerHTML='What are you<br><em>working on?</em>';
  contact.querySelector('.contact-intro>p:not(.eyebrow)').textContent='Tell me a little about your business and the help you need. Use the form, email, phone or WhatsApp, whichever suits you.';
  const select=contact.querySelector('select[name="service"]');
  const unsure=[...select.options].find(o=>o.value==='Not sure yet');
  if(unsure){const group=unsure.parentElement;select.querySelector('option').after(unsure);if(group.tagName==='OPTGROUP'&&!group.children.length)group.remove();}
  // Group services before packages, while preserving every existing value and inbound selection.
  const serviceGroup=select.querySelector('optgroup[label="Branding and marketing"]');
  if(serviceGroup){serviceGroup.label='Services';unsure.after(serviceGroup);}
  if(!select.querySelector('option[value="Website design"]'))serviceGroup.insertAdjacentHTML('afterbegin','<option value="Website design">Website design</option>');
  const brandOption=[...select.options].find(o=>o.value==='Branding Only');if(brandOption){brandOption.value='Branding Only';brandOption.textContent='Branding';}
  const marketingOption=[...select.options].find(o=>o.value==='Marketing support');if(marketingOption){marketingOption.value='Marketing support';marketingOption.textContent='Sales and marketing support';}
  d.querySelectorAll('link[data-introduction-video]').forEach(e=>e.remove());
  d.querySelectorAll('script[data-creative-motion]').forEach(e=>e.remove());
  const script=d.createElement('script');script.src=jsUrl;script.defer=true;script.dataset.creativeMotion='';d.head.append(script);
  for(const node of [...d.querySelector('main').childNodes])if(node.nodeType===3&&!node.textContent.trim())node.remove();
 }
 const serviceKinds={'services/website-design/index.html':'website','services/branding-logo-design/index.html':'branding','services/social-media-management/index.html':'social','services/social-media-setup/index.html':'social','services/marketing-support/index.html':'marketing'};
 if(serviceKinds[rel])proof(d,serviceKinds[rel]);
 if(rel==='services/marketing-support/index.html')d.querySelector('h1').textContent='Sales and marketing support for small businesses';
 // Preserve the existing free check but move its full pitch off the homepage.
 if(rel==='services/website-audit/index.html'&&!d.querySelector('#free-homepage-check'))d.querySelector('.service-page-hero').after(insert(d,'<section id="free-homepage-check" class="service-page-section section-pad"><p class="eyebrow">A smaller starting point</p><h2>A free three-point homepage check.</h2><p>I’ll look at clarity, trust and the next step for a visitor, then give you three practical observations. No obligation to buy.</p><a class="button primary" href="/?service=Free%20homepage%20health%20check#contact">Request my free check</a></section>'));
 if(rel==='our-work/index.html') {
  const hero=d.querySelector('.work-page-hero');hero.querySelector('h1').innerHTML='Different businesses.<br><em>Their own character.</em>';
  const intro=[...hero.querySelectorAll('p')].find(p=>!p.classList.contains('eyebrow'));
  if(intro)intro.textContent='Explore the identity, website and practical decisions behind each project. The Office Partner and The Tailored Pet Co are my own businesses, shown here as examples of the work I create.';
  for(const slug of ['the-office-partner','the-tailored-pet-co']) {
   const article=d.getElementById(slug);if(!article)continue;
   if(!article.querySelector('.creative-ownership'))article.querySelector('h2').after(insert(d,'<p class="creative-ownership">My own business. A design and launch project.</p>'));
   const paras=[...article.querySelectorAll('p')];
   for(const p of paras)if(/Give Maria’s|The business is taking bookings|receiving Facebook|Google Business Profile\.$/.test(p.textContent))p.textContent=slug==='the-office-partner'?'Create a recognisable identity and a website that explains the office support I offer, with clear services, pricing and contact routes.':'The finished website brings the identity, services, prices and coverage information together, with a clear route to request a quote.';
   for(const dt of article.querySelectorAll('dt,h3'))if(dt.textContent==='The outcome')dt.textContent='The finished work';
  }
  for(const s of d.querySelectorAll('script[type="application/ld+json"]')){let json=JSON.parse(s.textContent);for(const item of json.mainEntity?.itemListElement||[])if(item.item?.name==='The Tailored Pet Co')item.item.description='My own pet-care business: naming, branding, website and social media set-up, with clear services and enquiry routes.';s.textContent=JSON.stringify(json);}
  if(!d.querySelector('#work-in-motion'))d.querySelector('.service-page-cta').before(insert(d,'<section id="work-in-motion" class="creative-proof section-pad"><div><p class="eyebrow">Work in motion</p><h2>A different way to show the work.</h2><p>An 18-second portfolio edit, using the websites and brand work shown on this page. Close-up details give way to the complete designs.</p><p>The Office Partner and The Tailored Pet Co are my own businesses.</p><p class="creative-film-note">Silent video. All project information is also available in the case studies above.</p></div><div class="creative-reel"><video controls playsinline preload="none" width="1080" height="1920" poster="/assets/creative-20261018/reel-poster.webp" aria-label="18-second portfolio edit showing Clent Auto Repairs, The Tailored Pet Co and The Office Partner"><source src="/assets/creative-20261018/portfolio-reel.mp4" type="video/mp4"><p>Explore the project case studies above to see the work.</p></video></div></section>'));
 }
 if(rel==='our-work/the-office-partner/index.html') {
  const hero=d.querySelector('.office-case-hero');
  hero.querySelector('h1').textContent='The Office Partner';
  hero.querySelector('.eyebrow').textContent='Branding, website and launch · My own business';
  const paras=[...hero.querySelectorAll('p')].filter(p=>!p.classList.contains('eyebrow'));
  if(paras[0])paras[0].textContent='An identity that works from the first post to the first enquiry.';
  if(paras[1])paras[1].textContent='The Office Partner is my own office support business. I created the identity, website, social presence and branded email together, so each introduction would feel like the same business.';
  for(const p of d.querySelectorAll('.office-story-section p')){
   p.textContent=p.textContent.replace('Led by Maria, The Office Partner','My business, The Office Partner,').replace('My business, The Office Partner provides','My business, The Office Partner, provides').replace('Maria wanted The Office Partner','I wanted The Office Partner');
   if(p.textContent.startsWith('Launched in September 2026,'))p.textContent='The September 2026 launch brought the identity, website, social presence and branded email together. The finished site explains the services and support options, gives visitors pricing information and makes the enquiry route clear.';
  }
 }
 if(rel==='our-work/the-tailored-pet-co/index.html') {
  const intro=d.querySelector('.search-intro');intro.textContent='The Tailored Pet Co is my own pet-care business. I created its name, identity and website, bringing a warm visual style together with practical service, pricing and coverage information.';
  const eyebrow=d.querySelector('.search-hero .eyebrow');if(eyebrow)eyebrow.textContent='Pet care · My own business';
  if(!d.querySelector('.creative-ownership'))intro.after(insert(d,'<p class="creative-ownership">An owned-business project, shown as an example of my design and implementation work.</p>'));
 }
 // Pass the selected service through the established, validated enquiry contract.
 if(serviceKinds[rel]) {
  const values={website:'Website design',branding:'Branding Only',social:rel.includes('setup')?'Social Media Set-up':'Social Media Support',marketing:'Marketing support'};
  for(const a of d.querySelectorAll('a[href]')){const u=new URL(a.getAttribute('href'),'https://www.setupandseen.co.uk');if(u.origin==='https://www.setupandseen.co.uk'&&u.pathname==='/'&&u.hash==='#contact'&&!u.searchParams.has('service')&&!u.searchParams.has('package'))a.setAttribute('href','/?service='+encodeURIComponent(values[serviceKinds[rel]])+'#contact');}
 }
 if(!legal) {
  d.querySelectorAll('link[data-creative-review]').forEach(e=>e.remove());
  const link=d.createElement('link');link.rel='stylesheet';link.href=cssUrl;link.dataset.creativeReview='';d.head.append(link);
 }
 const out=dom.serialize();if(out!==source){fs.writeFileSync(file,out);changed.push(rel);}dom.window.close();
}
// Keep runtime confirmation and package reassurance in the same first-person voice.
for(const rel of ['site-interactions-sep13.js']) {
 const file=path.join(root,rel),src=fs.readFileSync(file,'utf8');
 fs.writeFileSync(file,src.replaceAll('We will confirm the final scope','I will confirm the final scope').replaceAll('Please call us on','Please call me on').replaceAll('we’ve received your enquiry','I’ve received your enquiry').replaceAll('we will be in touch','I will be in touch').replaceAll('We have received your enquiry.','I have received your enquiry.').replaceAll('We will email you to discuss','I will email you to discuss'));
}
const runtimeVersion=hash(fs.readFileSync(path.join(root,'site-interactions-sep13.js')));
for(const file of walk(root).filter(f=>f.endsWith('.html'))){const src=fs.readFileSync(file,'utf8');const out=src.replace(/\/site-interactions-sep13\.js\?v=[a-f0-9]+/g,'/site-interactions-sep13.js?v='+runtimeVersion);if(out!==src)fs.writeFileSync(file,out);}
const mapFile=path.join(root,'sitemap.xml');let map=fs.readFileSync(mapFile,'utf8');
for(const rel of changed){const route=rel==='index.html'?'/':'/'+rel.replace(/\/index\.html$/,'');const loc='<loc>https://www.setupandseen.co.uk'+route+'</loc>';map=map.replace(/<url>[\s\S]*?<\/url>/g,b=>b.includes(loc)?b.replace(/<lastmod>[^<]*<\/lastmod>/g,'').replace(loc,loc+'<lastmod>2026-10-18</lastmod>'):b);}
fs.writeFileSync(mapFile,map);
console.log('Creative review applied to '+changed.length+' pages. Prices and legal terms retained.');
