document.addEventListener("DOMContentLoaded",()=>{
  const menuButton=document.querySelector(".menu-button"),navigation=document.querySelector(".site-header nav");
  if(menuButton&&navigation)menuButton.addEventListener("click",()=>{
    const open=menuButton.getAttribute("aria-expanded")==="true";
    menuButton.setAttribute("aria-expanded",String(!open));
    navigation.classList.toggle("open",!open);
  });

  document.querySelectorAll('a[href="#contact"]').forEach(link=>link.addEventListener("click",()=>{
    const select=document.querySelector('select[name="service"]');
    if(!select)return;
    const text=link.textContent.toLowerCase();
    const option=[...select.options].find(item=>text.includes(item.text.toLowerCase().replace("choose ","")));
    if(option)select.value=option.value;
  }));

  const consentKey="setup-and-seen-cookie-consent";
  const updateConsent=value=>{
    localStorage.setItem(consentKey,value);
    if(typeof window.gtag==="function")window.gtag("consent","update",{
      analytics_storage:value==="accepted"?"granted":"denied",
      ad_storage:"denied",
      ad_user_data:"denied",
      ad_personalization:"denied"
    });
    document.querySelector(".cookie-banner")?.remove();
  };

  const showCookieBanner=()=>{
    if(document.querySelector(".cookie-banner"))return;
    const banner=document.createElement("section");
    banner.className="cookie-banner";
    banner.setAttribute("aria-label","Cookie choices");
    banner.innerHTML='<div><strong>Cookies on Set Up &amp; Seen</strong><p>We use essential technology to run the website and, with your permission, Google Analytics to understand how visitors use it. <a href="/privacy">Read our privacy notice</a>.</p></div><div class="cookie-actions"><button type="button" data-cookie-choice="rejected">Reject analytics</button><button type="button" class="cookie-accept" data-cookie-choice="accepted">Accept analytics</button></div>';
    document.body.appendChild(banner);
    banner.querySelectorAll("[data-cookie-choice]").forEach(button=>button.addEventListener("click",()=>updateConsent(button.dataset.cookieChoice)));
  };

  const settingsButton=document.createElement("button");
  settingsButton.type="button";
  settingsButton.className="cookie-settings";
  settingsButton.textContent="Cookie settings";
  settingsButton.addEventListener("click",showCookieBanner);
  document.body.appendChild(settingsButton);

  if(!localStorage.getItem(consentKey))showCookieBanner();
});
