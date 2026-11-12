import test from 'node:test';
import assert from 'node:assert/strict';
import {connectionProviderId,providerConnections,providerViews,providerModelRows} from '../src/model_provider_view.ts';
import {initialStore,type Connection} from '../src/state.ts';
import {configInitial,configOptions,switchConfigScope} from '../src/model_config.ts';

test('厂商列表保持目录与专属方案身份，图标文字、简介、模型及用途可用',()=>{
 assert.equal(new Set(providerViews.map(p=>p.id)).size,providerViews.length);
 for(const id of ['deepseek','bailian','azure','ollama']){
  const p=providerViews.find(p=>p.id===id)!;assert.ok(p.summary);assert.ok(p.mark);assert.ok(p.specialties.length);assert.ok(p.profile.schemes.length);
 }
 assert.equal(providerViews.find(p=>p.id==='bailian')?.kind,'模型平台');
});
test('旧连接保持厂商归属，未启用、待检测不计入可用，未知厂商不误归百炼',()=>{
 const a=initialStore().connections[0];assert.equal(connectionProviderId({...a,provider:'不存在的厂商',config:undefined}),undefined);
 assert.equal(connectionProviderId({...a,customProviderId:'p1'}),'custom:p1');
 const connections=[{...a,provider:'DeepSeek',config:undefined,status:'演示可用'},{...a,id:'x',provider:'DeepSeek',config:undefined,status:'待检测'},{...a,id:'y',provider:'DeepSeek',config:undefined,status:'演示可用',enabled:false}];
 const before=structuredClone(connections),result=providerConnections('deepseek',connections);
 assert.equal(result.configured.length,3);assert.equal(result.available.length,1);assert.deepEqual(connections,before);
});
test('双栏表单仍使用区域套餐联动，Azure 部署字段与本地服务鉴权独立',()=>{
 let d=configInitial('bailian');d=switchConfigScope(d,'region','新加坡');assert.ok(configOptions(d,'plan').includes('Coding Plan'));
 assert.ok(providerViews.find(p=>p.id==='azure')!.profile.schemes.some(s=>s.fields.some(f=>f.id==='apiVersion')));
 assert.equal(configInitial('ollama').auth,'none');
});

test('模型行合并目录与厂商自定义模型，保留多连接和停用状态而不混入其他厂商',()=>{
 const provider={id:'deepseek',models:['catalog-model','catalog-model']};
 const inputs:Connection[]=[
  {id:'a',name:'A',provider:'DeepSeek',model:'catalog-model',status:'待检测',enabled:false},
  {id:'b',name:'自定义部署',provider:'DeepSeek',model:'own-model',status:'待检测'},
  {id:'c',name:'C',provider:'DeepSeek',model:'own-model',status:'演示可用'},
  {id:'other',name:'其他平台',provider:'Ollama',model:'other-model',status:'演示可用'}
 ];
 const before=JSON.stringify(inputs);
 const rows=providerModelRows(provider,inputs);
 assert.deepEqual(rows.map(r=>r.id),['catalog-model','own-model']);
 assert.equal(rows[0].connections[0].enabled,false);
 assert.deepEqual(rows[1].connections.map(c=>c.id),['b','c']);
 assert.deepEqual(providerModelRows(provider,inputs,'自定义部署').map(r=>r.id),['own-model']);
 assert.equal(JSON.stringify(inputs),before);
});
