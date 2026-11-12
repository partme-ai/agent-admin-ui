import test from 'node:test';
import assert from 'node:assert/strict';
import {systemThemes,defaultSystemTheme,buildSystemTheme,resolveSystemMode,contrastRatio,parseSystemTheme,readSystemTheme,writeSystemTheme,systemThemeKey} from '../src/system_theme.ts';
import {characterPresetKey,saveCharacterPreset,readCharacterPresets} from '../src/character_presets.ts';
import {defaultCharacter} from '../src/character_config.ts';
import {sceneSvg} from '../src/character_scene.ts';

test('300套精选组合和329个旧ID，霁蓝排首位；两种模式正文、导航和按钮均可读',()=>{
 assert.equal(systemThemes.length,659);
 assert.equal(systemThemes[0].id,'jilan');
 assert.equal(new Set(systemThemes.map(t=>t.id)).size,659);
 for(const t of systemThemes)for(const mode of ['light','dark'] as const){
  const v=buildSystemTheme({...defaultSystemTheme(),preset_id:t.id},mode);
  for(const [fg,bg] of [[v.text,v.surface],[v.text,v.bg],[v.muted,v.bg],[v.sidebarInk,v.sidebar],[v.primaryText,v.primary]])assert.ok(contrastRatio(fg,bg)>=4.5,`${t.name}/${mode}: ${fg} on ${bg}`);
 }
 for(const t of systemThemes.filter(t=>t.id!=='default'))for(const mode of ['light','dark'] as const){
  const v=buildSystemTheme({...defaultSystemTheme(),preset_id:t.id},mode);
  for(const [fg,bg] of [[v.primary,v.surface],[v.primary,v.bg],[v.sidebarSelectedInk||v.sidebarInk,v.sidebarSelected],[v.muted,v.surface2]])assert.ok(contrastRatio(fg,bg)>=4.5,`${t.id}/${mode} 交互状态对比度`);
 }
 const v=buildSystemTheme({...defaultSystemTheme(),preset_id:'default'},'light');assert.equal(v.sidebar,'#edf3ef');assert.equal(v.bg,'#f7f8fa');assert.equal(v.primary,'#3563f4');
});

test('跟随系统响应系统明暗，显式模式保持稳定',()=>{
 assert.equal(resolveSystemMode('system',true),'dark');assert.equal(resolveSystemMode('system',false),'light');
 assert.equal(resolveSystemMode('light',true),'light');assert.equal(resolveSystemMode('dark',false),'dark');
});

test('配置校验仅接受已知风格、模式和安全HEX，空白名称及恶意输入不能写入',()=>{
 const c={...defaultSystemTheme(),preset_id:'custom',custom:{name:'我的霁蓝',primary:'#1E5A8F',background:'#F8F5EE',sidebar:'#EDF3EF',sidebar_style:'tinted'}};
 assert.deepEqual(parseSystemTheme(JSON.stringify(c)),c);
 for(const patch of [{preset_id:'unknown'},{mode:'auto'},{schema_version:99},{custom:{...c.custom,primary:'url(https://bad)'}},{custom:{...c.custom,name:'  '}},{custom:{...c.custom,sidebar_style:'script'}}])assert.throws(()=>parseSystemTheme(JSON.stringify({...c,...patch})));
 assert.throws(()=>parseSystemTheme('null'));assert.throws(()=>parseSystemTheme('{}'));assert.throws(()=>parseSystemTheme(' '.repeat(20000)));
});

test('主题保存读回只访问独立键，不读取、覆盖或清除机器人形象；损坏数据保留',()=>{
 const robot='[{"id":"mine","config":{"color":"traditional742-742","expression":33}}]',map=new Map([[characterPresetKey,robot]]),access:string[]=[];
 const storage={getItem:(k:string)=>{access.push(k);return map.get(k)||null;},setItem:(k:string,v:string)=>{access.push(k);map.set(k,v);}};
 assert.equal(readSystemTheme(storage).settings.preset_id,'jilan');
 const s={...defaultSystemTheme(),preset_id:'jilan',mode:'system' as const};writeSystemTheme(storage,s);assert.deepEqual(readSystemTheme(storage).settings,s);
 assert.equal(map.get(characterPresetKey),robot);assert.ok(access.every(k=>k===systemThemeKey));
 map.set(systemThemeKey,'broken');assert.ok(readSystemTheme(storage).error);assert.equal(map.get(systemThemeKey),'broken');
 assert.throws(()=>writeSystemTheme({getItem:()=>null,setItem:()=>{throw Error('quota');}},s));
});

test('极浅、极深自定义主色与背景仍能阅读，序列化往返不丢字段',()=>{
 for(const primary of ['#ffffff','#000000','#EEF7F2','#ff00ff'])for(const background of ['#000000','#ffffff','#ffefee'])for(const mode of ['light','dark'] as const){
  const c={...defaultSystemTheme(),preset_id:'custom',custom:{name:'测试',primary,background,sidebar:'#ddddee',sidebar_style:'dark' as const}};
  const v=buildSystemTheme(parseSystemTheme(JSON.stringify(c)),mode);
  for(const [fg,bg] of [[v.text,v.bg],[v.muted,v.surface],[v.primaryText,v.primary],[v.sidebarInk,v.sidebar]])assert.ok(contrastRatio(fg,bg)>=4.5);
 }
});


test('真实形象配置保存后切换所有主题，JSON字节、颜色ID、表情与绘制结果不变',()=>{
 const map=new Map<string,string>(),storage={getItem:(k:string)=>map.get(k)||null,setItem:(k:string,v:string)=>{map.set(k,v);}};
 const config={...defaultCharacter(),name:'已有的机器人',color:'traditional742-742',expression:33,state:'playful'};
 saveCharacterPreset(storage,{id:'saved-robot',name:config.name,config});
 const original=map.get(characterPresetKey),svg=sceneSvg(config,0,{reduce:true});
 for(const t of systemThemes)for(const mode of ['light','dark','system'] as const)writeSystemTheme(storage,{...defaultSystemTheme(),preset_id:t.id,mode});
 assert.equal(map.get(characterPresetKey),original);
 const restored=readCharacterPresets(storage)[0].config;
 assert.equal(restored.color,'traditional742-742');assert.equal(restored.expression,33);assert.deepEqual(restored,config);assert.equal(sceneSvg(restored,0,{reduce:true}),svg);
});

test('系统默认与空存储回退均为霁蓝，已有主题选择继续原样读取',()=>{
 assert.equal(defaultSystemTheme().preset_id,'jilan');
 assert.equal(readSystemTheme({getItem:()=>null}).settings.preset_id,'jilan');
 const explicitClassic={schema_version:1,preset_id:'default',mode:'dark'},custom={schema_version:1,preset_id:'custom',mode:'system',custom:{name:'我的主题',primary:'#16806A',background:'#F7F8FA',sidebar:'#1E5A8F',sidebar_style:'dark'}};
 for(const saved of [explicitClassic,custom])assert.deepEqual(readSystemTheme({getItem:()=>JSON.stringify(saved)}).settings,saved);
});

test('内置主题覆盖十个色系，每套均可直接预览和保存',async()=>{
 const {systemThemeFamily}=await import('../src/system_theme.ts');
 const {colorFamilies}=await import('../src/color_family.ts');
 assert.equal(systemThemes.length,659);
 assert.deepEqual(new Set(systemThemes.filter(t=>t.id!=='default').map(t=>systemThemeFamily(t.id))),new Set(colorFamilies.map(f=>f.id)));
 for(const t of systemThemes)assert.equal(parseSystemTheme(JSON.stringify({...defaultSystemTheme(),preset_id:t.id})).preset_id,t.id);
});

test('选择一种颜色和成套风格自动生成主题，原有高级配置仅在明确选择后替换',async()=>{
 const {matchSystemTheme}=await import('../src/system_theme.ts');
 const old={name:'我的配色',primary:'#1E5A8F',background:'#F0F4F7',sidebar:'#1E5A8F',sidebar_style:'dark' as const,appearance:{font_size:18,colors:{light:{text:'#112233'}}}},before=JSON.stringify(old);
 for(const primary of ['#ffffff','#000000','#FCD337','#D2357D'])for(const style of ['light','tinted','dark'] as const){
  const custom=matchSystemTheme(old,primary,style);
  assert.equal(custom.name,old.name);assert.equal(custom.primary,primary);assert.equal(custom.sidebar,primary);assert.equal(custom.sidebar_style,style);assert.deepEqual(custom.appearance,{font_size:18});
  for(const mode of ['light','dark'] as const){const v=buildSystemTheme({...defaultSystemTheme(),preset_id:'custom',custom},mode);assert.ok(contrastRatio(v.text,v.bg)>=4.5);assert.ok(contrastRatio(v.primaryText,v.primary)>=4.5);}
 }
 assert.equal(JSON.stringify(old),before);
});
