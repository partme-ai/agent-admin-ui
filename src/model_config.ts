import profiles from '../reference/model_config_profiles.json' with {type:'json'};
import {modelCategories,schemeAcceptsCategory} from './model_categories.ts';
export type ConfigField={id:string;label:string;required?:boolean;placeholder?:string;help?:string;type?:'number'|'text';options?:string[]};
export type ConfigScheme={id:string;region:string;plan:string;protocol:string;auth:string[];endpoint:string;models:string[];fields:ConfigField[];modelLabel:string;source:string;role?:string;authHint?:string};
export type ProviderConfigProfile={id:string;name:string;kind:string;support:string;schemes:ConfigScheme[];parameters:ConfigField[]};
export type ModelConfigDraft={providerId:string;schemeId:string;auth:string;name:string;role:string;model:string;modelMode:'catalog'|'manual';endpoint:string;fields:Record<string,string>;parameters:Record<string,string>;credentialRef:string;enabled:boolean};
const mediaSchemes:Record<string,ConfigScheme[]>={
 bailian:[
  {id:'bailian:qwen-image',region:'中国（北京）',plan:'按量付费',protocol:'openai-images',auth:['api_key'],endpoint:'https://{workspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',models:['qwen-image-3.0-pro','qwen-image-3.0','qwen-image-2.1-pro','qwen-image-2.1-turbo'],fields:[{id:'workspaceId',label:'Workspace ID',required:true,placeholder:'填写百炼工作空间 ID'}],modelLabel:'图片模型 ID',source:'https://help.aliyun.com/zh/model-studio/qwen-image-generation-and-editing-api-reference',role:'IMAGE'},
  {id:'bailian:wan-video',region:'中国（北京）',plan:'按量付费',protocol:'dashscope-video',auth:['api_key'],endpoint:'https://{workspaceId}.cn-beijing.maas.aliyuncs.com/api/v1',models:['wan2.7-t2v','wan2.6-t2v','wan2.5-t2v-preview'],fields:[{id:'workspaceId',label:'Workspace ID',required:true,placeholder:'填写百炼工作空间 ID'}],modelLabel:'视频模型 ID',source:'https://help.aliyun.com/zh/model-studio/text-to-video-guide',role:'VIDEO'}
 ],
 volcengine:[
  {id:'volcengine:seedream',region:'中国（北京）',plan:'按量付费',protocol:'ark-images',auth:['api_key'],endpoint:'https://ark.cn-beijing.volces.com/api/v3',models:['doubao-seedream-5-5-261028','doubao-seedream-5-0-pro-260628','doubao-seedream-4-5-251128'],fields:[],modelLabel:'图片模型 ID / 推理接入点 ID',source:'https://docs.volcengine.com/docs/ark/image-generation-api?lang=zh',role:'IMAGE'},
  {id:'volcengine:seedance',region:'中国（北京）',plan:'按量付费',protocol:'ark-content-generation',auth:['api_key'],endpoint:'https://ark.cn-beijing.volces.com/api/v3',models:['doubao-seedance-2-5-260628'],fields:[],modelLabel:'视频模型 ID / 推理接入点 ID',source:'https://docs.volcengine.com/docs/ark/video-generation-tutorial?lang=en',role:'VIDEO'}
 ]
};
/** 不同内容能力的请求参数独立保存，不套用语言模型的温度设置。 */
export const contentModelFields:Record<string,ConfigField[]>={
 IMAGE:[{id:'aspect',label:'默认图片比例',options:['1:1','4:3','3:4','16:9','9:16']},{id:'quality',label:'图片质量',options:['standard','hd']},{id:'count',label:'默认张数',options:['1','2','4']}],
 VIDEO:[{id:'resolution',label:'默认清晰度',options:['720P','1080P']},{id:'duration',label:'默认时长',options:['5','10']},{id:'aspect',label:'默认视频比例',options:['16:9','9:16','1:1']}]
};
export const configProfiles=(profiles as ProviderConfigProfile[]).map(profile=>({...profile,schemes:[...profile.schemes,...(mediaSchemes[profile.id]||[])]}));
export function configProfile(id:string){return configProfiles.find(p=>p.id===id);}
export function configScheme(draft:ModelConfigDraft){return configProfile(draft.providerId)?.schemes.find(s=>s.id===draft.schemeId);}
export function configInitial(providerId:string):ModelConfigDraft {const p=configProfile(providerId),s=p?.schemes[0];return {providerId,schemeId:s?.id||'',auth:s?.auth[0]||'',name:(p?.name||'新模型')+' 连接',role:s?.role||'LLM',model:'',modelMode:s?.models.length?'catalog':'manual',endpoint:s?.endpoint||'',fields:{},parameters:{},credentialRef:'',enabled:true};}
export function switchConfigScope(draft:ModelConfigDraft,axis:'provider'|'region'|'plan'|'protocol'|'role',value:string){
 if(axis==='provider'){const next=configInitial(value);return {...next,name:draft.name===(configProfile(draft.providerId)?.name||'新模型')+' 连接'?next.name:draft.name};}
 const p=configProfile(draft.providerId);if(!p)return draft;
 const current=configScheme(draft);const candidates=p.schemes.filter(s=>(axis==='role'?schemeAcceptsCategory(s,value):schemeAcceptsCategory(s,draft.role)&&s[axis]===value)&&(axis!=='plan'||s.region===current?.region)&&(axis!=='protocol'||s.region===current?.region&&s.plan===current?.plan));
 const next=candidates.find(s=>(axis==='region'?s.plan===current?.plan:true)&&s.protocol===current?.protocol)||candidates[0];
 if(!next)return draft;
 const role=axis==='role'?value:draft.role;
 return {...draft,schemeId:next.id,role,auth:next.auth[0]||'',endpoint:next.endpoint,model:'',modelMode:(next.models.length&&role===(next.role||'LLM')?'catalog':'manual') as 'catalog'|'manual',fields:{},parameters:{},credentialRef:''};
}
export function configOptions(draft:ModelConfigDraft,axis:'region'|'plan'|'protocol'|'role'){const p=configProfile(draft.providerId),s=configScheme(draft);if(axis==='role')return modelCategories.filter(c=>p?.schemes.some(x=>schemeAcceptsCategory(x,c.value))).map(c=>c.value);return [...new Set((p?.schemes||[]).filter(x=>schemeAcceptsCategory(x,draft.role)&&(axis==='region'||x.region===s?.region&&(axis==='plan'||x.plan===s.plan))).map(x=>x[axis]))];}
export function configEndpoint(draft:ModelConfigDraft){let url=draft.endpoint;for(const [key,value] of Object.entries(draft.fields))url=url.replaceAll('{'+key+'}',value.trim());return url;}
export function validateModelConfig(draft:ModelConfigDraft,hasCredential=false){
 const errors:Record<string,string>={},p=configProfile(draft.providerId),s=configScheme(draft);
 if(!p||!s){errors.providerId='请选择有效的厂商与接入方案';return errors;}
 if(p.support==='planned'||p.support==='runtime')errors.providerId='该入口尚无可配置的模型接入方案';
 if(!schemeAcceptsCategory(s,draft.role))errors.role='模型分类与接入协议不匹配';
 if(!draft.name.trim())errors.name='填写连接名称';
 if(!s.auth.includes(draft.auth))errors.auth='选择该方案支持的鉴权方式';
 for(const f of s.fields){const v=draft.fields[f.id]?.trim();if(f.required&&!v)errors[f.id]='填写'+f.label;if(v&&f.options&&!f.options.includes(v))errors[f.id]='选择有效的'+f.label;}
 if(!draft.model.trim())errors.model='选择或填写'+s.modelLabel;
 if(draft.modelMode==='catalog'&&draft.model&&!s.models.includes(draft.model))errors.model='该模型不属于当前方案，请重新选择或改为手动填写';
 const endpoint=configEndpoint(draft);if(!/^https?:\/\/[^\s]+$/.test(endpoint)||/[{}]/.test(endpoint))errors.endpoint='补全服务地址中的资源信息';
 try{const u=new URL(endpoint);if(u.username||u.password||u.search||u.hash)errors.endpoint='服务地址不能包含凭据、查询参数或片段';}catch{errors.endpoint='填写有效的 HTTP(S) 服务地址';}
 if(draft.credentialRef&&draft.credentialRef!==demoCredentialRef(draft))errors.credential='凭据引用与当前方案不匹配';
 if(!['none','managed'].includes(draft.auth)&&!draft.credentialRef&&!hasCredential)errors.credential='选择演示凭据引用，或填写仅用于本页的演示凭据';
 if(draft.parameters.timeout&&(!Number.isFinite(Number(draft.parameters.timeout))||Number(draft.parameters.timeout)<1||Number(draft.parameters.timeout)>300))errors.timeout='超时应在 1–300 秒之间';
 if(draft.parameters.retries&&(!Number.isInteger(Number(draft.parameters.retries))||Number(draft.parameters.retries)<0||Number(draft.parameters.retries)>5))errors.retries='重试次数应为 0–5 的整数';
 if(draft.role==='TTS'&&draft.parameters.speed&&(!Number.isFinite(Number(draft.parameters.speed))||Number(draft.parameters.speed)<0.5||Number(draft.parameters.speed)>2))errors.speed='语速应在 0.5–2 之间';
 if(draft.role==='TTS'&&draft.parameters.volume&&(!Number.isFinite(Number(draft.parameters.volume))||Number(draft.parameters.volume)<0||Number(draft.parameters.volume)>100))errors.volume='音量应在 0–100 之间';
 for(const f of contentModelFields[draft.role]||[]){const v=draft.parameters[f.id];if(v&&f.options&&!f.options.includes(v))errors[f.id]='选择有效的'+f.label;}
 for(const f of p.parameters){const v=draft.parameters[f.id];if(v&&f.type==='number'&&!Number.isFinite(Number(v)))errors[f.id]='填写有效数值';}
 for(const [key,max] of [['contextWindow',10000000],['maxTokens',10000000],['dimension',65536]] as const){const raw=draft.parameters[key];if(raw&&(!Number.isInteger(Number(raw))||Number(raw)<1||Number(raw)>max))errors[key]='请填写允许范围内的正整数';}
 if(draft.parameters.maxTokens&&draft.parameters.contextWindow&&Number(draft.parameters.maxTokens)>Number(draft.parameters.contextWindow))errors.maxTokens='最大输出不能超过上下文窗口';
 return errors;
}
export const demoCredentialRef=(draft:ModelConfigDraft)=>`demo:${draft.providerId}:${draft.schemeId}:${draft.auth}`;
/** 只保存方案允许的非敏感配置；凭据值始终留在组件内存。 */
export function modelConfigSnapshot(draft:ModelConfigDraft){
 const profile=configProfile(draft.providerId),scheme=configScheme(draft);
 const pick=(spec:ConfigField[],values:Record<string,string>)=>Object.fromEntries(spec.filter(f=>values[f.id]!==undefined).map(f=>[f.id,values[f.id].trim()]));
 return {providerId:draft.providerId,schemeId:draft.schemeId,region:scheme?.region||'',plan:scheme?.plan||'',protocol:scheme?.protocol||'',auth:draft.auth,modelMode:draft.modelMode,endpointTemplate:draft.endpoint,fields:pick(scheme?.fields||[],draft.fields),parameters:pick([...(contentModelFields[draft.role]|| (draft.role==='TTS'?[{id:'speed',label:'语速'},{id:'volume',label:'音量'},{id:'format',label:'格式'}]:draft.role==='ASR'?[{id:'language',label:'识别语言'}]:['LLM','VLLM','SLM'].includes(draft.role)?profile?.parameters||[]:[])),{id:'timeout',label:'超时'},{id:'retries',label:'重试'},{id:'stream',label:'流式'}],draft.parameters),credentialRef:draft.credentialRef===demoCredentialRef(draft)?draft.credentialRef:''};
}
