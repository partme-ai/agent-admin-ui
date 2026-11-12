import test from 'node:test';
import assert from 'node:assert/strict';
import {configProfiles,configProfile,configInitial,configScheme,configOptions,switchConfigScope,validateModelConfig,configEndpoint} from '../src/model_config.ts';
test('厂商表单区分模型平台、官方模型、部署信息和本地推理',()=>{
 assert.ok(configProfiles.length>=175);
 assert.equal(configProfile('bailian')?.kind,'模型平台');assert.equal(configProfile('deepseek')?.kind,'官方模型');
 assert.ok(configProfile('bailian')?.schemes.some(s=>s.fields.some(f=>f.id==='workspaceId')));
 assert.ok(configProfile('azure')?.schemes.some(s=>s.fields.some(f=>f.id==='apiVersion')));
 assert.ok(configProfile('bedrock')?.schemes.some(s=>s.protocol==='bedrock-converse'));
 assert.equal(configInitial('ollama').auth,'none');
});
test('区域、套餐、协议只允许有效组合；切换后清除模型、凭据引用和专用字段',()=>{
 let d=configInitial('bailian');d={...d,model:'old-model',credentialRef:'demo:old',fields:{workspaceId:'old-workspace'}};
 d=switchConfigScope(d,'region','新加坡');assert.equal(configScheme(d)?.region,'新加坡');assert.equal(d.model,'');assert.equal(d.credentialRef,'');assert.deepEqual(d.fields,{});
 d=switchConfigScope(d,'plan','Coding Plan');assert.match(d.endpoint,/coding-intl/);assert.ok(!configScheme(d)?.fields.some(f=>f.id==='workspaceId'));
 d=switchConfigScope(d,'region','美国（弗吉尼亚）');assert.ok(!configOptions(d,'plan').includes('Coding Plan'));
 const same=switchConfigScope(d,'protocol','does-not-exist');assert.deepEqual(same,d);
});
test('模型列表与方案绑定，部署字段必填，地址不能夹带凭据',()=>{
 let d=configInitial('bailian');assert.ok(validateModelConfig(d).workspaceId);assert.ok(validateModelConfig(d).model);
 d={...d,fields:{workspaceId:'workspace-demo'},model:configScheme(d)!.models[0],credentialRef:`demo:${d.providerId}:${d.schemeId}:${d.auth}`};
 assert.match(configEndpoint(d),/workspace-demo/);assert.deepEqual(validateModelConfig(d),{});
 assert.ok(validateModelConfig({...d,model:'other-tenant-model'}).model);
 assert.ok(validateModelConfig({...d,endpoint:'https://user:secret@example.com/v1'}).endpoint);
});

 test('保存配置只保留方案字段，丢弃凭据和跨方案引用',async()=>{
 const {modelConfigSnapshot,demoCredentialRef}=await import('../src/model_config.ts');
 const d=configInitial('bailian');d.fields={workspaceId:'example',apiKey:'do-not-store'};d.parameters={temperature:'0.5',secret:'do-not-store'};d.credentialRef='demo:other';
 const snap=modelConfigSnapshot(d);assert.equal(JSON.stringify(snap).includes('do-not-store'),false);assert.equal(snap.credentialRef,'');
 d.credentialRef=demoCredentialRef(d);assert.equal(modelConfigSnapshot(d).credentialRef,d.credentialRef);
 });

test('旧连接恢复原模型地址，新连接默认使用当前方案模型列表；配置重新打开保留区域与参数',async()=>{
 const {restoreModelConfig}=await import('../src/model_config_restore.ts');
 const {modelConfigSnapshot}=await import('../src/model_config.ts');
 assert.equal(restoreModelConfig('new').modelMode,'catalog');
 const original={id:'old',name:'我的本地服务',provider:'Ollama',model:'custom:tag',endpoint:'http://192.168.1.20:11434',status:'待检测'};
 const d=restoreModelConfig('old',original);assert.equal(d.providerId,'ollama');assert.equal(d.model,'custom:tag');assert.equal(d.endpoint,original.endpoint);
 let advanced=switchConfigScope(configInitial('bailian'),'region','新加坡');advanced=switchConfigScope(advanced,'plan','Coding Plan');advanced.parameters={temperature:'0.2',timeout:'45',retries:'2',stream:'false'};advanced.model='manual-model';advanced.modelMode='manual';
 const record={...original,provider:'阿里云 · 百炼',model:advanced.model,config:modelConfigSnapshot(advanced)};
 const restored=restoreModelConfig('old',record);assert.equal(configScheme(restored)?.region,'新加坡');assert.equal(configScheme(restored)?.plan,'Coding Plan');assert.equal(restored.parameters.timeout,'45');assert.equal(restored.parameters.stream,'false');
});

test('套餐模型列表使用范围明确的完整快照，不借用按量或其他区域的集合',()=>{
 const base=configInitial('bailian');const standard=configScheme(base)!;
 let coding=switchConfigScope(base,'region','新加坡');coding=switchConfigScope(coding,'plan','Coding Plan');
 assert.equal(configScheme(coding)?.models.length,4);assert.ok(configScheme(coding)?.models.includes('MiniMax-M2.5'));
 assert.notDeepEqual(configScheme(coding)?.models,standard.models);
 const codingCn=switchConfigScope(base,'plan','Coding Plan');assert.deepEqual(configScheme(codingCn)?.models,[]);assert.equal(codingCn.modelMode,'manual');
 const glm=configProfile('glm')!;assert.equal(glm.schemes.find(s=>s.region==='中国'&&s.plan==='标准 API')?.models.length,24);assert.equal(glm.schemes.find(s=>s.region==='中国'&&s.plan==='Coding Plan')?.models.length,2);
});
