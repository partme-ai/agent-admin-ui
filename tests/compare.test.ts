import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCompareState,readCompareState,writeCompareState,canvasSize,viewportFor,surfaceFor,fitScale,fitRowScales,deviceScale,previewRows,COMPARISON_STATE_KEY} from '../src/compare_state.ts';
test('对比页四端尺寸与旋转使用真实 viewport',()=>{
 const state=normalizeCompareState(null);
 assert.equal(state.scale,.65);
 assert.equal(state.active,'web');
 assert.deepEqual(viewportFor('web',state).width,1280);
 assert.equal(viewportFor('tablet',state).height,1024);
 assert.equal(viewportFor('desktop',state).width,1280);
 assert.equal(viewportFor('mobile',state).width,390);
 assert.equal(viewportFor('web',{...state,landscape:{web:true}}).width,1024);
 assert.equal(viewportFor('mobile',{...state,presets:{mobile:'iphone-se'}}).height,667);
});
test('四端分两排，按较宽一排适配画布',()=>{
 const state=normalizeCompareState(null),all=canvasSize(state);
 assert.deepEqual(state.enabled,{web:true,desktop:true,tablet:true,mobile:true});
 assert.deepEqual(previewRows(state).map(row=>row.map(d=>d.id)),[['web','desktop'],['tablet','mobile']]);
 assert.ok(all.height>canvasSize({...state,enabled:{...state.enabled,mobile:false}}).height);
 const scale=fitScale(state,1280);
 assert.ok(scale<state.scale);
 assert.ok(canvasSize(state,scale).width<=1280);
 assert.ok(deviceScale('mobile',scale)>deviceScale('web',scale));
 const rowScales=fitRowScales(state,1280);
 assert.ok(rowScales[1]>rowScales[0]);
 assert.ok(canvasSize(state,rowScales).width<=1280);
 const wide={...state,presets:{desktop:'full-hd'}};
 assert.ok(canvasSize(wide,fitRowScales(wide,1900)).width<=1900);
 assert.deepEqual(previewRows({...state,enabled:{web:true,desktop:false,tablet:true,mobile:true}}).map(row=>row.map(d=>d.id)),[['web','tablet'],['mobile']]);
});
test('控制台恢复可见端、尺寸和旋转；只保存白名单字段',()=>{
 let saved='';const storage={getItem:()=>saved||null,setItem:(key:string,value:string)=>{assert.equal(key,COMPARISON_STATE_KEY);saved=value;}};
 const state={...normalizeCompareState(null),active:'mobile' as const,enabled:{web:true,desktop:true,tablet:true,mobile:false},presets:{mobile:'iphone-se'},landscape:{mobile:true}};
 assert.equal(writeCompareState(storage,{...state,apiKey:'secret'}),true);
 assert.deepEqual(readCompareState(storage),state);assert.equal(saved.includes('secret'),false);
 assert.equal(COMPARISON_STATE_KEY,'agentAdminCompareControlsV1');
});
test('兼容已有书签；URL 明确值优先，非法状态安全回退',()=>{
 const storage={getItem:()=>JSON.stringify({page:'08',scale:.65,theme:'dark'}),setItem:()=>{}};
 assert.equal(readCompareState(storage,'?page=01&scale=0.45&theme=light').page,'01');
 assert.equal(readCompareState(storage,'?scale=0.45').scale,.45);
 const state=normalizeCompareState({scale:99,page:'bad',active:'unknown',style:'script',presets:{web:'unknown'},landscape:{desktop:'yes'}});
 assert.equal(state.scale,.65);assert.equal(state.page,'01');assert.equal(state.active,'web');assert.equal(state.style,'cards');assert.equal(viewportFor('web',state).width,1280);assert.equal(viewportFor('desktop',state).width,1280);
 assert.equal(readCompareState(storage,'?tab=mobile').active,'mobile');
 assert.equal(readCompareState(storage,'?page=30&item=basic-notifications').item,'basic-notifications');
 assert.equal(writeCompareState({getItem:()=>null,setItem:()=>{throw new Error('disabled');}},state),false);
});
test('四端联动保留安全的子页面参数，独立入口指向同一视图',async()=>{
 const {entryFor}=await import('../src/compare_state.ts');
 const state=normalizeCompareState({page:'30',item:'basic-notifications'});
 assert.equal(entryFor('desktop',state),'./desktop/index.html?theme=light#/w/demo/settings/general?item=basic-notifications');
 assert.equal(entryFor('tablet',state),'./tablet/index.html?theme=light#/w/demo/settings/general?item=basic-notifications');
 assert.equal(normalizeCompareState({page:'30',item:'<script>'}).item,'');
 assert.equal(surfaceFor('33','basic-voice'),'settings');
});
test('顶部区域对应现有 Agent Admin 页面，不创建空白业务入口',()=>{
 assert.equal(surfaceFor('01'),'home');assert.equal(surfaceFor('04'),'work');assert.equal(surfaceFor('30'),'settings');assert.equal(surfaceFor('02'),'conversation');assert.equal(surfaceFor('14'),'work');
});

test('移除风格下拉框后，旧存储和书签不再切换预览布局',()=>{
 assert.equal(normalizeCompareState({style:'compact'}).style,'cards');
 const storage={getItem:()=>JSON.stringify({style:'compact',page:'08'}),setItem:()=>{}};
 assert.equal(readCompareState(storage,'?style=compact').style,'cards');
 assert.equal(readCompareState(storage).page,'08');
});
