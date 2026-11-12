import {useState} from 'react';
import {Alert,Button,Card,Checkbox,Empty,Form,Input,Modal,Select,Space,Switch,Tag} from 'antd';
import {AppstoreAddOutlined,ApiOutlined,BookOutlined,DeleteOutlined,EditOutlined,PlusOutlined,SafetyOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import type {RoleProfile} from '../role_profile';
import '../role_extensions.css';

type Section='plugins'|'connections'|'skills'|'automation'|'risk';
type Props={value:RoleProfile;onChange:(value:RoleProfile)=>void;section:Section};
type Command=RoleProfile['commands'][number];
type Hook=RoleProfile['hooks'][number];
export const roleSkills=[
 {id:'knowledge',name:'知识问答',desc:'检索受权文档，回答时保留来源。',needs:'至少一个已索引知识库',icon:<BookOutlined/>},
 {id:'inspection',name:'设备巡检',desc:'检查设备状态，整理需要处理的问题。',needs:'绑定设备；操作仍需审批',icon:<SafetyOutlined/>},
 {id:'story',name:'故事陪伴',desc:'按听众和时长组织适合朗读的故事。',needs:'主语言模型；语音输出需要 TTS',icon:<BookOutlined/>},
 {id:'learning',name:'学习讲解',desc:'通过例子和追问，逐步讲清一个问题。',needs:'主语言模型',icon:<AppstoreAddOutlined/>},
 {id:'reminder',name:'提醒与安排',desc:'把用户意图整理为可确认的提醒计划。',needs:'任务服务；创建前确认',icon:<SafetyOutlined/>}
];
const eventOptions=['会话开始','会话结束','收到设备事件','任务完成','任务失败'];
const toolName=(id:string)=>({search:'search_documents · 只读知识检索',create:'create_task · 创建待审批任务'}[id]||id);
const toggleId=(items:string[],id:string,checked:boolean)=>checked?[...new Set([...items,id])]:items.filter(x=>x!==id);

/** 角色级扩展只修改当前角色草稿，不修改工作空间安装状态或实际宿主权限。 */
export function RoleExtensions({value,onChange,section}:Props){
 const c=useConsole(),[command,setCommand]=useState<Command|null>(null),[hook,setHook]=useState<Hook|null>(null),[error,setError]=useState('');
 const update=(patch:Partial<RoleProfile>)=>onChange({...value,...patch});
 const mcp=c.store.extensions.filter(e=>e.id==='e3'||e.kind?.includes('MCP'));
 const readySkills=c.product.skills.filter(s=>s.installed).map(s=>({...s,desc:s.description,needs:roleSkills.find(x=>x.id===s.id)?.needs||'按技能定义核对模型、工具与权限',icon:roleSkills.find(x=>x.id===s.id)?.icon||<BookOutlined/>})).map(s=>({...s,ready:s.id==='knowledge'?c.store.docs.some(d=>d.status==='已索引'):s.id==='inspection'?c.store.bots.length>0:s.id==='reminder'?false:c.store.connections.some(m=>m.role==='LLM'&&m.enabled!==false&&m.status==='演示可用')}));
 function saveCommand(){
  if(!command)return;
  if(!/^\/[A-Za-z0-9_\u4e00-\u9fff-]{1,24}$/.test(command.name.trim())){setError('命令以 / 开头，后接 1～24 个汉字、字母、数字、短横线或下划线');return;}
  if(!command.instruction.trim()){setError('请填写命令要完成的事情');return;}
  if(value.commands.some(x=>x.id!==command.id&&x.name===command.name.trim())){setError('这个角色已有同名命令');return;}
  update({commands:[...value.commands.filter(x=>x.id!==command.id),{...command,name:command.name.trim(),instruction:command.instruction.trim()}],hooks:command.enabled?value.hooks:value.hooks.map(h=>h.action===`command:${command.id}`?{...h,enabled:false}:h)});setCommand(null);setError('');
 }
 function saveHook(){
  if(!hook)return;
  if(!hook.event||!hook.action){setError('请选择触发事件和目标动作');return;}
  if(value.hooks.some(x=>x.id!==hook.id&&x.event===hook.event&&x.action===hook.action)){setError('已有相同的事件与动作组合');return;}
  update({hooks:[...value.hooks.filter(x=>x.id!==hook.id),hook]});setHook(null);setError('');
 }
 const hookActions=[...readySkills.filter(s=>value.skills.includes(s.id)).map(s=>({value:`skill:${s.id}`,label:`技能 · ${s.name}`})),...value.commands.filter(x=>x.enabled).map(x=>({value:`command:${x.id}`,label:`命令 · ${x.name}`}))];
 return <div className="role-extensions" data-role-section={section}>
  {section==='plugins'&&<>
   <div className="role-extension-heading"><div><h3>为角色装配插件</h3><p>从工作空间已安装的扩展中选择，角色只获得已授权的能力。</p></div><Button onClick={()=>c.go('41')}>管理插件</Button></div>
   <div className="role-extension-grid">{c.store.extensions.filter(e=>!e.kind&&!['e3'].includes(e.id)).map(e=>{
    const supported=e.layer!=='native'||c.host!=='web',ready=e.enabled&&supported,selected=value.extensions.includes(e.id);
    return <Card size="small" key={e.id} className={selected?'role-extension-card is-equipped':'role-extension-card'}>
     <div className="role-extension-card-top"><span className="role-extension-symbol"><AppstoreAddOutlined/></span><Tag>{e.layer==='native'?'原生插件':'业务插件'}</Tag><Switch aria-label={`角色启用${e.name}`} size="small" checked={selected} disabled={!ready&&!selected} onChange={checked=>update({extensions:toggleId(value.extensions,e.id,checked)})}/></div>
     <h4>{e.name}</h4><p>{e.desc}</p><div className="role-extension-detail">{e.layer==='native'?e.id==='e5'?'Desktop：串口 / BLE / 局域网；Tablet：按宿主适配':'Desktop / Android / iPad：随应用编译':'动态业务扩展 · 复用 Rust 核心'}</div>
     <div className="role-extension-footer"><span>{!supported?'当前 Web 不提供':!e.enabled?'工作空间未启用':selected?'已装配到角色':'可装配'}</span><Button type="link" size="small" onClick={()=>c.go('21',e.id)}>详情</Button></div>
    </Card>;
   })}</div><p className="role-extension-note">原生插件随应用编译；动态业务插件只能调用已有受控接口。独立 Server 不依赖 Tauri，角色开关不会安装二进制或扩大系统权限。</p>
  </>}
  {section==='connections'&&<>
   <div className="role-extension-heading"><div><h3>MCP 连接与工具</h3><p>连接由工作空间维护，角色按工具单独授权。</p></div><Button onClick={()=>c.go('42')}>管理连接</Button></div>
   {mcp.map(e=>{const chosen=value.connectionTools[e.id]||[],tools=e.tools||[],ready=e.enabled&&tools.length>0,supported=!(e.transport==='stdio'&&e.executionTarget==='local'&&c.host!=='desktop');return <Card className="role-mcp-card" size="small" key={e.id}>
    <div className="role-extension-heading"><div className="role-mcp-identity"><span className="role-extension-symbol"><ApiOutlined/></span><div><h4>{e.name}</h4><p>{e.transport==='stdio'?'stdio':e.transport==='sse'?'SSE':'HTTP'} · {e.executionTarget==='local'?'当前控制站':'独立 Server'}</p></div></div><Tag>{!supported?'当前平台不支持':ready?'已配置':'待配置'}</Tag></div>
    {tools.length?<Checkbox.Group value={chosen} className="role-mcp-tools" onChange={ids=>update({connectionTools:{...value.connectionTools,[e.id]:ids.map(String)}})} options={tools.map(id=>({value:id,label:toolName(id),disabled:(!ready||!supported)&&!chosen.includes(id)}))}/>:<p className="role-extension-empty">尚未发现可授权工具。先完成连接配置与工作空间授权。</p>}
    <div className="role-extension-footer"><span>此角色授权 {chosen.length} 项工具 · 写入操作仍受风控约束</span><Button size="small" onClick={()=>c.go('21',e.id)}>配置连接</Button></div>
   </Card>;})}
   {!mcp.length&&<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="尚未配置 MCP 连接"><Button onClick={()=>c.go('42')}>添加连接</Button></Empty>}
   <Alert type="info" showIcon title="发现工具不等于授权" description="这里只保存角色级工具选择，不访问服务或执行命令；本机 stdio 仅限 Desktop，独立 Server 目标另行配置。"/>
  </>}
  {section==='skills'&&<>
   <div className="role-extension-heading"><div><h3>技能装配</h3><p>让角色知道怎样完成具体任务；能力和权限仍需分别满足。</p></div><Space><Tag>{value.skills.length} 项已启用</Tag><Button onClick={()=>c.go('43')}>管理技能</Button></Space></div>
   <div className="role-extension-grid">{readySkills.map(s=><Card size="small" key={s.id} className={value.skills.includes(s.id)?'role-extension-card is-equipped':'role-extension-card'}><div className="role-extension-card-top"><span className="role-extension-symbol">{s.icon}</span><Switch size="small" aria-label={`启用技能${s.name}`} checked={value.skills.includes(s.id)} onChange={checked=>update({skills:toggleId(value.skills,s.id,checked),hooks:checked?value.hooks:value.hooks.map(h=>h.action===`skill:${s.id}`?{...h,enabled:false}:h)})}/></div><h4>{s.name}</h4><p>{s.desc}</p><div className="role-extension-detail">{s.needs}</div><div className="role-extension-footer"><Tag color={s.ready?'default':'orange'}>{s.ready?'工作空间有基础资源':'依赖待满足'}</Tag><span>{value.skills.includes(s.id)?'已选择':'未选择'}</span></div></Card>)}</div>
   {!!readySkills.filter(s=>value.skills.includes(s.id)&&!s.ready).length&&<Alert className="margin-top" type="warning" showIcon title={`${readySkills.filter(s=>value.skills.includes(s.id)&&!s.ready).length} 项已选技能尚缺基础资源`} description="可先保留角色草稿，完成知识、模型、设备或任务服务配置后再验证。"/>}
   <p className="role-extension-note">基础资源只表示工作空间中存在相关配置，角色绑定及服务可用性仍需单独核对。选择技能只改变当前草稿；不会启动真实巡检、提醒或语音生成。</p>
  </>}
  {section==='automation'&&<>
   <div className="role-extension-heading"><div><h3>快捷命令</h3><p>由用户明确触发的角色入口。</p></div><Button icon={<PlusOutlined/>} onClick={()=>{setError('');setCommand({id:crypto.randomUUID(),name:'/',instruction:'',enabled:true});}}>添加命令</Button></div>
   {!value.commands.length&&<div className="role-extension-empty">还没有快捷命令，例如 /巡检、/讲故事。</div>}
   {value.commands.map(x=><div className="role-automation-row" key={x.id}><div className="role-automation-content"><strong>{x.name}</strong><p>{x.instruction}</p></div><Space><Switch size="small" aria-label={`启用命令${x.name}`} checked={x.enabled} onChange={enabled=>update({commands:value.commands.map(y=>y.id===x.id?{...y,enabled}:y),hooks:enabled?value.hooks:value.hooks.map(h=>h.action===`command:${x.id}`?{...h,enabled:false}:h)})}/><Button aria-label={`编辑命令${x.name}`} icon={<EditOutlined/>} onClick={()=>{setError('');setCommand({...x});}}/><Button danger aria-label={`删除命令${x.name}`} icon={<DeleteOutlined/>} onClick={()=>c.confirm('删除角色命令',`移除「${x.name}」，关联钩子也会移除。`,()=>update({commands:value.commands.filter(y=>y.id!==x.id),hooks:value.hooks.filter(h=>h.action!==`command:${x.id}`)}))}/></Space></div>)}
   <div className="role-extension-heading role-hook-heading"><div><h3>事件钩子</h3><p>把事件关联到已启用的技能或命令。</p></div><Button icon={<PlusOutlined/>} disabled={!hookActions.length} onClick={()=>{setError('');setHook({id:crypto.randomUUID(),event:'会话开始',action:'',enabled:false});}}>添加钩子</Button></div>
   {!value.hooks.length&&<div className="role-extension-empty">{hookActions.length?'尚未添加钩子。新钩子默认停用。':'先启用一项技能或添加命令，再设置事件动作。'}</div>}
   {value.hooks.map(x=><div className="role-automation-row" key={x.id}><div className="role-automation-content"><strong>{x.event}</strong><p>{hookActions.find(a=>a.value===x.action)?.label||'目标已停用，请重新选择'}</p></div><Space><Switch size="small" aria-label={`启用钩子${x.event}`} checked={x.enabled} disabled={!hookActions.some(a=>a.value===x.action)&&!x.enabled} onChange={enabled=>update({hooks:value.hooks.map(y=>y.id===x.id?{...y,enabled}:y)})}/><Button aria-label={`编辑钩子${x.event}`} icon={<EditOutlined/>} onClick={()=>{setError('');setHook({...x});}}/><Button danger aria-label={`删除钩子${x.event}`} icon={<DeleteOutlined/>} onClick={()=>c.confirm('删除事件钩子',`移除「${x.event}」的动作关联。`,()=>update({hooks:value.hooks.filter(y=>y.id!==x.id)}))}/></Space></div>)}
   <p className="role-extension-note">这里只编辑触发定义，不监听真实事件，不执行脚本或设备动作。自动化同样受宿主权限与审批约束。</p>
   <Modal title={value.commands.some(x=>x.id===command?.id)?'编辑快捷命令':'添加快捷命令'} open={!!command} onCancel={()=>{setCommand(null);setError('');}} onOk={saveCommand} okText="应用到角色" cancelText="取消">{command&&<Form layout="vertical"><Form.Item label="命令名称" required><Input aria-label="角色命令名称" value={command.name} maxLength={25} onChange={e=>setCommand({...command,name:e.target.value})} placeholder="/讲故事"/></Form.Item><Form.Item label="要完成的事情" required><Input.TextArea aria-label="角色命令说明" value={command.instruction} rows={3} maxLength={1000} onChange={e=>setCommand({...command,instruction:e.target.value})} placeholder="讲一个适合睡前听的短故事，先询问听众年龄。"/></Form.Item><Checkbox checked={command.enabled} onChange={e=>setCommand({...command,enabled:e.target.checked})}>在角色快捷入口显示</Checkbox>{error&&<Alert className="margin-top" title={error} type="error" showIcon/>}</Form>}</Modal>
   <Modal title="配置事件钩子" open={!!hook} onCancel={()=>{setHook(null);setError('');}} onOk={saveHook} okText="应用到角色" cancelText="取消">{hook&&<Form layout="vertical"><Form.Item label="触发事件" required><Select aria-label="钩子事件" value={hook.event} options={eventOptions.map(value=>({value,label:value}))} onChange={event=>setHook({...hook,event})}/></Form.Item><Form.Item label="目标动作" required><Select aria-label="钩子动作" value={hook.action||undefined} placeholder="选择已启用技能或命令" options={hookActions} onChange={action=>setHook({...hook,action})}/></Form.Item><Checkbox checked={hook.enabled} onChange={e=>setHook({...hook,enabled:e.target.checked})}>启用此事件定义</Checkbox>{error&&<Alert className="margin-top" title={error} type="error" showIcon/>}</Form>}</Modal>
  </>}
  {section==='risk'&&<>
   <div className="role-extension-heading"><div><h3>角色风控</h3><p>为这个角色增加限制，不改变工作空间或宿主的权限上限。</p></div><SafetyOutlined/></div>
   <Form layout="vertical"><Form.Item label="角色敏感词" extra="输入后按回车添加；只维护本地规则，不上传文字。"><Select aria-label="角色敏感词" mode="tags" value={value.risk.sensitiveWords} tokenSeparators={[',','，']} maxTagCount="responsive" onChange={words=>update({risk:{...value.risk,sensitiveWords:[...new Set(words.map(x=>x.trim()).filter(Boolean))].slice(0,100)}})} placeholder="添加需要拦截的词"/></Form.Item></Form>
   <div className="role-risk-row"><div><strong>执行前请求审批</strong><p>工具写入、任务创建和设备操作先展示目标及影响。</p></div><Switch aria-label="角色执行前审批" checked={value.risk.requireApproval} disabled={value.risk.allowDeviceWrite} onChange={requireApproval=>update({risk:{...value.risk,requireApproval}})}/></div>
   <div className="role-risk-row"><div><strong>允许提出设备写入请求</strong><p>仅允许形成待审批请求；执行仍需设备资格及服务授权。</p></div><Switch aria-label="角色设备写入请求" checked={value.risk.allowDeviceWrite} onChange={allowDeviceWrite=>update({risk:{...value.risk,allowDeviceWrite,requireApproval:allowDeviceWrite?true:value.risk.requireApproval}})}/></div>
   <Alert className="margin-top" showIcon type="info" title="角色配置不能授予控制权" description="声纹、性格、插件开关和角色身份都不能替代真实鉴权、设备控制资格与人工审批。"/>
  </>}
 </div>;
}
