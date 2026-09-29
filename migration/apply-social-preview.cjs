const fs = require('node:fs'), path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.join(__dirname,'../netlify-site');
const image = 'https://www.setupandseen.co.uk/assets/social/set-up-and-seen-sales-marketing-20260929.png';
const alt = 'Set Up & Seen. Sales and Marketing. Support for small businesses. Websites, branding, social media and advertising.';
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
let updated=0;
for(const file of walk(root).filter(f=>f.endsWith('.html'))){
 const original=fs.readFileSync(file,'utf8'), dom=new JSDOM(original), d=dom.window.document;
 const og=d.querySelector('meta[property="og:image"]');
 if(!og || ![image,'https://www.setupandseen.co.uk/og.png'].includes(og.content))continue;
 const set=(attribute,key,value)=>{
   let meta=d.querySelector(`meta[${attribute}="${key}"]`);
   if(!meta){meta=d.createElement('meta');meta.setAttribute(attribute,key);d.head.append(meta);}
   meta.content=value;
 };
 for(const [key,value] of Object.entries({'og:image':image,'og:image:secure_url':image,'og:image:width':'1200','og:image:height':'630','og:image:type':'image/png','og:image:alt':alt}))set('property',key,value);
 set('name','twitter:image',image);set('name','twitter:image:alt',alt);
 if(file===path.join(root,'index.html')){
   set('property','og:title','Sales and Marketing | Set Up & Seen');
   set('name','twitter:title','Sales and Marketing | Set Up & Seen');
 }
 fs.writeFileSync(file,dom.serialize());updated++;
}
console.log('Updated branded sharing metadata on '+updated+' pages.');
