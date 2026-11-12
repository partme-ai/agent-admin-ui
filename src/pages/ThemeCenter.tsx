import {colorFamilies,type ColorFamily} from '../color_family';
import {themeFilterFamily,type ThemeFilterTarget} from '../theme_classification';
import {ThemeThumbnail} from './ThemeThumbnail';
import {ThemeCustomizer} from './ThemeCustomizer';
import {defaultThemeCustom} from '../theme_customization';
import {resolveThemeColors} from '../antd_theme';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Alert,Button,Drawer,Empty,Pagination,Radio,Segmented,Switch} from 'antd';
import {CheckOutlined,EditOutlined,PlusOutlined,ReloadOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import {PageHeader} from '../components';
import {defaultSystemTheme,parseSystemTheme,resolveSystemMode,systemThemes,interfaceSystemThemes,recommendedSystemThemes,classicSystemTheme,themeAnchor,type SystemThemeMode,type SystemThemeSettings} from '../system_theme';
import {characterPalettes} from '../character_palettes';
import './theme_center.css';

const copy=(value:SystemThemeSettings)=>parseSystemTheme(JSON.stringify(value));
function themeName(value:SystemThemeSettings){return value.preset_id==='custom'?value.custom?.name||'我的主题':systemThemes.find(t=>t.id===value.preset_id)?.name||'霁蓝';}
export function ThemeCenter(){
 const c=useConsole(),[draft,setDraft]=useState(()=>copy(c.savedSystemTheme)),[live,setLive]=useState(true),[customOpen,setCustomOpen]=useState(false),[error,setError]=useState(''),[colorLibrary,setColorLibrary]=useState('all'),[family,setFamily]=useState<ColorFamily|'all'>('all'),[collection,setCollection]=useState<'interface'|'previous'>('interface'),[filterTarget,setFilterTarget]=useState<ThemeFilterTarget>('primary');
 const beforeCustomize=useRef<SystemThemeSettings|null>(null);
 const clear=c.clearSystemThemePreview,preview=c.previewSystemTheme;
 useEffect(()=>()=>clear(),[clear]);
 useEffect(()=>{setDraft(copy(c.savedSystemTheme));},[c.savedSystemTheme]);
 useEffect(()=>{if(live)preview(draft.custom&&!draft.custom.name.trim()?{...draft,custom:{...draft.custom,name:'我的主题'}}:draft);else clear();},[draft,live,preview,clear]);
 const [page,setPage]=useState(1);
 const dirty=JSON.stringify(draft)!==JSON.stringify(c.savedSystemTheme),mode=resolveSystemMode(draft.mode,c.systemDark),colors=resolveThemeColors(draft,mode,c.device);
 const catalog=useMemo(()=>[...recommendedSystemThemes.filter(t=>t.id==='jilan'),classicSystemTheme,...(collection==='interface'?interfaceSystemThemes:recommendedSystemThemes).filter(t=>t.id!=='jilan')].map(theme=>({theme,colors:resolveThemeColors({...defaultSystemTheme(),preset_id:theme.id},mode,c.device)})),[mode,c.device,collection]);
 const familyCounts=Object.fromEntries(colorFamilies.map(f=>[f.id,catalog.filter(t=>themeFilterFamily(t.colors,filterTarget)===f.id).length]));
 const choices=catalog.filter(t=>family==='all'||themeFilterFamily(t.colors,filterTarget)===family).map(t=>t.theme);
 if(!catalog.some(t=>t.theme.id===draft.preset_id)&&draft.preset_id!=='custom'){const legacy=systemThemes.find(t=>t.id===draft.preset_id);if(legacy&&(family==='all'||themeFilterFamily(colors,filterTarget)===family))choices.unshift(legacy);}
 const pageSize=12,visibleChoices=choices.slice((page-1)*pageSize,page*pageSize);
 useEffect(()=>{setPage(1);},[mode]);
 function select(id:string){c.transitionSystemTheme(()=>{setDraft(d=>({...d,preset_id:id}));setError('');},id!==draft.preset_id);}
 function changeMode(mode:SystemThemeMode){c.transitionSystemTheme(()=>setDraft(d=>({...d,mode})),mode!==draft.mode);}
 function restore(){c.transitionSystemTheme(()=>setDraft({...defaultSystemTheme(),mode:draft.mode}));}
 function cancel(){c.transitionSystemTheme(()=>{setDraft(copy(c.savedSystemTheme));clear();setError('');});}
 function apply(){const save=()=>{if(c.applySystemTheme(draft)){setError('');c.notify('主题已应用，下次打开继续使用。');}};if(live)save();else c.transitionSystemTheme(save);}
 function customize(){beforeCustomize.current=copy(draft);const custom=(draft.preset_id==='custom'?draft.custom:undefined)||systemThemes.find(t=>t.id===draft.preset_id)?.palette||{name:'我的传统色主题',primary:themeAnchor(draft),background:colors.bg,sidebar:themeAnchor(draft),sidebar_style:systemThemes.find(t=>t.id===draft.preset_id)?.sidebar_style||'dark'};setColorLibrary(characterPalettes.find(p=>p.colors.some(color=>color.hex.toLowerCase()===custom.primary.toLowerCase()))?.id||'all');setDraft(d=>({...d,preset_id:'custom',custom}));setError('');setCustomOpen(true);}
 function cancelCustom(){if(beforeCustomize.current)setDraft(beforeCustomize.current);setCustomOpen(false);setError('');}
 function finishCustom(){try{setDraft(copy(draft));setError('');setFamily('all');setPage(1);setCustomOpen(false);}catch(e){setError((e as Error).message);}}
 // 名称留空仍允许即时编辑；送入预览的配置由上次有效名称兜底，完成/应用时严格校验。
 const custom=draft.custom;
 return <div className="theme-center"><PageHeader title="系统主题" desc="一套配色，属于你的控制中心。"/>
  {(error||c.themeStorageError)&&<Alert className="theme-error" type="error" showIcon title={error||c.themeStorageError} closable onClose={()=>setError('')}/>}
  <section className="theme-toolbar" aria-label="主题显示设置"><div><strong>颜色模式</strong><Segmented aria-label="主题颜色模式" value={draft.mode} onChange={v=>changeMode(v as SystemThemeMode)} options={[{value:'light',label:'浅色'},{value:'dark',label:'深色'},{value:'system',label:'跟随系统'}]}/>{draft.mode==='system'&&<small role="status">系统当前为{c.systemDark?'深色':'浅色'}</small>}</div><label className="theme-live"><Switch aria-label="实时预览主题" size="small" checked={live} onChange={setLive}/><span>实时预览</span></label></section>
  <div className="theme-section-title"><div><strong>精选主题</strong><span>30 套界面参考配方 · 保留已有搭配</span></div><Button icon={<PlusOutlined/>} onClick={customize}>自定义主题</Button></div>
  <Segmented className="theme-filter-target" aria-label="主题合集" value={collection} onChange={v=>{setCollection(v as 'interface'|'previous');setFamily('all');setPage(1);}} options={[{value:'interface',label:'界面主题'},{value:'previous',label:'既有搭配'}]}/>
  <Segmented className="theme-filter-target" aria-label="色系筛选依据" value={filterTarget} onChange={v=>{setFilterTarget(v as ThemeFilterTarget);setPage(1);}} options={[{value:'primary',label:'按主题色'},{value:'sidebar',label:'按侧栏色'}]}/>
  <Radio.Group className="theme-family-tabs" aria-label="内置主题色系" value={family} onChange={e=>{setFamily(e.target.value);setPage(1);}} optionType="button" options={[{value:'all',label:`全部 ${catalog.length}`},...colorFamilies.map(f=>({value:f.id,label:`${f.name} ${familyCounts[f.id]}`,disabled:familyCounts[f.id]===0}))]}/>
  <div className="theme-grid" role="group" aria-label="系统主题风格">{visibleChoices.map(t=>{const value={...draft,preset_id:t.id},v=resolveThemeColors(value,mode,c.device),selected=draft.preset_id===t.id;return <button key={t.id} type="button" className={`theme-card ${selected?'is-selected':''}`} aria-label={`选择主题 ${t.name}`} aria-pressed={selected} onClick={()=>select(t.id)}><ThemeThumbnail colors={v}/><div className="theme-card-info"><div><strong>{t.name}{t.id===defaultSystemTheme().preset_id&&<small className="theme-default-badge">默认</small>}</strong><span>{t.description}</span></div><i className="theme-check">{selected&&<CheckOutlined/>}</i></div><div className="theme-card-palette" aria-hidden="true">{[v.anchor,v.sidebar,v.bg,v.surface,v.primary].map((hex,i)=><i key={i} style={{background:hex}}/>)}</div></button>;})}
   {choices.length===0&&<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配的内置主题"/>}
   {custom&&(family==='all'||themeFilterFamily(resolveThemeColors({...draft,preset_id:'custom'},mode,c.device),filterTarget)===family)&&<div className={`theme-card theme-custom-card ${draft.preset_id==='custom'?'is-selected':''}`}><button type="button" className="theme-custom-select" aria-label={`选择主题 ${custom.name||'我的主题'}`} aria-pressed={draft.preset_id==='custom'} onClick={()=>select('custom')}><ThemeThumbnail colors={resolveThemeColors({...draft,preset_id:'custom'},mode,c.device)}/><div className="theme-card-info"><div><strong>{custom.name||'我的主题'}</strong><span>我的配色 · {custom.primary.toUpperCase()}</span></div><i className="theme-check">{draft.preset_id==='custom'&&<CheckOutlined/>}</i></div></button><Button type="text" size="small" icon={<EditOutlined/>} onClick={customize}>编辑自定义主题</Button></div>}
  </div>
  <Pagination className="theme-catalog-pagination" aria-label="主题搭配分页" current={page} pageSize={pageSize} total={choices.length} showSizeChanger={false} size="small" showTotal={total=>`${filterTarget==='primary'?'主题色':'侧栏色'} · ${family==='all'?'全部':colorFamilies.find(f=>f.id===family)?.name} · ${total} 套`} onChange={setPage}/>
  <div className="theme-apply-bar"><div><span className="theme-active-dot" style={{background:colors.primary}}/><div><strong>{themeName(draft)}</strong><small>{dirty?(live?'正在预览 · 尚未应用':'尚未应用 · 预览已关闭'):'已应用'} · {draft.mode==='system'?'跟随系统':mode==='dark'?'深色':'浅色'}</small></div></div><div className="theme-actions"><Button className="theme-restore" icon={<ReloadOutlined/>} onClick={restore}>恢复默认</Button><Button disabled={!dirty} onClick={cancel}>取消预览</Button><Button type="primary" disabled={!dirty} onClick={apply}>应用主题</Button></div></div>
  <p className="theme-scope-note">主题只影响控制台外观，机器人形象和已保存的角色配色保持不变。</p>
  <Drawer className="theme-custom-drawer" title="定制系统主题" open={customOpen} onClose={cancelCustom} size={c.device==='desktop'?920:'100%'} destroyOnHidden footer={<div className="theme-drawer-footer"><Button icon={<ReloadOutlined/>} onClick={()=>c.transitionSystemTheme(()=>{setDraft(d=>({...d,preset_id:'custom',custom:defaultThemeCustom(d.custom?.name||'我的传统色主题')}));setError('');})}>恢复默认</Button><div><Button onClick={cancelCustom}>取消定制</Button><Button type="primary" onClick={finishCustom}>完成定制</Button></div></div>}>
   {choices.length===0&&<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配的内置主题"/>}
   {custom&&<ThemeCustomizer custom={custom} settings={draft} previewSettings={live?draft:c.savedSystemTheme} previewMode={live?mode:resolveSystemMode(c.savedSystemTheme.mode,c.systemDark)} mode={mode} colors={colors} device={c.device} live={live} initialPalette={colorLibrary} error={error} onLive={setLive} onMode={changeMode} onChange={custom=>setDraft(d=>({...d,preset_id:'custom',custom}))}/>}

  </Drawer>
 </div>;
}
