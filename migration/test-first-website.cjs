const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {recommend,packages} = require('../netlify-site/package-finder-v1.js');
const base={pages:'five',support:'ready',payment:'oneoff',features:'brochure',timing:'standard'};
for(const [change,expected] of [
  [{},'starter'],[{payment:'monthly'},'managed'],[{timing:'priority'},'express'],
  [{pages:'one',timing:'day'},'oneday'],[{support:'launch',pages:'six'},'launch'],
  [{support:'complete',pages:'eight'},'complete'],[{features:'advanced'},'bespoke'],
  [{pages:'six'},'bespoke'],[{support:'launch',pages:'eight'},'bespoke'],
  [{support:'complete',payment:'monthly'},'bespoke'],[{payment:'monthly',timing:'priority'},'bespoke'],
  [{timing:'day'},'bespoke'],[{pages:'unsure'},'bespoke']
]) assert.equal(recommend({...base,...change}).key,expected,JSON.stringify(change));
assert.equal(recommend({...base,pages:''}),null);
let combinations=0;
for(const pages of ['one','five','six','eight','more','unsure']) for(const support of ['ready','launch','complete','unsure']) for(const payment of ['oneoff','monthly','either']) for(const features of ['brochure','advanced','unsure']) for(const timing of ['standard','priority','day']) {
  const result=recommend({pages,support,payment,features,timing});
  assert.ok(packages[result.key]);
  if(features!=='brochure') assert.equal(result.key,'bespoke');
  if(result.key==='managed') {assert.ok(['one','five'].includes(pages));assert.equal(support,'ready');assert.equal(timing,'standard');}
  combinations++;
}
const source=fs.readFileSync('netlify-site/netlify-migration-v2.js','utf8');
function functionSource(name) {
 const start=source.indexOf('  function '+name+'(');
 const end=source.indexOf('\n  }',start)+4;
 assert.ok(start>=0&&end>start);return source.slice(start,end);
}
const scope={URL,URLSearchParams,FormData,window:{location:{origin:'https://www.setupandseen.co.uk',search:'?utm_source=researcher&utm_medium=email&utm_campaign=first_website&finder=managed'}}};
vm.createContext(scope);
vm.runInContext(functionSource('acquisitionContext')+'\n'+functionSource('withAcquisitionContext'),scope);
let link=vm.runInContext('withAcquisitionContext(new URL("/?service=Managed%20Website%20Starter#contact",window.location.origin)).href',scope);
assert.equal(new URL(link).searchParams.get('service'),'Managed Website Starter');
assert.equal(new URL(link).searchParams.get('utm_campaign'),'first_website');
assert.equal(new URL(link).hash,'#contact');
assert.equal(vm.runInContext('withAcquisitionContext(new URL("https://wa.me/447999071045")).href',scope),'https://wa.me/447999071045');
scope.window.location.search='?utm_source=personal@example.com&finder=<script>';
assert.equal(vm.runInContext('acquisitionContext().campaign',scope),false);
assert.equal(vm.runInContext('acquisitionContext().suggestion',scope),'');
scope.window.location.search='?utm_source=researcher&utm_medium=email&utm_campaign=first_website&finder=managed';
scope.FormData=class {constructor(){this.fields=new Map([['message','Please explain the plan.']]);}set(k,v){this.fields.set(k,v);}get(k){return this.fields.get(k);}[Symbol.iterator](){return this.fields[Symbol.iterator]();}};
vm.runInContext(functionSource('encode'),scope);
const enquiry=new URLSearchParams(vm.runInContext('encode({},"enquiry")',scope));
assert.match(enquiry.get('message'),/Campaign reference: researcher/);
assert.match(enquiry.get('message'),/Package finder suggestion: managed/);
const competition=new URLSearchParams(vm.runInContext('encode({},"website-starter-prize-draw-2026")',scope));
assert.equal(competition.get('message'),'Please explain the plan.');
assert.ok(source.indexOf('if (!response.ok) throw new Error("Netlify Forms rejected the enquiry")')<source.indexOf('window.gtag("event", "generate_lead"'));
assert.match(source,/getItem\("setup-and-seen-cookie-consent"\) === "accepted"/);
console.log(`${combinations} finder combinations, package boundaries, attribution propagation, input rejection and form isolation passed.`);
const handlerStart=source.indexOf('  async function handleEnquiry(');
const handlerEnd=source.indexOf('\n  }',handlerStart)+4;
let responseOK=true,consent='accepted',events=0,confirmed=0,errors=0;
Object.assign(scope,{
 removeError(){},setButtonState(){},
 submitToNetlify:async()=>({ok:responseOK}),
 showEnquiryConfirmation(){confirmed++;},
 showError(){errors++;}
});
scope.window.localStorage={getItem:()=>consent};
scope.window.gtag=(...args)=>{assert.equal(args[0],'event');assert.equal(args[1],'generate_lead');assert.ok(!JSON.stringify(args).includes('@'));events++;};
scope.event={preventDefault(){},stopImmediatePropagation(){}};
scope.form={reportValidity:()=>true};
vm.runInContext(source.slice(handlerStart,handlerEnd),scope);
(async()=>{
 await vm.runInContext('handleEnquiry(event,form)',scope);
 assert.equal(events,1);assert.equal(confirmed,1);
 consent='rejected';await vm.runInContext('handleEnquiry(event,form)',scope);
 assert.equal(events,1);assert.equal(confirmed,2);
 responseOK=false;consent='accepted';await vm.runInContext('handleEnquiry(event,form)',scope);
 assert.equal(events,1);assert.equal(confirmed,2);assert.equal(errors,1);
 console.log('Successful, rejected-consent and failed-enquiry analytics behaviour passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
