import {connectionMatchesCategory} from './model_categories.ts';
/** 本地界面使用的完整智能体配置；不包含真实凭据。 */
export type ContextSource={id:string;name:string;url:string;headers:Record<string,string>};
export type AgentRuntime={sandboxId?:string;stationTools?:string[];longTermMemory?:import('./settings_integration.ts').MemoryPolicy;tags:string[];bindings:Record<string,string>;ttsModel:string;voice:string;language:string;rate:number;pitch:number;volume:number;topP:number;hotwords:string;vadSpeech:number;vadSilence:number;silenceMs:number;idleSeconds:number;memoryMode:string;report:'off'|'text'|'text-audio';summary:string;sources:ContextSource[];replacements:{from:string;to:string}[]};
export function defaultAgentRuntime():AgentRuntime{return {tags:[],bindings:{},ttsModel:'minimax:speech-2.8-turbo',voice:JSON.stringify(['minimax','','male-qn-qingse']),language:'普通话',rate:1,pitch:0,volume:1,topP:.9,hotwords:'',vadSpeech:.5,vadSilence:.3,silenceMs:800,idleSeconds:60,memoryMode:'短期上下文',report:'text',summary:'',sources:[],replacements:[]};}
export function cloneAgentRuntime(value?:AgentRuntime):AgentRuntime{return structuredClone({...defaultAgentRuntime(),...value});}
export function validateContextSource(source:ContextSource):string{
 if(!source.name.trim())return '请填写源名称';
 try{const u=new URL(source.url);if(!['https:','http:'].includes(u.protocol))return '接口地址须为 HTTP(S)';if(u.username||u.password||[...u.searchParams.keys()].some(k=>/token|secret|password|api[-_]?key|access[-_]?key|signature/i.test(k)))return '地址不能包含凭据';}catch{return '请填写有效接口地址';}
 if(Object.keys(source.headers).some(k=>/authorization|token|secret|api[-_]?key|cookie|password/i.test(k)))return '请使用服务端凭据引用，不要在界面保存认证凭据';
 return '';
}
export type DeviceBinding={method:'code'|'manual';code?:string;mac?:string;name:string;agent:string;kind?:string};
export function bindPreviewDevice(bots:{id:string;mac?:string}[],value:DeviceBinding){
 if(!value.name.trim()||!value.agent)throw new Error('请填写名称并选择智能体');
 if(value.method==='code'&&!/^\d{6}$/.test(value.code||''))throw new Error('请输入 6 位设备码');
 const raw=value.method==='manual'?value.mac||'':`DE:00:00:${value.code!.slice(0,2)}:${value.code!.slice(2,4)}:${value.code!.slice(4)}`;
 const mac=raw.replaceAll('-',':').toUpperCase();
 if(!/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac))throw new Error('MAC 地址格式不正确');
 if(bots.some(b=>b.mac===mac||b.id===`preview-${mac}`))throw new Error('这台设备已绑定，不能重复添加');
 return {id:`preview-${mac}`,mac,name:value.name.trim(),agent:value.agent,kind:value.kind||'TinyBot ESP32',location:'未分组',status:'待接入',battery:0,firmware:'待上报',autoUpdate:false};
}
export function chunkText(text:string,size=600,overlap=60):string[]{
 if(!Number.isInteger(size)||size<1||!Number.isInteger(overlap)||overlap<0||overlap>=size)throw new Error('切片长度须大于重叠长度，重叠长度不能为负数');
 const out:string[]=[];for(let i=0;i<text.length;i+=size-overlap){out.push(text.slice(i,i+size));if(i+size>=text.length)break;}return out;
}
export type ConfigEntry={id:string;group:string;key:string;value:string;type:'text'|'number'|'boolean'|'json';note?:string};
export function validateEntry(v:ConfigEntry,items:ConfigEntry[]):string{
 if(!v.key.trim())return '请输入配置键';if(items.some(x=>x.id!==v.id&&x.group===v.group&&x.key===v.key))return '同一分组的键不能重复';
 if(/password|secret|api[-_]?key|token/i.test(v.key))return '凭据请在连接设置中引用，不保存到系统参数';
 if(v.type==='number'&&(!v.value.trim()||!Number.isFinite(Number(v.value))))return '请输入有效数字';
 if(v.type==='boolean'&&!['true','false'].includes(v.value))return '布尔值只能是 true 或 false';
 if(v.type==='json'){try{JSON.parse(v.value);}catch{return '请输入合法 JSON';}}return '';
}
export function filterRecords<T extends {agent:string;device?:string;date?:string;text:string}>(items:T[],q:{agent?:string;device?:string;start?:string;end?:string;query?:string}):T[]{return items.filter(x=>(!q.agent||x.agent===q.agent)&&(!q.device||x.device===q.device)&&(!q.start||!!x.date&&x.date>=q.start)&&(!q.end||!!x.date&&x.date<=q.end)&&(!q.query||x.text.toLowerCase().includes(q.query.toLowerCase())));}
export type ProviderDefinition={id:string;name:string;roles:string[];protocol:string;endpoint:string;fields:string};
export type FirmwareAsset={localUrl?:string;id:string;name:string;kind:string;version:string;file:string;size:number;note:string;status:string};
export type PromptTemplate={id:string;name:string;instructions:string};
export type KnowledgeOptions={chunkSize:number;overlap:number;topK:number;threshold:number;mode:string;embedding:string;rerank:string;external:string};
export type StorageOptions={provider:string;fields:Record<string,string>;retention:string;result:'未检测'|'本地校验通过'|'校验失败'};
/** 仅创建本地下载，不请求任何服务。 */
export function downloadJson(name:string,value:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

export function indexedDocumentText(d:{text:string;chunks?:string[]}):string{return d.chunks===undefined?d.text:d.chunks.join("\n");}
export function validateAgentRuntime(runtime:AgentRuntime|undefined,connections:{id:string;role?:string;enabled?:boolean;status:string}[]):string{
 if(!runtime)return '';
 for(const [role,id] of Object.entries(runtime.bindings)){if(!id)continue;const connection=connections.find(c=>c.id===id);if(!connection||connection.enabled===false||connection.status!=='演示可用')return `${role} 连接尚未就绪`;if(!connectionMatchesCategory(connection,role))return `${role} 连接用途不匹配`;}
 if(runtime.longTermMemory?.enabled){const p=runtime.longTermMemory;if(!Number.isInteger(p.maxItems)||p.maxItems<1||p.maxItems>10000||p.delay<0||p.delay>600||p.interval<1||p.interval>3600)return '长期记忆容量与提取时间超出范围';if(p.model&&!connections.some(c=>c.id===p.model&&c.enabled!==false&&c.status==='演示可用'&&connectionMatchesCategory(c,'SLM')))return '记忆提取模型已失效或分类不匹配';if(p.semantic&&(!p.embedding||!connections.some(c=>c.id===p.embedding&&c.enabled!==false&&c.status==='演示可用'&&connectionMatchesCategory(c,'Embedding'))))return '记忆语义召回需要已配置的嵌入模型';}
 if(['mem0','PowerMem'].includes(runtime.memoryMode)&&!runtime.bindings['记忆'])return '外部记忆模式需要记忆连接';
 for(const source of runtime.sources){const error=validateContextSource(source);if(error)return error;}
 if(runtime.replacements.some(r=>!r.from.trim()||!r.to.trim()))return '请补齐发音替换词或移除空规则';
 return '';
}
export function prepareFirmwareAsset(draft:FirmwareAsset,previous?:FirmwareAsset):FirmwareAsset{return {...draft,status:previous&&previous.file===draft.file&&previous.version===draft.version&&previous.kind===draft.kind?draft.status:'待验证'};}
