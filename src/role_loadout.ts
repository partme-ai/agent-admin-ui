import {defaultAgentBindings,resolveDefaultModel,type ModelDefaults} from './settings_integration.ts';
import type {Connection} from './state.ts';
import {cloneAgentRuntime,type AgentRuntime} from './feature_state.ts';
import {cloneRoleProfile} from './role_profile.ts';
import type {Agent} from './state.ts';
import {ttsModels,voicesForModel} from './voice_catalog.ts';

/** 所有能力入口统一更新记忆派生开关，避免与既有运行字段分叉。 */
export function applyRoleRuntime(runtime:AgentRuntime):Pick<Agent,'runtime'|'context'|'memory'>{return {runtime,context:runtime.memoryMode!=='无记忆',memory:['本地独立记忆','mem0','PowerMem'].includes(runtime.memoryMode)};}
/** 停用TTS后保留声音配置供以后复用，当前只进行文字与屏幕交互。 */
export function roleUsesVoice(a:Agent):boolean{return !cloneRoleProfile(a.profile).disabledAbilities.includes('TTS');}
/** 发布和试聊共用提供方、模型、音色兼容校验，不调用真实服务。 */
export function roleVoiceIssue(a:Agent,assets:Parameters<typeof voicesForModel>[1],connections?:Connection[]):string{
 if(!roleUsesVoice(a))return '';
 const r=cloneAgentRuntime(a.runtime),model=ttsModels.find(m=>m.id===r.ttsModel);
 if(!model)return '请选择有效的语音模型';
 if(r.bindings.TTS&&connections){const connection=connections.find(c=>c.id===r.bindings.TTS);if(!connection||connection.model!==model.modelId||(connection.config?.providerId||connection.provider.toLowerCase())!==model.providerId)return '声音配置与中央 TTS 连接不一致，请重新选择语音模型与兼容音色';}
 if(!voicesForModel(model,assets).some(v=>v.key===r.voice))return '请为当前语音模型选择兼容音色';
 return '';
}
export const mappedRole:Record<string,string>={VAD:'VAD',ASR:'ASR',SLM:'SLM',VLLM:'VLLM',Intent:'意图'};
export function roleAbilitySummary(a:Agent,key:string,connections:{id:string;name:string;model:string}[],assets:Parameters<typeof voicesForModel>[1]){
 const r=cloneAgentRuntime(a.runtime),p=cloneRoleProfile(a.profile),tts=ttsModels.find(m=>m.id===r.ttsModel);
 if(p.disabledAbilities.includes(key))return {value:'未启用',state:'可选能力'};
 if(key==='Mem')return {value:r.memoryMode,state:r.memoryMode==='无记忆'?'不保留记忆':'角色独立'};
 if(key==='TTS')return {value:tts?`${tts.provider} · ${tts.displayName||tts.modelId}`:'未选择语音模型',state:tts?'目录预设':'待配置'};
 if(key==='Voice'){const voice=tts&&voicesForModel(tts,assets).find(v=>v.key===r.voice);return {value:voice?.name||'未选择兼容音色',state:roleUsesVoice(a)?voice?'音色配置':'待配置':'TTS未启用'};}
 if(key==='Lang')return {value:r.language,state:'对话策略'};
 const id=key==='LLM'?a.model:r.bindings[mappedRole[key]],m=connections.find(x=>x.id===id);
 if(m)return {value:m.model,state:m.name};
 if(key==='Intent')return {value:'主模型意图路由',state:'跟随 LLM'};
 return {value:'未选择方案',state:'待配置'};
}

/** 判断独立试聊是否临时覆盖角色发布声音，不把默认配置误标成临时改动。 */
export function roleHasVoiceOverride(a:Agent,ttsModel:string,voice:string):boolean{const r=cloneAgentRuntime(a.runtime);return ttsModel!==r.ttsModel||voice!==r.voice;}

/** 新建时使用默认能力；语音连接与音色目录使用同一模型身份，不覆盖既有对象。 */
export function runtimeWithModelDefaults(base:AgentRuntime|undefined,connections:Connection[],defaults:ModelDefaults):AgentRuntime{const r=cloneAgentRuntime(base),binding=defaultAgentBindings(connections,defaults),ttsId=defaults.tts?resolveDefaultModel(connections,defaults,'tts'):'',ttsConnection=connections.find(m=>m.id===ttsId),tts=ttsConnection&&ttsModels.find(m=>m.modelId===ttsConnection.model&&m.providerId===(ttsConnection.config?.providerId||ttsConnection.provider.toLowerCase()));if(tts){r.ttsModel=tts.id;const voices=voicesForModel(tts,[]);if(!voices.some(v=>v.key===r.voice))r.voice=voices[0]?.key||'';}if(defaults.tts){binding.TTS=ttsId;if(!tts){r.ttsModel='';r.voice='';}}if(r.longTermMemory){r.longTermMemory={...r.longTermMemory,model:binding.SLM||r.longTermMemory.model,embedding:defaults.embedding?resolveDefaultModel(connections,defaults,'embedding'):r.longTermMemory.embedding};}return {...r,bindings:{...r.bindings,...binding}};}
