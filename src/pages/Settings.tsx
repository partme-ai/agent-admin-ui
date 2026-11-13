import {GeneralSettings} from './GeneralSettings';
import {RemoteAccess,WorkspaceRisk,SetupGuide} from './RemoteAccess';
import {MemberManagement} from './MemberManagement';
import {StorageSettings} from './StorageSettings';
import {SystemSettings} from './SystemSettings';
import {ThemeCenter} from './ThemeCenter';
import {NotificationSettings,AboutSettings} from './NativeSettingsPages';
import {SettingsNav} from './SettingsNav';
import {PermissionMatrix,ServiceInstances} from './CapabilityPanels';
import {useState} from 'react';
import {Button,Space,Form,Input,Select,Switch,Segmented,Modal,Alert,Progress,Tag} from 'antd';
import {PlusOutlined,ReloadOutlined,DeleteOutlined,CheckCircleFilled} from '@ant-design/icons';
import {useConsole} from '../context';
import {PageHeader,Section,KeyValue,TileIcon,Status} from '../components';
import {capabilities,initialStore} from '../state';

export function Preferences(){const c=useConsole();if(['theme','appearance','basic-appearance'].includes(c.selected))return <ThemeCenter/>;if(c.selected==='basic-notifications')return <NotificationSettings/>;if(c.selected==='about')return <AboutSettings/>;if(['terminals','remote'].includes(c.selected))return <RemoteAccess/>;if(c.selected==='risk')return <WorkspaceRisk/>;if(c.selected==='guide')return <SetupGuide/>;return <GeneralSettings/>;}
export function Members(){return <MemberManagement/>;}
export function Storage(){return <StorageSettings/>;}
export function Diagnostics(){const c=useConsole();const [checked,setChecked]=useState(false);const caps=capabilities(c.host);return <><PageHeader title="服务与资源诊断" desc="查看宿主边界、连接状态和待修复事项。" actions={<Button icon={<ReloadOutlined/>} onClick={()=>setChecked(true)}>重新检查演示状态</Button>}/><SettingsNav/>{checked&&<Alert type="success" showIcon title="已刷新演示诊断，未执行外部网络检查。"/>}<div className="asset-grid margin-top">{[['独立 Server','不依赖 Tauri，可同源提供 Web 界面','models'],['AgentScope-Rust','计划中的智能体运行内核，原型未接入','agents'],['当前宿主',c.host==='desktop'?'Desktop 本地控制站':c.host==='web'?'Web 浏览器':c.host==='ipad'?'iPad 前台控制站':'Android Tablet 前台控制站','devices']].map(([name,desc,icon])=><Section key={name}><TileIcon name={icon}/><h3>{name}</h3><p className="muted">{desc}</p></Section>)}</div><Section title="宿主能力边界" className="margin-top"><KeyValue items={[["原生能力",caps.native?'由随应用编译的 Tauri 插件提供':'Web 不加载原生插件'],["串口",caps.serial?'需原生插件及系统授权':'当前宿主不预设通用串口'],["后台运行",caps.background?'Desktop 由宿主管理':'Tablet / Web 不承诺持续后台'],["动态业务扩展","仅组合既有能力，授权后启用"],["预览连接","没有模型、设备、数据库或云服务连接"]]}/></Section><ServiceInstances/></>;}
