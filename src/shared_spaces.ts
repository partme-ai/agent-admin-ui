/** 共享空间与资源空间分开建模；当前仅用于前端会话交互。 */
export type SpaceRole='admin'|'editor'|'viewer';
export type SharedSpace={discoverable?:boolean;requireApproval?:boolean;memberLimit?:number;requests?:{userId:string;role:Exclude<SpaceRole,'admin'>}[];knowledgePermissions?:Record<string,'viewer'|'editor'>;id:string;name:string;description:string;avatarIcon:string;avatarColor:string;createdBy:string;createdAt:string;updatedAt:string;members:{userId:string;role:SpaceRole}[];knowledgeIds:string[];agentIds:string[]};
export type SpaceDraft=Pick<SharedSpace,'name'|'description'|'avatarIcon'|'avatarColor'>;
export const spaceAvatarIcons=['initial','roles','book','robot','spark','star'];
export const spaceAvatarColors=['#1E5A8F','#278A77','#8A5FB3','#AD6540','#B24462','#586575'];
export const spaceRoleLabels:Record<SpaceRole,string>={admin:'管理员',editor:'编辑',viewer:'只读'};
export const spacePermissions:{key:string;label:string;allowed:SpaceRole[]}[]=[
 {key:'read',label:'查看和检索知识库',allowed:['admin','editor','viewer']},
 {key:'edit',label:'编辑共享知识库内容',allowed:['admin','editor']},
 {key:'agents',label:'使用共享智能体',allowed:['admin','editor','viewer']},
 {key:'share',label:'共享知识库到共享空间',allowed:['admin','editor']},
 {key:'manage',label:'管理空间设置、成员及资源共享',allowed:['admin']}
];
export function defaultSpaceDraft():SpaceDraft{return {name:'',description:'',avatarIcon:'initial',avatarColor:spaceAvatarColors[0]};}
function checkedDraft(spaces:SharedSpace[],draft:SpaceDraft,except=''):SpaceDraft{
 const name=draft.name.trim(),description=draft.description.trim();
 if(!name)throw Error('请输入共享空间名称');
 if(Array.from(name).length>50)throw Error('共享空间名称最多 50 字');
 if(Array.from(description).length>500)throw Error('共享空间描述最多 500 字');
 if(spaces.some(s=>s.id!==except&&s.name.toLocaleLowerCase()===name.toLocaleLowerCase()))throw Error('共享空间名称已存在');
 if(!spaceAvatarIcons.includes(draft.avatarIcon)||!spaceAvatarColors.includes(draft.avatarColor))throw Error('请选择有效的空间头像');
 return {name,description,avatarIcon:draft.avatarIcon,avatarColor:draft.avatarColor};
}
export function createSharedSpace(spaces:SharedSpace[],draft:SpaceDraft,userId:string,id:string,now:string):SharedSpace{
 if(!userId||!id||spaces.some(s=>s.id===id))throw Error('空间或创建者标识无效');
 return {...checkedDraft(spaces,draft),id,createdBy:userId,createdAt:now,updatedAt:now,members:[{userId,role:'admin'}],knowledgeIds:[],agentIds:[]};
}
export function updateSharedSpace(spaces:SharedSpace[],id:string,draft:SpaceDraft,userId:string,now:string):SharedSpace{
 const current=spaces.find(s=>s.id===id);
 if(!current)throw Error('共享空间不存在，请返回列表');
 if(!current.members.some(m=>m.userId===userId&&m.role==='admin'))throw Error('只有空间管理员可以修改空间设置');
 return {...current,...checkedDraft(spaces,draft,id),updatedAt:now};
}
