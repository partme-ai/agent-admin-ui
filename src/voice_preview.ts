/** 试听媒体端口，允许用确定性的媒体替身验证竞争与释放行为。 */
export type PreviewAudio=Pick<HTMLAudioElement,'play'|'pause'|'load'|'removeAttribute'|'remove'|'onended'|'onerror'|'onplaying'>;
export type PreviewState={key:string;status:'idle'|'loading'|'playing'|'error';error?:string};
const idle:PreviewState={key:'',status:'idle'};
/** 同一控制台只播放一个官方样本；过期事件不能改变新的播放状态。 */
export class VoicePreviewPlayer{
 private audio:PreviewAudio|undefined;
 private state:PreviewState=idle;
 private listeners=new Set<()=>void>();
 private createAudio:(url:string)=>PreviewAudio;
 constructor(createAudio:(url:string)=>PreviewAudio){this.createAudio=createAudio;}
 getSnapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private update(state:PreviewState){this.state=state;this.listeners.forEach(listener=>listener());}
 stop=()=>{const audio=this.audio;this.audio=undefined;if(audio){audio.onended=null;audio.onerror=null;audio.onplaying=null;audio.pause();audio.removeAttribute('src');audio.load();audio.remove();}this.update(idle);};
 toggle=(key:string,url?:string)=>{
  if(!url){this.stop();return;}
  if(this.state.key===key&&(this.state.status==='loading'||this.state.status==='playing')){this.stop();return;}
  this.stop();let audio:PreviewAudio;
  const fail=()=>{if(this.audio!==audio)return;this.stop();this.update({key,status:'error',error:'试听暂时无法播放，请重试。'});};
  try{audio=this.createAudio(url);this.audio=audio;this.update({key,status:'loading'});
   audio.onplaying=()=>{if(this.audio===audio)this.update({key,status:'playing'});};
   audio.onended=()=>{if(this.audio===audio)this.stop();};audio.onerror=fail;
   void audio.play().catch(fail);
  }catch{if(this.audio){fail();}else this.update({key,status:'error',error:'试听暂时无法播放，请重试。'});}
 };
}
