import {classifyColorFamily,type ColorFamily} from './color_family.ts';
import {characterPalettes,characterPaletteLabels,legacyTraditionalColors,legacyGugongColors,type CharacterColor} from './character_palettes.ts';
import {isCharacterColor,resolveCharacterColor} from './character_colors.ts';

/** 展示别名保留原始颜色 ID、中文名、色系、英文名和所属色库。 */
export type CharacterColorMember=CharacterColor&{paletteId:string;paletteName:string};
/** 一个 HEX 对应一个展示色块；成员仍使用原始配置 ID。 */
export type CharacterSwatch=CharacterColor&{members:CharacterColorMember[]};

const byHex=new Map<string,CharacterSwatch>();
for(const palette of characterPalettes)for(const color of palette.colors){
 const key=color.hex.toLowerCase(),member={...color,paletteId:palette.id,paletteName:palette.name};
 const existing=byHex.get(key);
 if(existing)existing.members.push(member);
 else byHex.set(key,{...color,members:[member]});
}
/** 历史同HEX名称仍可追溯；不为只有历史来源的色值新增可选色块。 */
for(const color of legacyTraditionalColors){const swatch=byHex.get(color.hex.toLowerCase());if(swatch)swatch.members.push({...color,paletteId:'legacy-traditional',paletteName:'中国传统色'});}
for(const color of legacyGugongColors){const swatch=byHex.get(color.hex.toLowerCase());if(swatch)swatch.members.push({...color,paletteId:'legacy-gugong',paletteName:'历史故宫合并色谱'});}
/** 只合并展示数据，不修改源色库、已保存形象或颜色解析目录。 */
export const characterColorSwatches=[...byHex.values()];
export const characterSwatchPalettes=[
 {id:'all',name:'全部颜色',count:characterColorSwatches.length},
 ...characterPalettes.map(p=>({id:p.id,name:characterPaletteLabels[p.id]||p.name,count:characterColorSwatches.filter(s=>s.members.some(m=>m.paletteId===p.id)).length})).sort((a,b)=>['current','traditional','gugong','morandi','international','pantone','ral'].indexOf(a.id)-['current','traditional','gugong','morandi','international','pantone','ral'].indexOf(b.id))
];

/** 按来源和色系限制范围，再以全部原色名、英文名、色号及来源别名检索。 */
export function findCharacterSwatches(paletteId='all',query='',group='all',sourceId='all',family:ColorFamily|'all'='all'):CharacterSwatch[]{
 const q=query.trim().toLocaleLowerCase();
 const filtered=characterColorSwatches.filter(s=>(family==='all'||classifyColorFamily(s.hex)===family)&&s.members.some(m=>(paletteId==='all'||m.paletteId===paletteId)&&(group==='all'||m.group===group)&&(sourceId==='all'||m.sourceId===sourceId))&&(!q||s.members.some(m=>/^\d{3}$/.test(q)?m.code===q:`${m.name} ${m.hex} ${m.group} ${m.code||''} ${m.paletteName} ${m.sourceName||''} ${characterPaletteLabels[m.paletteId]||''} ${(m.aliases||[]).join(' ')}`.toLocaleLowerCase().includes(q))));
 if(paletteId==='all')return filtered;
 const order=new Map(characterPalettes.find(p=>p.id===paletteId)?.colors.map((c,i)=>[c.id,i])||[]);
 return filtered.sort((a,b)=>(order.get(a.members.find(m=>m.paletteId===paletteId)!.id)??0)-(order.get(b.members.find(m=>m.paletteId===paletteId)!.id)??0));
}

/** 同色重选保留旧 ID 或原 HEX；新选色优先使用当前色库的原始成员 ID。 */
export function characterSwatchValue(swatch:CharacterSwatch,currentValue:string,paletteId='all',sourceId='all'):string{
 if(isCharacterColor(currentValue)&&resolveCharacterColor(currentValue)[2].toLowerCase()===swatch.hex.toLowerCase())return currentValue;
 return (swatch.members.find(m=>m.paletteId===paletteId&&(sourceId==='all'||m.sourceId===sourceId))||swatch.members[0]).id;
}

/** 分类中使用该分类的标准色名；全部颜色仍保留合并名称，黑色统一命名。 */
export function characterSwatchLabel(swatch:CharacterSwatch,paletteId='all'):string{
 if(swatch.hex.toLowerCase()==='#000000')return '黑色';
 const scoped=paletteId==='all'?swatch.members:swatch.members.filter(m=>m.paletteId===paletteId);
 return [...new Set((scoped.length?scoped:swatch.members).map(m=>m.name))].join('／');
}
