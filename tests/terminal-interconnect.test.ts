import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeServiceAddress,createOffer,offerPayload,parseOffer,normalizeTerminalState,transitionTerminal} from '../src/terminal_interconnect.ts';
const now=1800000000000;
const offer=()=>createOffer({name:'书房 Desktop',target:'desktop',endpoint:'http://192.168.3.8:8000/'},now);
const setup=()=>{const o=offer();return {o,s:normalizeTerminalState({clients:[],offer:o})};};
const request=(o:ReturnType<typeof offer>)=>({type:'request' as const,name:'我的 Pad',kind:'Pad',scope:'read',agents:['a1'],endpoint:o.endpoint,target:o.target,offer:o,source:'qr' as const});
test('服务地址规范化且不接收脚本、凭据或无主机地址',()=>{
 assert.equal(normalizeServiceAddress(' https://TinyBot.example.com/ '),'https://tinybot.example.com');
 for(const input of ['javascript:alert(1)','file:///tmp/test','https://name:password@example.com','not-a-url'])assert.throws(()=>normalizeServiceAddress(input));
});
test('本地分享二维码往返；过期、畸形、伪协议或错误版本被拒绝',()=>{
 const o=offer();assert.deepEqual(parseOffer(offerPayload(o),now),o);
 assert.throws(()=>parseOffer(offerPayload(o),o.expiresAt));
 assert.throws(()=>parseOffer('https://example.com/anything',now));
 assert.throws(()=>parseOffer('tinybot://pair?data='+encodeURIComponent(JSON.stringify({...o,v:9})),now));
});
test('只有双方确认后才连接，单次码不可重用',()=>{
 const {o,s}=setup();const a=transitionTerminal(s,request(o),now),id=a.clients[0].id;
 assert.equal(a.clients[0].status,'review');assert.equal(a.clients[0].authorized,false);
 assert.throws(()=>transitionTerminal(a,{type:'approve',id},now));
 const b=transitionTerminal(a,{type:'confirm',id},now);assert.equal(b.clients[0].status,'pending');
 const c=transitionTerminal(b,{type:'approve',id},now);assert.equal(c.clients[0].status,'connected');assert.equal(c.clients[0].authorized,true);
 assert.throws(()=>transitionTerminal(c,{...request(o),name:'另一台手机'},now));
});
test('取消、拒绝、到期与刷新二维码不会生成已连接记录',()=>{
 for(const action of ['cancel','reject'] as const){const {o,s}=setup();let a=transitionTerminal(s,request(o),now);const id=a.clients[0].id;if(action==='reject')a=transitionTerminal(a,{type:'confirm',id},now);a=transitionTerminal(a,{type:action,id},now);assert.notEqual(a.clients[0].status,'connected');assert.equal(a.clients[0].authorized,false);}
 const {o,s}=setup();const a=transitionTerminal(s,request(o),now),id=a.clients[0].id;
 assert.throws(()=>transitionTerminal(a,{type:'confirm',id},o.expiresAt));
 const renewed=transitionTerminal(a,{type:'offer',offer:offer()},now);assert.equal(renewed.clients[0].status,'expired');
});
test('断开保留授权，重连不新建记录；取消后迟到回执无效',()=>{
 const {o,s}=setup();let a=transitionTerminal(s,request(o),now),id=a.clients[0].id;
 a=transitionTerminal(transitionTerminal(a,{type:'confirm',id},now),{type:'approve',id},now);
 a=transitionTerminal(a,{type:'disconnect',id},now);assert.equal(a.clients[0].authorized,true);
 a=transitionTerminal(a,{type:'reconnect',id},now);const attempt=a.clients[0].attempt;
 a=transitionTerminal(a,{type:'cancel-reconnect',id},now);a=transitionTerminal(a,{type:'result',id,attempt,ok:true},now);
 assert.equal(a.clients[0].status,'disconnected');assert.equal(a.clients.length,1);
 a=transitionTerminal(a,{type:'reconnect',id},now);a=transitionTerminal(a,{type:'result',id,attempt:a.clients[0].attempt,ok:false},now);assert.equal(a.clients[0].status,'failed');
 a=transitionTerminal(a,{type:'reconnect',id},now);a=transitionTerminal(a,{type:'result',id,attempt:a.clients[0].attempt,ok:true},now);assert.equal(a.clients[0].status,'connected');
 a=transitionTerminal(a,{type:'revoke',id},now);assert.throws(()=>transitionTerminal(a,{type:'reconnect',id},now));
});
test('旧配对ID和字段保留但不当作在线；刷新中的重连安全恢复',()=>{
 const old={code:'123456',clients:[{id:'old-id',name:'我的小程序',scope:'chat',agents:['a1'],custom:'preserve'}]};
 const a=normalizeTerminalState(old);assert.equal(a.clients[0].id,'old-id');assert.equal(a.clients[0].status,'paired');assert.equal(a.clients[0].authorized,false);assert.equal((a.clients[0] as any).custom,'preserve');
 assert.equal(normalizeTerminalState({clients:[{...a.clients[0],status:'reconnecting',authorized:true}]}).clients[0].status,'disconnected');
 assert.equal(old.clients[0].custom,'preserve');
});

test('手动地址请求同样过期；地址确认后仍必须服务端批准',()=>{
 const s=normalizeTerminalState({}),a=transitionTerminal(s,{type:'request',name:'手机',kind:'手机',endpoint:'https://service.tinybot.test',target:'server',scope:'read',agents:['a1'],source:'address'},now),id=a.clients[0].id;
 assert.throws(()=>transitionTerminal(a,{type:'confirm',id},now+300001));
 assert.equal(transitionTerminal(a,{type:'expire'},now+300001).clients[0].status,'expired');
 assert.equal(a.clients[0].status,'review');
});
