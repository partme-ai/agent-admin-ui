import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStore} from '../src/state.ts';
import {roleMarketTemplates,createMarketRole} from '../src/role_market.ts';
import {defaultRoleProfile} from '../src/role_profile.ts';

test('默认智能体覆盖不同业务，模型、知识、资料与对话关联完整',()=>{
 const store=initialStore();
 const names=store.agents.map(agent=>agent.name);
 for(const domain of ['客服','运营','销售','人事'])assert.ok(names.some(name=>name.includes(domain)),`${domain}业务缺失`);
 assert.equal(new Set(names).size,names.length);
 for(const agent of store.agents){
  assert.ok(store.connections.some(model=>model.id===agent.model));
  assert.ok(agent.knowledge.every(id=>store.knowledge.some(kb=>kb.id===id)));
 }
 for(const kb of store.knowledge)assert.equal(kb.count,store.docs.filter(doc=>doc.knowledge===kb.id).length);
 for(const conversation of store.conversations)assert.ok(store.agents.some(agent=>agent.id===conversation.agent));
 for(const mission of store.missions)assert.ok(store.agents.some(agent=>agent.id===mission.agent));
 assert.ok(store.docs.some(doc=>doc.id==='d1'&&doc.text.includes('客服')));
});

test('市场预设覆盖业务场景，创建草稿保留知识库关联',()=>{
 const store=initialStore();
 assert.equal(defaultRoleProfile().identity,'业务智能体');
 const categories=new Set(roleMarketTemplates.map(template=>template.category));
 for(const category of ['客户服务','运营管理','销售支持','人力资源'])assert.ok(categories.has(category));
 assert.ok(roleMarketTemplates.every(template=>!/(生活伙伴|故事伙伴|学习伙伴|植物伙伴)/.test(template.name)));
 for(const template of roleMarketTemplates){
  assert.ok(template.knowledge.every(id=>store.knowledge.some(kb=>kb.id===id)));
  assert.deepEqual(createMarketRole(template,store.connections).knowledge,template.knowledge);
 }
});
