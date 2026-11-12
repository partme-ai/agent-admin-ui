import test from 'node:test';
import assert from 'node:assert/strict';
import {shellGroups,shellTarget} from '../src/shell_layout.ts';
import {initialStation,checkBudget,queueInstall,updateInstall,validateSandbox,validateStorage,createArtifact} from '../src/station.ts';
test('最终菜单以设备为首，模型默认和工具归属明确',()=>{
 assert.deepEqual(shellGroups[0].items.map(x=>x.label),['工作台','设备(Bot)','模型','知识库','智能体','资源','系统']);
 for(const key of ['devices/gallery','models/local/environments','models/local/catalog','models/gateway/defaults','agents/sandbox','agents/tools/computer','agents/tools/browser','agents/tools/search','agents/tools/fetch','agents/tools/documents','agents/tools/ocr','resources/storage'])assert.ok(shellTarget(key),key);
 assert.equal(shellTarget('agents/memory'),undefined);assert.equal(shellTarget('system/cli'),undefined);
});
test('不足拒绝，压力确认，取消重试；任务不冒充真实安装',()=>{
 const s=initialStation(),h=s.hosts[0],req={ram:8,disk:5,vram:0};
 assert.equal(checkBudget({...h,ram:4},req).status,'blocked');assert.equal(checkBudget({...h,ram:10},req).status,'warning');
 assert.throws(()=>queueInstall(s,'server','model','sample',req,false));
 const next=queueInstall(s,'desktop','model','sample',req,false);assert.equal(next.tasks[0].state,'queued');
 const stopped=updateInstall(next,next.tasks[0].id,'cancelled');assert.equal(stopped.tasks[0].state,'cancelled');
 assert.equal(queueInstall(stopped,'desktop','model','sample',req,false).tasks.length,2);
 assert.throws(()=>updateInstall(stopped,stopped.tasks[0].id,'completed'));
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
test('模拟启动与停止检查主机、运行环境和多模型内存占用',async()=>{
 const {setModelRunning}=await import('../src/station.ts');let s=initialStation();
 s=queueInstall(s,'desktop','model','small',{ram:6,disk:2,vram:0,runtime:'ollama'},false);s=updateInstall(s,s.tasks[0].id,'completed');s=setModelRunning(s,s.tasks[0].id,true);assert.equal(s.tasks[0].running,true);s=setModelRunning(s,s.tasks[0].id,false);assert.equal(s.tasks[0].running,false);
 const bad={...s,hosts:s.hosts.map(h=>({...h,runtimes:[]}))};assert.throws(()=>setModelRunning(bad,s.tasks[0].id,true));
});
test('对话保存触发资格回收时保留当前沙箱依赖，停用后撤销且不自动恢复',async()=>{
 const {initialStore}=await import('../src/state.ts');const {initialProduct}=await import('../src/product_state.ts');const {simulateAgentTurn,settleAgentTurn,retainCurrentAgentChecks}=await import('../src/agent_linkage.ts');
 const store=initialStore(),p=initialProduct(),station=initialStation();store.agents[0]={...store.agents[0],runtime:{...store.voiceDefaults,sandboxId:'server-default'}};const a=store.agents[0],env={store,skills:p.skills,host:'web' as const,station};const run=simulateAgentTurn(a,'你好',env),settled=settleAgentTurn(run,true),checks={[a.id]:settled.check!};
 assert.equal(Object.keys(retainCurrentAgentChecks(env,checks)).length,1);station.sandboxes[0].enabled=false;const removed=retainCurrentAgentChecks(env,checks);assert.equal(Object.keys(removed).length,0);station.sandboxes[0].enabled=true;assert.equal(Object.keys(retainCurrentAgentChecks(env,removed)).length,0);
});
