import {colorBrightness,classifyColorFamily,type ColorFamily} from './color_family.ts';
import interfaceRecipeData from './vendor/interface_theme_recipes.json' with {type:'json'};
import curatedData from './vendor/theme_combinations.json' with {type:'json'};
import type {SystemThemeCustom} from './system_theme.ts';

export type ThemeColorTone='all'|'dark'|'light';
export type ThemePalette=Pick<SystemThemeCustom,'primary'|'background'|'sidebar'|'sidebar_style'|'palette_version'>;
/** 深浅色卡采用同一亮度分界；用于浏览分类，不限制用户手动选色。 */
export function themeColorTone(hex:string):Exclude<ThemeColorTone,'all'>{return colorBrightness(hex)<.35?'dark':'light';}
export function filterThemeColorTone<T extends {hex:string}>(colors:readonly T[],tone:ThemeColorTone):T[]{return colors.filter(c=>tone==='all'||themeColorTone(c.hex)===tone);}
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
function mix(a:string,b:string,t:number):string{const x=rgb(a),y=rgb(b);return '#'+x.map((c,i)=>Math.round((c+(y[i]-c)*t)*255).toString(16).padStart(2,'0')).join('');}
/** 新组合只采用深主色和浅底色；旧主题在读入时不经过此函数。 */
function constrain(hex:string,kind:'primary'|'background'|'sidebar-dark'|'sidebar-light'):string{
 const deep=kind==='primary'||kind==='sidebar-dark',limit=kind==='primary'?.18:kind==='sidebar-dark'?.22:kind==='background'?.8:.75;
 let color=hex;for(let i=0;i<100&&(deep?colorBrightness(color)>limit:colorBrightness(color)<limit);i++)color=mix(color,deep?'#000000':'#ffffff',.025);
 return color;
}
/** v2保持旧语义；v3在独立样式之上保证侧栏比页面更深。 */
export function independentSidebar(p:ThemePalette,dark=false,pageBackground?:string):string{
 let color=dark||p.sidebar_style==='dark'?constrain(p.sidebar,'sidebar-dark'):p.sidebar_style==='light'?constrain(p.sidebar,'sidebar-light'):p.sidebar;
 if(p.palette_version===3){
  const page=pageBackground||(dark?'#15181c':p.background),limit=colorBrightness(page)*(dark?.72:.93);
  for(let i=0;i<200&&colorBrightness(color)>=limit;i++)color=mix(color,'#000000',.025);
 }
 return color;
}
function oklab(hex:string):number[]{
 const [r,g,b]=rgb(hex).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [(.2104542553*l+.793617785*m-.0040720468*s)*100,(1.9779984951*l-2.428592205*m+.4505937099*s)*100,(.0259040371*l+.7827717662*m-.808675766*s)*100];
}
/** 三色均方根OKLab距离；比较侧栏实际颜色，不用名称或细微HEX差充数。 */
export function themeCombinationDistance(a:ThemePalette,b:ThemePalette):number{
 const x=[a.primary,a.background,independentSidebar(a)].map(oklab).flat(),y=[b.primary,b.background,independentSidebar(b)].map(oklab).flat();
 return Math.sqrt(x.reduce((sum,v,i)=>sum+(v-y[i])**2,0)/3);
}
/** 固定种子只用于可复现测试，交互默认使用Math.random。 */
export function themeRandom(seed:number):()=>number{return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
/** 只选取有来源的整套配方，避免随机HSL破坏色彩关系。 */
export function createThemePalette(family:ColorFamily,random:()=>number=Math.random):ThemePalette{
 const choices=curatedData.filter(t=>t.color_family===family),index=Math.floor(Math.max(0,Math.min(.999999999,random()))*choices.length),p=choices[index].palette;
 return {...p,sidebar_style:p.sidebar_style as SystemThemeCustom['sidebar_style'],palette_version:3};
}
/** 本色系精选整套抽取；跳过当前组合，保留名称与全部用户外观字段。 */
export function randomizeSystemTheme(custom:SystemThemeCustom,family:ColorFamily=custom.palette_family||classifyColorFamily(custom.primary),random:()=>number=Math.random):SystemThemeCustom{
 const choices=curatedData.filter(t=>t.color_family===family&&[t.palette.primary,t.palette.background,t.palette.sidebar].join('/').toLowerCase()!==[custom.primary,custom.background,custom.sidebar].join('/').toLowerCase());
 const choice=choices[Math.floor(Math.max(0,Math.min(.999999999,random()))*choices.length)].palette;
 return {...custom,...choice,sidebar_style:choice.sidebar_style as SystemThemeCustom['sidebar_style'],palette_version:3,palette_family:family};
}

/** 自动搭配只使用完整界面主题，不从艺术色板随机拆配。无同色系配方时明确不可用。 */
export function interfaceThemeChoices(family:ColorFamily){return interfaceRecipeData.filter(r=>classifyColorFamily(r.modes.light.primary)===family);}
export function randomizeInterfaceTheme(custom:SystemThemeCustom,random:()=>number=Math.random):SystemThemeCustom|undefined{
 const family=classifyColorFamily(custom.primary),all=interfaceThemeChoices(family),choices=all.filter(r=>r.id!==custom.ui_reference);
 if(!choices.length)return undefined;
 const r=choices[Math.floor(Math.max(0,Math.min(.999999999,random()))*choices.length)],v=r.modes.light;
 return {...custom,primary:v.primary,background:v.bg,sidebar:v.sidebar,sidebar_style:'tinted',palette_version:3,palette_family:family,ui_reference:r.id};
}
