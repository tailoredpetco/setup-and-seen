// Native interactions for the saved HTML pages. The migration script combines
// these with the existing, unchanged Netlify submission and attribution helpers.
function installNativeMenu() {
  var nav = document.querySelector('.site-header nav');
  var button = document.querySelector('.site-header .menu-button');
  if (!nav || !button) return;
  function close(restoreFocus) {
    nav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation menu');
    document.documentElement.classList.remove('set-up-and-seen-menu-open');
    if (restoreFocus) button.focus();
  }
  button.addEventListener('click', function () {
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.documentElement.classList.toggle('set-up-and-seen-menu-open', open);
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a[href]')) close(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) close(true);
  });
  document.addEventListener('pointerdown', function (event) {
    if (!nav.contains(event.target) && !button.contains(event.target)) close(false);
  });
  window.addEventListener('pageshow', function () { close(false); });
  window.addEventListener('resize', function () {
    if (!window.matchMedia('(max-width:950px)').matches) close(false);
  });
}

function updateEnquirySelection(form, value) {
  var select = form.querySelector('select[name="service"]');
  if (!select) return;
  if (value === 'Set Up & Seen') value = 'Set Up & Seen Complete';
  if (value && Array.prototype.some.call(select.options, function (option) { return option.value === value; })) select.value = value;
  var packages = {
    'Website Starter': ['From £495', 'Usually completed in 2–4 weeks'],
    'Express Website Set Up': ['£999', 'Live within five working days once everything required is ready'],
    'Business Launch': ['From £1,595', 'A clear project schedule is agreed with you'],
    'Set Up & Seen Complete': ['From £2,295', 'A staged project schedule is agreed with you'],
    'One-Day Website': ['£495', 'One booked working day once everything required is ready'],
    'Managed Website Starter': ['£149 a month for 12 months (£1,788 total)', 'Hosting and care included during the plan']
  };
  var old = form.querySelector('.selected-package');
  if (old) old.remove();
  var detail = packages[select.value];
  if (detail) {
    var panel = document.createElement('div');
    panel.className = 'selected-package';
    panel.setAttribute('role', 'status');
    [['small', 'YOUR SELECTED PACKAGE'], ['strong', select.value], ['span', detail.join(' · ')], ['p', 'No payment is taken today. We will confirm the final scope, price and timescale in writing before you commit.']].forEach(function (item) {
      var element = document.createElement(item[0]); element.textContent = item[1]; panel.appendChild(element);
    });
    form.insertBefore(panel, form.querySelector('label'));
  }
  var submit = form.querySelector('button[type="submit"]');
  if (submit) {
    submit.innerHTML = (detail ? 'Request this package' : 'Send my enquiry') + ' <span aria-hidden="true">↗</span>';
    delete submit.dataset.originalLabel;
  }
}

function installEnquirySelection() {
  var form = document.querySelector('form[name="enquiry"]');
  if (!form) return;
  var params = new URLSearchParams(window.location.search);
  updateEnquirySelection(form, params.get('service') || params.get('package'));
  form.addEventListener('change', function (event) {
    if (event.target.name === 'service') updateEnquirySelection(form, event.target.value);
  });
  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-enquiry-service]');
    if (link) updateEnquirySelection(form, link.getAttribute('data-enquiry-service'));
  });
  if (params.get('form') === 'error') showError(form, 'error-message', 'Sorry, your enquiry could not be sent. Please call us on 01384 492406.');
}

function initialiseStaticPage() {
  document.documentElement.classList.add('site-interactive');
  normaliseCanonicalPath();
  installNativeMenu();
  installStaticOfferCookieConsent();
  installMessageUsWidget();
  installEnquirySelection();
  addAcquisitionContextNotice();
  var competitionForm = document.querySelector('form.draw-form');
  if (competitionForm && Date.now() > competitionClosesAt) showCompetitionClosed(competitionForm);
  // The page and all its content already exist. Only adjust a requested anchor
  // for the sticky header after styles and local fonts have settled.
  if (window.location.hash) {
    var scroll = function () { scrollToPageSection(window.location.hash, false); };
    if (document.fonts) document.fonts.ready.then(scroll);
    else scroll();
  }
}

document.addEventListener('submit', function (event) {
  var form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.matches('form[name="enquiry"]')) handleEnquiry(event, form);
  else if (form.matches('form.draw-form')) handleCompetition(event, form);
}, true);

document.addEventListener('click', function (event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  var link = event.target instanceof Element && event.target.closest('a[href]');
  if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
  var destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin) return;
  if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash && getHashTarget(destination.hash)) {
    event.preventDefault();
    scrollToPageSection(destination.hash, true);
    // A selected mobile link must release the navigation before scrolling.
    var nav = document.querySelector('.site-header nav');
    if (nav) nav.classList.remove('open');
    document.documentElement.classList.remove('set-up-and-seen-menu-open');
    var button = document.querySelector('.menu-button');
    if (button) { button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Open navigation menu'); }
    return;
  }
  var context = acquisitionContext();
  if (context.campaign || context.suggestion) {
    var attributed = withAcquisitionContext(destination);
    link.href = attributed.pathname + attributed.search + attributed.hash;
  }
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseStaticPage, {once:true});
else initialiseStaticPage();
