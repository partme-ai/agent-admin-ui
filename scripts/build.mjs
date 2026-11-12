import {build} from 'esbuild';
import {mkdir,writeFile,cp,rm} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
// 浏览器验证夹具由测试脚本临时生成，正常构建不携带测试入口。
await rm('dist/checks',{recursive:true,force:true});
await mkdir('dist/licenses',{recursive:true});
await cp('src/vendor/weknora/LICENSE','dist/licenses/weknora-LICENSE.txt');
await cp('src/vendor/weknora/NOTICE.md','dist/licenses/weknora-NOTICE.md');
await cp('src/vendor/recorder/LICENSE','dist/licenses/recorder-LICENSE.txt');
await cp('src/vendor/laoa_grokbot/LICENSE','dist/licenses/laoa-grokbot-LICENSE.txt');
await cp('src/vendor/laoa_grokbot/ORIGIN.md','dist/licenses/laoa-grokbot-ORIGIN.md');
await cp('src/vendor/traditional_742','dist/licenses/traditional-742',{recursive:true});
await cp('src/vendor/chinese_colors/LICENSE.md','dist/licenses/chinacolor-MIT.txt');
await cp('src/vendor/extended_colors/color-names-MIT.txt','dist/licenses/color-names-MIT.txt');
await cp('src/vendor/extended_colors/ral-colors-MIT.txt','dist/licenses/ral-colors-MIT.txt');
await cp('reference/console/UNICODE-LICENSE.txt','dist/licenses/UNICODE-LICENSE.txt');
await cp('public/audio','dist/audio',{recursive:true});
await cp('public/fonts','dist/fonts',{recursive:true});
await build({entryPoints:['src/main.tsx','src/compare.tsx'],bundle:true,outdir:'dist/assets',minify:true,jsx:'automatic',target:'es2022',legalComments:'linked',define:{'process.env.NODE_ENV':'"production"'}});
for(const [file,entry,title] of [['index.html','main','TinyBot · 智能控制台'],['compare.html','compare','TinyBot · 三端交互预览']]){
 const startup=entry==='main'?' data-console-booting':'';
 const startupStyle=entry==='main'?'<style>html[data-console-booting] #root{visibility:hidden}html[data-console-booting] body::after{content:"";position:fixed;inset:calc(50% - 10px) auto auto calc(50% - 10px);width:20px;height:20px;border:2px solid #dce3e9;border-top-color:#1e5a8f;border-radius:50%;animation:console-startup .8s linear infinite}@keyframes console-startup{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){html[data-console-booting] body::after{animation:none}}</style>':'';
 await writeFile(`dist/${file}`,`<!doctype html><html lang="zh-CN"${startup}><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light dark"><title>${title}</title>${startupStyle}<link rel="stylesheet" href="./fonts/theme-fonts.css"><link rel="stylesheet" href="./assets/${entry}.css"></head><body><div id="root"></div><script src="./assets/${entry}.js"></script></body></html>`);
}
console.log('Built desktop / tablet / mobile and comparison preview.');
