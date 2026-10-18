const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve('netlify-site');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const d=new JSDOM(home).window.document;
assert.equal(d.querySelector('h1').textContent,'Look the part.Sound like you.');
assert.equal(d.querySelectorAll('.creative-service-pair article,.creative-marketing-intro,.creative-marketing-services article').length,6);
assert.equal(d.querySelector('.october-offer-banner'),null);
assert.equal(d.querySelector('#meet-set-up-and-seen'),null);
assert.equal(d.querySelector('.health-check-strip'),null);
assert.deepEqual([...d.querySelectorAll('.price')].map(x=>x.textContent),['from£495one-off project','from£1,595one-off project','from£2,295one-off project']);
const offer=d.querySelector('.october-package-note');
for(const phrase of ['£199','£29/month','£99','31 October 2026','initial or full payment','supplied logo, wording and photographs','Domain registration and renewal'])assert.ok(offer.textContent.includes(phrase),phrase);
assert.ok(d.querySelector('.pricing-grid').compareDocumentPosition(offer)&4,'Standard packages precede the offer');
assert.equal(d.querySelector('select[name="service"]').options[1].value,'Not sure yet');
for(const service of ['Website design','Branding Only','Marketing support','Advertising campaigns','Email marketing'])assert.ok([...d.querySelector('select').options].some(o=>o.value===service));
assert.equal(d.querySelector('video').getAttribute('preload'),'none');
assert.equal(d.querySelector('video').querySelector('source').hasAttribute('src'),false,'Autoplay asset is not fetched before eligibility and visibility');
assert.ok(!d.querySelector('video').hasAttribute('autoplay'));
for(const [route,text] of [['our-work/the-office-partner','my own office support business'],['our-work/the-tailored-pet-co','my own pet-care business']])assert.ok(fs.readFileSync(path.join(root,route,'index.html'),'utf8').includes(text));
const work=new JSDOM(fs.readFileSync(path.join(root,'our-work/index.html'),'utf8')).window.document;
assert.equal([...work.querySelectorAll('blockquote')].filter(e=>/Katie|Tailored Pet/.test(e.textContent)).length,0);
assert.ok([...work.querySelectorAll('blockquote')].some(e=>e.textContent.includes('Clent Auto Repairs')),'Existing independent client quote retained');
assert.equal(work.querySelector('#work-in-motion video').hasAttribute('autoplay'),false);
for(const figure of d.querySelectorAll('img[src="/assets/office-partner/logo.svg"]'))assert.equal(Number(figure.width)/Number(figure.height),1485/245);
for(const el of d.querySelectorAll('a[data-enquiry-service]'))assert.ok([...d.querySelector('select').options].some(o=>o.value===el.dataset.enquiryService));
const css=fs.readFileSync(path.join(root,d.querySelector('link[data-creative-review]').getAttribute('href')),'utf8');
for(const rule of ['max-width:700px','max-width:950px','prefers-reduced-motion:reduce','minmax(0,1fr)','font-size:16px'])assert.ok(css.includes(rule),'Responsive/accessibility rule '+rule);
const runtime=fs.readFileSync(path.join(root,d.querySelector('script[data-creative-motion]').getAttribute('src')),'utf8');
function scenario({desktop=true,reduced=false,saveData=false}={}) {
 const dom=new JSDOM(home,{runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 const media={desktop:{matches:desktop},reduced:{matches:reduced}};
 for(const m of Object.values(media))m.addEventListener=(type,fn)=>m.change=fn;
 w.matchMedia=q=>q.includes('reduced')?media.reduced:media.desktop;
 Object.defineProperty(w.navigator,'connection',{value:{saveData}});
 let visible,playCount=0,loadCount=0;
 w.IntersectionObserver=class {constructor(fn){visible=fn;}observe(){}};
 const v=w.document.querySelector('video');let paused=true;
 Object.defineProperty(v,'paused',{get:()=>paused});
 v.load=()=>{loadCount++;};
 v.play=()=>{playCount++;paused=false;v.dispatchEvent(new w.Event('play'));return Promise.resolve();};
 v.pause=()=>{paused=true;v.dispatchEvent(new w.Event('pause'));};
 w.eval(runtime);
 return {dom,w,v,media,button:w.document.querySelector('.creative-motion-toggle'),section:w.document.querySelector('.creative-showcase'),visible:val=>visible([{isIntersecting:val}]),loads:()=>loadCount,plays:()=>playCount};
}
for(const config of [{desktop:false},{reduced:true},{saveData:true}]){
 const s=scenario(config);s.visible(true);assert.equal(s.loads(),0);assert.equal(s.plays(),0);assert.equal(s.section.classList.contains('motion-ready'),false);s.dom.window.close();
}
const s=scenario();assert.equal(s.loads(),0);s.visible(true);assert.equal(s.loads(),1);assert.equal(s.v.paused,false);assert.equal(s.button.textContent,'Pause portfolio animation');
s.button.click();assert.equal(s.v.paused,true);s.visible(false);s.visible(true);assert.equal(s.v.paused,true,'User pause survives leaving/re-entering viewport');
s.button.click();assert.equal(s.v.paused,false);s.visible(false);assert.equal(s.v.paused,true);s.visible(true);assert.equal(s.v.paused,false);
s.media.reduced.matches=true;s.media.reduced.change();assert.equal(s.v.paused,true);assert.equal(s.section.classList.contains('motion-ready'),false);
s.media.reduced.matches=false;s.media.reduced.change();s.v.dispatchEvent(new s.w.Event('error'));assert.equal(s.section.classList.contains('motion-ready'),false);s.dom.window.close();
const luminance=hex=>{const a=hex.match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
for(const [a,b] of [['315f8c','f7f3ec'],['f7f3ec','071b2d'],['202522','f7f3ec'],['ffffff','315f8c'],['cbd8e1','071b2d']]){const l=[luminance(a),luminance(b)].sort((a,b)=>b-a);assert.ok((l[0]+.05)/(l[1]+.05)>=4.5,'Text contrast '+a+'/'+b);}
console.log('Creative review: prices, six services, ownership, relevant evidence, CTA values, responsive rules, text contrast and motion eligibility/pause/fallback passed. Video playback is simulated, not browser-rendered.');
