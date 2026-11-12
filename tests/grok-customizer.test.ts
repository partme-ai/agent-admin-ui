import test from 'node:test';import assert from 'node:assert/strict';
import {labDefault,labChooseExpression,labChooseState,labToggle,labPage} from '../src/grok_customizer.ts';
import {defaultEmotionSet,emotionCharacter,emotions} from '../src/emotion_sets.ts';
import {parseCharacter} from '../src/character_config.ts';
test('默认形象直接点选，草稿互相隔离；选表情保留颜色、形状和部件',()=>{
 const a=labDefault(),b=labDefault();a.parts.push('hands');assert.equal(b.parts.length,0);
 const c=labChooseExpression({...a,color:'teal',shape:'hex'},45);assert.equal(c.expression,45);assert.equal(c.color,'teal');assert.equal(c.shape,'hex');assert.deepEqual(c.parts,['hands']);assert.deepEqual(parseCharacter(JSON.stringify(c)),c);
 assert.throws(()=>labChooseExpression(c,999));
});
test('状态和眼型选择取消旧情绪覆盖，切换部件可逆且不改源对象',()=>{
 const old=emotionCharacter(defaultEmotionSet,emotions[0].id),s=labChooseState(old,'listening');assert.equal(s.expression,-1);assert.equal(s.emotion,undefined);assert.equal(s.state,'listening');assert.throws(()=>labChooseState(old,'unknown'));
 const a=labDefault(),b=labToggle(a,'parts','hands');assert.deepEqual(b.parts,['hands']);assert.deepEqual(a.parts,[]);assert.deepEqual(labToggle(b,'parts','hands').parts,[]);assert.throws(()=>labToggle(a,'accessories','script'));
});
test('原站眼型每页5个，状态每页6个，末页和空结果不会越界',()=>{
 assert.deepEqual(labPage([1,2,3,4,5,6],1,5),{items:[1,2,3,4,5],page:1,pages:2});assert.deepEqual(labPage([1,2,3,4,5,6],99,5),{items:[6],page:2,pages:2});assert.deepEqual(labPage([],1,6),{items:[],page:1,pages:1});
});

test('完整90套参与选择和随机，官方状态池保持原样',async()=>{
 const {grokPublicExpressions,grokPool}=await import('../src/grok_expressions.ts');const {randomCharacter}=await import('../src/character_config.ts');
 assert.equal(grokPublicExpressions.length,90);assert.equal(grokPublicExpressions.filter(e=>e.origin==='upstream').length,25);assert.equal(grokPublicExpressions.filter(e=>e.origin==='tinybot').length,65);
 for(const s of ['happy','sad','angry','shy','listening'])assert.ok(grokPool(s).every(i=>i<25));
 assert.equal(randomCharacter(()=>.999).expression,89);
});
test('扩展眼型保持编号进入编辑草稿，不降级且不写回原值',async()=>{
 const {labCharacter}=await import('../src/grok_customizer.ts');const old={...labDefault(),expression:43};const copy=structuredClone(old),current=labCharacter(old);
 assert.equal(current.expression,43);assert.equal(current.emotion,undefined);assert.deepEqual(old,copy);const {sceneSvg}=await import('../src/character_scene.ts');for(let i=0;i<25;i++)assert.notEqual(sceneSvg(current,1,{reduce:true}),sceneSvg({...current,expression:i},1,{reduce:true}));
});

test('网页和导出统一使用官方样式，旧符号眼和Emoji嘴型不会重新进入Grok画面',async()=>{
 const {sceneSvg}=await import('../src/character_scene.ts');const {labCharacter}=await import('../src/grok_customizer.ts');
 const style={...defaultEmotionSet.recipes[emotions[0].id],left:'heart',right:'star',mouth:'laugh',effect:'hearts'};delete style.grok_expression;
 const c={...labDefault(),emotion:style};assert.ok(!sceneSvg(c,1,{reduce:true}).includes('data-emotion-effect'));
 const legacy={...labDefault(),expression:43};assert.equal(sceneSvg(legacy,1,{reduce:true}),sceneSvg(labCharacter(legacy),1,{reduce:true}));
});


test('全部/原版/扩展、分类和搜索覆盖完整库，索引始终稳定',async()=>{
 const {labExpressions}=await import('../src/grok_customizer.ts');
 assert.equal(labExpressions({source:'all'}).length,90);assert.equal(labExpressions({source:'upstream'}).length,25);assert.equal(labExpressions({source:'tinybot'}).length,65);
 const crying=labExpressions({source:'tinybot',query:'委屈落泪'});assert.equal(crying.length,1);assert.ok(crying[0].index>=25);assert.equal(crying[0].id,'crying');
 const joy=labExpressions({source:'tinybot',group:'喜悦'});assert.equal(joy.length,8);assert.equal(labExpressions({source:'upstream',query:'unknown'}).length,0);
});

test('原版25项有中文展示名称，名称与旧编号均能检索且轮廓编号不变',async()=>{
 const {grokExpressions,grokExpressionEyes}=await import('../src/grok_expressions.ts');const {characterData}=await import('../src/character_config.ts');const {labExpressions}=await import('../src/grok_customizer.ts');
 assert.equal(new Set(grokExpressions.map(e=>e.name)).size,90);
 for(let i=0;i<25;i++){const e=grokExpressions[i],number=String(i).padStart(2,'0');assert.ok(e.name&&/[\u4e00-\u9fff]/.test(e.name)&&!/^原版/.test(e.name));assert.equal(e.id,`laoa-${number}`);assert.deepEqual(grokExpressionEyes[i],characterData.EXPRESSIONS[i]);
  for(const query of [e.name,e.id,`原版 ${number}`])assert.ok(labExpressions({source:'upstream',query}).some(x=>x.index===i));
 }
});
