import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
await mkdir('dist/checks',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,outfile:'dist/checks/recovery_product.js',jsx:'automatic',target:'es2022',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'isolated-microphone-input',setup(builder){builder.onResolve({filter:/recorder_capture$/},args=>args.importer.endsWith('/use_microphone_capture.ts')?{path:resolve('tests/browser/recovery_environment.ts')}:null);}}]});
await build({entryPoints:['tests/browser/recovery_harness.ts'],bundle:true,outfile:'dist/checks/recovery_harness.js',target:'es2022'});
await writeFile('dist/checks/recovery_product.html',`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TinyBot独立输入故障验证</title><link rel="stylesheet" href="recovery_product.css"></head><body><div id="root"></div><script src="recovery_product.js"></script></body></html>`);
await writeFile('dist/checks/recovery.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>TinyBot麦克风中断恢复独立验证</title><style>body{margin:0;padding:12px;font:12px system-ui;background:#f4f4f4;color:#252525}header{background:white;border:1px solid #ddd;padding:10px;margin-bottom:12px;max-width:1280px}p{margin:5px 0}button,select{font:inherit;padding:5px;margin:2px}output{display:block;overflow-wrap:anywhere;line-height:1.6}iframe{border:1px solid #ccc;display:block;background:white}</style><body><script src="recovery_harness.js"></script></body></html>`);
console.log('Built isolated recovery harness; synthetic input only. Normal product build removes dist/checks.');
