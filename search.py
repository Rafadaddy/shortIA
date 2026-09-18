import urllib.request, urllib.parse, re
url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote('tendencias reflexiones tiktok psicologia vida cotidiana 2024')
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8')
snippets = re.findall(r'<a class=\"result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
for i, s in enumerate(snippets[:5]):
    clean = re.sub(r'<[^>]+>', '', s).strip()
    print(f'Result {i+1}: {clean}')
