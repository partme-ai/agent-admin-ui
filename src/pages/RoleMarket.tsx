import {useState,type CSSProperties} from 'react';
import {Alert,Button,Card,Descriptions,Drawer,Empty,Input,Segmented,Tag,Tooltip} from 'antd';
import {ArrowRightOutlined,AudioOutlined,PlusOutlined,SearchOutlined,PlayCircleOutlined,StopOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import {PageHeader,TileIcon} from '../components';
import {roleMarketTemplates,createMarketRole} from '../role_market';
import {effectiveRoleInstructions,roleAbilitySlots} from '../role_profile';
import {ttsModels,voicesForModel} from '../voice_catalog';
import {useVoicePreview} from '../use_voice_preview';
import {TemplateManager} from './TemplateManager';
import '../role_market.css';

type MarketTemplate=(typeof roleMarketTemplates)[number];
/** 市场卡与详情共用模板形象，不引入独立角色状态。 */
function MarketPortrait({template,large=false}:{template:MarketTemplate;large?:boolean}){return <div className={`market-portrait ${large?'market-portrait-large':''}`} style={{background:'var(--soft)'}} aria-label={`${template.name}图标`}><TileIcon name={template.icon} large/></div>;}
/** 从完整角色模板创建新草稿，不覆盖已存在的角色或记忆。 */
export function RoleMarket(){
 const c=useConsole(),[query,setQuery]=useState(''),[category,setCategory]=useState('全部'),[selected,setSelected]=useState<MarketTemplate|null>(()=>roleMarketTemplates.find(t=>t.id===c.selected)||null);
 const preview=useVoicePreview(JSON.stringify(['role-market',query,category,selected?.id]));
 const categories=['全部',...new Set(roleMarketTemplates.map(t=>t.category))];
 const list=roleMarketTemplates.filter(t=>(category==='全部'||t.category===category)&&`${t.name} ${t.description} ${t.profile.identity} ${t.profile.traits.join(' ')} ${t.instructions}`.toLowerCase().includes(query.toLowerCase()));
 function voiceFor(t:MarketTemplate){const model=ttsModels.find(m=>m.id===t.runtime.ttsModel);return {model,voice:model?voicesForModel(model,c.store.voiceAssets).find(v=>v.key===t.runtime.voice):undefined};}
 function voiceButton(t:MarketTemplate){const {voice}=voiceFor(t),key=`market:${t.id}:${voice?.key||''}`,active=preview.state.key===key&&preview.state.status!=='error';return <Tooltip title={voice?.previewUrl?'官方音色样本':'该音色暂未收录官方样本'}><Button type="text" size="small" aria-label={`${active?'停止试听':'试听角色'} ${t.name}`} aria-pressed={active} disabled={!voice?.previewUrl} icon={active?<StopOutlined/>:<PlayCircleOutlined/>} onClick={()=>preview.toggle(key,voice?.previewUrl)}>{active?(preview.state.status==='loading'?'取消加载':'停止'):'试听'}</Button></Tooltip>;}
 function create(t:MarketTemplate){preview.stop();const role=createMarketRole(t,c.store.connections,c.product.integration.defaults);c.setStore(s=>({...s,agents:[...s.agents,role]}));setSelected(null);c.go('04',role.id);}
 function capabilityChips(t:MarketTemplate){return <div className="market-capabilities" aria-label={`${t.name}能力组合`}>{roleAbilitySlots.map(slot=><Tooltip key={slot.key} title={`${slot.name}${t.profile.disabledAbilities.includes(slot.key)?' · 未启用':''}`}><span className={t.profile.disabledAbilities.includes(slot.key)?'disabled':''}>{slot.key}</span></Tooltip>)}</div>;}
 const detailVoice=selected?voiceFor(selected):null;
 return <div className="role-market"><PageHeader title="角色市场" desc="选择角色模板，定制人格、声音与能力" back="03" actions={<Button icon={<PlusOutlined/>} onClick={()=>c.go('04','new')}>从空白创建</Button>}/>
  <div className="market-toolbar"><Input aria-label="搜索角色市场" prefix={<SearchOutlined/>} placeholder="搜索角色、性格或擅长的事情" allowClear value={query} onChange={e=>setQuery(e.target.value)}/><span>{list.length} 个角色</span></div>
  <div className="market-category-row"><Segmented aria-label="角色分类" value={category} onChange={setCategory} options={categories}/></div>
  {preview.state.error&&<Alert className="market-play-error" type="warning" showIcon title={preview.state.error}/>}<div className="market-grid">{list.map(t=>{const {model,voice}=voiceFor(t);return <Card key={t.id} className="market-card" data-template-id={t.id}><div className="market-card-identity"><MarketPortrait template={t}/><div className="market-character-copy"><Tag>{t.category}</Tag><h2>{t.name}</h2><p>{t.profile.identity}</p><div className="market-traits">{t.profile.traits.map(trait=><span key={trait}>{trait}</span>)}</div></div></div><p className="market-description">{t.description}</p><div className="market-voice"><AudioOutlined/><div><strong>{voice?.name||'待选择声音'}</strong><small>{model?.provider||'待配置'} · {t.runtime.language}</small></div>{voiceButton(t)}</div>{capabilityChips(t)}<div className="market-prompt-summary"><span>角色提示词 · Prompt</span><p>{t.instructions}</p></div><div className="market-card-actions"><Button onClick={()=>setSelected(t)}>查看角色</Button><Button type="primary" onClick={()=>create(t)}>创建角色 <ArrowRightOutlined/></Button></div></Card>;})}</div>
  {!list.length&&<Empty description="没有找到匹配的角色"><Button onClick={()=>{setQuery('');setCategory('全部');}}>查看全部角色</Button></Empty>}
  <TemplateManager/>
  <Drawer className="market-detail-drawer" title={selected?.name||'角色详情'} open={!!selected} onClose={()=>setSelected(null)} size={c.device==='mobile'?'100%':600} footer={selected&&<div className="market-detail-footer"><Button onClick={()=>setSelected(null)}>返回市场</Button><Button type="primary" onClick={()=>create(selected)}>创建独立角色 <ArrowRightOutlined/></Button></div>}>
   {selected&&<><div className="market-detail-identity"><MarketPortrait template={selected} large/><div><Tag>{selected.category}</Tag><h2>{selected.name}</h2><p>{selected.description}</p><div className="market-traits">{selected.profile.traits.map(trait=><span key={trait}>{trait}</span>)}</div></div></div><Descriptions column={1} size="small" colon={false} items={[{key:'identity',label:'人格身份',children:selected.profile.identity},{key:'background',label:'角色背景',children:selected.profile.background},{key:'values',label:'价值取向',children:selected.profile.values},{key:'boundaries',label:'行为边界',children:selected.profile.boundaries},{key:'greeting',label:'见面第一句',children:selected.profile.greeting}]}/>
   <section className="market-detail-section"><h3>声音与能力</h3><div className="market-voice"><AudioOutlined/><div><strong>{detailVoice?.voice?.name||'待选择声音'}</strong><small>{detailVoice?.model?.provider} · {detailVoice?.model?.displayName||detailVoice?.model?.modelId} · {selected.runtime.language}</small></div>{voiceButton(selected)}</div>{capabilityChips(selected)}<p className="market-detail-note">{selected.profile.disabledAbilities.length?`未启用：${selected.profile.disabledAbilities.join('、')}；创建后可继续装配。`:'创建后可调整每项能力与适配参数。'}</p></section>
   <section className="market-detail-section"><h3>完整角色提示词 · Prompt</h3><pre className="market-full-prompt">{effectiveRoleInstructions(selected.instructions,selected.profile)}</pre></section>
   <section className="market-detail-section"><h3>模型与资源依赖</h3><Descriptions column={1} size="small" colon={false} items={[{key:'model',label:'模型要求',children:selected.requirements.join('、')||'通用对话模型'},{key:'knowledge',label:'知识库',children:selected.knowledge.map(id=>c.store.knowledge.find(k=>k.id===id)?.name||id).join('、')||'无需预置知识库'},{key:'tools',label:'工具',children:selected.tools.join('、')||'无需额外工具'},{key:'skills',label:'技能',children:selected.profile.skills.join('、')||'创建后添加'}]}/></section>
   <section className="market-detail-section"><h3>权限与边界</h3><ul className="market-detail-list">{selected.permissions.map(p=><li key={p}>{p}</li>)}</ul></section>
   <section className="market-detail-section"><h3>试着这样问</h3><div className="market-questions">{selected.questions.map(q=><div key={q}>“{q}”</div>)}</div></section><Alert type="info" showIcon title="创建独立角色草稿" description="完整复制人格、性格、声音和能力配置；不携带私人记忆或历史会话。补齐连接并试聊后，再发布使用。"/>
   </>}
  </Drawer>
 </div>;
}
