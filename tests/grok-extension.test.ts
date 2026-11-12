import test from 'node:test';import assert from 'node:assert/strict';
import upstream from '../src/vendor/laoa_grokbot/data.json' with {type:'json'};
import {grokExpressions,grokExpressionEyes,grokPool} from '../src/grok_expressions.ts';
import {defaultCharacter,parseCharacter} from '../src/character_config.ts';
import {sceneSvg,blendEyes} from '../src/character_scene.ts';
import {defaultEmotionSet,emotions} from '../src/emotion_sets.ts';
import {emotionEyes,validateEmotionStyle} from '../src/emotion_style.ts';
test('原版25套原样保留，原64套加正面等候共65套不同的双眼48点轮廓',()=>{
 assert.equal(grokExpressions.length,90);assert.deepEqual(grokExpressionEyes.slice(0,25),upstream.EXPRESSIONS);
 assert.equal(new Set(grokExpressions.map(e=>e.id)).size,90);assert.equal(new Set(grokExpressionEyes.slice(25).map(e=>JSON.stringify(e))).size,65);
 for(const e of grokExpressionEyes){assert.equal(e.length,2);for(const ring of e){assert.equal(ring.length,48);assert.ok(ring.flat().every(Number.isFinite));assert.ok(ring.every(([x,y])=>x>=0&&x<=230&&y>=0&&y<=230));}}
});
test('扩展轮廓可直接选用、导出、JSON恢复，并兼容原版编号',()=>{
 for(const [i,p] of grokExpressions.entries()){const c={...defaultCharacter(),pack:'grok' as const,expression:i};assert.equal(parseCharacter(JSON.stringify(c)).expression,i);const svg=sceneSvg(c,1,{reduce:true});assert.ok(!/NaN|undefined/.test(svg),p.id);}
 const a=grokExpressionEyes[0],b=grokExpressionEyes[88];assert.deepEqual(blendEyes(a,b,1),b);assert.ok(blendEyes(a,b,.5).flat(2).every(Number.isFinite));assert.throws(()=>parseCharacter(JSON.stringify({...defaultCharacter(),expression:999})));
});
test('152项情绪映射使用LaoA轮廓，保留原有绘制器和运行池',()=>{
 for(const e of emotions){const style=defaultEmotionSet.recipes[e.id];assert.ok(style.grok_expression,e.id);assert.equal(style.mouth,'none');assert.equal(style.motif,'face');assert.ok(emotionEyes(style).flat(2).every(Number.isFinite));assert.deepEqual(validateEmotionStyle(style),style);}
 assert.ok(grokPool('happy').every(i=>i<25));assert.ok(grokPool('sad').every(i=>i<25));assert.ok(grokPool('listening').every(i=>i<25));
 const style=defaultEmotionSet.recipes[emotions[0].id];assert.throws(()=>validateEmotionStyle({...style,grok_expression:'unknown'}));
});

test('新默认沿用LaoA情绪姿态，旧套装无新增字段仍可无损恢复',async()=>{
 const {emotionCharacter,cloneEmotionSet,parseEmotionSet}=await import('../src/emotion_sets.ts');
 const happy=emotions.find(e=>e.emoji==='😄')!;assert.equal(emotionCharacter(defaultEmotionSet,happy.id).state,'happy');
 const old=cloneEmotionSet(defaultEmotionSet,'legacy');for(const recipe of Object.values(old.recipes))delete recipe.grok_expression;
 assert.deepEqual(parseEmotionSet(JSON.stringify(old)),old);
});

test('所有兼容扩展保持圆润凸轮廓，不再生成心形、星形或叉形眼睛',()=>{
 for(const [index,eyes] of grokExpressionEyes.slice(25).entries())for(const ring of eyes){const signs=ring.map((a,i)=>{const b=ring[(i+1)%48],c=ring[(i+2)%48];return (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);}).filter(n=>Math.abs(n)>.1);assert.ok(signs.every(n=>n>0)||signs.every(n=>n<0),`扩展${index}包含凹角`);}
});
