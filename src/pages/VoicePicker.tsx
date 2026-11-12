import {useState} from 'react';
import {Button,Modal,Input,Select,Segmented,Empty,Tag,Pagination,Checkbox} from 'antd';
import {AudioOutlined,DownOutlined,SearchOutlined,StarOutlined,StarFilled,CheckOutlined,PlusOutlined,PlayCircleOutlined,StopOutlined} from '@ant-design/icons';
import type {CatalogVoice,TtsModel} from '../voice_catalog';
import {useConsole} from '../context';
import {useVoicePreview} from '../use_voice_preview';
import './voice_library.css';

/** 音色只在当前 TTS 模型与账号连接范围内选择，收藏使用带提供方的身份键。 */
export function VoicePicker({model,voices,value,onChange,disabled=false}:{model:TtsModel;voices:CatalogVoice[];value:string;onChange:(key:string)=>void;disabled?:boolean}){
 const c=useConsole();const [open,setOpen]=useState(false),[tab,setTab]=useState('全部音色'),[query,setQuery]=useState(''),[language,setLanguage]=useState('全部语种'),[page,setPage]=useState(1);
 const [onlyPlayable,setOnlyPlayable]=useState(false);
 const preview=useVoicePreview(JSON.stringify([open,model.id,tab,query,language,page,onlyPlayable]));
 const selected=voices.find(v=>v.key===value);const favorites=c.store.favoriteVoices||[];
 const availableLanguages=Array.from(new Set(voices.map(v=>v.language)));
 const list=voices.filter(v=>(!onlyPlayable||!!v.previewUrl)&&(tab!=='我的音色'||v.kind==='cloned')&&(tab!=='收藏'||favorites.includes(v.key))&&(language==='全部语种'||v.language===language)&&(!query||`${v.name} ${v.voiceId} ${Object.values(v.tags||{}).join(' ')}`.toLowerCase().includes(query.toLowerCase())));
 const currentPage=Math.min(page,Math.max(1,Math.ceil(list.length/16)));
 const visibleVoices=list.slice((currentPage-1)*16,currentPage*16);
 function toggleFavorite(key:string){c.setStore(s=>({...s,favoriteVoices:(s.favoriteVoices||[]).includes(key)?s.favoriteVoices.filter(k=>k!==key):[...(s.favoriteVoices||[]),key]}));}
 return <><Button disabled={disabled} className="voice-picker-trigger" aria-label="选择音色" aria-haspopup="dialog" onClick={()=>{setQuery('');setLanguage('全部语种');setTab('全部音色');setOnlyPlayable(false);setPage(1);setOpen(true);}}><AudioOutlined/><span>{selected?.name||'选择该模型的音色'}</span><DownOutlined/></Button>
 <Modal title="选择音色" open={open} onCancel={()=>setOpen(false)} footer={null} width={800} className="voice-library-modal" destroyOnHidden>
  <div className="voice-library-context"><Tag>{model.provider}</Tag><strong>{model.displayName||model.modelId}</strong><span>{voices.length} 个音色 · {voices.filter(v=>v.previewUrl).length} 个可试听</span></div>
  <div className="voice-library-tabs"><Segmented aria-label="音色分类" value={tab} onChange={v=>{setTab(v);setPage(1);}} options={['全部音色','我的音色','收藏']}/>{model.clone&&<Button icon={<PlusOutlined/>} onClick={()=>{setOpen(false);c.go('22');}}>创建音色</Button>}</div>
  <div className="voice-library-filters"><Input aria-label="搜索音色" prefix={<SearchOutlined/>} allowClear placeholder="搜索音色名称或 Voice ID" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/><Select aria-label="音色语种" value={availableLanguages.includes(language)?language:'全部语种'} onChange={v=>{setLanguage(v);setPage(1);}} options={['全部语种',...availableLanguages].map(v=>({value:v,label:v}))}/></div>
  <div className="voice-preview-tools"><Checkbox checked={onlyPlayable} onChange={e=>{setOnlyPlayable(e.target.checked);setPage(1);}}>仅显示可试听</Checkbox><span>官方音色片段</span></div>
  {preview.state.error&&<p role="alert" className="voice-preview-error">{preview.state.error}</p>}
  <div className="voice-library-grid">{visibleVoices.map(v=><article className={`voice-library-card ${v.key===value?'selected':''}`} key={v.key}>
   <button type="button" className="voice-library-choice" aria-label={`选择音色 ${v.name}`} aria-pressed={v.key===value} onClick={()=>{preview.stop();onChange(v.key);setOpen(false);}}><span className="voice-library-avatar"><AudioOutlined/></span><strong title={v.name}>{v.name}</strong><small title={[v.language,...Object.values(v.tags||{})].join(' · ')}>{v.language.replace('中文 (普通话)','普通话').replace('中文 (粤语)','粤语')} · {v.kind==='cloned'?'我的音色':v.kind==='local'?'本机音色':'系统音色'}</small>{v.key===value&&<CheckOutlined className="voice-library-selected"/>}</button>
   <div className="voice-library-card-actions"><Button title={v.previewUrl?'播放官方音色片段':'暂未收录该音色的官方片段'} type="text" size="small" aria-label={`${preview.state.key===v.key&&preview.state.status!=='error'?'停止试听':'试听音色'} ${v.name}`} aria-pressed={preview.state.key===v.key&&preview.state.status!=='error'} disabled={!v.previewUrl} icon={preview.state.key===v.key&&preview.state.status!=='error'?<StopOutlined/>:<PlayCircleOutlined/>} onClick={()=>preview.toggle(v.key,v.previewUrl)}>{preview.state.key===v.key&&preview.state.status!=='error'?(preview.state.status==='loading'?'取消加载':'停止'):v.previewUrl?'试听':'暂无样本'}</Button><Button type="text" size="small" aria-label={`${favorites.includes(v.key)?'取消收藏':'收藏'} ${v.name}`} aria-pressed={favorites.includes(v.key)} icon={favorites.includes(v.key)?<StarFilled/>:<StarOutlined/>} onClick={()=>toggleFavorite(v.key)}/></div>
  </article>)}</div>
  {list.length>0&&<Pagination className="voice-library-pagination" current={currentPage} pageSize={16} total={list.length} onChange={setPage} size="small" showSizeChanger={false} showLessItems showTotal={total=>`共 ${total} 项`}/>}
  {!list.length&&<div className="voice-library-empty"><Empty description={tab==='我的音色'?'当前模型还没有可用的个人音色':tab==='收藏'?'当前模型还没有收藏音色':'没有匹配的音色'}/></div>}
 </Modal></>;
}
