import type {KnowledgeSection} from './knowledge_config.ts';
import {parserDefinitions,parserOptions} from './knowledge_parser.ts';
/** 用户提供的 WeKnora 十页截图是此窗口的视觉和文案基准。 */
export const knowledgeEditorSections:Record<KnowledgeSection,[string,string]>={
 basic:['基本信息','设置知识库的名称和描述信息'],
 models:['模型配置','为知识库选择合适的 AI 模型'],
 vectorStore:['向量存储','选择此知识库要写入的向量存储。绑定不可更改 — 如需将现有 KB 迁移到其他存储，请创建新 KB 并重新索引。'],
 faq:['FAQ 设置','设置 FAQ 知识库的索引策略和问答组织方式'],
 parser:['解析引擎','为不同文件类型选择文档解析引擎。未配置的文件类型将使用内置解析引擎。'],
 chunking:['分块设置','控制上传文档在嵌入前的切分方式。默认值适用于大多数场景，仅在检索质量异常时调整。'],
 multimodal:['图像处理配置','配置图像内容理解能力，启用后支持图片等非文本内容的解析和检索'],
 asr:['音频语音识别','配置语音识别（ASR），启用后可上传音频文件并整段转写为文本（常见格式：mp3、wav、m4a、flac、ogg 等）。暂不支持视频上传。'],
 graph:['知识图谱配置','配置实体-关系提取功能，自动从文本中抽取实体和关系构建知识图谱（注意：这与 Wiki 知识库中的「页面链接图谱」是两回事——前者是基于 LLM 的实体-关系图，后者是 Wiki 页面之间的引用关系图）'],
 advanced:['高级设置','配置问题生成等高级功能'],storage:['存储引擎','选择此知识库绑定的具体存储实例。']
};
export const parserReferenceGroups=[
 {label:'PDF 文档',types:['pdf'],icon:'pdf',defaultEngine:'builtin'},
 {label:'Word 文档',types:['docx','doc'],icon:'word',defaultEngine:'anydoc'},
 {label:'演示文稿',types:['pptx','ppt'],icon:'ppt',defaultEngine:'anydoc'},
 {label:'Excel 表格',types:['xlsx','xls'],icon:'excel',defaultEngine:'anydoc'},
 {label:'电子书',types:['epub'],icon:'file',defaultEngine:'anydoc'},
 {label:'网页归档',types:['mhtml'],icon:'file',defaultEngine:'builtin'},
 {label:'CSV 文件',types:['csv'],icon:'excel',defaultEngine:'simple'},
 {label:'Markdown',types:['md','markdown'],icon:'code',defaultEngine:'simple'},
 {label:'纯文本',types:['txt'],icon:'file',defaultEngine:'simple'},
 {label:'JSON',types:['json'],icon:'code',defaultEngine:'simple'},
 {label:'图像',types:['jpg','jpeg','png','gif','bmp','tiff','webp'],icon:'image',defaultEngine:'builtin'},
 {label:'音频',types:['mp3','wav','m4a','flac','ogg'],icon:'audio',defaultEngine:'builtin'}
].map(group=>({...group,engines:parserOptions(group.types).map(option=>option.value)}));
export const parserEngineNames:Record<string,string>=Object.fromEntries(Object.entries(parserDefinitions).map(([key,value])=>[key,value.label]));
export const chunkStrategyDescriptions:Record<string,string>={auto:'文档分析器根据内容结构自动在「按标题切分」「结构感知」「按长度切分」之间选择。',heading:'按 Markdown 标题和文档章节组织分块，保留标题上下文。',heuristic:'根据段落、列表、代码与表格等结构组织分块。',legacy:'按字符长度与分隔符切分，使用指定的分块大小和重叠。'};
export const chunkStrategyNames:Record<string,string>={auto:'自动',heading:'按标题切分',heuristic:'结构感知',legacy:'按长度切分'};
