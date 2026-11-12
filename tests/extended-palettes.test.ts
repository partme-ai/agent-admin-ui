import test from 'node:test';
import assert from 'node:assert/strict';
import {characterPalettes,findCharacterColors} from '../src/character_palettes.ts';
import {resolveCharacterColor} from '../src/character_colors.ts';
import {defaultCharacter,parseCharacter} from '../src/character_config.ts';
import {sceneSvg} from '../src/character_scene.ts';

test('四类扩展配色完整保留；统一目录的所有可选色号身份独立',()=>{
 for(const [id,count] of [['morandi',15],['international',131],['pantone',42],['ral',183]] as const){
  const p=characterPalettes.find(p=>p.id===id);assert.ok(p,`${id}目录存在`);assert.equal(p.colors.length,count);
  for(const c of p.colors){assert.match(c.hex,/^#[0-9a-f]{6}$/i);assert.ok(c.name);assert.ok(c.group);}
 }
 const all=characterPalettes.flatMap(p=>p.colors);assert.equal(all.length,1529);assert.equal(new Set(all.map(c=>c.id)).size,1529);
 assert.deepEqual(characterPalettes.slice(0,3).map(p=>p.colors.length),[32,384,742]);
});

test('支持中文、英文与工业色号检索；明确近似参考，不将番红花紫误标为绿色',()=>{
 assert.equal(findCharacterColors('morandi','干枯玫瑰色')[0]?.name,'干枯玫瑰色');
 assert.equal(findCharacterColors('international','seafoam')[0]?.name,'海沫绿');
 assert.equal(findCharacterColors('ral','RAL 5002')[0]?.name,'群青蓝');
 assert.equal(findCharacterColors('pantone','19-4052')[0]?.hex.toLowerCase(),'#0f4c81');
 const crocus=findCharacterColors('pantone','crocus')[0];assert.equal(crocus.name,'番红花紫');assert.equal(crocus.hex.toLowerCase(),'#c67fae');
 assert.equal(findCharacterColors('pantone','Salted Lime')[0]?.reference,'curated');
});

test('新增371项可直接选用、导入及统一渲染，旧默认表情不受影响',()=>{
 const extra=characterPalettes.slice(3).flatMap(p=>p.colors);assert.equal(extra.length,371);
 for(const color of extra){
  const config=parseCharacter(JSON.stringify({...defaultCharacter(),color:color.id}));
  assert.deepEqual(resolveCharacterColor(config.color),[color.id,color.name,color.hex]);
  assert.ok(sceneSvg(config,0,{reduce:true}).includes(`fill="${color.hex}"`));
 }
 assert.equal(defaultCharacter().color,'blue');
});
