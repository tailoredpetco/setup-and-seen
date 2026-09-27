const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.resolve('netlify-site');
const runtime = fs.readFileSync(path.join(root,'site-interactions-sep13.js'),'utf8');
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const pages = walk(root).filter(p=>p.endsWith('.html')&&!p.endsWith('/404.html'));
const byRoute = new Map();
const titles = new Set();
for (const file of pages) {
 const route='/' + path.relative(root,file).replaceAll(path.sep,'/').replace(/(^|\/)index\.html$/,'');
 const text=fs.readFileSync(file,'utf8');
 const dom=new JSDOM(text,{url:'https://www.setupandseen.co.uk'+route});
 const d=dom.window.document;
 assert.equal(d.querySelectorAll('h1').length,1,route);
 assert.equal(d.querySelectorAll('link[rel="canonical"]').length,1,route);
 const indexable=!d.querySelector('meta[name="robots"]')?.content.includes('noindex');
 if(indexable) assert.equal(d.querySelector('link[rel="canonical"]').href,'https://www.setupandseen.co.uk'+route,route);
 assert.ok(d.title&&(!indexable||!titles.has(d.title)),'Unique title: '+route);if(indexable)titles.add(d.title);
 assert.ok(!text.includes('__VINEXT_'),'Old rendering payload removed: '+route);
 assert.ok(!d.querySelector('script#_R_'),'No hydration entry: '+route);
 assert.equal(d.querySelectorAll('script[src="/site-interactions-sep13.js"]').length,1,route);
 assert.equal(d.querySelectorAll('link[href^="/assets/site-sep13.css?v="]').length,1,route);
 for(const script of d.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(script.textContent);
 for(const asset of d.querySelectorAll('script[src],link[rel="stylesheet"],link[as="font"],img[src]')) {
  const url=asset.getAttribute('src')||asset.getAttribute('href');
  if(url.startsWith('/')) assert.ok(fs.existsSync(path.join(root,url.split('?')[0])),'Local asset '+url);
 }
 for(const mark of d.querySelectorAll('.wordmark strong')) assert.match(mark.style.fontFamily,/Fraunces/,'Existing wordmark preserved');
 byRoute.set(route,{dom,d});
}
for(const [route,{d}] of byRoute) {
 for(const a of d.querySelectorAll('a[href]')) {
  const url=new URL(a.href);
  if(url.origin!=='https://www.setupandseen.co.uk') continue;
  const target=byRoute.get(url.pathname);
  assert.ok(target,'Internal page '+a.href+' from '+route);
  if(url.hash) assert.ok(target.d.getElementById(decodeURIComponent(url.hash.slice(1))),'Section '+a.href+' from '+route);
 }
}
const home=byRoute.get('/').d;
assert.ok(home.querySelector('#alternative-website-options').textContent.includes('£1,788'));
assert.equal(home.querySelectorAll('[data-package-finder-nav]').length,1);
assert.equal(home.querySelectorAll('#enquiry-next-steps').length,1);
assert.ok(home.body.textContent.includes('not VAT registered'));
assert.ok(!home.body.textContent.includes('any applicable VAT'));
assert.ok(home.querySelector('option[value="Managed Website Starter"]'));
for(const [route,name,fields] of [
 ['/', 'enquiry',['website','name','business','email','phone','service','message','privacy-consent']]
]) {
 const form=byRoute.get(route).d.querySelector('form[name="'+name+'"]');
 assert.equal(form.getAttribute('data-netlify'),'true');
 assert.equal(form.getAttribute('data-netlify-honeypot'),'website');
 assert.equal(form.querySelector('[name="form-name"]').value,name);
 assert.deepEqual([...form.querySelectorAll('[name]')].map(e=>e.name).filter(n=>n!=='form-name'),fields);
}

function interactive(route,search='') {
 const html=byRoute.get(route).dom.serialize();
 const dom=new JSDOM(html,{url:'https://www.setupandseen.co.uk'+route+search,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 const NativeObserver=w.MutationObserver;
 w.testObservers=[];
 w.MutationObserver=class extends NativeObserver { constructor(...args) {super(...args);w.testObservers.push(this);} };
 w.matchMedia=()=>({matches:true});w.scrollTo=()=>{};
 w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.fetch=async()=>{throw new Error('Unexpected network request');};
 w.eval(runtime);
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 return dom;
}

(async()=>{
 const dom=interactive('/','?service=Managed%20Website%20Starter&finder=managed');
 const w=dom.window,d=w.document;
 assert.equal(d.querySelector('select[name="service"]').value,'Managed Website Starter');
 assert.ok(d.querySelector('.selected-package').textContent.includes('£1,788'));
 const menu=d.querySelector('.menu-button');
 menu.click();assert.equal(menu.getAttribute('aria-expanded'),'true');
 assert.ok(d.documentElement.classList.contains('set-up-and-seen-menu-open'));
 d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 assert.equal(menu.getAttribute('aria-expanded'),'false');
 menu.click();d.querySelector('nav a[href="#services"]').click();
 assert.ok(!d.documentElement.classList.contains('set-up-and-seen-menu-open'));
 d.querySelector('[data-enquiry-service="Business Launch"]').click();
 assert.equal(d.querySelector('select[name="service"]').value,'Business Launch');
 assert.ok(d.querySelector('.selected-package').textContent.includes('£1,595'));
 assert.equal(d.querySelectorAll('.selected-package').length,1);
 d.querySelector('.cookie-reject').click();
 assert.equal(w.localStorage.getItem('setup-and-seen-cookie-consent'),'rejected');
 assert.ok(!d.querySelector('.cookie-banner'));
 d.querySelector('.cookie-settings').click();d.querySelector('.cookie-accept').click();
 assert.equal(w.localStorage.getItem('setup-and-seen-cookie-consent'),'accepted');
 d.querySelector('.message-us-trigger').click();assert.equal(d.querySelector('.message-us-panel').hidden,false);
 assert.equal(d.activeElement.getAttribute('href'),'https://wa.me/447999071045');
 d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
 assert.equal(d.querySelector('.message-us-panel').hidden,true);
 assert.equal(d.activeElement,d.querySelector('.message-us-trigger'));
 const form=d.querySelector('form[name="enquiry"]');
 assert.equal(form.checkValidity(),false);
 form.elements.name.value='Website QA';form.elements.email.value='qa@example.invalid';
 form.elements.message.value='Local test only';form.elements['privacy-consent'].checked=true;
 assert.equal(form.checkValidity(),true);
 let sent=[],events=[];
 w.fetch=async(url,options)=>{sent.push({url,options});return {ok:true};};
 w.gtag=(...args)=>events.push(args);
 form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(sent.length,1);assert.equal(sent[0].url,'/');
 const body=new URLSearchParams(sent[0].options.body);
 assert.equal(body.get('form-name'),'enquiry');assert.equal(body.get('service'),'Business Launch');
 assert.ok(body.get('message').includes('Package finder suggestion: managed'));
 assert.ok(form.querySelector('.enquiry-confirmation'));
 assert.equal(events.filter(e=>e[1]==='generate_lead').length,1);
 form.querySelector('[data-send-another-enquiry]').click();
 assert.ok(form.querySelector('input[name="name"]'));assert.ok(!form.querySelector('.selected-package'));
 form.elements.name.value='Website QA';form.elements.email.value='qa@example.invalid';
 form.elements.service.value='Website Starter';form.elements.message.value='Local failure test';form.elements['privacy-consent'].checked=true;
 w.fetch=async()=>({ok:false});
 form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 await new Promise(resolve=>setImmediate(resolve));
 assert.ok(form.querySelector('[role="alert"]'));assert.ok(!form.querySelector('.enquiry-confirmation'));
 assert.equal(form.querySelector('button[type="submit"]').disabled,false);
 assert.equal(events.filter(e=>e[1]==='generate_lead').length,1);
 w.testObservers.forEach(o=>o.disconnect());dom.window.close();

 // Exercise the actual offer form, preserving the Netlify field contract and
 // consent boundary. Only allowlisted, non-personal campaign labels are copied.
 for (const scenario of [
  {consent:'accepted',ok:true,tag:'professional_feed',lead:true},
  {consent:'rejected',ok:true,tag:'professional_story',lead:false},
  {consent:'accepted',ok:false,tag:'professional_feed',lead:false},
  {consent:'accepted',ok:true,tag:'someone@example.com',lead:true}
 ]) {
  const offer=interactive('/website-offer','?utm_source=facebook&utm_medium=paid_social&utm_campaign=october_website_petcare&utm_content='+encodeURIComponent(scenario.tag)+'&email=private@example.com&fbclid=private-click-id');
  const ow=offer.window,od=ow.document,of=od.querySelector('form[name="enquiry"]');
  assert.ok(od.querySelector('.cookie-settings'));
  od.querySelector(scenario.consent==='accepted'?'.cookie-accept':'.cookie-reject').click();
  assert.equal(ow.localStorage.getItem('setup-and-seen-cookie-consent'),scenario.consent);
  assert.ok(!od.querySelector('.cookie-banner'));
  const calls=[],analytics=[];
  ow.fetch=async(url,options)=>{calls.push({url,options});return {ok:scenario.ok};};
  ow.gtag=(...args)=>analytics.push(args);
  of.elements.name.value='Campaign QA';of.elements.email.value='qa@example.invalid';
  of.elements.message.value='I run a pet-care business.';of.elements['privacy-consent'].checked=true;
  assert.ok(of.checkValidity());
  const portfolioLink=new URL(od.querySelector('.campaign-work-card').href);
  assert.equal(portfolioLink.searchParams.get('utm_campaign'),'october_website_petcare');
  assert.ok(!portfolioLink.searchParams.has('email'));assert.ok(!portfolioLink.searchParams.has('fbclid'));
  of.dispatchEvent(new ow.Event('submit',{bubbles:true,cancelable:true}));
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls.length,1);assert.equal(calls[0].url,'/');
  const payload=new URLSearchParams(calls[0].options.body);
  assert.equal(payload.get('form-name'),'enquiry');
  assert.match(payload.get('service'),/October website offer: £199/);
  assert.match(payload.get('message'),/^I run a pet-care business\.\n\nCampaign reference: facebook \/ paid_social \/ october_website_petcare/);
  assert.ok(!payload.get('message').includes('@'));assert.ok(!payload.get('message').includes('private-click-id'));
  const leads=analytics.filter(e=>e[1]==='generate_lead');
  assert.equal(leads.length,scenario.lead?1:0);
  if(scenario.lead){assert.equal(leads[0][2].campaign_reference,'october_website_petcare');assert.equal(leads[0][2].ad_creative,scenario.tag.includes('@')?'none':scenario.tag);}
  assert.equal(!!of.querySelector('.enquiry-confirmation'),scenario.ok);
  if(!scenario.ok){assert.ok(of.querySelector('[role="alert"]'));assert.equal(of.querySelector('button[type="submit"]').disabled,false);}
  ow.testObservers.forEach(o=>o.disconnect());offer.window.close();
 }

 // The retired entry page must not accept new website entries.
 const retired=byRoute.get('/competition').d;
 assert.equal(retired.querySelector('form'),null);
 assert.match(retired.querySelector('meta[http-equiv="refresh"]').content,/\/website-offer/);
 assert.equal(home.querySelector('.competition-home-banner'),null);
 assert.equal(home.querySelector('a[href="/competition"]'),null);
 assert.match(fs.readFileSync(path.join(root,'_redirects'),'utf8'),/^\/competition \/website-offer 302!$/m);
 for(const {dom} of byRoute.values()) dom.window.close();
 console.log(`${pages.length} pages: static content, links, metadata, assets and form contracts passed. Native menus, cookie choices, contact panel, package preselection, enquiry success/failure passed with local network mocks.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
