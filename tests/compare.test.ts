import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCompareState,readCompareState,writeCompareState,canvasSize,viewportFor,surfaceFor,COMPARISON_STATE_KEY} from '../src/compare_state.ts';
test('对比页默认顺序和尺寸对齐 TinyClaw，旋转交换真实 viewport',()=>{
 const state=normalizeCompareState(null);
 assert.equal(state.scale,.65);
 assert.deepEqual(viewportFor('phone',state).width,390);
 assert.equal(viewportFor('tablet',state).height,1024);
 assert.equal(viewportFor('desktop',state).width,1280);
 assert.equal(viewportFor('phone',{...state,landscape:{phone:true}}).width,884);
 assert.equal(viewportFor('phone',{...state,presets:{phone:'iphone-se'}}).height,667);
});
test('标尺覆盖可见设备和间隔，关闭设备后画布收缩但仍可重新开启',()=>{
 const state=normalizeCompareState(null),all=canvasSize(state);
 assert.equal(all.width,(390+768+1280)*.65+96);
 const desktopOnly={...state,enabled:{phone:false,tablet:false,desktop:true}};
 assert.equal(canvasSize(desktopOnly).width,1280*.65+48);
 assert.equal(canvasSize({...state,enabled:{phone:false,tablet:false,desktop:false}}).width,360);
});
test('控制台恢复尺寸、旋转、预览开关；只保存白名单字段',()=>{
 let saved='';const storage={getItem:()=>saved||null,setItem:(key:string,value:string)=>{assert.equal(key,COMPARISON_STATE_KEY);saved=value;}};
 const state={...normalizeCompareState(null),presets:{tablet:'tablet-large'},landscape:{tablet:true},enabled:{phone:false,tablet:true,desktop:true}};
 assert.equal(writeCompareState(storage,{...state,apiKey:'secret'}),true);
 assert.deepEqual(readCompareState(storage),state);assert.equal(saved.includes('secret'),false);
 assert.equal(COMPARISON_STATE_KEY,'tinybotCompareControlsV1');
});
test('兼容已有书签；URL 明确值优先，非法状态安全回退',()=>{
 const storage={getItem:()=>JSON.stringify({page:'08',scale:.65,theme:'dark'}),setItem:()=>{}};
 assert.equal(readCompareState(storage,'?page=01&scale=0.45&theme=light').page,'01');
 assert.equal(readCompareState(storage,'?scale=0.45').scale,.45);
 const state=normalizeCompareState({scale:99,page:'bad',style:'script',presets:{phone:'unknown'},enabled:{phone:'false'},landscape:{desktop:'yes'}});
 assert.equal(state.scale,.65);assert.equal(state.page,'01');assert.equal(state.style,'cards');assert.equal(state.enabled.phone,true);assert.equal(viewportFor('phone',state).width,390);assert.equal(viewportFor('desktop',state).width,1280);
 assert.equal(writeCompareState({getItem:()=>null,setItem:()=>{throw new Error('disabled');}},state),false);
});
test('顶部区域对应现有 TinyBot 页面，不创建空白业务入口',()=>{
 assert.equal(surfaceFor('01'),'home');assert.equal(surfaceFor('04'),'work');assert.equal(surfaceFor('30'),'settings');assert.equal(surfaceFor('02'),'conversation');assert.equal(surfaceFor('14'),'mobile');
});

test('移除风格下拉框后，旧存储和书签不再切换预览布局',()=>{
 assert.equal(normalizeCompareState({style:'compact'}).style,'cards');
 const storage={getItem:()=>JSON.stringify({style:'compact',page:'08'}),setItem:()=>{}};
 assert.equal(readCompareState(storage,'?style=compact').style,'cards');
 assert.equal(readCompareState(storage).page,'08');
});
