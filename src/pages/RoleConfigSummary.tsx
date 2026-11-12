import {Collapse,Tag} from 'antd';
import {useConsole} from '../context';
import type {Agent} from '../state';
import {cloneAgentRuntime} from '../feature_state';
import {cloneRoleProfile,effectiveRoleInstructions,roleAbilitySlots} from '../role_profile';
import {roleAbilitySummary} from '../role_loadout';
import '../role_config_summary.css';

/** 试聊和设备绑定核对同一角色快照；仅展示配置，不声明服务已经运行。 */
export function RoleConfigSummary({agent,label='本次角色配置'}:{agent:Agent;label?:string}){
 const c=useConsole(),r=cloneAgentRuntime(agent.runtime),p=cloneRoleProfile(agent.profile);
 return <Collapse size="small" className="role-config-summary" items={[{key:'config',label:<span>{label}<Tag>{r.language}</Tag></span>,children:<>
  <div className="role-config-slots" aria-label="当前角色十项能力">{roleAbilitySlots.map(slot=>{const summary=roleAbilitySummary(agent,slot.key,c.store.connections,c.store.voiceAssets);return <div key={slot.key}><small>{slot.key} · {slot.name}</small><strong>{summary.value}</strong><span>{summary.state}</span></div>;})}</div>
  <p className="role-config-params">语速 {r.rate}× · 音调 {r.pitch} · 音量 {r.volume}× · {p.appearance?.pack==='grok'?`${p.appearance.name} · 可定制角色`:p.expression} / {p.screenTheme}</p>
  <h4>角色提示词 · Prompt</h4><pre>{effectiveRoleInstructions(agent.instructions,p)}</pre>
 </>} ]}/>;
}
