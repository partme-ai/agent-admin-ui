import test from 'node:test';
import assert from 'node:assert/strict';
import {MicrophoneCapture,captureErrorMessage,type CaptureEnvironment,type CaptureSnapshot,type RecorderOptions} from '../src/microphone_capture.ts';

function fixture(){
 let resolve!:(s:MediaStream)=>void,reject!:(e:unknown)=>void,process:RecorderOptions['onProcess']=()=>{},closed=0,started=0,ctxClosed=0,stopped=0;
 const events=new Map<string,()=>void>(),track={readyState:'live',addEventListener:(n:string,fn:()=>void)=>events.set(n,fn),removeEventListener:(n:string)=>events.delete(n),stop:()=>{stopped++;track.readyState='ended';}};
 const stream={getTracks:()=>[track],getAudioTracks:()=>[track]} as unknown as MediaStream;
 const tasks=new Map<number,()=>void>();let timerId=0;
 const env:CaptureEnvironment={getStream:()=>new Promise((ok,no)=>{resolve=ok;reject=no;}),createContext:()=>({close:()=>{ctxClosed++;}}),createRecorder:o=>{process=o.onProcess;return {open:ok=>ok(),start:()=>{started++;},close:()=>{closed++;}};},setTimer:fn=>{tasks.set(++timerId,fn);return timerId;},clearTimer:id=>{tasks.delete(id);}};
 const states:CaptureSnapshot[]=[],mic=new MicrophoneCapture(env,s=>states.push(s));
 return {mic,states,stream,track,events,tasks,grant:()=>resolve(stream),reject:(e:unknown)=>reject(e),frame:()=>process([new Int16Array([0,8000,-8000,16000])],50,0,16000,0),counts:()=>({closed,started,ctxClosed,stopped})};
}
const tick=()=>new Promise<void>(resolve=>setImmediate(resolve));
test('授权后真实PCM产生电平与波形；停止关闭Recorder、音轨和上下文',async()=>{
 const f=fixture();f.mic.start();assert.equal(f.states.at(-1)?.phase,'requesting');f.grant();await tick();f.frame();
 assert.equal(f.states.at(-1)?.phase,'recording');assert.equal(f.states.at(-1)?.level,50);assert.equal(f.states.at(-1)?.sampleRate,16000);assert.ok(f.states.at(-1)?.waveform.some(n=>n>0));
 f.mic.stop();assert.equal(f.states.at(-1)?.phase,'stopped');assert.equal(f.states.at(-1)?.level,0);assert.deepEqual(f.counts(),{closed:1,started:1,ctxClosed:1,stopped:1});assert.equal(f.tasks.size,0);
});
test('取消等待后迟到授权立即关闭音轨，不再启动录音',async()=>{
 const f=fixture();f.mic.start();f.mic.stop();f.grant();await tick();assert.equal(f.counts().started,0);assert.equal(f.counts().stopped,1);assert.equal(f.states.at(-1)?.phase,'stopped');
});
test('拒绝授权、无设备和占用给出具体原因，不伪造采集成功',async()=>{
 for(const name of ['NotAllowedError','NotFoundError','NotReadableError']){const f=fixture();f.mic.start();f.reject({name});await tick();assert.equal(f.states.at(-1)?.phase,'error');assert.equal(f.states.at(-1)?.message,captureErrorMessage({name}));assert.equal(f.counts().started,0);}
});
test('音轨结束中断采集，旧PCM不能继续更新状态',async()=>{
 const f=fixture();f.mic.start();f.grant();await tick();f.frame();f.events.get('ended')?.();const n=f.states.length;assert.equal(f.states.at(-1)?.phase,'error');assert.equal(f.counts().stopped,1);f.frame();assert.equal(f.states.length,n);
});
test('授权等待和无PCM超时释放资源，卸载后不再通知页面',async()=>{
 const pending=fixture();pending.mic.start();[...pending.tasks.values()][0]();assert.equal(pending.states.at(-1)?.phase,'error');pending.grant();await tick();assert.equal(pending.counts().stopped,1);
 const f=fixture();f.mic.start();f.grant();await tick();[...f.tasks.values()][0]();assert.equal(f.states.at(-1)?.phase,'error');assert.equal(f.counts().stopped,1);f.mic.dispose();const n=f.states.length;f.frame();assert.equal(f.states.length,n);
});
test('采集开始异常同样关闭已获授权的音轨',async()=>{
 let stopped=0,closed=0;const track={readyState:'live',stop:()=>stopped++,addEventListener:()=>{},removeEventListener:()=>{}};const env:CaptureEnvironment={getStream:async()=>({getTracks:()=>[track],getAudioTracks:()=>[track]} as unknown as MediaStream),createContext:()=>({close:()=>{closed++;}}),createRecorder:()=>{throw new Error('engine failed');}};
 const states:CaptureSnapshot[]=[],mic=new MicrophoneCapture(env,s=>states.push(s));mic.start();await tick();assert.equal(states.at(-1)?.phase,'error');assert.equal(stopped,1);assert.equal(closed,1);
});
test('短暂mute恢复不误报，页面中断关闭资源并允许新一轮',async()=>{
 const f=fixture();f.mic.start();f.grant();await tick();f.frame();f.events.get('mute')?.();assert.equal(f.tasks.size,2);f.events.get('unmute')?.();assert.equal(f.tasks.size,1);f.mic.interrupt();assert.equal(f.states.at(-1)?.phase,'error');assert.equal(f.tasks.size,0);f.track.readyState='live';f.mic.start();assert.equal(f.states.at(-1)?.phase,'requesting');f.grant();await tick();f.frame();assert.equal(f.states.at(-1)?.phase,'recording');f.mic.stop();
});
test('不安全或不支持的浏览器不触发授权；卸载期间的迟到授权被释放',async()=>{
 let opened=0;const states:CaptureSnapshot[]=[];const env:CaptureEnvironment={preflight:()=> '需要HTTPS',getStream:async()=>{opened++;throw Error();},createContext:()=>({close:()=>{}}),createRecorder:()=>{throw Error();}};
 new MicrophoneCapture(env,s=>states.push(s)).start();assert.equal(opened,0);assert.equal(states.at(-1)?.message,'需要HTTPS');
 const f=fixture();f.mic.start();f.mic.dispose();const n=f.states.length;f.grant();await tick();assert.equal(f.states.length,n);assert.equal(f.counts().stopped,1);
});
test('取消后立刻重试，上一轮迟到授权不能关闭新一轮音轨',async()=>{
 const pending:((s:MediaStream)=>void)[]=[],stops=[0,0];let starts=0;const states:CaptureSnapshot[]=[];
 const stream=(n:number)=>{const track={readyState:'live',stop:()=>stops[n]++,addEventListener:()=>{},removeEventListener:()=>{}};return {getTracks:()=>[track],getAudioTracks:()=>[track]} as unknown as MediaStream;};
 const mic=new MicrophoneCapture({getStream:()=>new Promise(resolve=>pending.push(resolve)),createContext:()=>({close:()=>{}}),createRecorder:()=>({open:ok=>ok(),start:()=>starts++,close:()=>{}})},s=>states.push(s));
 mic.start();mic.stop();mic.start();pending[0](stream(0));pending[1](stream(1));await tick();assert.deepEqual(stops,[1,0]);assert.equal(starts,1);assert.equal(states.at(-1)?.phase,'recording');mic.dispose();assert.deepEqual(stops,[1,1]);
});
test('已经断开的输入不进入录音状态，释放后可以重新连接并采集',async()=>{
 const f=fixture();f.track.readyState='ended';f.mic.start();f.grant();await tick();
 assert.equal(f.states.at(-1)?.phase,'error');assert.equal(f.counts().started,0);assert.equal(f.counts().ctxClosed,1);assert.equal(f.events.size,0);
 f.track.readyState='live';f.mic.start();f.grant();await tick();f.frame();assert.equal(f.states.at(-1)?.phase,'recording');assert.equal(f.states.at(-1)?.level,50);f.mic.stop();
});
test('PCM停止、持续mute及音轨断开均释放资源，重试不会接收上一轮事件',async()=>{
 for(const reason of ['pcm-timeout','mute','ended']){
  const f=fixture();f.mic.start();f.grant();await tick();f.frame();
  const oldEnded=f.events.get('ended')!;
  if(reason==='pcm-timeout')[...f.tasks.values()][0]();
  else if(reason==='mute'){f.events.get('mute')!();[...f.tasks.values()].at(-1)!();}
  else oldEnded();
  assert.equal(f.states.at(-1)?.phase,'error',reason);assert.equal(f.states.at(-1)?.level,0);assert.ok(f.states.at(-1)?.waveform.every(v=>v===0));assert.equal(f.tasks.size,0);assert.equal(f.events.size,0);
  f.track.readyState='live';f.mic.start();f.grant();await tick();f.frame();const count=f.states.length;oldEnded();assert.equal(f.states.length,count);assert.equal(f.states.at(-1)?.phase,'recording');f.mic.stop();assert.equal(f.tasks.size,0);
 }
});
test('重新开始清空上一轮时长和采样统计，旧PCM不能恢复采集',async()=>{
 const f=fixture();f.mic.start();f.grant();await tick();f.frame();
 f.mic.reset?.();assert.equal(f.states.at(-1)?.phase,'idle');assert.equal(f.states.at(-1)?.samples,0);assert.equal(f.states.at(-1)?.sampleRate,0);assert.equal(f.states.at(-1)?.durationMs,0);assert.equal(f.states.at(-1)?.level,0);assert.equal(f.tasks.size,0);
 const count=f.states.length;f.frame();assert.equal(f.states.length,count);assert.equal(f.counts().stopped,1);
});
test('结束与异常通过环境的配套入口释放上下文登记',async()=>{
 let nativeClosed=0,managedClosed=0;const states:CaptureSnapshot[]=[];
 const mic=new MicrophoneCapture({getStream:()=>Promise.reject({name:'NotAllowedError'}),createContext:()=>({close:()=>{nativeClosed++;}}),closeContext:context=>{managedClosed++;context.close();},createRecorder:()=>{throw Error('不应启动');}},s=>states.push(s));
 mic.start();await tick();assert.equal(states.at(-1)?.phase,'error');assert.equal(managedClosed,1);assert.equal(nativeClosed,1);mic.start();mic.stop();await tick();assert.equal(managedClosed,2);assert.equal(nativeClosed,2);
});
test('PCM交给VAD消费者；停止后的迟到PCM不能触发连续轮次',async()=>{
 let process:RecorderOptions['onProcess']=()=>{},frames=0;const track={readyState:'live',stop:()=>{},addEventListener:()=>{},removeEventListener:()=>{}};
 const env:CaptureEnvironment={getStream:async()=>({getTracks:()=>[track],getAudioTracks:()=>[track]} as unknown as MediaStream),createContext:()=>({close:()=>{}}),createRecorder:o=>{process=o.onProcess;return {open:ok=>ok(),start:()=>{},close:()=>{}};}};
 const mic=new MicrophoneCapture(env,()=>{},(pcm,rate)=>{assert.equal(rate,16000);frames+=pcm.length;});
 mic.start();await tick();process([new Int16Array(320)],0,20,16000,0);assert.equal(frames,320);mic.stop();process([new Int16Array(320)],0,20,16000,0);assert.equal(frames,320);
});
