import test from 'node:test';
import assert from 'node:assert/strict';
import {initialStore,reviseAgent} from '../src/state.ts';
import {restoreAgentVersion} from '../src/capability.ts';
import {cloneRoleProfile,defaultRoleProfile,effectiveRoleInstructions,roleAbilitySlots,rolePanelPath,validateRoleProfile} from '../src/role_profile.ts';

test('人物配置完整进入发布快照，后续草稿和版本恢复互不污染',()=>{
 const a={...initialStore().agents[0],profile:{...defaultRoleProfile(),identity:'旅行伙伴',skills:['story'],traits:['幽默']}};
 const published=reviseAgent(a,a,true);
 a.profile.traits.push('活泼');a.profile.skills.push('device');
 assert.deepEqual(published.publishedConfig?.profile?.traits,['幽默']);
 const restored=restoreAgentVersion({...published,profile:{...defaultRoleProfile(),identity:'新身份'}},published.versions!.at(-1)!);
 assert.equal(restored.profile?.identity,'旅行伙伴');
 assert.deepEqual(restored.profile?.skills,['story']);
});
test('角色面板有且仅有十项能力，设备入口使用同一个角色标识',()=>{
 assert.deepEqual(roleAbilitySlots.map(x=>x.key),['VAD','ASR','LLM','SLM','VLLM','Intent','Mem','TTS','Lang','Voice']);
 assert.equal(rolePanelPath('a1'),'/w/demo/agents/a1/edit');assert.equal(rolePanelPath('a/b'),'/w/demo/agents/a%2Fb/edit');
});
test('人格预览包含结构化性格与手写约束，设备写入不能关闭审批',()=>{
 const p=cloneRoleProfile();p.identity='家庭伙伴';p.traits=['温和'];
 assert.match(effectiveRoleInstructions('不编造资料',p),/家庭伙伴[\s\S]*温和[\s\S]*不编造资料/);
 assert.match(validateRoleProfile({...p,risk:{...p.risk,allowDeviceWrite:true,requireApproval:false}}),/审批/);
 assert.equal(validateRoleProfile(p),'');
});
test('不同角色的记忆独立，不随复制角色或配置恢复迁移',()=>{
 const s=initialStore();assert.ok(s.roleMemories.a1.length);assert.equal(s.roleMemories.a3.length,0);
 const prior=structuredClone(s.roleMemories.a2);s.roleMemories.a1[0].content='修改';
 assert.deepEqual(s.roleMemories.a2,prior);
 const a=s.agents[0],saved=reviseAgent(a,a,true);restoreAgentVersion(saved,saved.versions![0]);
 assert.deepEqual(s.roleMemories.a2,prior);
});
test('人物图标随配置快照保存和恢复',()=>{
 const a=initialStore().agents[0];const old=reviseAgent(a,a,true);
 const next=reviseAgent({...old,icon:'star'},old,false);
 const restored=restoreAgentVersion(next,old.versions!.at(-1)!);
 assert.equal(restored.icon,a.icon);assert.equal(old.publishedConfig?.icon,a.icon);
});
test('已启用钩子不能指向不存在或已停用的技能和命令',()=>{
 const p=defaultRoleProfile();p.skills=[];p.hooks=[{id:'h1',event:'会话开始',action:'skill:knowledge',enabled:true}];
 assert.match(validateRoleProfile(p),/钩子目标/);
 p.hooks[0].enabled=false;assert.equal(validateRoleProfile(p),'');
 p.commands=[{id:'c1',name:'/问好',instruction:'问好',enabled:false}];p.hooks=[{id:'h1',event:'会话开始',action:'command:c1',enabled:true}];
 assert.match(validateRoleProfile(p),/钩子目标/);p.commands[0].enabled=true;assert.equal(validateRoleProfile(p),'');
});
