import {parseCharacter,type CharacterConfig} from './character_config.ts';
export type CharacterPreset={id:string;name:string;config:CharacterConfig};
type KeyValue={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
export const characterPresetKey='tinybot.character-presets.v1';
/** 形象预设独立存储，不接触登录、模型密钥和其他工作区数据。 */
export function readCharacterPresets(storage:KeyValue):CharacterPreset[]{
 const raw=storage.getItem(characterPresetKey);if(!raw)return [];if(raw.length>1024*1024)throw Error('本地形象预设数据过大，请先导出备份。');const list=JSON.parse(raw);
 if(!Array.isArray(list)||list.length>20)throw Error('本地形象预设格式不正确。');
 return list.map(p=>{if(typeof p?.id!=='string'||typeof p?.name!=='string')throw Error('本地形象预设格式不正确。');return {id:p.id,name:p.name,config:parseCharacter(JSON.stringify(p.config))};});
}
export function saveCharacterPreset(storage:KeyValue,preset:CharacterPreset){const list=readCharacterPresets(storage);if(list.some(p=>p.id!==preset.id&&p.name===preset.name))throw Error('已有同名预设，请使用其他名称。');const next=[preset,...list.filter(p=>p.id!==preset.id)];if(next.length>20)throw Error('最多保存20套预设，请先导出已有配置。');storage.setItem(characterPresetKey,JSON.stringify(next));return next;}
