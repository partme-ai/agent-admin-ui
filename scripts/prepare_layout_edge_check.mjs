/** 生成独立浏览器布局检查页；正常构建会清除此临时入口。 */
import {mkdir,writeFile} from 'node:fs/promises';
import {pages,pathFor} from '../src/catalog.ts';
const cases=pages.map(p=>({id:p.id,title:p.title,path:pathFor(p.id)}));
for(const [id,item,title] of [['30','theme','系统主题'],['30','terminals','终端互联'],['30','guide','首次引导'],['39','analysis','模型使用分析'],['39','cost','模型成本分析'],['44','cost','智能体成本分析'],['45','analysis','设备使用分析'],['51','operations','操作日志'],['52','dictionary','数据字典'],['52','variables','变量参数']])cases.push({id,title,path:pathFor(id)+'?item='+item});
const runtime=String.raw`
const cases=CASES;
const dimensions=[['desktop',1280,1024],['tablet',768,1024],['mobile',390,884]];
const result=[],failures=[],status=document.querySelector('#status'),output=document.querySelector('#output');
const frames=[];
function pause(){return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}
function storage(){return JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));}
function visible(e){const r=e.getBoundingClientRect();return r.width>0&&r.height>0;}
async function waitPage(frame,id,timeout=15000){const start=Date.now();while(Date.now()-start<timeout){const doc=frame.contentDocument;if(doc?.querySelector('.page-content')&&!doc.documentElement.hasAttribute('data-console-booting')&&doc.querySelector('main')?.dataset.page==='CON-P'+id){await pause();return doc;}await new Promise(r=>setTimeout(r,50));}throw Error('页面未就绪：'+id);}
function rect(e){const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};}
function measure(doc,entry,device){const page=doc.querySelector('.page-content'),main=doc.querySelector('.main-scroll'),bar=doc.querySelector('.topbar'),p=rect(page),m=rect(main),style=doc.defaultView.getComputedStyle(page),bs=doc.defaultView.getComputedStyle(bar);const row={device,id:entry.id,title:entry.title,path:entry.path,padding:[parseFloat(style.paddingLeft),parseFloat(style.paddingRight)],topbarPadding:[parseFloat(bs.paddingLeft),parseFloat(bs.paddingRight)],blocks:[],issues:[]};
 if(row.padding.some(x=>x!==16))row.issues.push('正文左右非16px');if(row.topbarPadding.some(x=>x!==16))row.issues.push('顶栏左右非16px');
 if(main.scrollWidth>main.clientWidth+1)row.issues.push('正文横向溢出 '+(main.scrollWidth-main.clientWidth));
 if(device==='desktop'){const logo=rect(doc.querySelector('.sidebar-brand-row .brand-mark')),nav=rect(doc.querySelector('.shell-navigation'));row.menu={logoLeft:logo.left,menuLeft:nav.left};if(Math.abs(logo.left-nav.left)>.5)row.issues.push('菜单与Logo左边缘不齐');}
 const host=[...page.children].find(e=>e.tagName==='DIV'&&(!e.className||e.classList.contains('read-only-content')))||page;
 function check(e){if(!visible(e))return;const css=doc.defaultView.getComputedStyle(e),r=rect(e);if(css.position==='absolute'||css.position==='fixed'||css.display.startsWith('inline')||e.matches('button,a,span,script,style,br'))return;
 const left=r.left-p.left,right=p.right-r.right,kind=e.className||e.tagName;row.blocks.push({kind,left,right,width:r.width});if(Math.abs(left-16)>.6||Math.abs(right-16)>.6)row.issues.push(kind+'：左'+left.toFixed(2)+' 右'+right.toFixed(2));}
 [...host.children].forEach(check);
 // 页面级底部操作栏必须跟随外层边线；表单/卡片内的按钮保持原有内边距。
 for(const e of host.querySelectorAll('.theme-apply-bar,.config-mobile-actions')){if(e.closest('.ant-card-body,.provider-detail'))continue;if(!row.blocks.some(r=>r.kind===e.className))check(e);}
 row.page={left:p.left,right:p.right,top:p.top};return row;}
async function run(){if(location.port==='5177'){status.textContent='请在独立预览端口运行，避免接触当前配置。';return;}document.querySelector('#run').disabled=true;
 try{for(const [device,width,height] of dimensions){const section=document.createElement('section');section.style.width=(width/2)+'px';section.innerHTML='<h2>'+device+' · '+width+' × '+height+'</h2><div class="screen"></div>';const f=document.createElement('iframe');f.title=device+' 实际网页';f.style.width=width+'px';f.style.height=height+'px';section.querySelector('.screen').style.height=(height/2)+'px';section.querySelector('.screen').append(f);document.querySelector('#previews').append(section);f.src='../index.html?device='+device+'&host=web#/w/demo/home';await waitPage(f,'01');frames.push({device,frame:f});}
 const saved=storage();for(let i=0;i<cases.length;i++){const entry=cases[i];status.textContent='检查 '+(i+1)+'/'+cases.length+'：'+entry.title;for(const {frame}of frames)frame.contentWindow.location.hash=entry.path;
 for(const {device,frame}of frames){try{const doc=await waitPage(frame,entry.id);const row=measure(doc,entry,device);result.push(row);if(row.issues.length)failures.push(row);}catch(e){failures.push({device,...entry,issues:[e.message]});}}
 output.textContent='已检查 '+result.length+' 项，发现 '+failures.length+' 项待核对';}
 const unchanged=saved===storage();if(!unchanged)failures.push({title:'浏览配置一致性',issues:['独立预览数据发生变化，需核实原因']});
 window.layoutEdgeReport={cases:cases.length,checks:result.length,failures,configurationUnchanged:unchanged,results:result};
 status.textContent='检查结束：'+result.length+' 项 / '+failures.length+' 项待核对';output.textContent=failures.length?JSON.stringify(failures.map(({device,title,issues})=>({device,title,issues})),null,2):'全部通过：三端正文与顶栏左右16px，桌面菜单与Logo对齐，外层块无额外缩进。配置未变。';
 document.querySelector('#download').disabled=false;
 for(const {frame}of frames)frame.contentWindow.location.hash='/w/demo/system/info';
 }catch(e){status.textContent='检查中断：'+e.message;output.textContent=e.stack;} }
document.querySelector('#run').onclick=run;
document.querySelector('#download').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(window.layoutEdgeReport,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='tinybot-layout-edges-20261112-final.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
`;
await mkdir('dist/checks',{recursive:true});
await writeFile('dist/checks/layout-edges.js',runtime.replace('CASES',JSON.stringify(cases)));
await writeFile('dist/checks/layout-edges.html','<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>TinyBot 三端外层边距检查</title><style>body{margin:16px;font:14px system-ui;color:#17242e;background:#f4f6f8}h1{font-size:20px;margin:0 0 12px}button{padding:7px 14px;margin-right:8px}#status{font-weight:600;margin:12px 0}#output{white-space:pre-wrap;max-height:230px;overflow:auto;background:white;padding:12px;border:1px solid #dae0e5}#previews{display:flex;align-items:flex-start;gap:16px}section h2{font-size:14px}iframe{display:block;border:0;transform:scale(.5);transform-origin:top left}.screen{overflow:hidden;border:1px solid #cdd5dd;background:white}</style><h1>TinyBot 三端外层边距检查</h1><button id="run">开始逐页检查</button><button id="download" disabled>下载检查报告</button><div id="status">独立预览端口；只读取布局，不点保存或发起业务请求。</div><pre id="output">尚未开始</pre><div id="previews"></div><script src="./layout-edges.js"></script></html>');
console.log('Prepared dist/checks/layout-edges.html; run scripts/serve.py --port 5181');
