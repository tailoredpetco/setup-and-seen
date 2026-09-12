(function () {
  'use strict';
  var packages = {
    starter: {name:'Website Starter',price:'From £495 one-off',url:'/packages#website-starter',scope:'Up to five pages, mobile-friendly design, an enquiry form, basic search engine set-up and content guidance.',costs:'Domain, hosting, full copywriting and branding are separate. Hosting and care are available from £49 a month.',timing:'Normally 2–4 weeks once the required content and feedback are available.'},
    managed: {name:'Managed Website Starter',price:'£149 a month for 12 months',url:'/services/managed-website-starter',scope:'Up to five pages, refinement of supplied wording, one standard .co.uk domain for the first year, hosting and care.',costs:'£1,788 total commitment. Includes one small update of up to 30 minutes a month. Full copywriting, branding, business email, premium domains and paid software are excluded.',timing:'After all 12 payments, continue with care from £49 a month, subject to the service agreed then, or arrange a suitable transfer. Domain renewal is separate.'},
    oneday: {name:'One-Day Website',price:'£495 one-off',url:'/services/one-day-website',scope:'One focused page for a straightforward business introduction and enquiry route.',costs:'Domain and hosting are separate. Hosting and care are available from £49 a month.',timing:'Within one booked working day once all required content, images, payment and access are ready. Availability must be confirmed.'},
    express: {name:'Express Website Set Up',price:'From £999 one-off',url:'/services/express-websites',scope:'Up to five pages, mobile-friendly design, an enquiry form and basic search engine set-up on a priority schedule.',costs:'Domain, hosting, full copywriting and branding are separate. Hosting and care are available from £49 a month.',timing:'Within five working days after payment, the questionnaire, final content, images and access have been received. Availability must be confirmed.'},
    launch: {name:'Business Launch',price:'From £1,595 one-off',url:'/packages#business-launch',scope:'Logo and brand styling, up to six website pages, refinement of wording, social profile set-up, branded templates and Google Business Profile set-up support.',costs:'Domain, hosting, full copywriting and ongoing social media management are separate. Hosting and care are available from £49 a month.',timing:'A project schedule is agreed after the discovery conversation.'},
    complete: {name:'Set Up & Seen Complete',price:'From £2,295 one-off',url:'/packages',scope:'Brand identity and practical guidelines, up to eight pages, full website copywriting, social profile set-up and launch content.',costs:'Domain, hosting, photography unless quoted, and ongoing monthly management are separate. Hosting and care are available from £49 a month.',timing:'A staged schedule is agreed for branding, wording, website review and launch.'},
    bespoke: {name:'A tailored website discussion',price:'Scope and price agreed before work starts',url:'/services/website-design',scope:'Your requirements need a closer look before we can recommend a package.',costs:'We will separate the build, hosting, support and any third-party costs in your proposal.',timing:'No payment is taken when you enquire.'}
  };
  function recommend(a) {
    if (!['one','five','six','eight','more','unsure'].includes(a.pages) || !['ready','launch','complete','unsure'].includes(a.support) || !['oneoff','monthly','either'].includes(a.payment) || !['brochure','advanced','unsure'].includes(a.features) || !['standard','priority','day'].includes(a.timing)) return null;
    if (a.features !== 'brochure' || a.pages === 'more' || a.pages === 'unsure' || a.support === 'unsure') return {key:'bespoke',reason:'A shop, booking system, stock listing, uncertain scope or more than eight pages needs a separate assessment.'};
    if (a.payment === 'monthly') {
      if (a.support !== 'ready' || !['one','five'].includes(a.pages) || a.timing !== 'standard') return {key:'bespoke',reason:'The published monthly plan does not include this combination of extra scope or priority delivery. We will discuss the requirements rather than imply they are included.'};
      return {key:'managed',reason:'You prefer monthly payments and need a straightforward website using your existing brand and supplied content.'};
    }
    if (a.timing !== 'standard' && (a.support !== 'ready' || !['one','five'].includes(a.pages))) return {key:'bespoke',reason:'Branding, additional pages or full copywriting need an agreed schedule. The published priority build does not automatically include them.'};
    if (a.timing === 'day') return a.pages === 'one' ? {key:'oneday',reason:'You need one page and would like a booked one-day build once everything is ready.'} : {key:'bespoke',reason:'The one-day package covers one page. We need to discuss your larger website and deadline.'};
    if (a.timing === 'priority') return {key:'express',reason:'You need up to five pages and would like priority delivery using ready content and branding.'};
    if (a.support === 'complete') return {key:'complete',reason:'You want a full brand identity and website copywriting alongside up to eight pages.'};
    if (a.support === 'launch') return a.pages === 'eight' ? {key:'bespoke',reason:'Business Launch includes up to six pages. We will compare an extended scope with Complete before recommending either.'} : {key:'launch',reason:'You want logo styling and social profile set-up alongside a website of up to six pages.'};
    if (['six','eight'].includes(a.pages)) return {key:'bespoke',reason:'Website Starter includes up to five pages. We will quote the additional pages without assuming you need branding or social media work.'};
    return {key:'starter',reason:a.payment==='either'?'A one-off website build is a sensible starting point for this scope. The £149 monthly plan is also available if you prefer its managed first-year arrangement.':'You have branding and content to work with and need a straightforward website of up to five pages.'};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {recommend:recommend,packages:packages};
  if (typeof document === 'undefined') return;
  var form = document.getElementById('package-finder');
  if (!form) return;
  var result = document.getElementById('finder-result');
  form.addEventListener('change', function () {result.hidden = true;});
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var answer = recommend(Object.fromEntries(new FormData(form)));
    if (!answer) return;
    var pack = packages[answer.key];
    result.querySelector('[data-result-name]').textContent = pack.name;
    result.querySelector('[data-result-price]').textContent = pack.price;
    result.querySelector('[data-result-reason]').textContent = answer.reason;
    result.querySelector('[data-result-scope]').textContent = pack.scope;
    result.querySelector('[data-result-costs]').textContent = pack.costs;
    result.querySelector('[data-result-timing]').textContent = pack.timing;
    result.querySelector('[data-result-details]').href = pack.url;
    var url = new URL('/#contact', location.origin);
    url.searchParams.set('service',answer.key==='bespoke'?'Not sure yet':pack.name);
    url.searchParams.set('finder',answer.key);
    var current = new URLSearchParams(location.search);
    if(current.get('utm_source')==='researcher' && current.get('utm_medium')==='email' && current.get('utm_campaign')==='first_website') ['utm_source','utm_medium','utm_campaign'].forEach(function(k){url.searchParams.set(k,current.get(k));});
    result.querySelector('[data-result-enquire]').href = url.pathname + url.search + url.hash;
    result.hidden = false;
    result.focus();
  });
})();
