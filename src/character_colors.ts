import data from './vendor/laoa_grokbot/data.json' with {type:'json'};
import chinesePalettes from './vendor/chinese_colors/palettes.json' with {type:'json'};
import extendedPalettes from './vendor/extended_colors/palettes.json' with {type:'json'};
import traditional742 from './vendor/traditional_742/colors.json' with {type:'json'};
import gugongFigma from './vendor/chinese_colors/gugong_figma.json' with {type:'json'};
/** 身体颜色目录：前十项沿用上游，扩展色不改动原始资产或颜色标识。 */
export const characterColors:string[][]=[...data.COLORS.map(c=>[...c]),
 ['ivory','象牙白','#f5f0df'],['silver','雾银','#b8c4cc'],['graphite','石墨灰','#46515c'],
 ['sand','沙杏','#d9b58b'],['caramel','焦糖','#b57745'],['chocolate','巧克力','#6b3f2a'],
 ['coral','珊瑚红','#f36c66'],['rose','玫瑰红','#cc3f70'],['burgundy','勃艮第红','#892f50'],
 ['peach','蜜桃','#ffb598'],['gold','日光金','#eac548'],['lemon','柠檬黄','#f4df67'],
 ['lime','青柠','#9dbd46'],['mint','薄荷绿','#8bd9b5'],['forest','森林绿','#31705a'],
 ['cyan','晴空青','#48c8de'],['ice','冰川蓝','#a3d8f0'],['cobalt','钴蓝','#3154b8'],
 ['navy','午夜蓝','#25395d'],['lavender','薰衣草','#b59bea'],['lilac','丁香紫','#d7b9e8'],['blush','樱花粉','#edb2c6']
];
const allColors=[...characterColors,...[...chinesePalettes,...extendedPalettes].flatMap(p=>p.colors.map(c=>[c.id,c.name,c.hex])),...traditional742.map(c=>[c.id,c.name,c.hex]),...gugongFigma.colors.map(c=>[c.id,c.name,c.hex])];
/** 导入和持久化仅接受已知标识或六位不透明 HEX。 */
export function isCharacterColor(value:unknown):value is string{return typeof value==='string'&&(allColors.some(c=>c[0]===value)||/^#[0-9a-f]{6}$/i.test(value));}
/** 返回颜色标识、中文名称与绘制色值；历史无效值回退为经典蓝。 */
export function resolveCharacterColor(value:string):string[]{return allColors.find(c=>c[0]===value)||(/^#[0-9a-f]{6}$/i.test(value)?[value,'自定义颜色',value]:characterColors.find(c=>c[0]==='blue')!);}
/** 浅色身体使用深色眼睛，常规和深色身体继续沿用 LaoA 的浅色双眼。 */
export function characterEyeColor(value:string):string{
 const hex=resolveCharacterColor(value)[2].slice(1),channels=[0,2,4].map(i=>{const c=parseInt(hex.slice(i,i+2),16)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
 return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722>.6?'#202b30':'#edf4f1';
}
