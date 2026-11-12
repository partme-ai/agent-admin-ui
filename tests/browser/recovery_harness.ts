const params=new URLSearchParams(location.search),device=params.get('device')||'desktop';
const size=device==='mobile'?[390,884]:device==='tablet'?[768,1024]:[1280,1024];
document.body.innerHTML=`<header><strong>独立故障验证：${device} ${size.join(' × ')}</strong><p>合成440Hz输入；原页面/Hook/Recorder；不是实体麦克风或系统故障。控制区不进入产品构建。</p><label>测试输入 <select aria-label="测试输入">${['合成音频','拒绝授权','没有设备','设备占用','已断开输入','等待授权'].map(value=>`<option>${value}</option>`).join('')}</select></label> ${[['ended','模拟音轨断开'],['brief-mute','短暂静音恢复'],['mute','持续系统静音'],['no-pcm','停止PCM回调'],['late-grant','批准迟到授权'],['old-events','触发旧轮次事件'],['pagehide','模拟页面离开']].map(([command,label])=>`<button data-command="${command}">${label}</button>`).join('')}<output aria-label="采集资源观察">等待页面就绪</output></header><iframe title="TinyBot中断恢复验证" style="width:${size[0]}px;height:${size[1]}px" src="./recovery_product.html?device=${device}&host=${device==='tablet'?'ipad':device==='mobile'?'web':'desktop'}&theme=light#/w/demo/chat"></iframe>`;
const frame=document.querySelector('iframe')!;
const send=(data:object)=>frame.contentWindow?.postMessage({kind:'mic-recovery-control',...data},location.origin);
document.querySelector('select')!.addEventListener('change',event=>send({mode:(event.target as HTMLSelectElement).value}));
document.querySelectorAll<HTMLButtonElement>('[data-command]').forEach(button=>button.addEventListener('click',()=>send({command:button.dataset.command})));
window.addEventListener('message',event=>{
 if(event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.kind!=='mic-recovery-report')return;
 document.querySelector('output')!.textContent=`输入：${event.data.mode}；请求${event.data.requests}次；页面${event.data.visibility}；登记上下文${event.data.registeredContexts}个；${event.data.lastEvent}；${event.data.inputs.map((row:{round:number;track:string;context:string;pending:boolean})=>`轮${row.round} 音轨${row.track}/上下文${row.context}${row.pending?'/等待授权':''}`).join('；')||'尚未创建资源'}`;
});
