"""仅在本机提供构建后的界面，不代理模型和设备请求。"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
p=argparse.ArgumentParser(); p.add_argument('--port',type=int,default=5177); args=p.parse_args()
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'none'; media-src 'self' blob:; frame-src 'self'; object-src 'none'; base-uri 'self'")
        super().end_headers()
root=Path(__file__).resolve().parents[1]/'dist'
print(f'Agent Admin UI preview: http://127.0.0.1:{args.port}/compare.html',flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),partial(Handler,directory=str(root))).serve_forever()
