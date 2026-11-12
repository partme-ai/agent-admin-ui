import {hasCurrentAgentCheck} from '../agent_linkage';
import {roleConfigFingerprint} from '../role_profile';
import {Button} from 'antd';
import {CheckOutlined,ArrowRightOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import type {Agent} from '../state';
import '../role_creation.css';
/** 进度由现有配置与调试凭证推导，发布为本管理界面的终点。 */
export function RoleCreationFlow({agent,dirty,onCustomize,onPrompt,onTrial,onPublish}:{agent:Agent;dirty:boolean;onCustomize:()=>void;onPrompt:()=>void;onTrial:()=>void;onPublish:()=>void}){
 const c=useConsole(),tested=hasCurrentAgentCheck(agent,{store:c.store,skills:c.product.skills,host:c.host,station:c.product.station},c.product.agentChecks[agent.id]),published=agent.published&&!dirty&&!!agent.publishedConfig&&roleConfigFingerprint(agent)===roleConfigFingerprint({...agent,...agent.publishedConfig});
 const stage=!agent.instructions.trim()?0:!tested?1:2;
 return <section className="role-creation-flow" aria-label="智能体创建进度"><div className="role-flow-steps">{[
  {name:'配置智能体',detail:'人格 · Prompt · 关联资源',done:!!agent.instructions.trim(),action:onCustomize},
  {name:'对话调试',detail:tested?'当前配置已调试':'使用当前草稿检查关联',done:tested,action:onTrial},
  {name:'发布智能体',detail:published?`已发布 v${agent.publishedRevision||agent.revision}`:'发布后供新会话使用',done:published,action:onPublish}
 ].map((s,i)=><button key={s.name} className={`${s.done?'done':''} ${stage===i?'current':''}`} onClick={s.action}><span>{s.done?<CheckOutlined/>:i+1}</span><div><strong>{s.name}</strong><small>{s.detail}</small></div></button>)}</div><div className="role-flow-next"><span>{dirty?'有修改尚未保存。':published?'当前版本已发布。':tested?'当前配置已完成本地调试。':'从模板开始配置你的智能体。'}</span><div><Button size="small" type="text" onClick={onPrompt}>编辑 Prompt</Button><Button size="small" type="primary" onClick={stage===0?onPrompt:stage===1?onTrial:onPublish}>{stage===0?'补齐 Prompt':stage===1?'开始调试':'发布智能体'} <ArrowRightOutlined/></Button></div></div></section>;
}
