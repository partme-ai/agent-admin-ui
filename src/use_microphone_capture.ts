import {useEffect,useRef,useState} from 'react';
import {initialCapture,MicrophoneCapture} from './microphone_capture';
import {browserCaptureEnvironment} from './recorder_capture';
/** 页面与角色抽屉共用采集生命周期，隐藏与卸载时释放全部资源。 */
export function useMicrophoneCapture(onPcm?:(pcm:Int16Array,sampleRate:number)=>void){
 const pcmListener=useRef(onPcm);pcmListener.current=onPcm;
 const [capture,setCapture]=useState(initialCapture),controller=useRef<MicrophoneCapture|null>(null);
 useEffect(()=>{
  const mic=new MicrophoneCapture(browserCaptureEnvironment(),setCapture,(pcm,rate)=>pcmListener.current?.(pcm,rate));controller.current=mic;
  const visibility=()=>{if(document.hidden)mic.interrupt();};
  const leave=()=>mic.interrupt('页面已离开，麦克风采集已停止并释放。');
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',leave);
  return()=>{controller.current=null;document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',leave);mic.dispose();};
 },[]);
 return {capture,start:()=>controller.current?.start(),stop:()=>controller.current?.stop(),reset:()=>controller.current?.reset()};
}
