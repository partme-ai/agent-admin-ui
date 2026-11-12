import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStore,reviseAgent} from '../src/state.ts';
import {createMarketRole,roleMarketTemplates} from '../src/role_market.ts';
import {applyRoleRuntime,roleVoiceIssue,roleUsesVoice,roleAbilitySummary,roleHasVoiceOverride} from '../src/role_loadout.ts';
import {cloneAgentRuntime} from '../src/feature_state.ts';
import {roleConfigFingerprint,hasCurrentRoleTrial} from '../src/role_profile.ts';

test('十项能力、Prompt与音色参数随保存发布快照贯通，草稿不会污染已发布配置',()=>{
 const s=initialStore(),a=createMarketRole(roleMarketTemplates[0],s.connections);
 const runtime={...cloneAgentRuntime(a.runtime),bindings:{VAD:'vad',ASR:'asr',SLM:'slm',VLLM:'vision','意图':'intent'},memoryMode:'无记忆',language:'粤语',rate:1.2,pitch:2,volume:.8};
 const draft={...a,...applyRoleRuntime(runtime),instructions:'专门用于本轮的角色提示词',profile:{...a.profile!,disabledAbilities:[]}};
 assert.equal(draft.context,false);assert.equal(draft.memory,false);
 const trials={[draft.id]:roleConfigFingerprint(draft)},saved=reviseAgent(draft,undefined,false),published=reviseAgent(saved,saved,true);
 assert.equal(hasCurrentRoleTrial(published,trials),true);
 assert.deepEqual(published.publishedConfig?.runtime,runtime);assert.equal(published.publishedConfig?.instructions,draft.instructions);
 draft.runtime!.bindings.ASR='changed';assert.equal(published.publishedConfig?.runtime?.bindings.ASR,'asr');
 assert.equal(applyRoleRuntime({...runtime,memoryMode:'mem0'}).memory,true);
});
test('开启语音时拒绝不存在或不兼容音色，关闭TTS允许文字试聊',()=>{
 const s=initialStore(),a=createMarketRole(roleMarketTemplates[0],s.connections);
 assert.equal(roleVoiceIssue(a,s.voiceAssets),'');assert.equal(roleUsesVoice(a),true);
 const invalid={...a,runtime:{...a.runtime!,ttsModel:'openai:gpt-4o-mini-tts'}};
 assert.match(roleVoiceIssue(invalid,s.voiceAssets),/音色/);
 assert.match(roleVoiceIssue({...a,runtime:{...a.runtime!,ttsModel:'missing'}},s.voiceAssets),/语音模型/);
 const textOnly={...invalid,profile:{...a.profile!,disabledAbilities:['TTS']}};
 assert.equal(roleUsesVoice(textOnly),false);assert.equal(roleVoiceIssue(textOnly,s.voiceAssets),'');
});

test('任意一项能力变更均使旧试聊失效，摘要不会把错误音色标成已配置',()=>{
 const s=initialStore(),a=createMarketRole(roleMarketTemplates[0],s.connections),trials={[a.id]:roleConfigFingerprint(a)};
 const r=cloneAgentRuntime(a.runtime);
 const changed=[
  {...a,runtime:{...r,vadSpeech:.7}}, {...a,runtime:{...r,hotwords:'新热词'}}, {...a,model:'new'},
  ...['SLM','VLLM','意图'].map(key=>({...a,runtime:{...r,bindings:{...r.bindings,[key]:'new'}}})),
  {...a,...applyRoleRuntime({...r,memoryMode:'无记忆'})}, {...a,runtime:{...r,ttsModel:'other'}},
  {...a,runtime:{...r,language:'English'}}, {...a,runtime:{...r,voice:'other'}}
 ];
 assert.equal(changed.length,10);for(const next of changed)assert.equal(hasCurrentRoleTrial(next,trials),false);
 assert.equal(roleAbilitySummary(changed[9],'Voice',s.connections,s.voiceAssets).state,'待配置');
});

test('旧角色未显式保存runtime时使用标准默认值，不误标为临时声音',()=>{
 const a=initialStore().agents[0],r=cloneAgentRuntime(undefined);
 assert.equal(roleHasVoiceOverride({...a,runtime:undefined},r.ttsModel,r.voice),false);
 assert.equal(roleHasVoiceOverride({...a,runtime:undefined},r.ttsModel,'different'),true);
});
