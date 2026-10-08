// Final presentation pass: remove decorative CTA arrows, including older templates.
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {JSDOM} = require('jsdom');
const root = path.join(__dirname, '../netlify-site');
const arrows = /[↗↘↙↖→←↑↓➜➝➞➔⟶➤]/g;
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const css = fs.readFileSync(path.join(__dirname, 'clickable-cues.css'), 'utf8');
const cssName = 'clickable-cues-' + createHash('sha256').update(css).digest('hex').slice(0,12) + '.css';
fs.writeFileSync(path.join(root, 'assets', cssName), css);
const finderVersion = createHash('sha256').update(fs.readFileSync(path.join(root, 'package-finder-v1.js'))).digest('hex').slice(0,12);
let changed = 0;
for (const file of walk(root).filter(f => f.endsWith('.html') && !f.endsWith('/404.html'))) {
  const old = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(old), d = dom.window.document;
  for (const control of d.querySelectorAll('a, button')) {
    for (const span of control.querySelectorAll('span')) {
      if (span.textContent.trim() && !span.textContent.replace(arrows, '').trim() && !span.querySelector('img,svg')) span.remove();
    }
    const walker = d.createTreeWalker(control, dom.window.NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement.closest('script,style,svg')) node.nodeValue = node.nodeValue.replace(/[ \t]*[↗↘↙↖→←↑↓➜➝➞➔⟶➤]/g, '');
    }
    for (const name of ['aria-label', 'title']) {
      if (control.hasAttribute(name)) control.setAttribute(name, control.getAttribute(name).replace(arrows, '').trim());
    }
  }
  d.querySelectorAll('link[data-clickable-cues]').forEach(e => e.remove());
  const link = d.createElement('link');
  link.rel = 'stylesheet'; link.href = '/assets/' + cssName; link.dataset.clickableCues = '';
  d.head.append(link);
  for (const script of d.querySelectorAll('script[src^="/package-finder-v1.js"]')) script.src = '/package-finder-v1.js?v=' + finderVersion;
  const updated = dom.serialize();
  if (updated !== old) { fs.writeFileSync(file, updated); changed++; }
  dom.window.close();
}
console.log('Applied arrow-free click cues to ' + changed + ' pages.');
