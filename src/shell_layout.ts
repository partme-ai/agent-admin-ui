import type {Host} from './catalog.ts';
/** 屏幕尺寸只决定排版；浏览器入口默认Web，原生预览仍由明确的host指定。 */
export function resolveConsoleHost(requested:string|null):Host{
 return requested==='desktop'||requested==='android'||requested==='ipad'?requested:'web';
}
export const terminalEntry={page:'30',item:'terminals',label:'终端互联'};
export type ShellLink={key:string;label:string;page:string;item?:string};
export type ShellItem=ShellLink&{children?:ShellItem[]};
const link=(key:string,label:string,page:string,item?:string):ShellItem=>({key,label,page,...(item?{item}:{})});
const reports=(parent:string,page:string):ShellItem=>({...link(`${parent}-reports`,'数据与统计',page,'usage'),children:[link('usage','使用统计',page,'usage'),link('analysis','使用分析',page,'analysis'),link('cost','成本分析',page,'cost')]});
const roots:ShellItem[]=[
 link('home','工作台','01'),
 {...link('devices','设备(Bot)','12'),children:[link('gallery','设备广场','61'),link('mine','我的设备','12'),link('ota','固件更新 · OTA','25'),reports('devices','45')]},
 {...link('models','模型','06'),children:[link('model-settings','模型服务','06'),{...link('local','本地模型','62'),children:[link('environments','运行环境','62'),link('catalog','模型列表','63')]},{...link('gateway','模型网关','35'),children:[link('api','模型 API','57'),link('defaults','默认模型','55'),link('load','模型负载','35'),link('fallback','模型降级','36'),link('rate','模型限流','37'),link('breaker','模型熔断','38')]},reports('models','39')]},
 {...link('knowledge','知识库','08'),children:[link('market','公共知识库','40'),link('manage','知识库管理','08'),link('shared','共享空间','53'),link('mcp','MCP 服务','58')]},
 {...link('agents','智能体','03'),children:[link('market','市场','05'),link('plugins','插件','41'),link('connections','连接 · MCP','42'),link('skills','技能','43'),link('sandbox','沙箱','64'),{...link('tools','工具','65','computer'),children:[link('computer','电脑操控','65','computer'),link('browser','浏览器','65','browser'),link('search','网页搜索','65','search'),link('fetch','网页抓取','65','fetch'),link('documents','文档处理','65','documents'),link('ocr','OCR','65','ocr')]},link('mine','我的智能体','03'),link('debug','智能体调试','02'),reports('agents','44')]},

 {...link('resources','资源','46'),children:[link('info','基础信息','46'),link('spaces','资源空间','47'),link('storage','存储引擎','28')]},
 {...link('system','系统','48'),children:[link('info','基础信息','48'),link('theme','系统主题','30','theme'),link('roles','系统角色','49'),link('users','系统用户','50'),{...link('audit','安全审计','51','login'),children:[link('login','登录日志','51','login'),link('operations','操作日志','51','operations')]},{...link('configuration','系统设置','52','general'),children:[link('general','常规设置','52','general'),link('dictionary','数据字典','52','dictionary'),link('variables','变量参数','52','variables')]}]}
];
export const shellGroups=[{label:'',items:roots}];
/** 使用完整菜单路径区分同名入口，三端共享语义图标。 */
export const shellSubmenuIcons:Record<string,string>={
 'models/gateway/defaults':'controls','models/local/environments':'devices','models/local/catalog':'models','devices/gallery':'market','agents/sandbox':'safety','agents/tools':'tool','resources/storage':'storage',...Object.fromEntries(['computer','browser','search','fetch','documents','ocr'].map(k=>['agents/tools/'+k,({computer:'devices',browser:'browser',search:'search',fetch:'link',documents:'file',ocr:'image'} as Record<string,string>)[k]])),'models/local':'devices','models/local/ollama':'models','models/gateway/api':'code','knowledge/mcp':'link','system/cli':'code','models/model-settings':'models','models/gateway':'gateway',
 'models/gateway/load':'balance','models/gateway/fallback':'fallback','models/gateway/rate':'rate','models/gateway/breaker':'safety',
 'knowledge/market':'market','knowledge/manage':'book','knowledge/shared':'roles',
 'agents/memory':'book','agents/market':'market','agents/plugins':'extensions','agents/connections':'link','agents/skills':'bolt','agents/mine':'agents','agents/debug':'debug',
 'devices/mine':'devices','devices/ota':'upgrade',
 'resources/info':'info','resources/spaces':'storage',
 'system/info':'info','system/theme':'theme','system/roles':'roles','system/users':'users',
 'system/audit':'safety','system/audit/login':'login','system/audit/operations':'file',
 'system/configuration':'settings','system/configuration/general':'controls','system/configuration/dictionary':'book','system/configuration/variables':'code',
 ...Object.fromEntries(['models','agents','devices'].flatMap(scope=>{
  const parent=`${scope}/${scope}-reports`;return [[parent,'reports'],[`${parent}/usage`,'usage'],[`${parent}/analysis`,'analysis'],[`${parent}/cost`,'cost']];
 }))
};
export function shellEntries(){const out:{node:ShellItem;key:string;ancestors:string[]}[]=[];function walk(items:ShellItem[],parents:string[]){for(const node of items){const key=[...parents,node.key].join('/');out.push({node,key,ancestors:parents.map((_,i)=>parents.slice(0,i+1).join('/'))});if(node.children)walk(node.children,[...parents,node.key]);}}walk(roots,[]);return out;}
function exact(page:string,selected:string){if(page==='30'&&selected==='appearance')selected='theme';if(page==='30'&&!['theme','terminals','remote'].includes(selected)){page='52';selected='general';}const all=shellEntries().filter(e=>!e.node.children?.length);return all.find(e=>e.node.page===page&&e.node.item===selected)||all.find(e=>e.node.page===page&&!e.node.item);}
export function shellOwner(page:string,fallback:string,selected=''):string{
 if(page==='30'&&['terminals','remote'].includes(selected))return 'terminals';
 const matched=exact(page,selected);if(matched)return matched.key.split('/')[0];
 if(page==='27')return 'system';if(['22','23','31','32','34','28'].includes(page))return 'resources';
 if(page==='24'&&selected)return 'agents';
 if(['16','17','18','19','24'].includes(page))return 'devices';
 if(['20','21'].includes(page))return 'agents';return fallback==='chat'?'agents':fallback;
}
export function shellSelection(page:string,selected:string,owner:string):string{
 if(owner==='terminals')return 'terminals';
 const match=exact(page,selected);if(match)return match.key;
 const preferred:Record<string,string>={agents:'agents/mine',devices:'devices/mine',models:'models/model-settings',knowledge:'knowledge/manage',resources:'resources/spaces',system:page==='27'?'system/users':'system/info'};
 return preferred[owner]||owner;
}
export function shellAncestors(page:string,selected:string,owner:string):string[]{return shellEntries().find(e=>e.key===shellSelection(page,selected,owner))?.ancestors||[];}
export function shellTarget(key:string):ShellLink|undefined{return shellEntries().find(e=>e.key===key)?.node;}
