import test from 'node:test';
import assert from 'node:assert/strict';
import {revealInitialTypography} from '../src/initial_typography.ts';
import {resolveConsoleHost} from '../src/shell_layout.ts';

test('浏览器默认Web，尺寸不改变账号入口；明确的原生预览保留',()=>{
 assert.equal(resolveConsoleHost(null),'web');
 assert.equal(resolveConsoleHost('web'),'web');
 for(const host of ['desktop','android','ipad'] as const)assert.equal(resolveConsoleHost(host),host);
 assert.equal(resolveConsoleHost('tablet'),'web');
});

test('首屏先完成主题布局，再等待字库与最终布局，不展示替代字体帧',async()=>{
 const events:string[]=[];let release!:()=>void;
 const fonts=new Promise<void>(resolve=>{release=resolve;});
 const pending=revealInitialTypography({frame:async()=>{events.push('layout');},ready:()=>{events.push('fonts');return fonts;},reveal:()=>events.push('reveal')});
 await Promise.resolve();assert.deepEqual(events,['layout','fonts']);
 release();await pending;assert.deepEqual(events,['layout','fonts','layout','reveal']);
});

test('字体API不可用或失败仍显示页面；卸载后不再释放首屏',async()=>{
 let shown=0;
 await revealInitialTypography({frame:async()=>{},ready:()=>Promise.reject(Error('font api')),reveal:()=>shown++});
 assert.equal(shown,1);
 await revealInitialTypography({frame:async()=>{},ready:async()=>{},active:()=>false,reveal:()=>shown++});
 assert.equal(shown,1);
});
