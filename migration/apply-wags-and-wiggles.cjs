/* 14 November 2026: launched client website and supplied five-star Google review.
 * Scope confirmed by Maria: website design and launch. Do not infer branding,
 * booking-system development, commercial results or the reviewer's job title.
 * Review transcribed verbatim from the supplied screenshot; no date inferred.
 */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { JSDOM } = require('jsdom');
const root = path.resolve('netlify-site');
const route = '/our-work/wags-and-wiggles';
const live = 'https://wagsandwigglesgrooming.co.uk/';
const origin = 'https://www.setupandseen.co.uk';
const image = '/assets/wags-and-wiggles/website.webp';
const excerpt = 'Made me a wonderful website that I am super happy with';
const review = 'Maria was amazing!! Made me a wonderful website that I am super happy with, she was very helpful (as I don’t know what I’m doing with websites!) asked lots of questions to make sure she made exactly what I wanted/needed, and super friendly. Would definitely recommend using her to create you a website!';
const css = fs.readFileSync(path.join(__dirname, 'wags-and-wiggles.css'), 'utf8');
const cssUrl = '/assets/wags-and-wiggles-' + crypto.createHash('sha256').update(css).digest('hex').slice(0,12) + '.css';
fs.writeFileSync(path.join(root, cssUrl), css);
const rating = '<div class="wags-rating"><span class="wags-stars" aria-label="5 out of 5 stars"><span aria-hidden="true">★★★★★</span></span><span>Google review</span></div>';
const quote = full => `<blockquote class="wags-quote">${rating}<p>“${full ? review : excerpt}”</p><cite>daniel doy · ${full ? 'Google review' : 'Excerpt from a Google review'}</cite></blockquote>`;
const preview = (destination, external=false, eager=false) => `<a class="wags-browser" href="${destination}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''} aria-label="${external ? 'Visit the Wags and Wiggles website (opens in a new tab)' : 'Explore the Wags and Wiggles website project'}"><span class="wags-browser-bar">wagsandwigglesgrooming.co.uk</span><img src="${image}" srcset="/assets/wags-and-wiggles/website-720.webp 720w, ${image} 1333w" sizes="${external ? '(max-width: 800px) 90vw, 1056px' : '(max-width: 800px) 90vw, 52vw'}" width="1333" height="760" alt="Wags and Wiggles homepage with cream and teal styling, grooming information and a photograph of a dog in the salon" loading="${eager ? 'eager' : 'lazy'}" decoding="async"><span class="wags-browser-caption">${external ? 'Visit the live website' : 'Explore the project'}</span></a>`;
const actions = `<div class="wags-actions"><a class="button primary" href="${route}">Explore the project</a><a class="wags-text-link" href="${live}" target="_blank" rel="noopener noreferrer">Visit the live website</a></div>`;
const feature = (home=false) => `<${home?'article':'section'} id="${home?'wags-latest-home':'wags-and-wiggles'}" class="wags-feature ${home?'wags-home-feature':'section-pad'}" aria-labelledby="${home?'wags-home-title':'wags-project-title'}"><div class="wags-copy"><p class="eyebrow">Latest website launch · November 2026</p><${home?'h3':'h2'} id="${home?'wags-home-title':'wags-project-title'}">Wags &amp; Wiggles</${home?'h3':'h2'}><p>A welcoming website for a one-to-one dog groomer in Suffolk, bringing together grooming packages, real salon photographs and clear ways to contact Paige.</p><p>I designed and launched the website around the business’s gentle, personal approach.</p>${actions}</div>${preview(route,false,!home)}${quote(false)}</${home?'article':'section'}>`;
function fragment(d, html) { const t=d.createElement('template');t.innerHTML=html;return t.content; }
function style(d) { d.querySelectorAll('link[data-wags-portfolio]').forEach(x=>x.remove());d.head.insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="${cssUrl}" data-wags-portfolio>`); }
function save(dom,file) { fs.writeFileSync(path.join(root,file),dom.serialize());dom.window.close(); }

const home = new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'));
home.window.document.querySelector('#wags-latest-home')?.remove();
home.window.document.querySelector('#work .creative-section-head').after(fragment(home.window.document,feature(true)));
style(home.window.document);save(home,'index.html');

const portfolio = new JSDOM(fs.readFileSync(path.join(root,'our-work/index.html'),'utf8'));
const d=portfolio.window.document;
d.querySelector('#wags-and-wiggles')?.remove();
d.querySelector('.work-page-projects').before(fragment(d,feature()));
const desc='Explore small-business websites including Wags & Wiggles, Clent Auto Repairs and Clent Hills Campers & Vans, with project details and genuine client feedback.';
for(const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])d.querySelector(selector).content=desc;
d.querySelector('meta[property="og:url"]').content=origin+'/our-work';
d.querySelector('link[rel="preload"][as="image"]')?.remove();
const schema=[...d.querySelectorAll('script[type="application/ld+json"]')].find(x=>JSON.parse(x.textContent)['@type']==='CollectionPage');
const collection=JSON.parse(schema.textContent);collection.url=origin+'/our-work';
collection.mainEntity.itemListElement=[...d.querySelectorAll('#wags-and-wiggles,.work-page-project')].map((el,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'CreativeWork',name:el.querySelector('h2').textContent,url:origin+'/our-work/'+el.id}}));
schema.textContent=JSON.stringify(collection);
style(d);save(portfolio,'our-work/index.html');

const page=new JSDOM(fs.readFileSync(path.join(root,'our-work/the-office-partner/index.html'),'utf8'));
const c=page.window.document;
c.querySelector('.office-case').replaceWith(fragment(c,`<article class="wags-case"><header class="wags-case-hero"><nav class="search-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/our-work">My work</a><span aria-hidden="true">/</span><span aria-current="page">Wags &amp; Wiggles</span></nav><p class="eyebrow">Dog grooming · Website design &amp; launch · November 2026</p><h1>Wags &amp; Wiggles</h1><p class="wags-case-intro">A warm welcome, before the first groom. A website that introduces Paige’s one-to-one care and makes the practical details easy to find.</p><div class="wags-actions"><a class="button primary" href="${live}" target="_blank" rel="noopener noreferrer">Visit the live website</a><a class="wags-text-link" href="#client-review">Read the client’s review</a></div></header><figure>${preview(live,true,true)}<figcaption>The finished Wags &amp; Wiggles homepage. A genuine screenshot of the live website.</figcaption></figure><section class="wags-case-summary"><div><p class="eyebrow">The business</p><h2>Care with a personal touch.</h2><p>Wags &amp; Wiggles offers one-to-one dog grooming with Paige at Stonham Barns Park in Stonham Aspal, Suffolk. The website introduces that gentle approach, with photographs from the salon and space to explain how appointments work.</p></div><div><p class="eyebrow">What I created</p><h2>Designed around the business.</h2><p>I designed and launched the website, bringing together the grooming packages, salon gallery, visit information, FAQs and contact options. The finished design carries the business’s cream and teal styling across the pages.</p></div></section><section class="wags-decisions" aria-labelledby="wags-details"><p class="eyebrow">The details that matter</p><h2 id="wags-details">Helping owners take the next step.</h2><div class="wags-decision-grid"><div><h3>See the care.</h3><p>Real photographs from the salon and an introduction to Paige give visitors a feel for the person and place behind the service.</p></div><div><h3>Find the right groom.</h3><p>Clear grooming packages, visit information and FAQs help owners explore the options and prepare for an appointment.</p></div><div><h3>Start a conversation.</h3><p>Visible WhatsApp and telephone links make it easy to contact Paige, with a link to the Tuft app for customers who prefer it.</p></div></div></section><section class="wags-feedback" id="client-review" aria-labelledby="wags-review-title"><p class="eyebrow">The client’s experience</p><h2 id="wags-review-title">In their own words.</h2>${quote(true)}</section><section class="wags-case-cta"><p class="eyebrow">Your business could be next</p><h2>A website that feels like your business.</h2><p>Tell me what you do and what you need from your website. I’ll help you work out the next step.</p><div class="wags-actions"><a class="button primary" href="/?service=Website%20design#contact">Tell me about your website</a><a class="wags-text-link" href="/our-work">Explore more of my work</a></div></section></article>`));
const title='Wags & Wiggles Website Design | Set Up & Seen';
const description='A welcoming dog grooming website for Wags & Wiggles in Suffolk. Explore the finished design, website features and the client’s five-star Google review.';
c.title=title;
for(const sel of ['meta[property="og:title"]','meta[name="twitter:title"]'])c.querySelector(sel).content=title;
for(const sel of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])c.querySelector(sel).content=description;
c.querySelector('link[rel="canonical"]').href=origin+route;
c.querySelector('meta[property="og:url"]').content=origin+route;
for(const sel of ['meta[property="og:image"]','meta[name="twitter:image"]'])c.querySelector(sel).content=origin+image;
c.querySelector('meta[property="og:image:width"]').content='1333';c.querySelector('meta[property="og:image:height"]').content='760';
c.querySelector('meta[property="og:image:alt"]').content='Wags and Wiggles website designed and launched by Set Up & Seen';
for(const el of c.querySelectorAll('head script[type="application/ld+json"]'))el.remove();
const structured={'@context':'https://schema.org','@graph':[{'@type':'CreativeWork',name:'Wags & Wiggles website',description,url:origin+route,image:origin+image,creator:{'@id':origin+'/#business'},about:{'@type':'Organization',name:'Wags & Wiggles',url:live}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/'},{'@type':'ListItem',position:2,name:'My work',item:origin+'/our-work'},{'@type':'ListItem',position:3,name:'Wags & Wiggles',item:origin+route}]}]};
const script=c.createElement('script');script.type='application/ld+json';script.textContent=JSON.stringify(structured);c.head.append(script);
style(c);fs.mkdirSync(path.join(root,route),{recursive:true});save(page,route+'/index.html');

const mapPath=path.join(root,'sitemap.xml');let map=fs.readFileSync(mapPath,'utf8');
for(const url of [origin+'/',origin+'/our-work',origin+route]){
 const loc='<loc>'+url+'</loc>';let found=false;
 map=map.replace(/<url>[\s\S]*?<\/url>/g,b=>{if(!b.includes(loc))return b;found=true;return b.replace(/<lastmod>[^<]*<\/lastmod>/g,'').replace(loc,loc+'<lastmod>2026-11-14</lastmod>');});
 if(!found)map=map.replace('</urlset>',`  <url>${loc}<lastmod>2026-11-14</lastmod></url>\n</urlset>`);
}
fs.writeFileSync(mapPath,map);
console.log('Wags & Wiggles added to homepage, portfolio, case study and sitemap.');
