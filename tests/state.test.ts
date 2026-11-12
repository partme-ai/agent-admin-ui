import test from 'node:test';
import assert from 'node:assert/strict';
import {transitionMission,canPublish,capabilities,cleanConnection,resolvePage,normalizePreview} from '../src/state.ts';
test('受理不等于完成，未知结果不能重新执行',()=>{
 assert.equal(transitionMission('待审批','approve'),'已受理');
 assert.equal(transitionMission('已受理','start'),'执行中');
 assert.equal(transitionMission('执行中','timeout'),'待核实');
 assert.equal(transitionMission('待核实','start'),'待核实');
 assert.equal(transitionMission('待核实','reconcile'),'已完成');
 assert.equal(transitionMission('执行中','cancel'),'取消请求中');
 assert.equal(transitionMission('取消请求中','confirmCancel'),'已取消');
});
test('发布依赖就绪，知识索引必须完成',()=>{
 assert.equal(canPublish('待检测',false),false);
 assert.equal(canPublish('演示可用',false),false);
 assert.equal(canPublish('演示可用',true),true);
});
test('原生插件与业务扩展的平台边界',()=>{
 assert.equal(capabilities('ipad').serial,false);
 assert.equal(capabilities('android').background,false);
 assert.equal(capabilities('web').native,false);
 assert.equal(capabilities('desktop').serial,true);
});
test('模型持久记录去除凭据和未知字段',()=>{
 const result=cleanConnection({id:'m1',name:'测试',provider:'OpenAI',model:'gpt',apiKey:'secret',password:'secret',status:'待检测'});
 assert.equal(JSON.stringify(result).includes('secret'),false);
 assert.equal(result.name,'测试');
});
test('深链覆盖 34 页，非法路径不伪装正常页',()=>{
 assert.equal(resolvePage('/w/demo/agents/templates'),'05');
 assert.equal(resolvePage('/w/demo/agents/new/edit'),'04');
 assert.equal(resolvePage('/w/demo/models/voice-pipeline'),'33');
 assert.equal(resolvePage('/w/demo/knowledge/k1/documents/d1'),'10');
 assert.equal(resolvePage('/arbitrary'),'404');
});
test('三端预览消息只接受有效导航，不能携带写入或草稿',()=>{
 assert.deepEqual(normalizePreview({page:'08',theme:'dark',submit:true,apiKey:'secret'}),{page:'08',theme:'dark'});
 assert.equal(normalizePreview({page:'unknown',theme:'bad'}),null);
 assert.deepEqual(normalizePreview({page:'08',theme:'dark',style:'compact',apiKey:'secret'}),{page:'08',theme:'dark',style:'compact'});
 assert.deepEqual(normalizePreview({page:'08',theme:'dark',style:'unsafe'}),{page:'08',theme:'dark'});
});

test('书签恢复设备和文档上下文',async()=>{
 const {selectionFromPath}=await import('../src/state.ts');
 assert.equal(selectionFromPath('#/w/demo/devices/b2/control'),'b2');
 assert.equal(selectionFromPath('#/w/demo/knowledge/k1/documents/d2'),'d2');
 assert.equal(selectionFromPath('#/w/demo/models/connections/new?item=OpenAI'),'OpenAI');
});

test('修改草稿不替换已发布配置，发布才冻结新快照',async()=>{
 const {initialStore,reviseAgent}=await import('../src/state.ts');
 const original=initialStore().agents[0];
 const edited={...original,instructions:'新的草稿说明'};
 const saved=reviseAgent(edited,original,false);
 assert.equal(saved.publishedConfig?.instructions,original.instructions);
 assert.equal(saved.instructions,'新的草稿说明');
 const published=reviseAgent(saved,saved,true);
 assert.equal(published.publishedConfig?.instructions,'新的草稿说明');
});
