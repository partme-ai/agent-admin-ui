import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultCharacter,normalizeCharacter,parseCharacter,characterData} from '../src/character_config.ts';
import {labDefault,labChooseExpression,labCharacter} from '../src/grok_customizer.ts';
import {grokExpressions} from '../src/grok_expressions.ts';
import {sceneSvg} from '../src/character_scene.ts';
import {saveCharacterPreset,readCharacterPresets} from '../src/character_presets.ts';

test('新建与恢复默认均为满怀期待，旧形象及手选表情保持原值',()=>{
 for(const c of [defaultCharacter(),labDefault()]){assert.equal(c.state,'curious');assert.equal(grokExpressions[c.expression].name,'满怀期待');}
 const old={...labDefault(),color:'purple',state:'excited',expression:27};assert.deepEqual(labCharacter(old),old);
 assert.equal(labChooseExpression(old,40).expression,40);
});

test('扩展32种颜色不修改上游10色，新增预设与自定义HEX可完整保存和渲染',async()=>{
 const {characterColors,resolveCharacterColor}=await import('../src/character_colors.ts');
 assert.equal(characterColors.length,32);assert.deepEqual(characterColors.slice(0,10),characterData.COLORS);
 assert.equal(new Set(characterColors.map(c=>c[0])).size,32);
 for(const color of [...characterColors.map(c=>c[0]),'#12AbCD']){
  const c={...labDefault(),color},parsed=parseCharacter(JSON.stringify(c));assert.equal(parsed.color,color);
  assert.ok(sceneSvg(parsed,0,{reduce:true}).includes(`fill="${resolveCharacterColor(color)[2]}"`));
 }
 const map=new Map<string,string>(),storage={getItem:(k:string)=>map.get(k)||null,setItem:(k:string,v:string)=>{map.set(k,v);}};
 saveCharacterPreset(storage,{id:'custom',name:'定制色',config:{...labDefault(),color:'#12AbCD'}});
 assert.equal(readCharacterPresets(storage)[0].config.color,'#12AbCD');
});

test('只接受六位不透明HEX，拒绝脚本、渐变、透明色；浅色身体眼睛保持清晰',async()=>{
 const {characterEyeColor}=await import('../src/character_colors.ts');
 for(const color of ['url(javascript:x)','#fff','#12345678','transparent','linear-gradient(red,blue)']){
  assert.equal(normalizeCharacter({...labDefault(),color}).color,'blue');assert.throws(()=>parseCharacter(JSON.stringify({...labDefault(),color})));
 }
 assert.equal(characterEyeColor('#FFFFFF'),'#202b30');assert.equal(characterEyeColor('black'),'#edf4f1');
 assert.ok(sceneSvg({...labDefault(),color:'#FFFFFF'},0,{reduce:true}).includes('fill="#202b30"'));
});
