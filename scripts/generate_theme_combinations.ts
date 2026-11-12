/** 参考色板→后台角色色适配。只从已采集的策展色板选择，不生成随机HSL。 */
import {writeFileSync} from 'node:fs';
import categories from '../src/vendor/theme_reference_categories.json' with {type:'json'};
import popular from '../src/vendor/theme_reference_popular.json' with {type:'json'};
import {colorFamilies,classifyColorFamily,colorBrightness,type ColorFamily} from '../src/color_family.ts';
const rgb=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a:string,b:string,t:number)=>'#'+rgb(a).map((v,i)=>Math.round(v+(rgb(b)[i]-v)*t).toString(16).padStart(2,'0')).join('');
const contrast=(a:string,b:string)=>(Math.max(colorBrightness(a),colorBrightness(b))+.05)/(Math.min(colorBrightness(a),colorBrightness(b))+.05);
const saturation=(h:string)=>{const a=rgb(h),max=Math.max(...a),min=Math.min(...a);return max?1-min/max:0;};
function accent(seed:string){let c=seed;for(let i=0;i<100&&(colorBrightness(c)>.17||contrast(c,'#ffffff')<5.4);i++)c=mix(c,'#161b22',.025);return c;}
function pale(seed:string){let c=mix('#ffffff',seed,.26);for(let i=0;i<100&&colorBrightness(c)<.9;i++)c=mix(c,'#ffffff',.05);return c;}
const themeNames:Record<ColorFamily,string[]>={
 red:'朱砂 丹霞 赤陶 绯云 海棠 朱颜 胭脂 石榴 榴火 赤霞 山丹 彤云 霜叶 红枫 茜草 玫瑰 朱雀 锦绣 暖阳 蔷薇 樱桃 绛雪 晚霞 红玉 珊瑚 丹桂 朱槿 莓果 夕照 红棉'.split(' '),
 orange:'琥珀 橘光 落日 杏林 柑橘 金秋 暖橙 赭石 南瓜 秋实 晨橘 赤金 铜铃 日落 夕橙 桂香 杏月 柿红 暖砂 橘颂 金柑 陶土 焦糖 蜜橘 橙花 朝霞 橘焰 秋叶 暖陶 砂金'.split(' '),
 yellow:'秋香 金桂 麦田 杏仁 蜂蜜 金穗 流金 姜黄 日光 松花 金沙 稻香 香槟 暖金 金盏 麦芽 秋麦 竹黄 藤黄 玉米 晨曦 金茶 琉璃 燕麦 金菊 柠檬 银杏 琥金 杏露 金缕'.split(' '),
 green:'官绿 竹影 松林 苔青 碧叶 青禾 茶山 翡翠 苔庭 绿野 薄荷 竹溪 青柠 松石 山岚 柳色 翠微 苔原 森语 抹茶 豆青 苔石 荷叶 碧潭 柏影 青瓷 玉竹 橄榄 芽绿 春山'.split(' '),
 cyan:'海青 青碧 湖光 碧泉 青汐 蓝湾 碧水 海盐 晴川 碧波 潮声 薄雾 清泉 竹海 海风 青霭 沧澜 翠湖 青石 碧海 水镜 冰川 青湾 湖心 藻青 碧空 涧水 潭影 青岚 海月'.split(' '),
 blue:'霁蓝 海湾 远山 靛海 晴空 星河 云海 碧空 夜航 湖蓝 蓝墨 晴岚 海雾 蔚蓝 潮蓝 北辰 山海 月海 霜蓝 晨海 碧霄 深空 星蓝 澄空 雨霁 蓝玉 苍穹 远帆 海天 云帆'.split(' '),
 purple:'暮山 桔梗 紫藤 鸢尾 星紫 丁香 烟紫 云紫 紫晶 紫罗 兰庭 薰衣 绛紫 紫苑 藕荷 紫烟 幽兰 夜紫 紫岚 苍紫 莓紫 紫霞 墨紫 紫玉 琉紫 云锦 紫陌 晨紫 绒紫 紫穗'.split(' '),
 pink:'樱粉 桃夭 玫瑰 藕粉 莓果 蔷薇 浅樱 桃花 芙蓉 粉黛 海棠 朝樱 桃雪 胭粉 雾玫 莲粉 梅影 霞粉 玫露 藕丝 粉锦 樱露 杏粉 浅绯 蔷露 桃月 梅雪 莓雪 花信 春樱'.split(' '),
 brown:'檀香 栗木 可可 胡桃 茶褐 秋木 咖啡 焦糖 砂岩 陶棕 燕麦 橡木 栗壳 枫糖 沙丘 乌木 茶岩 麦咖 栗香 深茶 暖棕 松栗 檀木 榛果 棕榈 泥金 赤褐 棕石 茶棕 麦棕'.split(' '),
 neutral:'银灰 岩白 云灰 石墨 墨白 雾银 霜石 月影 素墨 炭灰 石白 烟灰 岩墨 铅白 墨砚 静灰 银岩 素纸 磐石 云墨 玄青 米灰 冷石 素岩 灰阶 墨影 砚石 瓷白 雾石 霜灰'.split(' ')
};
const phrases:Record<ColorFamily,string[]>={red:['朱红点睛','绯色明快','丹霞映雪','暖红含光','绛色雅致','赤陶温润','海棠微红','红枫映白','胭脂入画','锦色生辉'],orange:['橘光明快','暖橙映雪','秋意澄明','杏色温润','夕照留光','橙香入画','暖陶雅致','金橘生辉','落日余温','秋实盈庭'],yellow:['暖金点睛','麦色温润','金桂飘香','秋光映雪','浅金留白','日色清朗','金穗含光','杏仁暖意','金菊映窗','流金入画'],green:['草木清新','竹影疏朗','翠色生机','松林静谧','茶意清雅','绿野清朗','碧叶含光','青禾映雪','苔青入画','春山明净'],cyan:['碧水澄明','青汐轻盈','湖光映雪','海风清朗','碧波舒展','青石温润','水色清雅','潮声入画','晴川含光','碧海明净'],blue:['澄澈蓝意','远山清朗','海蓝沉静','靛色雅致','晴空映雪','星河疏朗','蔚蓝含光','霜蓝明净','云海入画','蓝墨映白'],purple:['暮紫含光','紫藤清雅','鸢尾雅致','淡紫舒展','兰色宁静','紫韵入画','烟紫温润','星紫明净','紫霞映雪','幽兰疏朗'],pink:['樱粉轻盈','桃色温润','玫瑰雅致','浅樱映雪','藕粉清雅','莓色含光','蔷薇入画','粉黛柔美','花色明净','春樱舒展'],brown:['檀色温润','栗木沉静','茶褐清雅','可可暖意','砂岩疏朗','焦糖含光','秋木雅致','陶棕入画','麦色柔和','胡桃明净'],neutral:['素白留境','银灰清雅','石墨沉静','云灰明净','墨白有序','霜石疏朗','素色雅致','灰阶克制','岩色温润','雾银含光']};
const endings=['清爽留白','层次舒展','沉静有序'];
const pool=[...new Map([...popular,...Object.values(categories).flat()].map(x=>[x.code,x])).values()];
const records:any[]=[];const globalKeys=new Set<string>();
const paletteKey=(c:any)=>[c.primary,c.background,c.sidebar,c.sidebar_style].join('/').toLowerCase();
for(const family of colorFamilies){
 const candidates:any[]=[];
 for(const source of pool){
  const seeds=source.colors.filter(h=>classifyColorFamily(h)===family.id||(family.id==='brown'&&classifyColorFamily(h)==='orange'&&saturation(h)<.65));
  for(const seed of seeds){if(colorBrightness(seed)<(family.id==='neutral'?.003:.035))continue;if(family.id!=='neutral'&&saturation(seed)<(family.id==='brown'?.28:.4))continue;
   const primary=accent(seed),rank=Number(source.likes.replaceAll(',',''));
   // 同一来源完整保留四色关系，页面只作白底适配；不跨色板随机拼凑。
   const sorted=[...source.colors].sort((a,b)=>colorBrightness(b)-colorBrightness(a));
   const background=pale(sorted[0]);
   const companion=source.colors.filter(h=>h!==seed).sort((a,b)=>saturation(a)-saturation(b))[0]||seed;
   for(const style of ['light','tinted','dark'] as const){
    let sidebar=style==='light'?mix(background,companion,.22):style==='tinted'?mix(background,companion,.30):mix('#141d29',sorted[3],.32);
    if(style!=='dark'){for(let i=0;i<100&&colorBrightness(sidebar)>colorBrightness(background)-.07;i++)sidebar=mix(sidebar,seed,.03);}
    candidates.push({primary,background,sidebar,sidebar_style:style,palette_version:3,source:{label:'Color Hunt',url:`https://colorhunt.co/palette/${source.code}`,colors:source.colors,likes:rank,observed_at:'2026-11-07',adaptation:'TinyBot界面角色色适配；收藏量属于原始色板'},rank});
   }
  }
 }
 // 优先高收藏的参考；按完整三色排除近似克隆，不以极端颜色放大差异。
 candidates.sort((a,b)=>b.rank-a.rank);
 const chosen:any[]=[];
 const used=new Set<string>();
 const dist=(a:any,b:any)=>Math.sqrt(['primary','background','sidebar'].reduce((sum,k)=>sum+rgb(a[k]).reduce((s,v,i)=>s+(v-rgb(b[k])[i])**2,0),0)/9);
 for(let i=0;i<30;i++){
  const style=['dark','light','tinted'][i%3];
  let candidate=candidates.find(c=>!globalKeys.has(paletteKey(c))&&c.sidebar_style===style&&!used.has(c.source.url)&&chosen.every(p=>dist(c,p)>=13));
  if(!candidate)candidate=candidates.find(c=>!globalKeys.has(paletteKey(c))&&c.sidebar_style===style&&chosen.every(p=>dist(c,p)>=10));
  if(!candidate)candidate=candidates.find(c=>!globalKeys.has(paletteKey(c))&&chosen.every(p=>dist(c,p)>=10));
  if(!candidate)throw new Error(`不足30套可分辨参考配方: ${family.id}/${i}`);
  chosen.push(candidate);globalKeys.add(paletteKey(candidate));used.add(candidate.source.url);
 }
 chosen.forEach((c,i)=>{const isJilan=family.id==='blue'&&i===0;const palette=isJilan?{primary:'#1E5A8F',background:'#F1F4F7',sidebar:'#162635',sidebar_style:'dark',palette_version:3}:{primary:c.primary,background:c.background,sidebar:c.sidebar,sidebar_style:c.sidebar_style,palette_version:3};records.push({id:isJilan?'jilan':`curated-${family.id}-${String(i+1).padStart(2,'0')}`,name:themeNames[family.id][i],description:isJilan?'澄澈蓝意，沉静有序':phrases[family.id][i%10]+'，'+endings[['light','tinted','dark'].indexOf(c.sidebar_style)],color_family:family.id,palette,source:isJilan?{label:'TinyBot霁蓝',url:'https://ant.design/docs/spec/colors-cn/',colors:['#1E5A8F','#F1F4F7','#162635'],adaptation:'保留TinyBot既有默认主题；Ant Design用于层级规范参考'}:c.source});});
}
// 首屏主推按完整色板逐套适配，避免默认霁蓝占位挤掉最具代表性的热门蓝色。
const featured=[
 {id:'curated-blue-02',code:'f9f7f7dbe2ef3f72af112d4e',primary:'#3F72AF',background:'#F9F7F7',sidebar:'#DBE2EF',style:'light',description:'远海澄蓝，素白相映'},
 {id:'curated-red-01',code:'a14646da6556eb895bfdb773',primary:'#A14646',background:'#FFF8F0',sidebar:'#36272C',style:'dark',description:'朱红映雪，暖意从容'},
 {id:'curated-green-01',code:'edf1d69dc08b60996640513b',primary:'#477443',background:'#FBFCF5',sidebar:'#40513B',style:'dark',description:'草木青绿，素白相映'},
 {id:'curated-pink-01',code:'f67280c06c846c5b7b355c7d',primary:'#A34C69',background:'#FDF6F8',sidebar:'#EAD7DF',style:'tinted',description:'玫瑰含光，柔白相衬'}
];
for(const f of featured){const row=records.find(x=>x.id===f.id),ref=pool.find(x=>x.code===f.code);if(!ref)throw Error('主推缺少来源:'+f.code);row.description=f.description;row.palette={primary:f.primary,background:f.background,sidebar:f.sidebar,sidebar_style:f.style,palette_version:3};row.source={label:'Color Hunt',url:'https://colorhunt.co/palette/'+ref.code,colors:ref.colors,likes:Number(ref.likes.replaceAll(',','')),observed_at:'2026-11-07',adaptation:'TinyBot首屏精选；原始四色按后台用途适配，收藏量属于原始色板'};}
writeFileSync(new URL('../src/vendor/theme_combinations.json',import.meta.url),JSON.stringify(records,null,2)+'\n');
console.log(`已整理${records.length}套来源可追溯的候选主题。`);
