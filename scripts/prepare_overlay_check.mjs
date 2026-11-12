/** 生成仅在独立预览端口运行的浮层几何与滚动检查夹具，不保存业务数据。 */
import {mkdir,writeFile} from 'node:fs/promises';
const B=button=>({button}),T=tab=>({tab}),S=selector=>({selector});
const cases=[
 ['全局搜索','system/info',[S('[aria-label="全局搜索"]')]],
 ['通知待办','system/info',[S('[aria-label="通知"]')]],
 ['个人信息','system/info',[S('[aria-label="账户菜单"]'),S('.account-menu-identity')]],
 ['配置确认','devices/b1',[B('继承智能体配置')]],
 ['标识编辑','system/info',[B('编辑标识')]],
 ['系统用户','system/users',[B('新建用户')]],
 ['系统角色','system/roles',[B('新建角色')]],
 ['数据字典','system/settings?item=dictionary',[B('添加字典项')]],
 ['变量参数','system/settings?item=variables',[B('添加配置')]],
 ['知识库创建','knowledge',[B('创建知识库')]],
 ['公共知识库','knowledge/market',[B('预览并使用')]],
 ['自定义提供方','models',[B('自定义提供方')]],
 ['提供方定义','models',[B('自定义提供方'),B('添加提供方')]],
 ['模型负载','models/gateway/load',[B('新建规则')]],
 ['模型降级','models/gateway/fallback',[B('新建规则')]],
 ['模型限流','models/gateway/rate',[B('新建规则')]],
 ['模型熔断','models/gateway/breaker',[B('新建规则')]],
 ['网关试算','models/gateway/load',[B('试算')]],
 ['同步技能','agents/skills',[B('同步数据')]],
 ['技能编辑','agents/skills',[B('创建技能')]],
 ['技能详情','agents/skills',[B('查看')]],
 ['MCP连接','agents/connections',[B('添加连接')]],
 ['角色试聊','agents/a1/edit',[B('模拟试聊')]],
 ['绑定设备','agents/a1/edit',[B('绑定设备')]],
 ['Prompt结构','agents/a1/edit',[T('角色提示词'),B('结构示例')]],
 ['Prompt模板','agents/a1/edit',[T('角色提示词'),B('我的模板')]],
 ['保存Prompt模板','agents/a1/edit',[T('角色提示词'),B('存为模板')]],
 ['角色快捷命令','agents/a1/edit',[T('命令与钩子'),B('添加命令')]],
 ['角色事件钩子','agents/a1/edit',[T('命令与钩子'),B('添加钩子')]],
 ['市场角色详情','agents/templates',[B('查看角色')]],
 ['试聊参数','chat',[B('VAD、上下文与语音参数')]],
 ['机器人形象','chat',[S('[aria-label="选择机器人形象"]')]],
 ['音色库','chat',[S('[aria-label="选择音色"]')]],
 ['设备配置','devices/b1',[B('编辑配置')]],
 ['设备形象','devices/b1',[B('形象与表情')]],
 ['固件编辑','firmware',[B('添加固件')]],
 ['创建声音','voices',[B('创建声音')]],
 ['声纹登记','voices/speakers',[B('登记成员')]],
 ['联系人','contacts',[B('添加联系人')]],
 ['资源空间','resources/spaces',[B('新建资源空间')]],
 ['任务创建','tasks',[B('创建任务')]],
 ['主题定制','settings/general?item=theme',[B('自定义主题')]],
 ['服务分享','settings/general?item=terminals',[B('分享此服务')]],
].map(([name,path,steps])=>({name,path:'/w/demo/'+path,steps}));
const code=String.raw`
const parameters=new URLSearchParams(location.search),cases=CASES.filter(entry=>!parameters.get('names')||parameters.get('names').split(',').includes(entry.name)).slice(0,Number(parameters.get('limit'))||Infinity),report={cases:cases.length,results:[],failures:[],configurationUnchanged:null};
const dimensions=[['desktop',1280,1024],['tablet',768,1024],['mobile',390,884]],frames=[];
const status=document.querySelector('#status'),output=document.querySelector('#output');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function visible(e){return e&&e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&e.getBoundingClientRect().height>0&&!e.closest('.ant-drawer-content-wrapper-hidden,.ant-modal-wrap-hidden');}
function box(e){const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};}
function storage(){return JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));}
async function ready(f,path){f.contentWindow.location.hash=path;for(let i=0;i<180;i++){const d=f.contentDocument;if(d?.querySelector('.page-content')&&!d.documentElement.hasAttribute('data-console-booting')&&f.contentWindow.location.hash.slice(1)===path){await delay(80);return d;}await delay(50);}throw Error('页面未就绪');}
function overlays(d){return [...d.querySelectorAll('.ant-modal-container,.ant-drawer-section')].filter(visible);}
async function closeAll(d){for(let i=0;i<5;i++){const list=overlays(d);if(!list.length)return;const root=list.at(-1),close=root.querySelector('.ant-modal-close,.ant-drawer-close')||[...root.querySelectorAll('button')].find(button=>button.textContent.trim()==='取消');if(!close)throw Error('没有安全关闭按钮：'+root.textContent.slice(0,50));close.click();for(let tick=0;tick<200&&visible(root);tick++)await delay(50);if(visible(root))throw Error('浮层未关闭');}if(overlays(d).length)throw Error('浮层未关闭');}
// 等待真实开合动画结束后量边线，避免把缩放过程中的坐标当作静态边距。
async function settled(d){let previous='',stable=0;for(let tick=0;tick<200;tick++){const root=overlays(d).at(-1);if(root){const layer=root.closest('.ant-modal,.ant-drawer-content-wrapper')||root;const moving=layer.getAnimations({subtree:true}).some(animation=>(animation.playState==='running'||animation.pending)&&animation.effect?.getTiming().iterations!==Infinity),r=box(root),position=[r.left,r.top,r.width,r.height].map(value=>value.toFixed(2)).join(',');stable=!moving&&position===previous?stable+1:0;previous=position;if(stable>=2)return;}await delay(50);}throw Error('浮层未完成展开');}
async function clickStep(d,step){const selector=step.selector|| (step.tab?'[role="tab"]':'button');for(let i=0;i<80;i++){const candidates=[...d.querySelectorAll(selector)].filter(visible);const target=candidates.find(e=>!e.disabled&&(step.selector||step.tab&&e.textContent.includes(step.tab)||step.button&&e.textContent.trim()===step.button));if(target){target.scrollIntoView({block:'nearest',inline:'nearest'});target.click();await delay(340);return;}await delay(40);}throw Error('找不到入口：'+JSON.stringify(step));}
async function measure(d,device,entry){const root=overlays(d).at(-1);if(!root)throw Error('浮层未打开');const type=root.matches('.ant-modal-container')?'modal':'drawer',prefix='.ant-'+type,r=box(root),win=d.defaultView,header=root.querySelector(prefix+'-header'),body=root.querySelector(prefix+'-body'),footer=root.querySelector(prefix+'-footer'),row={device,name:entry.name,type,title:root.querySelector(prefix+'-title')?.textContent,root:r,parts:{},scrolls:[],issues:[]};
 for(const [name,e]of [['header',header],['body',body],['footer',footer]]){if(!e||!visible(e))continue;const b=box(e),s=win.getComputedStyle(e);const left=b.left-r.left+parseFloat(s.paddingLeft),right=r.right-b.right+parseFloat(s.paddingRight);row.parts[name]={left,right,box:b,padding:[s.paddingLeft,s.paddingRight]};if(Math.abs(left-16)>.6||Math.abs(right-16)>.6)row.issues.push(name+'边距：'+left.toFixed(2)+'/'+right.toFixed(2));}
 if(r.top<-.6||r.bottom>win.innerHeight+.6)row.issues.push('浮层超出视口');if(body&&footer&&visible(footer)&&box(body).bottom>box(footer).top+.6)row.issues.push('底栏覆盖正文');
 if(footer&&visible(footer)){const f=box(footer);for(const button of footer.querySelectorAll('button')){const b=box(button);if(visible(button)&&(b.top<f.top-.6||b.bottom>f.bottom+.6||b.left<f.left-.6||b.right>f.right+.6))row.issues.push('底栏按钮超出操作区：'+button.textContent);}}
 if(body){const scrolls=[body,...body.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+1&&/auto|scroll/.test(win.getComputedStyle(e).overflowY));for(const e of scrolls){e.scrollTop=e.scrollHeight;await delay(10);row.scrolls.push({className:e.className,top:e.scrollTop,height:e.clientHeight,total:e.scrollHeight,reachedEnd:e.scrollTop+e.clientHeight>=e.scrollHeight-1});if(!row.scrolls.at(-1).reachedEnd)row.issues.push('无法滚到底部：'+e.className);}}
 return row;}
async function run(){if(location.port==='5177'){status.textContent='请在独立预览端口运行';return;}document.querySelector('#run').disabled=true;
 try{for(const [device,width,height]of dimensions){const section=document.createElement('section'),f=document.createElement('iframe');section.style.width=width/2+'px';section.innerHTML='<h2>'+device+' · '+width+' × '+height+'</h2><div class="screen"></div>';section.querySelector('.screen').style.height=height/2+'px';f.style.width=width+'px';f.style.height=height+'px';section.querySelector('.screen').append(f);document.querySelector('#previews').append(section);f.src='../index.html?device='+device+'&host=web#/w/demo/system/info';await new Promise(resolve=>f.onload=resolve);await ready(f,'/w/demo/system/info');frames.push({device,frame:f});}
 const saved=storage();for(let i=0;i<cases.length;i++){const entry=cases[i];status.textContent='检查 '+(i+1)+'/'+cases.length+'：'+entry.name;
 for(const {device,frame}of frames){await ready(frame,'/w/demo/system/info');const d=await ready(frame,entry.path);try{await closeAll(d);for(const step of entry.steps)await clickStep(d,step);await settled(d);const row=await measure(d,device,entry);report.results.push(row);if(row.issues.length)report.failures.push(row);}catch(e){report.failures.push({device,name:entry.name,issues:[e.message]});}finally{try{await closeAll(d);}catch(e){report.failures.push({device,name:entry.name,issues:[e.message]});}}}
 output.textContent='已检查 '+report.results.length+' 项，待核对 '+report.failures.length+' 项';}
 report.configurationUnchanged=saved===storage();if(!report.configurationUnchanged)report.failures.push({name:'配置一致性',issues:['独立站点配置发生变化，需核实']});window.overlayCheckReport=report;status.textContent='检查结束：'+report.results.length+' 项 / '+report.failures.length+' 项待核对';output.textContent=report.failures.length?JSON.stringify(report.failures.map(({device,name,type,title,issues})=>({device,name,type,title,issues})),null,2):'全部通过：标题区、正文表单外框、底栏左右16px；底栏不覆盖正文，长内容可滚到底部；配置未变。';document.querySelector('#download').disabled=false;
 for(const {frame}of frames)await ready(frame,'/w/demo/system/info');
 }catch(e){status.textContent='检查中断：'+e.message;output.textContent=e.stack;}}
document.querySelector('#run').onclick=run;document.querySelector('#download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='tinybot-overlay-check-20261112-final.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
`;
await mkdir('dist/checks',{recursive:true});
await writeFile('dist/checks/overlays.js',code.replace('CASES',JSON.stringify(cases)));
await writeFile('dist/checks/overlays.html','<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>TinyBot 三端浮层检查</title><style>body{margin:16px;font:14px system-ui;background:#f4f6f8;color:#17242e}h1{font-size:20px}button{padding:7px 14px;margin-right:8px}#status{font-weight:600;margin:12px 0}#output{white-space:pre-wrap;max-height:240px;overflow:auto;background:white;padding:12px;border:1px solid #dae0e5}#previews{display:flex;align-items:flex-start;gap:16px}section h2{font-size:14px}iframe{display:block;border:0;transform:scale(.5);transform-origin:top left}.screen{overflow:hidden;border:1px solid #ccd4db}</style><h1>TinyBot 三端浮层检查</h1><button id="run">开始检查弹窗与抽屉</button><button id="download" disabled>下载检查报告</button><div id="status">独立端口，只打开、滚动和关闭浮层，不点保存或开启媒体设备。</div><pre id="output">尚未开始</pre><div id="previews"></div><script src="./overlays.js"></script></html>');
console.log('Prepared dist/checks/overlays.html');
