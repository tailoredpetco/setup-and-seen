(function () {
"use strict";
var competitionClosesAt = Date.parse("2026-09-30T22:59:00Z");
function installMessageUsWidget() {
    if (document.getElementById("message-us-widget")) return;

    var widget = document.createElement("div");
    widget.id = "message-us-widget";
    widget.className = "message-us-widget";
    widget.innerHTML =
      '<div class="message-us-panel" id="message-us-panel" role="dialog" aria-modal="false" aria-labelledby="message-us-title" hidden>' +
      '<h2 id="message-us-title">Message us</h2>' +
      '<p>Choose WhatsApp or email.</p>' +
      '<div class="message-us-options">' +
      '<a class="message-us-option" href="https://wa.me/447999071045" target="_blank" rel="noreferrer noopener" aria-label="WhatsApp us – opens in a new tab"><span>WhatsApp us</span><span aria-hidden="true">↗</span></a>' +
      '<a class="message-us-option" href="mailto:info@setupandseen.co.uk" aria-label="Email us at info@setupandseen.co.uk"><span>Email us</span><span aria-hidden="true">→</span></a>' +
      '</div>' +
      '<button class="message-us-close" type="button" aria-label="Close message options">×</button>' +
      '</div>' +
      '<button class="message-us-trigger" type="button" aria-expanded="false" aria-controls="message-us-panel" aria-haspopup="dialog">' +
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M20 11.4a7.6 7.6 0 0 1-8 7.6 9.2 9.2 0 0 1-3.4-.7L4 20l1.6-4.1A7.6 7.6 0 1 1 20 11.4Z" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke-width="2.4" stroke-linecap="round"/></svg>' +
      '<span>Message us</span>' +
      '</button>';
    document.body.appendChild(widget);

    var panel = widget.querySelector(".message-us-panel");
    var trigger = widget.querySelector(".message-us-trigger");
    var closeButton = widget.querySelector(".message-us-close");
    var firstOption = widget.querySelector(".message-us-option");
    var returnFocus = false;

    function closePanel(restoreFocus) {
      if (panel.hidden) return;
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (restoreFocus) trigger.focus();
    }

    function openPanel() {
      panel.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      firstOption.focus();
    }

    trigger.addEventListener("click", function () {
      if (panel.hidden) openPanel();
      else closePanel(true);
    });
    closeButton.addEventListener("click", function () {
      closePanel(true);
    });
    widget.addEventListener("click", function (event) {
      if (event.target instanceof Element && event.target.closest(".message-us-option")) {
        closePanel(false);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        closePanel(true);
      }
    });
    document.addEventListener("pointerdown", function (event) {
      if (!panel.hidden && event.target instanceof Node && !widget.contains(event.target)) {
        returnFocus = document.activeElement && panel.contains(document.activeElement);
        closePanel(false);
        if (returnFocus) trigger.focus();
      }
    });

    function updateCookieOffset() {
      var banner = document.querySelector(".cookie-banner");
      var offset = 0;
      if (banner) {
        offset = Math.max(0, Math.ceil(window.innerHeight - banner.getBoundingClientRect().top + 10));
      }
      widget.style.setProperty("--message-cookie-offset", offset + "px");
    }

    var cookieObserver = new MutationObserver(updateCookieOffset);
    cookieObserver.observe(document.body, { childList: true, subtree: false });
    window.addEventListener("resize", updateCookieOffset);
    updateCookieOffset();
    if (document.fonts) document.fonts.ready.then(updateCookieOffset);

    var forms = document.querySelectorAll("form");
    if (forms.length && "IntersectionObserver" in window) {
      var visibleForms = new Set();
      var formObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) visibleForms.add(entry.target);
            else visibleForms.delete(entry.target);
          });
          widget.classList.toggle("message-us-form-visible", visibleForms.size > 0);
          if (visibleForms.size > 0) closePanel(false);
        },
        { threshold: 0.08 }
      );
      Array.prototype.forEach.call(forms, function (form) {
        formObserver.observe(form);
      });
    }
  }

function installStaticOfferCookieConsent() {
    var settingsButton = document.querySelector(".cookie-settings");
    if (!settingsButton || settingsButton.dataset.staticConsentBound === "true") return;
    settingsButton.dataset.staticConsentBound = "true";

    function updateAnalytics(granted) {
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
      }
    }

    function saveChoice(choice) {
      try {
        window.localStorage.setItem("setup-and-seen-cookie-consent", choice);
      } catch (error) {}
      updateAnalytics(choice === "accepted");
    }

    function showBanner() {
      var existing = document.querySelector(".cookie-banner");
      if (existing) existing.remove();

      var banner = document.createElement("div");
      banner.className = "cookie-banner";
      banner.setAttribute("role", "dialog");
      banner.setAttribute("aria-label", "Cookie choices");
      banner.innerHTML =
        '<div><strong>Cookies on Set Up &amp; Seen</strong><p>We use privacy-limited Google Analytics to understand visits. Analytics cookies are optional and used only if you agree. <a href="/privacy">Privacy &amp; cookies</a>.</p></div>' +
        '<div class="cookie-actions"><button type="button" class="cookie-reject">Reject analytics</button><button type="button" class="cookie-accept">Accept analytics</button></div>';
      document.body.appendChild(banner);
      settingsButton.setAttribute("aria-expanded", "true");

      banner.querySelector(".cookie-reject").addEventListener("click", function () {
        saveChoice("rejected");
        banner.remove();
        settingsButton.setAttribute("aria-expanded", "false");
      });
      banner.querySelector(".cookie-accept").addEventListener("click", function () {
        saveChoice("accepted");
        banner.remove();
        settingsButton.setAttribute("aria-expanded", "false");
      });
    }

    settingsButton.addEventListener("click", showBanner);
    var storedChoice = "";
    try {
      storedChoice = window.localStorage.getItem("setup-and-seen-cookie-consent") || "";
    } catch (error) {}
    if (!storedChoice) showBanner();
  }

function acquisitionContext() {
    var params = new URLSearchParams(window.location.search);
    var campaign = params.get("utm_source") === "researcher" && params.get("utm_medium") === "email" && params.get("utm_campaign") === "first_website";
    var suggestion = params.get("finder") || "";
    if (["starter", "managed", "oneday", "express", "launch", "complete", "bespoke"].indexOf(suggestion) === -1) suggestion = "";
    return {campaign: campaign, suggestion: suggestion};
  }

function withAcquisitionContext(destination) {
    if (destination.origin !== window.location.origin) return destination;
    var context = acquisitionContext();
    if (context.campaign && !destination.searchParams.has("utm_source")) {
      destination.searchParams.set("utm_source", "researcher");
      destination.searchParams.set("utm_medium", "email");
      destination.searchParams.set("utm_campaign", "first_website");
    }
    if (context.suggestion && !destination.searchParams.has("finder")) destination.searchParams.set("finder", context.suggestion);
    return destination;
  }

function getHashTarget(hash) {
    if (!hash || hash.charAt(0) !== "#") return null;

    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (error) {
      return null;
    }
  }

function scrollToPageSection(hash, updateHistory) {
    var target = getHashTarget(hash);
    if (!target) return;

    var header = document.querySelector(".site-header");
    var headerHeight = header ? header.getBoundingClientRect().height : 0;
    var targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

    if (hash === "#top" || hash === "#main-content") targetTop = 0;

    window.scrollTo({
      top: Math.max(0, targetTop),
      left: 0,
      behavior: "auto",
    });

    if (updateHistory && window.location.hash !== hash) {
      window.history.pushState({}, "", window.location.pathname + window.location.search + hash);
    }
  }

function encode(form, formName) {
    var data = new FormData(form);
    data.set("form-name", formName);
    if (formName === "enquiry") {
      var context = acquisitionContext();
      var notes = [];
      if (context.campaign) notes.push("Campaign reference: researcher / email / first_website");
      if (context.suggestion) notes.push("Package finder suggestion: " + context.suggestion);
      if (notes.length) data.set("message", String(data.get("message") || "") + "\n\n" + notes.join("\n"));
    }
    return new URLSearchParams(data).toString();
  }

async function submitToNetlify(form, formName, endpoint) {
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode(form, formName),
    });
  }

function setButtonState(form, sending, sendingLabel) {
    var button = form.querySelector('button[type="submit"]');
    if (!button) return;

    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.innerHTML;
    }

    button.disabled = sending;
    button.innerHTML = sending ? sendingLabel : button.dataset.originalLabel;
  }

function removeError(form, className) {
    var error = form.querySelector("." + className + '[data-netlify-form-error="true"]');
    if (error) error.remove();
  }

function showError(form, className, message) {
    removeError(form, className);
    var error = document.createElement("p");
    error.className = className;
    error.dataset.netlifyFormError = "true";
    error.setAttribute("role", "alert");
    error.textContent = message;
    form.appendChild(error);
    error.focus();
  }

function showEnquiryConfirmation(form) {
    var initialMarkup = form.innerHTML;
    form.reset();
    form.innerHTML =
      '<div class="enquiry-confirmation" role="status" tabindex="-1">' +
      '<span aria-hidden="true">✓</span>' +
      '<p class="eyebrow">Enquiry received</p>' +
      '<h3>Thank you. We have received your enquiry and will be in touch shortly.</h3>' +
      '<button class="text-button" type="button" data-send-another-enquiry>Send another enquiry</button>' +
      "</div>";

    var confirmation = form.querySelector(".enquiry-confirmation");
    confirmation.focus();
    window.history.replaceState({}, "", window.location.pathname + "#contact");

    form.querySelector("[data-send-another-enquiry]").addEventListener("click", function () {
      form.innerHTML = initialMarkup;
      updateEnquirySelection(form, "");
      var firstField = form.querySelector('input[name="name"]');
      if (firstField) firstField.focus();
    });
  }

function showCompetitionConfirmation(form) {
    form.reset();
    form.innerHTML =
      '<div class="draw-confirmation" role="status" tabindex="-1">' +
      '<span aria-hidden="true">✓</span>' +
      '<p class="eyebrow">Entry received</p>' +
      '<h3>You are in the draw.</h3>' +
      '<p>Thank you for entering. We will contact the selected winner using the details supplied after entries close on 30 September 2026.</p>' +
      '<a href="/">Return to the Set Up &amp; Seen website</a>' +
      "</div>";
    form.querySelector(".draw-confirmation").focus();
  }

function showCompetitionClosed(form) {
    form.innerHTML =
      '<div class="draw-closed" role="status">' +
      "<strong>Entries are now closed.</strong>" +
      '<p>The Website Starter Prize Draw closed at 11:59pm UK time on 30 September 2026. Thank you to everyone who entered.</p>' +
      "</div>";
  }

async function handleEnquiry(event, form) {
    event.preventDefault();
    event.stopImmediatePropagation();
    removeError(form, "error-message");

    if (!form.reportValidity()) return;

    setButtonState(form, true, "Sending your enquiry…");
    try {
      var response = await submitToNetlify(form, "enquiry", "/");
      if (!response.ok) throw new Error("Netlify Forms rejected the enquiry");
      // Count only a successful enquiry, and only after analytics consent.
      try {
        if (window.localStorage.getItem("setup-and-seen-cookie-consent") === "accepted" && typeof window.gtag === "function") {
          var context = acquisitionContext();
          window.gtag("event", "generate_lead", {form_name: "enquiry", campaign_reference: context.campaign ? "first_website_email" : "unattributed", package_suggestion: context.suggestion || "none"});
        }
      } catch (analyticsError) { /* Analytics must never block confirmation. */ }
      showEnquiryConfirmation(form);
    } catch (error) {
      setButtonState(form, false, "");
      showError(form, "error-message", "Sorry, your enquiry could not be sent. Please call us on 01384 492406.");
    }
  }

async function handleCompetition(event, form) {
    event.preventDefault();
    event.stopImmediatePropagation();
    removeError(form, "draw-error");

    if (Date.now() > competitionClosesAt) {
      showCompetitionClosed(form);
      return;
    }

    if (!form.reportValidity()) return;

    setButtonState(form, true, "Sending your entry…");
    try {
      var response = await submitToNetlify(form, "website-starter-prize-draw-2026", "/competition");
      if (!response.ok) throw new Error("Netlify Forms rejected the competition entry");
      showCompetitionConfirmation(form);
    } catch (error) {
      setButtonState(form, false, "");
      showError(form, "draw-error", "We could not receive your entry. Please try again or email info@setupandseen.co.uk.");
    }
  }

function normaliseCanonicalPath() {
    if (window.location.pathname.length > 1 && window.location.pathname.endsWith("/")) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname.slice(0, -1) + window.location.search + window.location.hash
      );
    }
  }

function addAcquisitionContextNotice() {
    var context = acquisitionContext();
    if (!context.campaign && !context.suggestion) return;
    Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (link) {
      var raw = link.getAttribute("href");
      if (!raw || raw.charAt(0) === "#" || link.hasAttribute("download")) return;
      var destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      destination = withAcquisitionContext(destination);
      link.href = destination.pathname + destination.search + destination.hash;
    });
    var form = document.querySelector('form[name="enquiry"]');
    if (form && !form.querySelector("[data-enquiry-context-note]")) {
      var note = document.createElement("small");
      note.setAttribute("data-enquiry-context-note", "true");
      note.className = "form-note";
      note.textContent = "Your package suggestion and any campaign reference in this link are included with your enquiry.";
      form.appendChild(note);
    }
  
}

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

})();
