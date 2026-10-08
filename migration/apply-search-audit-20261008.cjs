// Preserve the approved 8 October audit corrections after the older build passes.
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.resolve('netlify-site');
const origin = 'https://www.setupandseen.co.uk';
const businessDescription = 'Sales and marketing support for small businesses. Websites, branding, social media, advertising and email marketing. Based in Worcestershire, working UK-wide.';
const salesAnswer = 'The support helps you explain your offer clearly and give potential customers a straightforward route to enquiry. Depending on your priorities, it can include reviewing your marketing, improving service wording, creating branded materials and planning website, social media, advertising or email campaigns. Tell me if you need help with a particular sales task so I can confirm whether it is within scope before quoting.';
const expressDescription = 'Priority website design from £999 for up to five pages, with a five-working-day build from your confirmed slot once payment, content and access are ready. Prompt approvals are required; domain or platform delays can affect launch.';
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const changed = [];
function replaceText(d, before, after) {
  const walker = d.createTreeWalker(d.body, d.defaultView.NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!n.parentElement.closest('script,style')) n.nodeValue = n.nodeValue.split(before).join(after);
  }
}
function faq(d, question, answer) {
  const list = d.querySelector('.faq-list');
  if (!list) throw Error('Missing FAQ list');
  let entry = [...list.querySelectorAll('details')].find(e => e.querySelector('summary')?.firstChild.textContent.trim() === question);
  if (!entry) { entry=d.createElement('details'); list.append(entry); }
  const summary=d.createElement('summary'); summary.append(question);
  const icon=d.createElement('span'); icon.setAttribute('aria-hidden','true'); icon.textContent='+'; summary.append(icon);
  const text=d.createElement('p'); text.textContent=answer; entry.replaceChildren(summary,text);
}
function syncFaq(d) {
  const questions=[...d.querySelectorAll('.faq-list details')].map(e=>({
    '@type':'Question', name:e.querySelector('summary').firstChild.textContent.trim(),
    acceptedAnswer:{'@type':'Answer',text:[...e.querySelectorAll('p')].map(p=>p.textContent.trim()).join(' ')}
  }));
  if (!questions.length) return;
  for (const script of d.querySelectorAll('script[type="application/ld+json"]')) {
    const data=JSON.parse(script.textContent);
    const nodes=data['@graph'] || [data];
    for (const node of nodes) if(node['@type']==='FAQPage') node.mainEntity=questions;
    script.textContent=JSON.stringify(data);
  }
}
for (const file of walk(root).filter(f=>f.endsWith('.html')&&!f.endsWith('/404.html'))) {
  const old=fs.readFileSync(file,'utf8'), dom=new JSDOM(old), d=dom.window.document;
  const route='/' + path.relative(root,file).replaceAll(path.sep,'/').replace(/(^|\/)index\.html$/,'');
  for (const script of d.querySelectorAll('script[type="application/ld+json"]')) {
    const data=JSON.parse(script.textContent);
    for(const node of data['@graph'] || [data]) {
      if(node['@id']===origin+'/#business' && node.name==='Set Up & Seen') node.description=businessDescription;
      if(route==='/services/express-websites' && node['@type']==='Service') node.description=expressDescription;
    }
    script.textContent=JSON.stringify(data);
  }
  replaceText(d,'Turn more visitors into genuine enquiries','Give interested visitors a clear way to enquire');
  replaceText(d,'photographs, We can','photographs, I can');
  replaceText(d,'social media set-up, We can','social media set-up, I can');
  replaceText(d,'For a replacement website, We first','For a replacement website, I first');

  if(route==='/' || route==='/services/marketing-support') {
    faq(d,'What does sales and marketing support cover?',salesAnswer);
  }
  if(route==='/services/marketing-support') {
    d.querySelector('.service-page-lead').textContent='Practical support to explain your services, plan your marketing and make it easier for customers to enquire. From a one-off review to agreed ongoing work, the scope is shaped around your business, budget and priorities. Available remotely across the UK.';
    d.querySelector('.service-page-hero aside small').textContent='PROJECT PRICING';
    d.querySelector('.service-page-hero aside strong').textContent='Quoted around your scope';
    faq(d,'How are costs and ongoing support agreed?','Your written proposal confirms the work, price, delivery stages and responsibilities before you decide. For ongoing support it also sets out the payment schedule, any minimum term, cancellation notice and how extra work is quoted. Advertising spend and third-party subscriptions are separate unless explicitly included.');
  }
  if(route==='/services/express-websites') {
    d.querySelector('.service-page-lead').textContent='A priority website build for small businesses with a deadline. From £999 for up to five pages, with the price and booked start date confirmed in writing. The five-working-day timetable starts when your agreed slot begins and payment, the completed questionnaire, final content, images and access are ready. Prompt feedback and approvals are needed to keep the project on schedule.';
    d.querySelector('.service-page-hero aside strong').textContent='From £999 one-off';
    replaceText(d,'A clear fixed price','A price agreed before work starts');
    replaceText(d,'Completed within five working days','A booked five-working-day build');
    replaceText(d,'Website Starter is prioritised and completed within five working days once the agreed payment, content, images, access and questionnaire are ready.','The core Website Starter scope is prioritised within a booked five-working-day build. Missing content or delayed approvals pause the timetable; domain or platform processing can affect the public launch.');
    replaceText(d,'We complete the final checks and launch within a maximum of five working days of receiving everything required.','The approved website is prepared for launch within the agreed timetable. Public launch also depends on domain access and third-party DNS or platform processing.');
    faq(d,'Can my website really be ready in less than a week?','The build is scheduled for five working days from your confirmed slot once the agreed payment, completed questionnaire, final content, images and access are ready. You need to provide prompt feedback and approvals. Missing information or delayed feedback pauses the timetable; domain and platform processing can affect the public launch.');
    faq(d,'Is hosting included?','No. Domain and hosting costs are separate from the build. Optional Website Care starts from £49 a month and includes hosting, SSL, backups, checks and a small monthly content update. Your written quote confirms the full cost.');
    for(const meta of d.querySelectorAll('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]')) meta.content=expressDescription;
  }
  if(route==='/packages') {
    replaceText(d,'The five-day period begins after payment, the completed questionnaire, final content, images and required access have been received.','The five-working-day timetable begins when your confirmed slot starts and the agreed payment, completed questionnaire, final content, images and access are ready. Prompt feedback and approvals are required. Missing information or delayed feedback pauses the timetable; domain or platform processing can affect the public launch.');
    replaceText(d,'Up to five pages on a priority schedule, within five working days once payment, the questionnaire, final content, images and access are ready.','Up to five pages on a booked five-working-day build once payment, the questionnaire, final content, images and access are ready. Prompt approvals are required; domain or platform delays can affect launch.');
  }
  if(route==='/services/website-design') {
    faq(d,'How much does a small business website cost?','Website Starter begins at £495 for up to five pages, normally completed in 2–4 weeks. The One-Day Website is £495 for one page within a booked working day once everything is ready. Express Website Set Up starts from £999 for a priority build of up to five pages. Managed Website Starter is £149 a month for 12 months (£1,788 total), including hosting and care during the plan. Domain and hosting are separate for one-off packages. Your written proposal confirms the scope, timing and total cost.');
    faq(d,'Can I edit my website or move it later?','The platform is agreed before the build. Your proposal explains which content you can edit yourself, any training or editing access included, and which changes need support. It also confirms ownership, the files and access available at handover, and any transfer work or third-party costs. Your domain remains yours.');
  }
  if(route==='/services/social-media-management') {
    faq(d,'Are the eight content pieces shared across both platforms?','Yes. The core package covers eight content pieces in total each month, adapted for Facebook and Instagram. It does not mean eight separate pieces for each platform. The mix of formats and any additional content are agreed in your proposal.');
    faq(d,'What about replies to messages and comments?','The core package covers content planning, captions, graphics, scheduling and a performance summary. Tell me if you also need help with messages or comments so responsibility, availability and any additional scope can be confirmed before you agree.');
    faq(d,'How are revisions and cancellation handled?','Your written proposal confirms the review stages, included changes, payment schedule, any minimum term and cancellation notice before you commit. Extra content or work outside that scope is quoted separately.');
  }
  if(route==='/services/website-hosting-care') {
    faq(d,'What counts as a small content update?','Examples include changing supplied text, replacing an image, updating a price or adding a short notice. The allowance and response arrangements for your plan are confirmed in your proposal. The separate Managed Website Starter plan includes one update of up to 30 minutes each month. New pages, redesigns and larger changes need a separate quote.');
    faq(d,'What happens if I cancel hosting and care?','Your proposal confirms the notice period and final billing arrangements. If hosting ends, the website needs suitable alternative hosting to stay online. The available files, access, transfer options and any separately chargeable work are explained before you agree. Your domain remains yours.');
  }
  if(route==='/competition') {
    d.title='Website Starter prize draw closed | Set Up & Seen';
    d.querySelector('meta[name="description"]').content='The Website Starter prize draw closed on 30 September 2026. Entries are no longer accepted. Read the archived terms or explore current website packages.';
    d.querySelector('link[rel="canonical"]').href=origin+'/competition';
    d.querySelectorAll('meta[http-equiv="refresh"]').forEach(e=>e.remove());
    d.querySelector('section.draw-section').removeAttribute('id');
    d.querySelector('section.draw-section .draw-wrap').innerHTML='<p class="eyebrow">September 2026 prize draw</p><h1>The Website Starter<br>prize draw has closed.</h1><p>Entries closed on <strong>30 September 2026</strong> and are no longer being accepted.</p><p>You can still read the prize draw terms or explore the current website packages.</p><div class="hero-actions"><a class="button primary" href="/competition/terms">Read the prize draw terms <span aria-hidden="true">↗</span></a><a class="text-link" href="/packages">Explore website packages <span aria-hidden="true">→</span></a></div>';
  }
  if(route==='/competition/terms') {
    const article=d.querySelector('article');
    if(!d.getElementById('prize-draw-closed-notice')) {
      const note=d.createElement('p'); note.id='prize-draw-closed-notice';
      note.innerHTML='<strong>This prize draw is closed.</strong> Entries closed on 30 September 2026. The original terms below are retained for reference. <a href="/competition">View the closure notice</a>.';
      article.querySelector('h1').after(note);
    }
  }
  if(['/', '/services/marketing-support','/services/express-websites','/services/website-design','/services/social-media-management','/services/website-hosting-care'].includes(route)) syncFaq(d);
  const updated=dom.serialize();
  if(updated!==old) {fs.writeFileSync(file,updated);changed.push(route);}
  dom.window.close();
}
const redirectsFile=path.join(root,'_redirects');
let redirects=fs.readFileSync(redirectsFile,'utf8');
redirects=redirects.replace(/^\/competition \/website-offer 302!$/m,'/competition /competition/index.html 200!').replace(/^\/competition\/index\.html \/website-offer 302!$/m,'/competition/index.html /competition 301!');
fs.writeFileSync(redirectsFile,redirects);
// Accurate last-modified dates help identify the updated canonical pages.
const sitemapFile=path.join(root,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapFile,'utf8');
for(const route of changed) {
 const location=origin+route;
 sitemap=sitemap.replace(/<url>([\s\S]*?)<\/url>/g,(block,inner)=>{
  if(!inner.includes('<loc>'+location+'</loc>')) return block;
  return '<url>'+inner.replace(/<lastmod>[^<]*<\/lastmod>/g,'').replace('</loc>','</loc><lastmod>2026-10-08</lastmod>')+'</url>';
 });
}
fs.writeFileSync(sitemapFile,sitemap);
console.log('Applied audit corrections to '+changed.length+' pages.');
