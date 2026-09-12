#!/usr/bin/env python3
"""Build the first-website landing page and preserve discoverable internal links."""
from pathlib import Path
from html import escape
import re,json,sys
ROOT=Path(sys.argv[1] if len(sys.argv)>1 else 'netlify-site')
ROUTE='/your-first-business-website'
title='Your First Business Website UK | Set Up & Seen'
description='Get your first business website with Set Up & Seen. Compare clear prices, try the package finder and explore support for new and small UK businesses.'
template=(ROOT/'advice/small-business-website-cost-uk/index.html').read_text()
head=template.split('</head>')[0]+'</head>'
head=re.sub(r'<style>.*?</style>','',head,flags=re.S)
head=re.sub(r'<title>.*?</title>','<title>'+escape(title)+'</title>',head)
for key,value in [('description',description),('og:title',title),('og:description',description),('twitter:title',title),('twitter:description',description)]:
    head=re.sub(r'(<meta (?:name|property)="'+key+r'" content=")[^"]*',lambda m:m[1]+escape(value),head)
head=head.replace('/advice/small-business-website-cost-uk',ROUTE).replace('content="article"','content="website"')
head=head.replace('</head>','<link rel="stylesheet" href="/first-website-v1.css"/><script defer src="/package-finder-v1.js"></script></head>')
header=re.search(r'<div class="announcement">.*?</header>',template,re.S)[0]
footer=re.search(r'<footer class="simple-footer">.*?</footer>',template,re.S)[0]
schema={'@context':'https://schema.org','@type':'WebPage','name':title,'description':description,'url':'https://www.setupandseen.co.uk'+ROUTE,'about':{'@type':'Service','name':'First business website design','provider':{'@type':'Organization','name':'Set Up & Seen','url':'https://www.setupandseen.co.uk'},'areaServed':{'@type':'Country','name':'United Kingdom'}}}
body=(Path(__file__).parent/'first-website-content.html').read_text()
page=head+'<body data-static-offer-page="true"><main id="main-content"><a class="skip-link" href="#main-content">Skip to main content</a>'+header+'<script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False)+'</script>'+body+footer+'</main><button type="button" class="cookie-settings" aria-expanded="false">Cookie settings</button></body></html>'
dest=ROOT/ROUTE.lstrip('/')/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(page)

CHUNK=re.compile(r'self\.__VINEXT_RSC_CHUNKS__\.push\(("(?:[^"\\]|\\.)*")\)')
link_text='Planning your first website? Explore the options and package finder →'
link_html='<p class="first-website-link"><a href="'+ROUTE+'">'+link_text+'</a></p>'
link_node=['$','p',None,{'className':'first-website-link','children':['$','a',None,{'href':ROUTE,'children':link_text}]}]
service=ROOT/'services/website-design/index.html';text=service.read_text()
if 'class="first-website-link"' not in text:
    marker='<section class="service-page-cta section-pad">'
    assert marker in text
    text=text.replace(marker,marker+link_html,1)
    def update_chunk(m):
        lines=[]
        def visit(v):
            if isinstance(v,list):
                if len(v)==4 and v[0]=='$' and v[1]=='section' and isinstance(v[3],dict) and v[3].get('className')=='service-page-cta section-pad':
                    v[3]['children'].insert(0,link_node);return
                for child in v:visit(child)
            elif isinstance(v,dict):
                for child in v.values():visit(child)
        for line in json.loads(m[1]).splitlines(keepends=True):
            match=re.match(r'^([a-f0-9]+:)(\[.*)',line)
            if match:
                v=json.loads(match[2]);visit(v);line=match[1]+json.dumps(v,ensure_ascii=False,separators=(',',':'))+('\n' if line.endswith('\n') else '')
            lines.append(line)
        return 'self.__VINEXT_RSC_CHUNKS__.push('+json.dumps(''.join(lines),ensure_ascii=False).replace('<',r'\u003c').replace('&',r'\u0026')+')'
    text=CHUNK.sub(update_chunk,text)
    service.write_text(text)
guide=ROOT/'advice/small-business-website-cost-uk/index.html';text=guide.read_text()
if 'class="first-website-link"' not in text:
    text=text.replace('<div class="article-cta">','<div class="article-cta">'+link_html,1)
guide.write_text(text)
redirects=ROOT/'_redirects';text=redirects.read_text();rule=ROUTE+' '+ROUTE+'/index.html 200!'
if rule not in text:text=text.replace('/advice /advice/index.html 200!','/advice /advice/index.html 200!\n'+rule)
redirects.write_text(text)
sitemap=ROOT/'sitemap.xml';text=sitemap.read_text()
if ROUTE not in text:text=text.replace('</urlset>','<url><loc>https://www.setupandseen.co.uk'+ROUTE+'</loc><lastmod>2026-09-12</lastmod></url>\n</urlset>')
sitemap.write_text(text)
privacy=ROOT/'privacy/index.html'
if privacy.exists():
    text=privacy.read_text()
    old='chosen service, project information, correspondence, proposal and payment records.'
    extra=' If you follow our first-website email campaign link or enquire from the package finder, the campaign reference and package suggestion are included with your enquiry message. The finder works in your browser and does not require an email address to show a recommendation. These features do not add tracking cookies or store your answers between visits.'
    if extra not in text:
        text=text.replace(old,old+extra).replace('Last updated 1 September 2026','Last updated 12 September 2026')
        def repair_lengths(m):
            value=json.loads(m[1])
            def repair(n):
                start=n.end();_,end=json.JSONDecoder().raw_decode(value[start:])
                return n[1]+format(len(value[start:start+end].encode('utf-8')),'x')+','
            value=re.sub(r'((?:^|\n)[a-f0-9]+:T)[a-f0-9]+,',repair,value)
            return 'self.__VINEXT_RSC_CHUNKS__.push('+json.dumps(value,ensure_ascii=False).replace('<',r'\u003c').replace('&',r'\u0026')+')'
        privacy.write_text(CHUNK.sub(repair_lengths,text))
print('First-website page, internal links, route and sitemap updated.')
