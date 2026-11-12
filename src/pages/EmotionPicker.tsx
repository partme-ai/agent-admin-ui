import {useState} from 'react';
import {Button,Drawer,Input,Pagination,Select,Space} from 'antd';
import {useConsole} from '../context';
import {emotions,emotionCharacter,defaultEmotionSet} from '../emotion_sets';
import {useEmotionSets} from '../use_emotion_sets';
import type {CharacterConfig} from '../character_config';
import {sceneSvg} from '../character_scene';
import './emotion_studio.css';
/** 在试聊屏幕直接预览整套情绪；不编辑角色配置，不启动采集。 */
export function EmotionPicker({open,onClose,value,onChange,mobile}:{open:boolean;onClose:()=>void;value:CharacterConfig;onChange:(value:CharacterConfig)=>void;mobile:boolean}){
 const c=useConsole(),library=useEmotionSets(),[query,setQuery]=useState(''),[page,setPage]=useState(1);
 const set=library.sets.find(s=>s.id===value.emotion_set_id)||defaultEmotionSet,filtered=emotions.filter(e=>`${e.name} ${e.name_en} ${e.emoji} ${e.keywords.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <Drawer title="机器人情绪 · 152项" open={open} onClose={onClose} size={mobile?'100%':520} footer={<Space wrap><Button onClick={()=>{onChange({...value,emotion:undefined,emotion_id:undefined,emotion_set_id:set.id});onClose();}}>跟随对话</Button><Button onClick={()=>{onClose();c.go('34');}}>打开表情定制</Button></Space>}><div className="emotion-filter"><Select aria-label="试聊情绪套装" value={set.id} options={library.sets.map(s=>({value:s.id,label:s.name}))} onChange={id=>{const selected=library.sets.find(s=>s.id===id);if(selected)onChange({...emotionCharacter(selected,value.emotion_id||emotions[0].id),name:value.name});}}/><Input aria-label="搜索试聊情绪" value={query} placeholder="搜索情绪或Emoji" onChange={e=>{setQuery(e.target.value);setPage(1);}}/></div><p className="character-note">选择后即时显示在机器人屏幕中。开始对话后，倾听与思考状态自动接管。</p><div className="emotion-grid">{filtered.slice((page-1)*24,page*24).map(e=><button className="emotion-tile" key={e.id} type="button" aria-label={`预览情绪 ${e.name}`} aria-pressed={value.emotion_id===e.id} onClick={()=>onChange({...emotionCharacter(set,e.id),name:value.name})}><div className="emotion-thumbnail" dangerouslySetInnerHTML={{__html:sceneSvg(emotionCharacter(set,e.id),1,{reduce:true,maskId:'picker'+e.id.replace(/[^a-z0-9]/g,'')})}}/><span><i>{e.emoji}</i>{e.name}</span></button>)}</div>{!filtered.length&&<p>没有匹配的情绪</p>}<Pagination className="margin-top" size="small" current={page} pageSize={24} total={filtered.length} showSizeChanger={false} onChange={setPage}/></Drawer>;
}
