import test from 'node:test';import assert from 'node:assert/strict';
import {emotions,excludedEmotions,defaultEmotionSet,cloneEmotionSet,parseEmotionSet,readEmotionSets,writeEmotionSets,emotionStorageKey} from '../src/emotion_sets.ts';
import {emotionEyes} from '../src/emotion_style.ts';
import {sceneSvg} from '../src/character_scene.ts';
import {parseCharacter} from '../src/character_config.ts';
test('情绪清单152项全部有中文和有效绘制配方，明确排除20项动作与身份',()=>{
 assert.equal(emotions.length,152);assert.equal(excludedEmotions.length,20);assert.equal(new Set(emotions.map(e=>e.id)).size,152);
 for(const e of emotions){assert.ok(e.name);const style=defaultEmotionSet.recipes[e.id];assert.ok(style,e.id);for(const ring of emotionEyes(style)){assert.equal(ring.length,48);assert.ok(ring.flat().every(Number.isFinite));}const svg=sceneSvg({...defaultEmotionSet.character,emotion:style},1);assert.ok(!/NaN|undefined|<script/.test(svg));}
 assert.ok(!emotions.some(e=>['🤖','🙂‍↔️','🫡'].includes(e.emoji)));
});
test('默认不可变，复制隔离，套装完整JSON往返且拒绝未知、缺项和恶意配置',()=>{
 const copy=cloneEmotionSet(defaultEmotionSet,'test');copy.name='绿色陪伴';copy.recipes[emotions[0].id].intensity=.3;
 assert.notEqual(defaultEmotionSet.recipes[emotions[0].id].intensity,.3);assert.deepEqual(parseEmotionSet(JSON.stringify(copy)),copy);
 for(const data of [{...copy,version:99},{...copy,script:'x'},{...copy,recipes:{}},{...copy,character:{...copy.character,color:'url(javascript:x)'}}])assert.throws(()=>parseEmotionSet(JSON.stringify(data)));
 assert.deepEqual(parseCharacter(JSON.stringify({...copy.character,emotion:copy.recipes[emotions[0].id]})).emotion,copy.recipes[emotions[0].id]);
});
test('本机存储隔离、保存恢复、删除和损坏数据保护',()=>{
 const map=new Map([['models','keep']]);const storage={getItem:(k:string)=>map.get(k)||null,setItem:(k:string,v:string)=>{map.set(k,v);}};
 const copy=cloneEmotionSet(defaultEmotionSet,'test');writeEmotionSets(storage,[copy]);assert.equal(readEmotionSets(storage)[0].id,'test');assert.equal(map.get('models'),'keep');
 assert.throws(()=>writeEmotionSets(storage,[defaultEmotionSet]));writeEmotionSets(storage,[]);assert.deepEqual(readEmotionSets(storage),[]);
 map.set(emotionStorageKey,'broken');assert.throws(()=>readEmotionSets(storage));assert.throws(()=>writeEmotionSets(storage,[copy]));assert.equal(map.get(emotionStorageKey),'broken');
});

test('角色快照完整往返，运行状态接管，语义情绪使用已选套装且不混入动作',async()=>{
 const {emotionCharacter,trialEmotionCharacter}=await import('../src/emotion_sets.ts');
 const entry=emotions.find(e=>e.emoji==='😢')!,set=cloneEmotionSet(defaultEmotionSet,'test');set.recipes[entry.id].accent='#123456';
 const c=emotionCharacter(set,emotions[0].id);assert.deepEqual(parseCharacter(JSON.stringify(c)),c);
 assert.equal(trialEmotionCharacter(c,'listening','sad',[set]).emotion,undefined);
 assert.equal(trialEmotionCharacter(c,'thinking','sad',[set]).emotion,undefined);
 assert.equal(trialEmotionCharacter(c,'speaking','sad',[set]).emotion?.accent,'#123456');
 assert.deepEqual(trialEmotionCharacter(c,'idle','sad',[set]).emotion,c.emotion);
 const follow={...c,emotion:undefined,emotion_id:undefined};assert.equal(trialEmotionCharacter(follow,'speaking','sad',[set]).emotion?.accent,'#123456');
 assert.equal(defaultEmotionSet.recipes[entry.id].accent,'#ef86a2');
});
