const characterPresetKey='tinybot.character-presets.v1';
import test from 'node:test';
import assert from 'node:assert/strict';
import {theme} from 'antd';
import {defaultSystemTheme,parseSystemTheme,writeSystemTheme,systemThemeKey,type SystemThemeCustom} from '../src/system_theme.ts';
import {systemThemeConfig,resolveThemeColors,navigationThemeConfig,themeVariablesFromToken} from '../src/antd_theme.ts';
import {patchThemeColor,resetThemeGroup,defaultThemeCustom} from '../src/theme_customization.ts';

const custom:SystemThemeCustom={name:'高级主题',primary:'#1E5A8F',background:'#F7F8FA',sidebar:'#1E5A8F',sidebar_style:'dark' as const};
const settings=(appearance:Record<string,unknown>)=>({...defaultSystemTheme(),preset_id:'custom',custom:{...custom,appearance}});

test('旧主题无损读取，高级设置只保留安全字段并往返',()=>{
 const old={...defaultSystemTheme(),preset_id:'custom',custom};assert.deepEqual(parseSystemTheme(JSON.stringify(old)),old);
 const x=settings({font_size:16,line_height:1.7,border_width:2,border_style:'dashed',border_radius:14,shadow:'strong',density:'spacious',colors:{light:{text:'#273044',heading:'#171F33',secondary:'#556070',border:'#778899'},dark:{text:'#E8EDF4'}}});
 assert.deepEqual(parseSystemTheme(JSON.stringify(x)),x);
 for(const bad of [{font_size:40},{line_height:0},{border_width:-1},{border_radius:99},{shadow:'url(http://bad)'},{density:'unknown'},{border_style:'double'},{colors:{light:{text:'url(x)'}}},{colors:{dark:[]}}])assert.throws(()=>parseSystemTheme(JSON.stringify(settings(bad))));
});

test('文字与边框按模式修改，其他模式与原对象不受影响，各组重置保留其他定制',()=>{
 const a=patchThemeColor(custom,'text','#334455','light');
 const b=patchThemeColor(a,'text','#DDEEFF','dark');
 assert.equal(a.appearance?.colors?.light?.text,'#334455');assert.equal(a.appearance?.colors?.dark,undefined);
 assert.equal(b.appearance?.colors?.dark?.text,'#DDEEFF');assert.equal(custom.appearance,undefined);
 const parsed=parseSystemTheme(JSON.stringify(settings({...b.appearance,font_size:16,border_radius:14,shadow:'soft'}))).custom!;
 const reset=resetThemeGroup(parsed,'text','light');
 assert.equal(reset.appearance?.font_size,undefined);assert.equal(reset.appearance?.colors?.light?.text,undefined);
 assert.equal(reset.appearance?.colors?.dark?.text,'#DDEEFF');assert.equal(reset.appearance?.border_radius,14);
 assert.equal(defaultThemeCustom('保留名字').name,'保留名字');
});

test('高级字号、行高、边框、圆角、阴影和密度贯通实际Token及导航，触控高度保底',()=>{
 const s=parseSystemTheme(JSON.stringify(settings({font_size:16,line_height:1.8,border_width:2,border_style:'dashed',border_radius:14,shadow:'strong',density:'spacious',colors:{light:{text:'#273044',heading:'#171F33',secondary:'#556070',border:'#778899'}}})));
 const cfg=systemThemeConfig(s,'light','desktop'),t=theme.getDesignToken(cfg);
 assert.equal(t.fontSize,16);assert.equal(t.lineHeight,1.8);assert.equal(t.colorText,'#273044');assert.equal(t.colorTextHeading,'#171F33');assert.equal(t.colorBorder,'#778899');
 assert.equal(t.lineWidth,2);assert.equal(t.lineType,'dashed');assert.equal(t.borderRadius,14);assert.notEqual(t.boxShadow,'none');assert.equal(t.controlHeight,36);
 const c=resolveThemeColors(s,'light','desktop'),v=themeVariablesFromToken(t,c);assert.equal(v['--console-radius'],t.borderRadius+'px');assert.equal(v['--console-card-shadow'],t.boxShadowTertiary);
 assert.equal(navigationThemeConfig(c,'light','desktop','sidebar',s.custom?.appearance).components?.Menu?.itemHeight,42);
 for(const density of ['compact','comfortable','spacious'])for(const device of ['tablet','mobile'] as const){const x=theme.getDesignToken(systemThemeConfig(parseSystemTheme(JSON.stringify(settings({density}))), 'light',device));assert.ok(x.controlHeight>=40);}
});

test('高级主题保存只访问主题键，不改变已经保存的机器人形象字节',()=>{
 const original='[{"id":"mine","config":{"color":"traditional742-695","expression":33}}]',map=new Map([[characterPresetKey,original]]);
 const storage={getItem:(k:string)=>map.get(k)||null,setItem:(k:string,v:string)=>{assert.equal(k,systemThemeKey);map.set(k,v);}};
 writeSystemTheme(storage,parseSystemTheme(JSON.stringify(settings({font_size:16,border_radius:0,shadow:'none',density:'comfortable'}))));
 assert.equal(map.get(characterPresetKey),original);
});

test('连续编辑并切换浅深模式不会创建无限算法实例或使主题缓存失效',()=>{
 const algorithms=new Set<unknown>();
 for(let i=0;i<120;i++){
  const s=parseSystemTheme(JSON.stringify(settings({font_size:12+i%7,density:i%2?'spacious':'compact',border_radius:i%17})));
  const config=systemThemeConfig(s,i%2?'dark':'light','desktop');
  algorithms.add((config.algorithm as unknown[]).at(-1));
  const t=theme.getDesignToken(config);
  assert.equal(t.fontSize,12+i%7);
 }
 assert.ok(algorithms.size<=4,'重复编辑不应为每次输入创建新的算法身份');
});

test('无边框与直角仍保留键盘焦点描边',()=>{
 const t=theme.getDesignToken(systemThemeConfig(parseSystemTheme(JSON.stringify(settings({border_width:0,border_radius:0,shadow:'none'}))),'light','desktop'));
 assert.equal(t.lineWidth,0);assert.equal(t.borderRadius,0);assert.equal(t.boxShadow,'none');assert.ok(t.lineWidthFocus>=2);assert.ok(t.controlOutlineWidth>=2);
});
