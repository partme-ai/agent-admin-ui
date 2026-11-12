import test from 'node:test';
import assert from 'node:assert/strict';
import {demoSharedDirectory,demoSpaceInvites,extractSpaceInvite,lookupSpaceInvite,searchSharedSpaces,previewOpenSpace,joinSharedSpace} from '../src/shared_space_join.ts';
const now='2026-11-12T10:00:00Z';
test('邀请码与邀请链接只提取码，不发请求；格式、失效及撤销分别反馈',()=>{
 assert.equal(extractSpaceInvite(' tbdemo01 '),'TBDEMO01');
 assert.equal(extractSpaceInvite('https://example.com/join?invite=TBDEMO01'),'TBDEMO01');
 assert.equal(extractSpaceInvite('https://example.com/#/join?code=TBDEMO01'),'TBDEMO01');
 assert.throws(()=>extractSpaceInvite('javascript:alert(1)'),/格式/);
 const directory=demoSharedDirectory();
 assert.equal(lookupSpaceInvite('TBDEMO01',directory,demoSpaceInvites,now).role,'viewer');
 assert.throws(()=>lookupSpaceInvite('UNKNOWN1',directory,demoSpaceInvites,now),/不存在/);
 assert.throws(()=>lookupSpaceInvite('TBOLD003',directory,demoSpaceInvites,now),/过期/);
 assert.throws(()=>lookupSpaceInvite('TBSTOP04',directory,demoSpaceInvites,now),/撤销/);
});
test('搜索只显示允许发现的空间，邀请空间不能绕过邀请码直接加入',()=>{
 const directory=demoSharedDirectory();
 assert.deepEqual(searchSharedSpaces('',directory),[]);
 assert.equal(searchSharedSpaces('产品',directory).length,1);
 assert.equal(searchSharedSpaces('内部',directory).length,0);
 assert.throws(()=>previewOpenSpace('demo-product',directory),/邀请码/);
 assert.equal(previewOpenSpace('demo-robot',directory).role,'viewer');
});
test('先预览后加入，角色由邀请确定；重复确认幂等且原数组不变',()=>{
 const directory=demoSharedDirectory(),before=JSON.stringify(directory),preview=lookupSpaceInvite('TBDEMO01',directory,demoSpaceInvites,now);
 assert.equal(preview.space.members.some(m=>m.userId==='u1'),false);
 const joined=joinSharedSpace([],{spaceId:preview.space.id,code:'TBDEMO01'},directory,demoSpaceInvites,'u1',now);
 assert.equal(joined.members.find(m=>m.userId==='u1')?.role,'viewer');
 assert.equal(joined.members.filter(m=>m.userId==='u1').length,1);
 assert.equal(joinSharedSpace([joined],{spaceId:joined.id,code:'TBDEMO01'},directory,demoSpaceInvites,'u1',now),joined);
 assert.equal(JSON.stringify(directory),before);
 const editor=joinSharedSpace([],{spaceId:'demo-internal',code:'TBEDIT02'},directory,demoSpaceInvites,'u1',now);
 assert.equal(editor.members.find(m=>m.userId==='u1')?.role,'editor');
});
test('确认时重新核对邀请状态，取消或过期不产生成员或资源',()=>{
 const directory=demoSharedDirectory(),preview=lookupSpaceInvite('TBDEMO01',directory,demoSpaceInvites,now);
 const revoked=demoSpaceInvites.map(i=>({...i,revoked:true}));
 assert.throws(()=>joinSharedSpace([],{spaceId:preview.space.id,code:'TBDEMO01'},directory,revoked,'u1',now),/撤销/);
 assert.throws(()=>joinSharedSpace([],{spaceId:'demo-internal',code:'TBDEMO01'},directory,demoSpaceInvites,'u1',now),/不匹配/);
 const joined=joinSharedSpace([],{spaceId:'demo-robot'},directory,demoSpaceInvites,'u1',now);
 assert.deepEqual(joined.knowledgeIds,[]);assert.deepEqual(joined.agentIds,[]);
});
