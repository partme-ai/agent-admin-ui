import {classifyColorFamily,type ColorFamily} from './color_family.ts';
import {parseThemeAppearance,themeQuickAppearance,type ThemeAppearance} from './theme_customization.ts';
import {independentSidebar} from './theme_palette_rules.ts';
import legacyCombinationData from './vendor/theme_combinations_legacy_v175.json' with {type:'json'};
import combinationData from './vendor/theme_combinations.json' with {type:'json'};
import interfaceRecipes from './vendor/interface_theme_recipes.json' with {type:'json'};
import traditionalColors from './vendor/traditional_742/colors.json' with {type:'json'};

export type SystemThemeMode='light'|'dark'|'system';
export type SystemThemeCustom={name:string;primary:string;background:string;sidebar:string;sidebar_style:'tinted'|'light'|'dark';palette_version?:2|3;palette_family?:ColorFamily;ui_reference?:string;appearance?:ThemeAppearance};
export type SystemThemeSettings={schema_version:1;preset_id:string;mode:SystemThemeMode;custom?:SystemThemeCustom};
export type SystemThemeColors={bg:string;surface:string;surface2:string;text:string;muted:string;line:string;soft:string;primary:string;primaryText:string;sidebar:string;sidebarInk:string;sidebarSelected:string;sidebarSelectedInk?:string;topbar:string;anchor:string};
export const systemThemeKey='tinybot.system-theme.v1';
/** 主题主色仅引用完整传统色表，不修改颜色资产或机器人形象配置。 */
export type SystemThemePreset={id:string;name:string;description:string;color_id:string;family:string;sidebar_style:SystemThemeCustom['sidebar_style'];color_family?:ColorFamily;palette?:SystemThemeCustom;source?:{label:string;url:string;colors:string[];likes?:number;observed_at?:string;adaptation:string}};
const legacySystemThemes=[
 {id:'jilan',name:'霁蓝',description:'澄澈蓝意，沉静有序',color_id:'traditional742-695',family:'山水青蓝',sidebar_style:'dark'},
 {id:'default',name:'TinyBot 经典',description:'薄荷映白，清爽如初',color_id:'',family:'经典风格',sidebar_style:'tinted'},
 {id:'guanlv',name:'官绿',description:'草木青绿，柔和舒展',color_id:'traditional742-652',family:'草木青绿',sidebar_style:'tinted'},
 {id:'zhusha',name:'朱砂',description:'朱红点睛，暖白留境',color_id:'traditional742-607',family:'东方暖色',sidebar_style:'light'},
 {id:'yuebai',name:'月白',description:'淡雅素净，青灰相映',color_id:'traditional742-424',family:'清雅素色',sidebar_style:'tinted'},
 {id:'moyu',name:'墨玉',description:'深翠墨意，沉稳克制',color_id:'traditional742-593',family:'草木青绿',sidebar_style:'dark'},
 {id:'mushanzi',name:'暮山紫',description:'远山暮紫，细腻安静',color_id:'traditional742-535',family:'雅致紫调',sidebar_style:'dark'},
 {id:'qiuxiang',name:'秋香',description:'秋日暖金，米白相伴',color_id:'traditional742-551',family:'东方暖色',sidebar_style:'tinted'},
 {id:'haitang',name:'海棠',description:'海棠微红，温暖明快',color_id:'traditional742-240',family:'东方暖色',sidebar_style:'light'},
 {id:'ouhe',name:'藕荷',description:'浅藕柔粉，低调温润',color_id:'traditional742-171',family:'清雅素色',sidebar_style:'tinted'},
 {id:'songhua',name:'松花',description:'浅绿染素，自然轻盈',color_id:'traditional742-580',family:'草木青绿',sidebar_style:'light'},
 ...([
  ['yinzhu','134','朱色明快，素白衬底','light'],['dahong','131','鲜明红意，沉静侧栏','dark'],
  ['xinghuang','031','暖杏点睛，轻盈清浅','light'],['hupo','542','琥珀暖调，沉稳有序','dark'],
  ['foshouhuang','006','明黄活力，柔和底色','tinted'],['xingrenhuang','002','杏仁浅黄，细腻温润','light'],
  ['cuilv','479','翠色生机，清爽舒展','light'],['zhuqing','569','竹青雅意，柔和彩色','tinted'],
  ['haiqing','384','海青透亮，深浅相映','dark'],['pubulan','427','瀑布清蓝，轻快自然','tinted'],
  ['baolan','657','宝蓝沉静，秩序分明','dark'],['tianqing','599','天青淡雅，清浅留白','light'],
  ['jiegengzi','320','桔梗紫意，安静细致','dark'],['dingxiangzi','668','丁香柔紫，轻盈雅致','tinted'],
  ['meiguihong','312','玫瑰点睛，素白衬底','light'],['yingfen','589','樱粉柔和，温暖亲切','tinted'],
  ['tanse','601','檀色温润，克制沉静','dark'],['yinhui','144','银灰暖调，柔和自然','tinted'],
  ['yaqing','554','鸦青沉稳，清晰纯粹','dark'],['xuebai','517','雪白留境，清雅素净','light']
 ] as const).map(([id,number,description,sidebar_style])=>{const color_id=`traditional742-${number}`,color=traditionalColors.find(c=>c.id===color_id)!;return {id,name:color.name,description,color_id,family:classifyColorFamily(color.hex),sidebar_style};})
] as const;
/** 新精选目录与旧配方ID独立；旧主题不自动替换。 */
function mapCombination(item:typeof combinationData[number]|typeof legacyCombinationData[number]):SystemThemePreset{return {id:item.id,name:item.name,description:item.description,color_id:'',family:item.color_family,color_family:item.color_family as ColorFamily,sidebar_style:item.palette.sidebar_style as SystemThemeCustom['sidebar_style'],...('source' in item?{source:item.source}:{}),palette:{name:item.name,...item.palette,sidebar_style:item.palette.sidebar_style as SystemThemeCustom['sidebar_style'],palette_version:item.palette.palette_version as 2|3,palette_family:item.color_family as ColorFamily}};}
export const recommendedSystemThemes:SystemThemePreset[]=combinationData.map(mapCombination);
export const interfaceSystemThemes:SystemThemePreset[]=interfaceRecipes.map(r=>({id:r.id,name:r.name,description:r.description,color_id:'',family:classifyColorFamily(r.modes.light.primary),color_family:classifyColorFamily(r.modes.light.primary),sidebar_style:'tinted',source:r.source,palette:{name:r.name,primary:r.modes.light.primary,background:r.modes.light.bg,sidebar:r.modes.light.sidebar,sidebar_style:'tinted',palette_version:3,palette_family:classifyColorFamily(r.modes.light.primary),ui_reference:r.id}}));
export const systemThemes:SystemThemePreset[]=[...legacySystemThemes,...legacyCombinationData.filter(t=>!legacySystemThemes.some(old=>old.id===t.id)).map(mapCombination),...recommendedSystemThemes.filter(t=>!legacySystemThemes.some(old=>old.id===t.id)),...interfaceSystemThemes];
export const classicSystemTheme=systemThemes.find(t=>t.id==='default')!;
export function defaultSystemTheme():SystemThemeSettings{return {schema_version:1,preset_id:'jilan',mode:'light'};}
export function resolveSystemMode(mode:SystemThemeMode,systemDark:boolean):'light'|'dark'{return mode==='system'?(systemDark?'dark':'light'):mode;}
const hexPattern=/^#[\da-f]{6}$/i;
const channels=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
/** sRGB 屏幕色混合，用于生成克制的背景层级。 */
export function mixThemeColor(a:string,b:string,amount:number):string{const x=channels(a),y=channels(b);return '#'+x.map((c,i)=>Math.round(c+(y[i]-c)*amount).toString(16).padStart(2,'0')).join('');}
const luminance=(hex:string)=>channels(hex).map(c=>{const s=c/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;}).reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0);
export function contrastRatio(a:string,b:string):number{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
/** 将前景向可读的黑/白方向微调；保留背景及主色来源不变。 */
function readable(foreground:string,background:string,target=4.5):string{
 if(contrastRatio(foreground,background)>=target)return foreground;
 const end=contrastRatio('#111111',background)>contrastRatio('#ffffff',background)?'#111111':'#ffffff';
 for(let i=1;i<=100;i++){const c=mixThemeColor(foreground,end,i/100);if(contrastRatio(c,background)>=target)return c;}
 return end;
}
export function themeAnchor(settings:SystemThemeSettings):string{
 if(settings.preset_id==='custom')return settings.custom!.primary;
 const preset=systemThemes.find(t=>t.id===settings.preset_id)!;
 return preset.palette?.primary||traditionalColors.find(c=>c.id===preset.color_id)?.hex||'#3563f4';
}
/** 历史来源色系查询保持兼容；界面使用themeFilterFamily按当前实际颜色筛选。 */
export function systemThemeFamily(id:string):ColorFamily{const declared=systemThemes.find(t=>t.id===id)?.color_family;if(declared)return declared;return classifyColorFamily(themeAnchor({...defaultSystemTheme(),preset_id:id}));}
/** 选色即生成完整搭配；保留快捷外观，原草稿不变。 */
export function matchSystemTheme(custom:SystemThemeCustom,primary:string,style:SystemThemeCustom['sidebar_style']=custom.sidebar_style):SystemThemeCustom{
 if(!hexPattern.test(primary))throw Error('主题主色必须为六位HEX。');
 const appearance=themeQuickAppearance(custom.appearance);
 return {name:custom.name,primary,background:mixThemeColor('#f9fafb',primary,.035),sidebar:primary,sidebar_style:style,...(appearance?{appearance}:{})};
}
/** 一套完整主题同时驱动 antd 与自有壳；默认主题保留原有色值。 */
export function buildSystemTheme(settings:SystemThemeSettings,mode:'light'|'dark'):SystemThemeColors{
 if(settings.preset_id==='default')return mode==='light'?{bg:'#f7f8fa',surface:'#ffffff',surface2:'#f1f3f6',text:'#24272e',muted:readable('#6d7583','#f7f8fa'),line:'#e1e5ea',soft:'#edf0f4',primary:'#3563f4',primaryText:'#ffffff',sidebar:'#edf3ef',sidebarInk:'#586760',sidebarSelected:'#e4eaf0',topbar:'#f7f8fa',anchor:'#3563f4'}:{bg:'#171a1e',surface:'#20242a',surface2:'#282d34',text:'#e5e9ed',muted:'#a0aab5',line:'#363d46',soft:'#2b323b',primary:'#4666dc',primaryText:'#ffffff',sidebar:'#1a2420',sidebarInk:'#b1bdb7',sidebarSelected:'#2b3739',topbar:'#171a1e',anchor:'#4666dc'};
 const anchor=themeAnchor(settings),dark=mode==='dark',custom=settings.preset_id==='custom'?settings.custom:systemThemes.find(t=>t.id===settings.preset_id)?.palette;
 const reference=custom?.ui_reference&&interfaceRecipes.find(r=>r.id===custom.ui_reference);
 if(reference)return {...reference.modes[mode]};
 const style=custom?.sidebar_style||systemThemes.find(t=>t.id===settings.preset_id)!.sidebar_style;
 const backgroundSeed=custom?.background||anchor,sidebarSeed=custom?.sidebar||anchor;
 const lightBackground=custom?.background||mixThemeColor('#f9fafb',anchor,.035);
 const bg=dark?mixThemeColor('#14171b',backgroundSeed,.045):luminance(lightBackground)<.65?mixThemeColor(lightBackground,'#ffffff',.92):lightBackground;
 const surface=dark?mixThemeColor('#22262b',backgroundSeed,.045):mixThemeColor('#ffffff',backgroundSeed,.008);
 const surface2=dark?mixThemeColor(surface,'#ffffff',.045):mixThemeColor(surface,anchor,.055);
 const sidebar=custom?.palette_version?independentSidebar(custom,dark,bg):dark||style==='dark'?mixThemeColor('#15202a',sidebarSeed,.11):style==='light'?mixThemeColor('#ffffff',sidebarSeed,.02):mixThemeColor('#eef3f0',sidebarSeed,.11);
 // 极浅锚色先保留色相、降低明度，避免生成看不见的按钮和焦点。
 const primary=readable(readable(anchor,bg,4.7),surface,4.7);
 const primaryText=contrastRatio('#ffffff',primary)>=4.5?'#ffffff':'#111111';
 const text=readable(dark?'#e8ecef':'#252d34',bg),muted=readable(dark?'#a5b0bb':'#697481',bg,4.7);
 // 独立基色可落在任意亮度；选中态朝同一对比方向移动，避免文字在两种背景间失去对比。
 const independentInk=contrastRatio('#ffffff',sidebar)>=contrastRatio('#000000',sidebar)?'#ffffff':'#000000';
 const sidebarSelected=custom?.palette_version?mixThemeColor(sidebar,independentInk==='#ffffff'?'#000000':'#ffffff',.12):mixThemeColor(sidebar,readable(anchor,sidebar),dark||style==='dark'?.18:.12);
 const sidebarInk=custom?.palette_version?independentInk:readable(readable(dark||style==='dark'?'#cad5de':'#50616a',sidebar),sidebarSelected);
 return {bg,surface,surface2,text:readable(text,surface),muted:readable(readable(muted,surface),surface2),line:mixThemeColor(surface,dark?'#b6c3ce':'#52616e',dark?.21:.17),soft:mixThemeColor(surface,anchor,dark?.18:.09),primary,primaryText,sidebar,sidebarInk,sidebarSelected,topbar:bg,anchor};
}
/** 导入只接受受控字段，不接受 CSS、URL、任意样式或新增脚本字段。 */
export function parseSystemTheme(raw:string):SystemThemeSettings{
 if(raw.length>16384)throw Error('主题文件过大，请选择小于 16 KB 的主题 JSON。');
 let x:unknown;try{x=JSON.parse(raw);}catch{throw Error('主题文件不是有效的 JSON。');}
 if(!x||typeof x!=='object'||Array.isArray(x))throw Error('主题配置格式不正确。');
 const v=x as Record<string,unknown>;
 if(v.schema_version!==1||!['light','dark','system'].includes(String(v.mode))||!([...systemThemes.map(t=>t.id),'custom'] as string[]).includes(String(v.preset_id)))throw Error('主题版本、风格或颜色模式不受支持。');
 let custom:SystemThemeCustom|undefined;
 if(v.custom!==undefined){
  if(!v.custom||typeof v.custom!=='object'||Array.isArray(v.custom))throw Error('自定义主题格式不正确。');
  const c=v.custom as Record<string,unknown>;
  if(typeof c.name!=='string'||!c.name.trim()||c.name.length>30||!['primary','background','sidebar'].every(k=>typeof c[k]==='string'&&hexPattern.test(c[k] as string))||!['tinted','light','dark'].includes(String(c.sidebar_style)))throw Error('请填写主题名称、六位 HEX 颜色和有效的侧栏风格。');
  custom={name:c.name.trim(),primary:c.primary as string,background:c.background as string,sidebar:c.sidebar as string,sidebar_style:c.sidebar_style as SystemThemeCustom['sidebar_style']};
  if(c.palette_version!==undefined&&c.palette_version!==2&&c.palette_version!==3)throw Error('独立配色版本不受支持。');if(c.palette_version===2||c.palette_version===3)custom.palette_version=c.palette_version;
  if(c.palette_family!==undefined){if(!['red','orange','yellow','green','cyan','blue','purple','pink','brown','neutral'].includes(String(c.palette_family)))throw Error('搭配色系不受支持。');custom.palette_family=c.palette_family as ColorFamily;}
  if(c.ui_reference!==undefined){if(typeof c.ui_reference!=='string'||!interfaceRecipes.some(r=>r.id===c.ui_reference))throw Error('界面配方引用不受支持。');const recipe=interfaceRecipes.find(r=>r.id===c.ui_reference)!;if([['primary',recipe.modes.light.primary],['background',recipe.modes.light.bg],['sidebar',recipe.modes.light.sidebar]].some(([key,hex])=>String(c[key]).toLowerCase()!==hex.toLowerCase())||c.sidebar_style!=='tinted')throw Error('界面配方与当前配色不一致，请重新选色。');custom.ui_reference=c.ui_reference;}
  const appearance=parseThemeAppearance(c.appearance);if(appearance)custom.appearance=appearance;
 }
 if(v.preset_id==='custom'&&!custom)throw Error('缺少自定义主题的颜色设置。');
 return {schema_version:1,preset_id:v.preset_id as string,mode:v.mode as SystemThemeMode,...(custom?{custom}:{})};
}
type ThemeStorage={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
/** 读取失败保留原始数据，不在初始化时自动修复或覆盖。 */
export function readSystemTheme(storage:Pick<ThemeStorage,'getItem'>):{settings:SystemThemeSettings;error?:string;found?:boolean}{
 try{const raw=storage.getItem(systemThemeKey);return raw?{settings:parseSystemTheme(raw),found:true}:{settings:defaultSystemTheme()};}
 catch{return {settings:defaultSystemTheme(),error:'本机主题无法读取，已使用默认风格，原数据未覆盖。'};}
}
export function writeSystemTheme(storage:ThemeStorage,settings:SystemThemeSettings):void{const validated=parseSystemTheme(JSON.stringify(settings));storage.setItem(systemThemeKey,JSON.stringify(validated));}
/** 全部变量来自受控颜色；不会读取、替换或清理机器人存储。 */
export function systemThemeVariables(t:SystemThemeColors):Record<string,string>{return {'--bg':t.bg,'--surface':t.surface,'--surface-2':t.surface2,'--text':t.text,'--muted':t.muted,'--line':t.line,'--soft':t.soft,'--accent':t.primary,'--primary-text':t.primaryText,'--sidebar-surface':t.sidebar,'--sidebar-ink':t.sidebarInk,'--sidebar-selected':t.sidebarSelected,'--sidebar-accent':readable(t.primary,t.sidebar),'--topbar-surface':t.topbar,'--brand-green':t.primary,'--focus':readable(t.primary,t.bg,3),'--border-hover':mixThemeColor(t.line,t.primary,.35)};}
