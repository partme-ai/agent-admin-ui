const characterPresetKey='tinybot.character-presets.v1';
import test from 'node:test';
import assert from 'node:assert/strict';
import {theme} from 'antd';
import {themeQuickOptions,parseThemeAppearance,setThemeQuickOption,resetThemeQuickOptions,defaultThemeCustom} from '../src/theme_customization.ts';
import {defaultSystemTheme,parseSystemTheme,matchSystemTheme} from '../src/system_theme.ts';
import {systemThemeConfig,themeVariablesFromToken,resolveThemeColors} from '../src/antd_theme.ts';
import {themeFontOptions} from '../src/theme_fonts.ts';
import {writeSystemTheme,readSystemTheme,systemThemeKey} from '../src/system_theme.ts';

test('字号和字体分开，字体选择经解析、保存格式和换色保留',()=>{
 assert.equal(themeQuickOptions.font_size.label,'字号');
 const appearance=parseThemeAppearance({font_family:'serif',font_size:16}) as Record<string,unknown>;
 assert.equal(appearance.font_family,'serif');
 const custom=setThemeQuickOption(defaultThemeCustom(),'font_family','noto_serif');
 const settings=parseSystemTheme(JSON.stringify({...defaultSystemTheme(),preset_id:'custom',custom}));
 assert.deepEqual(settings.custom?.appearance,custom.appearance);
 assert.equal((matchSystemTheme(custom,'#22A2C3').appearance as Record<string,unknown>).font_family,'noto_serif');
 assert.throws(()=>parseThemeAppearance({font_family:'url(https://example.com/font)'}));
 assert.equal(resetThemeQuickOptions(custom).appearance,undefined);
});

test('所有字体与字号独立，保存读回和重置不改已有机器人配置',()=>{
 const robot='[{"id":"mine","config":{"color":"gugong-037"}}]';
 const data=new Map([[characterPresetKey,robot]]),storage={getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>{assert.equal(k,systemThemeKey);data.set(k,v);}};
 for(const option of themeFontOptions){
  const custom=setThemeQuickOption({...defaultThemeCustom(),appearance:{font_size:16}},'font_family',option.value);
  const settings={...defaultSystemTheme(),preset_id:'custom',custom};
  writeSystemTheme(storage,settings);
  const saved=readSystemTheme(storage).settings;
  assert.deepEqual(saved.custom,custom);
  const token=theme.getDesignToken(systemThemeConfig(saved,'light','desktop'));
  assert.equal(token.fontFamily,option.family);assert.equal(token.fontSize,16);
  assert.equal(data.get(characterPresetKey),robot);
 }
});

test('真实antd Token与自有界面字体一致，旧配置映射到网页字体且不改存储',()=>{
 const base=defaultSystemTheme(),before=JSON.stringify(base);
 const initial=theme.getDesignToken(systemThemeConfig(base,'light','desktop')).fontFamily;
 const custom={...defaultThemeCustom(),appearance:{font_family:'serif'}};
 for(const device of ['desktop','tablet','mobile'] as const)for(const mode of ['light','dark'] as const){
  const settings=parseSystemTheme(JSON.stringify({...base,preset_id:'custom',custom}));
  const token=theme.getDesignToken(systemThemeConfig(settings,mode,device));
  assert.notEqual(token.fontFamily,initial);
  assert.match(token.fontFamily,/Noto Serif SC/);
  assert.equal(themeVariablesFromToken(token,resolveThemeColors(settings,mode,device))['--console-font-family'],token.fontFamily);
 }
 assert.equal(JSON.stringify(base),before);
});


test('字体先于字号，免费中文目录包含阿里、小米及多种中文风格',()=>{
 assert.deepEqual(Object.keys(themeQuickOptions).filter(k=>k!=='code_font_family').slice(0,2),['font_family','font_size']);
 assert.ok(themeFontOptions.length>=10);
 for(const id of ['alibaba','misans','noto_sans','noto_serif','wenkai','smiley','zcool_xiaowei','zcool_kuaile','mashan','longcang']){
  const option=themeFontOptions.find(f=>(f.value as string)===id);
  assert.ok(option,`${id}应可选`);
  const parsed=parseThemeAppearance({font_family:id});assert.equal(parsed?.font_family,id);
 }
});


test('可选字体和默认字体均使用网页字库，不包含平台自带字体',async()=>{
 const {themeFontFamily}=await import('../src/theme_fonts.ts');
 const css=await import('node:fs').then(fs=>fs.readFileSync(new URL('../public/fonts/theme-fonts.css',import.meta.url),'utf8'));
 assert.match(themeFontFamily(),/Alibaba PuHuiTi/);
 for(const font of themeFontOptions){
  assert.doesNotMatch(font.family,/PingFang|YaHei|Songti|Kaiti|Menlo|Consolas|Arial|system-ui|-apple-system/);
  assert.ok(css.includes(font.family.split(',')[0]),font.label);
 }
});


test('六个历史字体ID读回映射网页字库，原配置逐字保持',async()=>{
 const {legacyThemeFonts,resolveThemeFontId,themeFontFamily}=await import('../src/theme_fonts.ts');
 const {themeQuickValue}=await import('../src/theme_customization.ts');
 for(const [old,mapped] of Object.entries(legacyThemeFonts)){
  const settings={...defaultSystemTheme(),preset_id:'custom',custom:{...defaultThemeCustom(),appearance:{font_family:old}}};
  const raw=JSON.stringify(settings),data=new Map([[systemThemeKey,raw],[characterPresetKey,'saved robot']]);
  const saved=readSystemTheme({getItem:k=>data.get(k)||null}).settings;
  assert.equal(saved.custom?.appearance?.font_family,old);
  assert.equal(resolveThemeFontId(saved.custom?.appearance?.font_family),mapped);
  assert.equal(themeQuickValue(saved.custom!,'font_family'),mapped);
  assert.equal(theme.getDesignToken(systemThemeConfig(saved,'light','desktop')).fontFamily,themeFontFamily(mapped));
  assert.equal(data.get(systemThemeKey),raw);assert.equal(data.get(characterPresetKey),'saved robot');
 }
});
