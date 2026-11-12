"""下载已从 MiniMax 官方公开音色页观察到的片段，不调用合成接口。"""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import time
import urllib.request
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
reference = ROOT / 'reference'
catalog = json.loads((reference / 'minimax_system_voices.json').read_text())
source = json.loads((reference / 'minimax_public_samples.source.json').read_text())
by_id = {v['voiceId']: v for v in source['voices'] if v['sourceUrl']}
output = ROOT / 'public/audio/minimax'
output.mkdir(parents=True, exist_ok=True)
previous_path = reference / 'minimax_voice_samples.json'
previous = {v['voiceId']: v for v in json.loads(previous_path.read_text())['samples']} if previous_path.exists() else {}


def download(voice):
    item = by_id.get(voice['voiceId'])
    if not item:
        return {'voiceId': voice['voiceId'], 'status': 'not_found'}
    suffix = Path(urlparse(item['sourceUrl']).path).suffix.lower()
    if suffix not in ('.mp3', '.wav', '.m4a'):
        raise ValueError('不支持的官方片段格式: ' + suffix)
    filename = hashlib.sha256(voice['voiceId'].encode()).hexdigest()[:24] + suffix
    target = output / filename
    cached = previous.get(voice['voiceId'], {})
    if target.exists() and cached.get('sourceUrl') == item['sourceUrl'] and hashlib.sha256(target.read_bytes()).hexdigest() == cached.get('sha256'):
        return cached
    for attempt in range(3):
        try:
            with urllib.request.urlopen(item['sourceUrl'], timeout=60) as response:
                content_type = response.headers.get_content_type()
                audio = response.read()
            if len(audio) < 1000 or content_type not in ('audio/mpeg', 'application/octet-stream', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4'):
                raise ValueError(f'非预期音频: {content_type}, {len(audio)} bytes')
            target.write_bytes(audio)
            return {**item, 'status': 'downloaded', 'localUrl': f'./audio/minimax/{filename}',
                    'bytes': len(audio), 'sha256': hashlib.sha256(audio).hexdigest(), 'contentType': content_type}
        except Exception as error:
            if attempt == 2:
                return {**item, 'status': 'download_failed', 'error': str(error)}
            time.sleep(attempt + 1)


with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    samples = list(executor.map(download, catalog['voices']))
manifest = {'providerId': 'minimax', 'observedAt': source['observedAt'], 'pageUrl': source['pageUrl'],
            'mapping': 'Exact catalog voiceId == official uniq_id; no name matching or ID normalization.',
            'scope': 'Official fixed audition clips; not generated replies or per-model synthesis validation.',
            'samples': samples}
(reference / 'minimax_voice_samples.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({status: sum(v['status'] == status for v in samples)
                  for status in ('downloaded', 'not_found', 'download_failed')}, ensure_ascii=False))
