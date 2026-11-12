import test from 'node:test';
import assert from 'node:assert/strict';
import recipes from '../src/vendor/interface_theme_recipes.json' with {type:'json'};
import {buildSystemTheme,defaultSystemTheme,parseSystemTheme,systemThemes,contrastRatio} from '../src/system_theme.ts';
import {classifyColorFamily,colorBrightness} from '../src/color_family.ts';
import {themeColorFamily} from '../src/theme_classification.ts';
import {editThemeTargetColor} from '../src/theme_color_targets.ts';

test('目录筛选与自定义色卡使用完全相同的色系规则',()=>{
 for(const hex of ['#DBE2EF','#A55704','#7D5A50','#FBEAD6','#8D5C56','#FFAAAA','#15182D','#ffffff',...recipes.flatMap(t=>[t.modes.light.primary,t.modes.light.sidebar])])assert.equal(themeColorFamily(hex),classifyColorFamily(hex),hex);
});
test('30套完整界面配方保留来源角色，两种模式独立、侧栏深于页面、八字说明',()=>{
 assert.equal(recipes.length,30);assert.equal(new Set(recipes.map(t=>t.id)).size,30);
 for(const r of recipes){assert.ok(systemThemes.some(t=>t.id===r.id),r.id);assert.equal(r.description.replace(/[^\u4e00-\u9fff]/g,'').length,8);
  for(const mode of ['light','dark'] as const){const v=buildSystemTheme({...defaultSystemTheme(),preset_id:r.id},mode);assert.deepEqual(v,r.modes[mode],r.id+'/'+mode);assert.ok(colorBrightness(v.sidebar)<colorBrightness(v.bg));for(const [fg,bg] of [[v.primary,v.bg],[v.primaryText,v.primary],[v.text,v.surface],[v.sidebarInk,v.sidebar],[v.sidebarSelectedInk||v.sidebarInk,v.sidebarSelected]])assert.ok(contrastRatio(fg,bg)>=4.5,r.id);}
 }
});
test('完整配方进入定制后保留明暗映射；手动改色退出引用，旧ID不替换',()=>{
 for(const r of recipes){const custom=systemThemes.find(t=>t.id===r.id)!.palette!;const s=parseSystemTheme(JSON.stringify({...defaultSystemTheme(),preset_id:'custom',custom}));assert.equal(s.custom!.ui_reference,r.id);assert.deepEqual(buildSystemTheme(s,'dark'),r.modes.dark);
 for(const target of ['primary','background','sidebar'] as const){const edited=editThemeTargetColor(custom,target,'#123456');assert.equal(edited.ui_reference,undefined);assert.equal(edited[target],'#123456');}}
 assert.throws(()=>parseSystemTheme(JSON.stringify({...defaultSystemTheme(),preset_id:'custom',custom:{...systemThemes.find(t=>t.id===recipes[0].id)!.palette,primary:'#123456'}})));
 assert.equal(defaultSystemTheme().preset_id,'jilan');assert.ok(systemThemes.some(t=>t.id==='curated-blue-02'));
 assert.throws(()=>parseSystemTheme(JSON.stringify({...defaultSystemTheme(),preset_id:'custom',custom:{...systemThemes.find(t=>t.id===recipes[0].id)!.palette,ui_reference:'https://bad.invalid'}})));
});

test('新的自动搭配只抽取同色系完整界面配方，保留名称和全部外观',async()=>{
 const {randomizeInterfaceTheme}=await import('../src/theme_palette_rules.ts');
 for(const r of recipes){const custom={...systemThemes.find(t=>t.id===r.id)!.palette!,name:'我的主题',appearance:{font_size:16}};const original=JSON.stringify(custom);const next=randomizeInterfaceTheme(custom,()=>.7);if(next){assert.ok(recipes.some(x=>x.id===next.ui_reference));assert.notEqual(next.ui_reference,custom.ui_reference);assert.equal(classifyColorFamily(next.primary),classifyColorFamily(custom.primary));assert.equal(next.name,custom.name);assert.deepEqual(next.appearance,custom.appearance);}assert.equal(JSON.stringify(custom),original);}
 const yellow={name:'手选黄色',primary:'#827417',background:'#FFFFF5',sidebar:'#202020',sidebar_style:'dark' as const};assert.equal(randomizeInterfaceTheme(yellow),undefined);
});
