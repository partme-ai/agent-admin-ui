import test from 'node:test';import assert from 'node:assert/strict';
import {defaultCharacter,parseCharacter,normalizeCharacter,randomCharacter,characterStates,characterData,stateForTrial} from '../src/character_config.ts';
import {sceneSvg,blendEyes} from '../src/character_scene.ts';
import {readCharacterPresets,saveCharacterPreset,characterPresetKey} from '../src/character_presets.ts';
import {cloneRoleProfile,roleConfigFingerprint} from '../src/role_profile.ts';
import {rgbaToRgb565,zipStore,deviceEstimate} from '../src/character_export.ts';
test('整合上游25双眼48点、39状态、10颜色8外形，索引全部有效',()=>{
 assert.equal(characterData.EXPRESSIONS.length,25);assert.equal(characterStates.length,39);assert.equal(characterData.COLORS.length,10);assert.equal(characterData.SHAPES.length,8);
 for(const eyes of characterData.EXPRESSIONS){assert.equal(eyes.length,2);for(const eye of eyes){assert.equal(eye.length,48);assert.ok(eye.flat().every(Number.isFinite));}}
 for(const pool of Object.values(characterData.POOLS))assert.ok(pool.every(i=>i>=0&&i<25));
});
test('JSON往返、旧数据迁移、无凭据，导入拒绝未知版本和脚本式颜色',()=>{
 const config={...defaultCharacter(),pack:'grok' as const,shape:'cloud',parts:['hands','tail'],accessories:['glasses'],expression:24};
 assert.deepEqual(parseCharacter(JSON.stringify(config)),config);assert.equal(normalizeCharacter(undefined).pack,'grok');
 assert.throws(()=>parseCharacter('{"schema_version":99}'));assert.throws(()=>parseCharacter(JSON.stringify({...config,color:'url(javascript:x)'})));
 assert.throws(()=>parseCharacter(JSON.stringify({...config,expression:999})));assert.throws(()=>parseCharacter(JSON.stringify({...config,token:'secret'})));
 assert.deepEqual(normalizeCharacter({parts:['hands','hands','evil']} as any).parts,['hands']);
});
test('快照仅描述外观，各状态输出有效SVG，不以状态动画驱动设备',()=>{
 for(const state of characterStates){const svg=sceneSvg({...defaultCharacter(),pack:'grok',state:state.id},.25);assert.ok(svg.startsWith('<svg'));assert.ok(!svg.includes('NaN'));assert.ok(!svg.includes('undefined'));assert.ok(!svg.includes('<script'));}
 const a=characterData.EXPRESSIONS[0],b=characterData.EXPRESSIONS[1];assert.deepEqual(blendEyes(a,b,0),a);assert.deepEqual(blendEyes(a,b,1),b);
 assert.equal(stateForTrial('listening'),'listening');assert.equal(stateForTrial('speaking'),'humming');
 assert.notDeepEqual(randomCharacter(()=>.7),defaultCharacter());
});
test('设备帧采用RGB565小端并按alpha混合，容量估算与实际字节相符',()=>{
 assert.deepEqual([...rgbaToRgb565(new Uint8ClampedArray([255,0,0,255,0,255,0,255,0,0,255,255]))],[0,248,224,7,31,0]);
 assert.deepEqual([...rgbaToRgb565(new Uint8ClampedArray([255,255,255,0]))],[196,16]);
 assert.equal(deviceEstimate(240,240,12,1),1382400);assert.equal(deviceEstimate(128,128,1,39),1277952);
});
test('ZIP为无压缩标准容器，拒绝路径穿越',()=>{
 const bytes=zipStore([{name:'manifest.json',data:new TextEncoder().encode('{}')}]);assert.deepEqual([...bytes.slice(0,4)],[80,75,3,4]);assert.deepEqual([...bytes.slice(-22,-18)],[80,75,5,6]);
 assert.throws(()=>zipStore([{name:'../x',data:new Uint8Array()}]));
});

test('预设持久化仅操作独立形象键，重复名称和损坏原数据不会被覆盖',()=>{
 const map=new Map([['models','do-not-touch']]),storage={getItem:(key:string)=>map.get(key)||null,setItem:(key:string,value:string)=>{map.set(key,value);}};
 saveCharacterPreset(storage,{id:'a',name:'绿色伙伴',config:{...defaultCharacter(),pack:'grok'}});assert.equal(readCharacterPresets(storage)[0].name,'绿色伙伴');assert.equal(map.get('models'),'do-not-touch');
 assert.throws(()=>saveCharacterPreset(storage,{id:'b',name:'绿色伙伴',config:defaultCharacter()}));map.set(characterPresetKey,'invalid');assert.throws(()=>saveCharacterPreset(storage,{id:'b',name:'x',config:defaultCharacter()}));assert.equal(map.get(characterPresetKey),'invalid');
});
test('形象配置深拷贝，外观变化使旧角色试聊凭据失效',()=>{
 const p=cloneRoleProfile(),copy=cloneRoleProfile(p);copy.appearance!.parts.push('hands');assert.equal(p.appearance!.parts.length,0);
 const a={name:'角色',profile:p,instructions:'你好',knowledge:[],model:'m',id:'a',desc:'角色',color:'#fff',icon:'robot',published:false,revision:0};
 assert.notEqual(roleConfigFingerprint(a),roleConfigFingerprint({...a,profile:copy}));
});
