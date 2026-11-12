import test from 'node:test';
import assert from 'node:assert/strict';
import {theme} from 'antd';
import {defaultSystemTheme,systemThemes,contrastRatio} from '../src/system_theme.ts';
import {systemThemeConfig,resolveThemeColors,navigationThemeConfig,themeVariablesFromToken} from '../src/antd_theme.ts';

test('官方算法及组件Token覆盖明暗与触控尺寸，自有壳消费相同Token',()=>{
 for(const mode of ['light','dark'] as const)for(const device of ['desktop','tablet','mobile'] as const){
  const config=systemThemeConfig(defaultSystemTheme(),mode,device);
  assert.deepEqual(config.algorithm,[mode==='dark'?theme.darkAlgorithm:theme.defaultAlgorithm,theme.compactAlgorithm]);
  const t=theme.getDesignToken(config),colors=resolveThemeColors(defaultSystemTheme(),mode,device);
  const vars=themeVariablesFromToken(t,colors);
  assert.equal(vars['--accent'],t.colorPrimary);assert.equal(vars['--surface'],t.colorBgContainer);assert.equal(vars['--text'],t.colorText);
  assert.equal(t.controlHeight,device==='desktop'?28:40);
  for(const name of ['Menu','Button','Input','Select','Table','Card','Modal','Drawer'])assert.ok(config.components?.[name]);
 }
});

test('全部主题的侧栏普通、悬停、选中及抽屉颜色独立，菜单状态文字可读',()=>{
 for(const p of systemThemes)for(const mode of ['light','dark'] as const){
  const colors=resolveThemeColors({...defaultSystemTheme(),preset_id:p.id},mode,'desktop');
  for(const region of ['sidebar','drawer'] as const){
   const m=navigationThemeConfig(colors,mode,'desktop',region).components!.Menu!;
   for(const [fg,bg] of [[m.itemColor,m.itemBg],[m.itemSelectedColor,m.itemSelectedBg],[m.darkItemColor,m.darkItemBg],[m.darkItemSelectedColor,m.darkItemSelectedBg]])assert.ok(contrastRatio(String(fg),String(bg))>=4.5,`${p.id}/${mode}/${region}: ${fg}/${bg}`);
   assert.ok(m.itemHoverColor);assert.ok(m.itemHoverBg);assert.ok(m.itemDisabledColor);
  }
 }
 const colors=resolveThemeColors(defaultSystemTheme(),'light','desktop');
 const side=navigationThemeConfig(colors,'light','desktop','sidebar').components!.Menu!;
 const drawer=navigationThemeConfig(colors,'light','desktop','drawer').components!.Menu!;
 assert.notEqual(side.itemBg,drawer.itemBg);
});

test('系统减少动态效果通过官方motion Token关闭菜单及浮层动效',()=>{
 assert.equal(theme.getDesignToken(systemThemeConfig(defaultSystemTheme(),'light','desktop',true)).motion,false);
});

test('三端侧栏与抽屉使用相同图文间距，弹出菜单继承同一组件Token',()=>{
 for(const device of ['desktop','tablet','mobile'] as const)for(const region of ['sidebar','drawer'] as const){
  const colors=resolveThemeColors(defaultSystemTheme(),'light',device);
  const m=navigationThemeConfig(colors,'light',device,region).components!.Menu!;
  assert.equal(m.iconMarginInlineEnd,8);
  assert.equal(m.fontSize,14);
  assert.equal(m.itemHeight,device==='desktop'?34:40);
  assert.equal(m.itemSelectedBg,m.darkItemSelectedBg);
  assert.equal(m.itemSelectedColor,m.darkItemSelectedColor);
 }
});

test('实际派生后的正文、次要文字与主按钮保持可读，而非只检查输入种子色',()=>{
 for(const p of systemThemes)for(const mode of ['light','dark'] as const){
  const c=resolveThemeColors({...defaultSystemTheme(),preset_id:p.id},mode,'desktop');
  for(const [fg,bg] of [[c.text,c.surface],[c.muted,c.bg],[c.primaryText,c.primary]])assert.ok(contrastRatio(fg,bg)>=4.5,`${p.id}/${mode}: ${fg}/${bg}`);
 }
});
