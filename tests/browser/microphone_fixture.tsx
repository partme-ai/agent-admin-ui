import {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {initialCapture,MicrophoneCapture} from '../../src/microphone_capture';
import {browserCaptureEnvironment} from '../../src/recorder_capture';
import {MicrophoneInput} from '../../src/pages/MicrophoneInput';

/** 独立测试页：真实Recorder处理合成音频，不授予或替代麦克风权限。 */
function Fixture(){
 const [state,setState]=useState(initialCapture),[mode,setMode]=useState('合成音频'),[resource,setResource]=useState('未创建');
 const controller=useRef<MicrophoneCapture|null>(null),grant=useRef<(()=>void)|null>(null),last=useRef<{stream:MediaStream;context:AudioContext}|null>(null);
 useEffect(()=>{const timer=setInterval(()=>{if(last.current)setResource(`音轨${last.current.stream.getTracks()[0].readyState} / 上下文${last.current.context.state}`);},50);return()=>{clearInterval(timer);controller.current?.dispose();};},[]);
 function start(){controller.current?.dispose();const base=browserCaptureEnvironment();let context:AudioContext;
  controller.current=new MicrophoneCapture({...base,createContext:()=>{context=new AudioContext();void context.resume();return context;},getStream:()=>{
   if(mode==='拒绝授权')return Promise.reject({name:'NotAllowedError'});
   if(mode==='没有设备')return Promise.reject({name:'NotFoundError'});
   const source=context.createOscillator(),gain=context.createGain(),dest=context.createMediaStreamDestination();source.frequency.value=440;gain.gain.value=.12;source.connect(gain);gain.connect(dest);source.start();last.current={stream:dest.stream,context};setResource('音轨live');
   if(mode==='等待授权')return new Promise(resolve=>{grant.current=()=>resolve(dest.stream);});
   return Promise.resolve(dest.stream);
  }},snapshot=>{setState(snapshot);if(last.current)setResource(`音轨${last.current.stream.getTracks()[0].readyState} / 上下文${last.current.context.state}`);});controller.current.start();
 }
 return <main><h1>Recorder采集隔离验证</h1><p>测试源为合成440Hz音频，不是实际麦克风。控件不进入产品页面。</p><label>测试输入 <select aria-label="测试输入" value={mode} onChange={e=>setMode(e.target.value)}>{['合成音频','拒绝授权','没有设备','等待授权'].map(v=><option key={v}>{v}</option>)}</select></label><MicrophoneInput capture={state}/><p role="alert">{state.message}</p><output aria-label="测试资源">{resource}</output><div><button onClick={start}>开始测试采集</button><button onClick={()=>controller.current?.stop()}>停止测试采集</button><button onClick={()=>controller.current?.interrupt('已注入采集中断，音轨与上下文已释放。')}>注入采集中断</button><button onClick={()=>grant.current?.()}>批准迟到授权</button></div></main>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
