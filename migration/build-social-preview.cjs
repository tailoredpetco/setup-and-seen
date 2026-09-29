// Deterministic branded sharing card. Uses approved artwork and the site's own
// fonts, converted to vector outlines so the exported image has no font fallback.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const fontkit = require('fontkit');
const root = path.join(__dirname, '../netlify-site');
const serif = fontkit.openSync(path.join(root, 'fonts/playfair-display-latin-normal.woff2'));
const sans = fontkit.openSync(path.join(root, 'fonts/dm-sans-latin-variable.woff2'));
const logo = fs.readFileSync(path.join(root, 'assets/october-offer/approved-logo.png')).toString('base64');
const blue = '#315f8c', ink = '#202522';
function line(font, copy, size, y, colour = ink) {
  const run = font.layout(copy), scale = size/font.unitsPerEm;
  const width = run.positions.reduce((sum,p) => sum+p.xAdvance,0)*scale;
  if (width > 1056) throw new Error('Sharing text exceeds safe width: '+copy);
  let x = (1200-width)/2;
  return run.glyphs.map((g,i) => {
    const p = run.positions[i];
    const markup = `<path fill="${colour}" transform="translate(${x+p.xOffset*scale},${y-p.yOffset*scale}) scale(${scale},${-scale})" d="${g.path.toSVG()}"/>`;
    x += p.xAdvance*scale;
    return markup;
  }).join('');
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
 <rect width="1200" height="630" fill="#f7f4ed"/>
 <rect x="28" y="28" width="1144" height="574" fill="none" stroke="#d8d7ce"/>
 <image href="data:image/png;base64,${logo}" x="340" y="76" width="520" height="112.775" preserveAspectRatio="xMidYMid meet"/>
 <path d="M554 225H646" stroke="${blue}" stroke-width="3"/>
 ${line(serif,'Sales and Marketing',72,332)}
 ${line(sans,'Support for small businesses.',30,386,blue)}
 ${line(sans,'Websites · Branding · Social media · Advertising',23,455)}
 <rect x="28" y="505" width="1144" height="97" fill="${blue}"/>
 ${line(sans,'Worcestershire based. Working UK-wide.',21,544,'#ffffff')}
 ${line(sans,'setupandseen.co.uk',22,577,'#ffffff')}
</svg>`;
(async () => {
 const output = path.join(root,'assets/social/set-up-and-seen-sales-marketing-20260929.png');
 fs.mkdirSync(path.dirname(output),{recursive:true});
 const bytes = await sharp(Buffer.from(svg)).png({compressionLevel:9}).toBuffer();
 fs.writeFileSync(output,bytes);
 // Keep the legacy address correct for platforms that previously stored it.
 fs.writeFileSync(path.join(root,'og.png'),bytes);
 console.log('Built 1200 × 630 social preview: '+bytes.length+' bytes');
})().catch(e=>{console.error(e);process.exitCode=1;});
