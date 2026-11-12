// 只读几何验收：按菜单背景行框与页面标题区域的边缘测量，不按文字字面测量。
const q=new URLSearchParams(location.search),device=q.get('device')||'desktop';
const [width,height]=device==='mobile'?[390,884]:device==='tablet'?[768,1024]:[1280,1024];
const report=document.createElement('pre'),frame=document.createElement('iframe');document.body.append(report,frame);
frame.style.cssText=`width:${width}px;height:${height}px;border:1px solid #ddd`;
const pages=['home','models','agents','settings/general?item=theme','devices/b1'],results:unknown[]=[];
const before=new Map(Array.from({length:localStorage.length},(_,i)=>{const k=localStorage.key(i)!;return [k,localStorage.getItem(k)];}));
for(const page of pages){
 await new Promise<void>(resolve=>{frame.onload=()=>resolve();frame.src=`../index.html?device=${device}&host=web&ui=2.01-${encodeURIComponent(page)}#/w/demo/${page}`;});
 const doc=frame.contentDocument!,win=frame.contentWindow!;
 await new Promise<void>((resolve,reject)=>{
  const limit=setTimeout(()=>reject(Error('首屏等待超时')),15000);
  const check=()=>{if(doc.querySelector('h1')&&!doc.documentElement.hasAttribute('data-console-booting')){clearTimeout(limit);resolve();}else requestAnimationFrame(check);};check();
 });
 const menu=doc.querySelector<HTMLElement>('.sidebar .shell-menu>.ant-menu-item')!;
 const header=doc.querySelector<HTMLElement>('.page-header')!;
 const menuTop=menu.getBoundingClientRect().top,headerTop=header.getBoundingClientRect().top;
 const size=win.getComputedStyle(menu).fontSize;
 const row={page,menuTop,headerTop,delta:menuTop-headerTop,fontSize:size,passed:device==='mobile'||Math.abs(menuTop-headerTop)<=1};results.push(row);const line=document.createElement('p');line.textContent=JSON.stringify(row);report.before(line);
}
const storageUnchanged=before.size===localStorage.length&&[...before].every(([key,value])=>localStorage.getItem(key)===value);
report.textContent=JSON.stringify({device,width,height,passed:results.every((r:any)=>r.passed)&&storageUnchanged,storageUnchanged},null,2);
