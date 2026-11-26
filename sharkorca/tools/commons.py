# usage: python tools/commons.py "search" -> lists free-licence Wikimedia Commons images
import json,sys,urllib.parse,urllib.request,re
q=sys.argv[1]
u="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(dict(action="query",format="json",generator="search",gsrsearch=q+" filetype:bitmap",gsrnamespace=6,gsrlimit=25,prop="imageinfo",iiprop="url|size|extmetadata",iiurlwidth=1600))
r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"explainer-video-tool/1.0"}),timeout=40))
pages=sorted(r.get("query",{}).get("pages",{}).values(),key=lambda p:p.get("index",0))
for p in pages:
    i=p["imageinfo"][0]; m=i["extmetadata"]
    lic=m.get("LicenseShortName",{}).get("value","")
    if not re.match(r"(?i)(public domain|pd|cc0|cc by(-sa)?[ -])",lic) or "NC" in lic: continue
    if i["width"]<1200: continue
    art=re.sub("<[^>]+>","",m.get("Artist",{}).get("value",""))[:30].strip()
    print(f'{lic[:14]:14} {i["width"]}x{i["height"]} {art:30} {p["title"][5:70]}')
