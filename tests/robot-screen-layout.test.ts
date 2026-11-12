import test from 'node:test';
import assert from 'node:assert/strict';
import {trialDeviceProfiles} from '../src/robot_trial.ts';

test('真实像素画布的表情与字幕分区不重叠，字幕字号可读且不超出边界',async()=>{
 const {robotScreenLayout}=await import('../src/robot_screen_layout.ts');
 for(const profile of trialDeviceProfiles){const layout=robotScreenLayout(profile),f=layout.face,c=layout.caption;
  assert.equal(layout.width,profile.width);assert.equal(layout.height,profile.height);assert.ok(layout.fontSize>=14);
  for(const box of [f,c]){assert.ok(box.x>=0&&box.y>=0);assert.ok(box.x+box.width<=profile.width);assert.ok(box.y+box.height<=profile.height);}
  assert.ok(f.x+f.width<=c.x||f.y+f.height<=c.y);assert.equal(c.height,layout.lineHeight*layout.lines);
 }
});

test('圆屏字幕四角均处于圆形安全区；240方屏保持原尺寸，横向触控屏单独分栏',async()=>{
 const {robotScreenLayout}=await import('../src/robot_screen_layout.ts');const round=robotScreenLayout(trialDeviceProfiles[1]);
 for(const x of [round.caption.x,round.caption.x+round.caption.width])for(const y of [round.caption.y,round.caption.y+round.caption.height])assert.ok(Math.hypot(x-120,y-120)<120);
 const square=robotScreenLayout(trialDeviceProfiles[0]);assert.equal(square.previewWidth,240);assert.equal(square.lines,3);
 const wide=robotScreenLayout(trialDeviceProfiles[3]);assert.ok(wide.caption.x>=wide.face.x+wide.face.width);
});
