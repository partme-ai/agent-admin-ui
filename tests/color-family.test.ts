import test from 'node:test';
import assert from 'node:assert/strict';
import {colorFamilies,classifyColorFamily} from '../src/color_family.ts';
import {characterColorSwatches,findCharacterSwatches,characterSwatchValue} from '../src/character_swatches.ts';

test('色系按实际HEX归类，覆盖常见彩色、棕色、粉色和黑白灰',()=>{
 const examples={red:'#ff0000',orange:'#ff8800',yellow:'#ffff00',green:'#00aa44',cyan:'#00dddd',blue:'#2255ee',purple:'#8833dd',pink:'#ff88bb',brown:'#7b4521',neutral:'#888888'};
 for(const [family,hex] of Object.entries(examples))assert.equal(classifyColorFamily(hex),family,hex);
 for(const hex of ['#000000','#ffffff','#f8f8f8'])assert.equal(classifyColorFamily(hex),'neutral');
 assert.throws(()=>classifyColorFamily('invalid'));
});

test('全部1518色恰好归属一个色系，分类筛选不丢色、不重复、不改变身份',()=>{
 const all=colorFamilies.flatMap(f=>findCharacterSwatches('all','','all','all',f.id));
 assert.equal(all.length,1518);assert.equal(new Set(all.map(c=>c.hex.toLowerCase())).size,1518);
 for(const family of colorFamilies){const list=findCharacterSwatches('all','','all','all',family.id);assert.ok(list.length);assert.ok(list.every(c=>classifyColorFamily(c.hex)===family.id));}
 for(const s of characterColorSwatches){const original=s.members[0].id;assert.equal(characterSwatchValue(s,original),original);}
});

test('色系可与色库、检索及故宫节气联合筛选，原有上游分类查询保持',()=>{
 const red=findCharacterSwatches('current','','all','all','red');assert.ok(red.length);assert.ok(red.every(c=>c.members.some(m=>m.paletteId==='current')));
 assert.ok(findCharacterSwatches('all','经典蓝','all','all','blue').length);
 assert.equal(findCharacterSwatches('all','经典蓝','all','all','red').length,0);
 const spring=findCharacterSwatches('gugong','','立春','all');
 assert.ok(spring.length>0);
 const split=colorFamilies.flatMap(f=>findCharacterSwatches('gugong','','立春','all',f.id));
 assert.deepEqual(split.map(c=>c.hex).sort(),spring.map(c=>c.hex).sort());
 for(const f of colorFamilies){const list=findCharacterSwatches('gugong','','立春','all',f.id);assert.ok(list.every(c=>spring.includes(c)));}
 assert.equal(findCharacterSwatches('traditional','','红色系','traditional742').length,196);
});

test('主题色卡按明度从浅到深排列，不改原数组和颜色对象',async()=>{
 const {sortColorsLightToDark,colorBrightness}=await import('../src/color_family.ts');
 const input=[{hex:'#000000',id:'black'},{hex:'#bb2222',id:'red'},{hex:'#ffffff',id:'white'},{hex:'#ffeeee',id:'pale'}],before=JSON.stringify(input);
 assert.deepEqual(sortColorsLightToDark(input).map(c=>c.id),['white','pale','red','black']);
 for(const palette of ['all','traditional','gugong']){
  const colors=findCharacterSwatches(palette,'',palette==='traditional'?'红色系':'all');
  const sorted=sortColorsLightToDark(colors);
  assert.equal(sorted.length,colors.length);
  assert.deepEqual(new Set(sorted),new Set(colors));
  for(let i=1;i<sorted.length;i++)assert.ok(colorBrightness(sorted[i-1].hex)>=colorBrightness(sorted[i].hex));
 }
 assert.equal(JSON.stringify(input),before);
});
