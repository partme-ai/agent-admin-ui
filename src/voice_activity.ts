/** 本地声学VAD；分数表示能量与噪声的分离程度，不是神经网络人声概率。 */
export type VadOptions={speech?:number;silence?:number;silenceMs?:number;maxUtteranceMs?:number};
export type VadEvent={type:'start'}|{type:'end';audio:Int16Array;sampleRate:number;durationMs:number;reason:'silence'|'limit'};
/** 20ms分帧、双阈值迟滞、连续人声确认与有界前置缓存。 */
export class VoiceActivity{
 private options:Required<VadOptions>;
 private notify:(event:VadEvent)=>void;
 private pending:number[]=[];private rate=0;private noise=.003;private voiced=false;
 private candidate=0;private active=false;private quiet=0;private elapsed=0;
 private pre:Int16Array[]=[];private audio:Int16Array[]=[];
 constructor(options:VadOptions,notify:(event:VadEvent)=>void){this.options={speech:Math.max(.1,Math.min(.95,options.speech??.5)),silence:Math.max(.01,Math.min(.9,options.silence??.3)),silenceMs:Math.max(100,Math.min(10000,options.silenceMs??800)),maxUtteranceMs:Math.max(1000,Math.min(30000,options.maxUtteranceMs??30000))};this.notify=notify;}
 reset(){this.pending=[];this.rate=0;this.noise=.003;this.voiced=false;this.clearUtterance();}
 private clearUtterance(){this.candidate=0;this.active=false;this.quiet=0;this.elapsed=0;this.pre=[];this.audio=[];}
 push(pcm:Int16Array,sampleRate:number){
  if(!Number.isFinite(sampleRate)||sampleRate<8000||!pcm.length)return;
  if(this.rate&&this.rate!==sampleRate)this.reset();this.rate=sampleRate;
  const size=Math.round(sampleRate*.02);
  // 不保留Recorder的可变数组引用，分块只在当前回调使用。
  for(let offset=0;offset<pcm.length;offset++){this.pending.push(pcm[offset]);if(this.pending.length===size){const frame=Int16Array.from(this.pending);this.pending=[];this.frame(frame);}}
 }
 private frame(pcm:Int16Array){
  let sum=0;for(const value of pcm)sum+=value;const mean=sum/pcm.length;let energy=0,crossings=0,previous=pcm[0]-mean;
  for(const value of pcm){const centered=value-mean;energy+=centered*centered;if(centered*previous<0)crossings++;previous=centered;}
  const rms=Math.sqrt(energy/pcm.length)/32768,zcr=crossings/pcm.length;
  const score=zcr>.35||zcr<.002?0:Math.max(0,Math.min(1,(rms-Math.max(.006,this.noise*1.5))/Math.max(.012,this.noise*3)));
  if(score<.15)this.noise=this.noise*.98+Math.min(rms,.02)*.02;
  if(score>=this.options.speech)this.voiced=true;else if(score<=Math.min(this.options.silence,this.options.speech-.05))this.voiced=false;
  if(!this.active){
   this.pre.push(pcm);if(this.pre.length>15)this.pre.shift();
   this.candidate=this.voiced?this.candidate+20:0;
   if(this.candidate<120)return;
   this.active=true;this.audio=this.pre;this.pre=[];this.elapsed=this.audio.length*20;this.notify({type:'start'});return;
  }
  this.audio.push(pcm);this.elapsed+=20;this.quiet=this.voiced?0:this.quiet+20;
  if(this.quiet<this.options.silenceMs&&this.elapsed<this.options.maxUtteranceMs)return;
  const chunks=this.audio,rate=this.rate,durationMs=this.elapsed,reason=this.quiet>=this.options.silenceMs?'silence':'limit';
  const audio=new Int16Array(chunks.reduce((n,c)=>n+c.length,0));let offset=0;for(const chunk of chunks){audio.set(chunk,offset);offset+=chunk.length;}
  this.clearUtterance();this.voiced=false;this.notify({type:'end',audio,sampleRate:rate,durationMs,reason});
 }
}
