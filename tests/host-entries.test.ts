import test from 'node:test';
import assert from 'node:assert/strict';
import {previewDevices,entryFor,normalizeCompareState,viewportFor} from '../src/compare_state.ts';
import {resolveConsoleHost,resolveConsoleDevice,shellGroupsForHost,shellTarget,settingsSelection,nativeSettingsMode} from '../src/shell_layout.ts';

test('四端均有独立入口，对比页使用同一入口',()=>{
 const state=normalizeCompareState(null);
 assert.deepEqual(previewDevices.map(item=>item.label),['Web','Desktop','Pad','Mobile']);
 assert.equal(entryFor('web',state),'./web/index.html?theme=light#/w/demo/home');
 assert.equal(entryFor('mobile',state),'./mobile/index.html?theme=light#/w/demo/home');
 assert.equal(entryFor('tablet',state),'./tablet/index.html?theme=light#/w/demo/home');
 assert.equal(entryFor('desktop',state),'./desktop/index.html?theme=light#/w/demo/home');
 assert.equal(viewportFor('web',state).width,1280);
 assert.equal(viewportFor('tablet',state).width,768);
 assert.equal(viewportFor('mobile',state).width,390);
});

test('独立入口锁定宿主，不受浏览器查询参数改变',()=>{
 assert.equal(resolveConsoleHost('web','desktop'),'desktop');
 assert.equal(resolveConsoleHost('web','ipad'),'ipad');
 assert.equal(resolveConsoleHost('desktop','web'),'web');
 assert.equal(resolveConsoleDevice('mobile',390,'desktop'),'desktop');
 assert.equal(resolveConsoleDevice('desktop',1280,'ipad'),'tablet');
 assert.equal(resolveConsoleDevice('desktop',1280,'android'),'mobile');
});

test('Web 主导航展示系统，Desktop 和 Tablet 由独立设置导航进入',()=>{
 const labels=(host:'web'|'desktop'|'ipad')=>shellGroupsForHost(host).flatMap(group=>group.items.map(item=>item.label));
 assert.ok(labels('web').includes('系统'));
 assert.ok(!labels('desktop').includes('系统'));
 assert.ok(!labels('ipad').includes('系统'));
 assert.ok(shellGroupsForHost('desktop','settings').some(group=>group.items.some(item=>item.label==='系统设置')));
});

test('原生设置的基础、通知、语音和关于各自定位到真实视图',()=>{
 assert.deepEqual(['basic/general','basic/appearance','basic/notifications','basic/voice','about'].map(key=>shellTarget(key)?.item),['basic-general','basic-appearance','basic-notifications','basic-voice','about']);
 assert.equal(settingsSelection('30','basic-notifications','system'),'basic/notifications');
 assert.equal(settingsSelection('30','about','system'),'about');
 assert.equal(settingsSelection('52','general','system'),'system/configuration/general');
 assert.equal(nativeSettingsMode('33','basic-voice'),true);
 assert.equal(nativeSettingsMode('30','terminals'),false);
 assert.equal(nativeSettingsMode('06',''),false);
});
