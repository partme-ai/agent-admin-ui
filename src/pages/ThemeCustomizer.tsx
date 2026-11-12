import {useState} from 'react';
import {codeFontOptions,codeFontFamily,themeFontFamily,themeFontOptions,themeFontGroups} from '../theme_fonts';
import {themeColorTargets,editThemeTargetColor,type ThemeColorTargetKey} from '../theme_color_targets';
import type {CSSProperties} from 'react';
import {themeQuickOptions,themeQuickValue,setThemeQuickOption,resetThemeQuickOptions,type ThemeQuickKey} from '../theme_customization';
import {Alert,Button,Card,ConfigProvider,Input,Radio,Segmented,Select,Switch,Tag,theme} from 'antd';
import {CheckOutlined,ReloadOutlined} from '@ant-design/icons';
import {systemThemeConfig} from '../antd_theme';
import {randomizeInterfaceTheme,interfaceThemeChoices} from '../theme_palette_rules';
import {type SystemThemeCustom,type SystemThemeSettings,type SystemThemeMode,type SystemThemeColors} from '../system_theme';
import {classifyColorFamily} from '../color_family';
import {resolveCharacterColor} from '../character_colors';
import {CharacterPalette} from './CharacterPalette';
import {ThemeThumbnail} from './ThemeThumbnail';

type Props={custom:SystemThemeCustom;settings:SystemThemeSettings;previewSettings:SystemThemeSettings;previewMode:'light'|'dark';mode:'light'|'dark';colors:SystemThemeColors;device:'desktop'|'tablet'|'mobile';live:boolean;initialPalette:string;error:string;onLive:(live:boolean)=>void;onMode:(mode:SystemThemeMode)=>void;onChange:(custom:SystemThemeCustom)=>void};
/** 面向用户的选配流程：一色成套，保留旧配置直到明确重新选择。 */
export function ThemeCustomizer(p:Props){
 const [target,setTarget]=useState<ThemeColorTargetKey>('primary');
 const targetLabel=themeColorTargets.find(t=>t.value===target)!.label;
 const choose=(color:string)=>p.onChange(editThemeTargetColor(p.custom,target,color));
 return <><div className="theme-editor-toolbar"><Segmented aria-label="定制颜色模式" value={p.settings.mode} onChange={v=>p.onMode(v as SystemThemeMode)} options={[{value:'light',label:'浅色'},{value:'dark',label:'深色'},{value:'system',label:'跟随系统'}]}/><label><Switch aria-label="抽屉实时预览" size="small" checked={p.live} onChange={p.onLive}/>实时预览</label></div>
 <div className="theme-custom-layout theme-choice-layout"><aside className="theme-custom-settings theme-choice-settings">
  <ThemeThumbnail colors={p.colors}/>
  <ThemeQuickSettings custom={p.custom} onChange={p.onChange}/>
  <section className="theme-choice-preview" aria-label="主题效果预览"><div className="theme-editor-preview-heading"><strong>效果预览</strong><span>{p.live?'实时更新':'预览已暂停'}</span></div><ConfigProvider theme={{...systemThemeConfig(p.previewSettings,p.previewMode,p.device),inherit:false}}><ThemePreview shadow={p.previewSettings.preset_id==='custom'&&!!p.previewSettings.custom?.appearance?.shadow&&!['none','default'].includes(p.previewSettings.custom.appearance.shadow)}/></ConfigProvider></section>
  {p.error&&<Alert type="error" title={p.error} showIcon/>}
 </aside><div className="theme-custom-colors"><label className="theme-name-field">主题名称<Input aria-label="自定义主题名称" value={p.custom.name} maxLength={30} onChange={e=>p.onChange({...p.custom,name:e.target.value})}/></label><section className="theme-color-choices" data-device={p.device} aria-label="独立配色"><div className="theme-palette-columns"><section className="theme-sidebar-panel" aria-label="侧栏样式分组"><div className="theme-palette-panel-heading"><strong>侧栏样式</strong></div><Radio.Group className="theme-sidebar-options" aria-label="侧栏样式" value={p.custom.sidebar_style} onChange={e=>{const next={...p.custom,sidebar_style:e.target.value};delete next.ui_reference;p.onChange(next);}} optionType="button" options={[{value:'light',label:'清浅'},{value:'tinted',label:'柔和'},{value:'dark',label:'深色'}]}/></section><section className="theme-color-panel" aria-label="配色分组"><div className="theme-palette-panel-heading"><strong>配色</strong><Button type="text" size="small" icon={<ReloadOutlined/>} disabled={!interfaceThemeChoices(classifyColorFamily(p.custom.primary)).some(r=>r.id!==p.custom.ui_reference)} title="选择本色系完整界面配方；未收录的色系不使用随机三色凑数" onClick={()=>{const next=randomizeInterfaceTheme(p.custom);if(next)p.onChange(next);}}>自动搭配</Button></div><Radio.Group className="theme-color-targets" aria-label="配色目标" value={target} optionType="button" options={themeColorTargets.map(t=>({value:t.value,label:<span className="theme-color-target-content"><span>{t.label}</span><span><i style={{background:p.custom[t.value]}}/><code>{p.custom[t.value].toUpperCase()}</code></span></span>}))} onChange={e=>setTarget(e.target.value)}/></section></div></section><CharacterPalette usage="theme" title={`选择${targetLabel}`} initialPalette={p.initialPalette} themeTarget={target} value={p.custom[target]} onChange={id=>choose(resolveCharacterColor(id)[2])}/></div></div></>;
}
/** 五种快捷外观统一点选，恢复不影响右侧配色与侧栏样式。 */
function ThemeQuickSettings({custom,onChange}:{custom:SystemThemeCustom;onChange:(custom:SystemThemeCustom)=>void}){
 return <section className="theme-quick-settings" aria-label="主题外观快捷设置"><div><strong>快捷设置</strong><Button type="text" size="small" icon={<ReloadOutlined/>} onClick={()=>onChange(resetThemeQuickOptions(custom))}>恢复</Button></div>{(['font_family','code_font_family','font_size','density','border_radius','shadow'] as ThemeQuickKey[]).map(key=><div className="theme-quick-row" key={key}><span>{themeQuickOptions[key].label}</span>{(key==='font_family'||key==='code_font_family')?<Select<string,import('antd/es/select').DefaultOptionType> className="theme-font-select" aria-label={key==='font_family'?'主题字体':'主题代码字体'} value={String(themeQuickValue(custom,key))} onChange={value=>onChange(setThemeQuickOption(custom,key,value))} showSearch optionFilterProp="searchText" popupMatchSelectWidth={280} listHeight={320} options={key==='code_font_family'?codeFontOptions.map(f=>({value:f.value,label:f.label,searchText:f.label})):themeFontGroups.map(group=>({label:group,options:themeFontOptions.filter(f=>f.group===group).map(f=>({value:f.value,searchText:f.label,label:<span style={{fontFamily:themeQuickValue(custom,key)===f.value?f.family:undefined}}>{f.label}</span>}))}))}/>:<Radio.Group aria-label={`主题${themeQuickOptions[key].label}`} optionType="button" value={themeQuickValue(custom,key)} onChange={e=>onChange(setThemeQuickOption(custom,key,e.target.value))} options={[...themeQuickOptions[key].options]}/>}</div>)}<p className="theme-font-note" style={{fontFamily:themeFontFamily(custom.appearance?.font_family)}}>示例 Sample 字体 Font — Aa Gg Oo 0123</p><code className="theme-font-note" style={{fontFamily:codeFontFamily(custom.appearance?.code_font_family)}}>{"const msg = 'Hello'; // 0O1l"}</code><p className="theme-font-note">使用统一网页字库，按需加载。 <a href="./fonts/NOTICE.html" target="_blank" rel="noreferrer">来源与授权</a></p></section>;
}
/** 左栏中用真实组件预览成套效果，无须填写测试表单。 */
function ThemePreview({shadow}:{shadow:boolean}){
 const {token}=theme.useToken();
 return <div className="theme-choice-sample" style={{fontFamily:token.fontFamily,background:token.colorBgLayout,color:token.colorText,borderRadius:token.borderRadius,padding:8,'--sample-font':token.fontSize+'px','--sample-small-font':Math.max(10,token.fontSize-2)+'px','--sample-row-font':Math.max(10,token.fontSize-1)+'px','--sample-gap':token.paddingSM+'px','--sample-row-padding':Math.round(token.paddingSM*.7)+'px'} as CSSProperties}><Card size="small" title="你的控制中心" extra={<Tag color="success">就绪</Tag>} style={{borderRadius:token.borderRadiusLG,boxShadow:shadow?token.boxShadowTertiary:'none'}} styles={{body:{padding:Math.round(token.paddingLG*.6)}}}>
  <strong className="theme-choice-sample-title">连接你的智能伙伴</strong><p aria-label="字体效果示例" style={{color:token.colorTextSecondary}}>角色、知识与设备 · Aa 123</p>
  <code style={{fontFamily:token.fontFamilyCode,fontSize:token.fontSize}}>{"const msg = 'Hello'; // 0O1l"}</code><div className="theme-choice-sample-row"><span>客厅机器人</span><Tag color="success">在线</Tag></div><div className="theme-choice-sample-row"><span>工作室设备</span><span style={{color:token.colorTextSecondary}}>待连接</span></div>
  <Button block type="primary" size="small" icon={<CheckOutlined/>}>开始体验</Button>
 </Card></div>;
}
