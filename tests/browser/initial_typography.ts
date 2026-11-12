// 只读验证夹具：不写入主题、形象或业务存储，不进入正常构建。
const result=document.createElement('pre');document.body.append(result);
const frame=document.createElement('iframe');document.body.append(frame);
const q=new URLSearchParams(location.search),device=q.get('device')||'desktop';
const host=q.get('host');
const [width,height]=device==='mobile'?[390,884]:device==='tablet'?[768,1024]:[1280,1024];
frame.style.cssText=`width:${width}px;height:${height}px;border:1px solid #ddd`;
const before=new Map(Array.from({length:localStorage.length},(_,i)=>{const key=localStorage.key(i)!;return [key,localStorage.getItem(key)];}));
const frames:unknown[]=[],variants=new Set<string>();let hidden=false,visible=0,complete=false;
const timer=setTimeout(()=>{if(!complete){complete=true;result.textContent=JSON.stringify({passed:false,reason:'首次字体显示超时',device,hidden,visible},null,2);}},15000);
frame.src=`../index.html?device=${device}${host?'&host='+encodeURIComponent(host):''}&ui=2.00#/w/demo/home`;
function sample(){
 const doc=frame.contentDocument,win=frame.contentWindow,h1=doc?.querySelector('h1');
 if(h1&&doc&&win){
  const root=doc.getElementById('root')!,shown=win.getComputedStyle(root).visibility==='visible';
  if(!shown)hidden=true;
  else{
   const css=win.getComputedStyle(h1),r=h1.getBoundingClientRect(),loaded=doc.fonts.check(`${css.fontWeight} ${css.fontSize} ${css.fontFamily.split(",")[0]}`,h1.textContent||'');
   const metrics={size:css.fontSize,family:css.fontFamily,width:r.width,height:r.height};variants.add(JSON.stringify(metrics));
   frames.push({loaded,status:doc.fonts.status,...metrics});visible++;
   if(visible>=30){
    complete=true;clearTimeout(timer);
    const unchanged=localStorage.length===before.size&&[...before].every(([key,value])=>localStorage.getItem(key)===value);
    const account=doc.querySelector<HTMLButtonElement>(host&&host!=='web'&&device!=='mobile'?'.account':'.mobile-account-menu');
    const box=account?.getBoundingClientRect();
    result.textContent=JSON.stringify({passed:variants.size===1&&frames.every((f:any)=>f.loaded&&f.status==='loaded')&&unchanged&&!!box&&box.width>0&&box.right<=width,device,host:host||'web',width,height,hiddenFramesObserved:hidden,visibleFrames:visible,typographyVariants:variants.size,storageUnchanged:unchanged,fontLoaded:frames.every((f:any)=>f.loaded&&f.status==='loaded'),metrics:frames[0],accountRect:box?{left:box.left,right:box.right,width:box.width}:null},null,2);
   }
  }
 }
 if(!complete)requestAnimationFrame(sample);
}
requestAnimationFrame(sample);
