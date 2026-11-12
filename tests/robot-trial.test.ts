import test from 'node:test';
import assert from 'node:assert/strict';
import {initialTrialState,transitionTrial,isCurrentTrialTurn,trialDeviceProfiles,buildTrialReply} from '../src/robot_trial.ts';

test('机器人试聊经历聆听、思考、说话和待机，只有当前轮次可以更新屏幕',()=>{
 let state=transitionTrial(initialTrialState(),{type:'listen'});
 assert.equal(state.phase,'listening');
 state=transitionTrial(state,{type:'submit'});
 const turn=state.turn;
 assert.equal(state.phase,'thinking');
 state=transitionTrial(state,{type:'respond',turn});
 assert.equal(state.phase,'speaking');
 state=transitionTrial(state,{type:'finish',turn});
 assert.equal(state.phase,'idle');
 assert.equal(isCurrentTrialTurn(state,turn,'speaking'),false);
});

test('打断、切换配置和新建试聊使旧轮次失效，迟到字幕不能覆盖新屏幕',()=>{
 let state=transitionTrial(initialTrialState(),{type:'submit'});
 const oldTurn=state.turn;
 state=transitionTrial(state,{type:'stop'});
 assert.equal(state.phase,'stopped');
 assert.equal(isCurrentTrialTurn(state,oldTurn),false);
 assert.deepEqual(transitionTrial(state,{type:'respond',turn:oldTurn}),state);
 state=transitionTrial(state,{type:'listen'});
 assert.equal(state.phase,'listening');
 assert.deepEqual(transitionTrial(state,{type:'finish',turn:oldTurn}),state);
 state=transitionTrial(state,{type:'reset'});
 assert.equal(state.phase,'idle');
 assert.ok(state.turn>oldTurn);
});

test('屏幕适配包含方屏、圆屏和横屏；试聊内容服从选定智能体及问题',()=>{
 assert.ok(trialDeviceProfiles.some(p=>p.shape==='round'));
 assert.ok(trialDeviceProfiles.some(p=>p.width>p.height));
 for(const profile of trialDeviceProfiles)assert.ok(profile.width>0&&profile.height>0);
 const agent={name:'星星 · 学习伙伴',instructions:'陪伴学习',knowledge:[]};
 assert.match(buildTrialReply(agent,'你是谁？').text,/星星/);
 assert.notEqual(buildTrialReply(agent,'讲一个故事').text,buildTrialReply(agent,'你是谁？').text);
 assert.equal(buildTrialReply(agent,'讲一个故事').citation,false);
 assert.equal(buildTrialReply({...agent,knowledge:['k1']},'如何配网？').citation,true);
});

test('单一形象入口使用可编辑草稿，打开不改原有试聊配置',async()=>{
 const {trialCharacterDraft}=await import('../src/grok_customizer.ts');
 const {defaultCharacter}=await import('../src/character_config.ts');
 const old={...defaultCharacter(),name:'小知'};const before=structuredClone(old);const draft=trialCharacterDraft(old);assert.equal(draft.pack,'grok');assert.equal(draft.name,'小知');assert.deepEqual(old,before);
 const custom={...draft,expression:51,parts:['hands']};const cloned=trialCharacterDraft(custom);assert.equal(cloned.expression,51);cloned.parts.push('feet');assert.deepEqual(custom.parts,['hands']);
});
