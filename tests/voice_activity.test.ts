import test from 'node:test';
import assert from 'node:assert/strict';
import {VoiceActivity} from '../src/voice_activity.ts';
function setup(options={}){const events:any[]=[];const vad=new VoiceActivity(options,e=>events.push(e));return {vad,events,feed:(ms:number,voice=false)=>{for(let i=0;i<ms/20;i++)vad.push(Int16Array.from({length:320},(_,j)=>voice?Math.round(6000*Math.sin(j*.13)):0),16000);}};}
test('纯静音和短噪声不触发轮次',()=>{const f=setup();f.feed(2000);f.feed(40,true);f.feed(1000);assert.equal(f.events.length,0);});
test('持续语音开始，短停顿继续，静音800ms只收句一次并能连续下一轮',()=>{const f=setup();f.feed(300);f.feed(400,true);assert.equal(f.events[0].type,'start');f.feed(400);assert.equal(f.events.length,1);f.feed(300,true);f.feed(800);assert.equal(f.events[1].type,'end');assert.ok(f.events[1].durationMs>=1100);f.feed(2000);assert.equal(f.events.length,2);f.feed(300,true);f.feed(800);assert.equal(f.events.length,4);});
test('使用角色静音设置；reset丢弃未结束的话语和前置缓存',()=>{const f=setup({silenceMs:1200});f.feed(300,true);f.feed(800);assert.equal(f.events.length,1);f.vad.reset();f.feed(1500);assert.equal(f.events.length,1);f.feed(300,true);f.feed(1200);assert.equal(f.events.length,3);});
test('原始PCM分块大小和采样率不改变收句；缓存受单轮上限限制',()=>{const f=setup({maxUtteranceMs:1000});f.feed(2000,true);assert.ok(f.events.some(e=>e.type==='end'&&e.reason==='limit'));assert.ok(f.events.filter(e=>e.type==='end').every(e=>e.audio.length<=16000*1.4));});
test('直流和高频噪声不视为语音',()=>{const f=setup();for(let i=0;i<100;i++)f.vad.push(new Int16Array(320).fill(8000),16000);assert.equal(f.events.length,0);for(let i=0;i<100;i++)f.vad.push(Int16Array.from({length:320},(_,j)=>j%2?12000:-12000),16000);assert.equal(f.events.length,0);});
test('44.1k分块连续输入也能收句，不依赖界面音量',()=>{const f=setup();for(let i=0;i<15;i++)f.vad.push(Int16Array.from({length:882},(_,j)=>Math.round(6000*Math.sin(j*.08))),44100);for(let i=0;i<40;i++)f.vad.push(new Int16Array(882),44100);assert.deepEqual(f.events.map(e=>e.type),['start','end']);});
