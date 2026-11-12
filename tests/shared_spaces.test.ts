import test from 'node:test';
import assert from 'node:assert/strict';
import {createSharedSpace,updateSharedSpace,spacePermissions,defaultSpaceDraft} from '../src/shared_spaces.ts';
import {shellTarget,shellSelection} from '../src/shell_layout.ts';

test('共享空间三入口保持独立，创建者成为管理员',()=>{
 assert.equal(shellTarget('knowledge/market')?.label,'公共知识库');
 assert.equal(shellTarget('knowledge/shared')?.page,'53');
 assert.equal(shellSelection('53','','knowledge'),'knowledge/shared');
 const draft={...defaultSpaceDraft(),name:'  家庭知识  ',description:'一起维护'};
 const space=createSharedSpace([],draft,'u1','space1','2026-11-12');
 assert.equal(space.name,'家庭知识');assert.equal(space.members[0].role,'admin');
 assert.equal(space.members[0].userId,'u1');assert.deepEqual(space.knowledgeIds,[]);assert.deepEqual(space.agentIds,[]);
});
test('更新只改基本信息，不覆盖成员、资源与创建记录；编辑和只读不能修改设置',()=>{
 const original={...createSharedSpace([],{...defaultSpaceDraft(),name:'旧名称'},'u1','s1','old'),knowledgeIds:['k1'],agentIds:['a1'],members:[{userId:'u1',role:'admin' as const},{userId:'u2',role:'editor' as const},{userId:'u3',role:'viewer' as const}]};
 const before=JSON.stringify(original),next=updateSharedSpace([original],'s1',{...defaultSpaceDraft(),name:'新名称',description:'新说明'},'u1','new');
 assert.deepEqual(next.knowledgeIds,['k1']);assert.deepEqual(next.agentIds,['a1']);assert.deepEqual(next.members,original.members);
 assert.equal(next.createdAt,'old');assert.equal(next.updatedAt,'new');assert.equal(JSON.stringify(original),before);
 for(const user of ['u2','u3','unknown'])assert.throws(()=>updateSharedSpace([original],'s1',defaultSpaceDraft(),user,'new'),/管理员/);
});
test('空白、超长、重复名称及非法头像被拦截，原空间不变',()=>{
 const base=defaultSpaceDraft(),existing=createSharedSpace([],{...base,name:'已有空间'},'u1','s1','old');
 for(const patch of [{name:' '},{name:'中'.repeat(51)},{name:'已有空间'},{name:'正常',description:'中'.repeat(501)},{name:'正常',avatarColor:'url(bad)'},{name:'正常',avatarIcon:'invalid'}])assert.throws(()=>createSharedSpace([existing],{...base,...patch},'u1','s2','new'));
 assert.doesNotThrow(()=>updateSharedSpace([existing],'s1',{...base,name:'已有空间'},'u1','new'));
 assert.throws(()=>updateSharedSpace([],'missing',{...base,name:'正常'},'u1','new'),/不存在/);
});
test('权限说明区分管理员、编辑、只读，管理空间仅管理员',()=>{
 assert.deepEqual(spacePermissions.map(p=>p.allowed),[['admin','editor','viewer'],['admin','editor'],['admin','editor','viewer'],['admin','editor'],['admin']]);
});
