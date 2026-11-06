import re
order = ['data_traits','data_world','data_lore','engine_core','engine_birth','engine_actions','events','events_arcs','events_more','events_ages','events_legacy','engine_world','engine_year','ui_core','ui_portrait','ui_tips','ui_pages','ui_admin','ui_palette','ui_fx','ui_map','ui_legacy','ui_audio','ui_screens','ui_sheets','ui_main']
js = '\n'.join(open(f'src/{f}.js').read() for f in order)
css = open('src/styles.css').read()
shell = open('src/shell.html').read()
out = shell.replace('/*CSS*/', css).replace('/*JS*/', '"use strict";\n' + js)
assert '</script' not in js.lower(), 'script tag inside JS'
open('dist/jobless-reincarnation.html', 'w').write(out)
print(len(out), 'bytes')
# local preview with the same skeleton the artifact host adds
skel = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>')
open('dist/preview.html', 'w').write(skel + out + '</body></html>')
