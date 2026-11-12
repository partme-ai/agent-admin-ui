import {hasCurrentAgentCheck} from '../agent_linkage';
import {Button,Tag} from 'antd';
import {CheckOutlined,ArrowRightOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import type {Agent} from '../state';
import {canBindRole} from '../role_profile';
import '../role_creation.css';

/** 创建引导只投影已有角色、试聊和绑定事实，不另建一套任务状态。 */
export function RoleCreationFlow({agent,dirty,onCustomize,onPrompt,onTrial,onPublish,onBind}:{agent:Agent;dirty:boolean;onCustomize:()=>void;onPrompt:()=>void;onTrial:()=>void;onPublish:()=>void;onBind:()=>void}){
 const c=useConsole(),tested=hasCurrentAgentCheck(agent,{store:c.store,skills:c.product.skills,host:c.host,station:c.product.station},c.product.agentChecks[agent.id]),published=canBindRole(agent)&&!dirty,bots=c.store.bots.filter(b=>b.agent===agent.id);
 const stage=!agent.instructions.trim()?0:!tested&&!published?1:!published?2:bots.length?4:3;
 return <section className="role-creation-flow" aria-label="角色创建进度"><div className="role-flow-steps">{[
  {name:'人物定制',detail:agent.instructions.trim()?'人格 · Prompt · 声音':'请补齐角色 Prompt',done:!!agent.instructions.trim(),action:onCustomize},
  {name:'模拟试聊',detail:tested?'当前配置已试聊':'使用当前草稿测试',done:tested,action:onTrial},
  {name:'发布角色',detail:published?`已发布 v${agent.publishedRevision||agent.revision}`:'发布后供新会话使用',done:published,action:onPublish},
  {name:'绑定设备',detail:bots.length?`${bots.length} 台设备已关联`:'选择承载这个角色的设备',done:published&&bots.length>0,action:onBind}
 ].map((s,i)=><button key={s.name} className={`${s.done?'done':''} ${stage===i?'current':''}`} disabled={i===3&&!published} onClick={s.action}><span>{s.done?<CheckOutlined/>:i+1}</span><div><strong>{s.name}</strong><small>{s.detail}</small></div></button>)}</div><div className="role-flow-next"><span>{dirty?'有修改尚未保存。':published&&bots.length?'角色已发布，可继续管理设备。':tested?'当前配置已完成模拟试聊。':'从市场预设开始，把它定制成你的角色。'}</span><div><Button size="small" type="text" onClick={onPrompt}>编辑 Prompt</Button><Button size="small" type="primary" onClick={stage===0?onPrompt:stage===1?onTrial:stage===2?onPublish:onBind}>{stage===0?'补齐 Prompt':stage===1?'开始试聊':stage===2?'发布角色':bots.length?'管理设备':'绑定设备'} <ArrowRightOutlined/></Button></div></div></section>;
}
