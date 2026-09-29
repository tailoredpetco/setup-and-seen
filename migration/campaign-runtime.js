// Approved campaign attribution and confirmation behaviour, preserved across static builds.
function acquisitionContext() {
    var params = new URLSearchParams(window.location.search);
    var campaign = params.get("utm_source") === "researcher" && params.get("utm_medium") === "email" && params.get("utm_campaign") === "first_website";
    var metaCampaign = params.get("utm_source") === "facebook" && params.get("utm_medium") === "paid_social" && params.get("utm_campaign") === "october_website_petcare";
    var creative = metaCampaign && ["professional_feed", "professional_story"].indexOf(params.get("utm_content")) !== -1 ? params.get("utm_content") : "";
    var variant = metaCampaign && ["pet_care", "office_partner", "campers_vans"].indexOf(params.get("utm_term")) !== -1 ? params.get("utm_term") : "";
    var suggestion = params.get("finder") || "";
    if (["starter", "managed", "oneday", "express", "launch", "complete", "bespoke"].indexOf(suggestion) === -1) suggestion = "";
    return {campaign: campaign || metaCampaign, suggestion: suggestion, source: campaign ? "researcher" : metaCampaign ? "facebook" : "", medium: campaign ? "email" : metaCampaign ? "paid_social" : "", name: campaign ? "first_website" : metaCampaign ? "october_website_petcare" : "", reference: campaign ? "first_website_email" : metaCampaign ? "october_website_petcare" : "unattributed", creative: creative, variant: variant};
  }

function withAcquisitionContext(destination) {
    if (destination.origin !== window.location.origin) return destination;
    var context = acquisitionContext();
    if (context.campaign && !destination.searchParams.has("utm_source")) {
      destination.searchParams.set("utm_source", context.source);
      destination.searchParams.set("utm_medium", context.medium);
      destination.searchParams.set("utm_campaign", context.name);
      if (context.creative) destination.searchParams.set("utm_content", context.creative);
      if (context.variant) destination.searchParams.set("utm_term", context.variant);
    }
    if (context.suggestion && !destination.searchParams.has("finder")) destination.searchParams.set("finder", context.suggestion);
    return destination;
  }

function encode(form, formName) {
    var data = new FormData(form);
    data.set("form-name", formName);
    if (formName === "enquiry") {
      var context = acquisitionContext();
      var notes = [];
      if (context.campaign) notes.push("Campaign reference: " + context.source + " / " + context.medium + " / " + context.name);
      if (context.creative) notes.push("Ad creative: " + context.creative);
      if (context.variant) notes.push("Ad portfolio: " + context.variant);
      if (context.suggestion) notes.push("Package finder suggestion: " + context.suggestion);
      if (notes.length) data.set("message", String(data.get("message") || "") + "\n\n" + notes.join("\n"));
    }
    return new URLSearchParams(data).toString();
  }

function showEnquiryConfirmation(form) {
    var initialMarkup = form.innerHTML;
    form.reset();
    form.innerHTML =
      '<div class="enquiry-confirmation" role="status" tabindex="-1">' +
      '<span aria-hidden="true">✓</span>' +
      '<p class="eyebrow">Enquiry received</p>' +
      '<h3>Thank you. We have received your enquiry.</h3>' +
      '<p>We will email you to discuss what you need and confirm the scope, full costs and timescale. No payment has been taken.</p>' +
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
          window.gtag("event", "generate_lead", {form_name: "enquiry", campaign_reference: context.reference, ad_creative: context.creative || "none", ad_portfolio: context.variant || "none", package_suggestion: context.suggestion || "none"});
        }
      } catch (analyticsError) { /* Analytics must never block confirmation. */ }
      showEnquiryConfirmation(form);
      try {
        if (typeof window.setUpAndSeenTrackLead === "function") window.setUpAndSeenTrackLead();
      } catch (marketingError) { /* Tracking must never block a successful enquiry. */ }
    } catch (error) {
      setButtonState(form, false, "");
      showError(form, "error-message", "Sorry, your enquiry could not be sent. Please call us on 01384 492406.");
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
      if (context.name === "october_website_petcare" && destination.pathname === "/" && destination.hash === "#contact") destination.pathname = "/website-offer";
      destination = withAcquisitionContext(destination);
      link.href = destination.pathname + destination.search + destination.hash;
    });

  
}
