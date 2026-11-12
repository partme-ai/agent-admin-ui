import test from 'node:test';
import assert from 'node:assert/strict';
import {VoicePreviewPlayer} from '../src/voice_preview.ts';
import type {PreviewAudio} from '../src/voice_preview.ts';

function setup(){
 const clips:Array<PreviewAudio&{paused:boolean;released:boolean;fail:()=>void}>=[];
 const player=new VoicePreviewPlayer(()=>{
  let reject:()=>void=()=>{};
  const clip={paused:false,released:false,onended:null,onerror:null,onplaying:null,
   play:()=>new Promise<void>((_,failure)=>{reject=()=>failure(new Error('decode'));}),
   pause(){this.paused=true;},removeAttribute(){this.released=true;},load(){},remove(){},fail:()=>reject()};
  clips.push(clip);return clip;
 });
 return {player,clips};
}
test('播放另一个样本会释放上一段；迟到的错误和结束事件不能停止新样本',async()=>{
 const {player,clips}=setup();player.toggle('a','a.mp3');
 const oldEnded=clips[0].onended,oldPlaying=clips[0].onplaying;
 player.toggle('b','b.mp3');
 assert.equal(clips[0].paused,true);assert.equal(clips[0].released,true);
 oldEnded?.call(clips[0] as HTMLMediaElement,new Event('ended'));
 oldPlaying?.call(clips[0] as HTMLMediaElement,new Event('playing'));
 clips[0].fail();await Promise.resolve();
 assert.deepEqual(player.getSnapshot(),{key:'b',status:'loading'});
 clips[1].onplaying?.call(clips[1] as HTMLMediaElement,new Event('playing'));
 assert.equal(player.getSnapshot().status,'playing');
 player.toggle('b','b.mp3');assert.equal(player.getSnapshot().status,'idle');assert.equal(clips[1].released,true);
});
test('加载中停止、自然结束和播放失败都释放媒体，停止后失败不弹旧错误',async()=>{
 const {player,clips}=setup();player.toggle('a','a.mp3');player.stop();clips[0].fail();await Promise.resolve();
 assert.equal(player.getSnapshot().status,'idle');
 player.toggle('b','b.mp3');clips[1].onended?.call(clips[1] as HTMLMediaElement,new Event('ended'));
 assert.equal(player.getSnapshot().status,'idle');assert.equal(clips[1].released,true);
 player.toggle('c','c.mp3');clips[2].fail();await Promise.resolve();
 assert.equal(player.getSnapshot().status,'error');assert.equal(clips[2].released,true);
 player.toggle('missing');assert.equal(player.getSnapshot().status,'idle');assert.equal(clips.length,3);
});
test('创建媒体失败能够恢复并在下一次点击重试',()=>{
 const player=new VoicePreviewPlayer(()=>{throw new Error('unavailable');});
 assert.doesNotThrow(()=>player.toggle('a','a.mp3'));assert.equal(player.getSnapshot().status,'error');
 player.stop();assert.equal(player.getSnapshot().status,'idle');
});
