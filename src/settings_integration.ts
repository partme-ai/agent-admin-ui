import type {Connection} from './state.ts';
import type {RoleMemory} from './role_profile.ts';
import {connectionMatchesCategory} from './model_categories.ts';
/** 默认引用集中保存；具体智能体和知识库中的显式配置优先。 */
export const defaultSlots=[{key:'chat',label:'对话模型',category:'LLM'},{key:'utility',label:'轻量任务模型',category:'SLM'},{key:'embedding',label:'嵌入模型',category:'Embedding'},{key:'rerank',label:'重排序模型',category:'Rerank'},{key:'vision',label:'视觉模型',category:'VLLM'},{key:'asr',label:'语音识别模型',category:'ASR'},{key:'tts',label:'语音合成模型',category:'TTS'},{key:'vad',label:'语音活动检测',category:'VAD'},{key:'intent',label:'意图识别模型',category:'意图'},{key:'memory',label:'外部记忆服务',category:'记忆'}] as const;
export type DefaultSlot=typeof defaultSlots[number]['key'];
export type ModelDefaults=Partial<Record<DefaultSlot,string>>;
export type MemoryStatus='active'|'pending'|'tracking'|'documents'|'superseded'|'archived';
export const memoryStates:Record<MemoryStatus,string>={active:'生效中',pending:'待确认',tracking:'观察中',documents:'常用资料',superseded:'已被更新',archived:'已归档'};
export type MemoryPolicy={enabled:boolean;mode:'explicit'|'auto';model:string;embedding:string;semantic:boolean;delay:number;interval:number;maxItems:number;rules:string;conditioning:boolean};
export const defaultMemoryPolicy:MemoryPolicy={enabled:false,mode:'explicit',model:'',embedding:'',semantic:false,delay:30,interval:60,maxItems:200,rules:'',conditioning:true};
export type IntegrationEndpoint={id:string;name:string;enabled:boolean;token:string;scope:string[];tools:string[]};
export function initialSettingsIntegration(){return {defaults:{} as ModelDefaults,ollama:{url:'http://127.0.0.1:11434',tasks:[] as {id:string;model:string;state:'待执行'|'已取消'}[]},api:{baseUrl:'http://127.0.0.1:8080',protocol:'OpenAI',enabled:false,keys:[] as IntegrationEndpoint[]},mcp:[] as IntegrationEndpoint[],historyIndex:{} as Record<string,{enabled:boolean;embedding:string}>};}
/** 显式默认失效时返回空，避免默默替换模型；无设置才兼容原有选择。 */
export function resolveDefaultModel(connections:Connection[],defaults:ModelDefaults,slot:DefaultSlot):string{
 const spec=defaultSlots.find(s=>s.key===slot)!;
 const fits=(m:Connection)=>m.enabled!==false&&connectionMatchesCategory(m,spec.category);
 if(defaults[slot])return connections.find(m=>m.id===defaults[slot]&&fits(m))?.id||'';
 return connections.find(m=>fits(m)&&m.isDefault)?.id||connections.find(fits)?.id||'';
}
/** 导入先整体校验再产生新 ID，不接受外部归属和生效状态。 */
export function parseMemoryImport(text:string):RoleMemory[]{
 if(text.length>1_000_000)throw Error('导入内容不能超过 1 MB');
 let data:unknown;try{data=JSON.parse(text);}catch{throw Error('请导入记忆 JSON 数组');}
 if(!Array.isArray(data)||!data.length||data.length>1000)throw Error('请提供 1～1000 条记忆');
 if(data.some(r=>!r||typeof r.content!=='string'||!r.content.trim()||r.content.length>4000||r.subject!==undefined&&typeof r.subject!=='string'))throw Error('每条记忆必须包含 1～4000 字内容，所属成员必须是文字');
 return data.map(r=>({id:crypto.randomUUID(),subject:r.subject?.trim()||'当前用户',content:r.content.trim(),source:'导入',updated:new Date().toISOString().slice(0,10),status:'pending'}));
}
/** 仅精确去重，保留历史；不同成员和已归档记录不会被合并。 */
export function consolidateMemories(rows:RoleMemory[]):RoleMemory[]{
 const seen=new Map<string,string>();return rows.map(row=>{if(['archived','superseded'].includes(row.status||''))return {...row};const key=row.subject+'\0'+row.content.trim().replace(/\s+/g,' ');const id=seen.get(key);if(id)return {...row,status:'superseded',replacedBy:id};seen.set(key,row.id);return {...row};});
}
export function activeMemories(rows:RoleMemory[]){return rows.filter(r=>(r.status||'active')==='active');}
export function validateEndpoint(url:string):string{if(/[\s'"`$\\]/.test(url))return '服务地址不能包含空白或命令字符';try{const u=new URL(url);return !['http:','https:'].includes(u.protocol)||u.username||u.password||u.search||u.hash?'请使用不含凭据、查询参数的 HTTP(S) 服务地址':'';}catch{return '请输入有效服务地址';}}
/** 本地构造请求与模拟结果，绝不更新服务检测状态。 */
export function createProbe(connection:Connection,text:string){if(connection.enabled===false)throw Error('此连接已停用');if(!text.trim())throw Error('请填写测试输入');const role=connection.role||'LLM';const input=role==='Embedding'?{input:text}:role==='Rerank'?{query:text,documents:['候选文档 A','候选文档 B']}:role==='TTS'?{input:text,voice:'所选音色'}:['ASR','VAD'].includes(role)?{audio:text}:{messages:[{role:'user',content:text}]};return {simulated:true,request:{model:connection.model,...input},result:{category:role,message:'本地请求校验完成，真实模型结果待服务接入'},connectionId:connection.id};}

/** 仅为新建对象填默认能力，既有对象不调用此函数。 */
export function defaultAgentBindings(connections:Connection[],defaults:ModelDefaults):Record<string,string>{const out:Record<string,string>={};for(const [role,slot] of [['SLM','utility'],['VLLM','vision'],['ASR','asr'],['VAD','vad'],['意图','intent'],['记忆','memory']] as const){const id=resolveDefaultModel(connections,defaults,slot);if(defaults[slot])out[role]=id;}return out;}

/** 用户明确选择后，登记为前端演练连接；不表示真实连通性检测成功。 */
export function prepareModelForSimulation(connection:Connection,input:string):Connection{createProbe(connection,input);return {...connection,status:"演示可用"};}
