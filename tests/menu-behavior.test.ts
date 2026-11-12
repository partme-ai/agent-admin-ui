import test from 'node:test';
import assert from 'node:assert/strict';
import {accordionKeys,menuScrollDelta,menuScrollThumb} from '../src/menu_behavior.ts';
test('一级菜单互斥，切换分组只保留新打开项，允许主动全部收起',()=>{
 assert.deepEqual(accordionKeys(['agents'],['agents','resources']),['resources']);
 assert.deepEqual(accordionKeys(['resources'],['resources','system']),['system']);
 assert.deepEqual(accordionKeys(['system'],[]),[]);
 assert.deepEqual(accordionKeys([],['knowledge']),['knowledge']);
 assert.deepEqual(accordionKeys(['knowledge'],['knowledge']),['knowledge']);
 assert.deepEqual(accordionKeys(['agents'],['agents','unknown','home']),['agents']);
});
test('只滚动菜单自身，已可见项目不动，顶部/底部项目按最小距离进入可见区域',()=>{
 assert.equal(menuScrollDelta(100,500,150,184),0);
 assert.equal(menuScrollDelta(100,500,80,114),-26);
 assert.equal(menuScrollDelta(100,500,490,524),30);
 assert.equal(menuScrollDelta(100,500,106,494),0);
});
test('滚动滑块不占布局宽度，顶部/底部位置准确，无溢出不显示',()=>{
 assert.deepEqual(menuScrollThumb(500,500,0),{visible:false,height:0,top:0});
 assert.deepEqual(menuScrollThumb(500,1000,0),{visible:true,height:250,top:0});
 assert.deepEqual(menuScrollThumb(500,1000,500),{visible:true,height:250,top:250});
 assert.deepEqual(menuScrollThumb(100,10000,99999),{visible:true,height:24,top:76});
 assert.deepEqual(menuScrollThumb(0,500,0),{visible:false,height:0,top:0});
});

test('深层手风琴保留祖先，同级网关与统计互斥',()=>{
 assert.deepEqual(accordionKeys(['models','models/gateway'],['models','models/gateway','models/models-reports']),['models','models/models-reports']);
 assert.deepEqual(accordionKeys(['models','models/gateway'],['models']),['models']);
 assert.deepEqual(accordionKeys(['models'],['models','system','system/audit']),['system','system/audit']);
});
