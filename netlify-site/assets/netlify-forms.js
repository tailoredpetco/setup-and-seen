(function () {
  "use strict";

  var competitionClosesAt = Date.parse("2026-09-30T22:59:00Z");

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
      '<h3>Thank you. Your message is safely with us.</h3>' +
      '<p>We will review your enquiry and contact you as soon as possible. A confirmation email has also been requested for the address you supplied.</p>' +
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
      if (!rawHref || rawHref.charAt(0) === "#") return;

      var destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(rawHref);
    },
    true
  );

  document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.length > 1 && window.location.pathname.endsWith("/")) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname.slice(0, -1) + window.location.search + window.location.hash
      );
    }

    var competitionForm = document.querySelector("form.draw-form");
    if (competitionForm && Date.now() > competitionClosesAt) {
      showCompetitionClosed(competitionForm);
    }
  });
})();
