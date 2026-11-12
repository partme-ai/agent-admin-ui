import {theme,type ThemeConfig,type GlobalToken,type MappingAlgorithm} from 'antd';
import {buildSystemTheme,systemThemes,contrastRatio,mixThemeColor,systemThemeVariables,type SystemThemeSettings,type SystemThemeColors} from './system_theme.ts';

import {codeFontFamily,themeFontFamily} from './theme_fonts.ts';
import type {ThemeAppearance} from './theme_customization.ts';

type Device='desktop'|'tablet'|'mobile';
/** 算法身份固定，避免连续输入为主题缓存创建无界的新键；字体梯度仍取自官方算法。 */
const preserveTypography:MappingAlgorithm=(seed,map)=>{
 const typography=theme.defaultAlgorithm(seed),out={...map!};
 for(const key of Object.keys(typography).filter(k=>/^(fontSize|fontHeight|lineHeight)/.test(k)))(out as unknown as Record<string,unknown>)[key]=(typography as unknown as Record<string,unknown>)[key];
 return out;
};

/** 已有明暗成套配方的主色不再被深色算法二次压暗，派生悬停层级仍由antd负责。 */
const preserveReferencePrimary:MappingAlgorithm=(seed,map)=>({...map!,colorPrimary:seed.colorPrimary,colorInfo:seed.colorInfo});

/** 传统色只定义配色意图；组件梯度、尺寸和交互状态由 antd 算法派生。 */
export function systemThemeConfig(settings:SystemThemeSettings,mode:'light'|'dark',device:Device,reduceMotion=false):ThemeConfig{
 const c=buildSystemTheme(settings,mode),touch=device!=='desktop',a=settings.preset_id==='custom'?settings.custom?.appearance:undefined;
 const reference=settings.preset_id==='custom'?settings.custom?.ui_reference:systemThemes.find(t=>t.id===settings.preset_id)?.palette?.ui_reference;
 const density=a?.density||'compact',compact=density==='compact',font=a?.font_size||13;
 const control=touch?(density==='spacious'?44:density==='comfortable'?42:40):(density==='spacious'?36:density==='comfortable'?32:28);
 const gap=density==='spacious'?22:density==='comfortable'?18:16,base=mode==='dark'?theme.darkAlgorithm:theme.defaultAlgorithm;
 const algorithm:MappingAlgorithm[]=[base,...(compact?[theme.compactAlgorithm]:[])];
 // 保留官方字体梯度，让字号与密度可独立定制，不被紧凑算法再次缩小。
 if(a?.font_size!==undefined||a?.density!==undefined)algorithm.push(preserveTypography);
 if(reference)algorithm.push(preserveReferencePrimary);
 const colors=a?.colors?.[mode],radius=a?.border_radius??7,largeRadius=radius===0?0:Math.min(24,radius+5);
 const textOverrides=colors?{...(colors.text?{colorText:readableText(colors.text,c.surface)}:{}),...(colors.heading?{colorTextHeading:readableText(colors.heading,c.surface)}:{}),...(colors.secondary?{colorTextSecondary:readableText(colors.secondary,c.surface),colorTextDescription:readableText(colors.secondary,c.surface),colorTextPlaceholder:readableText(colors.secondary,c.surface)}:{}),...(colors.border?{colorBorder:colors.border,colorBorderSecondary:colors.border}:{})}:{};
 const shadow=a?.shadow&&a.shadow!=='default'?shadowValue(a.shadow,mode):undefined;
 return {algorithm,token:{
  colorPrimary:c.primary,colorInfo:c.primary,colorTextLightSolid:c.primaryText,
  colorBgLayout:c.bg,colorBgContainer:c.surface,colorBgElevated:c.surface,colorText:c.text,colorTextSecondary:c.muted,colorTextPlaceholder:c.muted,colorBorder:c.line,
  ...(reference?{colorPrimaryBg:c.soft,colorFillAlter:c.surface2,colorBorderSecondary:c.line}:{}),
  colorSuccess:'#36805c',colorWarning:'#a76b13',colorError:'#c63838',
  fontFamily:themeFontFamily(a?.font_family),fontFamilyCode:codeFontFamily(a?.code_font_family),fontSize:a?.font_size??(a?.density?13:14),borderRadius:radius,borderRadiusLG:largeRadius,paddingLG:gap,paddingSM:density==='spacious'?14:density==='comfortable'?11:8,controlHeight:control+(compact?4:0),motion:!reduceMotion,
  ...textOverrides,...(a?.line_height!==undefined?{lineHeight:a.line_height}:{}),...(a?.border_width!==undefined?{lineWidth:a.border_width,...(a.border_width===0?{lineWidthFocus:2,controlOutlineWidth:2}:{})}:{}),...(a?.border_style?{lineType:a.border_style}:{}),...(shadow!==undefined?{boxShadow:shadow,boxShadowSecondary:shadow,boxShadowTertiary:shadow}:{})
 },components:{
  Menu:{fontSize:font+1,itemHeight:touch?Math.max(40,control):control+6,itemBorderRadius:radius,itemMarginBlock:2,itemMarginInline:0,itemPaddingInline:9,groupTitleFontSize:10,groupTitleLineHeight:'18px',iconSize:15,collapsedWidth:64},
  Button:{fontSize:font,defaultShadow:'none',primaryShadow:'none'},
  Input:{fontSize:font,paddingBlock:touch?7:3},Select:{fontSize:font,optionHeight:touch?control:control+2},
  Table:{fontSize:font-1,cellPaddingBlock:density==='spacious'?14:density==='comfortable'?11:8,cellPaddingInline:12,headerBorderRadius:radius},
  Card:{fontSize:font,headerFontSize:font,borderRadiusLG:largeRadius,bodyPadding:gap,headerHeight:control+12},
  Modal:{fontSize:font,borderRadiusLG:largeRadius},Drawer:{fontSize:font,paddingLG:touch?16:20}
 }};
}
/** 只调整屏幕实际文字的可读性，持久化仍保留用户选择的原始HEX。 */
function readableText(color:string,bg:string):string{
 if(contrastRatio(color,bg)>=4.5)return color;
 const end=contrastRatio('#111111',bg)>contrastRatio('#ffffff',bg)?'#111111':'#ffffff';
 for(let i=1;i<=100;i++){const value=mixThemeColor(color,end,i/100);if(contrastRatio(value,bg)>=4.5)return value;}return end;
}
function shadowValue(value:Exclude<NonNullable<ThemeAppearance['shadow']>,'default'>,mode:'light'|'dark'):string{
 if(value==='none')return 'none';const rgb=mode==='dark'?'0, 0, 0':'15, 23, 42';
 return value==='soft'?`0 2px 8px rgba(${rgb}, 0.08)`:value==='standard'?`0 4px 16px rgba(${rgb}, 0.14)`:`0 8px 28px rgba(${rgb}, 0.24)`;
}
/** 使用实际全局 Token 映射自有壳和主题预览，避免两套全局色值并存。 */
export function colorsFromToken(t:GlobalToken,palette:SystemThemeColors):SystemThemeColors{
 return {...palette,bg:t.colorBgLayout,surface:t.colorBgContainer,surface2:t.colorFillAlter,text:t.colorText,muted:t.colorTextSecondary,line:t.colorBorder,soft:t.colorPrimaryBg,primary:t.colorPrimary,primaryText:t.colorTextLightSolid,topbar:t.colorBgLayout};
}
export function resolveThemeColors(settings:SystemThemeSettings,mode:'light'|'dark',device:Device):SystemThemeColors{
 return colorsFromToken(theme.getDesignToken(systemThemeConfig(settings,mode,device)),buildSystemTheme(settings,mode));
}
export function sidebarIsDark(c:SystemThemeColors):boolean{return contrastRatio('#ffffff',c.sidebar)>contrastRatio('#111111',c.sidebar);}
/** 侧栏可深于正文；触控抽屉使用内容区主题，不继承深色侧栏的文字色。 */
export function navigationThemeConfig(c:SystemThemeColors,mode:'light'|'dark',device:Device,region:'sidebar'|'drawer',appearance?:ThemeAppearance):ThemeConfig{
 const density=appearance?.density||'compact',font=appearance?.font_size||13,control=device==='desktop'?(density==='spacious'?36:density==='comfortable'?32:28):(density==='spacious'?44:density==='comfortable'?42:40);
 const sidebar=region==='sidebar',dark=sidebar?sidebarIsDark(c):mode==='dark';
 const bg=sidebar?c.sidebar:c.surface,ink=sidebar?c.sidebarInk:c.text;
 const t=theme.getDesignToken({algorithm:dark?theme.darkAlgorithm:theme.defaultAlgorithm,token:{colorPrimary:c.primary,colorBgContainer:bg,colorText:ink,colorTextSecondary:ink}});
 const selectedBg=sidebar?c.sidebarSelected:t.colorPrimaryBg;
 const selectedBase=sidebar?c.sidebarSelectedInk||ink:ink;
 const selectedInk=contrastRatio(selectedBase,selectedBg)>=4.5?selectedBase:contrastRatio('#ffffff',selectedBg)>contrastRatio('#000000',selectedBg)?'#ffffff':'#000000';
 // 选中态沿用本区域可读文字，避免将浅页面文字误用到深侧栏。
 return {components:{Menu:{fontSize:font+1,
  colorBgContainer:bg,colorText:ink,colorTextSecondary:ink,
  itemBg:bg,itemColor:ink,itemHoverBg:t.colorFillSecondary,itemHoverColor:ink,itemActiveBg:selectedBg,itemSelectedBg:selectedBg,itemSelectedColor:selectedInk,itemDisabledColor:t.colorTextDisabled,
  subMenuItemBg:bg,subMenuItemSelectedColor:ink,groupTitleColor:ink,
  darkItemBg:bg,darkItemColor:ink,darkItemHoverBg:t.colorFillSecondary,darkItemHoverColor:ink,darkItemSelectedBg:selectedBg,darkItemSelectedColor:selectedInk,darkItemDisabledColor:t.colorTextDisabled,darkSubMenuItemBg:bg,darkGroupTitleColor:ink,darkPopupBg:bg,
  itemHeight:device==='desktop'?control+6:control,itemBorderRadius:appearance?.border_radius??7,itemMarginBlock:2,itemMarginInline:0,itemPaddingInline:9,groupTitleFontSize:10,groupTitleLineHeight:'18px',iconSize:device==='tablet'&&sidebar?17:15,iconMarginInlineEnd:8,collapsedWidth:40
 }}};
}
/** 旧 CSS 变量仅作为 Token 的适配出口，不接触机器人资产或持久化。 */
export function themeVariablesFromToken(t:GlobalToken,palette:SystemThemeColors):Record<string,string>{
 return {...systemThemeVariables(colorsFromToken(t,palette)),
  '--surface-2':t.colorFillAlter,'--soft':t.colorPrimaryBg,'--focus':t.colorPrimaryBorder,'--border-hover':t.colorPrimaryHover,
  '--text-disabled':t.colorTextDisabled,'--line-secondary':t.colorBorderSecondary,'--popup-surface':t.colorBgElevated,
  '--status-success':t.colorSuccess,'--status-warning':t.colorWarning,'--status-error':t.colorError,
  '--console-font-family':t.fontFamily,'--console-code-font-family':t.fontFamilyCode,'--console-font-size':t.fontSize+'px','--console-line-height':String(t.lineHeight),'--console-radius':t.borderRadius+'px','--console-card-radius':t.borderRadiusLG+'px','--console-line-width':t.lineWidth+'px','--console-line-style':t.lineType,'--console-card-padding':t.paddingLG+'px','--console-table-padding':t.paddingSM+'px','--console-card-shadow':t.boxShadowTertiary,'--heading':t.colorTextHeading,
  '--sidebar-motion':t.motion?t.motionDurationMid:'0s','--sidebar-ease':t.motionEaseInOut
 };
}
