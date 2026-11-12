import type {SystemThemeCustom} from './system_theme.ts';
import {codeFontOptions,themeFontOptions,themeFontValues,resolveThemeFontId,type ThemeFontFamily} from './theme_fonts.ts';

export type ThemeColorOverrides={heading?:string;text?:string;secondary?:string;border?:string};
export type ThemeAppearance={code_font_family?:ThemeFontFamily;font_family?:ThemeFontFamily;font_size?:number;line_height?:number;border_width?:number;border_style?:'solid'|'dashed'|'dotted';border_radius?:number;shadow?:'default'|'none'|'soft'|'standard'|'strong';density?:'compact'|'comfortable'|'spacious';colors?:{light?:ThemeColorOverrides;dark?:ThemeColorOverrides}};
export type ThemeEditorGroup='colors'|'text'|'border'|'style'|'density';
export type ThemeColorTarget='primary'|'background'|'sidebar'|keyof ThemeColorOverrides;
export const themeAppearanceDefaults={font_size:13,line_height:1.6,border_width:1,border_style:'solid',border_radius:7,shadow:'default',density:'compact'} as const;
/** 可选高级字段严格校验，旧文件不补写默认值，也不接受任意CSS字符串。 */
export function parseThemeAppearance(value:unknown):ThemeAppearance|undefined{
 if(value===undefined)return undefined;
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('高级主题设置格式不正确。');
 const input=value as Record<string,unknown>,out:Record<string,unknown>={};
 for(const [key,min,max,integer] of [['font_size',12,18,true],['line_height',1.3,2,false],['border_width',0,2,true],['border_radius',0,16,true]] as const){
  const n=input[key];if(n===undefined)continue;
  if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max||integer&&!Number.isInteger(n))throw Error(`${({font_size:'正文字号',line_height:'正文行高',border_width:'边框粗细',border_radius:'基础圆角'} as Record<string,string>)[key]}超出允许范围。`);out[key]=n;
 }
 for(const [key,choices] of [['code_font_family',codeFontOptions.map(f=>f.value)],['font_family',themeFontValues],['border_style',['solid','dashed','dotted']],['shadow',['default','none','soft','standard','strong']],['density',['compact','comfortable','spacious']]] as const){
  const v=input[key];if(v===undefined)continue;if(typeof v!=='string'||!(choices as readonly string[]).includes(v))throw Error(`${({code_font_family:'代码字体',font_family:'界面字体',border_style:'边框样式',shadow:'阴影',density:'紧凑度'} as Record<string,string>)[key]}不受支持。`);out[key]=v;
 }
 if(input.colors!==undefined){
  if(!input.colors||typeof input.colors!=='object'||Array.isArray(input.colors))throw Error('文字与边框颜色格式不正确。');
  const modes:ThemeAppearance['colors']={};
  for(const mode of ['light','dark'] as const){
   const raw=(input.colors as Record<string,unknown>)[mode];if(raw===undefined)continue;
   if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('颜色模式格式不正确。');
   const colors:ThemeColorOverrides={};for(const key of ['heading','text','secondary','border'] as const){const v=(raw as Record<string,unknown>)[key];if(v===undefined)continue;if(typeof v!=='string'||!/^#[\da-f]{6}$/i.test(v))throw Error('文字与边框颜色必须为六位HEX。');colors[key]=v;}
   if(Object.keys(colors).length)modes[mode]=colors;
  }
  if(Object.keys(modes).length)out.colors=modes;
 }
 return Object.keys(out).length?out as ThemeAppearance:undefined;
}
/** 以默认霁蓝作为重置基线，保留用户给定的名称。 */
export function defaultThemeCustom(name='我的传统色主题'):SystemThemeCustom{return {name,primary:'#1E5A8F',background:'#f1f4f7',sidebar:'#1E5A8F',sidebar_style:'dark'};}
/** 只更新正在编辑的颜色目标，浅深模式的文字与边框互不覆盖。 */
export function patchThemeColor(custom:SystemThemeCustom,target:ThemeColorTarget,color:string,mode:'light'|'dark'):SystemThemeCustom{
 if(target==='primary'||target==='background'||target==='sidebar')return {...custom,[target]:color};
 return {...custom,appearance:{...custom.appearance,colors:{...custom.appearance?.colors,[mode]:{...custom.appearance?.colors?.[mode],[target]:color}}}};
}
/** 分组重置仅删除本组覆盖值，保留其他组及另一种模式的颜色。 */
export function resetThemeGroup(custom:SystemThemeCustom,group:ThemeEditorGroup,mode:'light'|'dark'):SystemThemeCustom{
 if(group==='colors')return {...defaultThemeCustom(custom.name),...(custom.appearance?{appearance:custom.appearance}:{})};
 const a:ThemeAppearance=JSON.parse(JSON.stringify(custom.appearance||{}));
 if(group==='text'){delete a.code_font_family;delete a.font_family;delete a.font_size;delete a.line_height;for(const key of ['heading','text','secondary'] as const)if(a.colors?.[mode])delete a.colors[mode][key];}
 if(group==='border'){delete a.border_width;delete a.border_style;if(a.colors?.[mode])delete a.colors[mode].border;}
 if(group==='style'){delete a.border_radius;delete a.shadow;}
 if(group==='density')delete a.density;
 const appearance=parseThemeAppearance(a),result={...custom};if(appearance)result.appearance=appearance;else delete result.appearance;return result;
}

/** 面向用户的有限快捷档位，统一映射到既有antd外观字段。 */
export const themeQuickOptions={
 code_font_family:{label:'代码字体',options:codeFontOptions.map(({value,label})=>({value,label}))},
 font_family:{label:'界面字体',options:themeFontOptions.map(({value,label})=>({value,label}))},
 font_size:{label:'字号',options:[{value:12,label:'小'},{value:14,label:'中'},{value:16,label:'大'}]},
 density:{label:'间距',options:[{value:'compact',label:'紧凑'},{value:'comfortable',label:'标准'},{value:'spacious',label:'宽松'}]},
 border_radius:{label:'圆角',options:[{value:0,label:'方正'},{value:7,label:'标准'},{value:12,label:'圆润'}]},
 shadow:{label:'阴影',options:[{value:'none',label:'无'},{value:'soft',label:'柔和'},{value:'strong',label:'明显'}]}
} as const;
export type ThemeQuickKey=keyof typeof themeQuickOptions;
/** 只更新明确选择的预设，保留已有主题的其他字段与颜色覆盖。 */
export function setThemeQuickOption(custom:SystemThemeCustom,key:ThemeQuickKey,value:string|number):SystemThemeCustom{
 if(!themeQuickOptions[key].options.some(o=>o.value===value))throw Error('请选择提供的外观预设。');
 const appearance={...custom.appearance};
 // 没有字号覆盖时锁定原字号，避免切换密度让紧凑算法隐式改变文字大小。
 if(key==='density'&&appearance.font_size===undefined)appearance.font_size=appearance.density?13:12;
 return {...custom,appearance:{...appearance,[key]:value}};
}
/** 将历史数值就近显示为档位，仅用于回显，不自动修改保存值。 */
export function themeQuickValue(custom:SystemThemeCustom,key:ThemeQuickKey):string|number{
 const a=custom.appearance||{},value=a[key];
 if(themeQuickOptions[key].options.some(o=>o.value===value))return value!;
 if(key==='code_font_family')return codeFontOptions.find(f=>f.value===value)?.value||'jetbrains_mono';
 if(key==='font_family')return resolveThemeFontId(a.font_family);
 if(key==='font_size'&&value===undefined)return a.density?14:12;
 if(key==='font_size')return typeof value==='number'&&value<=12?12:typeof value==='number'&&value>=16?16:14;
 if(key==='border_radius')return typeof value==='number'&&value>=10?12:7;
 if(key==='shadow')return value==='standard'?'soft':'none';
 return 'compact';
}
/** 换颜色时延续快捷外观，颜色类覆盖仍交给新的自动搭配。 */
export function themeQuickAppearance(appearance?:ThemeAppearance):ThemeAppearance|undefined{
 const keys=Object.keys(themeQuickOptions) as ThemeQuickKey[],entries=keys.filter(key=>appearance?.[key]!==undefined).map(key=>[key,appearance![key]]);
 return entries.length?Object.fromEntries(entries) as ThemeAppearance:undefined;
}
/** 恢复五个快捷外观字段，保留侧栏样式、颜色与其他历史设置。 */
export function resetThemeQuickOptions(custom:SystemThemeCustom):SystemThemeCustom{
 const appearance={...custom.appearance};for(const key of Object.keys(themeQuickOptions) as ThemeQuickKey[])delete appearance[key];
 const result={...custom};if(Object.keys(appearance).length)result.appearance=appearance;else delete result.appearance;return result;
}
