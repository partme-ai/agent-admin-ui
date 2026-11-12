import {initialStation} from './station.ts';
import {initialSettingsIntegration} from './settings_integration.ts';
import type {KnowledgeWorkspace} from './knowledge_workspace.ts';
import type {Agent} from './state.ts';
import type {SharedSpace} from './shared_spaces.ts';
/** 控制台新增功能的会话模型；与已保存的主题、形象存储隔离。 */
export type RuleKind='load'|'fallback'|'rate'|'breaker';
export type GatewayRule={id:string;name:string;kind:RuleKind;app:string;targets:string[];weights:number[];strategy:string;limit:number;window:number;timeout:number;enabled:boolean};
export type UsageRow={id:string;date:string;app:string;platform:string;provider:string;model:string;agent:string;device:string;requests:number;tokens:number|null;cost:number|null;baseline:number;cached:number;failed:number};
export type SystemRole={id:string;name:string;description:string;permissions:string[]};
export type SkillRecord={id:string;name:string;description:string;content:string;version:string;installed:boolean;source:string};
export type ResourceSpace={id:string;name:string;description:string;quota:number};
export type ResourceFile={id:string;space:string;name:string;size:number;type:string;updated:string};
export type AuditRecord={id:string;date:string;user:string;category:'登录日志'|'操作日志';action:string;target:string;result:string;source:string};
export type ProductState=ReturnType<typeof initialProduct>;
export const permissionGroups=[{name:'模型',key:'models',actions:['read','write','gateway','stats']},{name:'知识库',key:'knowledge',actions:['read','write']},{name:'智能体',key:'agents',actions:['read','write','publish','stats']},{name:'资源',key:'resources',actions:['read','write']},{name:'系统',key:'system',actions:['users','roles','audit','settings']}];
export const actionLabels:Record<string,string>={read:'查看',write:'创建与编辑',gateway:'网关规则',stats:'数据与统计',publish:'发布',control:'控制请求',users:'用户管理',roles:'角色授权',audit:'安全审计',settings:'系统配置'};
export function initialProduct(){
 const rules:GatewayRule[]=(['load','fallback','rate','breaker'] as RuleKind[]).map((kind,i)=>({id:`gr${i}`,kind,name:['通用对话负载','对话模型降级','应用请求限流','模型失败熔断'][i],app:'全部应用',targets:['m1','m2'],weights:[70,30],strategy:kind==='load'?'加权轮询':'按优先级',limit:kind==='rate'?60:5,window:60,timeout:30,enabled:true}));
 const usage:UsageRow[]=Array.from({length:36},(_,i)=>({id:`u${i}`,date:`2026-11-${String(1+i%7).padStart(2,'0')}`,app:['Agent Admin Web','Agent Admin Desktop','Agent Admin Tablet'][i%3],platform:['Web','Desktop','Android Tablet','iPad'][i%4],provider:i%2?'DeepSeek':'通义千问',model:i%2?'deepseek-chat':'qwen-plus',agent:['a1','a2','a3'][i%3],device:'',requests:28+i*3,tokens:12000+i*1210,cost:i%2?0:+(0.21+i*.037).toFixed(3),baseline:.65+i*.054,cached:i*2,failed:i%4}));
 const roles:SystemRole[]=[{id:'admin',name:'管理员',description:'管理系统与所有功能',permissions:permissionGroups.flatMap(g=>g.actions.map(a=>g.key+':'+a))},{id:'operator',name:'操作员',description:'管理智能体与知识资源',permissions:['agents:read','agents:write','knowledge:read','knowledge:write']},{id:'viewer',name:'查看者',description:'只读查看资源',permissions:['agents:read','knowledge:read']}];
 const skills:SkillRecord[]=[['knowledge','知识问答','依据知识库回答并保留引用'],['inspection','资料复核','整理资料状态与待处理问题'],['story','故事陪伴','按照听众组织适合朗读的故事'],['learning','学习讲解','通过例子和追问解释问题'],['reminder','提醒与安排','整理成可确认的提醒计划'],['meeting','会议摘要','提取讨论要点、行动项与责任人'],['translator','多语言交流','根据对话语言进行翻译与解释'],['care','陪伴关怀','温和回应感受并提供合适的建议']].map(([id,name,description],i)=>({id,name,description,content:`---\nname: ${id}\ndescription: ${description}\n---\n# ${name}\n${description}。执行前检查权限与依赖，不确定时询问用户。`,version:'1.0.0',installed:i<5,source:'精选目录'}));
 return {station:initialStation(),integration:initialSettingsIntegration(),knowledgeWorkspaces:{} as Record<string,KnowledgeWorkspace>,spaceInvites:[] as import('./shared_space_join.ts').SpaceInvite[],sharedSpaces:[] as SharedSpace[],agentChecks:{} as Record<string,{config:string;resources:string}>,rules,usage,roles,skills,spaces:[{id:'default',name:'默认资源空间',description:'知识、声音与会话资源',quota:1024}] as ResourceSpace[],files:[] as ResourceFile[],audits:[{id:'audit0',date:'2026-11-07 09:00',user:'Alex',category:'登录日志',action:'登录控制台',target:'Agent Admin UI',result:'成功',source:'示例记录'}] as AuditRecord[],grants:[] as {id:string;provider:string;account:string;status:string}[],sessionActive:true};
}
export function validateRule(rule:GatewayRule,connections:string[]):string|null{
 if(!rule.name.trim())return '请填写规则名称';
 if(!rule.targets.length)return '至少选择一个目标模型';
 if(rule.targets.some(x=>!connections.includes(x)))return '目标模型已移除，请重新选择';
 if(new Set(rule.targets).size!==rule.targets.length)return '目标模型不能重复';
 if(!Number.isFinite(rule.limit)||rule.limit<1||!Number.isFinite(rule.window)||rule.window<1||!Number.isFinite(rule.timeout)||rule.timeout<1)return '阈值、窗口和超时必须大于零';
 if(rule.kind==='load'&&rule.strategy==='加权轮询'&&(rule.weights.length!==rule.targets.length||rule.weights.some(v=>!Number.isFinite(v)||v<=0)))return '每个模型的权重必须大于零';
 return null;
}
export function simulateRule(rule:GatewayRule,input:{app?:string;fault?:string;elapsed?:number;probe?:string;failed?:string[];requests?:number;failures?:number;sequence?:number}){
 if(!rule.enabled)return {decision:'绕过',target:'',reason:'规则已停用'};
 if(input.app&&rule.app!=='全部应用'&&input.app!==rule.app)return {decision:'绕过',target:'',reason:'请求不在此规则的应用范围'};
 if(rule.kind==='fallback'&&['auth','input'].includes(input.fault||''))return {decision:'拒绝',target:'',reason:'鉴权或输入错误直接返回，不尝试后备模型'};
 if(rule.kind==='rate'&&(input.requests||0)>=rule.limit)return {decision:'拒绝',target:'',reason:`${rule.window} 秒窗口达到 ${rule.limit} 次`};
 if(rule.kind==='breaker'&&(input.failures||0)>=rule.limit){if((input.elapsed||0)<rule.window||input.probe==='fail')return {decision:'熔断',target:'',reason:`连续失败达到阈值；${rule.window} 秒后半开试探`};if(input.probe!=='success')return {decision:'半开',target:rule.targets[0]||'',reason:'冷却已结束，仅放行一次探测请求'};return {decision:'恢复',target:rule.targets[0]||'',reason:'探测成功，恢复闭合状态'};}
 const targets=rule.targets.filter(x=>!input.failed?.includes(x));
 if(!targets.length)return {decision:'失败',target:'',reason:'没有可用后备模型'};
 let target=targets[0];
 if(rule.kind==='load'&&targets.length>1){if(rule.strategy==='加权轮询'){const total=targets.reduce((n,x)=>n+(rule.weights[rule.targets.indexOf(x)]||1),0);let point=(input.sequence||0)%total;for(const x of targets){point-=rule.weights[rule.targets.indexOf(x)]||1;if(point<0){target=x;break;}}}else target=targets[(input.sequence||0)%targets.length];}
 return {decision:rule.kind==='fallback'&&input.failed?.length?'降级':'放行',target,reason:rule.kind==='breaker'?'闭合状态，允许调用':`使用${rule.strategy}选择目标`};
}
export function filterUsage(rows:UsageRow[],filters:Partial<Record<'app'|'platform'|'provider'|'model'|'agent'|'device'|'date',string>>){return rows.filter(row=>Object.entries(filters).every(([key,value])=>!value||value==='全部'||row[key as keyof UsageRow]===value));}
export function usageTotals(rows:UsageRow[]){const known=rows.filter(r=>r.cost!==null),tokenRows=rows.filter(r=>r.tokens!==null);return {requests:rows.reduce((n,r)=>n+r.requests,0),tokens:tokenRows.length?tokenRows.reduce((n,r)=>n+(r.tokens||0),0):null,cost:known.length?known.reduce((n,r)=>n+(r.cost||0),0):null,baseline:rows.reduce((n,r)=>n+r.baseline,0),failed:rows.reduce((n,r)=>n+r.failed,0),cached:rows.reduce((n,r)=>n+r.cached,0)};}
export function parseSkill(content:string){
 if(!content.trim()||content.length>1_000_000)throw new Error('技能内容为空或超过 1 MB');
 const front=content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]+)$/);
 const name=front?.[1].match(/^name:\s*["']?([^\n"']+)/m)?.[1]?.trim();
 if(!name)throw new Error('SKILL.md 需要 name 和正文');
 const description=front?.[1].match(/^description:\s*["']?([^\n"']+)/m)?.[1]?.trim();
 if(!description)throw new Error('请填写 description');
 return {name,description,content};
}
export function validateRole(role:SystemRole){return !role.name.trim()?'请填写角色名称':!role.permissions.length?'请至少选择一项能力':null;}
export function audit(action:string,target:string):AuditRecord{return {id:crypto.randomUUID(),date:new Date().toLocaleString('zh-CN',{hour12:false}),user:'Alex',category:'操作日志',action,target,result:'本地已保存',source:'本次会话'};}

/** 从资源中心修改智能体草稿时，先保留旧发布快照，兼容未带快照的初始数据。 */
export function patchAgentDraft(agent:Agent,patch:Partial<Agent>):Agent{
 const preserved=agent.published&&!agent.publishedConfig?{...agent,publishedRevision:agent.publishedRevision||agent.revision,publishedConfig:{name:agent.name,desc:agent.desc,model:agent.model,knowledge:[...agent.knowledge],instructions:agent.instructions,profile:agent.profile?structuredClone(agent.profile):undefined,runtime:agent.runtime?structuredClone(agent.runtime):undefined,icon:agent.icon,avatar:agent.avatar,tools:agent.tools?[...agent.tools]:undefined,temperature:agent.temperature,context:agent.context,memory:agent.memory,channels:agent.channels?[...agent.channels]:undefined,workflowId:agent.workflowId}}:agent;
 return {...preserved,...patch};
}
