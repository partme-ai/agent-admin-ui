import {resourceFingerprint} from '../src/agent_linkage.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStore} from '../src/state.ts';
import {defaultKnowledgeConfig,knowledgeSections,validateKnowledgeConfig,changeIndexing,restoreKnowledgeConfig,saveKnowledgeConfig} from '../src/knowledge_config.ts';
const connections=()=>[...initialStore().connections,{id:'embedding',name:'向量连接',provider:'本地',model:'bge-m3',role:'Embedding',enabled:true,status:'待检测'},{id:'vision',name:'视觉连接',provider:'本地',model:'qwen-vl',role:'VLLM',enabled:true,status:'待检测'},{id:'asr',name:'语音连接',provider:'本地',model:'asr',role:'ASR',enabled:true,status:'待检测'}];
test('文档型完整初始化与上游默认一致；FAQ收敛为四个分区',()=>{
 const cfg=defaultKnowledgeConfig(connections());
 assert.deepEqual(knowledgeSections(cfg).flatMap(g=>g.items.map(i=>i.key)),['basic','models','vectorStore','parser','chunking','multimodal','asr','graph','advanced','storage']);
 assert.equal(cfg.chunkingConfig.chunkSize,512);assert.equal(cfg.chunkingConfig.chunkOverlap,80);assert.equal(cfg.chunkingConfig.parentChunkSize,4096);assert.equal(cfg.chunkingConfig.childChunkSize,384);
 assert.equal(cfg.questionGenerationConfig.enabled,true);assert.equal(cfg.multimodalConfig.enabled,false);assert.equal(cfg.asrConfig.enabled,false);
 cfg.type='faq';assert.deepEqual(knowledgeSections(cfg).flatMap(g=>g.items.map(i=>i.key)),['basic','models','vectorStore','faq']);
});
test('跨分区校验模型用途与启用能力的依赖，不伪造未配置模型',()=>{
 const models=connections(),cfg=defaultKnowledgeConfig([]);cfg.name='知识库';
 assert.ok(validateKnowledgeConfig(cfg,models).some(e=>e.section==='models'));
 cfg.modelConfig.llmModelId='m1';cfg.modelConfig.embeddingModelId='embedding';
 assert.deepEqual(validateKnowledgeConfig(cfg,models),[]);
 cfg.multimodalConfig.enabled=true;cfg.multimodalConfig.vllmModelId='';assert.ok(validateKnowledgeConfig(cfg,models).some(e=>e.section==='multimodal'));
 cfg.multimodalConfig.vllmModelId='vision';cfg.asrConfig.enabled=true;cfg.asrConfig.modelId='m1';assert.ok(validateKnowledgeConfig(cfg,models).some(e=>e.section==='asr'));
 cfg.asrConfig.modelId='asr';cfg.imagePipelineParams['default.caption_enabled']=false;cfg.imagePipelineParams['default.ocr_enabled']=false;
 assert.ok(validateKnowledgeConfig(cfg,models).some(e=>e.section==='multimodal'));
});
test('Wiki预设不覆盖手动分块，切换类型保留非活动配置',()=>{
 const cfg=defaultKnowledgeConfig(connections());cfg.indexingStrategy.wikiEnabled=true;
 const wiki=changeIndexing(cfg,false,true,false);assert.equal(wiki.chunkingConfig.chunkSize,2048);assert.equal(wiki.chunkingConfig.enableParentChild,false);
 const manual=changeIndexing({...cfg,chunkingConfig:{...cfg.chunkingConfig,chunkSize:900}},false,true,true);assert.equal(manual.chunkingConfig.chunkSize,900);
 const back=changeIndexing(wiki,true,true,false);assert.equal(back.chunkingConfig.chunkSize,512);
 assert.equal(cfg.chunkingConfig.chunkSize,512);
});
test('保存完整配置并保留旧记录身份与检索参数，已有资料时禁止静默变更绑定',()=>{
 const models=connections(),store=initialStore(),old={...store.knowledge[0],options:{chunkSize:700,overlap:70,topK:8,threshold:.3,mode:'文本匹配',embedding:'embedding',rerank:'',external:''}};
 const cfg=restoreKnowledgeConfig(old,models);assert.equal(cfg.chunkingConfig.chunkSize,700);cfg.name='更新名称';
 const saved=saveKnowledgeConfig(cfg,models,old.id,'private',old,false);
 assert.equal(saved.id,old.id);assert.equal(saved.options!.topK,8);assert.equal(saved.configuration!.name,'更新名称');assert.equal(old.name,store.knowledge[0].name);
 assert.deepEqual(restoreKnowledgeConfig(saved,models),cfg);
 const changed=structuredClone(cfg);changed.modelConfig.embeddingModelId='vision';
 assert.throws(()=>saveKnowledgeConfig(changed,models,saved.id,'private',saved,true),/Embedding/);
 const moved=structuredClone(cfg);moved.vectorStoreId='qdrant';assert.throws(()=>saveKnowledgeConfig(moved,models,saved.id,'private',saved,false),/向量/);
});

test('知识库初始化参数变化使智能体旧试聊证明失效',()=>{
 const store=initialStore(),agent=store.agents[0],models=connections(),env={store,skills:[],host:'web' as const};
 const legacy=resourceFingerprint(agent,env),cfg=restoreKnowledgeConfig(store.knowledge[0],models);
 store.knowledge[0]={...store.knowledge[0],configuration:cfg};
 const first=resourceFingerprint(agent,env);assert.notEqual(first,legacy);
 store.knowledge[0].configuration!.chunkingConfig.chunkSize=900;
 assert.notEqual(resourceFingerprint(agent,env),first);
});
