import test from 'node:test';
import assert from 'node:assert/strict';
import {shellGroups,shellTarget} from '../src/shell_layout.ts';
import {initialStation,validateSandbox,validateStorage,createArtifact} from '../src/station.ts';
test('通用管理菜单移除设备与本地安装，模型默认和工具归属明确',()=>{
 assert.deepEqual(shellGroups[0].items.map(x=>x.label),['工作台','模型','知识库','智能体','资源','系统']);
 for(const key of ['models/gateway/defaults','agents/sandbox','agents/tools/computer','agents/tools/browser','agents/tools/search','agents/tools/fetch','agents/tools/documents','agents/tools/ocr','resources/storage'])assert.ok(shellTarget(key),key);
 assert.equal(shellTarget('agents/memory'),undefined);assert.equal(shellTarget('system/cli'),undefined);
});
test('沙箱与存储校验，产物严格保存来源',()=>{
 const s=initialStation();assert.equal(validateSandbox(s.sandboxes[0]),'');
 assert.ok(validateSandbox({...s.sandboxes[0],timeout:0}));assert.ok(validateStorage({...s.storage[0],id:'x',name:''}));
 const a=createArtifact('a1','s1','会话.md','你好');assert.equal(a.agentId,'a1');assert.equal(a.sessionId,'s1');assert.equal(a.content,'你好');assert.throws(()=>createArtifact('a1','','a.md',''));
});
test('沙箱或工具配置改变后旧调试资格失效；停用阻止调试',async()=>{
 const {initialStore}=await import('../src/state.ts');const {initialProduct}=await import('../src/product_state.ts');const {linkageIssues,resourceFingerprint,simulateAgentTurn}=await import('../src/agent_linkage.ts');
 const store=initialStore(),p=initialProduct(),station=initialStation();station.tools=[{id:'search1',name:'搜索',category:'search',adapter:'Tavily',target:'server',endpoint:'https://example.com',credentialRef:'demo',modelId:'',languages:[],enabled:true}];
 const agent={...store.agents[0],runtime:{...store.voiceDefaults,sandboxId:station.sandboxes[0].id,stationTools:['search1']}};const env={store,skills:p.skills,host:'web' as const,station};
 assert.equal(linkageIssues(agent,env).length,0);const before=resourceFingerprint(agent,env);station.tools[0].endpoint='https://new.example.com';assert.notEqual(resourceFingerprint(agent,env),before);
 const run=simulateAgentTurn(agent,'/builtin search1',env);assert.equal(run.blocked,false);assert.ok(run.events.some(x=>x.kind==='tools'));
 station.tools[0].enabled=false;assert.ok(linkageIssues(agent,env).some(x=>x.kind==='tools'));assert.equal(simulateAgentTurn(agent,'你好',env).blocked,true);
});
test('对话保存触发资格回收时保留当前沙箱依赖，停用后撤销且不自动恢复',async()=>{
 const {initialStore}=await import('../src/state.ts');const {initialProduct}=await import('../src/product_state.ts');const {simulateAgentTurn,settleAgentTurn,retainCurrentAgentChecks}=await import('../src/agent_linkage.ts');
 const store=initialStore(),p=initialProduct(),station=initialStation();store.agents[0]={...store.agents[0],runtime:{...store.voiceDefaults,sandboxId:'server-default'}};const a=store.agents[0],env={store,skills:p.skills,host:'web' as const,station};const run=simulateAgentTurn(a,'你好',env),settled=settleAgentTurn(run,true),checks={[a.id]:settled.check!};
 assert.equal(Object.keys(retainCurrentAgentChecks(env,checks)).length,1);station.sandboxes[0].enabled=false;const removed=retainCurrentAgentChecks(env,checks);assert.equal(Object.keys(removed).length,0);station.sandboxes[0].enabled=true;assert.equal(Object.keys(retainCurrentAgentChecks(env,removed)).length,0);
});
