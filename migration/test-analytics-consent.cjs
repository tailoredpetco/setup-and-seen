const assert = require('node:assert/strict'), fs = require('node:fs');
const {JSDOM} = require('jsdom');
const source=fs.readFileSync('netlify-site/analytics-consent.js','utf8');
const runtime=fs.readFileSync('netlify-site/site-interactions-sep13.js','utf8');
const html=fs.readFileSync('netlify-site/index.html','utf8');
const key='setup-and-seen-cookie-consent', disabled='ga-disable-G-C860VPVLNT';
function scenario(choice,blocked=false){
 const dom=new JSDOM(html,{url:'https://www.setupandseen.co.uk/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document,observers=[];
 const Observer=w.MutationObserver;w.MutationObserver=class extends Observer{constructor(...args){super(...args);observers.push(this);}};
 w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 if(choice)w.localStorage.setItem(key,choice);
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw new Error('Blocked storage');}});
 w.eval(source);w.eval(runtime);d.dispatchEvent(new w.Event('DOMContentLoaded'));
 return {w,d,close(){observers.forEach(o=>o.disconnect());w.close();}};
}
const tagCount=d=>d.querySelectorAll('script[src^="https://www.googletagmanager.com/gtag/js"]').length;
for(const choice of [null,'rejected']){
 const s=scenario(choice);assert.equal(tagCount(s.d),0);assert.equal(s.w[disabled],true);
 assert.equal(s.w.dataLayer.filter(a=>a[0]==='config').length,0);
 s.close();
}
const s=scenario(null);
s.d.querySelector('.cookie-reject').click();assert.equal(tagCount(s.d),0);
s.d.querySelector('.cookie-settings').click();s.d.querySelector('.cookie-accept').click();
assert.equal(tagCount(s.d),1);assert.equal(s.w[disabled],false);
assert.equal(s.w.localStorage.getItem(key),'accepted');
s.d.cookie='_ga=test; path=/; domain=setupandseen.co.uk';
s.d.cookie='_ga_C860VPVLNT=test; path=/';
s.d.cookie='essential_example=keep; path=/';
assert.match(s.d.cookie,/_ga=/);
s.d.querySelector('.cookie-settings').click();s.d.querySelector('.cookie-reject').click();
assert.equal(s.w[disabled],true);assert.doesNotMatch(s.d.cookie,/_ga/);assert.match(s.d.cookie,/essential_example=keep/);
assert.equal(s.w.localStorage.getItem(key),'rejected');
s.d.querySelector('.cookie-settings').click();s.d.querySelector('.cookie-accept').click();
assert.equal(tagCount(s.d),1);assert.equal(s.w.dataLayer.filter(a=>a[0]==='config').length,1);
s.w.dispatchEvent(new s.w.StorageEvent('storage',{key,newValue:'rejected'}));assert.equal(s.w[disabled],true);
for(const event of s.w.dataLayer.filter(a=>a[0]==='consent')){
 assert.equal(event[2].ad_storage,'denied');assert.equal(event[2].ad_user_data,'denied');assert.equal(event[2].ad_personalization,'denied');
}
s.close();
const returning=scenario('accepted');assert.equal(tagCount(returning.d),1);assert.equal(returning.w[disabled],false);returning.close();
const blocked=scenario(null,true);assert.equal(tagCount(blocked.d),0);assert.equal(blocked.w[disabled],true);blocked.close();
console.log('Consent checks passed: no tag before opt-in or after saved rejection; one tag after acceptance; withdrawal removes Analytics cookies and disables measurement; repeat acceptance, cross-tab withdrawal and unavailable storage handled. No network requests made.');
