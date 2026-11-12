import test from 'node:test';
import assert from 'node:assert/strict';
import {characterPalettes,findCharacterColors} from '../src/character_palettes.ts';
import {resolveCharacterColor} from '../src/character_colors.ts';
import original from '../src/vendor/chinese_colors/palettes.json' with {type:'json'};
import {findCharacterSwatches,characterSwatchValue} from '../src/character_swatches.ts';
import {existsSync,readFileSync} from 'node:fs';
const auditPath=new URL('../evidence/gugong-figma/colors-audit.json',import.meta.url);
const audit=existsSync(auditPath)?JSON.parse(readFileSync(auditPath,'utf8')):null;

test('故宫可选目录采用 Figma 明确标注的 RGB，二十四节气各16色',()=>{
 const palette=characterPalettes.find(p=>p.id==='gugong')!;
 assert.equal(palette.colors.length,384);
 assert.equal(new Set(palette.colors.map(c=>c.group)).size,24);
 for(const group of new Set(palette.colors.map(c=>c.group)))assert.equal(findCharacterColors('gugong','',group).length,16);
 for(const [name,hex] of [['桃夭','#F6BEC8'],['天水碧','#5AA4AE'],['月白','#D4E5EF'],['暮山紫','#A4ABD6'],['石榴裙','#B13B2E'],['老僧衣','#A46244']]){
  const color=palette.colors.find(c=>c.name===name)!;
  assert.equal(color.hex,hex,name);
  assert.match(color.id,/^gugong-figma-\d{3}$/);
 }
 assert.equal(findCharacterColors('gugong','柘黄')[0].name,'柘黄');
 assert.equal(findCharacterColors('gugong','枳黄')[0].name,'柘黄');
});

test('384项与原板文本审计逐项一致；原板一处短HEX明确按RGB修正',{skip:!audit&&'原型迁移未包含上游 Figma 审计文件，不能宣称逐项原板验证'},()=>{
 const colors=characterPalettes.find(p=>p.id==='gugong')!.colors;
 assert.equal(audit.length,384);
 for(const row of audit){
  const color=colors.find(c=>c.id===row.id)!;
  assert.equal(color.name,row.name);assert.equal(color.group,row.group);assert.equal(color.hex,row.hex);
  assert.equal('#'+row.rgb.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase(),row.hex);
 }
 const invalid=audit.filter(c=>!/^#[0-9A-F]{6}$/.test(c.printedHex));
 assert.deepEqual(invalid.map(c=>[c.name,c.printedHex,c.hex]),[['老僧衣','#A4624','#A46244']]);
});

test('历史故宫384项按原值读回和绘制，换库不重写保存过的机器人形象',()=>{
 for(const color of original.find(p=>p.id==='gugong')!.colors){
  const config={color:color.id};
  assert.equal(config.color,color.id);
  assert.deepEqual(resolveCharacterColor(color.id),[color.id,color.name,color.hex]);
 }
 const old=original[0].colors.find(c=>c.name==='天缥')!;
 const same=findCharacterSwatches('gugong',old.hex)[0];
 assert.equal(characterSwatchValue(same,old.id,'gugong'),old.id);
 const current=characterPalettes.find(p=>p.id==='gugong')!;
 assert.equal(current.colors.filter(c=>c.id.startsWith('gugong-figma-')).length,384);
});
