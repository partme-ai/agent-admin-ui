import test from 'node:test';
import assert from 'node:assert/strict';
import {colorFamilies,colorBrightness} from '../src/color_family.ts';
import {defaultSystemTheme,parseSystemTheme,buildSystemTheme,contrastRatio} from '../src/system_theme.ts';

test('每色系30套有来源的精选主题，八字说明与侧栏层级完整',async()=>{
 const mod=await import('../src/system_theme.ts') as Record<string,any>;
 assert.equal(typeof mod.recommendedSystemThemes,'object','缺少按色系提供的300套推荐组合');
 
 const choices=mod.recommendedSystemThemes;
 assert.equal(choices.length,300);
 for(const f of colorFamilies){
  const list=choices.filter((t:any)=>t.color_family===f.id);assert.equal(list.length,30,f.id);
  assert.equal(new Set(list.map((t:any)=>t.name)).size,30);
  const actual=[];
  for(const t of list){
   const v=buildSystemTheme({...defaultSystemTheme(),preset_id:t.id},'light');
   actual.push({...t.palette,primary:v.primary,background:v.bg,sidebar:v.sidebar});
   assert.ok(colorBrightness(v.primary)<=.18+1e-5,t.id+' 主色');assert.ok(colorBrightness(v.bg)>=.8,t.id+' 底色');
   for(const mode of ['light','dark'] as const){const colors=buildSystemTheme({...defaultSystemTheme(),preset_id:t.id},mode);if(t.id!=='jilan'||mode==='light')assert.ok(colorBrightness(colors.sidebar)<colorBrightness(colors.bg),t.id+'/'+mode+' 侧栏层级');for(const [a,b] of [[colors.text,colors.bg],[colors.primaryText,colors.primary],[colors.sidebarInk,colors.sidebar],[colors.sidebarInk,colors.sidebarSelected]])assert.ok(contrastRatio(a,b)>=4.5,t.id+'/'+mode);}
   assert.equal(t.description.replace(/[^\u4e00-\u9fff]/g,'' ).length,8,t.id+' 八字说明');
   assert.ok(t.source?.url,t.id+' 来源');
   assert.ok(colorBrightness(v.sidebar)<colorBrightness(v.bg),t.id+' 侧栏需深于底色');
   assert.equal(parseSystemTheme(JSON.stringify({...defaultSystemTheme(),preset_id:t.id})).preset_id,t.id);
  }
  for(let i=0;i<actual.length;i++)for(let j=i+1;j<actual.length;j++)assert.notDeepEqual([actual[i].primary,actual[i].background,actual[i].sidebar],[actual[j].primary,actual[j].background,actual[j].sidebar]);
 }
 assert.equal(new Set(choices.map((t:any)=>[t.palette.primary,t.palette.background,t.palette.sidebar,t.palette.sidebar_style].join('/'))).size,300);
});

test('随机组合保持深浅规则、同色系和外观设置，不重复当前搭配',async()=>{
 const {randomizeSystemTheme,themeColorTone,filterThemeColorTone}=await import('../src/theme_palette_rules.ts');
 const custom={name:'已有配色',primary:'#1E5A8F',background:'#F1F4F7',sidebar:'#1E5A8F',sidebar_style:'dark' as const,appearance:{font_family:'misans' as const,font_size:16,colors:{light:{text:'#123456'}}}};
 const before=JSON.stringify(custom),r=()=>.37;
 for(const family of colorFamilies){let current=custom;const results=new Set();for(let i=0;i<12;i++){const next=randomizeSystemTheme(current,family.id,()=>((i*7+3)%13)/13);assert.ok(colorBrightness(next.primary)<=.18);assert.ok(colorBrightness(next.background)>=.8);assert.notDeepEqual([current.primary,current.background,current.sidebar],[next.primary,next.background,next.sidebar]);assert.ok(colorBrightness(next.sidebar)<colorBrightness(next.background));assert.equal(next.name,custom.name);assert.equal(next.palette_family,family.id);assert.deepEqual(parseSystemTheme(JSON.stringify({...defaultSystemTheme(),preset_id:'custom',custom:next})).custom,next);assert.deepEqual(next.appearance,custom.appearance);results.add([next.primary,next.background,next.sidebar].join('/'));current=next;}assert.ok(results.size>=10);}
 assert.deepEqual(randomizeSystemTheme(custom,'blue',r),randomizeSystemTheme(custom,'blue',r));assert.equal(JSON.stringify(custom),before);
 assert.equal(themeColorTone('#ffffff'),'light');assert.equal(themeColorTone('#000000'),'dark');
 const colors=[{hex:'#ffffff'},{hex:'#000000'},{hex:'#8899aa'}];assert.equal(filterThemeColorTone(colors,'all').length,3);assert.equal(filterThemeColorTone(colors,'dark').length+filterThemeColorTone(colors,'light').length,3);
});

test('1.75已保存的299套旧配方保留原色值和版本，不被新目录覆盖',async()=>{
 const {readFileSync}=await import('node:fs');
 const {systemThemes}=await import('../src/system_theme.ts');
 const old=JSON.parse(readFileSync(new URL('../src/vendor/theme_combinations_legacy_v175.json',import.meta.url),'utf8'));
 for(const item of old.filter((t:any)=>t.id!=='jilan')){const actual=systemThemes.find(t=>t.id===item.id)!;assert.ok(actual);for(const key of ['primary','background','sidebar','sidebar_style','palette_version'] as const)assert.equal(actual.palette![key],item.palette[key]);}
});

test('精选主题的来源四色可回溯到采集记录，说明为八字且三色配方不克隆',async()=>{
 const {readFileSync}=await import('node:fs');const {recommendedSystemThemes}=await import('../src/system_theme.ts');
 const refs=JSON.parse(readFileSync(new URL('../src/vendor/theme_reference_categories.json',import.meta.url),'utf8'));const popular=JSON.parse(readFileSync(new URL('../src/vendor/theme_reference_popular.json',import.meta.url),'utf8'));
 const sources=[...popular,...Object.values(refs).flat()] as any[];
 for(const theme of recommendedSystemThemes.filter(t=>t.id!=='jilan')){const source=theme.source!;const match=sources.find(x=>source.url.endsWith(x.code));assert.ok(match,theme.id);assert.deepEqual(source.colors,match.colors);assert.equal(source.likes,Number(match.likes.replaceAll(',','')));assert.equal(theme.palette?.palette_version,3);}
});
