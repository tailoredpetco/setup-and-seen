/* Save the existing approved page enhancements into HTML, and keep only the
 * interactive behaviour at runtime. Run with npm run build:static. */
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const acorn = require('acorn');
const {JSDOM} = require('jsdom');

const root = path.resolve(process.argv[2] || 'netlify-site');
const legacy = fs.readFileSync(path.join(root, 'netlify-migration-v2.js'), 'utf8');
const ast = acorn.parse(legacy, {ecmaVersion:'latest'});
const declarations = ast.body[0].expression.callee.body.body.filter(n => n.type === 'FunctionDeclaration');
const functions = Object.fromEntries(declarations.map(n => [n.id.name, legacy.slice(n.start, n.end)]));
const source = names => names.map(name => {
  if (!functions[name]) throw Error('Missing preserved function: ' + name);
  return functions[name];
}).join('\n\n');

const staticNames = ['simplifyMainNavigation','replaceText','findCardByHeading','updateHomepageCommercialContent','addAlternativeWebsiteOptions','addPackageEnquiryOptions','updateWebsitePricingFaqs','addEnquiryNextSteps','updateContactAndSocialLinks','positionExpressAsUpgrade','acquisitionContext','withAcquisitionContext','addAcquisitionLinksAndNotice'];
const applyNames = staticNames.filter(n => !['replaceText','findCardByHeading','acquisitionContext','withAcquisitionContext'].includes(n));

// Extract existing style strings without invoking layout, networking or timers.
const cssDom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {runScripts:'outside-only'});
cssDom.window.eval(source(['installScrollFix','installCustomerJourneyStyles']) + '\ninstallScrollFix();installCustomerJourneyStyles();');
const messageStyle = functions.installMessageUsWidget.slice(0, functions.installMessageUsWidget.indexOf('    var widget =')) + '\n}';
cssDom.window.eval(messageStyle + '\ninstallMessageUsWidget();');
const enhancedCss = [...cssDom.window.document.querySelectorAll('style')].map(s => s.textContent).join('\n');
cssDom.window.close();
const baseCss = fs.readFileSync(path.join(root, 'assets/index-BBEjx44v-perf1.css'), 'utf8');
const preservedFaces = (baseCss.match(/@font-face\{[^}]+\}/g) || []).join('\n');
const displayCss = (baseCss.replace(/@font-face\{[^}]+\}/g, '') + '\n' + enhancedCss).replace(/Fraunces/g, '"Playfair Display"');
const playfairFaces = ['normal','italic'].map(style => `@font-face{font-family:"Playfair Display";font-style:${style};font-weight:400 900;font-display:swap;src:url("/fonts/playfair-display-latin-${style}.woff2") format("woff2")}`).join('\n');
const polish = fs.readFileSync('migration/static-polish.css', 'utf8');
const stylesheet=preservedFaces + '\n' + playfairFaces + '\n' + displayCss + '\n' + polish;
const stylesheetVersion=createHash('sha256').update(stylesheet).digest('hex').slice(0,12);
fs.writeFileSync(path.join(root, 'assets/site-sep13.css'),stylesheet);

const runtimeNames = ['installMessageUsWidget','installStaticOfferCookieConsent','acquisitionContext','withAcquisitionContext','getHashTarget','scrollToPageSection','encode','submitToNetlify','setButtonState','removeError','showError','showEnquiryConfirmation','showCompetitionConfirmation','showCompetitionClosed','handleEnquiry','handleCompetition','normaliseCanonicalPath'];
let runtime = source(runtimeNames);
runtime = runtime.replace(/    var style = document.createElement\("style"\);[\s\S]*?(?=    var widget =)/, '');
runtime = runtime.replace('    if (document.body.getAttribute("data-static-offer-page") !== "true") return;\n', '');
runtime = runtime.replace('<strong>Cookie choices</strong><p>We use essential cookies to make the website work. With your permission, we also use Google Analytics to understand how the website is used. Read our <a href="/privacy">privacy and cookie notice</a>.</p>', '<strong>Cookies on Set Up &amp; Seen</strong><p>We use privacy-limited Google Analytics to understand visits. Analytics cookies are optional and used only if you agree. <a href="/privacy">Privacy &amp; cookies</a>.</p>');
runtime = runtime.replace('>Essential only</button>', '>Reject analytics</button>');
runtime = runtime.replace('      form.innerHTML = initialMarkup;', '      form.innerHTML = initialMarkup;\n      updateEnquirySelection(form, "");');
// A newly opened banner must be measured after its text has wrapped on mobile.
runtime = runtime.replace('    updateCookieOffset();\n', '    updateCookieOffset();\n    if (document.fonts) document.fonts.ready.then(updateCookieOffset);\n');
const attribution = functions.addAcquisitionLinksAndNotice;
runtime += '\n\nfunction addAcquisitionContextNotice() {\n' + attribution.slice(attribution.indexOf('    var context = acquisitionContext();'), attribution.lastIndexOf('}')) + '\n}\n';
runtime += '\n' + fs.readFileSync('migration/static-interactions.js', 'utf8');
fs.writeFileSync(path.join(root, 'site-interactions-sep13.js'), '(function () {\n"use strict";\nvar competitionClosesAt = Date.parse("2026-09-30T22:59:00Z");\n' + runtime + '\n})();\n');

function files(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
let changed = 0;
for (const file of files(root).filter(f => f.endsWith('.html') && !f.endsWith('/404.html'))) {
  const old = fs.readFileSync(file,'utf8');
  const relative = path.relative(root,file).replaceAll(path.sep,'/');
  const route = '/' + relative.replace(/(^|\/)index\.html$/, '');
  const dom = new JSDOM(old,{url:'https://www.setupandseen.co.uk' + route,runScripts:'outside-only'});
  const {document} = dom.window;
  document.querySelectorAll('script').forEach(script => {
    if (script.id === '_R_' || script.textContent.includes('__VINEXT_')) script.remove();
    else if (script.getAttribute('src') === '/netlify-migration-v2.js') script.setAttribute('src','/site-interactions-sep13.js');
  });
  document.querySelectorAll('link[rel="modulepreload"]').forEach(e => e.remove());
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    if (/index-BBEjx44v|\/assets\/site-sep13\.css/.test(link.getAttribute('href'))) link.setAttribute('href','/assets/site-sep13.css?v='+stylesheetVersion);
    link.removeAttribute('data-precedence');link.removeAttribute('data-rsc-css-href');
  });
  dom.window.eval(source(staticNames) + '\n' + applyNames.map(n=>n+'();').join('\n'));

  // Preserve the existing choices when JavaScript is unavailable, too.
  const service = document.querySelector('form[name="enquiry"] select[name="service"]');
  if (service) {
    const choices = [...service.options].map(o=>o.value);
    document.querySelectorAll('a[href="#contact"]').forEach(link => {
      const card = link.closest('.price-card,.support-card');
      const heading = card?.querySelector('h3,h4')?.textContent.trim();
      let selected = choices.includes(heading) ? heading : '';
      if (/Enquire about Express/i.test(link.textContent)) selected = 'Express Website Set Up';
      if (/Request my free check/i.test(link.textContent)) selected = 'Free homepage health check';
      if (selected) link.setAttribute('data-enquiry-service',selected);
    });
  }

  const nav = document.querySelector('.site-header nav');
  if (nav) {
    nav.id = 'main-navigation';
    nav.setAttribute('aria-label','Main navigation');
    let button = document.querySelector('.site-header .menu-button');
    if (!button) {
      button = document.createElement('button');button.className='menu-button';
      button.innerHTML='<span></span><span></span>';
      nav.parentNode.insertBefore(button,nav);
    }
    button.type='button';button.setAttribute('aria-label','Open navigation menu');
    button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',nav.id);
  }

  const walker = document.createTreeWalker(document.body,dom.window.NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node=walker.currentNode;
    if (node.parentElement.closest('script,style')) continue;
    node.nodeValue=node.nodeValue.replace('Domain renewals, subscriptions, advertising spend and any applicable VAT will always be identified before you commit.', 'Domain renewals, subscriptions and advertising spend will always be identified before you commit. Set Up & Seen is not VAT registered, so VAT is not added to our prices.');
  }
  document.querySelectorAll('style').forEach(style=>{ style.textContent=style.textContent.replace(/Fraunces/g,'"Playfair Display"'); });
  // Keep the current wordmark and decorative brand lettering unchanged.
  document.querySelectorAll('.wordmark strong').forEach(e=>e.style.fontFamily='Fraunces, Georgia, serif');
  if (!document.querySelector('link[data-playfair-preload]')) {
    const font=document.createElement('link');font.rel='preload';font.href='/fonts/playfair-display-latin-normal.woff2';font.as='font';font.type='font/woff2';font.crossOrigin='anonymous';font.setAttribute('data-playfair-preload','');document.head.appendChild(font);
  }
  document.documentElement.setAttribute('data-static-content','2026-09-13');
  const result=dom.serialize();
  if(result!==old) {fs.writeFileSync(file,result);changed++;}
  dom.window.close();
}
// Supporting styles use the same approved display face.
const firstCss=path.join(root,'first-website-v1.css');
fs.writeFileSync(firstCss,fs.readFileSync(firstCss,'utf8').replace(/Fraunces/g,'"Playfair Display"'));
console.log(`Updated ${changed} saved HTML pages; content is available without a rendering runtime.`);
