import {resolveDefaultModel,type ModelDefaults} from './settings_integration.ts';
import type {Connection,Knowledge} from './state.ts';
import {validateParserRules,type ParserRule} from './knowledge_parser.ts';
/** 对齐 WeKnora 创建编辑器的初始化配置；只记录配置，不代表服务已运行。 */
export type KnowledgeConfig={
 type:'document'|'faq';name:string;description:string;
 indexingStrategy:{vectorEnabled:boolean;keywordEnabled:boolean;wikiEnabled:boolean;graphEnabled:boolean};
 modelConfig:{llmModelId:string;embeddingModelId:string;wikiSynthesisModelId:string};vectorStoreId:string;
 wikiConfig:{autoGenerate:boolean;extractionGranularity:'focused'|'standard'|'exhaustive';contentInstructions:string;extractionInstructions:string};
 faqConfig:{indexMode:'question_only'|'question_answer';questionIndexMode:'combined'|'separate'};
 chunkingConfig:{chunkSize:number;chunkOverlap:number;separators:string[];parserEngineRules:ParserRule[];enableParentChild:boolean;parentChunkSize:number;childChunkSize:number;strategy:string;tokenLimit:number;languages:string[];tableMetadataInstructions:string};
 multimodalConfig:{enabled:boolean;vllmModelId:string;descriptionLanguage:string;customInstructions:string};
 imageVectorEnabled:boolean;imagePipeline:'default'|'smartocr';imagePipelineParams:Record<string,boolean|string>;
 asrConfig:{enabled:boolean;modelId:string;language:string};
 nodeExtractConfig:{enabled:boolean;text:string;tags:string[];nodes:{name:string;attributes:string[]}[];relations:{node1:string;node2:string;type:string}[];customInstructions:string};
 questionGenerationConfig:{enabled:boolean;modelId:string;questionCount:number;customInstructions:string};
 autoTagConfig:{enabled:boolean;modelId:string;maxTags:number;skipIfTagged:boolean};
 profileConfig:{enabled:boolean;modelId:string;customInstructions:string};storageBackendId:string;storageProvider:string;
};
export type KnowledgeSection='basic'|'models'|'vectorStore'|'faq'|'parser'|'chunking'|'multimodal'|'asr'|'graph'|'advanced'|'storage';
const item=(key:KnowledgeSection,label:string,icon:string)=>({key,label,icon});
export function knowledgeSections(c:KnowledgeConfig){return [{label:'基础',items:[item('basic','基本信息','info'),item('models','模型配置','models'),item('vectorStore','向量存储','storage'),...(c.type==='faq'?[item('faq','FAQ 设置','chat')]:[])]},...(c.type==='faq'?[]:[{label:'索引与解析',items:[item('parser','解析引擎','file'),item('chunking','分块设置','book'),item('multimodal','图像处理','image'),item('asr','音频处理','voices'),item('graph','知识图谱','gateway'),item('advanced','高级设置','settings')]},{label:'存储与数据',items:[item('storage','存储引擎','cloud')]}])];}
export function defaultKnowledgeConfig(models:Connection[]=[],defaults:ModelDefaults={}):KnowledgeConfig{
 const first=(role:string)=>resolveDefaultModel(models,defaults,({LLM:'chat',Embedding:'embedding',VLLM:'vision',ASR:'asr'} as const)[role as 'LLM']||'chat');
 return {type:'document',name:'',description:'',indexingStrategy:{vectorEnabled:true,keywordEnabled:true,wikiEnabled:false,graphEnabled:false},modelConfig:{llmModelId:first('LLM'),embeddingModelId:first('Embedding'),wikiSynthesisModelId:''},vectorStoreId:'',wikiConfig:{autoGenerate:true,extractionGranularity:'standard',contentInstructions:'',extractionInstructions:''},faqConfig:{indexMode:'question_only',questionIndexMode:'separate'},chunkingConfig:{chunkSize:512,chunkOverlap:80,separators:['\n\n','\n','。','！','？',';','；'],parserEngineRules:[],enableParentChild:true,parentChunkSize:4096,childChunkSize:384,strategy:'auto',tokenLimit:0,languages:[],tableMetadataInstructions:''},multimodalConfig:{enabled:false,vllmModelId:first('VLLM'),descriptionLanguage:'',customInstructions:''},imageVectorEnabled:false,imagePipeline:'default',imagePipelineParams:{'default.caption_enabled':true,'default.ocr_enabled':true,'default.caption.thinking_enabled':false,'default.ocr.thinking_enabled':false,'smartocr.ocr_on_unobserved':true,'smartocr.preprocess.mode':'off','smartocr.observation.thinking_enabled':false,'smartocr.ocr.thinking_enabled':false},asrConfig:{enabled:false,modelId:first('ASR'),language:''},nodeExtractConfig:{enabled:false,text:'',tags:[],nodes:[],relations:[],customInstructions:''},questionGenerationConfig:{enabled:true,modelId:defaults.utility&&models.some(m=>m.id===defaults.utility&&(m.role||'LLM')==='LLM')?defaults.utility:'',questionCount:3,customInstructions:''},autoTagConfig:{enabled:false,modelId:'',maxTags:3,skipIfTagged:true},profileConfig:{enabled:false,modelId:'',customInstructions:''},storageBackendId:'',storageProvider:''};
}
export function restoreKnowledgeConfig(k:Knowledge|undefined,models:Connection[],defaults:ModelDefaults={}):KnowledgeConfig{
 const base=defaultKnowledgeConfig(models,defaults);if(!k)return base;
 if(k.configuration)return structuredClone(k.configuration);
 return {...base,name:k.name,description:k.desc,type:k.kind||'document',...(k.options?{modelConfig:{...base.modelConfig,embeddingModelId:k.options.embedding},chunkingConfig:{...base.chunkingConfig,chunkSize:k.options.chunkSize,chunkOverlap:k.options.overlap}}:{})};
}
export function changeIndexing(c:KnowledgeConfig,search:boolean,wiki:boolean,chunkingDirty:boolean):KnowledgeConfig{
 const wikiOnly=wiki&&!search;
 return {...c,indexingStrategy:{...c.indexingStrategy,vectorEnabled:search,keywordEnabled:search,wikiEnabled:wiki},chunkingConfig:chunkingDirty?c.chunkingConfig:{...c.chunkingConfig,chunkSize:wikiOnly?2048:512,chunkOverlap:wikiOnly?0:80,enableParentChild:!wikiOnly}};
}
export type KnowledgeConfigError={section:KnowledgeSection;field:string;message:string};
export function validateKnowledgeConfig(c:KnowledgeConfig,models:Connection[]):KnowledgeConfigError[]{
 const errors:KnowledgeConfigError[]=[],fail=(section:KnowledgeSection,field:string,message:string)=>errors.push({section,field,message});
 const model=(id:string,role:string,section:KnowledgeSection,field:string,label:string,required=true)=>{if(!id&&!required)return;if(!models.some(m=>m.id===id&&(m.role||'LLM')===role&&m.enabled!==false))fail(section,field,`请选择已配置且启用的 ${label}`);};
 if(!c.name.trim()||Array.from(c.name.trim()).length>50)fail('basic','name','请填写 1～50 字知识库名称');
 if(Array.from(c.description).length>200)fail('basic','description','知识库描述最多 200 字');
 const rag=c.type==='faq'||c.indexingStrategy.vectorEnabled||c.indexingStrategy.keywordEnabled;
 if(c.type==='document'&&!Object.values(c.indexingStrategy).some(Boolean))fail('basic','indexing','请至少启用一种索引策略');
 model(c.modelConfig.llmModelId,'LLM','models','llm','LLM 模型');
 model(c.modelConfig.embeddingModelId,'Embedding','models','embedding','Embedding 模型',rag);
 if(c.indexingStrategy.wikiEnabled)model(c.modelConfig.wikiSynthesisModelId,'LLM','models','wiki','Wiki 合成模型',false);
 if(c.type==='faq'){
  if(!['question_only','question_answer'].includes(c.faqConfig.indexMode)||!['combined','separate'].includes(c.faqConfig.questionIndexMode))fail('faq','index','请选择有效的 FAQ 索引方式');
  return errors;
 }
 const b=c.chunkingConfig;
 for(const message of validateParserRules(b.parserEngineRules))fail('parser','parser',message);
 const range=(field:keyof typeof b,min:number,max:number)=>{const value=b[field];if(typeof value!=='number'||!Number.isInteger(value)||value<min||value>max)fail('chunking',String(field),`分块参数 ${field} 须在 ${min}～${max} 之间`);};
 range('chunkSize',100,4000);range('chunkOverlap',0,500);range('tokenLimit',0,8192);
 if(b.chunkOverlap>=b.chunkSize||b.chunkOverlap>b.chunkSize/2)fail('chunking','chunkOverlap','重叠长度不能超过分块大小的一半');
 if(b.enableParentChild){range('parentChunkSize',512,8192);range('childChunkSize',64,2048);if(b.childChunkSize>=b.parentChunkSize)fail('chunking','childChunkSize','子块必须小于父块');}
 if(!['auto','heading','heuristic','legacy'].includes(b.strategy))fail('chunking','strategy','请选择有效分块策略');
 if(!b.separators.length||b.separators.some(s=>!s.length))fail('chunking','separators','至少保留一个非空分隔符');
 if(c.multimodalConfig.enabled){
  model(c.multimodalConfig.vllmModelId,'VLLM','multimodal','vllm','视觉模型');
  if(c.imageVectorEnabled)model(c.modelConfig.embeddingModelId,'Embedding','multimodal','imageVector','图片向量模型');
  if(c.imagePipeline==='default'&&!c.imagePipelineParams['default.caption_enabled']&&!c.imagePipelineParams['default.ocr_enabled'])fail('multimodal','pipeline','至少开启图片描述或文字识别中的一项');
 }
 if(c.asrConfig.enabled)model(c.asrConfig.modelId,'ASR','asr','asr','ASR 模型');
 if(c.nodeExtractConfig.enabled){const g=c.nodeExtractConfig,names=g.nodes.map(n=>n.name.trim());if(names.some(n=>!n)||new Set(names).size!==names.length)fail('graph','nodes','实体名称不能为空或重复');if(g.relations.some(r=>!names.includes(r.node1)||!names.includes(r.node2)||!r.type.trim()))fail('graph','relations','关系须选择存在的实体并填写类型');}
 if(c.questionGenerationConfig.enabled&&rag){model(c.questionGenerationConfig.modelId||c.modelConfig.llmModelId,'LLM','advanced','questionModel','问题生成模型');if(!Number.isInteger(c.questionGenerationConfig.questionCount)||c.questionGenerationConfig.questionCount<1||c.questionGenerationConfig.questionCount>10)fail('advanced','questionCount','问题数量须为 1～10');}
 if(c.autoTagConfig.enabled){model(c.autoTagConfig.modelId||c.modelConfig.llmModelId,'LLM','advanced','tagModel','标签模型');if(!Number.isInteger(c.autoTagConfig.maxTags)||c.autoTagConfig.maxTags<1||c.autoTagConfig.maxTags>10)fail('advanced','maxTags','标签数量须为 1～10');}
 if(c.profileConfig.enabled)model(c.profileConfig.modelId||c.modelConfig.llmModelId,'LLM','advanced','profileModel','画像模型');
 return errors;
}
export function knowledgeIndexChanged(before:KnowledgeConfig,after:KnowledgeConfig){const payload=({name,description,...config}:KnowledgeConfig)=>config;return JSON.stringify(payload(before))!==JSON.stringify(payload(after));}
export function saveKnowledgeConfig(c:KnowledgeConfig,models:Connection[],id:string,scope:'private'|'workspace'|'public',old?:Knowledge,hasFiles=false,defaults:ModelDefaults={}):Knowledge{
 if(old){const prior=restoreKnowledgeConfig(old,models);if(prior.type!==c.type)throw Error('知识库类型创建后不可修改');if(old.configuration&&prior.vectorStoreId!==c.vectorStoreId)throw Error('向量存储创建后不可变更');if(hasFiles){if(prior.modelConfig.embeddingModelId!==c.modelConfig.embeddingModelId)throw Error('已有资料，无法修改 Embedding 模型');if(JSON.stringify(prior.indexingStrategy)!==JSON.stringify(c.indexingStrategy))throw Error('已有资料，无法修改索引策略');if(prior.storageBackendId!==c.storageBackendId)throw Error('已有资料，存储迁移需真实服务接入');}}
 const errors=validateKnowledgeConfig(c,models);if(errors.length)throw Error(errors[0].message);
 const config=structuredClone({...c,name:c.name.trim(),description:c.description.trim()});
 return {...old,id,name:config.name,desc:config.description,count:old?.count||0,color:old?.color||'#5270df',scope:old?.scope||scope,kind:config.type,configuration:config,options:{topK:old?.options?.topK??5,threshold:old?.options?.threshold??.2,rerank:old?old.options?.rerank||'':resolveDefaultModel(models,defaults,'rerank'),external:old?.options?.external||'',mode:config.indexingStrategy.vectorEnabled?'混合检索':'文本匹配',chunkSize:config.chunkingConfig.chunkSize,overlap:config.chunkingConfig.chunkOverlap,embedding:config.modelConfig.embeddingModelId}};
}
