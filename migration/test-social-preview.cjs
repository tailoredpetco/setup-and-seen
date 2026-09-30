const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const {JSDOM}=require('jsdom'), sharp=require('sharp');
const root=path.join(__dirname,'../netlify-site');
const url='https://www.setupandseen.co.uk/assets/social/set-up-and-seen-sales-marketing-20260929.png';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
(async()=>{
 let count=0;
 for(const file of walk(root).filter(f=>f.endsWith('.html'))){
  const d=new JSDOM(fs.readFileSync(file,'utf8')).window.document;
  const og=d.querySelector('meta[property="og:image"]');
  if(!og)continue;
  assert.notEqual(og.content,'https://www.setupandseen.co.uk/og.png');
  if(og.content!==url)continue;
  count++;
  for(const property of ['og:image','og:image:width','og:image:height','og:image:alt'])assert.equal(d.querySelectorAll(`meta[property="${property}"]`).length,1);
  assert.equal(d.querySelector('meta[name="twitter:image"]').content,url);
  assert.equal(d.querySelector('meta[property="og:image:width"]').content,'1200');
  assert.equal(d.querySelector('meta[property="og:image:height"]').content,'630');
  assert.match(d.querySelector('meta[property="og:image:alt"]').content,/Sales and Marketing/);
 }
 assert.ok(count>=30);
 const home=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8')).window.document;
 assert.equal(home.querySelector('meta[property="og:title"]').content,'Sales and Marketing | Set Up & Seen');
 assert.equal(home.querySelector('meta[name="twitter:title"]').content,'Sales and Marketing | Set Up & Seen');
 const image=fs.readFileSync(path.join(root,'assets/social/set-up-and-seen-sales-marketing-20260929.png'));
 const meta=await sharp(image).metadata();
 assert.equal(meta.width,1200);assert.equal(meta.height,630);assert.equal(meta.format,'png');
 assert.deepEqual(fs.readFileSync(path.join(root,'og.png')),image);
 console.log('Social preview passed: '+count+' pages, correct titles, unique versioned image, 1200 × 630 PNG and matching legacy asset.');
})().catch(e=>{console.error(e);process.exitCode=1;});
