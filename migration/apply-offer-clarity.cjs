/* Apply the 17 September offer clarification to the saved public pages.
 * Prices, package limits, branding, payment links and form contracts are preserved.
 * Run after the original static migration so future rebuilds retain this update. */
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const {createHash} = require('node:crypto');
const root = path.resolve(process.argv[2] || 'netlify-site');
const css = fs.readFileSync(path.join(__dirname, 'offer-clarity.css'), 'utf8');
const version = createHash('sha256').update(css).digest('hex').slice(0,12);
fs.writeFileSync(path.join(root,'assets/offer-clarity.css'),css);
const monthlyExplanation = 'The monthly plan costs more overall than paying for the website build upfront. We create the website at the start of the agreement and receive payment over 12 months. The price reflects that payment arrangement and includes hosting, technical care and the stated monthly amendment allowance.';
const amendment = 'One small content update of up to 30 minutes each month, such as changing wording, replacing a photo or updating a price. Unused time does not carry forward. New pages, redesigns and larger changes are quoted separately.';
const afterYear = 'After all 12 payments, you can continue with Website Care from £49 a month, subject to the service agreed, or arrange a suitable transfer. Domain renewal is separate.';
const enquiry = service => '/?service=' + encodeURIComponent(service) + '#contact';
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function fragment(d, html) {const t=d.createElement('template');t.innerHTML=html;return t.content.firstElementChild;}
function setText(d, selector, text) {const el=d.querySelector(selector);if(el)el.textContent=text;}
function replaceText(d, old, replacement) {const walker=d.createTreeWalker(d.body,4);while(walker.nextNode()){const n=walker.currentNode;if(!n.parentElement.closest('script,style'))n.nodeValue=n.nodeValue.split(old).join(replacement);}}
function faq(d, list, question, answer) {
  if(!list)return;
  let detail=[...list.children].find(x=>x.querySelector('summary')?.textContent.replace('+','').trim()===question);
  if(!detail){detail=fragment(d,'<details><summary></summary><p></p></details>');list.append(detail);}
  detail.querySelector('summary').innerHTML=escape(question)+'<span aria-hidden="true">+</span>';
  detail.querySelector('p').textContent=answer;
}
function costComparison(d, id, extraClass='') {
 return fragment(d,`<section class="offer-comparison ${extraClass}" id="${id}" aria-labelledby="${id}-title">
 <p class="eyebrow">Website Starter: choosing how to pay</p><h2 id="${id}-title">Compare the build and the first year.</h2>
 <p>Both routes give you a website of up to five pages. Choose the payment arrangement and support that suit your business.</p>
 <div class="offer-payment-grid">
 <article><p class="eyebrow">One-off build</p><h3>Website Starter</h3><p class="offer-price">From £495 <span>for the build</span></p>
 <dl><div><dt>Your wording</dt><dd>You supply the content; guidance is included.</dd></div><div><dt>Hosting and amendments</dt><dd>Separate. Optional Website Care starts at £49 a month and includes hosting, technical care and one small content update each month.</dd></div><div><dt>First-year example</dt><dd>£495 build + 12 × £49 care = <strong>£1,083, plus domain costs</strong>. This assumes the starting prices and 12 full months of care; your written quote confirms the actual cost.</dd></div></dl>
 <a class="text-link" href="${enquiry('Website Starter')}">Ask about Website Starter <span aria-hidden="true">↗</span></a></article>
 <article><p class="eyebrow">Build, hosting and amendments paid monthly</p><h3>Managed Website Starter</h3><p class="offer-price">£149 <span>a month for 12 months</span></p>
 <p class="offer-total">£1,788 total commitment. No VAT added.</p>
 <dl><div><dt>Your wording</dt><dd>You supply the content; we refine it for the website.</dd></div><div><dt>Hosting and amendments</dt><dd>Hosting, technical care and one small content update of up to 30 minutes a month are included. One standard .co.uk domain is included for the first year.</dd></div><div><dt>Payment and year two</dt><dd>The first payment secures the project, followed by 11 monthly payments. ${afterYear}</dd></div></dl>
 <a class="text-link" href="${enquiry('Managed Website Starter')}">Ask about the monthly plan <span aria-hidden="true">↗</span></a></article></div>
 <div class="offer-explainer"><h3>Why does paying monthly cost more?</h3><p>${monthlyExplanation}</p><p>Full copywriting, branding, online shops, complex booking systems, business email hosting and paid software are separate. Your written proposal confirms the full scope and costs before you commit.</p></div>
 </section>`);
}
function supportingOptions(d, home) {
 return fragment(d,`<section id="alternative-website-options" class="launch-choice-section offer-options${home?'':' launch-choice-page section-pad'}" aria-labelledby="alternative-website-options-title">
 <div class="launch-choice-heading"><p class="eyebrow">Payment and delivery options</p><h2 id="alternative-website-options-title">Need monthly payments or a quicker launch?</h2><p>Start with the scope you need above, then consider the arrangement that suits you.</p></div>
 <details class="offer-option"><summary><span>Prefer monthly payments?</span><span>£149 a month · 12 months</span></summary><div class="offer-option-content"><h3>Managed Website Starter</h3><p>Up to five pages, supplied wording refined, a standard .co.uk domain for the first year, hosting and technical care.</p><p><strong>£1,788 total.</strong> Includes one small content update of up to 30 minutes each month. The monthly total also reflects paying for the build over time.</p><p>${afterYear}</p><a class="text-link" href="/services/managed-website-starter">See the monthly plan and full terms <span aria-hidden="true">→</span></a><a class="text-link" href="/packages#website-payment-options">Compare the first-year costs <span aria-hidden="true">→</span></a></div></details>
 <details class="offer-option"><summary><span>Need your website sooner?</span><span>One-page or priority delivery</span></summary><div class="offer-option-content offer-delivery-grid"><article><h3>One-Day Website</h3><p><strong>£495 one-off.</strong> One scrolling page with up to six sections, built within one booked working day once the required content, images, payment and access are ready.</p><p>Choose this for a focused page on a booked day. Standard Website Starter is from £495 for up to five pages on a usual 2–4 week schedule.</p><a class="text-link" href="/services/one-day-website">One-Day Website details <span aria-hidden="true">→</span></a></article><article><h3>Express Website Set Up</h3><p><strong>From £999 one-off.</strong> Up to five pages on a priority schedule, within five working days once payment, the questionnaire, final content, images and access are ready.</p><p>Availability must be confirmed. Domain, hosting, branding and full copywriting are separate for both faster options.</p><a class="text-link" href="/packages#express-website-set-up">Express delivery details <span aria-hidden="true">→</span></a><a class="text-link" href="${home?'#contact':enquiry('Express Website Set Up')}"${home?' data-enquiry-service="Express Website Set Up"':''}>Ask about your deadline <span aria-hidden="true">↗</span></a></article></div></details></section>`);
}
const edited=[];
function edit(route, callback) {
 const filename=path.join(root,route==='/'?'index.html':route+'/index.html');
 const original=fs.readFileSync(filename,'utf8');
 const dom=new JSDOM(original,{url:'https://www.setupandseen.co.uk'+(route==='/'?'/':'/'+route)});
 const d=dom.window.document;callback(d);
 let link=d.querySelector('link[data-offer-clarity]');
 if(!link){link=d.createElement('link');link.rel='stylesheet';link.dataset.offerClarity='';d.head.append(link);}
 link.href='/assets/offer-clarity.css?v='+version;
 // Keep visible FAQ answers and search metadata aligned.
 for(const script of d.querySelectorAll('script[type="application/ld+json"]')){
  const data=JSON.parse(script.textContent);
  if(data['@type']==='FAQPage')data.mainEntity=[...d.querySelectorAll('.faq-list details')].map(el=>({'@type':'Question',name:el.querySelector('summary').textContent.replace(/\+$/,'').trim(),acceptedAnswer:{'@type':'Answer',text:el.querySelector('p').textContent}}));
  if(data['@type']==='Article')data.dateModified='2026-09-17';
  script.textContent=JSON.stringify(data);
 }
 const updated=dom.serialize();if(updated!==original){fs.writeFileSync(filename,updated);edited.push(route);}dom.window.close();
}
const core=[
 {id:'website-starter',name:'Website Starter',label:'Website only',description:'You have branding and wording ready. We turn them into a clear, mobile-friendly website with an easy way to enquire.',supply:'Your logo, service information, website wording and suitable images. We guide you on what is needed.',words:'Content guidance is included. Full copywriting is quoted separately.',care:'Launch checks and handover are included. Domain and hosting are separate; optional Website Care starts at £49 a month.'},
 {id:'business-launch',name:'Business Launch',label:'Brand and website',description:'You need a logo, a website and matching social profiles. We bring the essentials together and refine the wording you supply.',supply:'Your business details, services, draft wording, suitable images and feedback on the brand direction.',words:'We refine your supplied wording. Writing the full website from a blank page is a separately quoted requirement.',care:'Launch planning and handover are included. Domain, hosting and ongoing social management are separate; optional Website Care starts at £49 a month.'},
 {id:'set-up-and-seen',name:'Set Up & Seen Complete',label:'Complete launch, including copywriting',description:'You want help with the brand, the words and the launch. We create the website, social profiles and launch content around your business.',supply:'Your business information, service details, suitable photographs or image requirements, and feedback at the agreed review stages.',words:'Full website copywriting and practical brand guidelines are included.',care:'Four weeks of questions and agreed small fixes are included. Domain, hosting and ongoing monthly management are separate; optional Website Care starts at £49 a month.'}
];
edit('/',d=>{
 setText(d,'.hero-copy [data-finder-home-note]','Choose website only, brand and website, or a complete launch. Our package finder gives a recommendation without asking for your email.');
 setText(d,'#pricing .section-heading h2','Start with the help you need.');
 setText(d,'#pricing .section-heading > p','Three clear starting points. Your written proposal confirms the scope, delivery schedule and full cost before work begins.');
 for(const card of d.querySelectorAll('.pricing-grid .price-card')){
  const config=core.find(c=>c.name===card.querySelector('h3').textContent.trim());if(!config)continue;
  setText(card,':scope > small',config.label);setText(card,':scope > p',config.description);
  card.querySelector('.popular')?.remove();
  if(!card.querySelector('.offer-card-note'))card.querySelector('ul').after(fragment(d,'<p class="offer-card-note">Domain and hosting are separate. Optional hosting and care from £49 a month.</p>'));
 }
 d.querySelector('.express-upgrade')?.remove();
 d.querySelector('#alternative-website-options').replaceWith(supportingOptions(d,true));
 setText(d,'.contact-intro > p:not(.eyebrow)','Tell us about your business and what you need help with. You can start by email, phone or WhatsApp, whichever suits you.');
 setText(d,'#enquiry-next-steps li:nth-child(2) strong','We discuss what you need, by email or a call');
 setText(d,'#enquiry-next-steps li:nth-child(3) strong','You receive a written scope, price and next steps');
 const message=d.querySelector('textarea[name="message"]');message.placeholder='What do you do, what would you like help with, and would you prefer a reply by email, phone or WhatsApp?';
 const phone=d.querySelector('input[name="phone"]');phone.parentElement.firstChild.nodeValue='Phone number (optional)';
 phone.placeholder='If you prefer a call or WhatsApp';
 setText(d,'.approach .steps article:first-child p','We discuss your business, your customers and what you need, by email, phone or video call. You do not need a finished brief to get started.');
 const pricingFaq=[...d.querySelectorAll('.faq-group')].find(s=>s.querySelector('h3')?.textContent==='Pricing & getting started');
 faq(d,pricingFaq?.querySelector('.faq-list'),'Why does the monthly plan cost more overall?',monthlyExplanation);
 faq(d,pricingFaq?.querySelector('.faq-list'),'What happens after I enquire?','We discuss what you need by email or a call, then send a written proposal with the scope, price, payment schedule and delivery stages. No payment is taken when you enquire.');
});
edit('packages',d=>{
 setText(d,'.packages-page-hero > p:not(.eyebrow)','Start with the help you need: a website using your existing brand, a brand and website launch, or a complete launch with copywriting. Monthly payments and quicker delivery are explained below.');
 const nav=d.querySelector('.package-jump-nav');nav.innerHTML=core.map(c=>`<a href="#${c.id}">${escape(c.label)}</a>`).join('');
 setText(d,'#package-details-title','Three starting points for your business.');
 for(const c of core){
  const card=d.getElementById(c.id);setText(card,'.package-detail-intro > small',c.label);setText(card,'.package-detail-intro > p',c.description);
  card.querySelector('.package-detail-popular')?.remove();card.querySelector('.package-detail-number')?.remove();
  card.querySelector('.offer-responsibilities')?.remove();
  const scope=card.querySelector('.package-detail-scope');scope.querySelector('.package-process-note').before(fragment(d,`<dl class="offer-responsibilities"><div><dt>What you provide</dt><dd>${c.supply}</dd></div><div><dt>Who writes the wording?</dt><dd>${c.words}</dd></div><div><dt>After launch</dt><dd>${c.care}</dd></div></dl>`));
 }
 // Keep priority delivery available without presenting it as a fourth core scope.
 const express=d.getElementById('express-website-set-up');express.querySelector('.package-detail-number')?.remove();d.querySelector('.package-details').append(express);
 const table=d.querySelector('.comparison-table');
 const index=[...table.querySelectorAll('thead th')].findIndex(th=>th.querySelector('a[href="#express-website-set-up"]'));
 if(index>=0)for(const row of table.rows)row.cells[index]?.remove();
 for(const card of d.querySelectorAll('.comparison-cards > article'))if(card.querySelector('h3')?.textContent==='Express Website Set Up')card.remove();
 for(const cell of table.querySelectorAll('thead small'))if(!cell.textContent.startsWith('From'))cell.textContent='From '+cell.textContent;
 const alt=d.querySelector('#alternative-website-options');alt.replaceWith(supportingOptions(d,false));
 const compare=d.querySelector('#compare');compare.after(d.querySelector('#alternative-website-options'));
 d.querySelector('#website-payment-options')?.remove();
 d.querySelector('#alternative-website-options').after(costComparison(d,'website-payment-options','section-pad'));
 d.querySelector('#before-your-project')?.remove();
 d.querySelector('.package-help').before(fragment(d,`<section class="offer-project section-pad" id="before-your-project"><p class="eyebrow">Agreed before work starts</p><h2>Know what happens next.</h2><div class="offer-project-grid"><article><h3>Feedback and revisions</h3><p>Your written proposal sets out the review stages, included rounds of changes and any limits. You can review the work before launch. Additional scope is quoted before it is carried out.</p></article><article><h3>Timing and your content</h3><p>We agree what you need to supply and when. Build times depend on receiving the required content, images, access and feedback. Priority delivery is confirmed before booking.</p></article><article><h3>Ownership and editing</h3><p>Your domain remains yours. The proposal names the platform, explains what you can edit, and confirms ownership, handover and transfer arrangements after payment.</p></article></div><p>Start by email, phone or WhatsApp. We discuss the requirements and send a written scope and price before you commit.</p></section>`));
});
edit('services/managed-website-starter',d=>{
 setText(d,'.service-page-lead','A website of up to five pages, built at the start and paid for over 12 months. Hosting, technical care and one small content amendment of up to 30 minutes each month are included.');
 const firstSection=d.querySelector('.service-page-section');
 d.querySelector('#monthly-payment-explained')?.remove();firstSection.after(fragment(d,`<section id="monthly-payment-explained" class="offer-explainer section-pad"><p class="eyebrow">Understanding the monthly price</p><h2>Hosting, amendments and a longer payment schedule.</h2><p>${monthlyExplanation}</p><p><strong>12 payments of £149. Total £1,788. No VAT added.</strong> The first payment secures the project, followed by 11 monthly payments.</p><p>${amendment}</p><a class="text-link" href="/packages#website-payment-options">Compare with a one-off build and optional care <span aria-hidden="true">→</span></a></section>`));
 const list=d.querySelector('.service-faq .faq-list');
 faq(d,list,'Why does the monthly plan cost more overall?',monthlyExplanation);
 faq(d,list,'How much support is included each month?',amendment);
 faq(d,list,'What do I need to supply?','Your business details, existing logo or brand assets, service information, draft wording and suitable images. We refine the wording you supply. Full copywriting and brand creation are quoted separately.');
 faq(d,list,'When will the website be built?','We build the website at the start of the agreement, rather than after the final payment. Your proposal confirms the delivery schedule, required content and feedback stages before work begins.');
 faq(d,list,'How are design changes agreed?','Your proposal confirms the review stages and included rounds of changes during the build. After launch, the monthly content-update allowance applies. Larger changes are quoted separately before work begins.');
});
edit('your-first-business-website',d=>{
 setText(d,'.payment-explainer',monthlyExplanation+' Branding, full copywriting, online shops and complex booking systems need a separate scope. No payment is taken when you enquire.');
 const aside=d.querySelector('.first-aside');
 if(!aside.querySelector('[data-monthly-premium]'))aside.append(fragment(d,'<p data-monthly-premium="true">The monthly plan has a higher total price because the build is paid for over time. Hosting and the stated amendment allowance are included.</p>'));
 const list=d.querySelector('.first-faq .faq-list')||d.querySelector('.faq-list');
 faq(d,list,'Why does the monthly plan cost more overall?',monthlyExplanation);
 const support=d.querySelector('label[for="finder-support"]'),pages=d.querySelector('label[for="finder-pages"]');
 pages.before(support);
 support.firstChild.nodeValue='1. What help do you need?';pages.firstChild.nodeValue='2. How many pages might you need?';
});
edit('advice/small-business-website-cost-uk',d=>{
 const original='The two offers have different inclusions. The managed option spreads the cost and includes support throughout the agreement; it should not be described as the £495 build divided into monthly instalments.';
 const previous=monthlyExplanation+' The one-off route can also include hosting and amendments when you choose Website Care. The comparison should therefore include both the payment arrangement and the exact scope.';
 const updated=monthlyExplanation+' If you choose the one-off build, you can add Website Care for hosting and monthly amendments. Compare the full first-year cost and support you want before choosing.';
 replaceText(d,original,updated);replaceText(d,previous,updated);
});
// Explain existing delivered work without adding results, testimonials or claims
// about the projects being current paying customers.
const projectDetails={
 'clent-auto-repairs':{title:'How the website helps a visitor decide',items:[['Understand the services','The service information gives drivers a place to check what the business offers before getting in touch.'],['Recognise the business','The identity and website were planned together so the business has a consistent presentation.'],['Make an enquiry','The contact route was considered alongside the service wording, giving interested visitors a next step.']],package:'Business Launch',anchor:'business-launch',note:'Business Launch is a useful starting point if you need a brand, website and supporting profiles. Full copywriting or ongoing marketing can change the scope; we quote those requirements separately.'},
 'clent-hills-campers-and-vans':{title:'A separate identity with a clear purpose',items:[['Understand the business','The website introduces the camper and van business with its own service information.'],['Keep the brands distinct','The identity relates to the sister automotive business while giving this business its own presentation.'],['Find the next step','Service messaging and contact options were planned together to support enquiries.']],package:'Business Launch',anchor:'business-launch',note:'Business Launch is a useful starting point for a brand and website project. Vehicle listings, stock filters, integrations and ongoing listing changes need a separate scope.'},
 'the-tailored-pet-co':{title:'Making a new pet-care business understandable',items:[['Introduce the services','The website copy brings the business information together so pet owners can understand the offer.'],['Keep the launch consistent','Naming, identity, website and supporting profiles were developed as one project.'],['Support the next step','The enquiry journey was considered as part of the website, giving interested owners a way to get in touch.']],package:'Set Up & Seen Complete',anchor:'set-up-and-seen',note:'Complete is a useful starting point when you need brand identity, full website copy and launch assets. Naming, photography or a booking system must be discussed and quoted where needed.'}
};
for(const [slug,p] of Object.entries(projectDetails))edit('our-work/'+slug,d=>{
 d.querySelector('#practical-project-details')?.remove();
 const approach=[...d.querySelectorAll('.search-section')].find(s=>s.querySelector('.eyebrow')?.textContent==='The approach');
 approach.after(fragment(d,`<section class="search-section" id="practical-project-details"><p class="eyebrow">The practical decisions</p><h2>${p.title}</h2><dl class="offer-case-decisions">${p.items.map(([term,body])=>`<div><dt>${term}</dt><dd>${body}</dd></div>`).join('')}</dl><p>Explore the finished website below to see how the information, identity and contact options work together.</p></section>`));
 const related=[...d.querySelectorAll('.search-section')].find(s=>s.querySelector('.eyebrow')?.textContent==='Related services');
 related.querySelector('[data-project-package]')?.remove();
 related.querySelector('h2').after(fragment(d,`<div data-project-package="true"><p>${p.note}</p><a class="text-link" href="/packages#${p.anchor}">Explore ${escape(p.package)} <span aria-hidden="true">→</span></a></div>`));
 replaceText(d,'Tell me what you are launching or improving. I will recommend the services you need and confirm the scope in writing.','Tell us what you are launching or improving. We will recommend the services you need and confirm the scope in writing.');
});
console.log('Offer clarity updated: '+edited.join(', '));
