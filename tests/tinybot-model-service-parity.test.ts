import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shellSubmenuIcons} from '../src/shell_layout.ts';

test('五类菜单图标使用现有字体图标组件',()=>{
 const component=readFileSync(new URL('../src/components.tsx',import.meta.url),'utf8');
 for(const [key,icon,componentName] of [
  ['text','message-outlined','MessageOutlined'],
  ['image','photo-outlined','PictureOutlined'],
  ['video','movie-outlined','VideoCameraOutlined'],
  ['tts','microphone-outlined','AudioOutlined'],
  ['asr','chart-column-outlined','BarChartOutlined']
 ]){
  assert.equal(shellSubmenuIcons[`models/model-settings/${key}`],icon);
  assert.ok(component.includes(`'${icon}':${componentName}`),`${icon} 缺少图标组件`);
 }
});

test('模型服务保留 TinyBot 顶部入口和语音音色管理',()=>{
 const page=readFileSync(new URL('../src/pages/ProviderSettings.tsx',import.meta.url),'utf8');
 assert.match(page,/key:'providers',label:'模型连接'/);
 assert.match(page,/key:'experience',label:'模型体验'/);
 assert.match(page,/key:'voices',label:'音色试听与管理'/);
 assert.match(page,/<Voices embedded\/>/);
});
