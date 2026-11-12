import {roleVoiceIssue} from './role_loadout.ts';
import {connectionMatchesCategory} from './model_categories.ts';
import type {Station} from './station.ts';
import {activeMemories} from './settings_integration.ts';
import type {Agent,Store} from './state.ts';
import type {Host} from './catalog.ts';
import type {SkillRecord} from './product_state.ts';
import {cloneRoleProfile,effectiveRoleInstructions,roleConfigFingerprint,type RoleMemory} from './role_profile.ts';
import {cloneAgentRuntime,validateAgentRuntime,indexedDocumentText} from './feature_state.ts';
import {buildTrialReply} from './agent_reply.ts';
export type LinkageEnvironment={store:Store;skills:SkillRecord[];host:Host;station?:Station};
export type LinkageIssue={kind:string;id:string;message:string};
export type LinkageEvent={kind:string;name:string;status:string;detail:string};
export type AgentTurn={id:string;agentId:string;revision:number;config:string;resources:string;model:{id:string;name:string;provider:string;model:string};request:{models:{role:string;id:string;name:string;model:string}[];sandbox?:{id:string;name:string;target:string;isolation:string;network:boolean;timeout:number;directory:string};tools:{id:string;name:string;adapter:string;target:string;modelId:string}[];instructions:string;knowledge:{id:string;name:string;text:string}[];memory:RoleMemory[];skills:{id:string;name:string;version:string;content:string}[];history:{role:string;text:string}[]};references:{id:string;name:string;text:string}[];events:LinkageEvent[];text:string;citation:boolean;blocked:boolean;memoryWrite?:{content:string;subject:string};status:'running'|'completed'|'interrupted'|'blocked'};
/** 知识库启用链路的模型依赖；历史无配置知识库继续按已索引文档使用。 */
function knowledgeModelDependencies(agent:Agent,env:LinkageEnvironment):{knowledge:string;role:string;id:string}[]{
 return agent.knowledge.flatMap(id=>{const config=env.store.knowledge.find(k=>k.id===id)?.configuration;if(!config)return [];const rows:{role:string;id:string}[]=[];
 if(config.modelConfig.llmModelId)rows.push({role:'LLM',id:config.modelConfig.llmModelId});
 if(config.indexingStrategy.vectorEnabled)rows.push({role:'Embedding',id:config.modelConfig.embeddingModelId});
 if(config.indexingStrategy.wikiEnabled&&config.modelConfig.wikiSynthesisModelId)rows.push({role:'LLM',id:config.modelConfig.wikiSynthesisModelId});
 if(config.multimodalConfig.enabled)rows.push({role:'VLLM',id:config.multimodalConfig.vllmModelId});
 if(config.asrConfig.enabled)rows.push({role:'ASR',id:config.asrConfig.modelId});
 for(const setting of [config.questionGenerationConfig,config.autoTagConfig,config.profileConfig])if(setting.enabled&&setting.modelId)rows.push({role:'LLM',id:setting.modelId});
 return rows.map(row=>({...row,knowledge:id}));});
}
/** 所有发布与本地调试共用同一套引用校验，不能靠入口存在判断资源就绪。 */
export function linkageIssues(agent:Agent,env:LinkageEnvironment):LinkageIssue[]{
 const p=cloneRoleProfile(agent.profile),r=cloneAgentRuntime(agent.runtime),out:LinkageIssue[]=[];
 const issue=(kind:string,id:string,message:string)=>out.push({kind,id,message});
 const model=env.store.connections.find(m=>m.id===agent.model),workflow=env.store.workflows.find(w=>w.id===agent.workflowId);
 if(agent.workflowId?!(workflow?.enabled&&workflow.status==='演示可用'):!model||model.enabled===false||model.status!=='演示可用'||!connectionMatchesCategory(model,'LLM'))issue('models',agent.model,'主模型或外部智能体连接未就绪');
 const checked={...r,bindings:Object.fromEntries(Object.entries(r.bindings).filter(([key])=>!p.disabledAbilities.includes(key==='意图'?'Intent':key)))};
 const runtimeIssue=validateAgentRuntime(checked,env.store.connections);if(runtimeIssue)issue('models','runtime',runtimeIssue);const voiceIssue=roleVoiceIssue(agent,env.store.voiceAssets,env.store.connections);if(voiceIssue)issue('voice','TTS',voiceIssue);
 for(const id of agent.knowledge){const k=env.store.knowledge.find(k=>k.id===id);if(!k)issue('knowledge',id,'关联知识库已移除');else if(!env.store.docs.some(d=>d.knowledge===id&&d.status==='已索引'))issue('knowledge',id,`${k.name} 尚无已索引文档`);}
 for(const dependency of knowledgeModelDependencies(agent,env)){const model=env.store.connections.find(m=>m.id===dependency.id);if(!model||model.enabled===false||model.status!=='演示可用'||!connectionMatchesCategory(model,dependency.role))issue('knowledge',dependency.knowledge,`知识库的 ${dependency.role} 连接未就绪或分类不匹配`);}
 for(const id of p.extensions){const e=env.store.extensions.find(e=>e.id===id);if(!e||!e.enabled)issue('plugins',id,`${e?.name||id} 插件不存在或已停用`);else if(e.layer==='native'&&env.host==='web')issue('plugins',id,`${e.name} 需要原生控制端，Web 不执行 Tauri 插件`);}
 for(const [id,tools] of Object.entries(p.connectionTools)){if(!tools.length)continue;const e=env.store.extensions.find(e=>e.id===id);if(!e?.enabled)issue('connections',id,`${e?.name||id} MCP连接不存在或未启用本地调试`);else if(e.transport==='stdio'&&e.executionTarget==='local'&&env.host!=='desktop')issue('connections',id,'本机 stdio 调试仅由 Desktop 提供');else if(tools.some(tool=>!e.tools?.includes(tool)))issue('connections',id,`${e.name} 的授权工具声明已变化，请重新选择`);}
 for(const id of p.skills){const skill=env.skills.find(s=>s.id===id);if(!skill?.installed||!skill.content.trim())issue('skills',id,`${skill?.name||id} 技能已移除或正文为空`);}
 if(r.sandboxId){const box=env.station?.sandboxes.find(x=>x.id===r.sandboxId);if(!box?.enabled)issue('sandbox',r.sandboxId,'所选沙箱不存在或已停用');}
 for(const id of r.stationTools||[]){const tool=env.station?.tools.find(x=>x.id===id);if(!tool?.enabled)issue('tools',id,'所选工具不存在或已停用');else if(tool.modelId&&!env.store.connections.some(m=>m.id===tool.modelId&&m.enabled!==false&&m.status==='演示可用'&&connectionMatchesCategory(m,'VLLM')))issue('models',tool.modelId,'工具关联的视觉模型未就绪或分类不匹配');}
 return out;
}
/** 资源依赖独立于配置指纹；修改文档、技能版本、模型连接或工具声明后必须重新调试。 */
export function resourceFingerprint(agent:Agent,env:LinkageEnvironment):string{
 const p=cloneRoleProfile(agent.profile),r=cloneAgentRuntime(agent.runtime),ids=new Set([agent.model,...Object.values(r.bindings),...knowledgeModelDependencies(agent,env).map(x=>x.id),...(r.longTermMemory?.enabled?[r.longTermMemory.model,r.longTermMemory.semantic?r.longTermMemory.embedding:'']:[]),...(r.stationTools||[]).map(id=>env.station?.tools.find(t=>t.id===id)?.modelId||'')]),extensionIds=new Set([...p.extensions,...Object.keys(p.connectionTools).filter(id=>p.connectionTools[id].length)]);
 return JSON.stringify({station:r.sandboxId||r.stationTools?.length?{sandbox:env.station?.sandboxes.find(x=>x.id===r.sandboxId)||null,tools:(r.stationTools||[]).map(id=>env.station?.tools.find(x=>x.id===id)||{id,missing:true})}:undefined,models:env.store.connections.filter(m=>ids.has(m.id)).sort((a,b)=>a.id.localeCompare(b.id)),workflow:env.store.workflows.find(w=>w.id===agent.workflowId),knowledge:agent.knowledge.map(id=>({id,exists:env.store.knowledge.some(k=>k.id===id),configuration:env.store.knowledge.find(k=>k.id===id)?.configuration,docs:env.store.docs.filter(d=>d.knowledge===id).map(d=>({id:d.id,status:d.status,text:indexedDocumentText(d)})).sort((a,b)=>a.id.localeCompare(b.id))})),extensions:[...extensionIds].sort().map(id=>env.store.extensions.find(e=>e.id===id)||{id,missing:true}),skills:p.skills.map(id=>env.skills.find(s=>s.id===id)||{id,missing:true}),host:p.extensions.some(id=>env.store.extensions.find(e=>e.id===id)?.layer==='native')?env.host:'shared'});
}
/** 确定性的前端模拟执行：读取真实本地资源，执行受控演练；绝不调用模型、远程MCP或原生接口。 */
export function simulateAgentTurn(agent:Agent,input:string,env:LinkageEnvironment,history:{role:string;text:string}[]=[]):AgentTurn{
 const p=cloneRoleProfile(agent.profile),r=cloneAgentRuntime(agent.runtime),workflow=env.store.workflows.find(x=>x.id===agent.workflowId),m=agent.workflowId?undefined:env.store.connections.find(x=>x.id===agent.model),events:LinkageEvent[]=[];
 const localMemory=(r.memoryMode==='本地独立记忆'||r.longTermMemory?.enabled===true)&&!p.disabledAbilities.includes('Mem');
 const memory=localMemory?structuredClone(activeMemories(env.store.roleMemories[agent.id]||[]).slice(0,r.longTermMemory?.maxItems||200)):[];
 const skills=env.skills.filter(s=>p.skills.includes(s.id)&&s.installed).map(s=>({id:s.id,name:s.name,version:s.version,content:s.content}));
 const query=input.toLowerCase(),terms=[...new Set([...query.matchAll(/[\p{Script=Han}]{2}|[a-z0-9_-]{2,}/gu)].map(m=>m[0]))];
 const documents=env.store.docs.filter(d=>(agent.tools?.includes('knowledge')??true)&&agent.knowledge.includes(d.knowledge)&&d.status==='已索引').map(d=>({id:d.id,name:d.name,text:indexedDocumentText(d),score:terms.reduce((n,t)=>n+((d.name+indexedDocumentText(d)).toLowerCase().includes(t)?1:0),0)}));
 // 显式联动检查使用所选资料；普通问题只返回有词项交集的文档，不伪造引用。
 const audit=/验证关联|检查关联/.test(input),references=documents.filter(d=>audit||d.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(({id,name,text})=>({id,name,text:text.slice(0,500)}));
 const run:AgentTurn={id:crypto.randomUUID(),agentId:agent.id,revision:agent.revision,config:roleConfigFingerprint(agent),resources:resourceFingerprint(agent,env),model:{id:m?.id||'',name:m?.name||workflow?.name||'外部智能体',provider:m?.provider||workflow?.platform||'外部服务',model:m?.model||agent.workflowId||''},request:{models:[{role:'LLM',id:agent.model},...knowledgeModelDependencies(agent,env).map(x=>({role:`知识库 ${x.knowledge} / ${x.role}`,id:x.id})),...(r.longTermMemory?.enabled?[{role:'记忆提取',id:r.longTermMemory.model},...(r.longTermMemory.semantic?[{role:'记忆召回',id:r.longTermMemory.embedding}]:[])]:[]),...Object.entries(r.bindings).filter(([role])=>!p.disabledAbilities.includes(role==='意图'?'Intent':role)).map(([role,id])=>({role,id}))].flatMap(binding=>{const model=env.store.connections.find(m=>m.id===binding.id);return model?[{...binding,name:model.name,model:model.model}]:[];}),sandbox:r.sandboxId?structuredClone(env.station?.sandboxes.find(x=>x.id===r.sandboxId)):undefined,tools:(r.stationTools||[]).flatMap(id=>{const tool=env.station?.tools.find(t=>t.id===id);return tool?[{id:tool.id,name:tool.name,adapter:tool.adapter,target:tool.target,modelId:tool.modelId}]:[];}),instructions:effectiveRoleInstructions(agent.instructions,p),knowledge:references,memory,skills,history:agent.context===false||p.disabledAbilities.includes('Mem')||r.memoryMode==='无记忆'?[]:history.slice(-12)},references,events,text:'',citation:false,blocked:false,status:'running'};
 const fail=(message:string)=>{run.blocked=true;run.status='blocked';run.text=message;events.push({kind:'guard',name:'资源与风控校验',status:'已阻止',detail:message});return run;};
 const issues=linkageIssues(agent,env);if(issues.length)return fail(issues.map(x=>x.message).join('；'));
 const word=p.risk.sensitiveWords.find(w=>w&&input.includes(w));if(word)return fail('这条输入触发了当前智能体的敏感词规则，请调整后再试。');
 if(r.sandboxId){const box=env.station!.sandboxes.find(x=>x.id===r.sandboxId)!;events.push({kind:'sandbox',name:box.name,status:'已装配',detail:`${box.target} / ${box.isolation} / ${box.timeout}s；本轮不执行脚本`});}
 const builtin=input.match(/^\/builtin\s+(\S+)/);if(builtin){if(!r.stationTools?.includes(builtin[1]))return fail('当前智能体未获准使用此工具');const tool=env.station!.tools.find(x=>x.id===builtin[1])!;if(tool.target==='desktop'&&env.host!=='desktop')return fail('该工具需要 Desktop 宿主，本轮 Web 或 Tablet 不执行本机工具');events.push({kind:'tools',name:tool.name,status:'配置演练',detail:`${tool.adapter} / ${tool.target}；没有发送外部请求`});}
 if(audit)for(const id of r.stationTools||[]){const tool=env.station!.tools.find(x=>x.id===id)!;events.push({kind:'tools',name:tool.name,status:'已装配',detail:`${tool.adapter} / ${tool.target}；授权检查通过，不执行外部调用`});}
 events.push({kind:'models' ,name:m?.name||'外部智能体',status:'本地模拟',detail:`${m?.provider||'外部服务'} / ${m?.model||agent.workflowId}；已构造当前人格与Prompt，不发送服务请求`});
 events.push({kind:'knowledge',name:'知识检索',status:references.length?'本地命中':'无命中',detail:references.map(d=>d.name).join('、')||`限定 ${agent.knowledge.length} 个关联知识库，不读取其他知识`});
 events.push({kind:'memory',name:r.memoryMode,status:localMemory?'已读取':'未读取长期记忆',detail:localMemory?`仅读取当前智能体的 ${memory.length} 条独立记忆`:'遵守当前记忆模式'});
 const skillRequest=input.match(/^\/skill\s+(\S+)/),toolRequest=input.match(/^\/tool\s+(\S+)\s+(\S+)/),command=p.commands.find(c=>c.enabled&&(input===c.name||input.startsWith(c.name+' ')));
 const eventRequest=input.match(/^\/event\s+(.+)/);
 const hooks=p.hooks.filter(h=>h.enabled&&h.event===(eventRequest?.[1]||(!history.length?'会话开始':'')));
 for(const hook of hooks){const cmd=hook.action.startsWith('command:')?p.commands.find(c=>c.id===hook.action.slice(8)&&c.enabled):undefined;if(cmd)run.request.instructions+='\n钩子指令：'+cmd.instruction;}
 for(const hook of hooks)events.push({kind:'hooks',name:hook.event,status:'本地触发',detail:hook.action});
 const requestedSkills=new Set([...(audit?p.skills:[]),...(skillRequest?[skillRequest[1]]:[]),...hooks.filter(h=>h.action.startsWith('skill:')).map(h=>h.action.slice(6))]);
 if(skillRequest&&!p.skills.includes(skillRequest[1]))return fail('该技能没有装配到当前智能体。');
 if(command)events.push({kind:'commands',name:command.name,status:'本地触发',detail:command.instruction});
 for(const id of requestedSkills){const skill=skills.find(s=>s.id===id);if(skill)events.push({kind:'skills',name:skill.name,status:'已装载',detail:skill.content.replace(/^---[\s\S]*?---\s*/, '').slice(0,500)});}
 const requestedTools=toolRequest?[[toolRequest[1],toolRequest[2]]]:audit?Object.entries(p.connectionTools).flatMap(([id,tools])=>tools.map(t=>[id,t])):[];
 for(const [id,tool] of requestedTools){if(!p.connectionTools[id]?.includes(tool))return fail('当前智能体未获准调用这个 MCP 工具。');const e=env.store.extensions.find(e=>e.id===id)!;const write=/delete|remove|create|update|write|restart|move|send/i.test(tool);events.push({kind:'connections',name:`${e.name} / ${tool}`,status:write?'待审批':'模拟完成',detail:write?'只形成待审批意图，不调用外部写入服务':`读取所授权的 ${e.transport||'HTTP'} 工具声明；本地演练回执，不冒充外部业务结果`});}
 if(audit)for(const id of p.extensions){const e=env.store.extensions.find(e=>e.id===id)!;events.push({kind:'plugins',name:e.name,status:'模拟完成',detail:e.id==='e1'?`知识插件接收当前检索结果 ${references.length} 条`:e.layer==='native'?`${env.host} 宿主能力演练；未调用原生接口`:`装配策略已生效：${e.scope}`});}
 const remember=input.match(/(?:请)?记住[：:]\s*(.+)/s);
 if(remember&&localMemory){run.memoryWrite={subject:env.store.members.find(x=>x.id==='u1')?.name||'当前用户',content:remember[1].trim().slice(0,1000)};run.text=`好的，这条偏好将在本轮完成后记入我的独立记忆：${run.memoryWrite.content}`;}
 else if(remember)run.text='当前没有启用本地独立记忆；这条内容不会写入长期记忆。';
 else if(!audit&&/记忆|偏好|记得/.test(input))run.text=localMemory?(memory.length?`我记得：${memory.map(x=>x.content).join('；').slice(0,220)}`:'我的独立记忆里还没有记录。'):'当前记忆模式不读取长期记忆。';
 else if(eventRequest)run.text=hooks.length?`事件「${eventRequest[1]}」已在本地触发 ${hooks.length} 项钩子；执行过程列出对应技能或命令，不调用外部服务。`:'该事件未关联启用的钩子。';
 else if(toolRequest)run.text=`已完成「${toolRequest[2]}」的授权与本地工具演练。请在执行过程中查看回执；没有请求外部服务。`;
 else if(skillRequest||command){const detail=skillRequest?skills.find(s=>s.id===skillRequest[1]):undefined;run.text=detail?`按「${detail.name}」技能处理：${detail.content.replace(/^---[\s\S]*?---\s*/, '').slice(0,150)}`:`命令 ${command!.name} 已采用：${command!.instruction.slice(0,150)}`;}
 else if(audit)run.text=`关联检查完成：模型 ${run.model.model}，知识命中 ${references.length} 条，插件 ${p.extensions.length} 项，MCP工具 ${requestedTools.length} 项，技能 ${skills.length} 项，独立记忆 ${memory.length} 条。可展开执行过程逐项核对。`;
 else if(references.length){run.text=`根据《${references[0].name}》：${references[0].text.slice(0,180)}`;run.citation=true;}
 else run.text=buildTrialReply(agent,input).text;
 return run;
}

/** 当前配置及依赖必须均与已完成轮次一致；旧入口标记不能代替完整联动验证。 */
export function hasCurrentAgentCheck(agent:Agent,env:LinkageEnvironment,check?:{config:string;resources:string}):boolean{return !!check&&check.config===roleConfigFingerprint(agent)&&check.resources===resourceFingerprint(agent,env)&&!linkageIssues(agent,env).length;}
/** 只有正常完成的轮次允许写入独立记忆和登记调试结果。停止、插话与离开不会提交待写内容。 */
export function settleAgentTurn(run:AgentTurn,completed:boolean):{run:AgentTurn;memoryWrite?:AgentTurn['memoryWrite'];check?:{config:string;resources:string}}{
 const success=completed&&!run.blocked&&run.status==='running';
 return {run:{...run,status:run.blocked?'blocked':success?'completed':'interrupted'},memoryWrite:success?run.memoryWrite:undefined,check:success?{config:run.config,resources:run.resources}:undefined};
}

/** 失效的联动凭证立即移除，避免停用再启用资源后复用旧测试。不会修改资源或已发布配置。 */
export function retainCurrentAgentChecks(env:LinkageEnvironment,checks:Record<string,{config:string;resources:string}>):typeof checks{
 const kept=Object.fromEntries(Object.entries(checks).filter(([id,check])=>{const agent=env.store.agents.find(a=>a.id===id);return !!agent&&hasCurrentAgentCheck(agent,env,check);}));
 return Object.keys(kept).length===Object.keys(checks).length?checks:kept;
}

/** 调试智能体使用当前草稿；发布预览读取已发布快照。 */
export function resolveTrialAgent(agent:Agent|undefined,published=false):Agent|undefined{return agent?(published&&agent.publishedConfig?{...agent,...structuredClone(agent.publishedConfig),revision:agent.publishedRevision||agent.revision}:agent):undefined;}
/** 完成回执必须仍对应当前保存的智能体和资源；临时覆盖与迟到数据不能授权发布。 */
export function completedTrialCheck(agent:Agent,run:AgentTurn,env:LinkageEnvironment):{config:string;resources:string}|undefined{const check={config:run.config,resources:run.resources};return run.status==='completed'&&!run.blocked&&run.agentId===agent.id&&hasCurrentAgentCheck(agent,env,check)?check:undefined;}
