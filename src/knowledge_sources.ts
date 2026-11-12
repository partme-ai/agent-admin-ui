/** 按 WeKnora DataSourceEditorDialog 的实际连接器定义整理；可配置不等于服务已接入。 */
export const knowledgeSourceDefinitions=[
 {id:'feishu',name:'飞书知识空间',url:'https://open.feishu.cn',resource:'知识空间 ID',fields:['App ID','App Secret'],scopes:'wiki:wiki:readonly、drive:drive:readonly、drive:export:readonly、docx:document:readonly'},
 {id:'lark',name:'Lark 知识空间',url:'https://open.larksuite.com',resource:'知识空间 ID',fields:['App ID','App Secret'],scopes:'wiki、drive、export、docx 只读'},
 {id:'feishu_drive',name:'飞书云盘',url:'https://open.feishu.cn',resource:'目录 Folder Token',fields:['App ID','App Secret'],scopes:'drive、export、docx 只读'},
 {id:'lark_drive',name:'Lark 云盘',url:'https://open.larksuite.com',resource:'目录 Folder Token',fields:['App ID','App Secret'],scopes:'drive、export、docx 只读'},
 {id:'notion',name:'Notion',url:'https://api.notion.com',resource:'Page ID / Database ID',fields:['Integration Token'],scopes:'需要向集成授予目标页面访问权限'},
 {id:'confluence',name:'Confluence',url:'',resource:'Space Key',fields:['用户名','PAT / API Token'],scopes:'Server / Data Center / Cloud 按实例鉴权'},
 {id:'yuque',name:'语雀',url:'https://www.yuque.com',resource:'知识库标识',fields:['API Token'],scopes:'repo:read、doc:read'},
 {id:'dingtalk',name:'钉钉知识库',url:'https://api.dingtalk.com',resource:'知识库 ID',fields:['Client ID','Client Secret','Operator ID'],scopes:'Wiki.Workspace.Read、Wiki.Node.Read、Storage.File.Read'},
 {id:'ima',name:'腾讯 IMA',url:'https://ima.qq.com',resource:'知识库 ID',fields:['Client ID','API Key'],scopes:'IMA OpenAPI 客户端凭据'},
 {id:'rss',name:'RSS 订阅',url:'',resource:'订阅路径 / Feed 地址',fields:['自定义请求头'],scopes:'公开源可不配置鉴权'},
 {id:'gitlab',name:'GitLab',url:'',resource:'项目 ID / 路径',fields:['Access Token'],scopes:'按目标项目配置只读访问'},
 {id:'seafile',name:'Seafile',url:'',resource:'资料库 ID / 路径',fields:['API Token'],scopes:'按资料库配置只读访问'},
 {id:'nextcloud',name:'Nextcloud',url:'',resource:'WebDAV 目录',fields:['用户名','App Password'],scopes:'使用应用密码，不使用账号主密码'},
 {id:'web',name:'网页站点',url:'',resource:'抓取路径',fields:[],scopes:'Agent Admin UI 网页导入配置'},
 {id:'webdav',name:'通用 WebDAV',url:'',resource:'目录',fields:['用户名','App Password'],scopes:'Agent Admin UI 通用连接配置'},
 {id:'s3',name:'S3 对象存储',url:'',resource:'Bucket / Prefix',fields:['Access Key','Secret Key'],scopes:'Agent Admin UI 存储连接配置'}
] as const;
