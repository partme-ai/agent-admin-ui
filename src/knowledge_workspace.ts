import type {Doc,Store} from './state.ts';
import type {SharedSpace} from './shared_spaces.ts';
import {saveFaqDocument} from './knowledge_faq.ts';
/** 知识工作区辅助数据。资料仍使用 Store.docs，主题与机器人形象不参与此状态。 */
export type WikiRevision={title:string;content:string;sourceIds:string[];links:string[];at:string};
export type WikiPage=WikiRevision&{id:string;revisions:WikiRevision[]};
export type KnowledgeImage={id:string;name:string;data:string;sourceId:string;description:string;tags:string[]};
export type KnowledgeSource={id:string;name:string;type:string;credentials?:Record<string,string>;url:string;path:string;interval:string;enabled:boolean;logs:{at:string;result:string}[]};
export type KnowledgeWorkspace={favorite?:boolean;pinned?:boolean;visited?:string;folders:string[];wiki:WikiPage[];images:KnowledgeImage[];sources:KnowledgeSource[]};
export const emptyKnowledgeWorkspace=():KnowledgeWorkspace=>({folders:[],wiki:[],images:[],sources:[]});
export function moveDocuments(docs:Doc[],ids:string[],knowledge:string,folder=''):Doc[]{
 if(!knowledge)throw Error('请选择目标知识库');
 return docs.map(d=>ids.includes(d.id)?{...d,knowledge,folder,status:d.knowledge!==knowledge?(d.text?'待索引':'待服务解析'):d.status}:d);
}
export function validateSourceUrl(value:string):string{const url=new URL(value.trim());if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('请输入不含账号密码的 HTTP(S) 地址');return url.href;}
/** JSON 导入先校验全部条目，任意一条无效时不产生局部写入。 */
export function importFaqJson(raw:string,knowledge:string,id:()=>string):Doc[]{
 const rows:unknown=JSON.parse(raw);if(!Array.isArray(rows)||!rows.length||rows.length>1000)throw Error('请导入 1～1000 条问答组成的 JSON 数组');
 const validated=rows.map((row,i)=>{if(!row||typeof row!=='object')throw Error(`第 ${i+1} 条格式错误`);const r=row as Record<string,unknown>;if(typeof r.question!=='string'||!r.question.trim())throw Error(`第 ${i+1} 条缺少标准问`);const answers=Array.isArray(r.answers)?r.answers:typeof r.answer==='string'?[r.answer]:[];if(!answers.length||answers.some(a=>typeof a!=='string'||!a.trim()))throw Error(`第 ${i+1} 条缺少答案`);for(const key of ['similarQuestions','negativeQuestions','tags'])if(r[key]!==undefined&&(!Array.isArray(r[key])||(r[key] as unknown[]).some(v=>typeof v!=='string')))throw Error(`第 ${i+1} 条问题列表格式错误`);return {tags:(r.tags||[]) as string[],question:r.question,answers:answers as string[],similarQuestions:(r.similarQuestions||[]) as string[],negativeQuestions:(r.negativeQuestions||[]) as string[],enabled:r.enabled!==false};});
 return validated.map(({tags,...faq})=>({...saveFaqDocument(faq,knowledge,id()),tags:[...new Set(tags.map(t=>t.trim()).filter(Boolean))]}));
}
export function removeKnowledge(store:Store,spaces:SharedSpace[],id:string){
 if(store.agents.some(a=>a.knowledge.includes(id)||a.publishedConfig?.knowledge.includes(id)))throw Error('仍有智能体或已发布版本引用此知识库，请先解除关联');
 return {store:{...store,knowledge:store.knowledge.filter(k=>k.id!==id),docs:store.docs.filter(d=>d.knowledge!==id)},spaces:spaces.map(s=>({...s,knowledgeIds:s.knowledgeIds.filter(k=>k!==id)}))};
}
export function saveWikiPage(old:WikiPage|undefined,draft:Omit<WikiRevision,'at'>,id:string,allowedSources:string[],at:string):WikiPage{
 if(!draft.title.trim()||!draft.content.trim())throw Error('页面标题和正文不能为空');
 if(draft.sourceIds.some(s=>!allowedSources.includes(s)))throw Error('引用资料不属于当前知识库');
 const revision={...draft,title:draft.title.trim(),content:draft.content.trim(),sourceIds:[...new Set(draft.sourceIds)],links:[...new Set(draft.links.filter(s=>s!==id))],at};return {...revision,id,revisions:[...(old?.revisions||[]),revision]};
}
export function restoreWikiRevision(page:WikiPage,index:number,at:string):WikiPage{const version=page.revisions[index];if(!version)throw Error('历史版本不存在');const next={...version,at};return {...page,...next,revisions:[...page.revisions,next]};}
export function downloadKnowledgeFile(name:string,text:string,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
