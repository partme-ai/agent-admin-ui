import test from 'node:test';
import assert from 'node:assert/strict';
import {shellEntries,shellSelection} from '../src/shell_layout.ts';
import {initialStore} from '../src/state.ts';
import {experienceModes,matchingExperienceConnections,experienceRequest,validateExperienceAudio} from '../src/model_experience.ts';

test('模型服务五个分类均有独立入口和体验配置',()=>{
 const expected={text:['文本生成','LLM'],image:['图片生成','IMAGE'],video:['视频生成','VIDEO'],tts:['语音合成','TTS'],asr:['语音识别','ASR']} as const;
 for(const [key,[title,role]] of Object.entries(expected)){
  const entry=shellEntries().find(item=>item.key===`models/model-settings/${key}`);
  assert.equal(entry?.node.page,'06');assert.equal(entry?.node.item,key);
  assert.equal(experienceModes[key as keyof typeof expected].title,title);
  assert.equal(experienceModes[key as keyof typeof expected].role,role);
  assert.equal(shellSelection('06',key,'models'),entry?.key);
 }
});

test('体验按能力选择已启用连接，预览请求不调用服务',()=>{
 const connections=[...initialStore().connections,{id:'image1',name:'图片模型',provider:'示例',model:'image-demo',role:'IMAGE',status:'演示可用',enabled:true},{id:'video1',name:'视频模型',provider:'示例',model:'video-demo',role:'VIDEO',status:'演示可用',enabled:false}];
 assert.ok(matchingExperienceConnections(connections,'text').some(item=>item.id==='m1'));
 assert.deepEqual(matchingExperienceConnections(connections,'image').map(item=>item.id),['image1']);
 assert.deepEqual(matchingExperienceConnections(connections,'video'),[]);
 assert.deepEqual(experienceRequest('image',' 画一棵树 ',{aspect:'1:1'},'image1'),{mode:'本地请求预览',kind:'image',connectionId:'image1',prompt:'画一棵树',parameters:{aspect:'1:1'}});
 assert.equal(validateExperienceAudio({name:'sample.mp3',type:'audio/mpeg',size:100}),'' );
 assert.ok(validateExperienceAudio({name:'sample.exe',type:'application/octet-stream',size:100}));
});
