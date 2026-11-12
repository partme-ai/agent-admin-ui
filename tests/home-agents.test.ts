import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStore} from '../src/state.ts';
import {homeAgentCards,homeGridColumns} from '../src/home_agents.ts';

test('首页补齐六项，保留已有智能体顺序，模板不重复且不写入配置',()=>{
 const agents=initialStore().agents,before=structuredClone(agents),cards=homeAgentCards(agents);
 assert.equal(cards.length,6);
 assert.deepEqual(cards.filter(x=>x.kind==='agent').map(x=>x.agent.id),agents.map(x=>x.id));
 const names=cards.map(x=>(x.kind==='agent'?x.agent.name:x.template.name).split(' · ')[0]);
 assert.equal(new Set(names).size,6);
 assert.deepEqual(agents,before);
 assert.ok(cards.filter(x=>x.kind==='template').every(x=>x.template.id));
});
test('无智能体时展示六个模板，超过六个时只展示已有智能体',()=>{
 assert.equal(homeAgentCards([]).filter(x=>x.kind==='template').length,6);
 const a=initialStore().agents[0],agents=Array.from({length:8},(_,i)=>({...a,id:`a${i}`,name:`角色${i}`}));
 const cards=homeAgentCards(agents);
 assert.equal(cards.length,6);assert.ok(cards.every(x=>x.kind==='agent'));
 assert.deepEqual(cards.map(x=>x.kind==='agent'&&x.agent.id),agents.slice(0,6).map(x=>x.id));
});
test('首页按两行容量补位，宽屏十二项无重复且原有智能体不被覆盖',()=>{
 const agents=initialStore().agents,before=structuredClone(agents);
 const cards=homeAgentCards(agents,12);
 assert.equal(cards.length,12);
 assert.equal(new Set(cards.map(x=>(x.kind==='agent'?x.agent.name:x.template.name).split(' · ')[0])).size,12);
 assert.deepEqual(agents,before);
});

test('实际容器宽度决定两行容量，窄屏和超宽屏都不会留下第三行',()=>{
 const agents=initialStore().agents,available=homeAgentCards(agents,Infinity).length;
 for(const [width,columns] of [[343,1],[639,2],[745,3],[1018,4],[1640,6],[2200,9]]){
  assert.equal(homeGridColumns(width,available),columns);
  assert.equal(homeAgentCards(agents,columns*2).length,columns*2);
 }
 assert.equal(homeGridColumns(5000,available),Math.floor(available/2));
 assert.equal(homeAgentCards(agents,0).length,0);
});
