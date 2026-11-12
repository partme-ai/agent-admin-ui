import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStore,reviseAgent} from '../src/state.ts';
import {initialProduct} from '../src/product_state.ts';
import {cloneAgentRuntime,validateAgentRuntime,bindPreviewDevice} from '../src/feature_state.ts';
import {cloneRoleProfile,canBindRole} from '../src/role_profile.ts';
import {runtimeWithModelDefaults} from '../src/role_loadout.ts';
import {createMarketRole,roleMarketTemplates} from '../src/role_market.ts';
import * as settings from '../src/settings_integration.ts';
import * as linkage from '../src/agent_linkage.ts';
const {prepareModelForSimulation}=settings;
const {linkageIssues,resourceFingerprint,simulateAgentTurn,settleAgentTurn,resolveTrialAgent,completedTrialCheck,hasCurrentAgentCheck}=linkage;

const fixture=()=>{const store=initialStore(),product=initialProduct();return {store,skills:product.skills,station:product.station,host:'web' as const};};
test('新建时显式默认能力覆盖工作空间基线，不回写已有智能体',()=>{
 const env=fixture(),before=JSON.stringify(env.store.agents),base=cloneAgentRuntime();base.bindings.ASR='old';
 env.store.connections.push({id:'new-asr',name:'识别',provider:'test',model:'asr',role:'ASR',enabled:true,status:'待检测'});
 assert.equal(runtimeWithModelDefaults(base,env.store.connections,{asr:'new-asr'}).bindings.ASR,'new-asr');
 assert.equal(base.bindings.ASR,'old');assert.equal(JSON.stringify(env.store.agents),before);
});
test('主模型分类、记忆与工具模型状态共同决定发布资格',()=>{
 const env=fixture(),agent=env.store.agents[0];
 env.store.connections.push({id:'embed-new',name:'嵌入',provider:'test',model:'embed',role:'Embedding',status:'演示可用',enabled:true});
 assert.ok(linkageIssues({...agent,model:'embed-new'},env).some(x=>x.kind==='models'));
 const r={...cloneAgentRuntime(),longTermMemory:{enabled:true,mode:'explicit' as const,model:'m1',embedding:'embed-new',semantic:true,delay:30,interval:60,maxItems:200,rules:'',conditioning:true}};
 env.store.connections.find(m=>m.id==='m1')!.status='待检测';assert.match(validateAgentRuntime(r,env.store.connections),/记忆提取/);
 env.store.connections.find(m=>m.id==='m1')!.status='演示可用';env.store.connections.find(m=>m.id==='embed-new')!.status='待检测';assert.match(validateAgentRuntime(r,env.store.connections),/嵌入/);
 env.station.tools.push({id:'ocr-new',name:'图像理解',category:'ocr',adapter:'Mistral',target:'server',endpoint:'https://example.test',credentialRef:'ref',modelId:'embed-new',languages:[],enabled:true});
 assert.ok(linkageIssues({...agent,runtime:{...cloneAgentRuntime(),stationTools:['ocr-new']}},env).some(x=>x.kind==='models'));
});
test('依赖指纹包含记忆提取与工具模型，普通记忆记录更新不撤销调试',()=>{
 const env=fixture(),agent=env.store.agents[0];env.store.connections.push({...env.store.connections[0],id:'memory-new'},{...env.store.connections[0],id:'vision-new',role:'VLLM'});
 agent.runtime={...cloneAgentRuntime(),longTermMemory:{enabled:true,mode:'explicit',model:'memory-new',embedding:'',semantic:false,delay:30,interval:60,maxItems:200,rules:'',conditioning:true},stationTools:['ocr-new']};
 env.station.tools.push({id:'ocr-new',name:'图像',category:'ocr',adapter:'Mistral',target:'server',endpoint:'https://example.test',credentialRef:'ref',modelId:'vision-new',languages:[],enabled:true});
 const old=resourceFingerprint(agent,env);env.store.roleMemories[agent.id]=[];assert.equal(resourceFingerprint(agent,env),old);
 env.store.connections.find(m=>m.id==='memory-new')!.model='changed';assert.notEqual(resourceFingerprint(agent,env),old);
 const next=resourceFingerprint(agent,env);env.store.connections.find(m=>m.id==='vision-new')!.model='changed';assert.notEqual(resourceFingerprint(agent,env),next);
});
test('新连接→默认值→新智能体→调试→发布→设备，携带实际资源且不串用其他智能体',()=>{
 const env=fixture(),connection=prepareModelForSimulation({...env.store.connections[0],id:'fresh-model',name:'新模型连接',status:'待检测'},'验证配置');env.store.connections.push(connection);
 const agent=createMarketRole(roleMarketTemplates[0],env.store.connections,{chat:connection.id});agent.id='fresh-agent';agent.profile=cloneRoleProfile(agent.profile);agent.profile.extensions=[];agent.profile.skills=['knowledge'];agent.profile.connectionTools={};agent.knowledge=['k1'];agent.tools=['knowledge'];
 agent.runtime={...cloneAgentRuntime(agent.runtime),sandboxId:'server-default',stationTools:['search-new'],memoryMode:'本地独立记忆'};
 env.station.tools.push({id:'search-new',name:'独立搜索',category:'search',adapter:'SearXNG',target:'server',endpoint:'https://example.test',credentialRef:'ref',modelId:'',languages:[],enabled:true});
 env.store.agents.push(agent);env.store.roleMemories[agent.id]=[{id:'memory-new',subject:'测试者',content:'只属于新智能体',source:'手动',updated:'今天',status:'active'}];
 const run=settleAgentTurn(simulateAgentTurn(agent,'验证关联',env),true).run;
 assert.equal(run.blocked,false);assert.equal(run.model.id,connection.id);assert.equal(run.request.sandbox?.id,'server-default');assert.equal(run.request.tools[0].id,'search-new');assert.ok(run.request.skills.some(s=>s.id==='knowledge'));assert.match(JSON.stringify(run.request.memory),/只属于新智能体/);assert.ok(run.references.length);
 const check=completedTrialCheck(agent,run,env);assert.ok(check);assert.ok(hasCurrentAgentCheck(agent,env,check));
 const published=reviseAgent(agent,agent,true);assert.ok(canBindRole(published));const bot=bindPreviewDevice(env.store.bots,{method:'manual',mac:'AE:11:22:33:44:55',name:'新设备',agent:published.id});assert.equal(bot.status,'待接入');assert.equal(bot.agent,agent.id);
 const edited={...published,instructions:'未发布的新提示词'};assert.equal(resolveTrialAgent(edited,false)?.instructions,edited.instructions);assert.equal(resolveTrialAgent(edited,true)?.instructions,published.publishedConfig?.instructions);assert.equal(completedTrialCheck(edited,run,env),undefined);
 env.station.tools[0].enabled=false;assert.equal(completedTrialCheck(agent,run,env),undefined);
});
test('中断、迟到和临时覆盖的调试结果不能成为当前配置的发布凭证',()=>{
 const env=fixture(),agent=env.store.agents[0],run=simulateAgentTurn(agent,'验证关联',env);
 assert.equal(completedTrialCheck(agent,run,env),undefined);
 assert.equal(completedTrialCheck(agent,settleAgentTurn(run,false).run,env),undefined);
 const done=settleAgentTurn(run,true).run;assert.ok(completedTrialCheck(agent,done,env));
 assert.equal(completedTrialCheck({...agent,knowledge:[]},done,env),undefined);
});

test('失效默认值不回退到旧基线；TTS 中央连接必须和声音目录一致',()=>{
 const env=fixture(),base=cloneAgentRuntime();base.bindings.ASR='m1';
 const r=runtimeWithModelDefaults(base,env.store.connections,{asr:'gone',tts:'gone'});assert.equal(r.bindings.ASR,'');assert.equal(r.ttsModel,'');
 const agent=env.store.agents[0];env.store.connections.push({id:'voice-new',name:'新语音',provider:'MiniMax',model:'speech-2.8-hd',role:'TTS',enabled:true,status:'演示可用'});
 agent.runtime={...cloneAgentRuntime(),bindings:{TTS:'voice-new'}};assert.ok(linkageIssues(agent,env).some(x=>x.kind==='voice'));
 const aligned={...agent,runtime:runtimeWithModelDefaults(undefined,env.store.connections,{tts:'voice-new'})};assert.equal(linkageIssues(aligned,env).some(x=>x.kind==='voice'),false);
});

test('知识库的嵌入连接也参与就绪校验及依赖失效',async()=>{
 const {defaultKnowledgeConfig}=await import('../src/knowledge_config.ts');const env=fixture(),agent=env.store.agents[0];
 env.store.connections.push({id:'knowledge-embedding',name:'知识向量',provider:'test',model:'embed-v1',role:'Embedding',status:'演示可用',enabled:true});
 const configuration=defaultKnowledgeConfig(env.store.connections,{embedding:'knowledge-embedding'});env.store.knowledge[0].configuration=configuration;
 const previous=resourceFingerprint(agent,env);env.store.connections.find(m=>m.id==='knowledge-embedding')!.model='embed-v2';assert.notEqual(resourceFingerprint(agent,env),previous);
 env.store.connections.find(m=>m.id==='knowledge-embedding')!.enabled=false;assert.ok(linkageIssues(agent,env).some(x=>x.kind==='knowledge'));
});
