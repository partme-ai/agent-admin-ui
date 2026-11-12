import test from 'node:test';
import assert from 'node:assert/strict';
import {createThemeTransition,type ThemeTransitionHandle} from '../src/theme_transition.ts';
function deferred(){let resolve!:()=>void,reject!:(e:Error)=>void;const promise=new Promise<void>((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
function fixture(enabled=true,supported=true){
 const tasks:(()=>void)[]=[],marks:boolean[]=[],starts:{update:()=>void;handle:ThemeTransitionHandle;done:ReturnType<typeof deferred>;ready:ReturnType<typeof deferred>}[]=[];
 let commits=0,skips=0;
 const t=createThemeTransition({schedule:job=>tasks.push(job),enabled:()=>enabled,commit:job=>{commits++;job();},mark:active=>marks.push(active),start:supported?update=>{const ready=deferred(),done=deferred(),handle={ready:ready.promise,updateCallbackDone:ready.promise,finished:done.promise,skipTransition(){skips++;}};starts.push({update,handle,done,ready});return handle;}:undefined});
 return{t,tasks,marks,starts,get commits(){return commits;},get skips(){return skips;}};
}
test('翻页先捕获旧画面，再提交一次新主题，完成后清理标记',async()=>{
 const f=fixture();let theme='霁蓝';f.t.run(()=>{theme='朱砂';});assert.equal(theme,'霁蓝');f.tasks.shift()!();assert.equal(theme,'霁蓝');assert.deepEqual(f.marks,[true]);
 f.starts[0].update();f.starts[0].update();assert.equal(theme,'朱砂');assert.equal(f.commits,1);
 f.starts[0].ready.resolve();f.starts[0].done.resolve();await Promise.resolve();assert.equal(f.marks.at(-1),false);
});
test('同一轮和跨动画快速切换，迟到的旧更新不能覆盖最后选择',async()=>{
 const f=fixture();let mode='light';f.t.run(()=>{mode='dark';});f.t.run(()=>{mode='system';});while(f.tasks.length)f.tasks.shift()!();assert.equal(f.starts.length,1);
 const old=f.starts[0];f.t.run(()=>{mode='light';});f.tasks.shift()!();assert.equal(f.skips,1);
 old.update();assert.equal(mode,'light');f.starts[1].update();assert.equal(f.commits,1);
 old.done.resolve();await Promise.resolve();assert.equal(f.marks.at(-1),true);
 f.starts[1].ready.resolve();f.starts[1].done.resolve();await Promise.resolve();assert.equal(f.marks.at(-1),false);
});
test('减少动态效果或无API直接更新，不留下翻页标记',()=>{
 for(const f of [fixture(false),fixture(true,false)]){let value=0;f.t.run(()=>{value++;});f.tasks.shift()!();assert.equal(value,1);assert.equal(f.starts.length,0);assert.equal(f.commits,1);assert.equal(f.marks.at(-1),false);}
});
test('API抛错或拒绝动画仍更新一次，Promise错误已处理',async()=>{
 let calls=0;const marks:boolean[]=[];const t=createThemeTransition({schedule:job=>job(),enabled:()=>true,commit:job=>job(),mark:v=>marks.push(v),start:()=>{throw Error('unsupported');}});
 t.run(()=>{calls++;});assert.equal(calls,1);assert.equal(marks.at(-1),false);
 const f=fixture();f.t.run(()=>{calls++;});f.tasks.shift()!();f.starts[0].ready.reject(Error('skipped'));f.starts[0].done.reject(Error('skipped'));await Promise.resolve();await Promise.resolve();assert.equal(calls,2);assert.equal(f.commits,1);assert.equal(f.marks.at(-1),false);
});
test('销毁取消待执行和进行中的动画，不再修改已卸载界面',()=>{
 const f=fixture();let calls=0;f.t.run(()=>{calls++;});f.t.dispose();while(f.tasks.length)f.tasks.shift()!();assert.equal(calls,0);assert.equal(f.marks.at(-1),false);
 const g=fixture();g.t.run(()=>{calls++;});g.tasks.shift()!();g.t.dispose();g.starts[0].update();assert.equal(calls,0);assert.equal(g.skips,1);assert.equal(g.marks.at(-1),false);
});

// 例如先点深色又立即点回当前浅色，不能因“浅色未变”而留下深色请求。
test('最后选择与当前颜色相同也取消待执行切换，不播放无意义动画',()=>{
 const f=fixture();let value='light';f.t.run(()=>{value='dark';});f.t.run(()=>{value='light';},false);while(f.tasks.length)f.tasks.shift()!();assert.equal(value,'light');assert.equal(f.starts.length,0);assert.equal(f.commits,1);
});

test('翻页预览不写主题或机器人配置，明确保存仍保留旧主题全部字段',async()=>{
 const {defaultSystemTheme,parseSystemTheme,readSystemTheme,writeSystemTheme,systemThemeKey}=await import('../src/system_theme.ts');
 const {characterPresetKey}=await import('../src/character_presets.ts');
 const saved={...defaultSystemTheme(),preset_id:'custom',mode:'system',custom:{name:'已有主题',primary:'#1E5A8F',background:'#F7F8FA',sidebar:'#1E5A8F',sidebar_style:'dark',appearance:{font_size:15,colors:{light:{text:'#273044'}}}}};
 const raw=JSON.stringify(saved),robot='[{"id":"mine","config":{"color":"traditional742-742","expression":33}}]',map=new Map([[systemThemeKey,raw],[characterPresetKey,robot]]);
 const storage={getItem:(key:string)=>map.get(key)||null,setItem:(key:string,value:string)=>{assert.equal(key,systemThemeKey);map.set(key,value);}};
 let active=readSystemTheme(storage).settings;const f=fixture();f.t.run(()=>{active={...active,preset_id:'zhusha'};});f.tasks.shift()!();f.starts[0].update();
 assert.equal(active.preset_id,'zhusha');assert.equal(map.get(systemThemeKey),raw);assert.equal(map.get(characterPresetKey),robot);
 writeSystemTheme(storage,parseSystemTheme(JSON.stringify({...saved,mode:'dark'})));
 assert.deepEqual(readSystemTheme(storage).settings,{...saved,mode:'dark'});assert.equal(map.get(characterPresetKey),robot);
});
