/* The 26 October campaign uses we/us/our. Apply after the retained creative pass.
 * Scope: marketing support page and the shared enquiry copy it leads into.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM}=require('jsdom');
const root=path.resolve('netlify-site');
const file=path.join(root,'services/marketing-support/index.html');
const dom=new JSDOM(fs.readFileSync(file,'utf8')),d=dom.window.document;
const description='Your own sales and marketing consultant: competitor research, networking recommendations, creative campaigns and practical support for UK small businesses.';
const title='Sales & Marketing Consultant for Small Businesses | Set Up & Seen';
d.title=title;
for(const [selector,value] of [
 ['meta[name="description"]',description],['meta[property="og:title"]',title],['meta[property="og:description"]',description],['meta[name="twitter:title"]',title],['meta[name="twitter:description"]',description]
])d.querySelector(selector).content=value;
d.body.classList.add('marketing-support-page');
d.querySelector('article.service-page').innerHTML=fs.readFileSync(path.join(__dirname,'marketing-support-page.html'),'utf8');
for(const a of d.querySelectorAll('a[href="/our-work"]'))if(a.textContent.trim()==='My work')a.textContent='Our work';
const faq=[...d.querySelectorAll('.faq-list details')].map(el=>({'@type':'Question',name:el.querySelector('summary').childNodes[0].textContent,acceptedAnswer:{'@type':'Answer',text:el.querySelector('p').textContent}}));
for(const script of d.querySelectorAll('script[type="application/ld+json"]')){
 const value=JSON.parse(script.textContent);
 for(const node of value['@graph']||[]){
  if(node['@type']==='Service'){node.name='Sales and marketing consultancy for small businesses';node.description=description;node.serviceType=['Competitor research','Networking recommendations','Sales messaging','Creative campaigns','Marketing planning'];}
  if(node['@type']==='FAQPage')node.mainEntity=faq;
 }
 script.textContent=JSON.stringify(value);
}
const css=fs.readFileSync(path.join(__dirname,'marketing-support.css'),'utf8');
const cssUrl='/assets/marketing-support-'+crypto.createHash('sha256').update(css).digest('hex').slice(0,12)+'.css';
fs.writeFileSync(path.join(root,cssUrl),css);
d.querySelectorAll('link[data-marketing-support]').forEach(e=>e.remove());
const link=d.createElement('link');link.rel='stylesheet';link.href=cssUrl;link.dataset.marketingSupport='';d.head.append(link);
fs.writeFileSync(file,dom.serialize());dom.window.close();

// Retain form field names, choices, privacy statement and submission behaviour.
const homeFile=path.join(root,'index.html');
const home=new JSDOM(fs.readFileSync(homeFile,'utf8')),hd=home.window.document;
// Keep the shared navigation visible above the enquiry in the same brand voice.
for(const a of hd.querySelectorAll('header a[href="/our-work"],footer a[href="/our-work"]'))if(a.textContent.trim()==='My work')a.textContent='Our work';
hd.querySelector('#contact .contact-intro>p:not(.eyebrow)').textContent='Tell us a little about your business and the help you need. Use the form, email, phone or WhatsApp, whichever suits you.';
const reassurance=hd.querySelector('#enquiry-next-steps');
for(const node of reassurance.childNodes)if(node.nodeType===3)node.nodeValue=node.nodeValue.replace('I will discuss','We will discuss');
const message=hd.querySelector('textarea[name="message"]');
const label=message.closest('label')||(message.id&&hd.querySelector('label[for="'+message.id+'"]'));
if(label)for(const node of label.childNodes)if(node.nodeType===3)node.nodeValue=node.nodeValue.replace('Tell me a little more','Tell us a little more');
fs.writeFileSync(homeFile,home.serialize());home.window.close();

const sitemap=path.join(root,'sitemap.xml');
let map=fs.readFileSync(sitemap,'utf8');
for(const route of ['/services/marketing-support','/']){
 const loc='<loc>https://www.setupandseen.co.uk'+route+'</loc>';
 map=map.replace(/<url>[\s\S]*?<\/url>/g,b=>b.includes(loc)?b.replace(/<lastmod>[^<]*<\/lastmod>/g,'').replace(loc,loc+'<lastmod>2026-10-26</lastmod>'):b);
}
fs.writeFileSync(sitemap,map);
console.log('Marketing offer, metadata, FAQ schema and linked enquiry copy updated.');
