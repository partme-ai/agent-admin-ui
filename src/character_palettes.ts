import chinesePalettes from './vendor/chinese_colors/palettes.json' with {type:'json'};
import extendedPalettes from './vendor/extended_colors/palettes.json' with {type:'json'};
import traditional742 from './vendor/traditional_742/colors.json' with {type:'json'};
import gugongFigma from './vendor/chinese_colors/gugong_figma.json' with {type:'json'};
import {characterColors} from './character_colors.ts';

/** 原始颜色身份：展示层合并不会删除条目或重写已有配置 ID。 */
export type CharacterColor={id:string;name:string;hex:string;group:string;aliases?:string[];code?:string;reference?:string;sourceId?:string;sourceName?:string;sourceUrl?:string};
export type CharacterPaletteDefinition={id:string;name:string;description?:string;colors:CharacterColor[]};
/** 用户界面的色库名称；原来源名称继续保留在数据与检索别名中。 */
export const characterPaletteLabels:Record<string,string>={
 all:'全部颜色',current:'基础配色',gugong:'中国传统色 · 故宫',traditional:'中国传统色',
 morandi:'莫兰迪色系',international:'国际常用色',pantone:'Pantone 配色',ral:'RAL 经典色'
};
/** 身体配色目录，保留当前配色供用户比较。 */
export const characterPalettes:CharacterPaletteDefinition[]=[
 {id:'current',name:'现有配色',colors:characterColors.map(([id,name,hex])=>({id,name,hex,group:'现有配色'}))},
 ...chinesePalettes.map(p=>p.id==='traditional'?{...p,colors:traditional742}:p.id==='gugong'?gugongFigma:p),...extendedPalettes
];
/** 旧故宫色号固定原值；新版目录独立命名，不迁移已保存的机器人颜色。 */
export const legacyGugongColors:CharacterColor[]=chinesePalettes.find(p=>p.id==='gugong')!.colors.map(c=>({...c,sourceId:'gugong-legacy',sourceName:'历史故宫合并色谱'}));
/** 历史158色仅用于配置兼容及同HEX别名，不再成为可选目录。 */
export const legacyTraditionalColors:CharacterColor[]=chinesePalettes.find(p=>p.id==='traditional')!.colors.map(c=>({...c,sourceId:'traditional158',sourceName:'历史传统色 · 158 色'}));
/** 系统主题定制与机器人选色使用同一组中国色目录。 */
export const chinesePaletteLibraries=['traditional','gugong'].map(id=>characterPalettes.find(p=>p.id===id)!);
/** 按色名、HEX 或分组筛选；空查询保留当前色谱的全部颜色。 */
export function findCharacterColors(paletteId:string,query='',group='all'):CharacterColor[]{
 const q=query.trim().toLocaleLowerCase();
 return (characterPalettes.find(p=>p.id===paletteId)?.colors||[]).filter(c=>(group==='all'||c.group===group)&&(!q||(/^\d{3}$/.test(q)?c.code===q:`${c.name} ${c.hex} ${c.group} ${c.code||''} ${c.sourceName||''} ${(c.aliases||[]).join(' ')}`.toLocaleLowerCase().includes(q))));
}
