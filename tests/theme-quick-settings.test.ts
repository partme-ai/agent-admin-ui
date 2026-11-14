import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSystemTheme,parseSystemTheme,systemThemes,systemThemeAppearance,type SystemThemeSettings} from '../src/system_theme.ts';
import {parseQuickThemeIds,readQuickThemeIds,writeQuickThemeIds,selectQuickTheme,setQuickAppearance,quickThemeStorageKey} from '../src/theme_quick_settings.ts';
import {resolveThemeLayout,updateThemeLayout} from '../src/theme_layout.ts';

test('快捷主题清单独立保存，错误数据不覆盖原配置',()=>{
 const data=new Map<string,string>();
 const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
 writeQuickThemeIds(storage,['jilan','custom']);
 assert.deepEqual(readQuickThemeIds(storage).ids,['jilan','custom']);
 data.set(quickThemeStorageKey,'broken');
 assert.ok(readQuickThemeIds(storage).error);
 assert.equal(data.get(quickThemeStorageKey),'broken');
 assert.throws(()=>parseQuickThemeIds('{"schema_version":1,"ids":["unknown"]}'));
});

test('快捷外观和切换配色保留旧主题定义与字体',()=>{
 const custom={name:'保留',primary:'#1E5A8F',background:'#F1F4F7',sidebar:'#1E5A8F',sidebar_style:'dark' as const,appearance:{font_size:15,code_font_family:'jetbrains_mono' as const,border_radius:9}};
 const original={...defaultSystemTheme(),preset_id:'custom',custom};
 const preset=systemThemes.find(t=>t.id!=='jilan'&&t.id!=='default')!.id;
 const selected=parseSystemTheme(JSON.stringify(selectQuickTheme(original,preset)));
 assert.deepEqual(selected.custom,custom);
 assert.equal(systemThemeAppearance(selected)?.font_size,15);
 assert.equal(systemThemeAppearance(selected)?.code_font_family,'jetbrains_mono');
 const changed=parseSystemTheme(JSON.stringify(setQuickAppearance(selected,'border_radius',12)));
 assert.equal(systemThemeAppearance(changed)?.border_radius,12);
 assert.deepEqual(changed.custom,custom);
});

test('主题布局默认兼容旧配置，四组选择可保存且不改动个人配色',()=>{
 const custom={name:'我的主题',primary:'#1E5A8F',background:'#F1F4F7',sidebar:'#1E5A8F',sidebar_style:'dark' as const};
 const base={...defaultSystemTheme(),custom};
 assert.deepEqual(resolveThemeLayout(parseSystemTheme(JSON.stringify(base)).quick_layout),{sidebar:'sidebar',mode:'default',content:'full',direction:'ltr'});
 let selected:SystemThemeSettings=base;
 for(const [key,value] of Object.entries({sidebar:'floating',mode:'full',content:'centered',direction:'rtl'}))selected=updateThemeLayout(selected,key as keyof import('../src/theme_layout.ts').ThemeLayout,value);
 const parsed=parseSystemTheme(JSON.stringify(selected));
 assert.deepEqual(resolveThemeLayout(parsed.quick_layout),{sidebar:'floating',mode:'full',content:'centered',direction:'rtl'});
 assert.deepEqual(parsed.custom,custom);
 assert.throws(()=>parseSystemTheme(JSON.stringify({...base,quick_layout:{direction:'invalid'}})));
});
