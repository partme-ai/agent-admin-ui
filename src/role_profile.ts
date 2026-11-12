import {cloneAgentRuntime} from './feature_state.ts';
import type {Agent,AgentVersion} from './state.ts';
/** 人物面板的角色配置，与实际记忆内容分别保存。 */
export type RoleProfile={
 identity:string;background:string;values:string;boundaries:string;address:string;greeting:string;
 traits:string[];warmth:number;humor:number;initiative:number;detail:number;
 expression:string;screenTheme:string;disabledAbilities:string[];
 extensions:string[];connectionTools:Record<string,string[]>;skills:string[];
 commands:{id:string;name:string;instruction:string;enabled:boolean}[];
 hooks:{id:string;event:string;action:string;enabled:boolean}[];
 risk:{sensitiveWords:string[];requireApproval:boolean;allowToolWrite:boolean};
};
/** 记忆归属角色实例，可进一步按成员区分；不进入配置历史快照。 */
export type RoleMemory={id:string;subject:string;content:string;source:string;updated:string;status?:import('./settings_integration.ts').MemoryStatus;replacedBy?:string};
/** 创建互不共享引用的默认人物配置。 */
export function defaultRoleProfile():RoleProfile{return {
 identity:'知识与生活伙伴',background:'陪伴你探索问题、整理知识，也帮助你推进工作。',values:'诚实、尊重隐私，区分事实与推测。',boundaries:'未经允许不执行写入操作，不编造执行结果。',address:'你',greeting:'你好呀，今天有什么想一起探索的？',
 traits:['温和','耐心','好奇'],warmth:70,humor:35,initiative:40,detail:45,
 expression:'微笑',screenTheme:'石墨',disabledAbilities:['SLM','VLLM'],extensions:['e1'],connectionTools:{},skills:['knowledge'],commands:[],hooks:[],risk:{sensitiveWords:[],requireApproval:true,allowToolWrite:false}
};}
/** 合并既有角色数据并深拷贝，不污染原草稿或其他角色。 */
export function cloneRoleProfile(value?:RoleProfile):RoleProfile{return structuredClone({...defaultRoleProfile(),...value});}
/** 按稳定角色标识构造唯一面板路由。 */
export function rolePanelPath(agentId:string):string{return `/w/demo/agents/${encodeURIComponent(agentId)}/edit`;}
export const roleAbilitySlots=[
 {key:'VAD',name:'语音活动检测',desc:'感知你何时开始与结束说话'},
 {key:'ASR',name:'语音识别',desc:'把听到的话变成文字'},
 {key:'LLM',name:'主语言模型',desc:'理解问题、组织回应与工具调用'},
 {key:'SLM',name:'小参数模型',desc:'分担简单任务与本地轻量处理'},
 {key:'VLLM',name:'视觉大模型',desc:'理解图片与获授权的视觉输入'},
 {key:'Intent',name:'意图识别',desc:'识别诉求并选择允许的行动'},
 {key:'Mem',name:'记忆模式',desc:'决定如何保留与使用记忆'},
 {key:'TTS',name:'语音合成',desc:'把角色的回应转换为声音'},
 {key:'Lang',name:'对话语言',desc:'协调识别、回复与播报语言'},
 {key:'Voice',name:'声音音色',desc:'选择这个角色的声音'}
] as const;
/** 预览人格和性格将如何与手写行为说明共同生效。 */
export function effectiveRoleInstructions(instructions:string,profile:RoleProfile):string{return [
 `身份：${profile.identity}`,`背景：${profile.background}`,`价值取向：${profile.values}`,`行为边界：${profile.boundaries}`,`称呼用户：${profile.address}`,`性格：${profile.traits.join('、')}`,
 `表达偏好：热情${profile.warmth}/100，幽默${profile.humor}/100，主动${profile.initiative}/100，详略${profile.detail}/100。`,instructions.trim()
].filter(Boolean).join('\n');}
/** 返回发布前可解释的角色字段错误，不代表真实权限或模型验证。 */
export function validateRoleProfile(p:RoleProfile):string{
 if(!p.identity.trim())return '请填写角色身份';
 if(!p.boundaries.trim())return '请填写行为边界';
 if(p.commands.some(x=>!x.name.trim()||!x.instruction.trim()))return '请补齐命令名称和指令';
 if(new Set(p.commands.map(x=>x.name.trim())).size!==p.commands.length)return '命令名称不能重复';
 if(p.hooks.some(x=>!x.event||!x.action.trim()))return '请补齐钩子的事件与动作';
 const targets=new Set([...p.skills.map(id=>`skill:${id}`),...p.commands.filter(c=>c.enabled).map(c=>`command:${c.id}`)]);
 if(p.hooks.some(h=>h.enabled&&!targets.has(h.action)))return '已启用的钩子目标不可用，请重新选择或停用钩子';
 if(p.risk.allowToolWrite&&!p.risk.requireApproval)return '工具写入必须保留审批';
 return '';
}
/** 配置身份不受保存修订号影响；变更Prompt、声音或任一配置都会使旧试聊失效。 */
export function roleConfigFingerprint(a:Agent|AgentVersion):string{
 const value={name:a.name,desc:a.desc,icon:a.icon,avatar:a.avatar,model:a.model,knowledge:a.knowledge,instructions:a.instructions,profile:cloneRoleProfile(a.profile),runtime:cloneAgentRuntime(a.runtime),tools:a.tools||[],temperature:a.temperature,context:a.context??cloneAgentRuntime(a.runtime).memoryMode!=='无记忆',memory:a.memory??['本地独立记忆','mem0','PowerMem'].includes(cloneAgentRuntime(a.runtime).memoryMode),channels:a.channels||[],workflowId:a.workflowId};
 const stable=(v:unknown):unknown=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([,x])=>x!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,stable(x)])):v;
 return JSON.stringify(stable(value));
}
/** 只有当前配置经过完整模拟回应，才满足本地创建流程的试聊步骤。 */
export function hasCurrentRoleTrial(agent:Agent,trials:Record<string,string>):boolean{return trials[agent.id]===roleConfigFingerprint(agent);}
