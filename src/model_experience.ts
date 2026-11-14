import type {Connection} from './state.ts';

/** 体验页共用同一结构，能力、输入提示和参数随模型分类切换。 */
export const experienceModes={
 text:{title:'文本生成',role:'LLM',placeholder:'输入你的内容…',description:'试写提问、创作与推理请求。'},
 image:{title:'图片生成',role:'IMAGE',placeholder:'描述你想生成的画面…',description:'描述画面、构图与风格，预览图片请求。'},
 video:{title:'视频生成',role:'VIDEO',placeholder:'描述你想生成的视频画面与运动…',description:'描述镜头、主体与动作，预览视频请求。'},
 tts:{title:'语音合成',role:'TTS',placeholder:'输入你要合成的语音文本内容',description:'选择音色、语速与音量，试听本地官方样本。'},
 asr:{title:'语音识别',role:'ASR',placeholder:'上传或录制音频',description:'上传音频或录制一段声音，预览识别请求。'}
} as const;
export type ExperienceKind=keyof typeof experienceModes;

export function matchingExperienceConnections(connections:readonly Connection[],kind:ExperienceKind){
 const roles=kind==='text'?['LLM','SLM','VLLM']:[experienceModes[kind].role];
 return connections.filter(connection=>connection.enabled!==false&&roles.includes(connection.role||'LLM'));
}

export function experienceRequest(kind:ExperienceKind,prompt:string,parameters:Record<string,string>,connectionId=''){
 const value=prompt.trim();if(!value)throw new Error('请先填写内容或选择音频');
 return {mode:'本地请求预览' as const,kind,connectionId,prompt:value,parameters:{...parameters}};
}

export function validateExperienceAudio(file:Pick<File,'name'|'type'|'size'>){
 if(!/\.(wav|mp3|m4a|webm|ogg)$/i.test(file.name)||file.type&&!file.type.startsWith('audio/'))return '请选择 wav、mp3、m4a、webm 或 ogg 音频';
 if(!file.size)return '音频文件为空';
 if(file.size>10*1024*1024)return '音频不能超过 10 MB';
 return '';
}
