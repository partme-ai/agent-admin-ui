import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStore,reviseAgent} from '../src/state.ts';
import {initialProduct} from '../src/product_state.ts';
import {cloneAgentRuntime} from '../src/feature_state.ts';
import {cloneRoleProfile,roleConfigFingerprint} from '../src/role_profile.ts';
import {linkageIssues,resourceFingerprint,simulateAgentTurn,hasCurrentAgentCheck,settleAgentTurn,retainCurrentAgentChecks} from '../src/agent_linkage.ts';
const fixture=()=>{const store=initialStore(),product=initialProduct();return {store,skills:product.skills,host:'desktop' as const};};
test('默认字段的规范化保存不使同一配置的调试失效',()=>{
 const env=fixture(),a=env.store.agents[0];
 const normalized={...a,runtime:cloneAgentRuntime(a.runtime),context:true,memory:false};
 assert.equal(roleConfigFingerprint(a),roleConfigFingerprint(normalized));
});
test('停用插件、失效MCP授权、移除技能与知识均会阻止发布校验',()=>{
 const env=fixture(),a=env.store.agents[0];
 env.store.extensions[0].enabled=false;
 assert.ok(linkageIssues(a,env).some(x=>x.kind==='plugins'));
 const p=cloneRoleProfile(a.profile);p.extensions=[];p.connectionTools={missing:['search']};p.skills=['missing'];
 const issues=linkageIssues({...a,knowledge:['missing'],profile:p},env);
 for(const kind of ['knowledge','connections','skills'])assert.ok(issues.some(x=>x.kind===kind));
});
test('回复读取所选文档与当前角色记忆，其他角色记忆不进入请求',()=>{
 const env=fixture(),a=env.store.agents[0];a.runtime={...cloneAgentRuntime(),memoryMode:'本地独立记忆'};
 env.store.roleMemories.a1=[{id:'local',subject:'Alex',content:'喜欢蓝色',source:'手动',updated:'今天'}];
 env.store.roleMemories.a2=[{id:'private',subject:'其他人',content:'不应串用的记忆',source:'手动',updated:'今天'}];
 const run=simulateAgentTurn(a,'知识库',env);
 assert.ok(run.references.length);assert.match(run.request.instructions,/知识助手/);
 assert.match(JSON.stringify(run.request),/喜欢蓝色/);assert.doesNotMatch(JSON.stringify(run.request),/不应串用/);
 assert.equal(run.model.id,a.model);
 const memory=simulateAgentTurn(a,'请记住：我喜欢简短回答',env);assert.equal(memory.memoryWrite?.content,'我喜欢简短回答');
 assert.equal(simulateAgentTurn({...a,runtime:{...a.runtime,memoryMode:'无记忆'}},'请记住：测试',env).memoryWrite,undefined);
});
test('技能/MCP受角色装配与逐工具授权约束，资源更新使验证指纹改变',()=>{
 const env=fixture(),a=env.store.agents[0],p=cloneRoleProfile(a.profile);
 env.store.extensions.push({id:'mcp-test',name:'模拟工具',desc:'',layer:'business',scope:'只读',enabled:true,kind:'服务 MCP',tools:['search'],executionTarget:'server',transport:'streamable-http'});
 p.connectionTools={'mcp-test':['search']};a.profile=p;
 assert.match(simulateAgentTurn(a,'/skill knowledge',env).text,/知识问答/);
 assert.equal(simulateAgentTurn(a,'/tool mcp-test search',env).events.some(x=>x.kind==='connections'&&x.status==='模拟完成'),true);
 assert.equal(simulateAgentTurn(a,'/tool mcp-test delete',env).blocked,true);
 const old=resourceFingerprint(a,env);env.skills[0].version='2.0';assert.notEqual(resourceFingerprint(a,env),old);
 const published=reviseAgent(a,a,true);a.knowledge=[];assert.deepEqual(published.publishedConfig?.knowledge,['k1']);
});

test('取消轮次不提交记忆及发布资格；完成后资格覆盖配置与依赖',()=>{
 const env=fixture(),a=env.store.agents[0];a.runtime={...cloneAgentRuntime(),memoryMode:'本地独立记忆'};
 const turn=simulateAgentTurn(a,'请记住：我喜欢蓝色',env);
 const cancelled=settleAgentTurn(turn,false);assert.equal(cancelled.run.status,'interrupted');assert.equal(cancelled.memoryWrite,undefined);assert.equal(cancelled.check,undefined);
 const done=settleAgentTurn(turn,true);assert.equal(done.run.status,'completed');assert.equal(done.memoryWrite?.content,'我喜欢蓝色');assert.ok(hasCurrentAgentCheck(a,env,done.check));
 const saved=reviseAgent(a,a,false);assert.ok(hasCurrentAgentCheck(saved,env,done.check),'保存同一配置后不丢失资格');
 const published=reviseAgent(saved,saved,true);assert.ok(published.publishedConfig);assert.ok(hasCurrentAgentCheck(published,env,done.check));
 assert.equal(published.publishedConfig?.model,a.model);
 const draft={...published,instructions:'新的未发布提示词',knowledge:[]};assert.equal(hasCurrentAgentCheck(draft,env,done.check),false);assert.notEqual(published.publishedConfig?.instructions,draft.instructions);
 env.skills[0].version='2.0';assert.equal(hasCurrentAgentCheck(published,env,done.check),false);
});
test('未授权工具与敏感输入不形成完成资格，无记忆不携带上下文',()=>{
 const env=fixture(),a=env.store.agents[0];const blocked=simulateAgentTurn(a,'/tool missing delete',env);assert.equal(settleAgentTurn(blocked,true).check,undefined);
 a.runtime={...cloneAgentRuntime(),memoryMode:'无记忆'};assert.deepEqual(simulateAgentTurn(a,'你好',env,[{role:'user',text:'秘密历史'}]).request.history,[]);
});

test('资源停用立即撤销旧凭证，重新启用不恢复；无关记忆更新保留凭证',()=>{
 const env=fixture(),a=env.store.agents[0],done=settleAgentTurn(simulateAgentTurn(a,'验证关联',env),true),checks={[a.id]:done.check!};
 env.store.roleMemories[a.id]=[];assert.equal(retainCurrentAgentChecks(env,checks),checks);
 env.store.extensions[0].enabled=false;const invalidated=retainCurrentAgentChecks(env,checks);assert.deepEqual(invalidated,{});
 env.store.extensions[0].enabled=true;assert.deepEqual(retainCurrentAgentChecks(env,invalidated),{});
 assert.deepEqual(simulateAgentTurn({...a,context:false},'你好',env,[{role:'user',text:'不携带'}]).request.history,[]);
});
