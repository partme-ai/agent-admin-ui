"""从固定上游提交导入完整色表；校验源文件指纹，不下载图片或配色组合。"""
import argparse
import collections
import hashlib
import json
import pathlib
import re
import unicodedata
import urllib.request

COMMIT = '7934e2bca7719a8b3401b97a128270dbbc2c1940'
REPOSITORY = 'https://github.com/nevertoday/zhongguo-traditional-colors'
WEBSITE = 'https://colors.xiaoxiaodong.ai/dictionary?family=red'
SOURCES = {
    'assets/data/images.js': '8e19a53ea8e06962e4e887a7d3dbd7a037dcf8e49ced5a08667790f2cf79db36',
    'assets/data/harmonies.js': 'de6a94fcec80bd99bedd64cbff0d099e313365942c082498b3c94c5b7bf9950f',
    'LICENSE': '3972dc9744f6499f0f9b2dbf76696f2ae7ad8af9b23dde66d6af86c9dfb36986',
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=pathlib.Path, help='可选：包含 images.js、harmonies.js 和 LICENSE 的本地源快照')
    args = parser.parse_args()
    blobs = {}
    for path, expected in SOURCES.items():
        raw = (args.source_dir / pathlib.Path(path).name).read_bytes() if args.source_dir else urllib.request.urlopen(f'{REPOSITORY.replace("github.com", "raw.githubusercontent.com")}/{COMMIT}/{path}').read()
        if hashlib.sha256(raw).hexdigest() != expected:
            raise ValueError(f'源文件指纹不一致：{path}')
        blobs[path] = raw
    images = json.loads(blobs['assets/data/images.js'].decode().split('window.TRADITIONAL_COLOR_IMAGES = ', 1)[1].strip().rstrip(';'))
    harmonies = json.loads(blobs['assets/data/harmonies.js'].decode().split('window.TRADITIONAL_COLOR_HARMONIES=', 1)[1].strip().rstrip(';'))
    assert [c['id'] for c in images] == [f'{i:03d}' for i in range(1, 743)]
    assert len(harmonies) == len({c['hex'].lower() for c in images}) == 742
    colors = []
    for image in images:
        record = harmonies[image['id']]
        assert record['hex'] == image['hex'] and re.fullmatch(r'#[A-Fa-f0-9]{6}', image['hex'])
        assert image['file'] == f"{image['id']}-{record['name']}.png"
        pinyin = image['pinyin']
        plain = ''.join(c for c in unicodedata.normalize('NFD', pinyin) if not unicodedata.combining(c))
        colors.append({'id': f"traditional742-{image['id']}", 'name': record['name'], 'hex': image['hex'],
                       'group': record['hueFamily'], 'code': image['id'], 'aliases': list(dict.fromkeys([pinyin, plain])),
                       'sourceId': 'traditional742', 'sourceName': '中国传统配色 · 742 色',
                       'sourceUrl': f"https://colors.xiaoxiaodong.ai/colors/{image['id']}-{record['name']}.html",
                       'cmyk': image['cmyk']})
    dest = pathlib.Path(__file__).resolve().parents[1] / 'src/vendor/traditional_742'
    dest.mkdir(parents=True, exist_ok=True)
    data = (json.dumps(colors, ensure_ascii=False, indent=2) + '\n').encode()
    (dest / 'colors.json').write_bytes(data)
    (dest / 'LICENSE').write_bytes(blobs['LICENSE'])
    provenance = {'website': WEBSITE, 'dictionary': 'https://colors.xiaoxiaodong.ai/dictionary.html',
                  'repository': REPOSITORY, 'commit': COMMIT, 'retrieved': '2026-11-06', 'count': len(colors),
                  'families': dict(collections.Counter(c['group'] for c in colors)),
                  'sources': [{'path': p, 'url': f'{REPOSITORY}/blob/{COMMIT}/{p}', 'sha256': h} for p, h in SOURCES.items()],
                  'outputSha256': hashlib.sha256(data).hexdigest(),
                  'licenseFile': 'GPL-3.0', 'readmeLicenseClaim': 'MIT',
                  'licenseDiscrepancy': '实际 LICENSE 为 GPL-3.0；README 的 MIT 声明不一致，不按 MIT 标注或消除上游许可义务。',
                  'verification': '仓库内 images.js 与 harmonies.js 的 742 个 ID、名称及 HEX 逐项一致；公开站点直取返回 403，未声称线上资源与固定提交逐字节一致。'}
    (dest / 'source.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + '\n')
    print(f'Imported {len(colors)} colors; families: {provenance["families"]}')


if __name__ == '__main__':
    main()
