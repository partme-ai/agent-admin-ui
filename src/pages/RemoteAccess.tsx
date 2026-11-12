import {OnboardingChecklist} from '../GuidanceUI';
import {useState} from 'react';
import {Alert,Button,Card,Form,Input,Select,Space,Steps,Switch,Tag} from 'antd';
import {LinkOutlined,DisconnectOutlined,ReloadOutlined,ArrowRightOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import {PageHeader,Section,Nothing,KeyValue} from '../components';
import '../settings_extensions.css';

type RiskState={words:string[];approval:boolean;retention:string};
function readSession<T>(key:string,fallback:T):T{try{const raw=sessionStorage.getItem(`tinybot-console:demo:${key}`);return raw?JSON.parse(raw) as T:fallback;}catch{return fallback;}}
function writeSession(key:string,value:unknown){try{sessionStorage.setItem(`tinybot-console:demo:${key}`,JSON.stringify(value));}catch{/* 浏览器拒绝存储时仍保留当前页面状态。 */}}
export {TerminalInterconnect as RemoteAccess} from './TerminalInterconnect';
/** 工作空间风控偏好演练，不替代服务端鉴权。 */
export function WorkspaceRisk(){const c=useConsole();const [saved,setSaved]=useState<RiskState>(()=>readSession('risk',{words:[],approval:true,retention:'30'})),[draft,setDraft]=useState(saved),[word,setWord]=useState(''),[error,setError]=useState('');
 return <><PageHeader title="安全与风控" desc="工作空间规则作为角色授权的上限，角色只能增加限制。" back="30"/><div className="settings-extension-grid"><Section title="敏感词库" extra={<Tag>{draft.words.length} 条</Tag>}><p className="muted">维护需要拦截或人工复核的词语。当前只保存配置，不对真实对话执行过滤。</p><Space.Compact block><Input aria-label="工作空间敏感词" value={word} maxLength={40} placeholder="输入词语后添加" onChange={e=>setWord(e.target.value)}/><Button onClick={()=>{const text=word.trim();if(!text){setError('请输入敏感词');return;}if(draft.words.includes(text)){setError('该敏感词已存在');return;}setDraft({...draft,words:[...draft.words,text]});setWord('');setError('');}}>添加</Button></Space.Compact>{error&&<Alert className="margin-top" title={error} type="error"/>}<div className="risk-word-list">{draft.words.length?draft.words.map(text=><Tag key={text} closable onClose={()=>setDraft({...draft,words:draft.words.filter(x=>x!==text)})}>{text}</Tag>):<span className="muted">未配置敏感词</span>}</div></Section><Section title="审批与数据保留"><div className="setting-row"><div><strong>工具写操作需要审批</strong><p className="muted small-text">写入文件和调用外部服务前核对授权。</p></div><Switch aria-label="工作空间设备操作审批" checked={draft.approval} onChange={approval=>setDraft({...draft,approval})}/></div><Form layout="vertical"><Form.Item label="审计记录保留"><Select aria-label="审计记录保留" value={draft.retention} onChange={retention=>setDraft({...draft,retention})} options={[{value:'7',label:'7 天'},{value:'30',label:'30 天'},{value:'90',label:'90 天'}]}/></Form.Item></Form><Alert type="info" title="配置预览不会扩大任何真实权限" description="敏感词、工具授权、工具执行许可和服务端鉴权分别生效。"/></Section></div><Space className="margin-top"><Button onClick={()=>{setDraft(saved);setError('');}}>撤回修改</Button><Button type="primary" onClick={()=>{setSaved(structuredClone(draft));writeSession('risk',draft);c.notify('工作空间风控偏好已保存在本次浏览器会话');}}>保存风控偏好</Button></Space></>;
}
export function SetupGuide(){return <><PageHeader title="开始使用 Agent Admin UI" desc="按配置状态继续，先完成一段有效的智能体调试"/><OnboardingChecklist full/></>;}
