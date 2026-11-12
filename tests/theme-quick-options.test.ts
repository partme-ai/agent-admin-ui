import test from 'node:test';
import assert from 'node:assert/strict';
import {theme} from 'antd';
import {defaultSystemTheme,matchSystemTheme,parseSystemTheme,type SystemThemeCustom} from '../src/system_theme.ts';
import {systemThemeConfig} from '../src/antd_theme.ts';
const custom:SystemThemeCustom={name:'我的主题',primary:'#1E5A8F',background:'#F7F8FA',sidebar:'#1E5A8F',sidebar_style:'dark'};

test('先选外观再换颜色或侧栏风格，五个快捷设置继续保留',()=>{
 const original={...custom,appearance:{font_size:16,density:'spacious' as const,border_radius:12,shadow:'soft' as const,colors:{light:{text:'#112233'}}}};
 const after=matchSystemTheme(original,'#22A2C3','light');
 assert.deepEqual(after.appearance,{font_size:16,density:'spacious',border_radius:12,shadow:'soft'});
 assert.equal(original.appearance.colors.light.text,'#112233');
});

test('六组快捷选择只接受预设，修改一组不丢其余字段，恢复只清理快捷覆盖',async()=>{
 const {themeQuickOptions,setThemeQuickOption,resetThemeQuickOptions}=await import('../src/theme_customization.ts');
 let value:SystemThemeCustom={...custom,appearance:{colors:{light:{text:'#112233'}},border_width:2}};
 const before=JSON.stringify(value);
 for(const [key,choice] of [['font_size',16],['density','spacious'],['border_radius',12],['shadow','soft']] as const)value=setThemeQuickOption(value,key,choice);
 assert.equal(value.appearance?.font_size,16);assert.equal(value.appearance?.density,'spacious');assert.equal(value.appearance?.border_radius,12);assert.equal(value.appearance?.shadow,'soft');assert.equal(value.appearance?.border_width,2);
 assert.deepEqual(resetThemeQuickOptions(value).appearance,JSON.parse(before).appearance);
 assert.equal(Object.keys(themeQuickOptions).length,6);assert.throws(()=>setThemeQuickOption(value,'font_size',99));assert.throws(()=>setThemeQuickOption(value,'shadow','url(x)'));
 assert.deepEqual(parseSystemTheme(JSON.stringify({...defaultSystemTheme(),preset_id:'custom',custom:value})).custom,value);
});

test('所有预设落到真实antd Token，密度和字体独立且触控尺寸不缩小',async()=>{
 const {themeQuickOptions,setThemeQuickOption}=await import('../src/theme_customization.ts');
 for(const key of Object.keys(themeQuickOptions) as (keyof typeof themeQuickOptions)[])for(const option of themeQuickOptions[key].options){
  const value=setThemeQuickOption(custom,key,option.value);
  for(const mode of ['light','dark'] as const){
   const config=systemThemeConfig({...defaultSystemTheme(),preset_id:'custom',custom:value},mode,'desktop'),token=theme.getDesignToken(config);
   if(key==='font_size')assert.equal(token.fontSize,option.value);
   if(key==='border_radius')assert.equal(token.borderRadius,option.value);
   if(key==='shadow'&&option.value==='none')assert.equal(token.boxShadowTertiary,'none');
   if(key==='shadow'&&option.value!=='none')assert.notEqual(token.boxShadowTertiary,'none');
   for(const device of ['tablet','mobile'] as const)assert.ok(theme.getDesignToken(systemThemeConfig({...defaultSystemTheme(),preset_id:'custom',custom:value},mode,device)).controlHeight>=40);
  }
 }
});

test('未改字号时切换间距保持当前实际字号，默认档位如实回显',async()=>{
 const {setThemeQuickOption,themeQuickValue}=await import('../src/theme_customization.ts');
 assert.equal(themeQuickValue(custom,'font_size'),12);
 const original=theme.getDesignToken(systemThemeConfig({...defaultSystemTheme(),preset_id:'custom',custom},'light','desktop')).fontSize;
 for(const density of ['compact','comfortable','spacious']){const changed=setThemeQuickOption(custom,'density',density);assert.equal(theme.getDesignToken(systemThemeConfig({...defaultSystemTheme(),preset_id:'custom',custom:changed},'light','desktop')).fontSize,original);}
});


test('侧栏样式移出后快捷恢复不改样式、名称、三种颜色和其他历史外观',async()=>{
 const {resetThemeQuickOptions}=await import('../src/theme_customization.ts');
 const original={...custom,sidebar_style:'light' as const,appearance:{font_family:'serif' as const,font_size:16,border_width:2,colors:{light:{text:'#112233'}}}};
 const before=JSON.stringify(original),restored=resetThemeQuickOptions(original);
 assert.equal(restored.sidebar_style,original.sidebar_style);
 assert.equal(restored.name,original.name);
 for(const key of ['primary','background','sidebar'] as const)assert.equal(restored[key],original[key]);
 assert.deepEqual(restored.appearance,{border_width:2,colors:{light:{text:'#112233'}}});
 assert.equal(JSON.stringify(original),before);
});
