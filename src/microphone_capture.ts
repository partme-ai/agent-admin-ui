/** 麦克风采集状态；只处理瞬时PCM与电平，不上传或保存录音。 */
export type CaptureSnapshot={phase:'idle'|'requesting'|'recording'|'stopped'|'error';level:number;waveform:number[];durationMs:number;sampleRate:number;samples:number;message:string};
export const initialCapture=():CaptureSnapshot=>({phase:'idle',level:0,waveform:Array(32).fill(0),durationMs:0,sampleRate:0,samples:0,message:''});
export type RecorderOptions={type:string;sourceStream:MediaStream;runningContext:CaptureContext;onProcess:(buffers:(Int16Array|null)[],power:number,duration:number,sampleRate:number,newIndex:number)=>void};
export type CaptureContext={close:()=>void|Promise<void>};
export type RecorderPort={open:(ok:()=>void,fail:(message:string)=>void)=>void;start:()=>void;close:()=>void};
/** 采集环境可注入，测试权限竞态与断流时无需使用真实麦克风。 */
export type CaptureEnvironment={getStream:()=>Promise<MediaStream>;createContext:()=>CaptureContext;closeContext?:(context:CaptureContext)=>void|Promise<void>;createRecorder:(options:RecorderOptions)=>RecorderPort;preflight?:()=>string;setTimer?:(fn:()=>void,ms:number)=>number;clearTimer?:(id:number)=>void};
type Session={stream?:MediaStream;context?:CaptureContext;recorder?:RecorderPort;listeners:{track:MediaStreamTrack;event:string;fn:()=>void}[];timer?:number;muteTimer?:number;clearIndex:number};
/** 将浏览器错误转换为可恢复的用户提示。 */
export function captureErrorMessage(error:unknown):string{
 const name=(error as {name?:string})?.name;
 if(name==='NotAllowedError'||name==='PermissionDeniedError')return '麦克风权限被拒绝。请在浏览器的网站设置中允许麦克风，再重试。';
 if(name==='NotFoundError'||name==='DevicesNotFoundError')return '没有找到麦克风。请连接设备并检查系统输入设置。';
 if(name==='NotReadableError'||name==='TrackStartError')return '麦克风暂时无法使用，可能被其他应用占用或被系统禁止。';
 if(name==='OverconstrainedError')return '当前麦克风不支持请求的采集设置。请更换输入设备后重试。';
 if(name==='SecurityError')return '当前页面没有麦克风访问权限，请使用 HTTPS 或本机 localhost 页面。';
 return '麦克风采集未能启动。请检查浏览器和系统的麦克风权限后重试。';
}
/** 管理一轮采集及全部资源；取消后的迟到授权不会重新启动采集。 */
export class MicrophoneCapture{
 private session:Session|null=null;
 private disposed=false;
 private state=initialCapture();
 private env:CaptureEnvironment;
 private listener:(state:CaptureSnapshot)=>void;
 private onPcm?: (pcm:Int16Array,sampleRate:number)=>void;
 constructor(env:CaptureEnvironment,listener:(state:CaptureSnapshot)=>void,onPcm?:(pcm:Int16Array,sampleRate:number)=>void){this.onPcm=onPcm;this.env=env;this.listener=listener;}
 private emit(patch:Partial<CaptureSnapshot>){this.state={...this.state,...patch};if(!this.disposed)this.listener({...this.state,waveform:[...this.state.waveform]});}
 private setTimer(fn:()=>void,ms:number){return this.env.setTimer?this.env.setTimer(fn,ms):globalThis.setTimeout(fn,ms) as unknown as number;}
 private clearTimer(id?:number){if(id===undefined)return;if(this.env.clearTimer)this.env.clearTimer(id);else globalThis.clearTimeout(id);}
 private stopTracks(stream:MediaStream){for(const track of stream.getTracks()){try{track.stop();}catch{/* 其他音轨仍需继续释放。 */}}}
 private release(s:Session){
  this.clearTimer(s.timer);this.clearTimer(s.muteTimer);
  for(const {track,event,fn} of s.listeners)track.removeEventListener(event,fn);
  try{s.recorder?.close();}catch{/* 独立关闭音轨与上下文，避免引擎异常造成泄漏。 */}
  if(s.stream)this.stopTracks(s.stream);
  // Recorder.GetContext创建的上下文还登记在库内部，使用配套入口清除登记。
  try{const pending=s.context&&(this.env.closeContext?this.env.closeContext(s.context):s.context.close());if(pending)void pending.catch(()=>{});}catch{/* 已关闭的上下文不重复处理。 */}
 }
 private fail(s:Session,message:string){if(this.session!==s)return;this.session=null;this.release(s);this.emit({phase:'error',level:0,waveform:Array(32).fill(0),message});}
 private watch(s:Session,ms=5000){this.clearTimer(s.timer);s.timer=this.setTimer(()=>this.fail(s,'麦克风没有继续返回音频，采集已中断并释放。请检查设备后重试。'),ms);}
 start(){
  if(this.disposed||this.session)return;
  const issue=this.env.preflight?.();if(issue){this.emit({...initialCapture(),phase:'error',message:issue});return;}
  const s:Session={listeners:[],clearIndex:0};this.session=s;this.emit({...initialCapture(),phase:'requesting'});
  s.timer=this.setTimer(()=>this.fail(s,'等待麦克风授权超时，已取消本次采集。请检查浏览器权限提示后重试。'),30000);
  try{
   // 在用户点击时创建AudioContext，保留移动浏览器所需的用户激活。
   s.context=this.env.createContext();
   void this.env.getStream().then(stream=>{
    if(this.session!==s){this.stopTracks(stream);return;}
    s.stream=stream;
    // 授权/连接期间设备可能已断开，不能把没有可用音轨的流显示为录音中。
    if(!stream.getAudioTracks().some(track=>track.readyState==='live')){this.fail(s,'麦克风连接已中断，采集已停止并释放。请重新连接设备后重试。');return;}
    for(const track of stream.getAudioTracks()){
     const ended=()=>this.fail(s,'麦克风连接已中断，采集已停止并释放。请重新连接设备后重试。');
     const muted=()=>{this.clearTimer(s.muteTimer);s.muteTimer=this.setTimer(()=>this.fail(s,'麦克风输入被系统中断，采集已停止并释放。请回到页面后重试。'),1500);};
     const unmuted=()=>this.clearTimer(s.muteTimer);
     for(const [event,fn] of [['ended',ended],['mute',muted],['unmute',unmuted]] as const){track.addEventListener(event,fn);s.listeners.push({track,event,fn});}
    }
    try{
     s.recorder=this.env.createRecorder({type:'unknown',sourceStream:stream,runningContext:s.context!,onProcess:(buffers,power,_duration,sampleRate,newIndex)=>{
      if(this.session!==s)return;
      const fresh=buffers.slice(newIndex).filter((b):b is Int16Array=>!!b),count=fresh.reduce((n,b)=>n+b.length,0);
      if(!count||!sampleRate)return;
      const samples=this.state.samples+count,latest=fresh.at(-1)!,waveform=Array.from({length:32},(_,i)=>{const from=Math.floor(i*latest.length/32),to=Math.max(from+1,Math.floor((i+1)*latest.length/32));let peak=0;for(let j=from;j<to&&j<latest.length;j++)peak=Math.max(peak,Math.abs(latest[j])/32768);return peak;});
      this.emit({phase:'recording',samples,sampleRate,durationMs:Math.round(samples/sampleRate*1000),level:Math.max(0,Math.min(100,power)),waveform});
      for(let i=s.clearIndex;i<newIndex;i++)buffers[i]=null;s.clearIndex=newIndex;
      this.watch(s);
      for(const pcm of fresh){if(this.session!==s)break;this.onPcm?.(pcm,sampleRate);}
     }});
     s.recorder.open(()=>{if(this.session!==s)return;try{s.recorder!.start();this.emit({phase:'recording'});this.watch(s);}catch(e){this.fail(s,captureErrorMessage(e));}},()=>this.fail(s,'录音引擎无法连接麦克风，资源已释放。请重试或更换浏览器。'));
    }catch(e){this.fail(s,captureErrorMessage(e));}
   },error=>this.fail(s,captureErrorMessage(error)));
  }catch(e){this.fail(s,captureErrorMessage(e));}
 }
 stop(message=''){const s=this.session;this.session=null;if(s)this.release(s);this.emit({phase:'stopped',level:0,waveform:Array(32).fill(0),message});}
 /** 重新开始试聊或切换配置时释放本轮，并清空旧采样统计。 */
 reset(){const s=this.session;this.session=null;if(s)this.release(s);this.emit(initialCapture());}
 interrupt(message='页面已离开前台，麦克风采集已停止并释放。'){if(this.session)this.fail(this.session,message);}
 dispose(){this.disposed=true;const s=this.session;this.session=null;if(s)this.release(s);}
}
