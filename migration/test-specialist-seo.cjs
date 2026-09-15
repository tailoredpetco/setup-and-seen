const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const origin='https://www.setupandseen.co.uk';
const routes=['/services/garage-website-design','/services/pet-business-website-design','/our-work/clent-auto-repairs','/our-work/clent-hills-campers-and-vans','/our-work/the-tailored-pet-co'];
const sitemap=fs.readFileSync('netlify-site/sitemap.xml','utf8');
const redirects=fs.readFileSync('netlify-site/_redirects','utf8');
for(const route of routes){
 const dom=new JSDOM(fs.readFileSync('netlify-site'+route+'/index.html','utf8'));
 const d=dom.window.document;
 assert.equal(d.querySelector('link[rel="canonical"]').href,origin+route);
 assert.equal(d.querySelectorAll('h1').length,1);
 assert.ok(d.querySelector('.search-detail').textContent.length>1800);
 assert.ok(d.querySelector('link[href="/assets/search-services.css"]'));
 assert.equal(sitemap.split('<loc>'+origin+route+'</loc>').length,2);
 assert.ok(redirects.indexOf(route+' '+route+'/index.html 200!')<redirects.indexOf('/* /404.txt 404'));
 assert.ok(redirects.includes(route+' '+route+'/index.html 200!'));
 const graphs=[...d.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent));
 const graph=graphs.find(g=>g['@graph'])['@graph'];
 assert.equal(graph[0]['@type'],route.startsWith('/services/')?'Service':'CreativeWork');
 assert.equal(graph[0].url,origin+route);
 assert.equal(graph[1].itemListElement.at(-1).item,origin+route);
 assert.equal(d.querySelectorAll('form').length,0,'Reuse existing enquiry route');
 assert.ok(d.querySelector('a[href="/?service=Website%20Starter#contact"]'));
 dom.window.close();
}
for(const route of ['/','/services/website-design','/services/managed-website-starter']){
 const d=new JSDOM(fs.readFileSync('netlify-site'+(route==='/'?'/index.html':route+'/index.html'),'utf8'));
 for(const service of routes.slice(0,2))assert.ok(d.window.document.querySelector('a[href="'+service+'"]'));
 d.window.close();
}
console.log('Five specialist/project pages: canonical routes, crawlable links, sitemap entries, rewrites, structured data and enquiry destinations passed.');
