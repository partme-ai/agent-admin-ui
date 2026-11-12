import {defaultSpaceDraft,type SharedSpace,type SpaceRole} from './shared_spaces.ts';
/** 本地目录仅提供界面演练数据，不代表已发现真实空间。 */
export type SharedSpaceOffer={space:SharedSpace;discoverable:boolean;joinMode:'open'|'invite'};
export type SpaceInvite={code:string;spaceId:string;role:Exclude<SpaceRole,'admin'>;expiresAt:string;revoked:boolean};
export type SpaceJoinPreview={space:SharedSpace;role:Exclude<SpaceRole,'admin'>;code?:string};
export const demoSpaceInvites:SpaceInvite[]=[
 {code:'TBDEMO01',spaceId:'demo-product',role:'viewer',expiresAt:'2999-01-01T00:00:00Z',revoked:false},
 {code:'TBEDIT02',spaceId:'demo-internal',role:'editor',expiresAt:'2999-01-01T00:00:00Z',revoked:false},
 {code:'TBOLD003',spaceId:'demo-product',role:'viewer',expiresAt:'2020-01-01T00:00:00Z',revoked:false},
 {code:'TBSTOP04',spaceId:'demo-product',role:'viewer',expiresAt:'2999-01-01T00:00:00Z',revoked:true}
];
export function demoSharedDirectory():SharedSpaceOffer[]{
 return [
  {id:'demo-product',name:'产品知识协作',description:'共同维护产品文档，交流知识库与智能体的使用方法。',discoverable:true,joinMode:'invite' as const},
  {id:'demo-agent',name:'智能体交流',description:'讨论模型配置、智能体协作与知识管理。',discoverable:true,joinMode:'open' as const},
  {id:'demo-internal',name:'内部研发资料',description:'受邀请成员共同维护研发知识。',discoverable:false,joinMode:'invite' as const}
 ].map(({discoverable,joinMode,...info})=>({discoverable,joinMode,space:{...defaultSpaceDraft(),...info,createdBy:'demo-owner',createdAt:'2026-11-12T00:00:00Z',updatedAt:'2026-11-12T00:00:00Z',members:[{userId:'demo-owner',role:'admin'}],knowledgeIds:[],agentIds:[]}}));
}
/** 只提取邀请码，不访问、存储或打开所粘贴的地址。 */
export function extractSpaceInvite(input:string):string{
 let code=input.trim();
 if(/^https?:\/\//i.test(code)){
  try{const url=new URL(code),hashQuery=new URLSearchParams(url.hash.split('?')[1]||'');code=url.searchParams.get('invite')||url.searchParams.get('code')||hashQuery.get('invite')||hashQuery.get('code')||'';}catch{throw Error('邀请码格式不正确');}
 }
 if(!/^[a-z0-9]{8,16}$/i.test(code))throw Error('邀请码格式不正确，请输入 8～16 位字母或数字');
 return code.toUpperCase();
}
export function lookupSpaceInvite(input:string,directory:SharedSpaceOffer[],invites:SpaceInvite[],now:string):SpaceJoinPreview{
 const code=extractSpaceInvite(input),invite=invites.find(i=>i.code===code);
 if(!invite)throw Error('邀请码不存在，请向空间管理员确认');
 if(invite.revoked)throw Error('邀请码已撤销，请索取新的邀请码');
 if(!Number.isFinite(Date.parse(now))||!Number.isFinite(Date.parse(invite.expiresAt))||Date.parse(invite.expiresAt)<=Date.parse(now))throw Error('邀请码已过期，请索取新的邀请码');
 const offer=directory.find(s=>s.space.id===invite.spaceId);
 if(!offer)throw Error('共享空间已不存在');
 return {space:offer.space,role:invite.role,code};
}
export function searchSharedSpaces(query:string,directory:SharedSpaceOffer[]):SharedSpaceOffer[]{
 const q=query.trim().toLocaleLowerCase();if(!q)return [];
 return directory.filter(s=>s.discoverable&&(s.space.name+s.space.description).toLocaleLowerCase().includes(q));
}
export function previewOpenSpace(id:string,directory:SharedSpaceOffer[]):SpaceJoinPreview{
 const offer=directory.find(s=>s.space.id===id&&s.discoverable);
 if(!offer)throw Error('没有找到可加入的空间');
 if(offer.joinMode!=='open')throw Error('此空间需要邀请码，请向管理员索取');
 return {space:offer.space,role:'viewer'};
}
/** 确认时重新检查资格；不会把预览或重复点击当作新的成员授权。 */
export function joinSharedSpace(spaces:SharedSpace[],request:{spaceId:string;code?:string},directory:SharedSpaceOffer[],invites:SpaceInvite[],userId:string,now:string):SharedSpace{
 if(!userId)throw Error('请先登录后加入空间');
 const existing=spaces.find(s=>s.id===request.spaceId);
 if(existing?.members.some(m=>m.userId===userId))return existing;
 const preview=request.code?lookupSpaceInvite(request.code,directory,invites,now):previewOpenSpace(request.spaceId,directory);
 if(preview.space.id!==request.spaceId)throw Error('邀请码与空间不匹配，请重新查看');
 const base=existing||preview.space;
 if(base.memberLimit&&base.members.length>=base.memberLimit)throw Error('空间成员人数已达上限');
 if(base.requireApproval)return {...base,requests:base.requests?.some(r=>r.userId===userId)?base.requests:[...(base.requests||[]),{userId,role:preview.role}],updatedAt:now};
 return {...base,members:[...base.members,{userId,role:preview.role}],updatedAt:now,knowledgeIds:[...base.knowledgeIds],agentIds:[...base.agentIds]};
}
