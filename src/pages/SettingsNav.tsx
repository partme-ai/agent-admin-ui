import {Button} from 'antd';
import {useConsole} from '../context';
export function SettingsNav(){const c=useConsole();return <div className="settings-tabs">{[['52','常规设置'],['theme','外观与主题'],['27','成员与权限'],['28','存储与保留'],['29','服务诊断']].map(([id,title])=><Button key={id} type={(id==='theme'?c.page==='30'&&c.selected==='theme':c.page===id&&!c.selected)?'primary':'default'} onClick={()=>id==='theme'?c.go('30','theme'):c.go(id,id==='52'?'general':undefined)}>{title}</Button>)}</div>;}
