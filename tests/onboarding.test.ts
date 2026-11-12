import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStore,reviseAgent} from '../src/state.ts';
import {initialProduct} from '../src/product_state.ts';
import {simulateAgentTurn,settleAgentTurn} from '../src/agent_linkage.ts';
import {defaultOnboarding,readOnboarding,onboardingSteps,onboardingTarget,onboardingKey,probeOnboardingModel} from '../src/onboarding.ts';
import {configInitial,modelConfigSnapshot} from '../src/model_config.ts';
const fixture=()=>({store:initialStore(),skills:initialProduct().skills,host:'web' as const,checks:initialProduct().agentChecks});
test('示例资源存在不等于已完成首次配置，跳过不是成功',()=>{
 const env=fixture(),state=defaultOnboarding();
 assert.equal(onboardingSteps(state,env).filter(s=>s.status==='done').length,0);
 state.skipped=['knowledge'];
 assert.equal(onboardingSteps(state,env)[1].status,'skipped');
 assert.deepEqual(onboardingTarget('publish',state,env),{step:'model',page:'06',item:''});
});
test('模型必须启用且本地检测通过，知识必须有非空已索引文本',()=>{
 const env=fixture(),state={...defaultOnboarding(),modelId:'m1',knowledgeId:'k1'};
 assert.equal(onboardingSteps(state,env)[0].status,'done');
 env.store.connections[0].status='待检测';assert.equal(onboardingSteps(state,env)[0].status,'pending');
 env.store.connections[0].status='演示可用';
 env.store.docs.forEach(d=>d.status='待解析');assert.equal(onboardingSteps(state,env)[1].status,'pending');
 env.store.docs[0].status='已索引';env.store.docs[0].text='';assert.equal(onboardingSteps(state,env)[1].status,'pending');
});
test('新模型必须校验保存字段；失败、重试、停用保留真实本地状态',()=>{
 const draft={...configInitial('ollama'),model:'qwen3:8b',modelMode:'manual' as const};
 const model={id:'new',name:draft.name,provider:'Ollama',model:draft.model,status:'待检测',role:'LLM',enabled:true,config:modelConfigSnapshot(draft)};
 assert.equal(probeOnboardingModel(model,'network').ok,false);
 assert.equal(probeOnboardingModel(model,'auth').status,'检测失败');
 assert.equal(probeOnboardingModel(model).status,'演示可用');
 assert.equal(probeOnboardingModel({...model,enabled:false}).ok,false);
 assert.equal(probeOnboardingModel({...model,config:{...model.config,endpointTemplate:'invalid'}}).ok,false);
 const env=fixture(),state={...defaultOnboarding(),modelId:'m1'};
 assert.deepEqual(onboardingTarget('model',state,env),{step:'model',page:'07',item:'m1'});
});
test('自定义提供方按已保存字段定义校验，不能用成功演练绕过缺项',()=>{
 const providers=[{id:'local',name:'自有服务',roles:['LLM'],protocol:'HTTP JSON',endpoint:'http://localhost:8080',fields:'[{"key":"model","label":"模型标识","required":true}]'}];
 const model={id:'custom',name:'本地模型',provider:'自有服务',model:'qwen3',endpoint:'http://localhost:8080',role:'LLM',status:'待检测',enabled:true,customProviderId:'local',customFields:{model:''}};
 assert.equal(probeOnboardingModel(model,'success',providers).ok,false);
 assert.equal(probeOnboardingModel({...model,customFields:{model:'qwen3'}},'success',providers).ok,true);
 assert.equal(probeOnboardingModel({...model,customFields:{model:'qwen3'}},'success',[]).ok,false);
});
test('同一个模型和知识库贯通智能体、正常完成的试聊、当前发布快照',()=>{
 const env=fixture(),state={...defaultOnboarding(),active:true,modelId:'m1',knowledgeId:'k1',agentId:'a1'};
 const before=JSON.stringify(env.store);
 assert.equal(onboardingSteps(state,env)[2].status,'done');
 assert.equal(onboardingSteps(state,env)[3].status,'pending');
 assert.deepEqual(onboardingTarget('publish',state,env),{step:'trial',page:'02',item:'a1'});
 assert.equal(JSON.stringify(env.store),before,'计算引导不修改原配置');
 const a=env.store.agents[0],run=simulateAgentTurn(a,'验证关联',env),cancelled=settleAgentTurn(run,false);
 assert.equal(cancelled.check,undefined);
 env.checks[a.id]=settleAgentTurn(run,true).check!;
 assert.equal(onboardingSteps(state,env)[3].status,'done');
 assert.equal(onboardingSteps(state,env)[4].status,'pending','初始发布标记不能替代发布快照');
 env.store.agents[0]=reviseAgent(a,a,true);
 assert.equal(onboardingSteps(state,env).every(s=>s.status==='done'),true);
 env.store.agents[0].instructions='新的未测试 Prompt';
 assert.equal(onboardingSteps(state,env)[3].status,'pending');
 assert.equal(onboardingSteps(state,env)[4].status,'pending');
});
test('知识可稍后配置；依赖停用、实体删除或智能体改用其他模型会撤销就绪',()=>{
 const env=fixture(),state={...defaultOnboarding(),modelId:'m1',agentId:'a4',skipped:['knowledge'] as ['knowledge']};
 assert.equal(onboardingSteps(state,env)[2].status,'done');
 env.store.agents[3].model='m2';assert.equal(onboardingSteps(state,env)[2].status,'pending');
 state.modelId='m2';assert.equal(onboardingSteps(state,env)[2].status,'done');
 env.store.connections[1].enabled=false;assert.equal(onboardingSteps(state,env)[2].status,'pending');
 env.store.agents=[];assert.equal(onboardingSteps(state,env)[2].status,'pending');
});
test('曾跳过知识后选择已就绪知识库，必须真正关联到智能体',()=>{
 const env=fixture(),state={...defaultOnboarding(),modelId:'m1',knowledgeId:'k1',agentId:'a4',skipped:['knowledge'] as ['knowledge']};
 assert.equal(onboardingSteps(state,env)[2].status,'pending');
 env.store.agents[3].knowledge=['k1'];assert.equal(onboardingSteps(state,env)[2].status,'done');
});
test('继续位置独立保存，损坏或被禁用的存储可恢复且不读取其他配置键',()=>{
 const keys:string[]=[];
 const storage={getItem:(key:string)=>{keys.push(key);return JSON.stringify({active:true,intro:'paused',tourStep:2,current:'knowledge',modelId:'gone',skipped:['knowledge','bogus'],agentId:3});}};
 const state=readOnboarding(storage);
 assert.deepEqual(keys,[onboardingKey]);assert.equal(state.current,'knowledge');assert.equal(state.tourStep,2);
 assert.equal(state.agentId,'');assert.deepEqual(state.skipped,['knowledge']);
 assert.deepEqual(readOnboarding({getItem:()=>{throw Error('denied');}}),defaultOnboarding());
 assert.deepEqual(readOnboarding({getItem:()=>'{'}),defaultOnboarding());
 assert.equal(onboardingSteps(state,fixture())[0].status,'pending','刷新后消失的会话数据不能恢复成成功');
});
