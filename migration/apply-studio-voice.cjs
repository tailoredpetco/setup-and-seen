// Maria's approved website voice: we, our and us. Keep customer questions,
// consent statements and genuine client quotations in their original voice.
const fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom');
const root=path.join(__dirname,'../netlify-site');
const replacements=[
 [/\bI am based\b/g,'We are based'],[/\bI design\b/g,'We design'],
 [/\bI plan\b/g,'We plan'],[/\bI agree\b/g,'We agree'],
 [/\bI work\b/g,'We work'],[/\bI first check\b/g,'We first check'],
 [/\bI will recommend\b/g,'We will recommend'],[/\bI will explain\b/g,'We will explain'],
 [/\bI will work\b/g,'We will work'],[/\bI can build\b/g,'We can build'],
 [/\bI can quote\b/g,'We can quote'],[/\bI approach\b/g,'we approach'],
 [/\bof my base\b/g,'of our base'],[/\bTell me about\b/g,'Tell us about']
];
const replace=s=>replacements.reduce((out,[pattern,value])=>out.replace(pattern,value),s);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const changed=[];
for(const file of walk(root).filter(f=>f.endsWith('.html'))){
 const source=fs.readFileSync(file,'utf8');
 if(replace(source)===source)continue;
 const dom=new JSDOM(source),d=dom.window.document,walker=d.createTreeWalker(d.body,dom.window.NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const n=walker.currentNode;
  if(n.parentElement.closest('script,style,blockquote,.testimonial-strip,.privacy-check,summary'))continue;
  if(/^[“"]/.test(n.parentElement.textContent.trim()))continue;
  n.nodeValue=replace(n.nodeValue);
 }
 for(const meta of d.querySelectorAll('meta[content]'))meta.content=replace(meta.content);
 const replaceJson=value=>typeof value==='string'?replace(value):Array.isArray(value)?value.map(replaceJson):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,replaceJson(v)])):value;
 for(const script of d.querySelectorAll('script[type="application/ld+json"]'))script.textContent=JSON.stringify(replaceJson(JSON.parse(script.textContent)));
 fs.writeFileSync(file,dom.serialize());dom.window.close();changed.push(path.relative(root,file));
}
console.log('Studio voice updated: '+(changed.join(', ')||'already current'));
