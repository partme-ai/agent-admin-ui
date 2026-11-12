import test from 'node:test';
import assert from 'node:assert/strict';
import {ttsModels,voicesForModel,retainCompatibleVoice,voiceKey} from '../src/voice_catalog.ts';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

test('即梦按模型完整保留音色身份和标签，不把平台或模型不同的同 ID 音色合并',async()=>{
 const source=JSON.parse(await readFile(new URL('../reference/jimeng_voice_catalog.source.json',import.meta.url),'utf8'));
 const models=ttsModels.filter(m=>m.providerId==='jimeng');
 assert.deepEqual(models.map(m=>m.modelId).sort(),['legacy_tts','seed_audio_v1']);
 for(const model of models){
  const expected=source.models[model.modelId].items;
  const actual=voicesForModel(model,[]);
  assert.equal(actual.length,model.modelId==='legacy_tts'?142:143);
  assert.deepEqual(actual.map(v=>({voiceId:v.voiceId,name:v.name,language:v.language})),expected.map((v:{voiceId:string;voiceName:string;tags?:{language?:string}})=>({voiceId:v.voiceId,name:v.voiceName,language:v.tags?.language||'未标注'})));
  assert.deepEqual(actual.map(v=>({platform:v.platform,tags:v.tags})),expected.map((v:{platform?:string;tags?:Record<string,string>})=>({platform:v.platform,tags:v.tags})));
  assert.ok(actual.every(v=>v.providerId==='jimeng'));
  assert.equal(actual.filter(v=>v.previewUrl).length,model.modelId==='seed_audio_v1'?142:0);
  assert.equal(new Set(actual.map(v=>v.key)).size,actual.length);
 }
 const legacy=voicesForModel(models.find(m=>m.modelId==='legacy_tts')!,[]);
 const modern=voicesForModel(models.find(m=>m.modelId==='seed_audio_v1')!,[]);
 const shared=legacy.find(v=>modern.some(n=>n.voiceId===v.voiceId))!;
 assert.ok(shared);assert.notEqual(shared.key,modern.find(v=>v.voiceId===shared.voiceId)?.key);
 assert.equal(retainCompatibleVoice(shared.key,modern),'');
});

test('即梦官方样本按模型、平台和 ID 绑定，文件完整且旧 ID 引用有来源',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../reference/jimeng_voice_samples.json',import.meta.url),'utf8'));
 const model=ttsModels.find(m=>m.id==='jimeng:seed_audio_v1')!;
 const voices=voicesForModel(model,[]);
 assert.equal(manifest.samples.length,142);
 assert.equal(new Set(manifest.samples.map((s:{sha256:string})=>s.sha256)).size,131);
 for(const sample of manifest.samples){
  assert.equal(sample.modelId,'seed_audio_v1');assert.equal(sample.platform,'dmop');
  assert.equal(voices.find(v=>v.voiceId===sample.voiceId)?.previewUrl,sample.localUrl);
  const bytes=await readFile(new URL('../public/'+sample.localUrl.slice(2),import.meta.url));
  assert.equal(bytes.length,sample.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),sample.sha256);
  assert.equal(sample.sourceAsset.includes('?'),false);
  if(sample.identityEvidence==='provider_config_reference'){
   assert.match(sample.referenceSpeakerId,new RegExp(`^dreamina_cn_${sample.voiceId}_s26hd_\\d+$`));
   assert.equal(sample.name,sample.sourceTitle);
  }else assert.equal(sample.sourceMaterialId,sample.voiceId);
 }
 assert.equal(voices.find(v=>v.voiceId==='7459778019725414962')?.previewUrl,undefined);
 const legacy=ttsModels.find(m=>m.id==='jimeng:legacy_tts')!;
 assert.ok(voicesForModel(legacy,[]).every(v=>!v.previewUrl));
 const privateAsset={id:'mine',name:'私有声音',sample:'private.wav',agent:'',provider:'即梦',providerId:'jimeng',connectionId:model.connectionId,voiceId:manifest.samples[0].voiceId,modelIds:[model.modelId],status:'训练完成（演示）'};
 assert.equal(voicesForModel(model,[privateAsset]).find(v=>v.kind==='cloned')?.previewUrl,undefined);
});

test('官方片段只按精确 Voice ID 绑定，本地文件与已记录校验值一致',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../reference/minimax_voice_samples.json',import.meta.url),'utf8'));
 const voices=voicesForModel(ttsModels[0],[]);
 const downloaded=manifest.samples.filter((v:{status:string})=>v.status==='downloaded');
 assert.equal(downloaded.length,283);
 assert.equal(voices.filter(v=>v.previewUrl).length,283);
 for(const sample of downloaded){
  assert.equal(voices.find(v=>v.voiceId===sample.voiceId)?.previewUrl,sample.localUrl);
  const data=await readFile(new URL('../public/'+sample.localUrl.replace('./',''),import.meta.url));
  assert.equal(data.length,sample.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),sample.sha256);
 }
 assert.equal(voices.find(v=>v.voiceId==='male-qn-jingying')?.previewUrl,undefined);
 assert.equal(voices.find(v=>v.voiceId==='Santa_Claus ')?.previewUrl,undefined);
 assert.ok(voicesForModel(ttsModels.find(v=>v.providerId==='openai')!,[]).every(v=>!v.previewUrl));
});

test('提供方隔离音色，同一平台的模型也遵循自己的音色集合',()=>{
 const mini=ttsModels.find(m=>m.id==='minimax:speech-2.8-turbo')!;
 const modern=ttsModels.find(m=>m.id==='openai:gpt-4o-mini-tts')!;
 const legacy=ttsModels.find(m=>m.id==='openai:tts-1')!;
 assert.ok(voicesForModel(mini,[]).every(v=>v.providerId==='minimax'));
 assert.equal(voicesForModel(modern,[]).length,13);
 assert.equal(voicesForModel(legacy,[]).some(v=>v.voiceId==='cedar'),false);
 assert.equal(voicesForModel(modern,[]).some(v=>v.voiceId==='cedar'),true);
});

test('切换模型只保留兼容音色，不跨提供方静默替换',()=>{
 const mini=ttsModels[0], openai=ttsModels.find(m=>m.id==='openai:gpt-4o-mini-tts')!;
 const voice=voicesForModel(mini,[])[0];
 assert.equal(retainCompatibleVoice(voice.key,voicesForModel(openai,[])),'');
 assert.equal(retainCompatibleVoice(voice.key,voicesForModel(mini,[])),voice.key);
 assert.notEqual(voiceKey('minimax','same'),voiceKey('openai','same'));
});

test('我的音色要求提供方、账号连接、兼容模型、可用状态和真实音色标识匹配',()=>{
 const model=ttsModels[0];
 const asset={id:'asset1',name:'我的音色',sample:'clip.wav',agent:'',provider:'MiniMax',providerId:'minimax',connectionId:model.connectionId,voiceId:'private-id',modelIds:[model.modelId],status:'训练完成（演示）'};
 assert.ok(voicesForModel(model,[asset]).some(v=>v.kind==='cloned'));
 for(const change of [{providerId:'openai'},{connectionId:'another-account'},{status:'处理中'},{voiceId:''},{modelIds:['unknown']}]){
  assert.equal(voicesForModel(model,[{...asset,...change}]).some(v=>v.kind==='cloned'),false);
 }
});

test('MiniMax 完整目录逐项对应用户提供的 327 条原始记录，语言和 ID 不改写',async()=>{
 const {readFile}=await import('node:fs/promises');
 const original=await readFile(new URL('../reference/minimax_system_voices.source.md',import.meta.url),'utf8');
 const expected=original.split('\n').flatMap(line=>{
  const m=line.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*`([^`]+)`\s*\|\s*(.*?)\s*\|$/);
  return m?[{voiceId:m[3],name:m[4],language:m[2]}]:[];
 });
 const actual=voicesForModel(ttsModels[0],[]).map(({voiceId,name,language})=>({voiceId,name,language}));
 assert.equal(actual.length,327);
 assert.deepEqual(actual,expected);
 assert.equal(new Set(actual.map(v=>v.voiceId)).size,327);
 assert.equal(new Set(actual.map(v=>v.language)).size,24);
 assert.equal(actual[64].voiceId,'Santa_Claus ');
 assert.ok(actual.some(v=>v.voiceId==='hindi_female_1_v2'));
});
