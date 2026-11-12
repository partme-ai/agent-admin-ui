import test from 'node:test';
import assert from 'node:assert/strict';
import {sidebarReducer,type SidebarState} from '../src/sidebar_behavior.ts';

test('点击明确收起和展开，不生成会遮住展开按钮的临时浮层',()=>{
 let state:SidebarState={collapsed:false};
 state=sidebarReducer(state,{type:'toggle'});assert.deepEqual(state,{collapsed:true});
 state=sidebarReducer(state,{type:'toggle'});assert.deepEqual(state,{collapsed:false});
});

test('快速反复切换保持最终点击状态，不修改传入状态',()=>{
 const initial:SidebarState={collapsed:false};let state=initial;
 for(let i=0;i<11;i++)state=sidebarReducer(state,{type:'toggle'});
 assert.deepEqual(state,{collapsed:true});assert.deepEqual(initial,{collapsed:false});
});
