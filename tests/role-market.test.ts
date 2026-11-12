import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStore,reviseAgent} from '../src/state.ts';
import {roleMarketTemplates,createMarketRole} from '../src/role_market.ts';
import {roleConfigFingerprint,hasCurrentRoleTrial,canBindRole} from '../src/role_profile.ts';
import {ttsModels,voicesForModel} from '../src/voice_catalog.ts';

test('市场角色具备不同人格、性格、声音和明确Prompt，音色有真实本地样本',()=>{
 assert.equal(roleMarketTemplates.length,24);assert.equal(new Set(roleMarketTemplates.map(t=>t.profile.identity)).size,24);
 assert.deepEqual(roleMarketTemplates.slice(0,8).map(t=>t.id),['life','knowledge','inspection','learning','story','research','language','vision']);
 for(const t of roleMarketTemplates){assert.ok(t.profile.traits.length);assert.ok(t.instructions.length>30);assert.ok(t.questions.length);const m=ttsModels.find(x=>x.id===t.runtime.ttsModel)!;assert.ok(voicesForModel(m,[]).find(x=>x.key===t.runtime.voice)?.previewUrl);}
});
test('市场选择生成完整且互不污染的独立草稿，不复制设备和记忆',()=>{
 const s=initialStore(),t=roleMarketTemplates[0];const a=createMarketRole(t,s.connections),b=createMarketRole(t,s.connections);
 assert.notEqual(a.id,b.id);assert.equal(a.published,false);assert.equal(a.revision,0);assert.equal(a.instructions,t.instructions);assert.equal(a.profile?.identity,t.profile.identity);assert.equal(a.runtime?.voice,t.runtime.voice);
 a.profile!.traits.push('新性格');assert.notDeepEqual(a.profile?.traits,t.profile.traits);assert.deepEqual(b.profile?.traits,t.profile.traits);assert.equal(s.bots.some(x=>x.agent===a.id),false);assert.equal(s.roleMemories[a.id],undefined);
});
test('试聊记录绑定完整配置，保存不失效，修改Prompt或人格声音后必须重试',()=>{
 const a=createMarketRole(roleMarketTemplates[0],initialStore().connections),trials={[a.id]:roleConfigFingerprint(a)};
 assert.equal(hasCurrentRoleTrial(a,trials),true);assert.equal(hasCurrentRoleTrial(reviseAgent(a,undefined,false),trials),true);
 assert.equal(hasCurrentRoleTrial({...a,instructions:a.instructions+'补充'},trials),false);
 assert.equal(hasCurrentRoleTrial({...a,profile:{...a.profile!,identity:'改变身份'}},trials),false);
 assert.equal(hasCurrentRoleTrial({...a,runtime:{...a.runtime!,voice:'other'}},trials),false);
});
test('绑定要求已发布配置；保存新的未发布修改后不能冒充当前版本生效',()=>{
 const a=createMarketRole(roleMarketTemplates[0],initialStore().connections);assert.equal(canBindRole(a),false);
 const published=reviseAgent(a,undefined,true);assert.equal(canBindRole(published),true);
 const draft=reviseAgent({...published,instructions:'新Prompt'},published,false);assert.equal(canBindRole(draft),false);
});
test('试聊实际使用的模型或音色不同时，回执不能归到原角色配置',()=>{
 const a=createMarketRole(roleMarketTemplates[0],initialStore().connections);
 const actual={...a,runtime:{...a.runtime!,voice:roleMarketTemplates[1].runtime.voice}};
 assert.equal(hasCurrentRoleTrial(a,{[a.id]:roleConfigFingerprint(actual)}),false);
 assert.equal(hasCurrentRoleTrial(actual,{[a.id]:roleConfigFingerprint(actual)}),true);
});
