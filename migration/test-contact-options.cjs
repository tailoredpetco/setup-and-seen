const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
const home = new JSDOM(fs.readFileSync('netlify-site/index.html','utf8'));
const links = [...home.window.document.querySelectorAll('.contact-choice')];
assert.equal(links.length,4);
assert.ok(links[2].href.startsWith('https://docs.google.com/forms/d/e/'));
assert.equal(links[3].href,'mailto:info@setupandseen.co.uk');
home.window.close();
const html=fs.readFileSync('netlify-site/book-a-call/index.html','utf8');
const runtime=fs.readFileSync('netlify-site/site-interactions-sep13.js','utf8');
(async()=>{
 for(const type of ['Telephone call request','Video call request']){
  const dom=new JSDOM(html,{url:'https://www.setupandseen.co.uk/book-a-call?service='+encodeURIComponent(type),runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};
  const observers=[];const NativeObserver=w.MutationObserver;
  w.MutationObserver=class extends NativeObserver {constructor(...args){super(...args);observers.push(this);}};
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const requests=[];let success=true;
  w.fetch=async(url,options)=>{requests.push({url,options});return {ok:success};};
  w.eval(runtime);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  const form=w.document.querySelector('[data-call-request]');
  assert.equal(form.elements.service.value,type);
  assert.equal(form.elements.phone.required,type==='Telephone call request');
  assert.equal(form.checkValidity(),false);
  form.elements.name.value='Local test';form.elements.email.value='qa@example.invalid';
  form.elements['privacy-consent'].checked=true;
  if(type==='Telephone call request'){
   assert.equal(form.checkValidity(),false);
   form.elements.phone.value='01384 000000';
  }
  // Preferred times and business name are genuinely optional.
  assert.equal(form.checkValidity(),true);
  success=false;form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await new Promise(resolve=>setTimeout(resolve,10));
  assert.ok(form.querySelector('[role="alert"]'));
  assert.equal(form.querySelector('button[type="submit"]').disabled,false);
  success=true;form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal(requests[1].url,'/');
  const data=new URLSearchParams(requests[1].options.body);
  assert.equal(data.get('form-name'),'enquiry');assert.equal(data.get('service'),type);
  assert.match(form.querySelector('.enquiry-confirmation').textContent,/We will email you to agree a time/);
  form.querySelector('[data-send-another-enquiry]').click();
  assert.ok(form.elements.name);
  form.elements.service.value='Video call request';
  form.elements.service.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(form.elements.phone.required,false);
  observers.forEach(observer=>observer.disconnect());dom.window.close();
 }
 console.log('Four contact links, both call routes, validation, optional fields, success/failure and existing Netlify payload passed with local network mocks.');
})().catch(error=>{console.error(error);process.exit(1);});
