import {defaultCharacter,normalizeCharacter,characterStates,characterParts,characterAccessories,type CharacterConfig} from './character_config.ts';
import {grokExpressions,grokPool} from './grok_expressions.ts';
import {legacyFaceAliases,legacyFaceMappings} from './legacy_expression_mapping.ts';
/** 独立可编辑草稿；内置定义始终不被覆盖。 */
export function labDefault():CharacterConfig{return {...defaultCharacter(),pack:'grok',name:'我的机器人'};}
function clearEmotion(c:CharacterConfig):CharacterConfig{const {emotion:_,emotion_id:__,emotion_set_id:___,...rest}=c;return structuredClone(rest);}
export function labChooseExpression(c:CharacterConfig,index:number):CharacterConfig{
 if(!Number.isInteger(index)||!grokExpressions[index])throw Error('无效的表情');return {...clearEmotion(labCharacter(c)),expression:index,state:grokExpressions[index].state,action:'none'};
}
export function labChooseState(c:CharacterConfig,state:string):CharacterConfig{
 if(!characterStates.some(s=>s.id===state))throw Error('无效的状态');return {...clearEmotion(labCharacter(c)),state,expression:-1,action:'none'};
}
export function labToggle(c:CharacterConfig,field:'parts'|'accessories',id:string):CharacterConfig{
 if(!(field==='parts'?characterParts:characterAccessories).some(p=>p[0]===id))throw Error('无效的部件或配饰');return normalizeCharacter({...c,[field]:c[field].includes(id)?c[field].filter(x=>x!==id):[...c[field],id]});
}
export function labPage<T>(list:T[],requested:number,size:number):{items:T[];page:number;pages:number}{
 const pages=Math.max(1,Math.ceil(list.length/size)),page=Math.max(1,Math.min(pages,requested));return {items:list.slice((page-1)*size,page*size),page,pages};
}

/** 保留已有眼型的稳定编号，清理旧Emoji前景，不回写原资产。 */
export function labCharacter(input?:unknown):CharacterConfig{
 const c=normalizeCharacter(input);
 const style=c.emotion?.grok_expression,index=style?grokExpressions.findIndex(e=>e.id===style):c.expression,state=style&&index>=25?grokExpressions[index]?.state||c.state:c.state;
 const expression=index>=0?index:c.expression;
 return {...clearEmotion(c),state,expression};
}

/** 库内筛选只影响展示，始终携带原始索引；优先展示扩展以便直接发现新增能力。 */
export function labExpressions({source='all',group='all',query=''}:{source?:string;group?:string;query?:string}={}){
 const needle=query.trim().toLowerCase();return grokExpressions.map((e,index)=>{const aliases=[...legacyFaceAliases(e.id),...(e.origin==='upstream'?[e.id,`原版 ${String(index).padStart(2,'0')}`,`原版${String(index).padStart(2,'0')}`]:[])],legacyMatch=needle?legacyFaceMappings.find(x=>x.grokId===e.id&&(x.id.toLowerCase()===needle||x.name.toLowerCase()===needle)):undefined;return {...e,index,aliases,legacyMatch};}).filter(e=>(source==='all'||e.origin===source)&&(group==='all'||e.group===group)&&`${e.name} ${e.id} ${e.emoji} ${e.aliases.join(' ')}`.toLowerCase().includes(needle)).sort((a,b)=>Number(b.origin==='tinybot')-Number(a.origin==='tinybot')||a.index-b.index);
}

/** 旧语义ID只选择新轮廓及视觉动作；名称、颜色和身体配置保持不变。 */
export function legacyExpressionCharacter(input:CharacterConfig,id:string):CharacterConfig{
 const mapping=legacyFaceMappings.find(x=>x.id===id);if(!mapping)throw Error('没有对应的新表情');
 return {...clearEmotion(labCharacter(input)),expression:grokExpressions.findIndex(x=>x.id===mapping.grokId),state:mapping.state,action:mapping.action};
}

/** 试聊形象草稿统一使用新体系，兼容读取不写回原角色。 */
export function trialCharacterDraft(input?:unknown):CharacterConfig{
 return structuredClone(labCharacter(input));
}
