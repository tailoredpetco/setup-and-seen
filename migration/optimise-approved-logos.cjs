// Lossless web-sized derivatives of the approved complete artwork. No cropping,
// redrawing or palette changes. The existing footer SVG owns its colour treatment.
const path=require('node:path'), sharp=require('sharp');
const root=path.resolve('netlify-site/assets/october-offer');
(async()=>{
  for(const [name,ext] of [['approved-logo','png'],['approved-logo-footer','svg']]) {
    for(const width of [320,640,960]) {
      const output=path.join(root,name+'-'+width+'.webp');
      const info=await sharp(path.join(root,name+'.'+ext)).resize({width}).webp({lossless:true,effort:6}).toFile(output);
      console.log(path.basename(output)+': '+info.size+' bytes');
    }
  }
})();
