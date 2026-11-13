import type {KnowledgeConfig} from './knowledge_config.ts';
import type {AgentTurn} from './agent_linkage.ts';
import {cloneRoleProfile,defaultRoleProfile,type RoleProfile,type RoleMemory} from './role_profile.ts';
import {cloneAgentRuntime,type AgentRuntime,type ConfigEntry,type ProviderDefinition,type PromptTemplate,type KnowledgeOptions,type StorageOptions} from './feature_state.ts';
import {pages} from './catalog.ts';
import type {WorkflowConnection} from './capability.ts';
import type {Host} from './catalog.ts';
export function transitionMission(state:string,event:string):string {
 const transitions:Record<string,Record<string,string>>={
  '待审批':{approve:'已受理',reject:'已拒绝'},'已受理':{start:'执行中',cancel:'取消请求中'},
  '执行中':{finish:'已完成',timeout:'待核实',cancel:'取消请求中'},'待核实':{reconcile:'已完成'},'取消请求中':{confirmCancel:'已取消'}
 }; return transitions[state]?.[event]??state;
}
export const canPublish=(modelStatus:string,knowledgeReady:boolean)=>modelStatus==='演示可用'&&knowledgeReady;
export const capabilities=(host:Host)=>({native:host!=='web',serial:host==='desktop'||host==='android',background:host==='desktop',file:host!=='web',foreground:host==='android'||host==='ipad'});
export type Connection={authorizationId?:string;customProviderId?:string;customFields?:Record<string,string>;id:string;name:string;provider:string;model:string;status:string;endpoint?:string;role?:string;enabled?:boolean;isDefault?:boolean;config?:{providerId:string;schemeId:string;region:string;plan:string;protocol:string;auth:string;modelMode:'catalog'|'manual';endpointTemplate:string;fields:Record<string,string>;parameters:Record<string,string>;credentialRef:string}};
export function cleanConnection(input:Record<string,unknown>):Connection {
 return {id:String(input.id||''),name:String(input.name||''),provider:String(input.provider||''),model:String(input.model||''),status:String(input.status||'待检测'),endpoint:String(input.endpoint||''),role:String(input.role||'LLM'),enabled:input.enabled!==false,isDefault:input.isDefault===true};
}
export function resolvePage(raw:string):string {
 const path=raw.split('?')[0].replace(/\/$/,'');
 if(path==='/sign-in'||path==='/setup')return '00';
 const relative=path.replace(/^\/w\/[^/]+\//,'');
 const exact=pages.find(p=>p.path===relative); if(exact)return exact.id;
 const patterns:[RegExp,string][]=[[/^agents\/[^/]+\/edit$/,'04'],[/^models\/connections\/[^/]+$/,'07'],[/^knowledge\/[^/]+\/documents\/[^/]+$/,'10'],[/^knowledge\/[^/]+\/retrieval$/,'11'],[/^knowledge\/[^/]+$/,'09'],[/^tasks\/[^/]+$/,'17'],[/^runs\/[^/]+$/,'19'],[/^extensions\/[^/]+$/,'21'],[/^chat\/[^/]+$/,'02']];
 return patterns.find(([pattern])=>pattern.test(relative))?.[1]||'404';
}
export function selectionFromPath(raw:string):string {
 const [path,search]=raw.replace(/^#/,'').split('?');
 const explicit=new URLSearchParams(search).get('item');if(explicit)return explicit;
 const match=path.match(/\/(?:agents|connections|knowledge|devices|tasks|runs|extensions|plans)\/([^/]+)(?:\/|$)/);
 const doc=path.match(/\/documents\/([^/]+)/);return decodeURIComponent(doc?.[1]||match?.[1]||'');
}
export function normalizePreviewItem(value:unknown):string{
 return typeof value==='string'&&value.length<=128&&/^[\p{L}\p{N}._:-]*$/u.test(value)?value:'';
}
export function normalizePreview(raw:unknown):{page:string;theme:'light'|'dark';item?:string;style?:'cards'|'compact'}|null {
 if(!raw||typeof raw!=='object')return null;
 const data=raw as Record<string,unknown>;
 if(!pages.some(p=>p.id===data.page)||!['light','dark'].includes(String(data.theme)))return null;
 return {page:String(data.page),theme:data.theme as 'light'|'dark',...(typeof data.item==='string'&&normalizePreviewItem(data.item)===data.item?{item:data.item}:{}),...(['cards','compact'].includes(String(data.style))?{style:data.style as 'cards'|'compact'}:{})};
}
export type AgentVersion={icon?:string;profile?:RoleProfile;avatar?:string;runtime?:AgentRuntime;revision:number;name:string;desc:string;model:string;knowledge:string[];instructions:string;tools?:string[];temperature?:number;context?:boolean;memory?:boolean;channels?:string[];workflowId?:string;published?:boolean};
export type Agent={marketTemplateId?:string;profile?:RoleProfile;publishedRevision?:number;avatar?:string;runtime?:AgentRuntime;id:string;name:string;desc:string;color:string;icon:string;model:string;knowledge:string[];instructions:string;published:boolean;revision:number;temperature?:number;tools?:string[];context?:boolean;memory?:boolean;channels?:string[];workflowId?:string;versions?:AgentVersion[];publishedConfig?:Omit<AgentVersion,'revision'|'published'>};
export function reviseAgent(draft:Agent,previous:Agent|undefined,publish:boolean):Agent {
 const config=(a:Agent)=>({icon:a.icon,profile:cloneRoleProfile(a.profile),name:a.name,avatar:a.avatar,desc:a.desc,model:a.model,knowledge:[...a.knowledge],instructions:a.instructions,tools:[...(a.tools||[])],temperature:a.temperature,context:a.context,memory:a.memory,channels:[...(a.channels||[])],workflowId:a.workflowId,runtime:cloneAgentRuntime(a.runtime)});
 const publishedConfig=publish?config(draft):previous?.publishedConfig||(previous?.published?config(previous):undefined);
 const base=previous?.versions||(previous?[{...config(previous),revision:previous.revision,published:previous.published}]:[]);
 const revision=Math.max(draft.revision,previous?.revision||0)+1;
 return {...draft,revision,publishedRevision:publish?revision:previous?.publishedRevision||(previous?.published?previous.revision:undefined),published:publish||draft.published,publishedConfig,versions:[...base,{...config(draft),revision,published:publish}]};
}
export type Knowledge={configuration?:KnowledgeConfig;kind?:'document'|'faq';scope?:'private'|'workspace'|'public';options?:KnowledgeOptions;id:string;name:string;desc:string;count:number;color:string};
export type Doc={folder?:string;tags?:string[];source?:string;sourceUrl?:string;updatedAt?:string;faq?:{question:string;similarQuestions:string[];negativeQuestions:string[];answers:string[];enabled:boolean};chunks?:string[];format?:string;id:string;name:string;knowledge:string;size:string;status:string;text:string};
export type Mission={id:string;name:string;agent:string;status:string;time:string};
export type Extension={transport?:string;executionTarget?:string;command?:string;headers?:string;timeout?:number;id:string;name:string;desc:string;layer:'native'|'business';enabled:boolean;color:string;scope:string;kind?:string;endpoint?:string;tools?:string[];version?:string};
export type Conversation={runs?:AgentTurn[];config?:AgentVersion;sample?:boolean;tools?:{name:string;status:string}[];device?:string;date?:string;id:string;agent:string;deviceProfile?:string;ttsModel?:string;voice?:string;title:string;messages:{role:'user'|'assistant';text:string;citation?:boolean}[];summary:string};
export type VoiceAsset={providerId?:string;connectionId?:string;voiceId?:string;modelIds?:string[];id:string;name:string;sample:string;status:string;provider:string;agent:string};
export type Store={roleTrials:Record<string,string>;roleMemories:Record<string,RoleMemory[]>;gateway:{endpoint:string;allowed:boolean;configured:boolean};mediaNames:string[];speakers:string[];voiceDefaults?:AgentRuntime;voiceStages:Record<string,boolean>;voicePolicy:{stream:string;aec:boolean;interrupt:boolean;active:boolean;format:string;rate:number};defaultAgentId:string;rolePermissions:Record<string,string[]>;systemEntries:ConfigEntry[];customProviders:ProviderDefinition[];promptTemplates:PromptTemplate[];storage:StorageOptions;favoriteVoices:string[];voiceAssets:VoiceAsset[];workflows:WorkflowConnection[];conversations:Conversation[];memoryMode:string;terminalAccess:{id:string;name:string;kind:string;enabled:boolean}[];agents:Agent[];connections:Connection[];knowledge:Knowledge[];docs:Doc[];missions:Mission[];extensions:Extension[];members:{id:string;name:string;role:string;enabled?:boolean;email?:string;avatar?:string;bio?:string}[];notes:string[];preferences:{name:string;language:string;timezone:string;notifications?:{approval:boolean;offline:boolean;product:boolean}}};
export function initialStore():Store {return {roleTrials:{},
 roleMemories:{a1:[{id:"rm1",subject:"Alex",content:"喜欢简洁的回答，遇到不确定信息希望先说明依据。",source:"手动记录 · 示例",updated:"2026-11-05"}],a2:[{id:"rm2",subject:"工作空间",content:"研究结论保留来源，重要操作前请求确认。",source:"研究偏好 · 示例",updated:"2026-11-05"}],a3:[],a4:[]},
 gateway:{endpoint:'',allowed:false,configured:false},mediaNames:['轻柔晨光','专注时刻','夜间白噪音'],speakers:['Alex · 已登记（演示）'],voiceStages:{VAD:true,ASR:true,LLM:true,TTS:true},voicePolicy:{stream:'流式分段',aec:false,interrupt:true,active:false,format:'PCM',rate:16000},defaultAgentId:'a1',rolePermissions:{'管理员':['workspace','agents','knowledge'],'操作员':['agents:read','agents:write','knowledge:read','knowledge:write'],'查看者':['agents:read','knowledge:read']},systemEntries:[{id:'cfg1',group:'系统参数',key:'session_timeout',value:'60',type:'number',note:'会话空闲时长（秒）'},{id:'cfg4',group:'功能开关',key:'voice_clone',value:'true',type:'boolean',note:'界面入口开关，不代表厂商已授权'}],customProviders:[],promptTemplates:[],storage:{provider:'local',fields:{directory:'./data/agent-admin'},retention:'30',result:'未检测'},favoriteVoices:[],voiceAssets:[],workflows:[],conversations:[{id:'sample-chat-1',sample:true,agent:'a1',date:'2026-11-05',title:'售后退换货咨询',messages:[{role:'user',text:'收到商品后发现尺寸不合适，如何申请退换？'},{role:'assistant',text:'请先核对订单签收时间与商品状态，再按退换货指引提交申请；具体期限以当前政策为准。'}],summary:'客服依据售后政策回答退换货问题。',tools:[{name:'knowledge_search',status:'示例只读回执'}]}],memoryMode:'短期上下文',terminalAccess:[{id:'term1',name:'当前 Desktop',kind:'控制端',enabled:true},{id:'channel1',name:'网页对话',kind:'聊天通道',enabled:true}],
 agents:[
 {id:'a1',profile:{...defaultRoleProfile(),identity:'电商客户服务专员',background:'依据售后政策处理订单、配送和退换货咨询。',traits:['耐心','准确','克制'],greeting:'您好，请描述订单问题，我会先核对适用政策。',skills:['knowledge']},name:'客服 · 售后应答',desc:'依据服务政策回答订单、物流和退换货问题，保留依据和待核实项。',color:'#5270df',icon:'chat',model:'m1',knowledge:['k1'],instructions:'你是电商售后客服。优先检索客户服务知识库，说明适用条件和引用来源；无法核实的订单状态与退款结果不得编造。',published:true,revision:3},
 {id:'a2',profile:{...defaultRoleProfile(),identity:'业务运营分析专员',background:'梳理运营流程和指标口径，分析异常与改进机会。',traits:['严谨','清晰','审慎'],warmth:45,humor:15,initiative:55,detail:55,greeting:'请给出业务指标或流程问题，我会先核对统计口径。',skills:['knowledge']},name:'运营 · 指标分析',desc:'解释运营指标口径，整理流程异常与改进建议。',color:'#278a77',icon:'book',model:'m1',knowledge:['k2'],instructions:'你是运营分析专员。先核对指标定义与数据来源，区分事实、推断和待验证假设，不编造实时统计结果。',published:true,revision:2},
 {id:'a3',profile:{...defaultRoleProfile(),identity:'企业销售方案顾问',background:'根据客户需求整理产品价值、方案结构和待确认事项。',traits:['专业','清晰','务实'],warmth:60,humor:15,initiative:60,detail:60,greeting:'请告诉我客户行业、目标与约束，我来整理方案框架。',skills:['knowledge']},name:'销售 · 方案顾问',desc:'围绕客户需求整理方案提纲、价值点与后续跟进事项。',color:'#b18443',icon:'spark',model:'m2',knowledge:[],instructions:'你是企业销售方案顾问。先确认客户场景和约束，再给出方案建议；不编造价格、案例、合同承诺或已完成的跟进。',published:true,revision:1},
 {id:'a4',profile:{...defaultRoleProfile(),identity:'员工入职支持专员',background:'整理入职材料、流程节点和岗位常见问题。',traits:['细致','耐心','守密'],warmth:55,humor:10,detail:65,skills:['knowledge']},name:'人事 · 入职助手',desc:'帮助新员工理解入职流程，核对材料清单和待办。',color:'#9b6aaf',icon:'file',model:'m1',knowledge:[],instructions:'你是人事入职助手。根据已提供的人事制度回答；涉及薪酬、个人信息或劳动合同解释时提示人工确认，不编造审批结果。',published:false,revision:1}
 ],
 connections:[{id:'m1',name:'主力对话模型',provider:'通义千问',model:'qwen-plus',status:'演示可用',role:'LLM',enabled:true,isDefault:true},{id:'m2',name:'辅助对话模型',provider:'DeepSeek',model:'deepseek-chat',status:'演示可用',role:'LLM',enabled:true}],
 knowledge:[{id:'k1',scope:'workspace',name:'客户服务知识库',desc:'订单、物流、售后与退换货政策。',count:3,color:'#5270df'},{id:'k2',scope:'workspace',name:'运营流程知识库',desc:'指标口径、活动复盘和异常处理流程。',count:2,color:'#278a77'},{id:'k3',scope:'private',name:'销售方案资料',desc:'客户需求与方案素材，等待导入资料。',count:0,color:'#b18443'}],
 docs:[{id:'d1',knowledge:'k1',name:'售后退换货指引.md',size:'12 KB',status:'已索引',text:'客服回答退换货问题时，先核对订单签收时间、商品状态和适用政策。申请结果以实际订单系统为准。'},
 {id:'d2',knowledge:'k1',name:'配送与订单咨询.md',size:'8 KB',status:'已索引',text:'查询物流异常时先确认订单编号和配送节点。未接入订单系统时只能说明处理流程，不宣称包裹实时位置。'},
 {id:'d3',knowledge:'k1',name:'客户服务常见问题.txt',size:'4 KB',status:'已索引',text:'售前与售后答复必须标注政策依据。退款到账时间以支付渠道和实际审核结果为准。'},
 {id:'d4',knowledge:'k2',name:'运营指标口径.md',size:'6 KB',status:'已索引',text:'订单量、转化率和复购率统计需要明确时间范围、去重口径与数据来源。不能把演示数字作为真实报表。'},
 {id:'d5',knowledge:'k2',name:'活动复盘流程.md',size:'5 KB',status:'已索引',text:'活动复盘依次核对目标、实际数据、异常事件与改进动作。缺少数据时标记待补充，不编造结论。'}],
 missions:[{id:'t1',name:'运营活动复盘',agent:'a2',status:'待审批',time:'今天 14:30'},{id:'t2',name:'售后咨询抽检',agent:'a1',status:'已完成',time:'今天 10:24'},{id:'t3',name:'销售方案待核对',agent:'a3',status:'待核实',time:'今天 09:10'}],
 extensions:[{id:'e1',name:'知识检索',desc:'连接知识库，让回答带有可信来源。',layer:'business',enabled:true,color:'#5270df',scope:'知识库：读取'},
 {id:'e2',name:'资料复核',desc:'组合检索工具，整理可核对的资料摘要。',layer:'business',enabled:false,color:'#278a77',scope:'知识：读取；任务：创建'},
 {id:'e3',name:'MCP 工具连接',desc:'发现远程工具，按工具授权后供智能体调用。',layer:'business',enabled:false,color:'#9b6aaf',scope:'按工具单独授权'},
 {id:'e4',name:'本地控制站',desc:'随应用编译的 station / platform 能力。',layer:'native',enabled:true,color:'#477ea7',scope:'宿主生命周期与文件访问'},
 {id:'e6',name:'音频桥接',desc:'随应用编译的 audio 原生插件。',layer:'native',enabled:true,color:'#bd6d80',scope:'麦克风与音频输出'}],
 members:[{id:'u1',name:'Alex',role:'管理员'},{id:'u2',name:'体验成员',role:'查看者'}],notes:[],preferences:{name:'Agent Workspace',language:'简体中文',timezone:'Asia/Shanghai'}
};}
