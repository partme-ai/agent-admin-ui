import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultAgentRuntime,cloneAgentRuntime,validateContextSource,chunkText,validateEntry,filterRecords} from '../src/feature_state.ts';
import {initialStore,reviseAgent} from '../src/state.ts';
import {restoreAgentVersion} from '../src/capability.ts';

test('发布及恢复保留完整语音、上下文源与路由组合，版本互不共享引用',()=>{
 const a={...initialStore().agents[0],runtime:{...defaultAgentRuntime(),tags:['客厅'],sources:[{id:'s1',name:'日程',url:'https://example.com/context',headers:{'X-Site':'demo'}}],replacements:[{from:'TinyBot',to:'小小机器人'}]}};
 const published=reviseAgent(a,a,true);
 a.runtime.sources[0].headers['X-Site']='changed';
 assert.equal(published.publishedConfig?.runtime?.sources[0].headers['X-Site'],'demo');
 const version=published.versions!.at(-1)!;
 const restored=restoreAgentVersion({...published,runtime:{...defaultAgentRuntime(),language:'English'}},version);
 assert.equal(restored.runtime?.language,'普通话');
 assert.equal(restored.runtime?.replacements[0].to,'小小机器人');
 const cloned=cloneAgentRuntime(restored.runtime);cloned.tags.push('新标签');
 assert.deepEqual(restored.runtime?.tags,['客厅']);
});

test('上下文源不接受夹带凭据的地址或认证头',()=>{
 assert.match(validateContextSource({id:'1',name:'源',url:'https://u:p@example.com',headers:{}}),/凭据/);
 assert.match(validateContextSource({id:'1',name:'源',url:'https://example.com?api_key=secret',headers:{}}),/凭据/);
 assert.match(validateContextSource({id:'1',name:'源',url:'https://example.com',headers:{Authorization:'secret'}}),/凭据/);
 assert.equal(validateContextSource({id:'1',name:'源',url:'https://example.com',headers:{'X-Site':'demo'}}),'');
});

test('切片遵守重叠窗口，非法配置失败而不是伪造索引成功',()=>{
 assert.deepEqual(chunkText('abcdefghij',5,2),['abcde','defgh','ghij']);
 assert.deepEqual(chunkText('',5,0),[]);
 assert.throws(()=>chunkText('abc',3,3),/重叠/);
});

test('参数字典的类型与唯一键受约束，记录筛选组合生效',()=>{
 assert.match(validateEntry({id:'2',group:'系统参数',key:'timeout',value:'abc',type:'number'},[]),/数字/);
 assert.match(validateEntry({id:'2',group:'系统参数',key:'timeout',value:'30',type:'number'},[{id:'1',group:'系统参数',key:'timeout',value:'20',type:'number'}]),/重复/);
 const list=[{id:'1',agent:'a1',device:'b1',date:'2026-11-05',text:'绑定设备'},{id:'2',agent:'a2',device:'b2',date:'2026-11-04',text:'绑定设备'}];
 assert.equal(filterRecords(list,{agent:'a1',device:'b1',start:'2026-11-05',end:'2026-11-05',query:'绑定'}).length,1);
 assert.equal(filterRecords(list,{agent:'a1',device:'b2'}).length,0);
});

test('已删除切片不回退到原始文档，显式模型组合发布前检查用途与就绪',async()=>{
 const {indexedDocumentText,validateAgentRuntime}=await import('../src/feature_state.ts');
 assert.equal(indexedDocumentText({text:'原文',chunks:[]}), '');
 assert.equal(indexedDocumentText({text:'原文',chunks:['修改后']}),'修改后');
 const v={...defaultAgentRuntime(),bindings:{ASR:'m1'}};
 assert.match(validateAgentRuntime(v,initialStore().connections),/用途不匹配/);
 assert.match(validateAgentRuntime({...v,bindings:{ASR:'missing'}},[]),/尚未就绪/);
 assert.match(validateAgentRuntime({...defaultAgentRuntime(),memoryMode:'mem0'},[]),/记忆连接/);
 assert.equal(validateAgentRuntime(defaultAgentRuntime(),[]),'');
});

test('新增上下文或记忆配置时保留有效的默认音色',async()=>{
 const {ttsModels,voicesForModel}=await import('../src/voice_catalog.ts');const v=defaultAgentRuntime();
 const model=ttsModels.find(m=>m.id===v.ttsModel)!;assert.ok(voicesForModel(model,[]).some(voice=>voice.key===v.voice));
});

test('保存新草稿保留独立发布版本号，发布后再更新实际服务版本',()=>{
 const a=initialStore().agents[0];const draft=reviseAgent({...a,name:'新草稿'},a,false);
 assert.equal(draft.revision,4);assert.equal(draft.publishedRevision,3);
 const published=reviseAgent(draft,draft,true);assert.equal(published.publishedRevision,5);
 const restored=restoreAgentVersion(published,published.versions![0]);assert.equal(restored.publishedRevision,5);
});
