import type {KnowledgeConfig} from './knowledge_config.ts';
import type {AgentTurn} from './agent_linkage.ts';
import {cloneRoleProfile,defaultRoleProfile,type RoleProfile,type RoleMemory} from './role_profile.ts';
import {cloneAgentRuntime,type AgentRuntime,type ConfigEntry,type FirmwareAsset,type ProviderDefinition,type PromptTemplate,type KnowledgeOptions,type StorageOptions} from './feature_state.ts';
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
 const patterns:[RegExp,string][]=[[/^agents\/[^/]+\/edit$/,'04'],[/^models\/connections\/[^/]+$/,'07'],[/^knowledge\/[^/]+\/documents\/[^/]+$/,'10'],[/^knowledge\/[^/]+\/retrieval$/,'11'],[/^knowledge\/[^/]+$/,'09'],[/^devices\/[^/]+\/control$/,'15'],[/^devices\/[^/]+$/,'13'],[/^tasks\/[^/]+$/,'17'],[/^runs\/[^/]+$/,'19'],[/^extensions\/[^/]+$/,'21'],[/^firmware\/plans\/[^/]+$/,'26'],[/^chat\/[^/]+$/,'02']];
 return patterns.find(([pattern])=>pattern.test(relative))?.[1]||'404';
}
export function selectionFromPath(raw:string):string {
 const [path,search]=raw.replace(/^#/,'').split('?');
 const explicit=new URLSearchParams(search).get('item');if(explicit)return explicit;
 const match=path.match(/\/(?:agents|connections|knowledge|devices|tasks|runs|extensions|plans)\/([^/]+)(?:\/|$)/);
 const doc=path.match(/\/documents\/([^/]+)/);return decodeURIComponent(doc?.[1]||match?.[1]||'');
}
export function normalizePreview(raw:unknown):{page:string;theme:'light'|'dark';style?:'cards'|'compact'}|null {
 if(!raw||typeof raw!=='object')return null;
 const data=raw as Record<string,unknown>;
 if(!pages.some(p=>p.id===data.page)||!['light','dark'].includes(String(data.theme)))return null;
 return {page:String(data.page),theme:data.theme as 'light'|'dark',...(['cards','compact'].includes(String(data.style))?{style:data.style as 'cards'|'compact'}:{})};
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
export type Bot={mac?:string;firmware?:string;autoUpdate?:boolean;id:string;name:string;kind:string;location:string;status:string;battery:number;agent:string};
export type Mission={id:string;name:string;device:string;status:string;time:string};
export type Extension={transport?:string;executionTarget?:string;command?:string;headers?:string;timeout?:number;id:string;name:string;desc:string;layer:'native'|'business';enabled:boolean;color:string;scope:string;kind?:string;endpoint?:string;tools?:string[];version?:string};
export type Conversation={runs?:AgentTurn[];config?:AgentVersion;sample?:boolean;tools?:{name:string;status:string}[];device?:string;date?:string;id:string;agent:string;deviceProfile?:string;ttsModel?:string;voice?:string;title:string;messages:{role:'user'|'assistant';text:string;citation?:boolean}[];summary:string};
export type VoiceAsset={providerId?:string;connectionId?:string;voiceId?:string;modelIds?:string[];id:string;name:string;sample:string;status:string;provider:string;agent:string};
export type Store={roleTrials:Record<string,string>;roleMemories:Record<string,RoleMemory[]>;firmwarePolicy:{automatic:boolean;channel:string};contacts:{id:string;name:string;allowed:boolean}[];gateway:{endpoint:string;allowed:boolean;configured:boolean};mediaNames:string[];speakers:string[];voiceDefaults?:AgentRuntime;voiceStages:Record<string,boolean>;voicePolicy:{stream:string;aec:boolean;interrupt:boolean;active:boolean;format:string;rate:number};defaultAgentId:string;rolePermissions:Record<string,string[]>;deviceMemory:Record<string,string>;systemEntries:ConfigEntry[];customProviders:ProviderDefinition[];promptTemplates:PromptTemplate[];firmwareAssets:FirmwareAsset[];storage:StorageOptions;favoriteVoices:string[];voiceAssets:VoiceAsset[];workflows:WorkflowConnection[];conversations:Conversation[];memoryMode:string;terminalAccess:{id:string;name:string;kind:string;enabled:boolean}[];agents:Agent[];connections:Connection[];knowledge:Knowledge[];docs:Doc[];bots:Bot[];missions:Mission[];extensions:Extension[];members:{id:string;name:string;role:string;enabled?:boolean;email?:string;avatar?:string;bio?:string}[];notes:string[];preferences:{name:string;language:string;timezone:string;notifications?:{approval:boolean;offline:boolean;product:boolean}}};
export function initialStore():Store {return {roleTrials:{},
 roleMemories:{a1:[{id:"rm1",subject:"Alex",content:"喜欢简洁的回答，遇到不确定信息希望先说明依据。",source:"手动记录 · 示例",updated:"2026-11-05"}],a2:[{id:"rm2",subject:"工作空间",content:"工作室巡检先检查电量和网络，操作前请求确认。",source:"巡检偏好 · 示例",updated:"2026-11-05"}],a3:[],a4:[]},
 firmwarePolicy:{automatic:false,channel:'stable'},contacts:[{id:'c1',name:'客厅 · 小白',allowed:true},{id:'c2',name:'工作室 · 巡游者',allowed:false}],gateway:{endpoint:'',allowed:false,configured:false},mediaNames:['轻柔晨光','专注时刻','夜间白噪音'],speakers:['Alex · 已登记（演示）'],voiceStages:{VAD:true,ASR:true,LLM:true,TTS:true},voicePolicy:{stream:'流式分段',aec:false,interrupt:true,active:false,format:'PCM',rate:16000},defaultAgentId:'a1',rolePermissions:{'管理员':['workspace','agents','knowledge','devices'],'操作员':['agents:read','agents:write','knowledge:read','knowledge:write','devices:read'],'查看者':['agents:read','knowledge:read','devices:read']},deviceMemory:{b1:'用户偏好：回答简短（示例上下文）'},systemEntries:[{id:'cfg1',group:'系统参数',key:'session_timeout',value:'60',type:'number',note:'会话空闲时长（秒）'},{id:'cfg2',group:'字典',key:'firmware.esp32',value:'TinyBot ESP32',type:'text'},{id:'cfg3',group:'服务地址',key:'websocket_url',value:'ws://127.0.0.1:8000/xiaozhi/v1/',type:'text',note:'待接入示例地址'},{id:'cfg4',group:'功能开关',key:'voice_clone',value:'true',type:'boolean',note:'界面入口开关，不代表厂商已授权'}],customProviders:[],promptTemplates:[],firmwareAssets:[{id:'fw1',name:'TinyBot ESP32',kind:'TinyBot ESP32',version:'1.0.1',file:'tinybot-esp32-1.0.1.bin',size:0,note:'内置演示版本记录',status:'示例验证记录'},{id:'fw2',name:'TinyBot Pi',kind:'TinyBot Pi',version:'1.1.0',file:'tinybot-pi-1.1.0.img',size:0,note:'内置演示版本记录',status:'示例验证记录'}],storage:{provider:'local',fields:{directory:'./data/tinybot'},retention:'30',result:'未检测'},favoriteVoices:[],voiceAssets:[],workflows:[],conversations:[{id:'sample-chat-1',sample:true,agent:'a1',device:'b1',date:'2026-11-05',title:'设备绑定咨询',messages:[{role:'user',text:'如何绑定我的设备？'},{role:'assistant',text:'打开设备中心，使用设备码或手动MAC添加。设备尚未接入时显示待接入。'}],summary:'用户询问设备绑定方法，知识助手提供设备码与手动添加入口。',tools:[{name:'knowledge_search',status:'示例只读回执'}]},{id:'sample-chat-2',sample:true,agent:'a2',device:'b2',date:'2026-11-04',title:'巡检结果核对',messages:[{role:'user',text:'上次巡检有结果吗？'},{role:'assistant',text:'结果待核实，请查询原任务，避免重复执行。'}],summary:'设备巡检回执未知，建议查询原任务。'}],memoryMode:'短期上下文',terminalAccess:[{id:'term1',name:'当前 Desktop',kind:'控制端',enabled:true},{id:'channel1',name:'网页对话',kind:'聊天通道',enabled:true}],
 agents:[
 {id:'a1',profile:{...defaultRoleProfile(),identity:'知识与生活伙伴',traits:['温和','耐心','好奇']},name:'小知 · 知识助手',desc:'让散落的文档成为随时可问的知识。回答附有来源，重要结论可以追溯。',color:'#5270df',icon:'book',model:'m1',knowledge:['k1'],instructions:'你是 TinyBot 知识助手。根据知识库回答，标注引用来源；没有依据时坦诚说明。',published:true,revision:3},
 {id:'a2',profile:{...defaultRoleProfile(),identity:'可靠的设备管家',background:'熟悉设备与维护流程，先观察、再解释，让每一次操作都有依据。',traits:['严谨','沉稳','耐心'],warmth:45,humor:15,initiative:55,detail:55,greeting:'我在这里，先一起看看设备的状态吧。',skills:['inspection']},name:'阿巡 · 设备管家',desc:'巡查设备状态，解释异常，帮助你安排安全的维护任务。',color:'#278a77',icon:'robot',model:'m1',knowledge:['k2'],instructions:'优先观察设备状态，执行动作前请求确认。',published:true,revision:2},
 {id:'a3',profile:{...defaultRoleProfile(),identity:'好奇的学习伙伴',background:'把复杂的知识变成有趣的例子，陪你探索每一个为什么。',traits:['活泼','好奇','幽默'],warmth:85,humor:65,initiative:65,detail:50,greeting:'今天想发现什么新知识？',expression:'好奇',screenTheme:'暖沙',skills:['learning','story']},name:'星星 · 学习伙伴',desc:'把复杂问题讲清楚，用有趣的例子陪你探索新知识。',color:'#b18443',icon:'star',model:'m2',knowledge:[],instructions:'以启发式提问引导学习。',published:true,revision:1},
 {id:'a4',profile:{...defaultRoleProfile(),identity:'冷静的研究搭档',background:'梳理材料、比较证据，和你一起把想法变成清晰的研究方向。',traits:['严谨','简洁','沉稳'],warmth:40,humor:20,detail:65,skills:['knowledge']},name:'灵感 · 研究助理',desc:'梳理资料、组织思路，把一个想法变成清晰的行动计划。',color:'#9b6aaf',icon:'spark',model:'m1',knowledge:[],instructions:'区分事实、推测与待核实的信息。',published:false,revision:1}
 ],
 connections:[{id:'m1',name:'主力对话模型',provider:'通义千问',model:'qwen-plus',status:'演示可用',role:'LLM',enabled:true,isDefault:true},{id:'m2',name:'本地轻量模型',provider:'Ollama',model:'qwen3:8b',status:'演示可用',role:'LLM',enabled:true}],
 knowledge:[{id:'k1',scope:'workspace',name:'TinyBot 产品知识',desc:'产品手册、使用指南和常见问题。',count:3,color:'#5270df'},{id:'k2',scope:'workspace',name:'设备运维手册',desc:'配网、固件与常见故障排查。',count:2,color:'#278a77'},{id:'k3',scope:'private',name:'我的灵感空间',desc:'收集笔记，让知识持续生长。',count:0,color:'#b18443'}],
 docs:[{id:'d1',knowledge:'k1',name:'TinyBot 快速开始.md',size:'12 KB',status:'已索引',text:'为 TinyBot 接通电源，然后打开设备中心。选择添加设备，核对设备标识并完成绑定。首次配网需要应用获得蓝牙或局域网权限。绑定成功后选择一个已发布的智能体。'},
 {id:'d2',knowledge:'k1',name:'智能体使用指南.md',size:'8 KB',status:'已索引',text:'智能体由行为说明、模型、知识库和工具组成。修改后先保存草稿，再试聊；发布后，新会话才使用新的版本。'},
 {id:'d3',knowledge:'k1',name:'常见问题.txt',size:'4 KB',status:'已索引',text:'设备离线时先检查电源和网络，再查看最近心跳。断线不代表任务失败，应使用原任务标识查询结果。'},
 {id:'d4',knowledge:'k2',name:'设备巡检规范.md',size:'6 KB',status:'已索引',text:'巡检前确认电量、网络和控制资格。停止请求需要等待设备确认。'},
 {id:'d5',knowledge:'k2',name:'固件升级说明.md',size:'5 KB',status:'已索引',text:'升级前核对机型、版本、签名和恢复策略。等待重启后上报版本，不能把下载完成视为升级成功。'}],
 bots:[{id:'b1',mac:'AA:BB:CC:DD:EE:01',firmware:'1.0.0',autoUpdate:false,name:'小白',kind:'TinyBot ESP32',location:'客厅',status:'演示在线',battery:86,agent:'a1'},{id:'b2',mac:'AA:BB:CC:DD:EE:02',firmware:'1.0.0',autoUpdate:false,name:'巡游者',kind:'TinyBot Pi',location:'工作室',status:'演示在线',battery:72,agent:'a2'},{id:'b3',mac:'AA:BB:CC:DD:EE:03',firmware:'1.0.0',autoUpdate:false,name:'小橙',kind:'TinyBot ESP32',location:'书房',status:'离线',battery:0,agent:'a3'}],
 missions:[{id:'t1',name:'工作室例行巡检',device:'b2',status:'待审批',time:'今天 14:30'},{id:'t2',name:'客厅语音问答检查',device:'b1',status:'已完成',time:'今天 10:24'},{id:'t3',name:'书房设备恢复核对',device:'b3',status:'待核实',time:'今天 09:10'}],
 extensions:[{id:'e1',name:'知识检索',desc:'连接知识库，让回答带有可信来源。',layer:'business',enabled:true,color:'#5270df',scope:'知识库：读取'},
 {id:'e2',name:'设备巡检',desc:'组合已有工具，生成可审批的巡检计划。',layer:'business',enabled:false,color:'#278a77',scope:'设备：读取；任务：创建'},
 {id:'e3',name:'MCP 工具连接',desc:'发现远程工具，按工具授权后供智能体调用。',layer:'business',enabled:false,color:'#9b6aaf',scope:'按工具单独授权'},
 {id:'e4',name:'本地控制站',desc:'随应用编译的 station / platform 能力。',layer:'native',enabled:true,color:'#477ea7',scope:'宿主生命周期与文件访问'},
 {id:'e5',name:'设备连接',desc:'随应用编译的 device-link 原生插件。',layer:'native',enabled:true,color:'#b18443',scope:'串口 / BLE / 局域网：按平台'},
 {id:'e6',name:'音频桥接',desc:'随应用编译的 audio 原生插件。',layer:'native',enabled:true,color:'#bd6d80',scope:'麦克风与音频输出'}],
 members:[{id:'u1',name:'Alex',role:'管理员'},{id:'u2',name:'体验成员',role:'查看者'}],notes:[],preferences:{name:'TinyBot Lab',language:'简体中文',timezone:'Asia/Shanghai'}
};}
