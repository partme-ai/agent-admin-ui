import {cameraError,releaseCamera} from './qr_reader.ts';
export type CameraPhase='idle'|'requesting'|'scanning';
type CameraPorts={acquire:()=>Promise<MediaStream>;attach:(stream:MediaStream)=>Promise<void>;detach:()=>void;phase:(phase:CameraPhase)=>void;error:(message:string)=>void;schedule?:(fn:()=>void,ms:number)=>unknown;cancel?:(id:unknown)=>void};
/** 单次扫码会话拥有自己的轨道、监听与计时器；停止后迟到授权只能释放。 */
export class CameraSession{
 private turn=0;
 private stream:MediaStream|null=null;
 private cleanup:Array<()=>void>=[];
 private running=false;
 private ports:CameraPorts;
 constructor(ports:CameraPorts){this.ports=ports;}
 get active(){return this.running;}
 private later(fn:()=>void,ms:number){const id=this.ports.schedule?this.ports.schedule(fn,ms):setTimeout(fn,ms);const cancel=()=>{if(this.ports.cancel)this.ports.cancel(id);else clearTimeout(id as ReturnType<typeof setTimeout>);};this.cleanup.push(cancel);return cancel;}
 private listen(target:EventTarget,event:string,handler:()=>void){target.addEventListener(event,handler);this.cleanup.push(()=>target.removeEventListener(event,handler));}
 stop(){this.turn++;this.running=false;this.cleanup.splice(0).forEach(fn=>fn());releaseCamera(this.stream);this.stream=null;this.ports.detach();this.ports.phase('idle');}
 async start():Promise<boolean>{
  this.stop();const turn=this.turn;this.ports.phase('requesting');
  const current=()=>turn===this.turn;
  const fail=(message:string)=>{if(current()){this.stop();this.ports.error(message);}};
  // 授权不能被浏览器API取消；超时后使请求失效，迟到的流立即停止。
  const cancelStart=this.later(()=>fail('相机启动超时，请检查浏览器和系统权限后重试。'),15000);
  try{
   const stream=await this.ports.acquire();
   if(!current()){releaseCamera(stream);return false;}
   this.stream=stream;
   const tracks=stream.getVideoTracks();
   if(!tracks.length||tracks.some(track=>track.readyState==='ended')){fail('相机采集已中断，请重试。');return false;}
   this.listen(stream,'inactive',()=>fail('相机采集已中断，请重试。'));
   for(const track of tracks){
    let cancelMute:(()=>void)|undefined;
    const muted=()=>{cancelMute?.();cancelMute=this.later(()=>fail('相机画面持续中断，已关闭采集，请重试。'),3000);};
    this.listen(track,'ended',()=>fail('相机采集已中断，请重试。'));
    this.listen(track,'mute',muted);this.listen(track,'unmute',()=>{cancelMute?.();cancelMute=undefined;});
    if(track.muted)muted();
   }
   // 在播放等待前注册监听，避免等待第一帧期间漏掉结束事件。
   await this.ports.attach(stream);
   if(!current())return false;
   cancelStart();this.running=true;this.ports.phase('scanning');return true;
  }catch(error){fail(cameraError(error));return false;}
 }
}
