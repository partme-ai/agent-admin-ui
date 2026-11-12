import test from 'node:test';
import assert from 'node:assert/strict';
import {characterPalettes,legacyTraditionalColors,legacyGugongColors} from '../src/character_palettes.ts';
import {characterColorSwatches,findCharacterSwatches,characterSwatchValue} from '../src/character_swatches.ts';
import {defaultCharacter,parseCharacter} from '../src/character_config.ts';
import {resolveCharacterColor} from '../src/character_colors.ts';
import {saveCharacterPreset,readCharacterPresets} from '../src/character_presets.ts';
import {sceneSvg} from '../src/character_scene.ts';

test('仅在展示层按忽略大小写的HEX合并：1529条可选记录保留，展示1518个色块；历史来源只附加别名',()=>{
 assert.equal(characterPalettes.flatMap(p=>p.colors).length,1529);
 assert.equal(characterColorSwatches.length,1518);
 assert.equal(new Set(characterColorSwatches.map(c=>c.hex.toLowerCase())).size,1518);
 const retainedAliases=[...legacyTraditionalColors,...legacyGugongColors].filter(c=>characterColorSwatches.some(s=>s.hex.toLowerCase()===c.hex.toLowerCase()));
 assert.equal(characterColorSwatches.reduce((n,c)=>n+c.members.length,0),1529+retainedAliases.length);
 const merged=characterColorSwatches.filter(c=>c.members.length>1);
 for(const hex of ['#000000','#516572','#d5ebe1'])assert.ok(merged.some(c=>c.hex.toLowerCase()===hex));
 const black=merged.find(c=>c.hex.toLowerCase()==='#000000')!;
 assert.deepEqual(black.members.filter(c=>!c.id.startsWith('traditional742-')).map(c=>[c.name,c.paletteName]),[['纯黑','现有配色'],['黑色','中国传统色']]);
 assert.ok(merged.find(c=>c.hex.toLowerCase()==='#d5ebe1')!.members.some(c=>c.paletteId==='gugong'&&c.name==='天缥'));
});

test('别名及来源均能搜索，分类筛选不丢失合并成员；同名不同色值分别展示',()=>{
 assert.equal(findCharacterSwatches('international').length,130);
 const a=findCharacterSwatches('international','石板蓝'),b=findCharacterSwatches('international','石灰色');
 assert.equal(a.length,1);assert.equal(b.length,1);assert.equal(a[0].hex,b[0].hex);
 assert.equal(findCharacterSwatches('international','石灰色','中性色与灰度').length,1);
 assert.equal(findCharacterSwatches('all','月白').filter(c=>c.hex.toLowerCase()==='#d4e5ef').length,1);
 assert.ok(findCharacterSwatches('all','中国传统色').some(c=>c.hex.toLowerCase()==='#000000'));
 assert.ok(findCharacterSwatches('all','基础配色').some(c=>c.hex.toLowerCase()==='#000000'));
 assert.ok(findCharacterSwatches('all','现有配色').some(c=>c.hex.toLowerCase()==='#000000'));
 assert.equal(findCharacterSwatches('all','经典蓝').filter(s=>s.members.some(m=>m.name==='经典蓝')).length,2);
 assert.equal(findCharacterSwatches('all','象牙白').length,3);
 assert.equal(findCharacterSwatches('ral','RAL 5002')[0].members[0].name,'群青蓝');
 assert.deepEqual(findCharacterSwatches('all','没有这个颜色'),[]);
});

test('重复色全部成员ID及自定义同色HEX不改写，保存读回、JSON与画面保持原样',()=>{
 const memory=new Map<string,string>(),storage={getItem:(k:string)=>memory.get(k)||null,setItem:(k:string,v:string)=>{memory.set(k,v);}};
 const merged=characterColorSwatches.filter(c=>c.members.length>1);
 const legacy=merged.filter(s=>['#000000','#516572','#d5ebe1'].includes(s.hex.toLowerCase())).flatMap(s=>s.members.map(member=>({s,member})));
 assert.ok(legacy.length>=6);
 for(const {s,member} of legacy){
  const config={...defaultCharacter(),color:member.id},snapshot=JSON.stringify(config),before=sceneSvg(config,0,{reduce:true});
  assert.equal(characterSwatchValue(s,member.id,'all'),member.id);
  assert.equal(characterSwatchValue(s,member.id,'current'),member.id);
  assert.equal(characterSwatchValue(s,s.hex.toUpperCase(),'all'),s.hex.toUpperCase());
  saveCharacterPreset(storage,{id:member.id,name:`${member.paletteName}·${member.name}`,config});
  const saved=readCharacterPresets(storage).find(p=>p.id===member.id)!;
  assert.equal(saved.config.color,member.id);assert.equal(JSON.stringify(saved.config),snapshot);
  assert.equal(parseCharacter(JSON.stringify(saved.config)).color,member.id);
  assert.equal(sceneSvg(saved.config,0,{reduce:true}),before);
  assert.equal(resolveCharacterColor(member.id)[1],member.name);
 }
 assert.equal(readCharacterPresets(storage).length,legacy.length);
 const black=merged.find(c=>c.hex.toLowerCase()==='#000000')!;
 const traditional=black.members.find(c=>c.paletteId==='traditional')!;
 assert.equal(characterSwatchValue(black,'blue','traditional'),traditional.id);
 assert.equal(characterSwatchValue(black,'blue','all'),'black');
});
