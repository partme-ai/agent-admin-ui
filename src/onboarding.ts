import {hasCurrentAgentCheck,linkageIssues,type LinkageEnvironment} from './agent_linkage.ts';
import {indexedDocumentText,validateContextSource,type ProviderDefinition} from './feature_state.ts';
import {roleConfigFingerprint} from './role_profile.ts';
import {restoreModelConfig} from './model_config_restore.ts';
import {validateModelConfig} from './model_config.ts';
import type {Connection} from './state.ts';

export const onboardingKey='tinybot:onboarding:v1';
export const onboardingOrder=['model','knowledge','agent','trial','publish','device'] as const;
export type OnboardingStep=typeof onboardingOrder[number];
export type OnboardingState={active:boolean;intro:'new'|'paused'|'done';tourStep:number;current:OnboardingStep;modelId:string;knowledgeId:string;agentId:string;deviceId:string;skipped:OnboardingStep[];hiddenTips:string[];collapsed:boolean};
export type OnboardingEnvironment=LinkageEnvironment&{checks:Record<string,{config:string;resources:string}>};
export function defaultOnboarding():OnboardingState{return {active:false,intro:'new',tourStep:0,current:'model',modelId:'',knowledgeId:'',agentId:'',deviceId:'',skipped:[],hiddenTips:[],collapsed:false};}
/** 只读取独立的引导键；不迁移或覆盖主题、形象及业务存储。 */
export function readOnboarding(storage:Pick<Storage,'getItem'>):OnboardingState{
 const base=defaultOnboarding();
 try{const raw=JSON.parse(storage.getItem(onboardingKey)||'null');if(!raw||typeof raw!=='object')return base;
  const ids=Object.fromEntries(['modelId','knowledgeId','agentId','deviceId'].map(key=>[key,typeof raw[key]==='string'?raw[key].slice(0,200):'']));
  return {...base,...ids,active:raw.active===true,intro:['new','paused','done'].includes(raw.intro)?raw.intro:'new',tourStep:Number.isInteger(raw.tourStep)?Math.max(0,Math.min(5,raw.tourStep)):0,current:onboardingOrder.includes(raw.current)?raw.current:'model',skipped:Array.isArray(raw.skipped)?onboardingOrder.filter(s=>raw.skipped.includes(s)):[],hiddenTips:Array.isArray(raw.hiddenTips)?raw.hiddenTips.filter((s:unknown)=>typeof s==='string').slice(0,30):[],collapsed:raw.collapsed===true};
 }catch{return base;}
}
/** 验证已保存接入字段并演练响应；不请求网络，不验证密钥，不自动启用连接。 */
export function probeOnboardingModel(model:Connection,fault:'success'|'auth'|'network'='success',providers:ProviderDefinition[]=[]){
 if(model.enabled===false)return {status:model.status,ok:false,message:'连接已停用，请在原配置中启用后重试。'};
 if((model.role||'LLM')!=='LLM')return {status:model.status,ok:false,message:'首次对话请选择 LLM 连接。'};
 let errors:Record<string,string>={};
 if(model.customProviderId){
  const provider=providers.find(p=>p.id===model.customProviderId);
  if(!provider||!provider.roles.includes('LLM'))errors.provider='提供方不存在或不支持 LLM';
  else{
   const addressError=validateContextSource({id:model.id,name:model.name,url:model.endpoint||'',headers:{}});
   if(addressError)errors.endpoint=addressError;
   if(!model.model.trim())errors.model='请填写模型标识';
   try{
    const fields=JSON.parse(provider.fields);
    if(!Array.isArray(fields)||fields.some(f=>!f.key||!f.label||/secret|password|token|api.?key/i.test(f.key))||new Set(fields.map(f=>f.key)).size!==fields.length)throw Error();
    for(const field of fields){if(field.required&&!model.customFields?.[field.key]?.trim())errors[field.key]=`请填写${field.label}`;}
   }catch{errors.fields='提供方字段定义无效';}
  }
 }else{
  if(!model.config)return {status:model.status,ok:false,message:'此记录没有完整接入配置；内置示例可直接选择，新连接请先保存接入字段。'};
  errors=validateModelConfig(restoreModelConfig(model.id,model));
 }
 if(Object.keys(errors).length)return {status:'检测失败',ok:false,message:`已保存配置不完整：${Object.values(errors).join('；')}`};
 if(fault!=='success')return {status:'检测失败',ok:false,message:fault==='auth'?'模拟鉴权失败，请核对凭据引用后重试。':'模拟连接中断，请核对服务地址后重试。'};
 return {status:'演示可用',ok:true,message:'已保存字段通过校验，模拟响应成功；没有验证真实密钥或模型服务。'};
}
/** 完成状态由同一组已选资源推导；跳过、已有示例和看完导览都不构成完成凭证。 */
export function onboardingSteps(state:OnboardingState,env:OnboardingEnvironment){
 const {store}=env,model=store.connections.find(m=>m.id===state.modelId),knowledge=store.knowledge.find(k=>k.id===state.knowledgeId),agent=store.agents.find(a=>a.id===state.agentId),device=store.bots.find(b=>b.id===state.deviceId);
 const modelDone=!!model&&model.enabled!==false&&(model.role||'LLM')==='LLM'&&model.status==='演示可用';
 const knowledgeDone=!!knowledge&&store.docs.some(d=>d.knowledge===knowledge.id&&d.status==='已索引'&&indexedDocumentText(d).trim());
 const knowledgeOptional=state.skipped.includes('knowledge')&&!knowledgeDone;
 const agentDone=!!agent&&!!agent.name.trim()&&!!agent.instructions.trim()&&modelDone&&agent.model===model?.id&&!agent.workflowId&&(knowledgeOptional||knowledgeDone&&agent.knowledge.includes(state.knowledgeId))&&!linkageIssues(agent,env).length;
 const trialDone=agentDone&&!!agent&&hasCurrentAgentCheck(agent,env,env.checks[agent.id]);
 const publishDone=trialDone&&!!agent?.published&&!!agent.publishedConfig&&roleConfigFingerprint(agent)===roleConfigFingerprint({...agent,...agent.publishedConfig});
 const deviceDone=publishDone&&!!device&&device.agent===agent?.id;
 const rows:[OnboardingStep,string,boolean,string][]=[
  ['model','模型',modelDone,model?`${model.name} · ${model.enabled===false?'已停用':model.status}`:'选择主语言模型，检查接入配置'],
  ['knowledge','知识库',knowledgeDone,knowledge?`${knowledge.name} · ${store.docs.filter(d=>d.knowledge===knowledge.id&&d.status==='已索引').length} 份已索引文档`:'选择知识库，导入文本并建立本地索引'],
  ['agent','智能体',agentDone,agent?`${agent.name} · ${agentDone?'模型、Prompt 与关联资源已检查':'请核对 Prompt、模型与知识关联'}`:'选择已有智能体，或从市场创建'],
  ['trial','机器人试聊',trialDone,trialDone?'当前配置已完成本地模拟回应':'用当前草稿完成一轮文字或语音模拟试聊'],
  ['publish','发布',publishDone,publishDone?`当前配置已发布 v${agent?.publishedRevision||agent?.revision}`:'试聊通过后，在人物面板确认发布'],
  ['device','绑定设备',deviceDone,device?`${device.name} · ${deviceDone?'配置已关联，联网另行检查':'尚未关联当前发布版本'}`:'可稍后绑定，网页试聊不要求实体设备']
 ];
 return rows.map(([id,title,done,detail])=>({id,title,detail,status:done?'done' as const:state.skipped.includes(id)?'skipped' as const:'pending' as const}));
}
/** 跳过只延后操作；试聊、发布、绑定仍尊重必要前置条件。 */
export function onboardingTarget(requested:OnboardingStep,state:OnboardingState,env:OnboardingEnvironment){
 const rows=onboardingSteps(state,env),done=(id:OnboardingStep)=>rows.find(s=>s.id===id)?.status==='done';
 let step=requested;
 if(requested!=='model'&&!done('model'))step='model';
 else if(!['model','knowledge'].includes(requested)&&!state.skipped.includes('knowledge')&&!done('knowledge'))step='knowledge';
 else if(['trial','publish','device'].includes(requested)&&!done('agent'))step='agent';
 else if(['publish','device'].includes(requested)&&!done('trial'))step='trial';
 else if(requested==='device'&&!done('publish'))step='publish';
 const agent=env.store.agents.find(a=>a.id===state.agentId),knowledge=env.store.knowledge.find(k=>k.id===state.knowledgeId);
 const model=env.store.connections.find(m=>m.id===state.modelId);
 const targets={model:{page:model?'07':'06',item:model?.id||''},knowledge:{page:knowledge?'09':'08',item:knowledge?.id||''},agent:{page:agent?'04':'05',item:agent?.id||''},trial:{page:'02',item:agent?.id||''},publish:{page:'04',item:agent?.id||''},device:{page:'04',item:agent?.id||''}};
 return {step,...targets[step]};
}
