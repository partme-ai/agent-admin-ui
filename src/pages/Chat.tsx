import {useEffect,useRef,useState} from 'react';
import {Alert,Avatar,Button,Input,Select,Space,Tag} from 'antd';
import {ArrowUpOutlined,ClearOutlined,StopOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import {PageHeader,Nothing,TileIcon} from '../components';
import {patchAgentDraft} from '../product_state';
import {cloneRoleProfile} from '../role_profile';
import {cloneAgentRuntime} from '../feature_state';
import {completedTrialCheck,hasCurrentAgentCheck,linkageIssues,resourceFingerprint,settleAgentTurn,simulateAgentTurn,type AgentTurn} from '../agent_linkage';
import {roleConfigFingerprint} from '../role_profile';
import type {Agent} from '../state';
import {AgentTurnReview} from './AgentLinkageReview';
import {createArtifact} from '../station';
import './agent_debug.css';

type Message={role:'user'|'assistant';text:string};
/** 通用智能体对话调试。配置与依赖变化、停止、离开均撤销待处理回应。 */
export function ChatPanel({agentOverride,embedded=false,onApplyConfig,onTrialComplete}:{agentOverride?:Agent;embedded?:boolean;onApplyConfig?:(agent:Agent)=>void;onTrialComplete?:()=>void}){
 const c=useConsole(),prior=c.store.conversations.find(x=>x.id===c.selected),[agentId,setAgentId]=useState(agentOverride?.id||c.store.agents.find(a=>a.id===c.selected)?.id||prior?.agent||c.store.defaultAgentId||c.store.agents[0]?.id||'');
 const current=agentOverride||c.store.agents.find(a=>a.id===agentId),[knowledge,setKnowledge]=useState<string[]|null>(null),[input,setInput]=useState(''),[messages,setMessages]=useState<Message[]>(prior?.messages||[]),[run,setRun]=useState<AgentTurn>(),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const agent=current?{...current,profile:cloneRoleProfile(current.profile),runtime:cloneAgentRuntime(current.runtime),knowledge:knowledge||current.knowledge}:undefined;
 const env={store:c.store,skills:c.product.skills,host:c.host,station:c.product.station},latest=useRef({agent,env});latest.current={agent,env};
 const epoch=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|null>(null),thread=useRef(prior?.id||crypto.randomUUID()),log=useRef<HTMLDivElement>(null);
 function stop(){epoch.current++;if(timer.current)clearTimeout(timer.current);timer.current=null;setBusy(false);setRun(r=>r?.status==='running'?{...r,status:'interrupted'}:r);}
 useEffect(()=>()=>{epoch.current++;if(timer.current)clearTimeout(timer.current);},[]);
 const fingerprint=agent?roleConfigFingerprint(agent)+resourceFingerprint(agent,env):'';
 useEffect(()=>{stop();},[fingerprint]);
 useEffect(()=>{log.current?.scrollTo({top:log.current.scrollHeight,behavior:'smooth'});},[messages,busy]);
 const issues=agent?linkageIssues(agent,env):[],checked=agent&&hasCurrentAgentCheck(agent,env,c.product.agentChecks[agent.id]);
 function submit(){
  if(!agent||busy||!input.trim())return;const text=input.trim(),turn=simulateAgentTurn(agent,text,env,messages),mine=++epoch.current;
  setInput('');setError('');setRun(turn);setMessages(m=>[...m,{role:'user',text}]);
  if(turn.blocked){setError(turn.text);return;}
  setBusy(true);timer.current=setTimeout(()=>{
   if(mine!==epoch.current)return;timer.current=null;
   const active=latest.current;if(!active.agent||roleConfigFingerprint(active.agent)!==turn.config||resourceFingerprint(active.agent,active.env)!==turn.resources){setBusy(false);setRun({...turn,status:'interrupted'});setError('配置或关联资源已变化，本轮已取消，请重新调试。');return;}
   const settled=settleAgentTurn(turn,true),done=settled.run,check=completedTrialCheck(active.agent,done,active.env),next=[...messages,{role:'user' as const,text},{role:'assistant' as const,text:done.text}];
   setRun(done);setMessages(next);setBusy(false);
   c.setStore(s=>({...s,conversations:[...s.conversations.filter(x=>x.id!==thread.current),{id:thread.current,agent:agent.id,date:new Date().toISOString().slice(0,10),title:text.slice(0,32),messages:next,summary:done.text.slice(0,160),runs:[...(s.conversations.find(x=>x.id===thread.current)?.runs||[]),done],config:agent}],...(settled.memoryWrite?{roleMemories:{...s.roleMemories,[agent.id]:[...(s.roleMemories[agent.id]||[]),{id:crypto.randomUUID(),subject:settled.memoryWrite.subject,content:settled.memoryWrite.content,source:'本地调试',updated:new Date().toISOString().slice(0,10),status:'active' as const}]}}:{})}));
   c.setProduct(p=>({...p,agentChecks:check?{...p.agentChecks,[agent.id]:check}:p.agentChecks}));onTrialComplete?.();
  },450);
 }
 if(!agent)return <Nothing title="尚无可调试的智能体" action={<Button onClick={()=>c.go('05')}>前往智能体市场</Button>}/>;
 return <div className={`agent-debug ${embedded?'is-embedded':''}`}>
  {!embedded&&<PageHeader title="智能体调试" desc="检查提示词、知识、工具和记忆的关联。" actions={<Button onClick={()=>c.go('24',agent.id)}>对话记录</Button>}/>}
  <div className="agent-debug-config">
   {!embedded&&<label>智能体<Select aria-label="调试智能体" value={agent.id} onChange={id=>{stop();setAgentId(id);setKnowledge(null);setMessages([]);setRun(undefined);setError('');thread.current=crypto.randomUUID();}} options={c.store.agents.map(a=>({value:a.id,label:`${a.name} · ${a.published?'已发布':'草稿'}`}))}/></label>}
   <label className="grow">知识库<Select aria-label="调试知识库" mode="multiple" maxTagCount="responsive" allowClear value={agent.knowledge} onChange={setKnowledge} options={c.store.knowledge.map(k=>({value:k.id,label:k.name}))} placeholder="不使用知识库"/></label>
   {knowledge&&<Button onClick={()=>{onApplyConfig?.(agent);if(!onApplyConfig)c.setStore(s=>({...s,agents:s.agents.map(a=>a.id===agent.id?patchAgentDraft(a,{knowledge:agent.knowledge}):a)}));setKnowledge(null);}}>保存知识关联</Button>}
   <Tag>{checked?'当前配置已调试':'等待调试'}</Tag>
  </div>
  <div className="agent-debug-summary"><span>{c.store.connections.find(m=>m.id===agent.model)?.model||'未配置模型'}</span><span>{agent.knowledge.length} 个知识库</span><span>{agent.profile.skills.length} 项技能</span><span>{agent.runtime.sandboxId?'已选择沙箱':'未选择沙箱'}</span><Button type="text" size="small" onClick={()=>c.go('04',agent.id)}>智能体配置</Button></div>
  <Alert type="info" showIcon title="本地模拟调试，不调用真实模型或外部工具，也不产生费用。"/>
  {!!issues.length&&<Alert type="warning" showIcon title="请先完善关联资源" description={issues.map(x=>x.message).join('；')}/>}
  {error&&<Alert type="warning" title={error} closable onClose={()=>setError('')}/>}
  <section className="agent-debug-conversation">
   <div ref={log} className="agent-debug-messages" aria-live="polite" role="log" aria-label="调试对话">
    {!messages.length?<div className="agent-debug-empty"><TileIcon name={agent.icon} large/><h3>{agent.name}</h3><p>{agent.profile.greeting}</p><Button onClick={()=>setInput('检查关联资源，并说明本轮采用的知识、技能和记忆。')}>检查关联资源</Button></div>:messages.map((m,i)=><article className={`agent-debug-message is-${m.role}`} key={i}><Avatar size={28}>{m.role==='user'?'我':agent.name.slice(0,1)}</Avatar><div><strong>{m.role==='user'?'你':agent.name}</strong><p>{m.text}</p></div></article>)}
    {busy&&<p className="muted" role="status">正在生成本地模拟回复…</p>}
   </div>
   <div className="agent-debug-composer"><Input.TextArea aria-label="调试输入" placeholder="输入消息，Enter 发送，Shift + Enter 换行" value={input} onChange={e=>setInput(e.target.value)} autoSize={{minRows:2,maxRows:5}} onPressEnter={e=>{if(!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();submit();}}}/><div><Button type="text" icon={<ClearOutlined/>} onClick={()=>{stop();setMessages([]);setRun(undefined);setError('');thread.current=crypto.randomUUID();}}>新对话</Button><Space>{busy?<Button icon={<StopOutlined/>} onClick={stop}>停止</Button>:<Button type="primary" icon={<ArrowUpOutlined/>} disabled={!input.trim()||!!issues.length} onClick={submit}>运行本地调试</Button>}</Space></div></div>
  </section>
  <AgentTurnReview run={run}/>
  {run?.status==='completed'&&<div className="form-actions"><Button onClick={()=>{const artifact=createArtifact(agent.id,thread.current,'调试记录.md',messages.map(m=>`${m.role==='user'?'用户':'智能体'}：${m.text}`).join('\n\n'));c.setProduct(p=>({...p,station:{...p.station,artifacts:[artifact,...p.station.artifacts]}}));c.notify('调试记录已保存到会话产物');}}>保存调试记录</Button><Button onClick={()=>c.go('04',agent.id)}>返回配置与发布</Button></div>}
 </div>;
}
export function Chat(){return <ChatPanel/>;}
