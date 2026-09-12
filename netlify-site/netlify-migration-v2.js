(function () {
  "use strict";

  var competitionClosesAt = Date.parse("2026-09-30T22:59:00Z");

  function installScrollFix() {
    if (document.getElementById("set-up-and-seen-scroll-fix")) return;

    var style = document.createElement("style");
    style.id = "set-up-and-seen-scroll-fix";
    style.textContent =
      ".hero-copy .package-finder-home-button{background:#315f8c!important;color:#fff!important;border:2px solid #315f8c;white-space:normal;min-height:52px;max-width:100%;text-align:center}" +
      ".hero-copy .package-finder-home-button:hover{background:#23486b!important;border-color:#23486b}" +
      ".hero-copy .package-finder-home-button:focus-visible{outline:3px solid #202522;outline-offset:4px}" +
      "[data-finder-home-note]{font-size:14px!important;line-height:1.65;max-width:540px;margin:18px 0 24px;color:#555852}" +
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

  function simplifyMainNavigation() {
    var navigation = document.querySelector(".site-header nav");
    if (!navigation) return;

    Array.prototype.forEach.call(navigation.querySelectorAll("a"), function (link) {
      var label = link.textContent.trim().toLowerCase();

      if (label === "how it works" || label === "win a website" || label === "faqs") {
        link.remove();
        return;
      }

      if (label === "pricing") {
        link.textContent = "Packages";
        link.setAttribute("href", "/packages");
      } else if (label === "let’s talk" || label === "let's talk") {
        link.textContent = "Contact";
      }
    });
  }

  function installCustomerJourneyStyles() {
    if (document.getElementById("customer-journey-styles")) return;
    var style = document.createElement("style");
    style.id = "customer-journey-styles";
    style.textContent =
      ".contact-next-steps{display:grid;gap:10px;margin:26px 0 30px;padding:0;list-style:none}" +
      ".contact-next-steps li{display:grid;grid-template-columns:34px 1fr;align-items:center;gap:12px;color:#202522}" +
      ".contact-next-steps span{display:grid;width:34px;height:34px;place-items:center;border:1px solid #315f8c;border-radius:50%;color:#315f8c;font-size:13px;font-weight:700}" +
      ".contact-next-steps strong{font-size:15px;line-height:1.4}" +
      ".express-priority-upgrade{border-color:#315f8c}" +
      ".express-priority-upgrade .package-detail-intro>small{color:#315f8c;font-weight:700}" +
      ".launch-choice-section{margin-top:52px}" +
      ".launch-choice-page{margin-top:0;background:#edf0ed}" +
      ".launch-choice-heading{max-width:760px;margin-bottom:30px}" +
      ".launch-choice-heading h2{letter-spacing:-.04em;margin-bottom:18px;font-family:Fraunces,serif;font-size:clamp(38px,4vw,58px);font-weight:500;line-height:1.05}" +
      ".launch-choice-heading>p:last-child{color:#555852;margin:0;line-height:1.7}" +
      ".launch-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}" +
      ".launch-choice-card{border:1px solid #ded8ce;background:#fdfcf9;padding:32px;display:flex;flex-direction:column;min-height:100%}" +
      ".launch-choice-card>small{color:#315f8c;letter-spacing:.12em;text-transform:uppercase;font-size:10px;font-weight:800}" +
      ".launch-choice-card h3{margin:14px 0 13px;font-family:Fraunces,serif;font-size:32px;font-weight:500;line-height:1.05}" +
      ".launch-choice-card>p{color:#555852;line-height:1.65}" +
      ".launch-choice-price{display:flex;align-items:baseline;gap:10px;margin:7px 0 17px}" +
      ".launch-choice-price strong{color:#315f8c;font-family:Fraunces,serif;font-size:43px;font-weight:500}" +
      ".launch-choice-price span{color:#667064;font-size:12px;font-weight:700}" +
      ".launch-choice-card ul{display:grid;gap:10px;margin:0 0 24px;padding:0;list-style:none}" +
      ".launch-choice-card li{padding-left:22px;font-size:14px;line-height:1.5;position:relative}" +
      ".launch-choice-card li:before{content:'✓';color:#315f8c;font-weight:800;position:absolute;left:0}" +
      ".launch-choice-card .text-link{align-self:flex-start;margin-top:auto}" +
      ".launch-choice-total{margin:-6px 0 20px!important;font-size:12px!important;font-weight:700}" +
      "@media(max-width:700px){.contact-next-steps{margin:22px 0 26px}.contact-next-steps strong{font-size:14px}.launch-choice-section{margin-top:40px}.launch-choice-page{margin-top:0}.launch-choice-grid{grid-template-columns:1fr}.launch-choice-card{padding:27px 23px}.launch-choice-card h3{font-size:29px}}";
    document.head.appendChild(style);
  }

  function installMessageUsWidget() {
    if (document.getElementById("message-us-widget")) return;

    var style = document.createElement("style");
    style.id = "message-us-widget-styles";
    style.textContent =
      ".message-us-widget{--message-cookie-offset:0px;position:fixed;right:20px;bottom:calc(20px + env(safe-area-inset-bottom,0px) + var(--message-cookie-offset));z-index:998;display:flex;flex-direction:column;align-items:flex-end;gap:11px;font-family:'DM Sans',Arial,sans-serif;transition:bottom .18s ease,opacity .18s ease,visibility .18s ease}" +
      ".message-us-trigger{min-height:50px;border:1px solid #315f8c;border-radius:999px;background:#315f8c;color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:0 18px;cursor:pointer;font-size:14px;font-weight:700;line-height:1;box-shadow:0 9px 26px #071b2d2e;transition:background .18s ease,transform .18s ease,box-shadow .18s ease}" +
      ".message-us-trigger:hover{background:#284f76;transform:translateY(-1px);box-shadow:0 11px 30px #071b2d38}" +
      ".message-us-trigger svg{width:20px;height:20px;flex:none;stroke:currentColor}" +
      ".message-us-panel{position:relative;width:min(310px,calc(100vw - 40px));border:1px solid #ded8ce;border-radius:4px;background:#fdfcf9;color:#202522;padding:22px;box-shadow:0 18px 48px #071b2d2b;transform-origin:bottom right}" +
      ".message-us-panel h2{margin:0 34px 7px 0;font-family:Fraunces,serif;font-size:24px;font-weight:500;line-height:1.1;letter-spacing:-.025em}" +
      ".message-us-panel>p{margin:0 0 17px;color:#555852;font-size:13px;line-height:1.5}" +
      ".message-us-options{display:grid;gap:9px}" +
      ".message-us-option{min-height:49px;border:1px solid #ded8ce;border-radius:2px;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;color:#202522;font-size:14px;font-weight:700;line-height:1.2;transition:border-color .15s ease,background .15s ease}" +
      ".message-us-option:hover{border-color:#315f8c;background:#f2f6f9}" +
      ".message-us-option span:last-child{color:#315f8c;font-size:18px;font-weight:500}" +
      ".message-us-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:#202522;display:grid;place-items:center;cursor:pointer;font-size:24px;line-height:1}" +
      ".message-us-close:hover{background:#edf0ed}" +
      ".message-us-trigger:focus-visible,.message-us-panel a:focus-visible,.message-us-close:focus-visible{outline:3px solid #075a9c;outline-offset:3px;box-shadow:0 0 0 6px #fff}" +
      "html.set-up-and-seen-menu-open .message-us-widget,.message-us-widget.message-us-form-visible{opacity:0;visibility:hidden;pointer-events:none}" +
      "@media(max-width:700px){.message-us-widget{right:12px;bottom:calc(14px + env(safe-area-inset-bottom,0px) + var(--message-cookie-offset))}.message-us-trigger{min-height:48px;padding:0 15px;font-size:13px}.message-us-panel{width:min(306px,calc(100vw - 24px));padding:20px}.message-us-panel h2{font-size:22px}}" +
      "@media(prefers-reduced-motion:reduce){.message-us-widget,.message-us-trigger,.message-us-option{transition:none!important}}";
    document.head.appendChild(style);

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

  function addEnquiryNextSteps() {
    var contactIntro = document.querySelector(".contact-intro");
    if (!contactIntro || document.getElementById("enquiry-next-steps")) return;

    var directContact = contactIntro.querySelector(".direct-contact");
    if (!directContact) return;

    var steps = document.createElement("ol");
    steps.id = "enquiry-next-steps";
    steps.className = "contact-next-steps";
    steps.setAttribute("aria-label", "What happens after you enquire");
    steps.innerHTML =
      "<li><span>1</span><strong>We read your enquiry</strong></li>" +
      "<li><span>2</span><strong>We arrange a friendly, no-pressure conversation</strong></li>" +
      "<li><span>3</span><strong>You receive a clear recommendation, scope and price</strong></li>";
    directContact.parentNode.insertBefore(steps, directContact);
  }

  function addAlternativeWebsiteOptions() {
    var path = window.location.pathname;
    var isHomepage = path === "/" || path === "/index.html";
    var isPackagesPage = path === "/packages" || path === "/packages/index.html";
    if ((!isHomepage && !isPackagesPage) || document.getElementById("alternative-website-options")) return;

    var section = document.createElement("section");
    section.id = "alternative-website-options";
    section.className = "launch-choice-section" + (isPackagesPage ? " launch-choice-page section-pad" : "");
    section.setAttribute("aria-labelledby", "alternative-website-options-title");
    section.innerHTML =
      '<div class="launch-choice-heading">' +
      '<p class="eyebrow">More ways to get online</p>' +
      '<h2 id="alternative-website-options-title">Choose speed or spread the cost.</h2>' +
      '<p>These options keep the scope clear while giving new businesses a practical choice around timing and cash flow.</p>' +
      '</div>' +
      '<div class="launch-choice-grid">' +
      '<article class="launch-choice-card">' +
      '<small>Designed in one working day</small>' +
      '<h3>One-Day Website</h3>' +
      '<p>A focused one-page business website for customers who need a professional presence without the usual wait.</p>' +
      '<div class="launch-choice-price"><strong>£495</strong><span>one-off project</span></div>' +
      '<ul><li>One scrolling page with up to six sections</li><li>Mobile-friendly design and enquiry form</li><li>Ready to launch within one booked working day</li></ul>' +
      '<a class="text-link" href="/services/one-day-website">See the One-Day Website <span>→</span></a>' +
      '</article>' +
      '<article class="launch-choice-card">' +
      '<small>No large upfront build cost</small>' +
      '<h3>Managed Website Starter</h3>' +
      '<p>A professionally managed five-page website with the cost spread across a clear 12-month agreement.</p>' +
      '<div class="launch-choice-price"><strong>£149</strong><span>a month for 12 months</span></div>' +
      '<p class="launch-choice-total">Total payable £1,788. Managed hosting and care included during the plan.</p>' +
      '<ul><li>Five-page mobile-friendly website</li><li>One standard .co.uk domain</li><li>One small content update each month</li></ul>' +
      '<a class="text-link" href="/services/managed-website-starter">See the monthly plan <span>→</span></a>' +
      '</article>' +
      '</div>';

    if (isHomepage) {
      var expressUpgrade = document.querySelector(".express-upgrade");
      if (expressUpgrade && expressUpgrade.parentNode) {
        expressUpgrade.parentNode.insertBefore(section, expressUpgrade.nextSibling);
      }
    } else {
      var packageDetails = document.querySelector(".package-details");
      if (packageDetails && packageDetails.parentNode) {
        packageDetails.parentNode.insertBefore(section, packageDetails);
      }
    }
  }

  function addPackageEnquiryOptions() {
    var select = document.querySelector('form[name="enquiry"] select[name="service"]');
    if (!select) return;

    var group = select.querySelector('optgroup[label="Website and launch packages"]');
    if (!group) return;

    ["One-Day Website", "Managed Website Starter"].forEach(function (label) {
      if (group.querySelector('option[value="' + label + '"]')) return;
      var option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      group.appendChild(option);
    });

    var params = new URLSearchParams(window.location.search);
    var requestedService = params.get("service") || params.get("package");
    if (requestedService && Array.prototype.some.call(select.options, function (option) {
      return option.value === requestedService;
    })) {
      select.value = requestedService;
    }
  }

  function updateWebsitePricingFaqs() {
    Array.prototype.forEach.call(document.querySelectorAll("details"), function (item) {
      var summary = item.querySelector("summary");
      var answer = item.querySelector("p");
      const question = summary ? summary.textContent.toLowerCase().replace(/-/g, " ") : "";
      if (!summary || !answer || question.indexOf("how much does a small business website cost") === -1) return;

      answer.textContent = "Website Starter begins at £495 for up to five pages, normally completed in 2–4 weeks. The One-Day Website is £495 for one page within a booked working day once everything is ready. Express Website Set Up is £999 for a priority build of up to five pages. Managed Website Starter is £149 a month for 12 months (£1,788 total), including hosting and care during the plan. Domain and hosting costs are separate for the one-off packages. Your written proposal confirms the scope and total cost.";
    });
  }

  function installStaticOfferCookieConsent() {
    if (document.body.getAttribute("data-static-offer-page") !== "true") return;
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
        '<div><strong>Cookie choices</strong><p>We use essential cookies to make the website work. With your permission, we also use Google Analytics to understand how the website is used. Read our <a href="/privacy">privacy and cookie notice</a>.</p></div>' +
        '<div class="cookie-actions"><button type="button" class="cookie-reject">Essential only</button><button type="button" class="cookie-accept">Accept analytics</button></div>';
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

  function updateContactAndSocialLinks() {
    var whatsappUrl = "https://wa.me/447999071045";
    var facebookUrl = "https://www.facebook.com/setupandseen";
    var instagramUrl = "https://www.instagram.com/setupandseen";

    Array.prototype.forEach.call(document.querySelectorAll('a[href*="wa.me/"]'), function (link) {
      link.setAttribute("href", whatsappUrl);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noreferrer noopener");
    });

    function addSocialLink(container, label, url) {
      if (!container || container.querySelector('a[href="' + url + '"]')) return;

      var link = document.createElement("a");
      link.className = "footer-social-link";
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = label;
      link.setAttribute("aria-label", label + " – opens in a new tab");
      container.appendChild(link);
    }

    Array.prototype.forEach.call(document.querySelectorAll("footer"), function (footer) {
      var contactColumn = footer.querySelector(".footer-links > div:nth-child(2)");

      if (!contactColumn && footer.classList.contains("simple-footer")) {
        var footerColumns = footer.querySelectorAll("div");
        for (var columnIndex = 0; columnIndex < footerColumns.length; columnIndex += 1) {
          if (footerColumns[columnIndex].querySelector('a[href*="wa.me/"], a[href^="mailto:"], a[href^="tel:"]')) {
            contactColumn = footerColumns[columnIndex];
            break;
          }
        }
        if (!contactColumn) contactColumn = footer.querySelector("div");
        if (!contactColumn) {
          contactColumn = document.createElement("div");
          footer.insertBefore(contactColumn, footer.lastElementChild);
        }
      }

      if (!contactColumn && footer.classList.contains("draw-footer")) {
        contactColumn = footer.querySelector(".draw-footer-inner");
      }

      if (!contactColumn) return;

      if (!contactColumn.querySelector('a[href="' + whatsappUrl + '"]')) {
        addSocialLink(contactColumn, "WhatsApp", whatsappUrl);
      }
      addSocialLink(contactColumn, "Facebook", facebookUrl);
      addSocialLink(contactColumn, "Instagram", instagramUrl);
    });
  }

  function positionExpressAsUpgrade() {
    var expressPackage = document.getElementById("express-website-set-up");
    if (!expressPackage) return;

    expressPackage.classList.add("express-priority-upgrade");
    var label = expressPackage.querySelector(".package-detail-intro > small");
    if (label) label.textContent = "Priority upgrade to Website Starter";

    var jumpLink = document.querySelector('.package-jump-nav a[href="#express-website-set-up"]');
    if (jumpLink) jumpLink.textContent = "Express priority upgrade";
  }

  function replaceText(root, oldText, newText) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.indexOf(oldText) !== -1) {
        node.nodeValue = node.nodeValue.replace(oldText, newText);
      }
    }
  }

  function findCardByHeading(selector, headingSelector, headingText) {
    var cards = document.querySelectorAll(selector);
    for (var index = 0; index < cards.length; index += 1) {
      var heading = cards[index].querySelector(headingSelector);
      if (heading && heading.textContent.trim() === headingText) return cards[index];
    }
    return null;
  }

  function updateHomepageCommercialContent() {
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") return;

    var businessLaunch = findCardByHeading(".price-card", "h3", "Business Launch");
    replaceText(businessLaunch, "£1,250", "£1,595");
    replaceText(businessLaunch, "Most popular", "Recommended for a full launch");
    replaceText(businessLaunch, "Our most popular choice", "Best for a complete business launch");

    var complete = findCardByHeading(".price-card", "h3", "Set Up & Seen Complete");
    replaceText(complete, "£1,750", "£2,295");

    var branding = findCardByHeading(".support-card", "h4", "Branding Only");
    replaceText(branding, "£395", "£495");
  }

  function applyCustomerJourneyEnhancements() {
    installCustomerJourneyStyles();
    simplifyMainNavigation();
    updateHomepageCommercialContent();
    addAlternativeWebsiteOptions();
    addPackageEnquiryOptions();
    updateWebsitePricingFaqs();
    addEnquiryNextSteps();
    updateContactAndSocialLinks();
    positionExpressAsUpgrade();
    installMessageUsWidget();
    addAcquisitionLinksAndNotice();
  }

  // Attribution uses explicit URL parameters only: no tracking identifier,
  // browser fingerprint or extra cookie/local storage is introduced.
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

  function addAcquisitionLinksAndNotice() {
    var paymentFooter = document.querySelector(".footer-links > div") || document.querySelector(".simple-footer > div");
    if (paymentFooter && !paymentFooter.querySelector('a[href="/pay"]')) {
      var paymentLink = document.createElement("a");
      paymentLink.href = "/pay";
      paymentLink.textContent = "Pay an agreed project";
      paymentFooter.appendChild(paymentLink);
    }
    var paymentComparison = document.querySelector(".first-site .payment-explainer");
    if (paymentComparison && !document.querySelector("[data-agreed-payment-route]")) {
      var agreedPayment = document.createElement("p");
      agreedPayment.className = "finder-note";
      agreedPayment.setAttribute("data-agreed-payment-route", "true");
      var agreedPaymentLink = document.createElement("a");
      agreedPaymentLink.href = "/pay";
      agreedPaymentLink.textContent = "Already agreed a £495 Website Starter proposal? Pay securely here.";
      agreedPayment.appendChild(agreedPaymentLink);
      paymentComparison.insertAdjacentElement("afterend", agreedPayment);
    }
    var finderPath = "/your-first-business-website#package-finder-section";
    var navigation = document.querySelector(".site-header nav");
    if (navigation && !navigation.querySelector("[data-package-finder-nav]")) {
      var finderNav = document.createElement("a");
      finderNav.href = finderPath;
      finderNav.textContent = "Package finder";
      finderNav.setAttribute("data-package-finder-nav", "true");
      var contactLink = navigation.querySelector(".nav-cta");
      navigation.insertBefore(finderNav, contactLink || null);
    }
    var heroActions = document.querySelector(".hero-copy .hero-actions");
    if (heroActions) {
      var finderButton = heroActions.querySelector(".button.primary");
      if (finderButton) {
        finderButton.setAttribute("data-package-finder-hero", "true");
        finderButton.classList.add("package-finder-home-button");
        finderButton.href = finderPath;
        finderButton.textContent = "Find a website package ↗";
      }
      if (!document.querySelector("[data-finder-home-note]")) {
        var finderNote = document.createElement("p");
        finderNote.setAttribute("data-finder-home-note", "true");
        finderNote.textContent = "Compare one-off builds and our 12-month managed plan. No email needed to see your recommendation.";
        heroActions.insertAdjacentElement("afterend", finderNote);
      }
    }
    var footer = document.querySelector(".footer-links > div");
    if (footer && !footer.querySelector('a[href^="/your-first-business-website"]')) {
      var firstWebsite = document.createElement("a");
      firstWebsite.href = "/your-first-business-website";
      firstWebsite.textContent = "Your first website & package finder";
      footer.appendChild(firstWebsite);
    }
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
      destination = withAcquisitionContext(destination);

      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(destination.pathname + destination.search + destination.hash);
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
  document.addEventListener("DOMContentLoaded", function () {
    normaliseCanonicalPath();
    installStaticOfferCookieConsent();
    // Let the preserved React render attach before adding progressive
    // enhancements. Mutating the head, navigation or contact section during
    // hydration makes React discard otherwise valid server-rendered HTML and
    // adds avoidable main-thread work on slower phones.
    window.setTimeout(function () {
      installScrollFix();
      installMobileMenuGuard();
      applyCustomerJourneyEnhancements();
    }, 600);
    window.setTimeout(applyCustomerJourneyEnhancements, 1600);
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
