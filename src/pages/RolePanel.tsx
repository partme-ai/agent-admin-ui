import {AgentToolBindings} from './AgentTools';
import {resolveDefaultModel} from '../settings_integration';
import {linkageIssues,hasCurrentAgentCheck} from '../agent_linkage';
import {AgentLinkageReview} from './AgentLinkageReview';
import {runtimeWithModelDefaults,applyRoleRuntime,roleVoiceIssue} from '../role_loadout';
import {CharacterEditor} from './CharacterEditor';
import {GrokCharacter} from './GrokCharacter';
import {RolePrompt} from './RolePrompt';
import {RoleDeviceBinding} from './RoleDeviceBinding';
import {hasCurrentRoleTrial,roleConfigFingerprint,canBindRole} from '../role_profile';
import {RoleCreationFlow} from './RoleCreationFlow';
import {useEffect,useRef,useState} from 'react';
import {Alert,Avatar,Button,Checkbox,Collapse,Switch,Drawer,Form,Input,Modal,Select,Space,Tag,Tabs} from 'antd';
import {AudioOutlined,ArrowRightOutlined,DeleteOutlined,DesktopOutlined,SaveOutlined,SendOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import {reviseAgent,type Agent} from '../state';
import {cloneAgentRuntime,validateAgentRuntime} from '../feature_state';
import {cloneRoleProfile,validateRoleProfile} from '../role_profile';
import {canUseConnection} from '../capability';
import {PageHeader,Section,Status} from '../components';
import {AgentVoiceSettings,AgentContextSources} from './AgentCapabilities';
import {AgentVersions} from './AgentLibrary';
import {RolePersonality} from './RolePersonality';
import {RoleMemory} from './RoleMemory';
import {RoleAbilities} from './RoleAbilities';
import {RoleExtensions} from './RoleExtensions';
import {ChatPanel} from './Chat';
import '../role_panel.css';

export function AgentEditor(){
 const c=useConsole(),existing=c.store.agents.find(a=>a.id===c.selected);
 const initial:Agent=existing?{...structuredClone(existing),profile:cloneRoleProfile(existing.profile),runtime:cloneAgentRuntime(existing.runtime||c.store.voiceDefaults)}:{id:crypto.randomUUID(),name:'我的新角色',desc:'一个正在认识世界的新伙伴。',color:'#278a77',icon:'robot',model:resolveDefaultModel(c.store.connections,c.product.integration.defaults,'chat'),knowledge:[],instructions:'理解用户的需求，诚实回答；需要执行动作时先确认权限。',published:false,revision:0,profile:cloneRoleProfile(),runtime:runtimeWithModelDefaults(c.store.voiceDefaults,c.store.connections,c.product.integration.defaults)};
 const [draft,setDraft]=useState(initial),[dirty,setDirty]=useState(!existing),[tab,setTab]=useState(!existing||existing.marketTemplateId||existing.revision===0&&!existing.published?'persona':'abilities'),[error,setError]=useState(''),[trial,setTrial]=useState(false),[binding,setBinding]=useState(false),[leaving,setLeaving]=useState(false);
 const dirtyRef=useRef(!existing),pendingLeave=useRef<(()=>void)|null>(null);
 useEffect(()=>{c.setNavigationGuard(proceed=>{if(!dirtyRef.current){proceed();return;}pendingLeave.current=proceed;setLeaving(true);});return()=>c.setNavigationGuard(null);},[c.setNavigationGuard]);
 useEffect(()=>{const guard=(e:BeforeUnloadEvent)=>{if(dirtyRef.current){e.preventDefault();e.returnValue='';}};addEventListener('beforeunload',guard);return()=>removeEventListener('beforeunload',guard);},[]);
 const edit=(patch:Partial<Agent>)=>{setDraft(v=>({...v,...patch}));dirtyRef.current=true;setDirty(true);};
 const p=cloneRoleProfile(draft.profile),r=cloneAgentRuntime(draft.runtime),devices=c.store.bots.filter(b=>b.agent===draft.id);
 const profile=(value:typeof p)=>edit({profile:value});
 const editRuntime=(runtime:typeof r)=>edit(applyRoleRuntime(runtime));
 function save(publish=false){
  if(!draft.name.trim()){setError('请填写角色名称。');return;}
  if(!draft.instructions.trim()){setError('请填写角色提示词（Prompt）。');setTab('prompt');return;}
  const issue=validateRoleProfile(p);if(issue){setError(issue);return;}
  if(publish){
   const resourceIssues=linkageIssues(draft,{store:c.store,skills:c.product.skills,host:c.host,station:c.product.station});if(resourceIssues.length){setError(resourceIssues.map(x=>x.message).join('；'));setTab('review');return;}
   const voiceIssue=roleVoiceIssue(draft,c.store.voiceAssets,c.store.connections);if(voiceIssue){setError(voiceIssue);setTab('voice');return;}
   const check=c.product.agentChecks[draft.id];
   if(!hasCurrentAgentCheck(draft,{store:c.store,skills:c.product.skills,host:c.host,station:c.product.station},check)){setError('请先使用当前配置完成一次模拟试聊，再发布角色。');return;}
   const checked={...r,bindings:Object.fromEntries(Object.entries(r.bindings).filter(([key])=>!p.disabledAbilities.includes(key==='意图'?'Intent':key)))};
   const runtimeIssue=validateAgentRuntime(checked,c.store.connections);if(runtimeIssue){setError(runtimeIssue);return;}
   const m=c.store.connections.find(x=>x.id===draft.model),workflow=c.store.workflows.find(w=>w.id===draft.workflowId),knowledgeReady=draft.knowledge.every(k=>c.store.docs.some(d=>d.knowledge===k&&d.status==='已索引'));
   if(!(workflow?workflow.enabled&&workflow.status==='演示可用':m&&canUseConnection(m))||!knowledgeReady){setError('发布前请准备好主模型或外部连接，以及已索引的关联知识。');return;}
  }
  const commit=()=>{const value=reviseAgent({...draft,profile:p,runtime:r},c.store.agents.find(a=>a.id===draft.id),publish);setDraft(value);dirtyRef.current=false;setDirty(false);setError('');c.setStore(s=>({...s,agents:s.agents.some(a=>a.id===value.id)?s.agents.map(a=>a.id===value.id?value:a):[...s.agents,value]}));c.notify(publish?'角色版本已发布，新会话将使用这个快照。':'角色草稿已保存。');return value;};
  if(publish)c.confirm('发布角色版本',`发布「${draft.name}」的人格、能力、声音及扩展配置；不会重放已有会话或设备动作。`,commit);else return commit();
 }
 function openTrial(){if(dirtyRef.current&&!save())return;setTrial(true);}
 const knowledge=<><div className="role-section-heading"><div><h3>知识与上下文</h3></div><Button onClick={()=>c.go('08')}>管理知识库</Button></div><Checkbox.Group className="role-knowledge-options" value={draft.knowledge} onChange={knowledge=>edit({knowledge:knowledge.map(String),tools:knowledge.length?[...new Set([...(draft.tools||[]),'knowledge'])]:draft.tools})} options={c.store.knowledge.map(k=>({value:k.id,label:<span><strong>{k.name}</strong><small>{k.desc}</small></span>}))}/><AgentContextSources value={r} onChange={editRuntime}/><Form layout="vertical" className="margin-top"><Form.Item label="外部智能体连接" extra="可选，由 AgentScope-Rust 统一编排与追踪。"><Select aria-label="角色外部智能体连接" allowClear value={draft.workflowId} placeholder="使用本地角色编排" options={c.store.workflows.map(w=>({value:w.id,label:`${w.name} · ${w.status}`,disabled:!w.enabled||w.status!=='演示可用'}))} onChange={workflowId=>edit({workflowId})}/></Form.Item><Form.Item label="外部检索连接"><Select aria-label="角色外部检索连接" allowClear placeholder="使用内置知识检索" value={r.bindings.RAG||undefined} onChange={id=>editRuntime({...r,bindings:{...r.bindings,RAG:id||''}})} options={c.store.connections.filter(m=>m.role==='RAG').map(m=>({value:m.id,label:`${m.name} · ${m.status}`}))}/></Form.Item></Form><Collapse items={[{key:'access',label:'基础工具与接入渠道',children:<><h4>基础工具授权</h4>{[['knowledge','知识检索'],['device','设备状态查询'],['task','创建待审批任务']].map(([key,label])=><div className="setting-row" key={key}><span>{label}</span><Switch aria-label={`角色基础工具${label}`} checked={(draft.tools??['knowledge']).includes(key)} onChange={on=>edit({tools:on?[...new Set([...(draft.tools??['knowledge']),key])]:(draft.tools??['knowledge']).filter(x=>x!==key)})}/></div>)}<h4>接入渠道</h4><Checkbox.Group aria-label="角色接入渠道" value={draft.channels??['web']} onChange={channels=>edit({channels:channels.map(String)})} options={[{value:'web',label:'Web试聊'},{value:'device',label:'设备语音'}]}/></>} ]}/></>;
 const panels=[
  {key:'review',label:'关联检查',children:<AgentLinkageReview agent={draft} onSelect={setTab}/>},
  {key:'abilities',label:'十项能力',children:<RoleAbilities agent={draft} onChange={edit}/>},
  {key:'models',label:'模型',children:<><div className="role-section-heading"><h3>这个智能体使用的模型</h3><Space wrap><Button onClick={()=>c.confirm('采用默认模型','仅将已指定的默认模型填入当前草稿，保留知识、工具、记忆记录与已发布版本；需要重新调试后发布。',()=>{const model=resolveDefaultModel(c.store.connections,c.product.integration.defaults,'chat');edit({model,runtime:runtimeWithModelDefaults(r,c.store.connections,c.product.integration.defaults),workflowId:undefined});})}>采用默认模型</Button><Button onClick={()=>c.go('06')}>配置 API / 授权连接</Button></Space></div><Form layout="vertical"><Form.Item label="主语言模型"><Select aria-label="智能体主模型连接" value={draft.model||undefined} onChange={model=>edit({model})} options={c.store.connections.filter(m=>(m.role||'LLM')==='LLM').map(m=>({value:m.id,label:`${m.name} · ${m.model} · ${m.status}`}))}/></Form.Item></Form><p className="muted">接入配置由模型服务集中维护；语音、视觉、意图与轻量模型在十项能力中分别装配。</p><Button onClick={()=>setTab('abilities')}>装配十项能力</Button></>},
  {key:'persona',label:'人格与性格',children:<RolePersonality agent={draft} onChange={edit}/>},
  {key:'appearance',label:'形象与动作',children:<CharacterEditor value={p.appearance} onChange={appearance=>profile({...p,appearance})}/>},
  {key:'prompt',label:'角色提示词 Prompt',children:<RolePrompt agent={draft} onChange={edit}/>},
  {key:'memory',label:'记忆',children:<RoleMemory agentId={draft.id} name={draft.name} runtime={r} onChange={editRuntime}/>},
  {key:'voice',label:'声音与音色',children:<><div className="role-section-heading"><div><h3>语音模型与音色</h3></div><Button onClick={()=>c.go('22')}>打开音色库</Button></div><AgentVoiceSettings value={r} onChange={editRuntime}/></>},
  {key:'knowledge',label:'知识',children:knowledge},
  ...([['plugins','插件'],['connections','连接'],['skills','技能'],['automation','命令与钩子'],['risk','风控']] as const).map(([key,label])=>({key,label,children:<RoleExtensions section={key} value={p} onChange={profile}/>})),
  {key:'sandbox',label:'沙箱与工具',children:<AgentToolBindings value={r} onChange={editRuntime}/>},
  {key:'history',label:'历史对话',children:<Button onClick={()=>c.go('24',draft.id)}>查看此智能体的对话记录</Button>},
  {key:'versions',label:'配置版本',children:<AgentVersions agent={draft} onRestore={value=>{setDraft(value);dirtyRef.current=false;setDirty(false);}}/>}
 ];
 return <div className={`role-panel role-view-${tab}`}><PageHeader title={draft.name} desc={`角色面板 · 草稿 v${draft.revision}${draft.publishedRevision?` / 已发布 v${draft.publishedRevision}`:''} · ${dirty?'有未保存修改':'配置已保存'}`} back="03" actions={<Space wrap><Button icon={<AudioOutlined/>} onClick={openTrial}>模拟试聊</Button><Button icon={<SaveOutlined/>} onClick={()=>save()}>保存草稿</Button><Button type="primary" icon={<SendOutlined/>} onClick={()=>save(true)}>发布角色</Button></Space>}/>{error&&<Alert className="margin-bottom" type="error" showIcon title={error} closable onClose={()=>setError('')}/>}<RoleCreationFlow agent={draft} dirty={dirty} onCustomize={()=>setTab("persona")} onPrompt={()=>setTab("prompt")} onTrial={openTrial} onPublish={()=>save(true)} onBind={()=>setBinding(true)}/><div className="role-hero">
  <section className={`role-portrait theme-${p.screenTheme==='森林'?'forest':p.screenTheme==='暖沙'?'sand':'graphite'}`} aria-label="角色形象"><div className="role-portrait-caption"><span>角色形象</span><span>{p.appearance?.pack==='grok'?'可定制角色':p.expression}</span></div>{p.appearance?.pack==='grok'?<GrokCharacter config={p.appearance}/>:draft.avatar?<Avatar src={draft.avatar} size={122} shape="square"/>:<div className={`role-face expression-${p.expression==='好奇'?'curious':p.expression==='平静'?'calm':'smile'}`}><span className="role-eye left"/><span className="role-eye right"/><span className="role-mouth"/><i className="role-cheek left"/><i className="role-cheek right"/></div>}<footer><strong>{draft.name.split(' · ')[0]}</strong><Button size="small" type="text" onClick={()=>setTab('appearance')}>编辑形象</Button></footer></section>
  <section className="role-persona-summary"><div className="role-section-heading"><div><h2>{p.identity}</h2></div><Button size="small" onClick={()=>setTab('persona')}>编辑人格</Button></div><p>{p.background}</p><div className="role-trait-tags">{p.traits.map((t,i)=><Tag key={i}>{t}</Tag>)}</div><blockquote>“{p.greeting}”</blockquote><div className="role-summary-metrics"><button onClick={()=>setTab('abilities')}><strong>10</strong><span>能力槽</span></button><button onClick={()=>setTab('memory')}><strong>{(c.store.roleMemories[draft.id]||[]).length}</strong><span>独立记忆</span></button><button onClick={()=>setTab('skills')}><strong>{p.skills.length}</strong><span>已选技能</span></button><button onClick={()=>setTab('plugins')}><strong>{p.extensions.length}</strong><span>已选插件</span></button></div></section>
  <section className="role-device-summary"><div className="role-section-heading"><div><h3>接入与状态</h3></div><DesktopOutlined/></div>{devices.length?devices.slice(0,2).map(b=><button className="role-device-link" key={b.id} onClick={()=>c.go('13',b.id)}><span><strong>{b.name}</strong><small>{b.kind}</small></span><Status text={b.status}/></button>):<div className="role-no-device">尚未绑定设备<br/><span>先在模拟屏幕中试一试</span></div>}<Button block onClick={openTrial}>打开机器人屏幕 <ArrowRightOutlined/></Button><Button block size="small" disabled={!canBindRole(draft)||dirty} onClick={()=>setBinding(true)}>绑定设备</Button><Button type="text" block size="small" onClick={()=>c.go('12',draft.id)}>管理关联设备</Button><p>草稿用于模拟；设备新会话使用已发布版本。</p></section>
 </div><Section className="role-details"><div className="role-tab-list" role="tablist" aria-label="人物面板配置区域">{panels.map((panel,i)=><button key={panel.key} id={`role-tab-${panel.key}`} role="tab" aria-selected={tab===panel.key} aria-controls={`role-region-${panel.key}`} tabIndex={tab===panel.key?0:-1} onClick={()=>setTab(panel.key)} onKeyDown={e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%panels.length;else if(e.key==='ArrowLeft')next=(i+panels.length-1)%panels.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=panels.length-1;else return;e.preventDefault();setTab(panels[next].key);(e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role=tab]')[next])?.focus();}}>{panel.label}</button>)}</div><div className="role-tab-content" id={`role-region-${tab}`} role="tabpanel" aria-labelledby={`role-tab-${tab}`}>{panels.find(panel=>panel.key===tab)?.children}</div></Section><div className="role-panel-footer"><span>角色配置、设备绑定与记忆分别管理。</span>{existing&&<Button danger type="text" icon={<DeleteOutlined/>} onClick={()=>c.confirm('删除角色',`将删除「${draft.name}」配置；仍绑定设备时不能删除。`,()=>{if(c.store.bots.some(b=>b.agent===draft.id)){c.notify('请先调整设备关联，再删除角色。');return;}dirtyRef.current=false;c.setStore(s=>{const agents=s.agents.filter(a=>a.id!==draft.id);return {...s,agents,defaultAgentId:s.defaultAgentId===draft.id?agents.find(a=>a.published)?.id||'':s.defaultAgentId};});c.go('03');})}>删除角色</Button>}</div>
 <Drawer className="role-trial-drawer" title={`${draft.name} · 模拟试聊`} open={trial} onClose={()=>setTrial(false)} destroyOnHidden width={c.device==='mobile'?'100%':c.device==='tablet'?'92%':760}><ChatPanel agentOverride={draft} embedded onApplyConfig={tested=>edit({knowledge:tested.knowledge,runtime:tested.runtime,profile:tested.profile,model:tested.model})} onTrialComplete={()=>setError('')}/>{hasCurrentAgentCheck(draft,{store:c.store,skills:c.product.skills,host:c.host,station:c.product.station},c.product.agentChecks[draft.id])&&<Alert className="margin-top" type="success" showIcon title="当前配置已完成模拟试聊" description="已完成本地文字与屏幕交互，可返回发布；未调用真实 ASR / LLM / TTS，模型效果与语音质量仍需服务验收。" action={<Button onClick={()=>setTrial(false)}>返回并发布</Button>}/>}</Drawer><Drawer title={`${draft.name} · 绑定设备`} open={binding} onClose={()=>setBinding(false)} destroyOnHidden width={c.device==='mobile'?'100%':680}><RoleDeviceBinding agent={draft} onBound={()=>setBinding(false)}/></Drawer><Modal title="离开未保存的角色？" open={leaving} onCancel={()=>{setLeaving(false);pendingLeave.current=null;}} footer={<Space wrap><Button onClick={()=>{setLeaving(false);pendingLeave.current=null;}}>继续编辑</Button><Button danger onClick={()=>{dirtyRef.current=false;setLeaving(false);pendingLeave.current?.();pendingLeave.current=null;}}>放弃修改并离开</Button><Button type="primary" onClick={()=>{save();if(!dirtyRef.current){setLeaving(false);pendingLeave.current?.();pendingLeave.current=null;}}}>保存草稿并离开</Button></Space>}><p>人格、性格、能力与扩展还有尚未保存的修改。</p></Modal></div>;
}
