"""Add the project-supplied macOS release after build:desktiles.
Usage: python3 add-macos-download.py --source /path/to/DeskTile_mac
"""
import argparse, hashlib, html, json, pathlib, re, shutil
p=argparse.ArgumentParser(); p.add_argument('--source', required=True); args=p.parse_args()
root=pathlib.Path(__file__).resolve().parent; site=root/'desktiles'; source=pathlib.Path(args.source)
sha=lambda b:hashlib.sha256(b).hexdigest()
name='DeskTiles-macOS-universal.zip'; data=(source/'release'/name).read_bytes()
sums=(source/'release/SHA256SUMS.txt').read_text()
assert re.search(r'^'+sha(data)+r'\s+'+re.escape(name)+r'\s*$',sums,re.M), 'macOS ZIP checksum mismatch'
files=[('release/'+name,'downloads/'+name),('release/SHA256SUMS.txt','downloads/SHA256SUMS-macOS.txt'),('release/使用說明.md','downloads/guide-macos-zh.md'),('release/THIRD-PARTY-NOTICES.txt','downloads/THIRD-PARTY-NOTICES-macOS.txt'),('release/範例配置.json','downloads/example-macos.json')]
manifest=json.loads((site/'source-manifest.json').read_text())
for src,dst in files:
    shutil.copyfile(source/src,site/dst)
    manifest['assets']=[a for a in manifest['assets'] if a['path']!=dst]
    b=(site/dst).read_bytes(); manifest['assets'].append(dict(path=dst,source='macOS:'+src,sha256=sha(b),bytes=len(b)))
    if dst not in manifest['publicFiles']: manifest['publicFiles'].append(dst)
manifest['macOSRelease']=dict(publishedDate='2026-11-07',platform='macOS 12+ · Apple silicon / Intel',zipSha256=sha(data),zipBytes=len(data),signing='ad-hoc; no Developer ID or Apple notarization')
(site/'source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
guide=(source/'release/使用說明.md').read_text()
(site/'macos.html').write_text('''<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>macOS 使用說明 | DeskTiles</title><link rel="stylesheet" href="desktiles.css"><main class="docs-main"><h1>DeskTiles macOS 使用說明</h1><p><a href="index.html#macos-download">回下載頁</a> · <a href="downloads/guide-macos-zh.md" download>下載 Markdown</a></p><pre style="white-space:pre-wrap;font:inherit">'''+html.escape(guide)+'</pre></main></html>')
# Reuse the site's existing analytics installation for this additional guide.
page=site/'macos.html'
existing=(site/'index.html').read_text()
head_tag=re.search(r'<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->',existing).group()
body_tag=re.search(r'<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->',existing).group()
page.write_text(page.read_text().replace('<html lang="zh-Hant">','<html lang="zh-Hant"><head>\n'+head_tag+'\n').replace('<main class="docs-main">','</head><body>'+body_tag+'<main class="docs-main">').replace('</main></html>','</main></body></html>'))
if 'macos.html' not in manifest['publicFiles']:
    manifest['publicFiles'].append('macos.html')
(site/'source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for rel in manifest['generatedHtml']:
    file=site/rel; text=file.read_text(); en=rel.startswith('en/'); prefix='../' if en else ''
    url=prefix+'downloads/'+name+'?v=2026-11-07'
    if rel.endswith('index.html'):
        section=f'''<section class="home-section prose" id="macos-download"><h2>{'DeskTiles for macOS (trial)' if en else 'macOS 原生試用版下載'}</h2><p>macOS 12+ · Apple silicon / Intel · Universal 2</p><p>{'Extract the ZIP, move DeskTiles.app to Applications, then open it. The app uses ad-hoc signing and has no Developer ID signature or Apple notarization. macOS may block opening it; only if you trust this download, use System Settings → Privacy &amp; Security → Open Anyway after attempting to open it.' if en else '下載並解壓 ZIP，將 DeskTiles.app 移到「應用程式」後開啟。此試用版採 ad-hoc 簽章，尚無 Developer ID 簽章與 Apple 公證。macOS 可能阻擋開啟；確認信任來源後，可在嘗試開啟後至「系統設定 → 隱私權與安全性」選擇「強制打開」。'}</p><p><a class="primary-button" href="{url}" download>{'Download macOS ZIP' if en else '下載 macOS ZIP'} ↓</a></p><p><a href="{prefix}macos.html">{'macOS guide (Traditional Chinese)' if en else '閱讀 macOS 使用說明'}</a> · <a href="{prefix}downloads/SHA256SUMS-macOS.txt" download>SHA256</a> · <a href="{prefix}downloads/THIRD-PARTY-NOTICES-macOS.txt" download>{'Third-party notices' if en else '第三方授權'}</a> · <a href="{prefix}downloads/example-macos.json" download>{'Example JSON' if en else '範例配置 JSON'}</a></p><p>{'Intel hardware, multiple displays and long-running stress scenarios still require validation. Windows and macOS feature details differ; see the macOS guide.' if en else 'Intel 實機、多螢幕與長時間壓力情境仍待驗收。Windows 與 macOS 的功能細節不同，請參閱 macOS 使用說明。'}</p></section>'''
        text=re.sub(r'<section\b[^>]*id="macos-download"[^>]*>[\s\S]*?</section>','',text)
        text=text.replace('<section class="home-section" id="features">',section+'<section class="home-section" id="features">')
        assert 'id="macos-download"' in text
    text=re.sub(r'<a data-macos-download[^>]*>[\s\S]*?</a>','',text)
    marker='<a href="'+prefix+'downloads/mixed-shapes.json'
    text=text.replace(marker,f'<a data-macos-download href="{url}" download>macOS Universal ZIP ↓</a>'+marker)
    file.write_text(text)
for rel in ['index.html','en/index.html']:
    file=root/rel; text=file.read_text(); prefix='../' if rel.startswith('en/') else './'
    # Preserve the card layout and add the second platform next to the Windows download.
    start=text.index('id="project-desktiles"'); end=text.index('</article>',start)
    card=text[start:end]; card=re.sub(r'<a data-macos-download[^>]*>[\s\S]*?</a>','',card)
    card=card.replace('</div>',f'<a data-macos-download class="text-link" href="{prefix}desktiles/downloads/{name}?v=2026-11-07" download>{"Download macOS ZIP" if rel.startswith("en/") else "下載 macOS ZIP"} ↓</a></div>',1)
    text=text[:start]+card+text[end:]; file.write_text(text)
print('macOS downloads published locally; SHA256:',sha(data))
