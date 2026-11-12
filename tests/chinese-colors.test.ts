import test from 'node:test';
import assert from 'node:assert/strict';
import {characterPalettes,findCharacterColors,legacyTraditionalColors} from '../src/character_palettes.ts';
import {characterColors,resolveCharacterColor} from '../src/character_colors.ts';

test('现有32色与Figma故宫384色、传统158色兼容目录完整保留',()=>{
 const [current,gugong,traditional]=characterPalettes;
 assert.deepEqual(current.colors.map(c=>[c.id,c.name,c.hex]),characterColors);
 assert.equal(gugong.colors.length,384);assert.equal(legacyTraditionalColors.length,158);
 const colors=[...current.colors,...gugong.colors,...legacyTraditionalColors];
 assert.equal(new Set(colors.map(c=>c.id)).size,574);
 for(const c of colors){assert.ok(c.name);assert.match(c.hex,/^#[0-9a-f]{6}$/i);}
 assert.equal(new Set(gugong.colors.map(c=>c.group)).size,24);
 for(const [name,hex] of [['天缥','#D5EBE1'],['桃夭','#F6BEC8'],['暮山紫','#A4ABD6'],['石榴裙','#B13B2E']]){
  assert.equal(gugong.colors.find(c=>c.name===name)?.hex,hex);
 }
 assert.equal(gugong.colors[0].name,'黄白游');assert.equal(gugong.colors[383].name,'紫诰');
 assert.equal(legacyTraditionalColors.find(c=>c.name==='粉红')?.hex.toLowerCase(),'#ffb3a7');
});

test('按中文名称、节气、色系或HEX筛选；空查询展示全量，不改变色名重复项身份',()=>{
 const [,gugong,traditional]=characterPalettes;
 assert.equal(findCharacterColors(gugong.id,'','all').length,384);
 assert.equal(findCharacterColors(gugong.id,'','立春').length,16);
 assert.deepEqual(findCharacterColors(gugong.id,'天缥','all').map(c=>c.name),['天缥']);
 assert.equal(findCharacterColors(gugong.id,'#d5ebe1','all')[0].name,'天缥');
 assert.equal(findCharacterColors(traditional.id,'','红色系').length,196);
 assert.deepEqual(findCharacterColors(gugong.id,'不存在的颜色','all'),[]);
 const ivory=characterPalettes.flatMap(p=>p.colors).filter(c=>c.name==='象牙白');
 assert.ok(ivory.length>=2);assert.equal(new Set(ivory.map(c=>c.id)).size,ivory.length);
});

test('新增全部色号贯通导入、持久化、导出渲染；自定义颜色和旧色号继续有效',()=>{
 const map=new Map<string,string>(),storage={getItem:(k:string)=>map.get(k)||null,setItem:(k:string,v:string)=>{map.set(k,v);}};
 for(const color of characterPalettes.flatMap(p=>p.colors)){
  const c={color:color.id};
  assert.equal(resolveCharacterColor(c.color)[1],color.name);
  assert.equal(resolveCharacterColor(c.color)[2],color.hex);
 }
 const color=characterPalettes[1].colors.find(c=>c.name==='天缥')!;
 assert.equal(resolveCharacterColor('#12AbCD')[2],'#12AbCD');assert.equal(resolveCharacterColor('blue')[2],'#2f86ed');
});
