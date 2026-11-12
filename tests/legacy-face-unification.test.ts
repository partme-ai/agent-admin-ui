import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultCharacter,normalizeCharacter,parseCharacter,characterStates,characterActions} from '../src/character_config.ts';
import {robotExpressions} from '../src/robot_expressions.ts';
import {grokExpressions} from '../src/grok_expressions.ts';
import {labExpressions,labCharacter} from '../src/grok_customizer.ts';
import {readCharacterPresets,characterPresetKey} from '../src/character_presets.ts';

test('默认与历史minimal输入都进入新形象，保留外观且不修改原对象',()=>{
 assert.equal(defaultCharacter().pack,'grok');
 const old={...defaultCharacter(),pack:'minimal' as const,name:'原来的伙伴',color:'teal',shape:'hex',parts:['hands'],expression:43};
 const before=structuredClone(old),next=normalizeCharacter(old);
 assert.equal(next.pack,'grok');assert.equal(next.name,old.name);assert.equal(next.color,'teal');assert.equal(next.shape,'hex');assert.deepEqual(next.parts,['hands']);assert.equal(next.expression,43);assert.deepEqual(old,before);
 assert.equal(parseCharacter(JSON.stringify(old)).pack,'grok');assert.throws(()=>parseCharacter(JSON.stringify({...old,pack:'script'})));assert.throws(()=>parseCharacter(JSON.stringify({...old,color:'url(evil)'})));
});

test('48项旧表情全部有有效新轮廓及动作，按旧名称和ID均可检索并选用',async()=>{
 const {legacyFaceMappings}=await import('../src/legacy_expression_mapping.ts');
 const {legacyExpressionCharacter}=await import('../src/grok_customizer.ts');
 assert.equal(legacyFaceMappings.length,48);assert.deepEqual(legacyFaceMappings.map(x=>x.id).sort(),robotExpressions.map(x=>x.id).sort());
 for(const old of robotExpressions){const mapping=legacyFaceMappings.find(x=>x.id===old.id)!;assert.ok(grokExpressions.some(x=>x.id===mapping.grokId));assert.ok(characterStates.some(x=>x.id===mapping.state));assert.ok(mapping.action==='none'||characterActions.some(x=>x[0]===mapping.action));
  for(const query of [old.id,old.name])assert.ok(labExpressions({query}).some(x=>x.id===mapping.grokId),query);
  const source={...defaultCharacter(),name:'小伙伴',parts:['hands']},copy=structuredClone(source),value=legacyExpressionCharacter(source,old.id);
  assert.equal(value.pack,'grok');assert.equal(grokExpressions[value.expression].id,mapping.grokId);assert.equal(value.action,mapping.action);assert.equal(labCharacter(value).state,mapping.state);assert.deepEqual(source,copy);
 }
 assert.equal(legacyExpressionCharacter(defaultCharacter(),'nod').action,'nod');assert.equal(legacyExpressionCharacter(defaultCharacter(),'look_left').action,'look_left');
});

test('历史形象预设只读迁移，不写回或损坏原存储，重新导出是新体系',()=>{
 const original=JSON.stringify([{id:'old',name:'保留形象',config:{...defaultCharacter(),pack:'minimal',color:'teal',parts:['tail']}}]);let writes=0;
 const list=readCharacterPresets({getItem:k=>k===characterPresetKey?original:null,setItem:()=>{writes++;}});
 assert.equal(writes,0);assert.equal(list[0].config.pack,'grok');assert.equal(list[0].config.color,'teal');assert.deepEqual(list[0].config.parts,['tail']);assert.equal(parseCharacter(JSON.stringify(list[0].config)).pack,'grok');
});

test('点头和左右看在新场景中产生独立视觉动作，静态导出不持续动画',async()=>{
 const {sceneSvg}=await import('../src/character_scene.ts');const c={...defaultCharacter(),expression:0,state:'idle'};
 for(const action of ['nod','look_left','look_right']){assert.notEqual(sceneSvg({...c,action},.25),sceneSvg({...c,action:'none'},.25),action);assert.equal(sceneSvg({...c,action},.25,{reduce:true}),sceneSvg({...c,action:'none'},.25,{reduce:true}),action);}
});
