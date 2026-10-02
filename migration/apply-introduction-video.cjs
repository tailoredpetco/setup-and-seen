// Approved 2 October 2026: native, click-to-play introduction using the original export.
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '../netlify-site');
const file = path.join(root, 'index.html');
const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
const d = dom.window.document;
d.querySelector('#meet-set-up-and-seen')?.remove();
d.querySelector('link[data-introduction-video]')?.remove();
const section = d.createElement('section');
section.id = 'meet-set-up-and-seen';
section.className = 'introduction-video section-pad';
section.setAttribute('aria-labelledby', 'introduction-video-title');
section.innerHTML = `<div class="introduction-video-copy">
  <p class="eyebrow">Meet Set Up &amp; Seen</p>
  <h2 id="introduction-video-title">A clearer picture<br>of your business.</h2>
  <p id="introduction-video-description">Watch our 40-second introduction to websites, branding and social media support for UK small businesses.</p>
  <a class="button dark" href="#contact">Tell us what you need <span aria-hidden="true">↗</span></a>
</div>
<div class="introduction-video-player">
  <video controls playsinline preload="none" width="1920" height="1080" poster="/assets/video/introduction-poster.jpg" aria-label="Set Up and Seen: websites, branding and social media support" aria-describedby="introduction-video-description introduction-video-access">
    <source src="/assets/video/set-up-and-seen-introduction.mp4" type="video/mp4">
    <p>Your browser does not support this video. Please read the transcript below.</p>
  </video>
  <p id="introduction-video-access" class="introduction-video-note">40 seconds · Spoken captions are included in the video.</p>
  <details class="introduction-video-transcript"><summary>Read the video transcript</summary>
    <p>You put a lot into your business. Let’s make sure that comes across online.</p>
    <p>At Set Up &amp; Seen, we help UK start-ups, sole traders and small businesses with website design, branding and social media support.</p>
    <p>We bring those pieces together so customers can understand what you offer, recognise your business and find a clear way to get in touch.</p>
    <p>Whether you’re starting out or ready for a refresh, we’ll help you create a professional presence that feels right for your business.</p>
    <p>Visit setupandseen.co.uk and tell us what you need.</p>
    <p class="introduction-video-note">The video shows approved portfolio examples from The Tailored Pet Co, The Office Partner and Clent Auto Repairs, followed by the Set Up &amp; Seen logo and website address.</p>
  </details>
</div>`;
d.querySelector('#services').after(section);
const css = d.createElement('link');
css.rel = 'stylesheet'; css.href = '/assets/video/introduction.css'; css.dataset.introductionVideo = '';
d.head.append(css);
fs.copyFileSync(path.join(__dirname, 'introduction-video.css'), path.join(root, 'assets/video/introduction.css'));
fs.writeFileSync(file, dom.serialize());
dom.window.close();
console.log('Added accessible introduction video; original media and enquiry flow preserved.');
