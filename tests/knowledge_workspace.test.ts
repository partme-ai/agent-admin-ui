import test from 'node:test';
import assert from 'node:assert/strict';
import {moveDocuments,importFaqJson,removeKnowledge,saveWikiPage,restoreWikiRevision,validateSourceUrl} from '../src/knowledge_workspace.ts';
import {changeSpaceMember,setSpaceResource,leaveSpace} from '../src/space_management.ts';
import {createSharedSpace,defaultSpaceDraft} from '../src/shared_spaces.ts';
const space=()=>createSharedSpace([],{...defaultSpaceDraft(),name:'协作'},'u1','s1','2026-11-12');
test('资料移动保留标识，跨库后索引失效，其他资料不变',()=>{
 const docs=[{id:'d1',knowledge:'k1',name:'a',size:'1B',status:'已索引',text:'原文',chunks:['原文']},{id:'d2',knowledge:'k1',name:'b',size:'1B',status:'已索引',text:'其他'}];
 const moved=moveDocuments(docs,['d1'],'k2','folder');assert.equal(moved[0].id,'d1');assert.equal(moved[0].status,'待索引');assert.equal(moved[0].folder,'folder');assert.equal(moved[1],docs[1]);
});
test('FAQ 导入校验整批数据并排除反例，保留多答案',()=>{
 const docs=importFaqJson(JSON.stringify([{question:'如何绑定',answers:['答一','答二'],negativeQuestions:['反例']}]),'k1',()=> 'f1');assert.equal(docs[0].faq?.answers.length,2);assert.ok(!docs[0].text.includes('反例'));assert.throws(()=>importFaqJson('[{"question":"有问无答"}]','k1',()=> 'f2'));
});
test('删除知识库阻止仍被引用资源，未引用时原子清理资料及共享关联',()=>{
 const base={knowledge:[{id:'k1'}],docs:[{id:'d',knowledge:'k1'}],agents:[{knowledge:['k1']}]};assert.throws(()=>removeKnowledge(base as any,[{...space(),knowledgeIds:['k1']}],'k1'));
 const result=removeKnowledge({...base,agents:[]} as any,[{...space(),knowledgeIds:['k1']}],'k1');assert.equal(result.store.docs.length,0);assert.deepEqual(result.spaces[0].knowledgeIds,[]);
});
test('Wiki 更新与恢复保留历史，引用必须来自当前知识库',()=>{
 const one=saveWikiPage(undefined,{title:'页面',content:'第一版',sourceIds:['d1'],links:[]},'w1',['d1'],'t1');
 const two=saveWikiPage(one,{title:'页面',content:'第二版',sourceIds:['d1'],links:[]},'w1',['d1'],'t2');const restored=restoreWikiRevision(two,0,'t3');assert.equal(restored.content,'第一版');assert.equal(restored.revisions.length,3);assert.throws(()=>saveWikiPage(two,{title:'页面',content:'无效引用',sourceIds:['other'],links:[]},'w1',['d1'],'t3'));
});
test('URL 仅接受 HTTP(S)，不执行远程抓取',()=>{assert.equal(validateSourceUrl(' https://example.com/a '),'https://example.com/a');assert.throws(()=>validateSourceUrl('javascript:alert(1)'));});
test('共享成员管理保护最后管理员，撤销共享不删除源资源',()=>{
 assert.throws(()=>changeSpaceMember(space(),'u1','u1','viewer'));
 const next=changeSpaceMember({...space(),members:[...space().members,{userId:'u2',role:'viewer'}]},'u1','u2','editor');assert.equal(next.members[1].role,'editor');assert.throws(()=>setSpaceResource(next,'u2','knowledge','k1',true));
 const shared=setSpaceResource(next,'u1','knowledge','k1',true);assert.deepEqual(setSpaceResource(shared,'u1','knowledge','k1',false).knowledgeIds,[]);assert.throws(()=>leaveSpace(space(),'u1'));
});
test('设备与已发布版本仍引用时，不允许删除知识库',()=>{
 const store={knowledge:[{id:'k1'}],docs:[],agents:[{knowledge:[],publishedConfig:{knowledge:['k1']}}]};assert.throws(()=>removeKnowledge(store as any,[],'k1'));
 assert.throws(()=>removeKnowledge({...store,agents:[]} as any,[],'k1',['k1']));
});
test('普通成员可以退出，但不能绕过最后管理员保护',()=>{
 const s={...space(),members:[...space().members,{userId:'u2',role:'viewer' as const}]};assert.deepEqual(leaveSpace(s,'u2').members,space().members);assert.equal(s.members.length,2);
});
test('空间生成的邀请码参与同一目录查询，撤销后不能再使用',async()=>{
 const {lookupSpaceInvite,joinSharedSpace}=await import('../src/shared_space_join.ts');const s=space(),invite={code:'TBLOCAL123456',spaceId:s.id,role:'viewer' as const,expiresAt:'2999-01-01',revoked:false},directory=[{space:s,discoverable:false,joinMode:'invite' as const}];
 assert.equal(lookupSpaceInvite(invite.code,directory,[invite],'2026-11-12').space.id,s.id);assert.equal(joinSharedSpace([s],{spaceId:s.id,code:invite.code},directory,[invite],'u2','2026-11-12').members.length,2);assert.throws(()=>lookupSpaceInvite(invite.code,directory,[{...invite,revoked:true}],'2026-11-12'));
});
test('需审核空间先产生申请，审核通过才加入，人数上限不能绕过',async()=>{
 const {joinSharedSpace}=await import('../src/shared_space_join.ts');const {reviewSpaceRequest}=await import('../src/space_management.ts');const s={...space(),requireApproval:true,memberLimit:2},invite={code:'TBREVIEW1234',spaceId:s.id,role:'editor' as const,expiresAt:'2999-01-01',revoked:false},directory=[{space:s,discoverable:true,joinMode:'open' as const}];
 const requested=joinSharedSpace([s],{spaceId:s.id,code:invite.code},directory,[invite],'u2','2026-11-12');assert.equal(requested.members.length,1);assert.equal(requested.requests?.length,1);assert.throws(()=>reviewSpaceRequest(requested,'u2','u2',true));const approved=reviewSpaceRequest(requested,'u1','u2',true);assert.equal(approved.members.length,2);assert.equal(approved.requests?.length,0);assert.throws(()=>joinSharedSpace([approved],{spaceId:s.id},directory,[invite],'u3','2026-11-12'));
});
test('FAQ 交换格式保留标签，去除重复与空标签，拒绝异常类型',()=>{
 const [doc]=importFaqJson(JSON.stringify([{question:'问题',answers:['答案一','答案二'],tags:['设备','设备',' ']}]),'k1',()=> 'f1');assert.deepEqual(doc.tags,['设备']);assert.equal(doc.faq?.answers.length,2);assert.throws(()=>importFaqJson(JSON.stringify([{question:'问题',answers:['答案'],tags:[123]}]),'k1',()=> 'f2'));
});
test('直接添加成员也受人数上限约束，重复添加不会产生重复成员',async()=>{
 const {addSpaceMember}=await import('../src/space_management.ts');const s={...space(),memberLimit:2};assert.throws(()=>addSpaceMember(s,'u2','u3','viewer'));const next=addSpaceMember(s,'u1','u2','viewer');assert.equal(addSpaceMember(next,'u1','u2','editor'),next);assert.throws(()=>addSpaceMember(next,'u1','u3','viewer'));
});
