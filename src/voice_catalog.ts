import type {VoiceAsset} from './state';
import {trialVoices} from './robot_trial.ts';
import minimaxSnapshot from '../reference/minimax_system_voices.json' with {type:'json'};
import minimaxSamples from '../reference/minimax_voice_samples.json' with {type:'json'};
import jimengSnapshot from '../reference/jimeng_voice_catalog.source.json' with {type:'json'};
import jimengSamples from '../reference/jimeng_voice_samples.json' with {type:'json'};
/** 目录预设不代表账号已配置或通过真实服务检测。 */
export type TtsModel={id:string;providerId:string;provider:string;modelId:string;displayName?:string;connectionId:string;clone:boolean;legacy?:boolean};
export type CatalogVoice={key:string;voiceId:string;providerId:string;name:string;language:string;platform?:string;tags?:Record<string,string>;kind:'system'|'cloned'|'local';rate:number;pitch:number;previewUrl?:string};
export const ttsModels:TtsModel[]=[
 ...['speech-2.8-turbo','speech-2.8-hd','speech-2.6-turbo','speech-2.6-hd','speech-02-turbo','speech-02-hd'].map(modelId=>({id:`minimax:${modelId}`,providerId:'minimax',provider:'MiniMax',modelId,connectionId:'minimax-preview',clone:true})),
 ...['gpt-4o-mini-tts','tts-1','tts-1-hd'].map(modelId=>({id:`openai:${modelId}`,providerId:'openai',provider:'OpenAI',modelId,connectionId:'openai-preview',clone:false,legacy:true})),
 ...Object.keys(jimengSnapshot.models).map(modelId=>({id:`jimeng:${modelId}`,providerId:'jimeng',provider:'即梦',modelId,displayName:modelId==='seed_audio_v1'?'SeedAudio 1.0':'Seed TTS',connectionId:'jimeng-cn-preview',clone:false})),
 {id:'local:system',providerId:'local',provider:'本机系统',modelId:'系统音色',connectionId:'local',clone:false}
];
export const voiceKey=(providerId:string,voiceId:string,connectionId='')=>JSON.stringify([providerId,connectionId,voiceId]);
// 逐条保留用户提供的完整目录，身份、语言和名称不做推测或截取。
const minimaxVoices=minimaxSnapshot.voices;
const minimaxPreviews=new Map(minimaxSamples.samples.flatMap(sample=>sample.status==='downloaded'&&sample.localUrl?[[sample.voiceId,sample.localUrl] as const]:[]));
const jimengPreviews=new Map(jimengSamples.samples.flatMap(sample=>sample.status==='downloaded'?[[voiceKey('jimeng',sample.voiceId,`system:cn:${sample.modelId}:${sample.platform}`),sample.localUrl] as const]:[]));
const openaiVoices=['alloy','ash','ballad','coral','echo','fable','nova','onyx','sage','shimmer','verse','marin','cedar'];
const legacyVoices=new Set(['alloy','ash','coral','echo','fable','onyx','nova','sage','shimmer']);
/** 2026-11-05 用户提供的完整系统目录快照；账号可用性仍以服务端查询为准。 */
export function voicesForModel(model:TtsModel,assets:VoiceAsset[]):CatalogVoice[]{
 let voices:CatalogVoice[]=[];
 if(model.providerId==='minimax')voices=minimaxVoices.map(({voiceId,name,language})=>({key:voiceKey('minimax',voiceId),voiceId,providerId:'minimax',name,language,kind:'system',rate:1,pitch:1,previewUrl:minimaxPreviews.get(voiceId)}));
 if(model.providerId==='openai')voices=openaiVoices.filter(id=>model.modelId==='gpt-4o-mini-tts'||legacyVoices.has(id)).map(voiceId=>({key:voiceKey('openai',voiceId),voiceId,providerId:'openai',name:voiceId,language:'多语言',kind:'system',rate:1,pitch:1}));
 if(model.providerId==='jimeng'){
  const catalog=jimengSnapshot.models[model.modelId as keyof typeof jimengSnapshot.models];
  voices=(catalog?.items||[]).map(v=>{const key=voiceKey('jimeng',v.voiceId,`system:cn:${model.modelId}:${v.platform}`);return {key,voiceId:v.voiceId,providerId:'jimeng',name:v.voiceName,language:v.tags?.language||'未标注',platform:v.platform,tags:v.tags,kind:'system',rate:1,pitch:1,previewUrl:jimengPreviews.get(key)};});
 }
 if(model.providerId==='local')return trialVoices.map(v=>({...v,key:voiceKey('local',v.id),voiceId:v.id,providerId:'local',language:'中文',kind:'local'}));
 const mine=assets.filter(v=>v.providerId===model.providerId&&v.connectionId===model.connectionId&&!!v.voiceId&&v.status==='训练完成（演示）'&&!!v.modelIds?.includes(model.modelId));
 return [...voices,...mine.map(v=>({key:voiceKey(model.providerId,v.voiceId!,model.connectionId),voiceId:v.voiceId!,providerId:model.providerId,name:v.name,language:'自定义',kind:'cloned' as const,rate:1,pitch:1}))];
}
export const retainCompatibleVoice=(key:string,voices:CatalogVoice[])=>voices.some(v=>v.key===key)?key:'';
