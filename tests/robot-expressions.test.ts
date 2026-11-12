import test from 'node:test';
import assert from 'node:assert/strict';
import {robotExpressions,expressionGroups,resolveExpression,expressionForDialogue} from '../src/robot_expressions.ts';
test('表情至少48种、六组，每项有独立造型组合，不用名称充数',()=>{
 assert.ok(robotExpressions.length>=48);assert.equal(expressionGroups.length,6);
 assert.equal(new Set(robotExpressions.map(e=>e.id)).size,robotExpressions.length);
 assert.equal(new Set(robotExpressions.map(({id,name,group,...visual})=>JSON.stringify(visual))).size,robotExpressions.length);
 for(const group of expressionGroups)assert.equal(robotExpressions.filter(e=>e.group===group).length,8);
 for(const name of ['开心','悲伤','哭泣','眨眼','卖萌'])assert.ok(robotExpressions.some(e=>e.name===name));
});
test('自动表情跟随对话状态，手选优先；未知ID安全回退',()=>{
 assert.equal(resolveExpression(null,'listening').id,'attentive');
 assert.equal(resolveExpression(null,'thinking').id,'thinking');
 assert.equal(resolveExpression('cry','speaking').id,'cry');
 assert.equal(resolveExpression('missing','idle').id,'neutral');
 assert.equal(resolveExpression(null,'stopped').id,'offline');
});
test('本地文本规则选择表情，不把对方的悲伤映射为开心',()=>{
 assert.equal(expressionForDialogue('今天很难过，想哭'),'sad');
 assert.equal(expressionForDialogue('谢谢你'),'grateful');
 assert.equal(expressionForDialogue('讲一个普通故事'),'talking');
 assert.equal(resolveExpression(null,'listening','谢谢你').id,'attentive');
});
