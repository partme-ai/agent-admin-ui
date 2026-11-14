import type {SystemThemeSettings} from './system_theme.ts';
/** 外观布局与配色独立，历史文件缺少这些字段时保留现有导航形态。 */
export type ThemeLayout={sidebar?:'inset'|'floating'|'sidebar';mode?:'default'|'compact'|'full';content?:'full'|'centered';direction?:'ltr'|'rtl'};
export const themeLayoutDefaults={sidebar:'sidebar',mode:'default',content:'full',direction:'ltr'} as const;
const choices={sidebar:['inset','floating','sidebar'],mode:['default','compact','full'],content:['full','centered'],direction:['ltr','rtl']} as const;
/** 只接收有限布局选项；不允许任意 CSS、脚本或宽度字符串。 */
export function parseThemeLayout(value:unknown):ThemeLayout|undefined{
 if(value===undefined)return undefined;
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('主题布局格式不正确。');
 const result:Record<string,string>={};
 for(const key of Object.keys(choices) as (keyof ThemeLayout)[]){const option=(value as Record<string,unknown>)[key];if(option===undefined)continue;if(typeof option!=='string'||!(choices[key] as readonly string[]).includes(option))throw Error('主题布局选项不受支持。');result[key]=option;}
 return Object.keys(result).length?result as ThemeLayout:undefined;
}
export function resolveThemeLayout(layout?:ThemeLayout){return {...themeLayoutDefaults,...layout};}
/** 单组更新和恢复均不改动主题颜色、其他布局、字体或业务配置。 */
export function updateThemeLayout(settings:SystemThemeSettings,key:keyof ThemeLayout,value:string|undefined):SystemThemeSettings{
 const next={...settings.quick_layout};if(value===undefined)delete next[key];else Object.assign(next,{[key]:value});
 const layout=parseThemeLayout(next),result={...settings};if(layout)result.quick_layout=layout;else delete result.quick_layout;return result;
}
