import test from 'node:test';
import assert from 'node:assert/strict';
import {themeColorFamily,themeFilterFamily} from '../src/theme_classification.ts';
import {colorFamilies} from '../src/color_family.ts';
import {resolveThemeColors} from '../src/antd_theme.ts';
import {recommendedSystemThemes,classicSystemTheme,defaultSystemTheme} from '../src/system_theme.ts';

test('同一主题按主色和侧栏分别归类，不使用背景色或上游标签',()=>{
 const colors={primary:'#D92121',sidebar:'#12476A'};
 assert.equal(themeFilterFamily(colors,'primary'),'red');assert.equal(themeFilterFamily(colors,'sidebar'),'blue');
 assert.equal(themeColorFamily('#DBE2EF'),'neutral');assert.equal(themeColorFamily('#787878'),'neutral');assert.equal(themeColorFamily('#ffffff'),'neutral');assert.equal(themeColorFamily('#000000'),'neutral');
 assert.equal(themeColorFamily('#A55704'),'brown');assert.equal(themeColorFamily('#7D5A50'),'brown');
});

test('当前明暗模式各自统计实际主色及侧栏色，所有主题恰好归类一次',()=>{
 const choices=[...recommendedSystemThemes,classicSystemTheme],before=JSON.stringify(choices);
 for(const mode of ['light','dark'] as const)for(const target of ['primary','sidebar'] as const){
  const entries=choices.map(t=>({theme:t,colors:resolveThemeColors({...defaultSystemTheme(),preset_id:t.id},mode,'desktop')}));
  const counts=colorFamilies.map(f=>entries.filter(e=>themeFilterFamily(e.colors,target)===f.id).length);
  assert.equal(counts.reduce((a,b)=>a+b,0),301);assert.ok(new Set(counts).size>1,'不再固定每系30');
  for(const e of entries)assert.equal(themeFilterFamily(e.colors,target),themeColorFamily(e.colors[target]));
 }
 assert.equal(JSON.stringify(choices),before);
});
