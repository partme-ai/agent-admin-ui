import test from 'node:test';
import assert from 'node:assert/strict';
import {initialProduct,validateRule,simulateRule,filterUsage,parseSkill,usageTotals,validateRole,patchAgentDraft} from '../src/product_state.ts';
test('网关拒绝无目标、重复后备、非法阈值；停用规则不执行',()=>{
 const r=initialProduct().rules[0];
 assert.ok(validateRule({...r,targets:[]},['m1','m2']));
 assert.ok(validateRule({...r,kind:'fallback',targets:['m1','m1']},['m1','m2']));
 assert.ok(validateRule({...r,limit:0},['m1','m2']));
 assert.equal(validateRule(r,['m1','m2']),null);
 assert.equal(simulateRule({...r,enabled:false},{}).decision,'绕过');
 assert.equal(simulateRule({...r,kind:'fallback'}, {failed:['m1']}).target,'m2');
 assert.equal(simulateRule({...r,kind:'rate'}, {requests:9999}).decision,'拒绝');
 assert.equal(simulateRule({...r,kind:'breaker'}, {failures:9999}).decision,'熔断');
});
test('领域用量按应用、模型、设备过滤，未计量金额保持为空',()=>{
 const rows=initialProduct().usage;
 const selected=filterUsage(rows,{device:'b1',model:'qwen-plus'});
 assert.ok(selected.length>0);assert.ok(selected.every(r=>r.device==='b1'&&r.model==='qwen-plus'));
 assert.deepEqual(filterUsage(rows,{app:'missing'}),[]);
 assert.equal(usageTotals([{...rows[0],cost:null,tokens:null}]).cost,null);
 assert.ok((usageTotals(rows).cost||0)>0);
});
test('技能只接受有名称与正文的Markdown，不执行内容；角色名称与能力须完整',()=>{
 assert.equal(parseSkill('---\nname: test\ndescription: 测试\n---\n正文').name,'test');
 assert.throws(()=>parseSkill(''),/内容/);assert.throws(()=>parseSkill('无前置信息'),/name/);
 assert.ok(validateRole({id:'r',name:'',description:'',permissions:[]}));
 assert.equal(validateRole({id:'r',name:'查看者',description:'只读',permissions:['devices:read']}),null);
});

test('市场与技能修改草稿时保留旧发布快照，不改变原对象',()=>{
 const a={id:'a',name:'助手',desc:'',icon:'robot',color:'#000',model:'m1',knowledge:['k1'],instructions:'Prompt',published:true,revision:3};
 const next=patchAgentDraft(a,{knowledge:['k2']});
 assert.deepEqual(next.knowledge,['k2']);assert.deepEqual(next.publishedConfig?.knowledge,['k1']);assert.deepEqual(a.knowledge,['k1']);
 const again=patchAgentDraft(next,{instructions:'新Prompt'});assert.equal(again.publishedConfig?.instructions,'Prompt');
});
test('应用范围外不执行规则；鉴权错误不触发模型降级',()=>{
 const r=initialProduct().rules[0];
 assert.equal(simulateRule({...r,app:'TinyBot Desktop'},{app:'TinyBot Web'}).decision,'绕过');
 assert.equal(simulateRule({...r,kind:'fallback'},{failed:['m1'],fault:'auth'}).decision,'拒绝');
});
test('熔断冷却后半开，探测成功恢复，失败重新熔断',()=>{
 const r={...initialProduct().rules[0],kind:'breaker' as const,limit:3,window:30};
 assert.equal(simulateRule(r,{failures:3,elapsed:20}).decision,'熔断');
 assert.equal(simulateRule(r,{failures:3,elapsed:31}).decision,'半开');
 assert.equal(simulateRule(r,{failures:3,elapsed:31,probe:'success'}).decision,'恢复');
 assert.equal(simulateRule(r,{failures:3,elapsed:31,probe:'fail'}).decision,'熔断');
});
test('模型平台与客户端维度独立，不把厂商统计误归为设备平台',()=>{
 const rows=initialProduct().usage,selected=filterUsage(rows,{provider:'通义千问',platform:'Web'});
 assert.ok(selected.length);assert.ok(selected.every(r=>r.provider==='通义千问'&&r.platform==='Web'));
});
