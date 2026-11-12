import {browserCaptureEnvironment as realEnvironment} from '../../src/recorder_capture';
import type {CaptureEnvironment,RecorderOptions} from '../../src/microphone_capture';

type Input={context:AudioContext;gain?:GainNode;stream?:MediaStream;pending?:()=>void;suppress:boolean;process?:RecorderOptions['onProcess']};
const inputs:Input[]=[];
let mode='合成音频',requests=0,lastEvent='就绪';
// 只在测试专用bundle替换浏览器输入边界；页面、Hook、控制器和Recorder仍用产品源码。
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||event.data?.kind!=='mic-recovery-control')return;
 if(event.data.mode)mode=event.data.mode;
 const row=inputs.at(-1),track=row?.stream?.getAudioTracks()[0];
 if(event.data.command==='voice'&&row?.gain)row.gain.gain.value=.12;
 if(event.data.command==='silence'&&row?.gain)row.gain.gain.value=0;
 if(event.data.command==='ended'&&track){track.stop();track.dispatchEvent(new Event('ended'));}
 if(event.data.command==='mute'&&track)track.dispatchEvent(new Event('mute'));
 if(event.data.command==='brief-mute'&&track){lastEvent='短暂静音中';track.dispatchEvent(new Event('mute'));setTimeout(()=>{track.dispatchEvent(new Event('unmute'));lastEvent='短暂静音已恢复';},300);}
 if(event.data.command==='no-pcm'&&row)row.suppress=true;
 if(event.data.command==='late-grant')inputs.find(v=>v.pending)?.pending?.();
 if(event.data.command==='old-events')for(const old of inputs.slice(0,-1)){old.stream?.getAudioTracks()[0]?.dispatchEvent(new Event('ended'));old.process?.([new Int16Array(1024).fill(20000)],95,0,16000,0);}
 if(event.data.command==='pagehide')window.dispatchEvent(new PageTransitionEvent('pagehide'));
});
setInterval(()=>parent.postMessage({kind:'mic-recovery-report',mode,requests,lastEvent,registeredContexts:((window as typeof window&{Recorder:{NewCtxs?:unknown[]}}).Recorder.NewCtxs||[]).length,visibility:document.visibilityState,inputs:inputs.map((row,i)=>({round:i+1,track:row.stream?.getAudioTracks()[0]?.readyState||'未获得',context:row.context.state,pending:!!row.pending}))},location.origin),100);

export function browserCaptureEnvironment():CaptureEnvironment{
 const base=realEnvironment();let row:Input;
 return {...base,createContext:()=>{
  const context=base.createContext() as AudioContext;row={context,suppress:false};inputs.push(row);return context;
 },getStream:()=>{
  requests++;
  if(mode==='拒绝授权')return Promise.reject({name:'NotAllowedError'});
  if(mode==='没有设备')return Promise.reject({name:'NotFoundError'});
  if(mode==='设备占用')return Promise.reject({name:'NotReadableError'});
  const oscillator=row.context.createOscillator(),gain=row.context.createGain(),dest=row.context.createMediaStreamDestination();oscillator.frequency.value=440;gain.gain.value=0;row.gain=gain;oscillator.connect(gain);gain.connect(dest);oscillator.start();row.stream=dest.stream;
  if(mode==='已断开输入')dest.stream.getAudioTracks()[0].stop();
  if(mode==='等待授权'){const pendingRow=row;return new Promise(resolve=>{pendingRow.pending=()=>{pendingRow.pending=undefined;resolve(dest.stream);};});}
  return Promise.resolve(dest.stream);
 },createRecorder:options=>{
  row.process=options.onProcess;
  return base.createRecorder({...options,onProcess:(...args)=>{if(!row.suppress)options.onProcess(...args);}});
 }};
}

let spoken=0,cancelled=0,playing:SpeechSynthesisUtterance|null=null;
const fakeSpeech={getVoices:()=>[{localService:true,lang:'zh-CN',name:'本地测试音色',voiceURI:'fixture',default:true}],speak:(u:SpeechSynthesisUtterance)=>{spoken++;playing=u;},cancel:()=>{cancelled++;const old=playing;playing=null;old?.onerror?.({error:'canceled'} as SpeechSynthesisErrorEvent);}};
Object.defineProperty(window,'speechSynthesis',{value:fakeSpeech,configurable:true});
setInterval(()=>{document.documentElement.dataset.playbackProbe=JSON.stringify({spoken,cancelled,playing:!!playing});},50);

Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class {voice=null;lang='';rate=1;pitch=1;volume=1;onend=null;onerror=null;text:string;constructor(text:string){this.text=text;}},configurable:true});
