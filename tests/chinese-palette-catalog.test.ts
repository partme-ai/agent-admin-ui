import test from 'node:test';
import assert from 'node:assert/strict';
import {characterPalettes,characterPaletteLabels,chinesePaletteLibraries} from '../src/character_palettes.ts';
import {characterSwatchPalettes,findCharacterSwatches,characterSwatchValue,characterSwatchLabel} from '../src/character_swatches.ts';
import original from '../src/vendor/chinese_colors/palettes.json' with {type:'json'};
import {defaultCharacter,parseCharacter} from '../src/character_config.ts';
import {resolveCharacterColor} from '../src/character_colors.ts';
import {sceneSvg} from '../src/character_scene.ts';

test('中国色分为独立742色与故宫384色，旧158色不再混入可选目录',()=>{
 assert.deepEqual(chinesePaletteLibraries.map(p=>[p.id,p.colors.length]),[['traditional',742],['gugong',384]]);
 assert.equal(characterPaletteLabels.traditional,'中国传统色');
 assert.equal(characterPaletteLabels.gugong,'中国传统色 · 故宫');
 assert.equal(characterPalettes.find(p=>p.id==='traditional')!.colors.length,742);
 assert.equal(characterSwatchPalettes.find(p=>p.id==='traditional')!.count,742);
 assert.equal(characterSwatchPalettes.find(p=>p.id==='gugong')!.count,384);
 assert.equal(characterPalettes.flatMap(p=>p.colors).filter(c=>/^traditional-\d/.test(c.id)).length,0);
 assert.deepEqual(characterSwatchPalettes.filter(p=>['traditional','gugong'].includes(p.id)).map(p=>p.id),['traditional','gugong']);
 const canonical=findCharacterSwatches('traditional');assert.equal(characterSwatchLabel(canonical[0],'traditional'),'乳白');assert.equal(characterSwatchLabel(canonical.at(-1)!,'traditional'),'深绿');
 assert.equal(findCharacterSwatches('traditional','','红色系').length,196);
 assert.equal(findCharacterSwatches('gugong','','立春').length,16);
});

test('历史158项仍可完整读回绘制，不能静默改成同名但不同HEX的新值',()=>{
 for(const color of original.find(p=>p.id==='traditional')!.colors){
  const config=parseCharacter(JSON.stringify({...defaultCharacter(),color:color.id}));
  assert.equal(config.color,color.id);assert.deepEqual(resolveCharacterColor(color.id),[color.id,color.name,color.hex]);
  assert.ok(sceneSvg(config,0,{reduce:true}).includes(`fill="${color.hex}"`));
 }
 const black=findCharacterSwatches('traditional','#000000')[0];
 assert.equal(characterSwatchValue(black,'traditional-145','traditional'),'traditional-145');
});
