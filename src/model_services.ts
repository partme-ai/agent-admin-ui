import {experienceModes,type ExperienceKind} from './model_experience.ts';
/** 五个页面入口与细粒度模型用途分开，保留知识库、智能体的原连接引用。 */
export const modelServices=[
 {key:'text',title:'文本生成',role:'LLM',roles:['LLM','SLM','VLLM','Embedding','Rerank','意图','记忆','RAG'],description:'配置对话、推理、视觉理解与知识检索模型。'},
 {key:'image',title:'图片生成',role:'IMAGE',roles:['IMAGE'],description:'配置文生图、图片编辑模型及其专属接入方案。'},
 {key:'video',title:'视频生成',role:'VIDEO',roles:['VIDEO'],description:'配置视频生成模型、镜头参数及任务接入方案。'},
 {key:'tts',title:'语音合成',role:'TTS',roles:['TTS'],description:'配置语音合成模型，选择兼容音色、语言与声音参数。'},
 {key:'asr',title:'语音识别',role:'ASR',roles:['ASR','VAD'],description:'配置语音识别与活动检测，体验音频上传和录音采集。'}
] satisfies {key:ExperienceKind;title:string;role:string;roles:string[];description:string}[];
export function serviceForRole(role='LLM'){return modelServices.find(s=>s.roles.includes(role))||modelServices[0];}
export function resolveModelService(selected='',connections:readonly {id:string;role?:string}[]=[]){
 return modelServices.find(s=>s.key===selected)||(selected==='tts-voices'?modelServices[3]:serviceForRole(connections.find(c=>c.id===selected)?.role));
}
export function serviceCategoryAllowed(kind:ExperienceKind,role:string){return modelServices.find(s=>s.key===kind)!.roles.includes(role);}
export function providerServiceDescription(providerName:string,kind:ExperienceKind){
 const descriptions:Record<ExperienceKind,string>={text:'选择对话、推理或知识检索用途，按区域、套餐和协议配置连接。',image:'选择图片模型，配置接入区域、鉴权与输出参数；视觉理解模型另在文本类管理。',video:'选择视频模型，配置任务接口；镜头、时长与分辨率在体验中选择。',tts:'选择合成模型，音色按厂商与模型分别展示，保留音色兼容范围。',asr:'选择识别模型与接入协议，支持上传音频或采集麦克风样本。'};
 return `${providerName} · ${descriptions[kind]}`;
}
export {experienceModes};
