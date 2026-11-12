import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('dist/checks',{recursive:true});
await build({entryPoints:['tests/browser/microphone_fixture.tsx'],bundle:true,outdir:'dist/checks',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
await writeFile('dist/checks/microphone.html',`<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="microphone_fixture.css"><style>:root{--line:#dce1e5;--surface:#fff;--muted:#727c83;--text:#242a2e}body{font:13px system-ui;margin:0;background:#f6f7f8;color:var(--text)}main{padding:20px;max-width:700px;margin:auto}h1{font-size:20px}p{font-size:12px;line-height:1.6}select,button{font:inherit;padding:9px;margin:5px}label{display:block;margin-bottom:15px}output{display:block}main>div:last-child{display:flex;flex-wrap:wrap}svg{display:block}</style><div id="root"></div><script src="microphone_fixture.js"></script></html>`);
for(const [device,host] of [['desktop','desktop'],['tablet','ipad'],['mobile','web']]){
 await writeFile(`dist/checks/denied-${device}.html`,`<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TinyBot浏览器权限拒绝验证</title><body style="margin:0"><iframe title="TinyBot权限拒绝验证" allow="microphone 'none'" src="../index.html?device=${device}&host=${host}&theme=light#/w/demo/chat" style="width:100vw;height:100vh;border:0;display:block"></iframe></body></html>`);
}
