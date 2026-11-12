export type Host = 'web'|'desktop'|'android'|'ipad';
export type Device = 'desktop'|'tablet'|'mobile';
export const pages = [
 ['00','登录与首次准备','sign-in','home'],['01','工作台','home','home'],['02','智能体调试','chat','chat'],
 ['03','我的智能体','agents','agents'],['04','角色面板','agents/a1/edit','agents'],['05','智能体市场','agents/templates','agents'],
 ['06','模型服务','models','models'],['07','模型连接','models/connections/m1','models'],
 ['08','知识库管理','knowledge','knowledge'],['09','文档与设置','knowledge/k1','knowledge'],['10','解析与切片','knowledge/k1/documents/d1','knowledge'],['11','检索测试','knowledge/k1/retrieval','knowledge'],
 ['12','我的设备','devices','devices'],['13','设备详情','devices/b1','devices'],['14','添加设备','devices/add','devices'],['15','手动控制','devices/b1/control','devices'],
 ['16','任务与计划','tasks','tasks'],['17','审批与执行','tasks/t1','tasks'],['18','运行中心','runs','runs'],['19','运行链路','runs/r1','runs'],
 ['20','扩展中心','extensions','extensions'],['21','扩展配置','extensions/e1','extensions'],['22','声音资产','voices','voices'],['23','声纹成员','voices/speakers','voices'],
 ['24','对话记录','history','chat'],['25','固件目录','firmware','devices'],['26','升级计划','firmware/plans/f1','devices'],
 ['27','成员与权限','settings/members','settings'],['28','存储引擎','settings/storage','settings'],['29','服务诊断','settings/diagnostics','settings'],['30','常规设置','settings/general','system'],
 ['31','通讯录与呼叫','contacts','voices'],['32','音乐与媒体','media','voices'],['33','语音链路','models/voice-pipeline','models'],['34','表情定制','expressions','voices'],
 ['35','模型负载','models/gateway/load','models'],['36','模型降级','models/gateway/fallback','models'],['37','模型限流','models/gateway/rate','models'],['38','模型熔断','models/gateway/breaker','models'],['39','模型数据与统计','models/reports','models'],
 ['40','公共知识库','knowledge/market','knowledge'],['41','智能体插件','agents/plugins','agents'],['42','MCP 连接','agents/connections','agents'],['43','技能','agents/skills','agents'],['44','智能体数据与统计','agents/reports','agents'],['45','设备数据与统计','devices/reports','devices'],
 ['46','资源基础信息','resources/info','resources'],['47','资源空间','resources/spaces','resources'],['48','系统基础信息','system/info','system'],['49','系统角色','system/roles','system'],['50','系统用户','system/users','system'],['51','安全审计','system/audit','system'],['52','系统设置','system/settings','system'],['53','共享空间','knowledge/spaces','knowledge'],['54','个人主页','account/profile','system'],['55','默认模型','models/defaults','models'],['56','Ollama','models/local/ollama','models'],['57','模型 API','models/gateway/api','models'],['58','知识库 MCP 服务','knowledge/mcp','knowledge'],['59','CLI','system/cli','system'],['60','智能体记忆','agents/memory','agents'],['61','设备广场','devices/gallery','devices'],['62','运行环境','models/local/environments','models'],['63','模型列表','models/local/catalog','models'],['64','智能体沙箱','agents/sandbox','agents'],['65','智能体工具','agents/tools','agents'],['66','会话产物','agents/artifacts','agents']
].map(([id,title,path,nav])=>({id,title,path,nav}));
export const navItems = [
 ['home','工作台','01'],['chat','试聊','02'],['agents','智能体','03'],['models','模型中心','06'],['knowledge','知识库','08'],['devices','设备列表','12'],['tasks','任务','16'],['runs','运行中心','18'],['extensions','扩展','20'],['voices','声音与媒体','22'],['settings','设置','30'],['resources','资源','46'],['system','系统','48'],['terminals','终端互联','30']
].map(([key,label,page])=>({key,label,page}));
export function pathFor(id:string,item=''):string {
 if(id==='00')return '/sign-in';
 let path=pages.find(p=>p.id===id)?.path||'home';
 if(item){const encoded=encodeURIComponent(item);if(id==='10')path=path.replace('d1',encoded);if(['04','07','09','11','13','15','17','19','21','26'].includes(id))path=path.replace(/\b(a1|m1|k1|b1|t1|r1|e1|f1)\b/,encoded);}
 return `/w/demo/${path}`;
}
export const providers=[
 {name:'OpenAI',symbol:'O',color:'#172033',category:'语言模型',models:['gpt-4.1','gpt-4.1-mini'],desc:'通用对话 · 工具调用 · 多模态'},
 {name:'通义千问',symbol:'Q',color:'#7659d5',category:'语言模型',models:['qwen-plus','qwen-turbo','qwen-vl-plus'],desc:'中文理解 · 视觉问答 · 推理'},
 {name:'DeepSeek',symbol:'D',color:'#4268ef',category:'语言模型',models:['deepseek-chat','deepseek-reasoner'],desc:'深度思考 · 代码 · 逻辑推理'},
 {name:'智谱 GLM',symbol:'Z',color:'#356bb8',category:'语言模型',models:['glm-4-plus','glm-4v-plus'],desc:'中文对话 · 工具调用 · 视觉'},
 {name:'豆包',symbol:'豆',color:'#e7783a',category:'语言模型',models:['用户配置的 endpoint ID'],desc:'日常对话 · 多模态 · 语音'},
 {name:'Gemini',symbol:'✦',color:'#4e86d5',category:'语言模型',models:['gemini-2.5-flash','gemini-2.5-pro'],desc:'长上下文 · 多模态理解'},
 {name:'Ollama',symbol:'O',color:'#64656c',category:'本地模型',models:['qwen3:8b','llama3.2'],desc:'本地推理 · 自主部署 · 按需下载'},
 {name:'LM Studio',symbol:'LM',color:'#8a64c0',category:'本地模型',models:['已加载的本地模型 ID'],desc:'本地端点 · OpenAI 兼容'},
 {name:'OpenAI Compatible',symbol:'↗',color:'#358994',category:'语言模型',models:['自定义模型 ID'],desc:'自定义服务地址与模型标识'},
 {name:'FunASR',symbol:'声',color:'#287d93',category:'语音识别',models:['paraformer'],desc:'自部署识别 · 中文语音转写'},
 {name:'MiniMax',symbol:'M',color:'#de7658',category:'语音',models:['speech-2.8-turbo','speech-2.8-hd','speech-2.6-turbo','speech-2.6-hd','asr-1.0'],desc:'语音识别 · 同步/异步合成 · 音色复刻'},
 {name:'阿里云语音',symbol:'阿',color:'#e58738',category:'语音合成',models:['cosyvoice-v2'],desc:'流式合成 · 音色配置'},
 {name:'Embedding / Rerank',symbol:'E',color:'#34917b',category:'知识检索',models:['text-embedding-v3','bge-reranker-v2-m3'],desc:'向量化 · 语义检索 · 重排序'}
];
export const templateNames=['通用助手','知识问答','设备运维','机器人任务','学习讲解','语音陪伴','视觉助手','研究助理'];
