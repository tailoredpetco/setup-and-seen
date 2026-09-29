/* Keep the existing contact widget clear of the offer's enquiry buttons. */
(function () {
  function protectOfferActions() {
    if (!document.body.classList.contains('offer-campaign') || !('IntersectionObserver' in window)) return;
    var visible = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      document.body.classList.toggle('offer-cta-visible', visible.size > 0);
      if (visible.size > 0) {
        var openTrigger = document.querySelector('.message-us-trigger[aria-expanded="true"]');
        if (openTrigger) openTrigger.click();
      }
    }, {threshold: 0});
    document.querySelectorAll('.aligned-button').forEach(function (button) { observer.observe(button); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', protectOfferActions);
  else protectOfferActions();
})();
