// Run last: contact routes stay in the saved HTML on every static rebuild.
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {JSDOM} = require('jsdom');
const root = path.resolve(process.argv[2] || 'netlify-site');
const questionnaire = 'https://docs.google.com/forms/d/e/1FAIpQLSdTaljj0JBo6Y95tTOrH1vtw-BcRNdvFyZL8ECEcWPAoSh7lQ/viewform';
const css = fs.readFileSync(path.join(__dirname,'contact-options.css'),'utf8');
const version = createHash('sha256').update(css).digest('hex').slice(0,12);
fs.writeFileSync(path.join(root,'assets/contact-options.css'),css);
const dom = new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'));
const d = dom.window.document;
function stylesheet(doc) {
 let link=doc.querySelector('[data-contact-options]');
 if(!link){link=doc.createElement('link');link.rel='stylesheet';link.dataset.contactOptions='';doc.head.append(link);}
 link.href='/assets/contact-options.css?v='+version;
}
function icon(content){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;}
const choices = [
 ['/book-a-call?service=Telephone%20call%20request','Book a telephone call','Prefer a chat on the phone? Suggest a convenient time for us to call you.','Request a call',icon('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.1 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1z"/>')],
 ['/book-a-call?service=Video%20call%20request','Book a video call','Meet online to talk through your ideas. We will agree a time and send a joining link.','Request a video call',icon('<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 9 6-3v12l-6-3z"/>')],
 [questionnaire,'Complete the questionnaire','Tell us about your website in your own time. Skip any questions you cannot answer.','Open questionnaire · no sign-in',icon('<rect x="5" y="3" width="14" height="19" rx="2"/><path d="M9 2h6v4H9zM9 11h6M9 15h6M9 19h3"/>')],
 ['mailto:info@setupandseen.co.uk','Email us','Send us your questions or a few details about what you have in mind.','Write an email',icon('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/>')]
];
const intro=d.querySelector('#contact .contact-intro');
intro.querySelector('p:not(.eyebrow)').textContent='Choose the way you feel most comfortable getting started. There is no need to have all the answers yet.';
intro.querySelector('.direct-contact')?.remove();
intro.querySelector('.contact-choice-grid')?.remove();
const grid=d.createElement('div');grid.className='contact-choice-grid';grid.setAttribute('aria-label','Choose how to get in touch');
grid.innerHTML=choices.map(([href,title,description,action,svg])=>`<a class="contact-choice" href="${href}">${svg}<strong>${title}</strong><span>${description}</span><span class="contact-choice-action">${action} <span aria-hidden="true">↗</span></span></a>`).join('');
intro.insertBefore(grid,intro.querySelector('#enquiry-next-steps'));
const homeForm=d.querySelector('#contact form');
if(!homeForm.querySelector('.contact-quick-title')){const h=d.createElement('h3');h.className='contact-quick-title';h.textContent='Or send a quick enquiry';homeForm.prepend(h);}
stylesheet(d);
fs.writeFileSync(path.join(root,'index.html'),dom.serialize());

// Reuse the existing header, footer, cookie controls and submission endpoint.
const page=new JSDOM(dom.serialize());const p=page.window.document;
p.title='Book a Telephone or Video Call | Set Up & Seen';
const description='Request a telephone or video call with Set Up & Seen to discuss your website. Suggest a time and we will confirm the details by email.';
for(const s of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])p.querySelector(s).content=description;
for(const s of ['meta[property="og:title"]','meta[name="twitter:title"]'])p.querySelector(s).content=p.title;
p.querySelector('link[rel="canonical"]').href='https://www.setupandseen.co.uk/book-a-call';
p.querySelector('meta[property="og:url"]').content='https://www.setupandseen.co.uk/book-a-call';
for(const s of ['meta[name="robots"]','meta[name="googlebot"]'])p.querySelector(s).content='noindex, follow';
p.querySelectorAll('script[type="application/ld+json"],link[rel="preload"][as="image"]').forEach(e=>e.remove());
const header=p.querySelector('.site-header').outerHTML;const footer=p.querySelector('footer').outerHTML;
p.querySelector('main').innerHTML=header+`<section class="call-request-layout" id="contact" aria-labelledby="call-request-title">
 <div class="call-request-copy"><a class="back-to-contact" href="/#contact">← All contact options</a><p class="eyebrow">Let's talk about your website</p><h1 id="call-request-title">A conversation,<br><em>at a time that suits you.</em></h1>
 <p>Choose a telephone or video call and tell us when you are usually available. You do not need a finished plan. We can help you work out the next step.</p>
 <div class="call-request-note"><strong>What happens next?</strong>We will email you to agree a time. Your appointment is confirmed once we have agreed the details with you. For a video call, we will also send a joining link.</div>
 <p>Prefer email? <a href="mailto:info@setupandseen.co.uk">info@setupandseen.co.uk</a></p></div>
 <form class="call-request-form" name="enquiry" data-call-request aria-live="polite" action="/thank-you" method="POST" data-netlify="true" data-netlify-honeypot="website">
 <input type="hidden" name="form-name" value="enquiry"><input class="form-honeypot" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" name="website">
 <label>How would you like to speak with us?<select name="service" required><option value="Telephone call request">Telephone call</option><option value="Video call request">Video call (conference call)</option></select></label>
 <label>Your name<input name="name" autocomplete="name" required></label>
 <label>Business name (optional)<input name="business" autocomplete="organization"></label>
 <label>Email address<input name="email" type="email" autocomplete="email" required><span class="call-field-help">We will use this to confirm the arrangements.</span></label>
 <label><span data-phone-label>Telephone number</span><input name="phone" type="tel" autocomplete="tel" required></label>
 <label>When would suit you? (optional)<textarea name="message" rows="4" placeholder="For example: Tuesday or Thursday afternoon, UK time. You can also tell us briefly what you would like to discuss."></textarea><span class="call-field-help">A few possible days and times are helpful. If you are unsure, leave this blank and we will arrange it by email.</span></label>
 <label class="privacy-check"><input type="checkbox" required name="privacy-consent" value="accepted"><span>I have read the <a href="/privacy">privacy and cookie notice</a> and understand how my enquiry details will be used.</span></label>
 <button class="button primary" type="submit">Request a telephone call <span aria-hidden="true">↗</span></button><small class="form-note">This sends a request, not a confirmed booking. No payment is taken.</small></form></section>`+footer;
p.body.classList.add('call-request-page');
for(const a of p.querySelectorAll('.site-header a[href^="#"],footer a[href^="#"]'))a.setAttribute('href','/'+a.getAttribute('href'));
fs.mkdirSync(path.join(root,'book-a-call'),{recursive:true});
fs.writeFileSync(path.join(root,'book-a-call/index.html'),page.serialize());
page.window.close();dom.window.close();
console.log('Contact choices and call request page saved.');
