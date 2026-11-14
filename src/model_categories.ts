/** 模型用途与厂商来源分离；分类是配置声明，不替代服务能力检测。 */
export const modelCategories=[
 {value:'LLM',label:'主语言模型',group:'对话与视觉'},
 {value:'SLM',label:'小参数模型',group:'对话与视觉'},
 {value:'VLLM',label:'视觉大模型',group:'对话与视觉'},
 {value:'IMAGE',label:'图片生成',group:'内容生成'},
 {value:'VIDEO',label:'视频生成',group:'内容生成'},
 {value:'Embedding',label:'向量嵌入',group:'知识检索'},
 {value:'Rerank',label:'重排序',group:'知识检索'},
 {value:'ASR',label:'语音识别',group:'语音'},
 {value:'TTS',label:'语音合成',group:'语音'},
 {value:'VAD',label:'语音活动检测',group:'语音'},
 {value:'意图',label:'意图识别',group:'路由与记忆'},
 {value:'记忆',label:'记忆服务',group:'路由与记忆'},
 {value:'RAG',label:'外部知识检索',group:'知识检索'}
];
export const categoryLabel=(role:string)=>modelCategories.find(c=>c.value===role)?.label||role;
export function schemeAcceptsCategory(scheme:{role?:string;protocol:string},category:string){
 const role=scheme.role||'LLM';
 return role===category||role==='LLM'&&['SLM','VLLM'].includes(category);
}
export function connectionMatchesCategory(connection:{role?:string},category:string){const role=connection.role||'LLM';return role===category||category==='SLM'&&role==='LLM';}
export function modelsForSelection(models:{id:string;name:string;provider:string;model:string;role?:string;enabled?:boolean}[],category:string,selected=''){
 const options=models.filter(c=>connectionMatchesCategory(c,category)).map(c=>({value:c.id,label:`${c.name} · ${c.model} · ${c.provider}${c.enabled===false?'（已停用）':''}`,disabled:c.enabled===false}));
 if(selected&&!options.some(o=>o.value===selected)){const old=models.find(c=>c.id===selected);options.push({value:selected,label:old?`${old.name} · ${old.model}（分类不匹配）`:`原模型 ${selected}（已不存在）`,disabled:true});}
 return options;
}
