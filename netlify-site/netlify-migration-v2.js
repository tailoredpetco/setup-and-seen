(function () {
  "use strict";

  var competitionClosesAt = Date.parse("2026-09-30T22:59:00Z");

  function installScrollFix() {
    if (document.getElementById("set-up-and-seen-scroll-fix")) return;

    var style = document.createElement("style");
    style.id = "set-up-and-seen-scroll-fix";
    style.textContent =
      "html{scroll-behavior:auto!important;scroll-padding-top:108px}" +
      ".site-header{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;background:#f7f3ec!important}" +
      ".hero-browser{animation:none!important;will-change:auto!important}" +
      "@media (max-width:950px){" +
      "html{scroll-padding-top:94px}" +
      ".site-header nav.open{height:calc(100vh - 82px);height:calc(100dvh - 82px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}" +
      "}" +
      "@media (max-width:700px){.hero-copy:after{content:none!important}}" +
      "@media (hover:none){nav a:hover{border-color:transparent}}" +
      "@media (prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}";
    document.head.appendChild(style);
  }

  function disableLegacyRoutePrefetch() {
    // The preserved Vinext bundle tries to prefetch Sites-only .rsc routes.
    // Netlify serves ordinary static routes, so these requests add work and
    // create avoidable 404 errors without improving navigation.
    try {
      Object.defineProperty(window, "__VINEXT_LINK_PREFETCH_ROUTES__", {
        configurable: true,
        get: function () {
          return null;
        },
        set: function () {},
      });
    } catch (error) {
      window.__VINEXT_LINK_PREFETCH_ROUTES__ = null;
    }
  }

  function installMobileMenuGuard() {
    var navigation = document.querySelector(".site-header nav");
    if (!navigation) return;
    var menuButton = document.querySelector(".site-header .menu-button");

    function releaseMenuAndScroll() {
      navigation.classList.remove("open");
      document.documentElement.classList.remove("set-up-and-seen-menu-open");
      if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    }

    function syncMenuState() {
      var mobileMenuIsOpen =
        navigation.classList.contains("open") && window.matchMedia("(max-width: 950px)").matches;
      document.documentElement.classList.toggle("set-up-and-seen-menu-open", mobileMenuIsOpen);
    }

    new MutationObserver(syncMenuState).observe(navigation, {
      attributes: true,
      attributeFilter: ["class"],
    });
    navigation.addEventListener(
      "click",
      function (event) {
        if (!(event.target instanceof Element) || !event.target.closest("a[href]")) return;

        // Release the menu before moving to the selected section. On iOS,
        // leaving an overflow lock in place during hash navigation can keep
        // the page frozen even after the menu has visually closed.
        releaseMenuAndScroll();
        window.setTimeout(releaseMenuAndScroll, 0);
      },
      true
    );
    window.addEventListener("hashchange", releaseMenuAndScroll);
    window.addEventListener("pageshow", releaseMenuAndScroll);
    window.addEventListener("resize", syncMenuState);
    syncMenuState();
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
      '<h3>Thank you — we’ve received your enquiry and will be in touch shortly.</h3>' +
      '<button class="text-button" type="button" data-send-another-enquiry>Send another enquiry</button>' +
      "</div>";

    var confirmation = form.querySelector(".enquiry-confirmation");
    confirmation.focus();
    window.history.replaceState({}, "", window.location.pathname + "#contact");

    form.querySelector("[data-send-another-enquiry]").addEventListener("click", function () {
      form.innerHTML = initialMarkup;
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

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      if (form.matches('form[name="enquiry"]')) {
        handleEnquiry(event, form);
      } else if (form.matches("form.draw-form")) {
        handleCompetition(event, form);
      }
    },
    true
  );

  // The preserved ChatGPT Sites bundle contains its original client router.
  // On Netlify, use ordinary same-origin navigation so links request the exact
  // published path and do not attempt a Sites-only RSC transition.
  document.addEventListener(
    "click",
    function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      if (!(event.target instanceof Element)) return;
      var link = event.target.closest("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      var rawHref = link.getAttribute("href");
      if (!rawHref) return;

      if (rawHref.charAt(0) === "#") {
        if (!getHashTarget(rawHref)) return;

        // Prevent the preserved client router and iOS hover state from making
        // same-page links feel delayed or require a second tap. Let the link's
        // own React handler continue so an open mobile menu closes normally.
        event.preventDefault();
        window.setTimeout(function () {
          scrollToPageSection(rawHref, true);
        }, 0);
        return;
      }

      var destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(rawHref);
    },
    true
  );

  function normaliseCanonicalPath() {
    if (window.location.pathname.length > 1 && window.location.pathname.endsWith("/")) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname.slice(0, -1) + window.location.search + window.location.hash
      );
    }
  }

  disableLegacyRoutePrefetch();
  installScrollFix();

  document.addEventListener("DOMContentLoaded", function () {
    normaliseCanonicalPath();
    installMobileMenuGuard();
    window.setTimeout(normaliseCanonicalPath, 250);
    window.setTimeout(normaliseCanonicalPath, 1000);

    if (window.location.hash) {
      window.setTimeout(function () {
        scrollToPageSection(window.location.hash, false);
      }, 0);
    }

    var competitionForm = document.querySelector("form.draw-form");
    if (competitionForm && Date.now() > competitionClosesAt) {
      showCompetitionClosed(competitionForm);
    }
  });

  window.addEventListener("load", normaliseCanonicalPath);
})();
