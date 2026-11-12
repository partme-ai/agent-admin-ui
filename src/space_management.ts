import type {SharedSpace,SpaceRole} from './shared_spaces.ts';
export function spaceAdmin(space:SharedSpace,user:string){return space.members.some(m=>m.userId===user&&m.role==='admin');}
export function changeSpaceMember(space:SharedSpace,actor:string,user:string,role:SpaceRole|null):SharedSpace{
 if(!spaceAdmin(space,actor))throw Error('只有管理员可以管理成员');
 if(!space.members.some(m=>m.userId===user))throw Error('空间成员不存在');
 const members=role?space.members.map(m=>m.userId===user?{...m,role}:m):space.members.filter(m=>m.userId!==user);
 if(!members.some(m=>m.role==='admin'))throw Error('请先指定其他管理员，再修改或移除最后一位管理员');
 return {...space,members,updatedAt:new Date().toISOString()};
}
export function setSpaceResource(space:SharedSpace,actor:string,kind:'knowledge'|'agent',id:string,enabled:boolean):SharedSpace{
 if(!spaceAdmin(space,actor))throw Error('只有管理员可以管理共享资源');
 const key=kind==='knowledge'?'knowledgeIds':'agentIds',ids=space[key];return {...space,[key]:enabled?[...new Set([...ids,id])]:ids.filter(x=>x!==id),updatedAt:new Date().toISOString()};
}
export function leaveSpace(space:SharedSpace,user:string):SharedSpace{const members=space.members.filter(m=>m.userId!==user);if(!members.some(m=>m.role==='admin'))throw Error('请先转让管理员后再退出');return {...space,members,updatedAt:new Date().toISOString()};}

export function reviewSpaceRequest(space:SharedSpace,actor:string,user:string,approve:boolean):SharedSpace{
 if(!spaceAdmin(space,actor))throw Error('只有管理员可以审核申请');const request=space.requests?.find(r=>r.userId===user);if(!request)throw Error('申请已处理');if(approve&&space.memberLimit&&space.members.length>=space.memberLimit)throw Error('空间成员人数已达上限');return {...space,requests:space.requests?.filter(r=>r.userId!==user),members:approve&&!space.members.some(m=>m.userId===user)?[...space.members,request]:space.members,updatedAt:new Date().toISOString()};
}
export function addSpaceMember(space:SharedSpace,actor:string,user:string,role:SpaceRole):SharedSpace{
 if(!spaceAdmin(space,actor))throw Error('只有管理员可以添加成员');if(!user.trim())throw Error('请选择成员');if(space.members.some(m=>m.userId===user))return space;if(space.memberLimit&&space.members.length>=space.memberLimit)throw Error('空间成员人数已达上限');return {...space,members:[...space.members,{userId:user,role}],updatedAt:new Date().toISOString()};
}
