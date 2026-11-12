import test from 'node:test';
import assert from 'node:assert/strict';
import {characterPalettes,legacyTraditionalColors} from '../src/character_palettes.ts';
import {findCharacterSwatches,characterSwatchValue} from '../src/character_swatches.ts';
import {resolveCharacterColor} from '../src/character_colors.ts';
import {defaultCharacter,parseCharacter} from '../src/character_config.ts';
import {sceneSvg} from '../src/character_scene.ts';

test('完整接入001至742：全部八个上游色系，沿用原158项且不覆盖历史身份',()=>{
 const traditional=characterPalettes.find(p=>p.id==='traditional')!;
 const imported=traditional.colors.filter(c=>c.id.startsWith('traditional742-'));
 assert.equal(imported.length,742);
 assert.deepEqual(imported.map(c=>c.id),Array.from({length:742},(_,i)=>`traditional742-${String(i+1).padStart(3,'0')}`));
 assert.equal(new Set(imported.map(c=>c.hex.toLowerCase())).size,742);
 assert.deepEqual(Object.fromEntries([...new Set(imported.map(c=>c.group))].map(g=>[g,imported.filter(c=>c.group===g).length])),{'黄色系':63,'橙色系':183,'红色系':196,'紫色系':21,'蓝色系':95,'绿色系':64,'青色系':63,'中性色':57});
 assert.equal(legacyTraditionalColors.length,158);
 assert.equal(traditional.colors.length,742);
 assert.deepEqual(resolveCharacterColor('traditional742-001'),['traditional742-001','乳白','#F9F4DC']);
 assert.deepEqual(resolveCharacterColor('traditional742-742'),['traditional742-742','深绿','#0D5E3A']);
});

test('742项均可导入、解析和绘制；色名、拼音、编号和来源可检索',()=>{
 for(let i=1;i<=742;i++){
  const id=`traditional742-${String(i).padStart(3,'0')}`;
  const config=parseCharacter(JSON.stringify({...defaultCharacter(),color:id}));
  assert.equal(config.color,id);
  assert.ok(sceneSvg(config,0,{reduce:true}).includes(`fill="${resolveCharacterColor(id)[2]}"`));
 }
 assert.equal(findCharacterSwatches('traditional','742').length,1);
 assert.equal(findCharacterSwatches('traditional','742')[0].members.find(m=>m.id==='traditional742-742')?.name,'深绿');
 for(const q of ['乳白','rǔ bái','ru bai','中国传统配色','742'])assert.ok(findCharacterSwatches('traditional',q).some(s=>s.members.some(m=>m.id==='traditional742-001'||m.id==='traditional742-742')),q);
 const swatch=findCharacterSwatches('traditional','乳白').find(s=>s.members.some(m=>m.id==='traditional742-001'))!;
 assert.equal(characterSwatchValue(swatch,'traditional742-001','traditional'),'traditional742-001');
 assert.equal(characterSwatchValue(swatch,'#F9F4DC','traditional'),'#F9F4DC');
});

test('来源和色系联合筛选，选择来源优先使用其稳定ID，同色旧值不改写',()=>{
 assert.equal(findCharacterSwatches('traditional','','all','traditional742').length,742);
 assert.equal(findCharacterSwatches('traditional','','红色系','traditional742').length,196);
 assert.equal(findCharacterSwatches('traditional','','红色系','traditional158').length,0);
 assert.equal(findCharacterSwatches('traditional','','橙色系','traditional158').length,0);
 const black=findCharacterSwatches('traditional','#000000')[0];
 assert.equal(characterSwatchValue(black,'blue','traditional','traditional742'),'traditional742-529');
 assert.equal(characterSwatchValue(black,'black','traditional','traditional742'),'black');
 assert.equal(characterSwatchValue(black,'traditional-145','traditional','traditional742'),'traditional-145');
});
