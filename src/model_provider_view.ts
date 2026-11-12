import {configProfiles,type ProviderConfigProfile} from './model_config.ts';
import {modelDirectory} from './model_directory.ts';
import {canUseConnection,roleLabel} from './capability.ts';
import type {Connection} from './state.ts';
import {schemeAcceptsCategory} from './model_categories.ts';

const descriptions:Record<string,[string,string[],string]>={
 deepseek:['对话与推理模型，适合代码、分析和通用问答',['推理','编程'],'D'],
 glm:['智谱语言与视觉模型，按国内、国际及套餐分别接入',['中文对话','视觉'],'智'],
 kimi:['月之暗面模型，提供对话、长文本与编码接入方案',['长文本','编程'],'K'],
 minimax:['语言、语音识别与语音合成分别配置',['对话','语音'],'M'],
 bailian:['阿里云模型平台，按区域、工作空间与套餐接入',['多模型','知识问答'],'阿'],
 qwen:['通义千问官方模型，语言与视觉用途分开配置',['中文对话','视觉'],'Q'],
 volcengine:['火山方舟模型平台，区分模型 ID 与部署接入方案',['多模型','多模态'],'火'],
 baidu:['千帆模型服务，按平台方案配置认证与模型',['多模型','中文问答'],'百'],
 tencent:['混元与 TokenHub 入口，保留各自接入协议',['中文对话','多模型'],'腾'],
 xiaomi:['小米 MiMo 模型，使用对应服务地址与模型标识',['推理','编程'],'米'],
 stepfun:['阶跃星辰语言及多模态模型接入',['对话','多模态'],'阶'],
 openai:['OpenAI 官方模型，区分 Chat 与 Responses 协议',['对话','工具调用'],'O'],
 anthropic:['Claude 模型，使用 Messages 协议与对应凭据',['编程','长文本'],'A'],
 google:['Gemini 原生接口，区域与认证按方案配置',['多模态','长文本'],'G'],
 azure:['按 Azure 资源、部署名称和 API 版本配置',['企业部署','多模型'],'Az'],
 bedrock:['AWS 模型平台，区分区域、模型资源和 IAM 身份',['多模型','云部署'],'AWS'],
 vertex:['Google Cloud 模型平台，配置项目、区域与身份',['多模型','云部署'],'GC'],
 ollama:['连接本地 Ollama 推理服务，填写已安装模型 ID',['本地推理'],'Ol'],
 lmstudio:['连接 LM Studio 已启动的本地推理端点',['本地推理'],'LM']
};
export type ProviderView={id:string;name:string;kind:string;summary:string;specialties:string[];mark:string;models:string[];roles:string[];profile:ProviderConfigProfile};
export const providerViews:ProviderView[]=configProfiles.map(profile=>{
 const card=modelDirectory.find(p=>p.id===profile.id),roles=[...new Set(profile.schemes.map(s=>s.role||'LLM'))];
 const [summary,specialties,mark]=descriptions[profile.id]||[profile.kind==='模型平台'?'汇集模型服务，按区域、套餐和接入协议配置':profile.kind==='本地服务'?'连接已经部署的本地推理服务':profile.kind==='工具运行时'?'外部工具运行时，不能作为普通模型连接使用':'按服务专属方案配置地址、认证与模型',roles.length?roles.map(r=>roleLabel[r]||r).slice(0,3):['待核实'],profile.name.slice(0,2)];
 return {id:profile.id,name:profile.name,kind:profile.kind,summary,specialties,mark,models:[...new Set([...(card?.models||[]),...profile.schemes.flatMap(s=>s.models)])],roles,profile};
});
/** 只按明确身份归属连接；未知旧连接不会被归到默认厂商。 */
export function connectionProviderId(connection:Connection):string|undefined{
 if(connection.customProviderId)return 'custom:'+connection.customProviderId;
 if(connection.config?.providerId)return connection.config.providerId;
 const aliases:Record<string,string>={'智谱 GLM':'glm','豆包':'volcengine','Gemini':'google','OpenAI Compatible':'openai-compatible'};
 return aliases[connection.provider]||configProfiles.find(p=>p.name===connection.provider)?.id;
}
/** 目录数量、已配数量与演示可用模型分别计算，不把预设当作调用成功。 */
export function providerConnections(id:string,connections:readonly Connection[]){
 const configured=connections.filter(c=>connectionProviderId(c)===id);
 return {configured,available:configured.filter(canUseConnection)};
}

/** 合并厂商目录与已有连接中的模型，保留账号自定义模型和连接身份。 */
export function providerModelRows(provider:Pick<ProviderView,'id'|'models'>&{profile?:ProviderConfigProfile},connections:readonly Connection[],query='',category='全部'){
 const configured=providerConnections(provider.id,connections).configured;
 const ids=[...new Set([...provider.models,...configured.map(c=>c.model)].filter(Boolean))];
 const needle=query.trim().toLowerCase();
 return ids.map(id=>{const matches=configured.filter(c=>c.model===id),roles=[...new Set([...matches.map(c=>c.role||'LLM'),...(provider.profile?.schemes.filter(s=>s.models.includes(id)).map(s=>s.role||'LLM')||[])])];return {id,roles,connections:matches};}).filter(row=>(category==='全部'||row.roles.includes(category))&&(!needle||`${row.id} ${row.connections.map(c=>c.name).join(' ')}`.toLowerCase().includes(needle)));
}
export function providerSupportsCategory(provider:{roles:string[];profile?:ProviderConfigProfile},category:string){return category==='全部'||provider.roles.includes(category)||!!provider.profile?.schemes.some(s=>schemeAcceptsCategory(s,category));}
