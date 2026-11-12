import {classifyColorFamily} from './color_family.ts';
import {matchSystemTheme,type SystemThemeCustom} from './system_theme.ts';
/** 三个独立配色目标共用右侧色库，沿用原有保存字段。 */
export const themeColorTargets=[{value:'primary',label:'主色'},{value:'background',label:'页面底色'},{value:'sidebar',label:'侧栏基色'}] as const;
export type ThemeColorTargetKey=typeof themeColorTargets[number]['value'];
/** 明确选底色只改对应字段；改主色时保留之前单独定制的底色。 */
export function editThemeTargetColor(custom:SystemThemeCustom,target:ThemeColorTargetKey,color:string):SystemThemeCustom{
 if(!/^#[\da-f]{6}$/i.test(color))throw Error('请选择六位HEX颜色。');
 const manual={...custom};delete manual.ui_reference;
 if(target!=='primary')return {...manual,[target]:color};
 const previous=matchSystemTheme(custom,custom.primary),next=matchSystemTheme(custom,color);
 return {...next,...(custom.palette_version?{palette_version:custom.palette_version,palette_family:classifyColorFamily(color)}:{}),
  background:custom.background.toLowerCase()===previous.background.toLowerCase()?next.background:custom.background,
  sidebar:custom.sidebar.toLowerCase()===previous.sidebar.toLowerCase()?next.sidebar:custom.sidebar
 };
}
