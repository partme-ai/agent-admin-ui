import {useState,type ReactNode} from 'react';
import {Alert,Button,Drawer,Empty} from 'antd';
import {CheckOutlined,ReloadOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import {isEnglish} from '../ui_i18n';
import {PaletteIcon} from '../PaletteIcon';
import {ThemeThumbnail} from './ThemeThumbnail';
import {systemThemes,resolveSystemMode,systemThemeAppearance,defaultSystemTheme,type SystemThemeSettings} from '../system_theme';
import {resolveThemeColors} from '../antd_theme';
import {selectQuickTheme,setQuickAppearance,resetQuickSettings} from '../theme_quick_settings';
import {resolveThemeLayout,updateThemeLayout,type ThemeLayout} from '../theme_layout';
import './theme_quick_settings.css';

/** 独立快捷入口；完整主题选择、配色及自定义编辑仍由原系统主题页面管理。 */
export function ThemeQuickSettings(){
 const c=useConsole(),[open,setOpen]=useState(false);
 const language=isEnglish(c.store.preferences.language,navigator.language)?'en':'zh';
 const labels:Record<string,string>={'主题快速设置':'Quick theme settings','主题设置':'Theme settings','调整外观和布局以适应您的偏好。':'Adjust appearance and layout to your preference.','重置':'Reset','模式':'Mode','系统':'System','浅色':'Light','深色':'Dark','主题':'Themes','管理主题':'Manage themes','请在系统主题卡片上开启“快捷设置”':'Enable Quick settings on a theme card','圆角':'Corners','当前':'Current','已有设置':'Saved value','密度':'Density','紧凑':'Compact','默认':'Default','宽松':'Spacious','侧边栏':'Sidebar','内嵌':'Inset','浮动':'Floating','布局':'Layout','全屏布局':'Full screen','内容宽度':'Content width','全宽':'Full width','居中':'Centered','方向':'Direction','从左到右':'Left to right','从右到左':'Right to left'};
 const t=(value:string)=>language==='en'?labels[value]||value:value;
 const settings=c.savedSystemTheme,appearance=systemThemeAppearance(settings),layout=resolveThemeLayout(settings.quick_layout),mode=resolveSystemMode(settings.mode,c.systemDark);
 function apply(next:SystemThemeSettings){c.transitionSystemTheme(()=>{c.applySystemTheme(next);});}
 const changeLayout=(key:keyof ThemeLayout,value:string|undefined)=>apply(updateThemeLayout(settings,key,value));
 const themes=c.quickThemeIds.flatMap(id=>{const preset=systemThemes.find(t=>t.id===id);if(id==='custom'&&settings.custom)return [{id,name:settings.custom.name}];return preset?[{id,name:preset.name}]:[];});
 function heading(title:string,reset?:()=>void){return <div className="qtheme-heading"><strong>{t(title)}</strong>{reset&&<Button type="text" size="small" icon={<ReloadOutlined aria-hidden="true"/>} aria-label={language==='en'?`Reset ${t(title)}`:`重置${title}`} onClick={reset}/>}</div>;}
 function card(label:string,selected:boolean,onClick:()=>void,preview:ReactNode,key:string,localize=true){const text=localize?t(label):label;return <button key={key} type="button" className="qtheme-option" aria-label={text} aria-pressed={selected} onClick={onClick}><span className="qtheme-tile">{preview}{selected&&<i className="qtheme-check"><CheckOutlined aria-hidden="true"/></i>}</span><span className="qtheme-label">{text}</span></button>;}
 return <>
 <Button type="text" className="theme-quick-trigger" title={t('主题快速设置')} aria-label={t('主题快速设置')} icon={<PaletteIcon/>} onClick={()=>setOpen(true)}/>
 <Drawer className="theme-quick-drawer admin-quick-drawer" title={<div><strong>{t('主题设置')}</strong><p className="qtheme-description">{t('调整外观和布局以适应您的偏好。')}</p></div>} open={open} onClose={()=>setOpen(false)} placement="right" size="min(448px, 100vw)" push={false} maskClosable={false} footer={<Button type="primary" block className="qtheme-reset" onClick={()=>apply(resetQuickSettings(settings))}>{t('重置')}</Button>}>
 <div className="qtheme-body">
 {(c.themeStorageError||c.quickThemesError)&&<Alert type="error" showIcon title={c.themeStorageError||c.quickThemesError}/>}
 <section aria-label={t('模式')}>{heading('模式',()=>apply({...settings,mode:defaultSystemTheme().mode}))}<div className="qtheme-grid">{([{value:'system',label:'系统'},{value:'light',label:'浅色'},{value:'dark',label:'深色'}] as const).map(option=>card(option.label,settings.mode===option.value,()=>apply({...settings,mode:option.value}),<ThemeThumbnail colors={resolveThemeColors(settings,resolveSystemMode(option.value,c.systemDark),c.device)}/>,option.value))}</div></section>
 <section aria-label={t('主题')}><div className="qtheme-heading"><strong>{t('主题')}</strong><Button type="link" size="small" onClick={()=>{setOpen(false);c.go('30','theme');}}>{t('管理主题')}</Button></div><div className="qtheme-grid qtheme-presets">{themes.map(theme=>{const configured=selectQuickTheme(settings,theme.id),colors=resolveThemeColors(configured,mode,c.device);return card(theme.name,settings.preset_id===theme.id,()=>apply(configured),<ThemeThumbnail colors={colors}/>,theme.id,false);})}</div>{!themes.length&&<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('请在系统主题卡片上开启“快捷设置”')}/>}</section>
 <section aria-label={t('圆角')}>{heading('圆角',()=>apply(setQuickAppearance(settings,'border_radius',undefined)))}{appearance?.border_radius!==undefined&&![0,4.8,8,12,16].includes(appearance.border_radius)&&<small className="qtheme-current">{t('当前')}：{appearance.border_radius}px（{t('已有设置')}）</small>}<div className="qtheme-grid qtheme-radii">{([{value:undefined,label:'Auto'},{value:0,label:'0'},{value:4.8,label:'0.3'},{value:8,label:'0.5'},{value:12,label:'0.75'},{value:16,label:'1.0'}]).map(option=>card(option.label,appearance?.border_radius===option.value,()=>apply(setQuickAppearance(settings,'border_radius',option.value)),<i className="qtheme-corner" style={{borderStartStartRadius:option.value??16}}/>,option.label))}</div></section>
 <section aria-label={t('密度')}>{heading('密度',()=>apply(setQuickAppearance(settings,'density',undefined)))}<div className="qtheme-grid qtheme-densities">{([{value:'compact',label:'紧凑'},{value:'comfortable',label:'默认'},{value:'spacious',label:'宽松'}] as const).map(option=>card(option.label,(appearance?.density||'compact')===option.value,()=>apply(setQuickAppearance(settings,'density',option.value)),<span className={`qtheme-lines ${option.value}`}><i/><i/><i/><i/></span>,option.value))}</div></section>
 <section aria-label={t('侧边栏')}>{heading('侧边栏',()=>changeLayout('sidebar',undefined))}<div className="qtheme-grid">{([{value:'inset',label:'内嵌'},{value:'floating',label:'浮动'},{value:'sidebar',label:'侧边栏'}] as const).map(option=>card(option.label,layout.sidebar===option.value,()=>changeLayout('sidebar',option.value),<LayoutPreview kind="sidebar" value={option.value}/>,option.value))}</div></section>
 <section aria-label={t('布局')}>{heading('布局',()=>changeLayout('mode',undefined))}<div className="qtheme-grid">{([{value:'default',label:'默认'},{value:'compact',label:'紧凑'},{value:'full',label:'全屏布局'}] as const).map(option=>card(option.label,layout.mode===option.value,()=>changeLayout('mode',option.value),<LayoutPreview kind="mode" value={option.value}/>,option.value))}</div></section>
 <section aria-label={t('内容宽度')}>{heading('内容宽度',()=>changeLayout('content',undefined))}<div className="qtheme-grid qtheme-pair qtheme-width">{([{value:'full',label:'全宽'},{value:'centered',label:'居中'}] as const).map(option=>card(option.label,layout.content===option.value,()=>changeLayout('content',option.value),<span className={`qtheme-content ${option.value}`}><b/><span><i/><i/></span></span>,option.value))}</div></section>
 <section aria-label={t('方向')}>{heading('方向',()=>changeLayout('direction',undefined))}<div className="qtheme-grid qtheme-directions">{([{value:'ltr',label:'从左到右'},{value:'rtl',label:'从右到左'}] as const).map(option=>card(option.label,layout.direction===option.value,()=>changeLayout('direction',option.value),<LayoutPreview kind="direction" value={option.value}/>,option.value))}</div></section>
 </div>
 </Drawer>
 </>;
}
function LayoutPreview({kind,value}:{kind:'sidebar'|'mode'|'direction';value:string}){return <span aria-hidden="true" className={`qtheme-layout ${kind}-${value}`}><span className="qtheme-nav"><i/><b/><b/><b/><b/></span><span className="qtheme-main"><b/><span className="qtheme-chart"><i/><i/><i/><em/></span><span className="qtheme-panel"/></span></span>;}
