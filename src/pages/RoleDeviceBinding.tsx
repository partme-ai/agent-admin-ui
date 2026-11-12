import {linkageIssues} from '../agent_linkage';
import {RoleConfigSummary} from './RoleConfigSummary';
import {useState} from 'react';
import {Alert,Button,Card,Form,Input,Radio,Select,Space,Tag} from 'antd';
import {CheckCircleOutlined,DesktopOutlined,ArrowRightOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import {Status,Nothing} from '../components';
import {bindPreviewDevice} from '../feature_state';
import {roleConfigFingerprint} from '../role_profile';
import type {Agent} from '../state';
import '../role_binding.css';

/** 从已发布人物配置绑定设备，不复制角色配置或记忆。 */
export function RoleDeviceBinding({agent,onBound}:{agent:Agent;onBound?:(botId:string)=>void}){
 const c=useConsole();const [mode,setMode]=useState('existing'),[selected,setSelected]=useState(''),[error,setError]=useState(''),[boundId,setBoundId]=useState('');const [form]=Form.useForm();
 const saved=c.store.agents.find(a=>a.id===agent.id);
 const published=saved?.publishedConfig?{...saved,...saved.publishedConfig}:saved;
 const resourceIssues=published?linkageIssues(published,{store:c.store,skills:c.product.skills,host:c.host,station:c.product.station}):[];
 const ready=!!saved?.published&&!!published&&roleConfigFingerprint(agent)===roleConfigFingerprint(published)&&!resourceIssues.length;
 const bound=c.store.bots.find(b=>b.id===boundId);
 function fail(){setError('当前角色配置尚未发布。请返回角色面板，发布当前配置后再绑定。');}
 function bindExisting(){
  if(!ready){fail();return;}
  const bot=c.store.bots.find(b=>b.id===selected);if(!bot){setError('请选择要绑定的设备');return;}
  if(bot.agent===agent.id){setError('这台设备已经绑定当前角色，无需重复绑定');return;}
  const previous=c.store.agents.find(a=>a.id===bot.agent);
  c.confirm(previous?'替换设备当前角色':'确认绑定设备',`将「${bot.name}」从「${previous?.name||'未绑定'}」切换为「${agent.name}」已发布版本 v${saved?.publishedRevision||saved?.revision}。原角色、独立记忆及设备状态都会保留。`,()=>{
   c.setStore(s=>({...s,bots:s.bots.map(b=>b.id===bot.id?{...b,agent:agent.id}:b)}));setBoundId(bot.id);setError('');
  });
 }
 function addDevice(values:{name:string;kind:string;code?:string;mac?:string}){
  if(!ready){fail();return;}
  try{const next=bindPreviewDevice(c.store.bots,{...values,agent:agent.id,method:mode==='code'?'code':'manual'});c.setStore(s=>({...s,bots:[...s.bots,next]}));setBoundId(next.id);setError('');form.resetFields();}catch(e){setError((e as Error).message);}
 }
 if(bound)return <div className="role-binding-success"><CheckCircleOutlined/><h3>已关联到「{bound.name}」</h3><p>{agent.name} · 已发布 v{saved?.publishedRevision||saved?.revision}</p><Status text={bound.status}/><p className="muted">角色配置与记忆仍归属原角色；设备状态没有因绑定而变为在线。</p><Space wrap><Button onClick={()=>c.go('13',bound.id)}>查看设备<ArrowRightOutlined/></Button><Button type="primary" onClick={()=>onBound?onBound(bound.id):c.go('04',agent.id)}>完成并返回角色</Button></Space></div>;
 return <div className="role-device-binding"><div className="role-binding-summary"><DesktopOutlined/><div><strong>{agent.name}</strong><p>已发布版本 {saved?.published?`v${saved.publishedRevision||saved.revision}`:'未发布'} · 仅修改当前工作空间的设备关联</p></div><Tag>{c.store.bots.filter(b=>b.agent===agent.id).length} 台已关联</Tag></div>{published&&<RoleConfigSummary agent={published} label={`待绑定 · 已发布 v${saved?.publishedRevision||saved?.revision}`}/>} {!ready&&<Alert showIcon type="warning" title={resourceIssues.length?'发布依赖需要修复':'请先发布当前角色配置'} description={resourceIssues.map(x=>x.message).join('；')||'绑定使用已发布版本；未保存修改或新的草稿不能直接绑定到设备。'}/>}<Radio.Group className="role-binding-mode" aria-label="角色绑定方式" value={mode} onChange={e=>{setMode(e.target.value);setSelected('');setError('');}} optionType="button" options={[{value:'existing',label:'选择已有设备'},{value:'code',label:'设备码绑定'},{value:'manual',label:'手动 MAC'}]}/>{error&&<Alert type="error" showIcon title={error}/>}<fieldset disabled={!ready} className="role-binding-fieldset">{mode==='existing'?<><div className="role-bind-device-list">{c.store.bots.length?c.store.bots.map(bot=><Card key={bot.id} size="small" className={selected===bot.id?'is-selected':''}><Radio aria-label={`将角色绑定到${bot.name}`} checked={selected===bot.id} disabled={!ready||bot.agent===agent.id} onChange={()=>{setSelected(bot.id);setError('');}}><strong>{bot.name}</strong></Radio><Status text={bot.status}/><p>{bot.kind} · {bot.location}</p><small>当前角色：{c.store.agents.find(a=>a.id===bot.agent)?.name||'未绑定'}</small>{bot.agent===agent.id&&<Tag>当前角色已关联</Tag>}</Card>):<Nothing title="还没有设备，可使用设备码或手动添加"/>}</div><div className="role-binding-actions"><Button onClick={()=>{setSelected('');setError('');}}>取消选择</Button><Button type="primary" disabled={!ready||!selected} onClick={bindExisting}>确认关联角色</Button></div></>:<Form form={form} layout="vertical" initialValues={{name:`${agent.name.split(' · ')[0]}的设备`,kind:'TinyBot ESP32'}} onFinish={addDevice}>{mode==='code'?<Form.Item label="6 位设备码" name="code" rules={[{required:true,pattern:/^\d{6}$/,message:'请输入 6 位数字设备码'}]}><Input aria-label="角色绑定设备码" inputMode="numeric" maxLength={6} placeholder="例如 123456"/></Form.Item>:<Form.Item label="MAC 地址" name="mac" rules={[{required:true,message:'请输入 MAC 地址'}]}><Input aria-label="角色绑定 MAC 地址" placeholder="AA:BB:CC:DD:EE:99"/></Form.Item>}<div className="role-binding-form-grid"><Form.Item label="设备名称" name="name" rules={[{required:true,whitespace:true,message:'请输入设备名称'}]}><Input aria-label="角色绑定设备名称" maxLength={40}/></Form.Item><Form.Item label="设备类型" name="kind"><Select aria-label="角色绑定设备类型" options={['TinyBot ESP32','TinyBot Pi'].map(value=>({value,label:value}))}/></Form.Item></div><p className="muted small-text">新增设备先显示“待接入”。不会访问真实设备，也不会把此处确认当作联网成功。</p><div className="role-binding-actions"><Button onClick={()=>{form.resetFields();setError('');setMode('existing');}}>取消添加</Button><Button type="primary" htmlType="submit" disabled={!ready}>确认新增并绑定</Button></div></Form>}</fieldset></div>;
}
