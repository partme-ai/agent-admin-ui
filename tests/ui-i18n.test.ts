import test from 'node:test';
import assert from 'node:assert/strict';
import {isEnglish,uiText} from '../src/ui_i18n.ts';

test('system language follows browser and explicit language wins',()=>{
 assert.equal(isEnglish('系统默认','en-US'),true);
 assert.equal(isEnglish('系统默认','zh-CN'),false);
 assert.equal(isEnglish('English','zh-CN'),true);
 assert.equal(isEnglish('简体中文','en-US'),false);
});

test('public entry and management navigation translate without changing their identity',()=>{
 assert.equal(uiText('准备工作空间','English'),'Set up your workspace');
 assert.equal(uiText('模型服务','English'),'Model services');
 assert.equal(uiText('知识库管理','English'),'Knowledge bases');
 assert.equal(uiText('注销登录','English'),'Sign out');
 assert.equal(uiText('工作台','简体中文'),'工作台');
});
