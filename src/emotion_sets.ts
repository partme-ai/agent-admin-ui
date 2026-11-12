import {grokForEmotion,grokExpressions} from './grok_expressions.ts';
import catalog from './emotion_catalog.json' with {type:'json'};
import {defaultCharacter,parseCharacter,type CharacterConfig} from './character_config.ts';
import {validateEmotionStyle,type EmotionStyle} from './emotion_style.ts';
export const emotions=catalog.entries;
export const excludedEmotions=catalog.excluded;
export const emotionStorageKey='tinybot.emotion-sets.v1';
export type EmotionSet={kind:'tinybot-emotion-set';version:1;catalog_version:'18.0';id:string;name:string;character:CharacterConfig;recipes:Record<string,EmotionStyle>};
const deepFreeze=(o:object)=>{Object.freeze(o);for(const v of Object.values(o))if(v&&typeof v==='object'&&!Object.isFrozen(v))deepFreeze(v);};
export const defaultEmotionSet:EmotionSet={kind:'tinybot-emotion-set',version:1,catalog_version:'18.0',id:'builtin-default',name:'TinyBot · 简约情绪',character:{...defaultCharacter(),pack:'grok',name:'TinyBot',color:'blue',shape:'blob'},recipes:Object.fromEntries(emotions.map(e=>[e.id,validateEmotionStyle({...e.recipe,grok_expression:grokForEmotion(e.emoji,e.category),mouth:'none',motif:'face',effect:['tear','tears','sweat','blush','hearts','sparkle','sleep'].includes(e.recipe.effect)?e.recipe.effect:'none'})]))};
deepFreeze(defaultEmotionSet);
/** 复制为独立资产，永远不修改只读默认套装。 */
export function cloneEmotionSet(source:EmotionSet,id=crypto.randomUUID()):EmotionSet{return {...structuredClone(source),id,name:`${source.name} · 副本`.slice(0,60)};}
/** 严格校验完整清单、版本及样式，未知字段不能悄悄丢失。 */
export function parseEmotionSet(json:string):EmotionSet{
 if(json.length>600000)throw Error('套装文件超过600KB。');const v=JSON.parse(json);
 const keys=['kind','version','catalog_version','id','name','character','recipes'];
 if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!(k in v))||v.kind!=='tinybot-emotion-set'||v.version!==1||v.catalog_version!=='18.0')throw Error('套装格式或版本不受支持。');
 if(typeof v.id!=='string'||!/^[\w-]{1,80}$/.test(v.id)||typeof v.name!=='string'||!v.name.trim()||v.name.length>60)throw Error('请填写1–60字的套装名称。');
 const character=parseCharacter(JSON.stringify(v.character));if(character.pack!=='grok'||character.emotion)throw Error('套装基础造型必须是可定制角色，不包含单项情绪。');
 if(!v.recipes||typeof v.recipes!=='object'||Array.isArray(v.recipes)||Object.keys(v.recipes).length!==emotions.length||emotions.some(e=>!Object.hasOwn(v.recipes,e.id)))throw Error('套装必须完整包含152项情绪。');
 const recipes=Object.fromEntries(emotions.map(e=>[e.id,validateEmotionStyle(v.recipes[e.id])]));
 return {...v,name:v.name.trim(),character,recipes};
}
type Storage=Pick<globalThis.Storage,'getItem'|'setItem'>;
export function readEmotionSets(storage:Pick<Storage,'getItem'>):EmotionSet[]{
 const raw=storage.getItem(emotionStorageKey);if(!raw)return [];
 const list=JSON.parse(raw);if(!Array.isArray(list)||list.length>20)throw Error('本机套装数据无法读取。');
 const parsed=list.map(v=>parseEmotionSet(JSON.stringify(v)));if(parsed.some(p=>p.id==='builtin-default')||new Set(parsed.map(p=>p.id)).size!==parsed.length)throw Error('本机套装ID冲突。');return parsed;
}
/** 先读取旧数据；损坏时拒绝覆盖，以便用户恢复。 */
export function writeEmotionSets(storage:Storage,list:EmotionSet[]):void{
 readEmotionSets(storage);if(list.length>20)throw Error('最多保存20套，请先导出备份或删除旧套装。');
 if(list.some(p=>p.id==='builtin-default')||new Set(list.map(p=>p.id)).size!==list.length)throw Error('不能覆盖内置套装，或存在重复ID。');
 const checked=list.map(v=>parseEmotionSet(JSON.stringify(v)));storage.setItem(emotionStorageKey,JSON.stringify(checked));
}
export function emotionCharacter(set:EmotionSet,id:string):CharacterConfig{
 const style=set.recipes[id]||set.recipes[emotions[0].id],state=grokExpressions.find(e=>e.id===style.grok_expression)?.state;
 return {...structuredClone(set.character),...(state?{state}:{}),emotion:structuredClone(set.recipes[id]||set.recipes[emotions[0].id]),emotion_id:id,emotion_set_id:set.id};
}
/** 运行状态优先；闲置显示所选情绪，回答阶段使用同一套装的语义映射。 */
export function trialEmotionCharacter(character:CharacterConfig,phase:string,mood:string,sets:EmotionSet[]):CharacterConfig{
 if(!character.emotion&&!character.emotion_set_id)return character;
 if(['listening','thinking'].includes(phase))return {...character,emotion:undefined};
 if(phase!=='speaking')return character;
 const emoji=({happy:'😊',sad:'😢',scared:'😨',grumpy:'😠',grateful:'🥰',greeting:'😀'} as Record<string,string>)[mood];
 const set=sets.find(s=>s.id===character.emotion_set_id),entry=emotions.find(e=>e.emoji===emoji);
 return set&&entry?{...character,emotion:structuredClone(set.recipes[entry.id])}:character;
}
