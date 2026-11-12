import test from 'node:test';
import assert from 'node:assert/strict';
import {modelCategories,modelsForSelection,connectionMatchesCategory} from '../src/model_categories.ts';
import {configInitial,configOptions,configScheme,switchConfigScope,validateModelConfig} from '../src/model_config.ts';
import {restoreModelConfig} from '../src/model_config_restore.ts';
import {providerModelRows,providerViews} from '../src/model_provider_view.ts';
import {initialStore,type Connection} from '../src/state.ts';

test('分类独立于厂商来源，覆盖知识、语音和十项能力中的模型用途',()=>{
 for(const key of ['LLM','SLM','VLLM','Embedding','Rerank','ASR','TTS','VAD','意图','记忆','RAG'])assert.ok(modelCategories.some(c=>c.value===key),key);
});
test('选择器仅列出匹配的已配置连接，旧引用可见但不伪造可选模型',()=>{
 const models:Connection[]=[...initialStore().connections,{id:'asr',name:'识别',provider:'MiniMax',model:'asr',role:'ASR',status:'待检测',enabled:true},{id:'off',name:'停用识别',provider:'MiniMax',model:'asr',role:'ASR',status:'待检测',enabled:false}];
 const before=structuredClone(models);
 assert.deepEqual(modelsForSelection(models,'ASR').map(c=>c.value),['asr','off']);
 assert.equal(modelsForSelection(models,'ASR')[1].disabled,true);
 assert.ok(modelsForSelection(models,'ASR','m1').find(c=>c.value==='m1')?.disabled);
 assert.ok(modelsForSelection(models,'ASR','missing').find(c=>c.value==='missing')?.disabled);
 assert.ok(connectionMatchesCategory(models[0],'SLM'));assert.ok(!connectionMatchesCategory(models[0],'ASR'));
 assert.deepEqual(models,before);
});
test('语言协议配置显式视觉分类，保存恢复不误改回 LLM，语音不套语言协议',()=>{
 let draft=configInitial('deepseek');assert.ok(configOptions(draft,'role').includes('VLLM'));assert.ok(configOptions(draft,'role').includes('SLM'));
 draft=switchConfigScope(draft,'role','VLLM');assert.equal(draft.role,'VLLM');assert.equal(draft.modelMode,'manual');
 assert.equal(switchConfigScope(draft,'role','ASR'),draft);
 draft.model='vision-deployment';draft.name='视觉连接';draft.credentialRef='';
 assert.ok(!validateModelConfig(draft,true).role);
 const saved={id:'vision',name:draft.name,provider:'DeepSeek',model:draft.model,role:draft.role,status:'待检测',endpoint:draft.endpoint};
 assert.equal(restoreModelConfig('vision',saved).role,'VLLM');
 let asr=switchConfigScope(configInitial('minimax'),'role','ASR');assert.equal(asr.role,'ASR');assert.equal(configOptions(asr,'protocol')[0],'minimax-asr');
});
test('厂商模型行显示和筛选真实用途，不从模型名称猜分类',()=>{
 const entry=providerViews.find(p=>p.id==='minimax')!;
 const rows=providerModelRows(entry,[], '', 'ASR');assert.ok(rows.length);assert.ok(rows.every(r=>r.roles.includes('ASR')));
 const c={id:'manual',name:'视觉',provider:'MiniMax',model:'my-image-model',role:'VLLM',status:'待检测'};
 assert.ok(providerModelRows(entry,[c],'','VLLM').some(r=>r.id==='my-image-model'));
 assert.ok(!providerModelRows(entry,[c],'','Embedding').some(r=>r.id==='my-image-model'));
});
test('重排序有独立接入方案，不能沿用向量嵌入的请求协议和维数字段',()=>{
 const base=configInitial('cap:Embedding / Rerank');
 assert.ok(configOptions(base,'role').includes('Rerank'));
 const rank=switchConfigScope(base,'role','Rerank');
 assert.equal(rank.role,'Rerank');assert.equal(configScheme(rank)?.protocol,'rerank');
 assert.ok(!configScheme(rank)?.fields.some(f=>f.id==='dimensions'));
});
