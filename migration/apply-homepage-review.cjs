// Preserve the September homepage audit when static maintenance is rerun.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{JSDOM}=require('jsdom');
const root=path.join(__dirname,'../netlify-site'),file=path.join(root,'index.html');
const dom=new JSDOM(fs.readFileSync(file,'utf8')),d=dom.window.document;
const q=s=>d.querySelector(s),text=(s,t)=>{if(q(s))q(s).textContent=t;};
const html=(s,t)=>{if(q(s))q(s).innerHTML=t;};
const fragment=t=>JSDOM.fragment(t);
d.body.classList.add('home-reviewed');
const description='Web design, branding and social media for small businesses in Worcestershire and across the UK. See recent projects, clear prices and the current website offer.';
for(const s of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])q(s).content=description;
d.querySelectorAll('link[rel="preload"][as="image"],link[rel="preload"][href="/assets/office-partner/website.webp"]').forEach(e=>e.remove());
const preload=d.createElement('link');preload.rel='preload';preload.setAttribute('as','image');preload.href='/assets/office-partner/website.webp';d.head.append(preload);
q('[data-playfair-preload]')?.setAttribute('as','font');
text('.hero-copy .eyebrow','Web design in Worcestershire · Working UK-wide');
html('.hero-copy h1','A website you’re<br><em>proud to share.</em>');
text('.hero-lead','We create websites, branding and social media for small businesses. Clear design that helps customers understand what you do and get in touch.');
html('.hero-actions','<a class="button primary home-offer-button" href="/website-offer">View the £199 website offer <span aria-hidden="true">↗</span></a><a class="text-link" href="#work">Explore recent work <span aria-hidden="true">↓</span></a>');
d.querySelectorAll('[data-finder-home-note],.home-offer-note').forEach(e=>e.remove());
q('.hero-actions').after(fragment('<p class="home-offer-note"></p>'));
html('.home-offer-note','One page, designed and built using your supplied content. Optional hosting &amp; care £29/month. Domain extra. <a href="/website-offer/terms">Book by 31 October 2026. Terms apply.</a>');
text('.hero-copy .reassurance','Personal support · Clear pricing · You approve before launch');
html('.hero-office-highlight','<p class="home-project-label">Featured client project</p><a class="hero-browser hero-browser-main" href="/our-work/the-office-partner" aria-label="View The Office Partner case study"><div class="browser-bar"><span></span><span></span><span></span><small>theofficepartner.co.uk</small></div><span class="office-screenshot-crop"><img src="/assets/office-partner/website.webp" alt="The Office Partner website designed by Set Up &amp; Seen" width="1348" height="926" fetchpriority="high"></span></a><div class="hero-project-stamp"><strong>The Office Partner</strong><span>Branding · Website · Social media · Branded email</span><a class="hero-case-study" href="/our-work/the-office-partner">View the project <span aria-hidden="true">↗</span></a><p class="home-project-scope">A wider launch project. The £199 offer covers a one-page website.</p></div>');
for(const s of ['.office-launch','.statement','.difference','.home-advice','.search-hub','.support-heading','.support-grid'])q(s)?.remove();
html('.work-heading h2','Real businesses.<br><em>Thoughtful design.</em>');
text('.work-heading > p','A selection of websites and brand launches, each shaped around the business and its customers. These projects show the wider portfolio, with scope and prices agreed individually.');
html('.work-page-link a','Explore the portfolio <span aria-hidden="true">→</span>');
// Keep three primary services concise; detailed service pages retain the full scope.
d.querySelectorAll('.service-card ul').forEach(e=>e.remove());
for(const e of [...d.querySelectorAll('.service-card')].slice(3))e.remove();
text('#services .eyebrow','More ways we can help');
html('#services h2','A consistent look.<br><em>A clearer message.</em>');
text('#services .section-heading > p','Start with a website, or bring your branding and social profiles together. We will recommend the help that fits your business.');
d.querySelectorAll('#services .home-resource-links').forEach(e=>e.remove());
q('#services').append(fragment('<div class="home-resource-links" id="specialist-website-design"><a href="/services/marketing-support">Marketing support →</a><a href="/services/website-audit">Website audits →</a><a href="/services/website-hosting-care">Hosting &amp; care →</a><a href="/advice">Advice &amp; guides →</a><a href="/services/garage-website-design">Garage websites →</a><a href="/services/pet-business-website-design">Pet-care websites →</a></div>'));
text('#pricing .section-heading .eyebrow','Clear options for your next step');
html('#pricing .section-heading h2','Start small.<br><em>Build from there.</em>');
text('#pricing .section-heading > p','Choose the £199 one-page offer or explore a larger project. Your written proposal confirms the scope, timescale and full cost before work starts.');
text('.october-package-note h3','Your one-page website. £199 one-off.');
q('.october-package-note p:not(.eyebrow)').firstChild.nodeValue='The ';
text('.october-package-scope','Need more pages, branding or copywriting? The standard packages below offer a wider scope.');
html('#alternative-website-options','<div class="launch-choice-heading"><p class="eyebrow">Need help choosing?</p><h3 id="alternative-website-options-title">Compare the options in one place.</h3><p>Managed Website Starter is £149/month for 12 months (£1,788 total), including hosting and care during the plan. Compare its full scope and terms, priority delivery and other packages below.</p><div class="home-resource-links"><a href="/packages#website-payment-options">Compare payment options →</a><a href="/packages#express-website-set-up">Explore priority delivery →</a><a href="/your-first-business-website#package-finder-section">Find a package →</a></div></div>');
text('.price-note','Standard package prices are starting points. Domain, hosting, subscriptions and any other costs are confirmed in your written quote. The £29/month hosting and care rate applies to the qualifying £199 offer; standard Website Care starts from £49/month. Set Up & Seen is not VAT registered, so VAT is not added.');
html('.approach h2','From first enquiry<br><em>to a confident launch.</em>');
text('.approach .section-heading > p','A clear plan, agreed costs and time to review your website before it goes live.');
const steps=[['Tell us what you need','Start by email, phone or video call. A rough idea of your business and what you need is enough.'],['Agree the plan','Receive a written scope, price and timescale before any work begins.'],['Review your website','See the design and share your feedback at the agreed review stages.'],['Launch with confidence','Once you approve, we launch your website and explain the handover and any ongoing support.']];
html('.approach .steps',steps.map(([h,p])=>'<article><h3>'+h+'</h3><p>'+p+'</p></article>').join(''));
html('#about', '<div class="studio-intro"><p class="eyebrow">About Set Up &amp; Seen</p><h2>Your business.<br><em>Our focus.</em></h2><p class="studio-location">Worcestershire based · Working UK-wide</p></div><div class="studio-summary"><p>We bring your website, branding and social media together so customers can see what you offer and feel confident getting in touch.</p><p>We keep the process straightforward, with clear pricing, agreed timescales and time to review the work.</p><a class="text-link" href="#contact">Talk to us about your business <span aria-hidden="true">↗</span></a></div><dl class="studio-principles"><div><dt>Built around you</dt><dd>Design shaped by your business and customers.</dd></div><div><dt>Clear from the start</dt><dd>An agreed scope, price and delivery plan.</dd></div><div><dt>Support after launch</dt><dd>Practical help and optional hosting and care.</dd></div></dl>');
text('.health-check-strip > p','We will review clarity, trust and the next step for visitors, then give you three practical observations. No obligation to buy.');
const faqs=[
 ['How much does a small-business website cost?','The October offer is £199 one-off for one scrolling page and an enquiry form, using your supplied logo, wording and photographs. Book by 31 October 2026. Website Starter is from £495 for up to five pages. Domain and hosting are separate. Your written quote confirms the scope and total cost.'],
 ['What are the ongoing costs?','Hosting and care for the qualifying £199 offer is optional at £29/month, with no 12-month contract. It includes hosting, SSL, backups, website and form checks, technical support and one small update each month. Domain costs are separate. Standard Website Care for other packages starts from £49/month.'],
 ['What do I need to supply for the £199 offer?','Your logo, final wording and suitable photographs, plus the business details and access needed for your website. Branding, copywriting, extra pages and other features are outside the offer and are quoted separately.'],
 ['Can I choose a larger website or monthly payments?','Yes. Standard packages cover websites with more pages and options for branding and copywriting. Managed Website Starter is £149/month for 12 months (£1,788 total), including hosting and care during the plan. Full scope and terms are on the packages page.'],
 ['Do you work outside Worcestershire?','Yes. We are based in Worcestershire and work remotely with small businesses across the UK.'],
 ['What happens after I enquire?','We discuss what you need by email or a call, then send a written proposal with the scope, price, payment schedule and delivery stages. No payment is taken when you enquire. You review and approve your website before it goes live.']
];
text('.faq-intro > p:not(.eyebrow)','The essentials about price, scope and getting started.');
text('.faq-intro > a','Ask us directly →');
html('.faq-groups','<section class="faq-group"><h3>Pricing &amp; getting started</h3><div class="faq-list">'+faqs.map(([question,answer])=>'<details><summary>'+question+'<span aria-hidden="true">+</span></summary><p>'+answer+'</p></details>').join('')+'</div></section>');
text('.contact-intro > p:not(.eyebrow)','Tell us about your business and what you need. You can use the form, email, phone or WhatsApp, whichever suits you.');
text('#enquiry-next-steps li:first-child strong','We read your enquiry');
text('#enquiry-next-steps li:nth-child(2) strong','We discuss what you need, by email or a call');
for(const el of d.querySelectorAll('.direct-contact small'))el.textContent=el.textContent.replace(' US','');
const select=q('select[name="service"]'),offer='October website offer: £199 build and optional £29/month hosting and care';
if(![...select.options].some(e=>e.value===offer)){
 const group=d.createElement('optgroup');group.label='Current website offer';const option=d.createElement('option');option.value=offer;option.textContent='£199 one-page website offer';group.append(option);select.insertBefore(group,select.querySelector('optgroup'));
}
select.parentElement.firstChild.nodeValue='What would you like help with?';
q('input[name="phone"]').placeholder='For a call or WhatsApp';
q('input[name="business"]').parentElement.firstChild.nodeValue='Business name (optional)';
q('textarea[name="message"]').parentElement.firstChild.nodeValue='Tell us a little more';
for(const [name,value] of [['name','name'],['business','organization'],['email','email'],['phone','tel']])q('input[name="'+name+'"]').autocomplete=value;
// Convert only the studio's own prose, preserving client feedback and approved artwork.
const walker=d.createTreeWalker(d.body,dom.window.NodeFilter.SHOW_TEXT);
while(walker.nextNode()){
 const n=walker.currentNode;if(n.parentElement.closest('script,style,.testimonial-strip,.about-mark,.wordmark'))continue;
 n.nodeValue=n.nodeValue.replace(/\bI create\b/g,'We create').replace(/\bI turn\b/g,'We turn').replace(/\bI bring\b/g,'We bring');
}
const main=q('main');
for(const s of ['.skip-link','.announcement','.site-header','.october-offer-banner']){const e=q(s);if(e) d.body.insertBefore(e,main);}
const footer=q('footer');if(footer)main.after(footer);
for(const s of ['.hero','.testimonial-strip','#pricing','#work','#services','#approach','#about','.health-check-strip','#faqs','#contact']){const e=q(s);if(e)main.append(e);}
for(const script of d.querySelectorAll('script[type="application/ld+json"]')){const data=JSON.parse(script.textContent);if(data['@type']==='FAQPage'){data.mainEntity=faqs.map(([name,t])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text:t}}));script.textContent=JSON.stringify(data);}}
const css=fs.readFileSync(path.join(__dirname,'homepage-review.css'),'utf8');
const hash=crypto.createHash('sha256').update(css).digest('hex').slice(0,12);const cssName='homepage-review-'+hash+'.css';
for(const old of fs.readdirSync(path.join(root,'assets')).filter(f=>/^homepage-review-.*\.css$/.test(f)))if(old!==cssName)fs.unlinkSync(path.join(root,'assets',old));
fs.writeFileSync(path.join(root,'assets',cssName),css);
q('link[data-homepage-review]')?.remove();const link=d.createElement('link');link.rel='stylesheet';link.href='/assets/'+cssName;link.dataset.homepageReview='';d.head.append(link);
fs.writeFileSync(file,dom.serialize());dom.window.close();console.log('Applied homepage review and '+cssName);
