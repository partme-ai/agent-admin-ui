import test from 'node:test';
import assert from 'node:assert/strict';
import {wikiCopy,wikiGranularityHint} from '../src/knowledge_editor_copy.ts';
import {defaultKnowledgeConfig,changeIndexing} from '../src/knowledge_config.ts';

test('Wiki 三档粒度名称与解释保持 WeKnora 原文且可切换',()=>{
 assert.equal(wikiCopy.autoGenerateLabel,'自动生成 Wiki 页面');
 assert.equal(wikiCopy.contentInstructionsLabel,'Wiki 内容生成要求');
 assert.equal(wikiCopy.extractionInstructionsLabel,'Wiki 提取重点');
 assert.equal(wikiCopy.granularityExhaustive,'详尽');
 assert.match(wikiGranularityHint('focused'),/最干净，但可能漏掉次要实体/);
 assert.match(wikiGranularityHint('standard'),/适合大多数场景/);
 assert.match(wikiGranularityHint('exhaustive'),/术语表/);
});
test('切换 RAG 与 Wiki 保留用户的 Wiki 提取要求、粒度与自动生成选择',()=>{
 const original=defaultKnowledgeConfig();original.wikiConfig={autoGenerate:false,extractionGranularity:'exhaustive',contentInstructions:'保持法务口吻',extractionInstructions:'产品与负责人'};
 const wikiOnly=changeIndexing(original,false,true,false),back=changeIndexing(wikiOnly,true,false,false);
 assert.deepEqual(back.wikiConfig,original.wikiConfig);
 assert.equal(wikiOnly.indexingStrategy.wikiEnabled,true);
 assert.equal(back.indexingStrategy.wikiEnabled,false);
});
