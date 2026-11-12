import test from 'node:test';
import assert from 'node:assert/strict';
import {parserOptions,readParserSettings,selectParserEngine,updateParserSettings,validateParserRules,ocrLanguages} from '../src/knowledge_parser.ts';
import {defaultKnowledgeConfig,restoreKnowledgeConfig,saveKnowledgeConfig} from '../src/knowledge_config.ts';
import {initialStore} from '../src/state.ts';

test('文档处理和图片 OCR 按输入类型分别匹配，保留现有引擎',()=>{
 const ids=(type:string)=>parserOptions([type]).map(x=>x.value);
 for(const id of ['builtin','mineru','paddleocr_vl','local-document','paddleocr','doc2x','mistral','open-mineru'])assert.ok(ids('pdf').includes(id),id);
 for(const id of ['system','local-paddleocr','tesseract','paddleocr','mistral'])assert.ok(ids('png').includes(id),id);
 for(const type of ['docx','pptx','xlsx','epub','csv','md','mp3'])for(const id of ['system','tesseract','doc2x','local-document','open-mineru'])assert.ok(!ids(type).includes(id),`${type}/${id}`);
 assert.ok(ids('xlsx').includes('anydoc'));assert.ok(ids('xlsx').includes('markitdown'));
});
test('切换引擎保留每种参数，拆分旧组合规则不丢其他类型或扩展字段',()=>{
 const old=[{file_types:['pdf','docx'],engine:'builtin',xlsx_first_row_as_header:false}];
 let rules=selectParserEngine(old,['pdf'],'open-mineru');
 rules=updateParserSettings(rules,['pdf'],'open-mineru',{apiHost:'http://localhost:8001',credentialRefs:['private-mineru']});
 rules=selectParserEngine(rules,['pdf'],'doc2x');
 rules=updateParserSettings(rules,['pdf'],'doc2x',{modelId:'v2',formulaLevel:2});
 rules=selectParserEngine(rules,['pdf'],'open-mineru');
 assert.equal(readParserSettings(rules,['pdf'],'open-mineru').apiHost,'http://localhost:8001');
 assert.equal(readParserSettings(rules,['pdf'],'doc2x').modelId,'v2');
 assert.deepEqual(rules.find(r=>r.file_types.includes('docx')),old[0]&&{...old[0],file_types:['docx']});
 assert.deepEqual(old[0].file_types,['pdf','docx']);
});
test('PaddleOCR 文档与图像模型隔离；Tesseract 含图示语言和更多可搜索语言',()=>{
 assert.equal(readParserSettings([],['pdf'],'paddleocr').modelId,'PaddleOCR-VL-1.6');
 assert.equal(readParserSettings([],['png'],'paddleocr').modelId,'PP-OCRv6');
 for(const code of ['eng','chi_sim','chi_tra','jpn','kor','fra','deu','ita','spa','rus','por'])assert.ok(ocrLanguages.some(x=>x.value===code),code);
});
test('只校验活动引擎，拒绝错误协议、用途和空语言，不阻断未知旧引擎',()=>{
 let rules=selectParserEngine([],['pdf'],'open-mineru');
 rules=updateParserSettings(rules,['pdf'],'open-mineru',{apiHost:'javascript:alert(1)'});
 assert.ok(validateParserRules(rules).some(e=>e.includes('HTTP')));
 assert.deepEqual(validateParserRules(selectParserEngine(rules,['pdf'],'builtin')),[]);
 assert.ok(validateParserRules([{file_types:['docx'],engine:'tesseract'}]).length);
 assert.deepEqual(validateParserRules([{file_types:['pdf'],engine:'legacy-custom',options:{private:123}}]),[]);
 let images=selectParserEngine([],['png'],'tesseract');images=updateParserSettings(images,['png'],'tesseract',{langs:[]});
 assert.ok(validateParserRules(images).some(e=>e.includes('语言')));
});
test('解析参数经知识库创建和恢复完整保留，旧配置不强行改写',()=>{
 const models=[...initialStore().connections,{id:'emb',name:'向量连接',provider:'本地',model:'bge-m3',role:'Embedding',enabled:true,status:'待检测'}];
 const cfg=defaultKnowledgeConfig(models);cfg.name='解析配置';
 cfg.chunkingConfig.parserEngineRules=updateParserSettings(selectParserEngine([],['jpg','png'],'tesseract'),['jpg','png'],'tesseract',{langs:['eng','jpn']});
 const saved=saveKnowledgeConfig(cfg,models,'kb-parser','private');
 assert.deepEqual(restoreKnowledgeConfig(saved,models),cfg);
 const legacy=structuredClone(saved);legacy.configuration!.chunkingConfig.parserEngineRules=[{file_types:['pdf'],engine:'mineru'}];
 assert.deepEqual(restoreKnowledgeConfig(legacy,models).chunkingConfig.parserEngineRules,[{file_types:['pdf'],engine:'mineru'}]);
});
