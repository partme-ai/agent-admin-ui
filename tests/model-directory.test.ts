import test from 'node:test';
import assert from 'node:assert/strict';
import source from '../reference/model_integrations.source.json' with {type:'json'};
import {modelDirectory,filterModelDirectory} from '../src/model_directory.ts';
test('每个参考注册或预设条目都可追溯，全部十仓库保留且不丢失变体',()=>{
 assert.equal(source.repositories.length,10);
 const indexes=modelDirectory.flatMap(p=>p.records);
 assert.equal(indexes.length,source.records.length);assert.equal(new Set(indexes).size,indexes.length);
 assert.deepEqual([...indexes].sort((a,b)=>a-b),source.records.map((_,i)=>i));
});
test('官方模型、模型平台与运行时分层，国内主流目录有独立入口',()=>{
 for(const id of ['deepseek','glm','kimi','minimax','qwen','baidu','volcengine','tencent','xiaomi','stepfun','siliconflow','modelscope','longcat','bailing','baichuan','yi'])assert.ok(modelDirectory.some(p=>p.id===id),id);
 assert.equal(modelDirectory.find(p=>p.id==='deepseek')?.kind,'官方模型');
 assert.equal(modelDirectory.find(p=>p.id==='volcengine')?.kind,'模型平台');
 assert.equal(modelDirectory.find(p=>p.id==='bailian')?.kind,'模型平台');
 assert.ok(filterModelDirectory('','工具运行时').length>0);
 assert.ok(filterModelDirectory('','官方模型',true).every(p=>p.domestic));
 assert.ok(filterModelDirectory('DeepSeek','全部').some(p=>p.id==='deepseek'));
});

test('选择接入方案保留原来源和端点，未知方案与外部运行时不预填成其他厂商',async()=>{
 const {resolveModelPreset}=await import('../src/model_directory.ts');
 const index=source.records.findIndex(r=>r.repo==='ZCode'&&r.id==='qwen-alibaba-model-studio-cn');
 assert.ok(index>=0);const preset=resolveModelPreset('source:'+index)!;
 assert.equal(preset.endpoint,source.records[index].endpoints[0]);assert.equal(preset.source.id,source.records[index].id);
 assert.equal(resolveModelPreset('source:999999'),undefined);
 const runtime=source.records.findIndex(r=>r.repo==='nanoclaw');assert.equal(resolveModelPreset('source:'+runtime),undefined);
});
