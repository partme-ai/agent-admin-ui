import {Alert,Switch} from 'antd';
import {useConsole} from '../context';
import {PageHeader,Section,KeyValue} from '../components';

export function NotificationSettings(){
 const c=useConsole();
 const notifications={approval:true,offline:true,product:false,...c.store.preferences.notifications};
 const setNotification=(key:keyof typeof notifications,value:boolean)=>c.setStore(s=>({...s,preferences:{...s.preferences,notifications:{approval:true,offline:true,product:false,...s.preferences.notifications,[key]:value}}}));
 return <><PageHeader title="通知" desc="选择在管理界面中显示的提醒。"/><Section title="提醒类型">
  <div className="setting-row"><span>任务审批提醒</span><Switch aria-label="任务审批提醒" checked={notifications.approval} onChange={value=>setNotification('approval',value)}/></div>
  <div className="setting-row"><span>服务离线提醒</span><Switch aria-label="服务离线提醒" checked={notifications.offline} onChange={value=>setNotification('offline',value)}/></div>
  <div className="setting-row"><span>产品提示</span><Switch aria-label="产品提示" checked={notifications.product} onChange={value=>setNotification('product',value)}/></div>
  <Alert type="info" title="这些选择仅影响本地演示状态，不请求操作系统通知权限。"/>
 </Section></>;
}

export function AboutSettings(){
 const c=useConsole();
 return <><PageHeader title="关于" desc="查看当前管理界面的标识与运行边界。"/><Section title={c.branding.name}>
  <KeyValue items={[["名称",c.branding.name],["说明",c.branding.slogan],["当前界面",c.host==='desktop'?'Desktop':c.host==='ipad'?'Pad':c.host==='android'?'Mobile':'Web'],["运行状态","本地交互预览；未连接真实服务"]]}/>
 </Section></>;
}
