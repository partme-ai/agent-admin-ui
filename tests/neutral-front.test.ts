import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {grokExpressions,grokExpressionEyes} from '../src/grok_expressions.ts';
import {labDefault,labChooseExpression,labCharacter} from '../src/grok_customizer.ts';
import {sceneSvg} from '../src/character_scene.ts';

test('正面等候追加在原89套之后，双眼居中、等高、竖直且镜像对称',()=>{
 const c=labChooseExpression(labDefault(),grokExpressions.findIndex(e=>e.id==='neutral-front'));assert.equal(grokExpressions[c.expression]?.id,'neutral-front');
 assert.equal(c.state,'idle');assert.equal(c.action,'none');assert.equal(c.expression,89);
 const eyes=grokExpressionEyes[c.expression],centers=eyes.map(r=>r.reduce((a,[x,y])=>[a[0]+x/48,a[1]+y/48],[0,0]));
 assert.ok(Math.abs(centers[0][1]-114)<.001);assert.ok(Math.abs(centers[1][1]-114)<.001);
 assert.ok(Math.abs((centers[0][0]+centers[1][0])/2-114)<.001);
 for(const [x,y] of eyes[0])assert.ok(eyes[1].some(([rx,ry])=>Math.abs(rx-(228-x))<.002&&Math.abs(ry-y)<.002));
 assert.equal(createHash('sha256').update(JSON.stringify(grokExpressionEyes.slice(0,89))).digest('hex'),'185a0ea33103a187d758856933443545aae3a5a4ede4b3118d8c4069b781bfa5');
});

test('显式正面等候不跟随鼠标偏视；显式选择的旧眼型不被替换',()=>{
 const c=labChooseExpression(labDefault(),89);assert.equal(sceneSvg(c,1,{blink:1,gazeX:15,gazeY:10}),sceneSvg(c,1,{blink:1}));
 const old={...c,expression:1,state:'listening'};assert.deepEqual(labCharacter(old),old);assert.equal(labChooseExpression(c,1).expression,1);
});
