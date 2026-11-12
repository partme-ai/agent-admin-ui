"""从官方来源保存主题字库原文件及许可，不安装系统字体、不修改字形。"""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1] / 'public/fonts'
ROOT.mkdir(parents=True, exist_ok=True)
RECORDS = []


def download(url, name):
    path = ROOT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        request = Request(quote(url, safe=':/?&=,%[]'), headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.alibabafonts.com/'})
        with urlopen(request, timeout=45) as response:
            data = response.read()
        path.write_bytes(data)
    data = path.read_bytes()
    RECORDS.append({'file': name, 'url': url, 'bytes': len(data), 'sha256': sha256(data).hexdigest()})
    return data


def face(family, file, weight='400'):
    fmt = 'woff2' if file.endswith('.woff2') else 'truetype'
    return f'@font-face{{font-family:"{family}";font-style:normal;font-weight:{weight};font-display:swap;src:url("./{file}") format("{fmt}")}}\n'


css = ''
ali = 'https://fonts.alibabadesign.com/AlibabaPuHuiTi-3/'
for weight, code in [('400', '55-Regular'), ('600', '75-SemiBold')]:
    basename = f'AlibabaPuHuiTi-3-{code}'
    file = f'alibaba/{basename}.woff2'
    download(f'{ali}{basename}/{basename}.woff2', file)
    css += face('Alibaba PuHuiTi 3.0', file, weight)

# MiSans 使用小米官方提供的unicode分片，保留原文件与范围，选择时只取所需字符。
mi_url = 'https://cdn-font.hyperos.mi.com/font/css?family=MiSans_VF:VF:Chinese_Simplify,Latin&display=swap'
mi_css = download(mi_url, 'licenses/misans-official.css').decode()
mi_files = []
for block in re.findall(r'@font-face\s*\{([^}]+)\}', mi_css):
    url = re.search(r'url\("([^"]+\.woff2)"\)', block).group(1)
    file = 'misans/' + url.rsplit('/', 1)[-1]
    mi_files.append((url, file))
    ranges = re.search(r'unicode-range:\s*([^;]+);', block).group(1)
    css += face('MiSans VF', file, '1 999').rstrip().removesuffix('}') + f';unicode-range:{ranges}}}\n'
with ThreadPoolExecutor(max_workers=6) as pool:
    list(pool.map(lambda pair: download(*pair), mi_files))
download('https://hyperos.mi.com/font-download/MiSans字体知识产权许可协议.pdf', 'licenses/MiSans-license.pdf')

tasks = [
    ('LXGW WenKai Lite', 'wenkai/LXGWWenKaiLite-Regular.ttf', 'https://github.com/lxgw/LxgwWenKai-Lite/releases/download/v1.530/LXGWWenKaiLite-Regular.ttf', '400'),
    ('LXGW WenKai Mono Lite', 'wenkai/LXGWWenKaiMonoLite-Regular.ttf', 'https://github.com/lxgw/LxgwWenKai-Lite/releases/download/v1.530/LXGWWenKaiMonoLite-Regular.ttf', '400'),
    ('Noto Sans SC', 'noto-sans/NotoSansSC.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf', '100 900'),
    ('Noto Serif SC', 'noto-serif/NotoSerifSC.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf', '200 900'),
    ('ZCOOL XiaoWei', 'zcool-xiaowei/ZCOOLXiaoWei-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolxiaowei/ZCOOLXiaoWei-Regular.ttf', '400'),
    ('ZCOOL KuaiLe', 'zcool-kuaile/ZCOOLKuaiLe-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf', '400'),
    ('Ma Shan Zheng', 'mashan/MaShanZheng-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf', '400'),
    ('Long Cang', 'longcang/LongCang-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/longcang/LongCang-Regular.ttf', '400'),
]
with ThreadPoolExecutor(max_workers=5) as pool:
    list(pool.map(lambda task: download(task[2], task[1]), tasks))
for family, file, _, weight in tasks:
    css += face(family, file, weight)
for name in ['notosanssc', 'notoserifsc', 'zcoolxiaowei', 'zcoolkuaile', 'mashanzheng', 'longcang']:
    download(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{name}/OFL.txt', f'licenses/{name}-OFL.txt')
download('https://raw.githubusercontent.com/lxgw/LxgwWenKai-Lite/v1.530/OFL.txt', 'licenses/wenkai-OFL.txt')

smiley_url = 'https://github.com/atelier-anchor/smiley-sans/releases/download/v2.0.1/smiley-sans-v2.0.1.zip'
archive = zipfile.ZipFile(BytesIO(download(smiley_url, 'licenses/smiley-sans-v2.0.1.zip')))
name = next(n for n in archive.namelist() if n.endswith('.woff2') and not n.startswith('__MACOSX'))
data = archive.read(name)
file = 'smiley/SmileySans.woff2'
(ROOT / 'smiley').mkdir(exist_ok=True)
(ROOT / file).write_bytes(data)
RECORDS.append({'file': file, 'url': smiley_url + '#' + name, 'bytes': len(data), 'sha256': sha256(data).hexdigest()})
css += face('Smiley Sans', file)
# 不分发重复安装包，只保留网站使用的原始woff2及许可。
(ROOT / 'licenses/smiley-sans-v2.0.1.zip').unlink()
RECORDS[:] = [r for r in RECORDS if r['file'] != 'licenses/smiley-sans-v2.0.1.zip']
download('https://raw.githubusercontent.com/atelier-anchor/smiley-sans/v2.0.1/LICENSE', 'licenses/smiley-OFL.txt')

# 扩展目录均保留原字库和OFL许可，按选择加载，不安装到操作系统。
expanded = json.loads((ROOT / 'expanded-catalog.json').read_text())
def fetch_expanded(item):
    download(item['url'], item['file'])
    license_text = download(item['license_url'], item['license_file']).decode('utf-8-sig')
    if 'SIL OPEN FONT LICENSE Version 1.1' not in license_text:
        raise ValueError('未取得OFL许可: ' + item['label'])
with ThreadPoolExecutor(max_workers=5) as pool:
    list(pool.map(fetch_expanded, expanded))
for item in expanded:
    css += face(item['family'], item['file'], item['weight'])

(ROOT / 'theme-fonts.css').write_text(css)
(ROOT / 'manifest.json').write_text(json.dumps({'retrieved': '2026-11-07', 'files': sorted(RECORDS, key=lambda r: r['file'])}, indent=2, ensure_ascii=False))
print(f'保存 {len(RECORDS)} 个资源，{sum(r["bytes"] for r in RECORDS) / 1024 / 1024:.1f} MiB；字形未修改。')
