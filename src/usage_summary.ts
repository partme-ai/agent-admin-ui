import type {Store} from './state.ts';
export type UsageFilters={agent:string;source:string;start:string;end:string};
/** 仅汇总前端已持有的记录；缺少真实计量事件时费用和Token始终为空。 */
export function summarizeUsage(store:Store,filters:UsageFilters){
 const {agent,source,start,end}=filters;
 const conversations=store.conversations.filter(x=>(!agent||x.agent===agent)&&(source==='all'||(source==='sample'?!!x.sample:!x.sample))&&(!start||!!x.date&&x.date>=start)&&(!end||!!x.date&&x.date<=end));
 const rows=store.agents.filter(x=>!agent||x.id===agent).map(a=>{const records=conversations.filter(x=>x.agent===a.id);return {id:a.id,name:a.name,conversations:records.length,messages:records.reduce((n,x)=>n+x.messages.length,0),model:store.connections.find(m=>m.id===a.model)?.model||'未配置',devices:store.bots.filter(b=>b.agent===a.id).length};});
 return {conversations,rows,messages:conversations.reduce((n,x)=>n+x.messages.length,0),sampleRecords:conversations.filter(x=>x.sample).length,tokenUsage:null,cost:null};
}
