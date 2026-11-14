export type EditorSectionItem={key:string;label:string;description:string;icon:string;fields:string[]};
export type EditorKind='managed'|'role'|'skill'|'mcp'|'content'|'model'|'shared';
const section=(key:string,label:string,description:string,icon:string,fields:string[]):EditorSectionItem=>({key,label,description,icon,fields});
const groups:Record<EditorKind,EditorSectionItem[]>={
 shared:[section('basic','基本信息','设置共享空间的名称和描述，便于成员识别。','info',['name','description']),section('permissions','权限说明','了解共享空间中不同角色的权限范围。','users',[])],
 managed:[section('info','基本信息','设置名称、说明、状态与负责人。','info',['name','description','status','owner']),section('permissions','功能权限','选择可访问的业务功能，不改变已关联资源。','safety',['permissions']),section('space','资源空间','设置资源空间名称与容量上限。','book',['spaceName','quota'])],
 role:[section('info','基本信息','设置角色名称和说明。','info',['name','description']),section('permissions','功能授权','将功能能力组合成角色权限。','safety',['permissions'])],
 skill:[section('info','版本信息','维护技能版本；名称和用途由 SKILL.md 定义。','info',['version']),section('content','技能内容','编写 SKILL.md，保存不会执行脚本或调用工具。','file',['content'])],
 mcp:[section('info','基本信息','设置连接名称和用途。','info',['name','desc']),section('access','接入配置','选择协议、执行位置和服务地址。','models',['transport','executionTarget','command','endpoint','headers']),section('tools','工具声明','维护连接可提供的工具声明。','tool',['tools'])],
 content:[section('info','基本信息','设置名称、说明、分类与状态。','info',['name','description','status','category','tags']),section('content','内容编辑','编辑正文或选择文件。','file',['content','fileName','size']),section('channels','发布渠道','选择渠道，仅保存本地发布方案。','link',['channels'])],
 model:[section('access','来源与接入','按厂商配置区域、套餐、协议与鉴权。','models',['providerId','role','name','endpoint','auth','credential']),section('parameters','模型与参数','选择模型并配置对应能力的请求参数。','models',['model']),section('review','检查与保存','核对连接摘要、启用状态和字段校验结果。','tasks',['enabled'])]
};
/** 返回独立的分区元数据，避免调用方修改影响后续编辑。 */
export function editorSectionItems(kind:EditorKind):EditorSectionItem[]{return groups[kind].map(s=>({...s,fields:[...s.fields]}));}
export function resolveEditorSection(items:EditorSectionItem[],key:string){return items.some(s=>s.key===key)?key:items[0]?.key||'';}
/** 按第一个字段错误定位分区；未知的历史字段回到基本信息。 */
export function editorSectionForFields(kind:EditorKind,paths:(string|number)[][]){const items=editorSectionItems(kind),field=String(paths[0]?.[0]||'');return items.find(s=>s.fields.includes(field))?.key||items[0].key;}
