import {parseThemeAppearance,setThemeQuickOption,defaultThemeCustom} from './theme_customization.ts';
import {colorFamilies} from './color_family.ts';
import {themeFilterFamily} from './theme_classification.ts';
import {buildSystemTheme,defaultSystemTheme,systemThemes,interfaceSystemThemes,recommendedSystemThemes,systemThemeAppearance,type SystemThemeSettings} from './system_theme.ts';
export const quickThemeStorageKey='agent-admin.quick-themes.v1';
let defaults:string[]|undefined;
/** 每个实际有主题的色系取一套，优先当前默认及已有精选主题，不创建新配色。 */
export function defaultQuickThemeIds():string[]{
 if(!defaults){
  const candidates=[...systemThemes.filter(t=>t.id===defaultSystemTheme().preset_id),...interfaceSystemThemes,...recommendedSystemThemes,...systemThemes],seen=new Set<string>(),families=new Map<string,string>();
  for(const theme of candidates){if(seen.has(theme.id))continue;seen.add(theme.id);const family=themeFilterFamily(buildSystemTheme({...defaultSystemTheme(),preset_id:theme.id},'light'),'primary');if(!families.has(family))families.set(family,theme.id);}
  defaults=colorFamilies.flatMap(f=>families.has(f.id)?[families.get(f.id)!]:[]);
 }
 return [...defaults];
}
export function parseQuickThemeIds(raw:string):string[]{
 if(raw.length>65536)throw Error('快捷主题配置过大。');
 const data=JSON.parse(raw);if(!data||data.schema_version!==1||!Array.isArray(data.ids)||data.ids.some((id:unknown)=>typeof id!=='string'||id!=='custom'&&!systemThemes.some(t=>t.id===id)))throw Error('快捷主题配置格式不正确。');
 return [...new Set<string>(data.ids)];
}
export function readQuickThemeIds(storage:{getItem:(key:string)=>string|null}):{ids:string[];error?:string}{
 try{const raw=storage.getItem(quickThemeStorageKey);return {ids:raw===null?defaultQuickThemeIds():parseQuickThemeIds(raw)};}catch{return {ids:defaultQuickThemeIds(),error:'快捷主题设置未能读取，原保存值保持不变。'};}
}
export function writeQuickThemeIds(storage:{setItem:(key:string,value:string)=>void},ids:string[]):void{
 const raw=JSON.stringify({schema_version:1,ids});parseQuickThemeIds(raw);storage.setItem(quickThemeStorageKey,raw);
}
/** 复用系统主题定义；自定义主题带入其已保存外观，不改写原定义。 */
export function selectQuickTheme(settings:SystemThemeSettings,id:string):SystemThemeSettings{
 if(id==='custom'&&!settings.custom||id!=='custom'&&!systemThemes.some(t=>t.id===id))throw Error('快捷主题不存在。');
 const appearance=id==='custom'?(settings.custom?.appearance||{}):systemThemeAppearance(settings);
 return {...settings,preset_id:id,...(appearance?{quick_appearance:structuredClone(appearance)}:{})};
}

/** 快捷外观保存完整覆盖快照；Auto 能清除生效值而不删除原自定义定义。 */
export function setQuickAppearance(settings:SystemThemeSettings,key:'border_radius'|'density',value:number|string|undefined):SystemThemeSettings{
 let appearance={...systemThemeAppearance(settings)};
 if(value===undefined)delete appearance[key];
 else if(key==='density')appearance=setThemeQuickOption({...defaultThemeCustom(),appearance},'density',value).appearance!;
 else appearance.border_radius=Number(value);
 return {...settings,quick_appearance:parseThemeAppearance(appearance)||{}};
}
export function resetQuickSettings(settings:SystemThemeSettings):SystemThemeSettings{return {...defaultSystemTheme(),...(settings.custom?{custom:structuredClone(settings.custom)}:{})};}
