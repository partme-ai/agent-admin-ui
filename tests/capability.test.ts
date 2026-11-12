import test from 'node:test';
import assert from 'node:assert/strict';
import {canUseConnection,chooseDefault,restoreAgentVersion,cleanWorkflow,modelRoles,templateSpecs,externalPlatforms} from '../src/capability.ts';
import {initialStore,reviseAgent} from '../src/state.ts';
test('已配置、已检测、已启用是独立条件',()=>{
 const c=initialStore().connections[0];
 assert.equal(canUseConnection({...c,enabled:false}),false);
 assert.equal(canUseConnection({...c,status:'待检测',enabled:true}),false);
 assert.equal(canUseConnection({...c,enabled:true}),true);
});
test('默认连接按用途隔离，只允许可用连接成为默认',()=>{
 const list=[{...initialStore().connections[0],role:'LLM',isDefault:true},{...initialStore().connections[1],role:'LLM'},{id:'s1',name:'语音',provider:'ASR',model:'asr',status:'演示可用',role:'ASR',isDefault:true}];
 const next=chooseDefault(list,'m2');assert.equal(next[0].isDefault,false);assert.equal(next[1].isDefault,true);assert.equal(next[2].isDefault,true);
 assert.throws(()=>chooseDefault([{...list[0],status:'待检测'}],'m1'));
});
test('恢复版本创建新草稿，发布快照与历史记录不丢失',()=>{
 const old=initialStore().agents[0];const v=reviseAgent({...old,instructions:'新版'},old,true);
 const restored=restoreAgentVersion(v,old);
 assert.equal(restored.instructions,old.instructions);assert.equal(restored.publishedConfig?.instructions,'新版');assert.ok(restored.revision>v.revision);
});
test('外部服务配置不保存密钥，保留提供方与任务关联模式',()=>{
 const c=cleanWorkflow({id:'w1',platform:'Dify',name:'工作流',appId:'demo',endpoint:'https://example.com',apiKey:'secret',enabled:false});
 assert.equal(c.platform,'Dify');assert.equal(JSON.stringify(c).includes('secret'),false);
});
test('表格要求的模型分类、外部平台与任务模板没有缺项',()=>{
 for(const role of ['VAD','ASR','LLM','VLLM','意图','TTS','记忆','RAG'])assert.ok(modelRoles.includes(role));
 for(const platform of ['Dify','Coze','FastGPT','百炼','星辰'])assert.ok(externalPlatforms.some(p=>p.name===platform));
 assert.equal(templateSpecs.length,8);assert.ok(templateSpecs.every(t=>t.requirements.length&&t.permissions.length&&t.questions.length));
});
