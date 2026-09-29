/* Preserve the approved September design while improving loading and project detail.
 * Run last: the earlier maintenance passes deliberately recreate shared content.
 */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {JSDOM} = require('jsdom');
const root = path.resolve('netlify-site');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const projects = {
  'clent-auto-repairs': {
    title: 'Garage Website Design Case Study | Clent Auto Repairs',
    description: 'See the Clent Auto Repairs garage website and branding project, with clear repair services, a prominent workshop number and a straightforward quote enquiry.',
    heading: 'Garage website design for Clent Auto Repairs',
    intro: 'A brand and website for an automotive repair business in Halesowen, with repair information, local context and a clear choice between calling the workshop and requesting a quote.',
    approachHeading: 'Repair information and workshop contact, easy to find',
    approach: 'The homepage introduces accident damage, bodywork, diagnostics and ADAS calibration in its opening copy. Services, accident repair, standards and FAQs have their own navigation links, so drivers can explore the information relevant to their vehicle. The workshop telephone number appears in the header, with a call option beside the quote button.',
    caption: 'Clent Auto Repairs homepage: service information, Halesowen location and clear quote and telephone options.',
    decisionsHeading: 'Helping a driver take the next step',
    decisions: [
      ['Explain the repair work', 'The opening text names the main areas of work. Separate navigation links let a driver explore services and accident repair in more detail.'],
      ['Establish the local connection', 'Halesowen and the West Midlands appear above the headline, placing the business for someone looking for a nearby workshop.'],
      ['Offer a choice of contact', 'Request a quote and call buttons sit together below the introduction, with the workshop number repeated in the header.']
    ]
  },
  'clent-hills-campers-and-vans': {
    title: 'Camper & Van Website Design | Clent Hills Case Study',
    description: 'Explore the Clent Hills Campers & Vans branding and website project, with distinct routes for vehicles, conversions, repairs and customer enquiries.',
    heading: 'Camper and van website design for Clent Hills',
    intro: 'A separate identity and website for Clent Hills Campers & Vans, bringing vehicle sales, conversions and workshop services together without losing the connection to its sister automotive brand.',
    approachHeading: 'Different services, with a clear route to each',
    approach: 'The mountain-line identity connects the business visually with Clent Auto Repairs, while the name, vehicle photography and opening message give it a separate focus. The navigation distinguishes vehicles, conversions, repairs, resprays and Raptor finishes. Visitors can start an enquiry immediately or explore the services first.',
    caption: 'Clent Hills Campers & Vans homepage: a related identity with its own vehicle imagery, service navigation and enquiry route.',
    decisionsHeading: 'A separate purpose for the sister brand',
    decisions: [
      ['Recognisable family identity', 'The mountain-line logo and dark blue treatment retain a visual connection to the repair business, with a distinct name and camper imagery.'],
      ['Separate buying from workshop enquiries', 'Vehicles, conversions, repairs and finishes have individual navigation links, helping visitors choose the relevant route.'],
      ['Explain how to get in touch', 'The homepage offers a start-an-enquiry button, a visible telephone number and a note that viewings are by appointment.']
    ]
  },
  'the-tailored-pet-co': {
    title: 'Pet-Care Website Design Case Study | The Tailored Pet Co',
    description: 'See The Tailored Pet Co branding and website project, with a warm visual identity, clear pet-care services, pricing, coverage information and quote enquiries.',
    heading: 'Pet-care website design for The Tailored Pet Co',
    intro: 'A complete naming, branding and website project for a pet-care business serving Clent and nearby villages. The design brings a warm visual identity together with practical service, pricing and coverage information.',
    approachHeading: 'A calm introduction, with practical information close by',
    approach: 'The olive and cream identity, serif typography and animal imagery establish the visual tone. Navigation links give pet owners direct access to services, pricing, coverage areas and FAQs. A quote button sits in the header, while the opening copy explains where the business works and how the care is tailored around the animals.',
    caption: 'The Tailored Pet Co homepage: olive and cream branding with direct links to services, pricing, coverage areas and quote enquiries.',
    decisionsHeading: 'Answering a pet owner’s first questions',
    decisions: [
      ['Show the character of the business', 'The olive and cream palette, animal illustrations in the logo and pet imagery give the launch a consistent visual style.'],
      ['Make the practical details accessible', 'Services, pricing, areas and FAQs appear in the main navigation, so owners can explore suitability before enquiring.'],
      ['Keep the next step visible', 'The header includes a request-a-quote button, while the opening text places the service in Clent and the surrounding villages.']
    ]
  }
};
for (const file of walk(root).filter(f => f.endsWith('.html') && !f.endsWith('/404.html'))) {
  const dom = new JSDOM(fs.readFileSync(file,'utf8')), d = dom.window.document;
  // Set the enhanced header state before first paint, avoiding the expanded
  // no-JavaScript navigation collapsing after the external runtime downloads.
  d.querySelectorAll('script[data-layout-init]').forEach(e=>e.remove());
  const init=d.createElement('script');init.dataset.layoutInit='';
  init.textContent='document.documentElement.classList.add("site-interactive");';
  d.head.insertBefore(init,d.head.querySelector('link,style,script'));
  const runtime=d.querySelector('script[src^="/site-interactions-sep13.js"]');
  const consent=d.querySelector('script[src^="/analytics-consent.js"]');
  if(runtime) {
    runtime.defer=true;
    runtime.setAttribute('onerror','document.documentElement.classList.remove("site-interactive")');
  }
  if(consent) {
    consent.defer=true;
    // Ordered defer guarantees the consent API exists before its controls bind.
    if(runtime)runtime.before(consent);
  }
  for(const link of d.querySelectorAll('link[rel="preload"][href*="playfair"]'))link.setAttribute('as','font');
  if(d.querySelector('h1 em')&&!d.querySelector('link[rel="preload"][href*="playfair-display-latin-italic"]')) {
    const link=d.createElement('link');link.rel='preload';link.href='/fonts/playfair-display-latin-italic.woff2';
    link.setAttribute('as','font');link.type='font/woff2';link.crossOrigin='anonymous';
    d.head.insertBefore(link,d.head.querySelector('link[rel="stylesheet"]'));
  }
  // Fraunces remains available for legacy decorative lettering but is no longer
  // eagerly downloaded for pages whose wordmark is the approved image.
  if(!d.querySelector('.wordmark strong,.about-mark'))d.querySelectorAll('link[rel="preload"][href*="fraunces"]').forEach(e=>e.remove());
  for(const img of d.querySelectorAll('img.approved-brand-logo')) {
    const footer=!!img.closest('.footer-mark');
    const base='/assets/october-offer/approved-logo'+(footer?'-footer':'');
    img.setAttribute('srcset',[320,640,960].map(w=>base+'-'+w+'.webp '+w+'w').join(', '));
    img.setAttribute('sizes',footer?'(max-width: 600px) 250px, 280px':'(max-width: 600px) 225px, 290px');
    if(footer){img.loading='lazy';img.decoding='async';}
  }
  // Existing decorative SVGs keep their approved geometry and original image
  // coordinates; use a smaller derivative of the same complete artwork.
  for(const img of d.querySelectorAll('svg image[href="/assets/october-offer/approved-logo.png"]'))
    img.setAttribute('href','/assets/october-offer/approved-logo-960.webp');
  for(const [slug,project] of Object.entries(projects)) {
    if(file!==path.join(root,'our-work',slug,'index.html'))continue;
    d.title=project.title;
    for(const selector of ['meta[property="og:title"]','meta[name="twitter:title"]'])if(d.querySelector(selector))d.querySelector(selector).content=project.title;
    for(const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])if(d.querySelector(selector))d.querySelector(selector).content=project.description;
    d.querySelector('h1').textContent=project.heading;
    d.querySelector('.search-intro').textContent=project.intro;
    d.querySelector('.search-project-image figcaption').textContent=project.caption;
    const approach=[...d.querySelectorAll('.search-section')].find(s=>s.querySelector('.eyebrow')?.textContent==='The approach');
    approach.querySelector('h2').textContent=project.approachHeading;
    approach.querySelector('h2+p').textContent=project.approach;
    let details=d.querySelector('#practical-project-details');
    if(!details){details=d.createElement('section');details.className='search-section';details.id='practical-project-details';approach.after(details);}
    details.replaceChildren();
    const label=d.createElement('p');label.className='eyebrow';label.textContent='The practical decisions';
    const heading=d.createElement('h2');heading.textContent=project.decisionsHeading;
    const dl=d.createElement('dl');dl.className='offer-case-decisions';
    for(const [term,copy] of project.decisions){const div=d.createElement('div'),dt=d.createElement('dt'),dd=d.createElement('dd');dt.textContent=term;dd.textContent=copy;div.append(dt,dd);dl.append(div);}
    details.append(label,heading,dl);
    for(const a of d.querySelectorAll('a'))if(a.textContent.includes('Ask Maria about your website'))a.textContent='Discuss your website ↗';
    for(const script of d.querySelectorAll('script[type="application/ld+json"]')){
      const data=JSON.parse(script.textContent);
      for(const item of data['@graph']||[])if(item['@type']==='CreativeWork'){item.name=project.title;item.description=project.description;}
      script.textContent=JSON.stringify(data);
    }
  }
  if(file===path.join(root,'index.html')) {
    for(const slug of Object.keys(projects))for(const a of d.querySelectorAll('a[href="/our-work#'+slug+'"]'))a.href='/our-work/'+slug;
    // This image sits below the opening text on mobile. The browser can discover
    // it from the HTML without a competing preload on the text's critical path.
    d.querySelectorAll('link[rel="preload"][as="image"]').forEach(e=>e.remove());
    const review=d.querySelector('link[data-homepage-review]');
    const inputs=['/assets/site-sep13.css','/assets/search-services.css','/assets/offer-clarity.css','/assets/office-partner.css','/assets/october-offer/home-promotion-v1.css','/assets/brand-aligned-v4.css',review.getAttribute('href')];
    const css=inputs.map(src=>'/* '+src+' */\n'+fs.readFileSync(path.join(root,src),'utf8')).join('\n');
    const hash=crypto.createHash('sha256').update(css).digest('hex').slice(0,12);
    const name='home-performance-'+hash+'.css';fs.writeFileSync(path.join(root,'assets',name),css);
    const first=d.querySelector('link[rel="stylesheet"]');
    first.href='/assets/'+name;first.dataset.homeBundle='';
    for(const link of [...d.querySelectorAll('link[rel="stylesheet"]')])if(link!==first)link.remove();
  }
  fs.writeFileSync(file,dom.serialize());dom.window.close();
}
// Keep the sitemap's existing routes; only date pages whose content changed.
const mapFile=path.join(root,'sitemap.xml');let sitemap=fs.readFileSync(mapFile,'utf8');
for(const route of ['/',...Object.keys(projects).map(s=>'/our-work/'+s)]){
  const loc='<loc>https://www.setupandseen.co.uk'+route+'</loc>';
  sitemap=sitemap.replace(/<url>[\s\S]*?<\/url>/g,block=>block.includes(loc)?block.replace(/<lastmod>[^<]*<\/lastmod>/g,'').replace(loc,loc+'<lastmod>2026-09-29</lastmod>'):block);
}
fs.writeFileSync(mapFile,sitemap);
console.log('Applied performance improvements and three individual project case studies.');
