import test from 'node:test';
import assert from 'node:assert/strict';
import {CameraSession} from '../src/camera_session.ts';
function deferred<T>(){let resolve!:(v:T)=>void,reject!:(e:any)=>void;const promise=new Promise<T>((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};}
function fixture(){
 let jobs=new Map<number,()=>void>(),seq=0,detached=0,stops=0;const phases:string[]=[],errors:string[]=[];
 const track=Object.assign(new EventTarget(),{readyState:'live',muted:false,stop(){stops++;this.readyState='ended';}});
 const stream=Object.assign(new EventTarget(),{getTracks:()=>[track],getVideoTracks:()=>[track]});
 const permission=deferred<any>(),play=deferred<void>();
 const session=new CameraSession({acquire:()=>permission.promise,attach:()=>play.promise,detach:()=>{detached++;},phase:p=>phases.push(p),error:e=>errors.push(e),schedule:fn=>{jobs.set(++seq,fn);return seq;},cancel:id=>{jobs.delete(id as number);}});
 return{session,permission,play,track,stream,phases,errors,jobs,get stops(){return stops;},get detached(){return detached;},fire(){const next=[...jobs.entries()][0];if(next){jobs.delete(next[0]);next[1]();}}};
}
test('拒绝后可重新发起，关闭等待授权后迟到流全部释放',async()=>{
 const f=fixture(),pending=f.session.start();f.permission.reject({name:'NotAllowedError'});assert.equal(await pending,false);assert.match(f.errors[0],/权限被拒绝/);
 const late=fixture(),opening=late.session.start();late.session.stop();late.permission.resolve(late.stream);assert.equal(await opening,false);assert.equal(late.stops,1);assert.equal(late.session.active,false);assert.equal(late.jobs.size,0);
});
test('播放尚未完成时中断也释放相机，迟到播放不能恢复扫描',async()=>{
 const f=fixture(),opening=f.session.start();f.permission.resolve(f.stream);await Promise.resolve();f.track.dispatchEvent(new Event('ended'));f.play.resolve();assert.equal(await opening,false);assert.equal(f.stops,1);assert.match(f.errors[0],/中断/);assert.equal(f.jobs.size,0);assert.ok(!f.phases.includes('scanning'));
});
test('采集中 mute 恢复取消超时，持续 mute 与 inactive 释放',async()=>{
 const f=fixture(),opening=f.session.start();f.permission.resolve(f.stream);await Promise.resolve();f.play.resolve();assert.equal(await opening,true);
 f.track.dispatchEvent(new Event('mute'));assert.equal(f.jobs.size,1);f.track.dispatchEvent(new Event('unmute'));assert.equal(f.jobs.size,0);assert.equal(f.session.active,true);
 f.track.dispatchEvent(new Event('mute'));f.fire();assert.equal(f.session.active,false);assert.equal(f.stops,1);assert.match(f.errors[0],/中断/);
 const g=fixture(),running=g.session.start();g.permission.resolve(g.stream);await Promise.resolve();g.play.resolve();await running;g.stream.dispatchEvent(new Event('inactive'));assert.equal(g.stops,1);assert.equal(g.session.active,false);
});
test('启动超时与停止移除监听，不产生旧轮次错误',async()=>{
 const f=fixture(),opening=f.session.start();f.permission.resolve(f.stream);await Promise.resolve();f.fire();f.play.resolve();assert.equal(await opening,false);assert.match(f.errors[0],/启动超时/);assert.equal(f.stops,1);
 const g=fixture(),running=g.session.start();g.permission.resolve(g.stream);await Promise.resolve();g.play.resolve();await running;g.session.stop();g.track.dispatchEvent(new Event('ended'));assert.equal(g.errors.length,0);assert.equal(g.jobs.size,0);assert.equal(g.stops,1);
});
test('每次重试独立，旧请求不取消新相机',async()=>{
 const first=deferred<any>(),second=deferred<any>();let calls=0,oldStops=0,newStops=0;
 const make=(stop:()=>void)=>{const track=Object.assign(new EventTarget(),{readyState:'live',muted:false,stop});return Object.assign(new EventTarget(),{getTracks:()=>[track],getVideoTracks:()=>[track]});};
 const old=make(()=>oldStops++),next=make(()=>newStops++);
 const s=new CameraSession({acquire:()=>++calls===1?first.promise:second.promise,attach:async()=>{},detach:()=>{},phase:()=>{},error:()=>{}});
 const a=s.start(),b=s.start();second.resolve(next);assert.equal(await b,true);first.resolve(old);assert.equal(await a,false);assert.equal(oldStops,1);assert.equal(newStops,0);assert.equal(s.active,true);s.stop();assert.equal(newStops,1);
});
test('授权永不返回也会超时，迟到授权不重新打开',async()=>{
 const f=fixture(),opening=f.session.start();f.fire();assert.equal(f.session.active,false);assert.match(f.errors[0],/启动超时/);assert.equal(f.phases.at(-1),'idle');f.permission.resolve(f.stream);assert.equal(await opening,false);assert.equal(f.stops,1);
});
test('拒绝后同一会话重新授权可恢复采集',async()=>{
 const f=fixture();let calls=0;const phases:string[]=[],errors:string[]=[];
 const s=new CameraSession({acquire:async()=>{if(++calls===1)throw {name:'NotAllowedError'};return f.stream as any;},attach:async()=>{},detach:()=>{},phase:p=>phases.push(p),error:e=>errors.push(e)});
 assert.equal(await s.start(),false);assert.match(errors[0],/权限被拒绝/);assert.equal(await s.start(),true);assert.equal(s.active,true);assert.equal(phases.at(-1),'scanning');s.stop();assert.equal(f.stops,1);
});
