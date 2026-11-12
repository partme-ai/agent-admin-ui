import {useEffect,useState} from 'react';
import {Button,Drawer,Input} from 'antd';
import {SearchOutlined,PlayCircleOutlined,PauseCircleOutlined} from '@ant-design/icons';
import {expressionGroups,robotExpressions,resolveExpression} from '../robot_expressions';
import {RobotFace} from './RobotFace';
/** 在共享试聊屏幕上预览表情，不修改对话轮次、角色或设备配置。 */
export function ExpressionPicker({open,onClose,value,onChange,mobile}:{open:boolean;onClose:()=>void;value:string|null;onChange:(id:string|null)=>void;mobile:boolean}){
 const [group,setGroup]=useState('全部'),[query,setQuery]=useState(''),[playing,setPlaying]=useState(false);
 const visible=robotExpressions.filter(e=>(group==='全部'||e.group===group)&&(!query||e.name.includes(query)||e.id.includes(query.toLowerCase())));
 useEffect(()=>{
  if(!open||!playing||!visible.length)return;
  const timer=setInterval(()=>{const index=visible.findIndex(e=>e.id===value);onChange(visible[(index+1)%visible.length].id);},1800);
  return()=>clearInterval(timer);
 },[open,playing,value,group,query]);
 useEffect(()=>{if(!open)setPlaying(false);},[open]);
 const selected=resolveExpression(value,'idle');
 return <Drawer className="expression-drawer" title={`机器人表情 · ${robotExpressions.length}种`} open={open} onClose={onClose} placement="right" size={mobile?'100%':540}>
  <div className="expression-summary"><div className="expression-summary-face"><RobotFace expression={selected}/></div><div><strong>{value?selected.name:'跟随对话'}</strong><p>{value?`${selected.group} · 正在设备屏幕预览`:'聆听、思考、回应时自动切换表情'}</p><Button size="small" onClick={()=>{setPlaying(false);onChange(null);}}>跟随对话</Button></div></div>
  <div className="expression-gallery-tools"><Input aria-label="搜索机器人表情" placeholder="搜索表情" prefix={<SearchOutlined/>} value={query} allowClear onChange={e=>setQuery(e.target.value)}/><Button size="small" aria-pressed={playing} disabled={!visible.length} icon={playing?<PauseCircleOutlined/>:<PlayCircleOutlined/>} onClick={()=>setPlaying(!playing)}>{playing?'暂停':'轮播'}</Button></div>
  <div className="expression-groups" aria-label="表情分类">{['全部',...expressionGroups].map(g=><Button key={g} type={group===g?'primary':'default'} aria-pressed={group===g} onClick={()=>setGroup(g)}>{g}</Button>)}</div>
  <div className="expression-grid">{visible.map(e=><button key={e.id} className="expression-card" aria-label={`预览表情 ${e.name}`} aria-pressed={value===e.id} onClick={()=>{setPlaying(false);onChange(e.id);}}><div className="expression-card-face"><RobotFace expression={e} mini/></div><span>{e.name}</span></button>)}</div>
  {!visible.length&&<div className="expression-empty">没有匹配的表情，试试其他关键词</div>}
 </Drawer>;
}
