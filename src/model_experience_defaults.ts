import type {Connection} from './state.ts';
import type {ExperienceKind} from './model_experience.ts';

/** 只复制本次体验允许使用的非敏感字段，不共享或修改连接配置。 */
export function experienceDefaults(kind:ExperienceKind,connection?:Connection):Record<string,string>{
 const common={timeout:'30',retries:'0',stream:'true'};
 const defaults:Record<ExperienceKind,Record<string,string>>={
  text:{temperature:'',maxTokens:'',thinking:'按模型默认',online:'false'},
  image:{aspect:'1:1',count:'1',quality:''},
  video:{aspect:'16:9',resolution:'1080P',duration:'5',sound:'true'},
  tts:{speed:'1',volume:'50',format:'mp3',voiceId:''},
  asr:{language:'自动识别'}
 };
 const next:Record<string,string>={...common,...defaults[kind]},parameters={...connection?.customFields,...connection?.config?.parameters};
 for(const key of Object.keys(next)){if(parameters[key]!==undefined&&parameters[key]!=='')next[key]=String(parameters[key]);}
 if(kind==='tts')next.voiceId=connection?.config?.fields.voiceId||connection?.customFields?.voiceId||next.voiceId;
 if(kind==='asr')next.language=parameters.language||connection?.config?.fields.language||next.language;
 return next;
}
/** 模型与默认值变化时重建临时体验，凭据与状态变化不进入体验标识。 */
export function experienceSessionKey(kind:ExperienceKind,providerId:string,connection?:Connection){return JSON.stringify([kind,providerId,connection?.id||'',connection?.model||'',experienceDefaults(kind,connection)]);}
/** 已配置音色不能静默替换；缺失或重名时保留原 ID 并要求用户明确选择。 */
export function resolveExperienceVoice(voices:readonly {key:string;voiceId:string;previewUrl?:string}[],requested=''){
 if(requested){const matches=voices.filter(v=>v.key===requested||v.voiceId===requested);if(matches.length===1)return {key:matches[0].key,customVoice:'',warning:''};return {key:'',customVoice:requested,warning:matches.length?'该音色 ID 对应多个目录项，请重新选择具体音色。':'已配置音色未收录在当前模型目录，原 ID 已保留；可选择目录音色或确认使用此 ID 预览。'};}
 return {key:(voices.find(v=>v.previewUrl)||voices[0])?.key||'',customVoice:'',warning:''};
}

/** 删除或停用正在体验的连接时显式提示，不能自动改用另一条连接。 */
export function resolveExperienceConnection(connections:readonly Connection[],requested=''){
 const selected=connections.find(c=>c.id===requested&&c.enabled!==false)||(!requested?connections.find(c=>c.enabled!==false):undefined);
 return {selected,id:requested||selected?.id||'',unavailable:!!requested&&!selected};
}
/** 本地预览同样校验数值，避免无效或空值形成看似有效的请求。 */
export function validateExperienceParameters(kind:ExperienceKind,parameters:Record<string,string>){
 const numeric=(key:string,min:number,max:number,integer=false)=>{const raw=parameters[key];return raw===undefined||raw===''||Number.isFinite(Number(raw))&&Number(raw)>=min&&Number(raw)<=max&&(!integer||Number.isInteger(Number(raw)));};
 if(!numeric('timeout',1,300)||!numeric('retries',0,5,true))return '请检查超时与重试次数';
 if(kind==='text'&&(!numeric('temperature',0,2)||!numeric('maxTokens',1,10000000,true)))return '请检查温度和最大输出参数';
 if(kind==='tts'&&(!numeric('speed',0.5,2)||!numeric('volume',0,100)))return '请检查语速和音量';
 return '';
}
