import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSystemTheme,matchSystemTheme,parseSystemTheme,type SystemThemeCustom} from '../src/system_theme.ts';
const custom:SystemThemeCustom=matchSystemTheme({name:'我的主题',primary:'#1E5A8F',background:'#F1F4F7',sidebar:'#1E5A8F',sidebar_style:'dark',appearance:{font_size:16,density:'comfortable'}},'#1E5A8F');
test('三个目标分别编辑，不串改已有颜色或快捷设置',async()=>{
 const {editThemeTargetColor}=await import('../src/theme_color_targets.ts');
 const bg=editThemeTargetColor(custom,'background','#FFF7E6');assert.equal(bg.background,'#FFF7E6');assert.equal(bg.primary,custom.primary);assert.equal(bg.sidebar,custom.sidebar);assert.deepEqual(bg.appearance,custom.appearance);
 const side=editThemeTargetColor(bg,'sidebar','#14532D');assert.equal(side.sidebar,'#14532D');assert.equal(side.background,bg.background);assert.equal(side.primary,bg.primary);
 assert.notEqual(custom.background,bg.background);assert.throws(()=>editThemeTargetColor(custom,'sidebar','url(x)'));
 assert.deepEqual(parseSystemTheme(JSON.stringify({...defaultSystemTheme(),preset_id:'custom',custom:side})).custom,side);
});
test('默认主色仍自动搭配，已有独立底色/侧栏改主色后保留，一键可重新自动搭配',async()=>{
 const {editThemeTargetColor}=await import('../src/theme_color_targets.ts');
 assert.deepEqual(editThemeTargetColor(custom,'primary','#22A2C3'),matchSystemTheme(custom,'#22A2C3'));
 const manual=editThemeTargetColor(editThemeTargetColor(custom,'background','#FFF7E6'),'sidebar','#14532D');
 const changed=editThemeTargetColor(manual,'primary','#D2357D');assert.equal(changed.primary,'#D2357D');assert.equal(changed.background,'#FFF7E6');assert.equal(changed.sidebar,'#14532D');assert.deepEqual(changed.appearance,custom.appearance);
 const automatic=matchSystemTheme(changed,changed.primary);assert.notEqual(automatic.background,changed.background);assert.equal(automatic.sidebar,changed.primary);assert.deepEqual(automatic.appearance,custom.appearance);
});

test('精选v3主题手动改主色仍保留侧栏层级与独立底色，随机跟随新色系',async()=>{
 const {editThemeTargetColor}=await import('../src/theme_color_targets.ts');
 const {randomizeSystemTheme}=await import('../src/theme_palette_rules.ts');
 const original={name:'我的主题',primary:'#3F72AF',background:'#F9F7F7',sidebar:'#DBE2EF',sidebar_style:'light' as const,palette_version:3 as const,palette_family:'blue' as const};
 const next=editThemeTargetColor(original,'primary','#D92121');
 assert.equal(next.palette_version,3);assert.equal(next.palette_family,'red');assert.equal(next.background,original.background);assert.equal(next.sidebar,original.sidebar);
 assert.equal(randomizeSystemTheme(next,undefined,()=>.5).palette_family,'red');
});
