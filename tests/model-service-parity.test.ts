import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {modelServices,resolveModelService,serviceCategoryAllowed} from '../src/model_services.ts';
import {experienceDefaults,resolveExperienceConnection,resolveExperienceVoice} from '../src/model_experience_defaults.ts';
import {configInitial,switchConfigScope,modelConfigSnapshot} from '../src/model_config.ts';

test('五类模型服务保留各自用途和页面文案',()=>{
 assert.deepEqual(modelServices.map(s=>s.title),['文本生成','图片生成','视频生成','语音合成','语音识别']);
 assert.ok(serviceCategoryAllowed('text','Embedding'));
 assert.ok(serviceCategoryAllowed('text','Rerank'));
 assert.ok(serviceCategoryAllowed('asr','VAD'));
 assert.equal(serviceCategoryAllowed('text','IMAGE'),false);
 assert.equal(resolveModelService('video').role,'VIDEO');
});

test('图片和视频连接保存各自参数，不混入语言模型参数',()=>{
 for(const role of ['IMAGE','VIDEO']){
  const draft=switchConfigScope(configInitial('bailian'),'role',role);
  draft.parameters={aspect:'16:9',quality:'hd',count:'2',resolution:'1080P',duration:'5',temperature:'0.9'};
  const saved=modelConfigSnapshot(draft).parameters;
  assert.equal(saved.aspect,'16:9');
  assert.equal(saved.temperature,undefined);
  assert.equal(role==='IMAGE'?saved.quality:saved.duration,role==='IMAGE'?'hd':'5');
 }
});

test('体验从已保存连接恢复参数，停用连接不被悄悄替换',()=>{
 const connection={id:'saved',name:'已配置连接',provider:'MiniMax',model:'saved-model',role:'TTS',status:'待检测',config:{providerId:'minimax',schemeId:'test',region:'中国',plan:'标准',protocol:'test',auth:'api_key',modelMode:'manual',endpointTemplate:'https://example.com',fields:{voiceId:'voice-x'},parameters:{speed:'1.3',volume:'0'},credentialRef:'private'}};
 const defaults=experienceDefaults('tts',connection);
 assert.equal(defaults.speed,'1.3');assert.equal(defaults.volume,'0');assert.equal(defaults.voiceId,'voice-x');
 assert.ok(!('credentialRef' in defaults));
 assert.equal(resolveExperienceConnection([{...connection,enabled:false}],connection.id).unavailable,true);
 assert.equal(resolveExperienceVoice([{key:'a',voiceId:'voice-a'}],'missing').customVoice,'missing');
});

test('厂商右侧直接提供模型目录、连接、体验和授权',()=>{
 const page=readFileSync(new URL('../src/pages/ProviderSettings.tsx',import.meta.url),'utf8');
 for(const label of ['模型目录','已配置连接','模型体验','账户授权'])assert.ok(page.includes(label));
 assert.ok(page.includes('provider-detail-content'));
 assert.ok(page.includes('onTest'));
 assert.doesNotMatch(page,/label:'模型测试'/);
});
