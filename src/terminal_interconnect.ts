export type ServiceTarget='server'|'desktop';
export type PairingOffer={v:1;demo:true;id:string;name:string;target:ServiceTarget;endpoint:string;code:string;createdAt:number;expiresAt:number};
export type TerminalStatus='review'|'pending'|'connected'|'disconnected'|'reconnecting'|'failed'|'declined'|'expired'|'revoked'|'paired';
export type TerminalClient={id:string;name:string;kind:string;target:ServiceTarget;endpoint:string;scope:string;agents:string[];status:TerminalStatus;authorized:boolean;attempt:number;updatedAt:number;reason:string;source:'address'|'qr'|'legacy';requestExpiresAt?:number;offer?:PairingOffer;events:{time:number;text:string}[]};
export type TerminalState={version:2;clients:TerminalClient[];offer?:PairingOffer;code:string;usedOffers:string[]};
export type TerminalEvent={type:'request';name:string;kind:string;target:ServiceTarget;endpoint:string;scope:string;agents:string[];source:'address'|'qr';offer?:PairingOffer}|{type:'offer';offer:PairingOffer}|{type:'expire'}|{type:'confirm'|'approve'|'reject'|'cancel'|'disconnect'|'reconnect'|'cancel-reconnect'|'revoke';id:string}|{type:'result';id:string;attempt:number;ok:boolean};
export function normalizeServiceAddress(raw:string):string{let u:URL;try{u=new URL(raw.trim());}catch{throw Error('请输入完整的服务地址，例如 https://tinybot.example.com');}if(!['http:','https:'].includes(u.protocol)||!u.hostname||u.username||u.password)throw Error('服务地址仅支持不含账号密码的 HTTP / HTTPS 地址');if(u.search||u.hash)throw Error('请输入服务基础地址，不要附带查询参数或页面片段');return u.origin+u.pathname.replace(/\/+$/,'');}
export function createOffer(input:{name:string;target:ServiceTarget;endpoint:string},now=Date.now()):PairingOffer{return {v:1,demo:true,id:crypto.randomUUID(),name:input.name.trim().slice(0,40)||'TinyBot 服务',target:input.target,endpoint:normalizeServiceAddress(input.endpoint),code:String(100000+Math.floor(Math.random()*900000)),createdAt:now,expiresAt:now+300000};}
export function offerPayload(offer:PairingOffer):string{return 'tinybot://pair?data='+encodeURIComponent(JSON.stringify(offer));}
export function parseOffer(text:string,now=Date.now()):PairingOffer{
 let o:PairingOffer;try{const u=new URL(text.trim());if(u.protocol!=='tinybot:'||u.hostname!=='pair'||!['','/'].includes(u.pathname))throw Error();o=JSON.parse(u.searchParams.get('data')||'null');}catch{throw Error('不是 TinyBot 配对二维码，请扫描服务端显示的二维码');}
 if(!o||o.v!==1||o.demo!==true||typeof o.id!=='string'||o.id.length>80||!o.id||typeof o.name!=='string'||!['server','desktop'].includes(o.target)||!/^\d{6}$/.test(o.code)||!Number.isFinite(o.createdAt)||!Number.isFinite(o.expiresAt)||(o.expiresAt<=o.createdAt||o.expiresAt-o.createdAt>300000)||o.createdAt>now+30000)throw Error('二维码格式或版本不受支持，请重新生成');
 if(o.expiresAt<=now)throw Error('配对二维码已过期，请在服务端刷新后重试');
 return {...o,name:o.name.slice(0,40),endpoint:normalizeServiceAddress(o.endpoint)};
}
/** 兼容原有小程序记录，不把旧绑定或未结束握手冒充为在线。 */
export function normalizeTerminalState(raw:unknown):TerminalState{
 const s=(raw&&typeof raw==='object'?raw:{}) as Partial<TerminalState>;
 return {version:2,code:typeof s.code==='string'?s.code:'',offer:s.offer,usedOffers:Array.isArray(s.usedOffers)?s.usedOffers:[],clients:(Array.isArray(s.clients)?s.clients:[]).filter(c=>c&&typeof c.id==='string').map(c=>({...c,name:c.name||'原有终端',kind:c.kind||'小程序',target:c.target||'server',endpoint:c.endpoint||'',scope:c.scope||'read',agents:Array.isArray(c.agents)?c.agents:[],status:c.status==='reconnecting'?'disconnected':c.status||'paired',authorized:c.authorized===true,attempt:(c.attempt||0)+(c.status==='reconnecting'?1:0),updatedAt:c.updatedAt||0,reason:c.status==='reconnecting'?'上次连接过程已中断，请手动重连':c.reason||'',source:c.source||'legacy',events:Array.isArray(c.events)?c.events:[]}))};
}
/** 只处理本地演练状态；网络、认证和服务端授权由未来真实适配器接管。 */
export function transitionTerminal(state:TerminalState,event:TerminalEvent,now=Date.now()):TerminalState{
 const s=structuredClone(state),update=(c:TerminalClient,status:TerminalStatus,text:string)=>{c.status=status;c.reason=text;c.updatedAt=now;c.events=[{time:now,text},...c.events].slice(0,30);};
 const active=(c:TerminalClient)=>['review','pending'].includes(c.status);
 const live=(c:TerminalClient)=>{if(c.requestExpiresAt&&c.requestExpiresAt<=now)throw Error('配对请求已过期，请重新发起');if(c.offer&&(c.offer.expiresAt<=now||s.usedOffers.includes(c.offer.id)||(s.offer&&c.offer.id===s.offer.id&&s.offer.code!==c.offer.code)))throw Error('配对码已失效，请刷新后重新配对');};
 if(event.type==='offer'){for(const c of s.clients)if(active(c)&&c.offer?.id===s.offer?.id)update(c,'expired','原配对码已刷新，请重新扫码');if(s.offer)s.usedOffers=[...new Set([...s.usedOffers,s.offer.id])];s.offer=event.offer;s.code=event.offer.code;return s;}
 if(event.type==='expire'){for(const c of s.clients)if(active(c)&&((c.requestExpiresAt&&c.requestExpiresAt<=now)||(c.offer&&c.offer.expiresAt<=now)))update(c,'expired','配对请求已过期，请重新扫码');return s;}
 if(event.type==='request'){
  const endpoint=normalizeServiceAddress(event.endpoint);if(!event.name.trim()||!event.agents.length||!['read','chat','manage'].includes(event.scope)||!['server','desktop'].includes(event.target))throw Error('请填写终端名称，并选择允许访问的智能体和范围');
  if(event.offer){parseOffer(offerPayload(event.offer),now);if(s.usedOffers.includes(event.offer.id))throw Error('该配对码已使用或已刷新，请生成新的二维码');if(endpoint!==event.offer.endpoint||event.target!==event.offer.target)throw Error('二维码服务信息不一致，请重新扫码');}
  const previous=s.clients.find(c=>c.name===event.name.trim()&&c.kind===event.kind&&c.endpoint===endpoint&&c.target===event.target);
  if(previous&&['connected','pending','review','reconnecting'].includes(previous.status))throw Error('该终端已有连接或待确认请求，请先处理现有记录');
  const client:TerminalClient={id:previous?.id||crypto.randomUUID(),name:event.name.trim().slice(0,40),kind:event.kind,target:event.target,endpoint,scope:event.scope,agents:[...new Set(event.agents)],status:'review',authorized:false,attempt:(previous?.attempt||0)+1,updatedAt:now,reason:'请核对服务身份与访问范围',source:event.source,requestExpiresAt:event.offer?.expiresAt||now+300000,offer:event.offer,events:previous?.events||[]};update(client,'review','已识别服务，等待终端确认');s.clients=previous?s.clients.map(c=>c.id===previous.id?client:c):[client,...s.clients];return s;
 }
 const c=s.clients.find(c=>c.id===event.id);if(!c)throw Error('终端记录不存在，请刷新列表');
 if(event.type==='confirm'){if(c.status!=='review')throw Error('请重新发起配对');live(c);update(c,'pending','终端已确认，等待服务端同意');}
 if(event.type==='approve'){if(c.status!=='pending')throw Error('终端尚未确认，不能建立连接');live(c);c.authorized=true;update(c,'connected','双方已确认，本地模拟连接已建立');if(c.offer){s.usedOffers=[...new Set([...s.usedOffers,c.offer.id])];if(s.offer?.id===c.offer.id)s.code='';for(const other of s.clients)if(other.id!==c.id&&active(other)&&other.offer?.id===c.offer.id)update(other,'expired','配对码已被其他请求使用，请重新生成');}}
 if(event.type==='reject'||event.type==='cancel'){if(!active(c))throw Error('该配对请求已结束');c.authorized=false;update(c,'declined',event.type==='reject'?'服务端拒绝了这次配对，可修改后重新申请':'已取消配对，没有授予访问权限');}
 if(event.type==='disconnect'){if(c.status!=='connected')throw Error('当前终端没有建立连接');c.attempt++;update(c,'disconnected','连接已断开，配对与访问范围保留');}
 if(event.type==='reconnect'){if(!c.authorized||!['disconnected','failed'].includes(c.status))throw Error('请先完成双方配对确认');c.attempt++;update(c,'reconnecting','正在使用已有配对重新连接');}
 if(event.type==='cancel-reconnect'){if(c.status==='reconnecting'){c.attempt++;update(c,'disconnected','已取消重连，可稍后再试');}}
 if(event.type==='result'){if(c.status!=='reconnecting'||c.attempt!==event.attempt)return state;update(c,event.ok?'connected':'failed',event.ok?'已恢复本地模拟连接':'服务暂时不可达，配对保留，请检查服务后重试');}
 if(event.type==='revoke'){c.authorized=false;c.attempt++;update(c,'revoked','配对已解除，重新连接需要双方再次确认');}
 return s;
}
