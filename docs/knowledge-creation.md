# 知识库初始化编辑器 · 2.12

依据用户提供截图及本地 WeKnora `cbdcebabf48c5ee2d6868b370326aa8341703f62` 的 `frontend/src/views/knowledge/KnowledgeBaseEditorModal.vue`、`settings/KBModelConfig.vue`、`KBVectorStoreSettings.vue`、`KBParserSettings.vue`、`KBChunkingSettings.vue`、`KBStorageSettings.vue`、`KBAdvancedSettings.vue`、`GraphSettings.vue`、`ImagePipelineSettings.vue`。上游许可 MIT；TinyBot 用 React/antd 重写交互，不复制 Vue 运行时或调用其服务。

## 2.13 十页截图复刻

本次用户提供的十张截图取代上一轮概略布局，作为知识库编辑器的视觉基准。窗口保持1000×780、左导航208px；布局和文案对齐上游，按钮及配色继承 TinyBot 系统主题。标题、完整说明、文件类型图标与扩展名标签、默认引擎显示、滑块刻度及右侧字符数、策略提示、灰底高级子面板、未启用图谱提示、存储管理链接逐项对应截图。Mobile/Tablet 保留相同字段与分区，按可用宽度重排。

2.16 调整：模型接入统一在「模型设置」，知识库各分区只选择已配置模型，不再提供新增连接按钮或嵌套编辑器。空目录显示缺失分类及配置位置；提交仍按既有必填规则验证。解析默认名称是截图预设展示，并不声明 anydoc 等引擎已经部署。图谱说明内提供“预览图谱配置”，保留原来的编辑能力，但不伪造服务已开启。

## 页面合同

### 2.15 文档处理与 OCR 扩展

以用户提供的 Cherry Studio 截图和本地源码 `f2c9357` 为参考，在既有「解析引擎」页增加选项和对应配置，不另建平行设置页。当前参考仓库无 `.codegraph/`，通过处理器注册表、预设、设置组件与实际 handler 核对；未初始化索引，未修改参考仓库。

| 输入 | 可选择的扩展 | 对应配置 |
| --- | --- | --- |
| PDF | 本地文档解析、MinerU、PaddleOCR、Doc2x、Mistral、Open MinerU；保留内置和 PaddleOCR-VL | API 类提供地址、多个密钥引用；MinerU 模型 pipeline；PaddleOCR 文档模型；Doc2x v2 / v3-2026、公式等级、跨页表格合并；Mistral OCR 模型 |
| 图片 | System OCR、PaddleOCR、本地 PaddleOCR、Tesseract OCR、Mistral；保留内置和 PaddleOCR-VL | PaddleOCR 图片模型 PP-OCRv6 / PP-OCRv5；Tesseract 42 种语言多选与搜索，默认英语、简中、繁中；API 类独立配置 |
| Office / EPUB / MHTML / CSV / Markdown / TXT / JSON / 音频 | 保留原有对应解析器 | 不把图片 OCR 或仅核实 PDF 的接口笼统挂到全部格式；音频仍走既有 ASR 设置 |

各行选中引擎后在原位置展开紧凑配置，可手动收起。PDF 和图片的地址、模型及参数分别保存；切换引擎保留每种配置，返回默认只改变活动引擎，不删除草稿。可选 `parserEngineRules[].engine_options[engine]` 扩展旧规则；未保存前不修改旧知识库，未知引擎和额外字段保留。拆分旧合并规则时保留未编辑文件类型。现有「图像处理」继续管理视觉模型和图片管线，这里的 OCR 为图像文件解析器配置，不会自动开启多模态管线。

API 地址校验 HTTP / HTTPS，拒绝 URL 中直接携带账号密码。API 密钥输入为**凭据名称引用**，支持多个标签，不收集或持久化密钥原文；凭据解析、密钥轮换和真实鉴权仍待宿主服务实现。活动 Tesseract 至少保留一种受支持语言；Doc2x v2 下禁用 v3 专属参数并保留原值。校验可从其他分区跳回解析引擎页；保存继续触发原有知识索引待更新和智能体试聊凭据失效逻辑。

平台边界：System OCR 的 Cherry 实现仅 macOS / Windows；本地 PaddleOCR / 文档解析依赖本地模型与原生运行时，不能在 Web、Android Tablet、iPad 宣称直接可用。UI 展示配置及限制，后续由具备能力的 Server / Desktop 宿主执行。服务地址中的 localhost 指向执行端本机；移动端连接其他宿主需使用可访问地址。所有新增引擎均未接入真实服务，没有下载模型、语言包或上传资料。

源码证据：Cherry Studio `src/shared/data/presets/fileProcessing.ts`（预设、地址、模型与 Doc2x 参数）；`src/main/features/fileProcessing/processors/registry.ts`（文档/图片能力和平台条件）；`src/renderer/pages/settings/FileProcessingSettings/utils/fileProcessingMeta.ts`（菜单和密钥入口）；同目录 `components/ProcessorPanel.tsx`、`PaddleOcrModelSettings.tsx`、`TesseractLanguagePacks.tsx` 与 `ocr.ts`（配置项及语言代码）；`processors/localDocument/documentToMarkdown/handler.ts` 明确只接 PDF。上游采用 AGPL-3.0，当前为独立 React/antd 配置实现与能力事实映射，未复制其执行器、SDK 或原生模块。

[浏览器与测试证据](../evidence/knowledge-parser-2.15/README.md)。真实解析、鉴权、格式覆盖与平台原生能力不属于当前前端验证结论。

按截图保留左侧分组导航、右侧配置正文、固定底部取消/创建按钮。宽屏约 1000px × 780px，不再使用简单三字段弹窗。Mobile 同一套分区与字段改为顶部当前分区选择器，正文可滚动，底部不遮挡。

基础组：基本信息、模型配置、向量存储；索引与解析组：解析引擎、分块设置、图像处理、音频处理、知识图谱、高级设置；存储与数据组：存储引擎。问答型按上游只显示基本信息、模型配置、向量存储、FAQ 设置。

字段与默认值对齐上游：文档/问答类型；检索索引与 Wiki；Wiki 自动生成、提取粒度和说明；名称50字、描述200字；LLM/Embedding/Wiki模型；向量实例；按文件类型选择解析引擎；分块512、重叠80、父4096/子384、自动策略、分隔符、token上限与语言；图像视觉模型、描述语言、说明、图片向量、传统/智能管线及各自参数；ASR模型；图谱关系类型、示例文本、实体属性、实体关系及说明；问题生成默认开/3条、自动标签默认关/3条、知识画像默认关、表格说明；存储实例；FAQ问题/问答索引与合并/分别索引。

## 行为与兼容性

- 切换分区或类型保留草稿，切换图片管线保留各自参数。新建仅Wiki且未手动调整分块时使用2048/0/关闭父子预设，已手改不覆盖。
- 校验整个配置，缺项跳到对应分区并提示；不能只校验当前可见页。LLM提交必填（占位文案按截图保留“可选”）；启用检索时Embedding必填；启用图片/音频时对应模型必填。模型来自实际已配置连接；空目录不伪造可用项。
- 向量实例创建后固定；已有文档时锁定索引策略、Embedding及存储绑定，避免静默迁移数据。类型创建后不可改变。
- 创建和更新使用同一个编辑器；新增可选 `Knowledge.configuration` 完整保存初始化值，兼容旧记录；取消不写业务状态；关闭/离开有未保存确认。
- 沿用当前会话机制，不写主题/品牌/机器人形象存储；关联模型仅保存连接 ID，不在知识库中编辑模型接入或另存凭据。配置保存不代表服务就绪；创建不生成文档、索引或图谱。配置预设与已配置连接明确区分。
- 新配置改变会使关联智能体的旧调试凭证失效；需要重新试聊。旧知识库在用户明确保存前保持原样。

## 问答型落地与限制

创建问答库后进入问答维护页，支持添加、编辑、启停、删除标准问，保存相似问、反例与答案。反例不写入本地检索文本；资料记录沿用现有知识库 ID、文档 ID 和智能体关联。已有条目因配置变化变为待索引时，可重建本地文本索引。这里的“已索引”沿用原型本地文本状态，不代表真实 Embedding 已执行。

解析、向量和文件存储实例目前是配置预设；没有真实服务注册表，不能声称预设已部署。图片向量模型的图像输入能力等待服务端能力声明校验。图谱“提取测试”有明确未接入提示，仍可维护实体关系配置。Wiki 生成、图像识别、ASR、问题生成、标签和画像本轮均不发送模型请求。

## 验证

状态测试覆盖默认值、跨页依赖、模式切换保留、创建/编辑兼容、锁定条件和索引失效。三端浏览器逐页核对全部分区，验证缺项跳转、模型关联、新建后回填、取消保护及底部可见。前端完整测试、类型检查、构建；真实解析、Embedding、图谱、Wiki和存储服务待接入。

## 2.17 原版布局与文案对齐

知识库创建/编辑的各分区以本地 WeKnora 原文、字段顺序与条件展开为依据，不能以概略说明替代。基本信息中的 Wiki 自动生成、粒度及提示、内容生成要求、提取重点纵向铺排；三个粒度为聚焦、标准、详尽。恢复要求输入框和帮我写/优化规则入口；未连接模型时仅展示辅助编辑面板，不伪造模型生成。模型接入仍集中维护，知识库只选择模型。保留此前明确扩展的解析引擎选项。移动端使用同字段与文案，保持分区切换和底部操作可用，不将桌面定宽直接挤进手机。旧配置键与保存语义不变。

当前上游 `SettingsModalShell.vue` 明确桌面最大宽度 1080px、高度 780px、外围 20px；本轮以此修正前文 1000px 的旧记录。中文文案以 `src/knowledge_editor_copy.ts` 的来源快照复用，按钮、菜单选中色和窗口背景继承系统 Design Token。[2.17 三端验证记录](../evidence/knowledge-reference-2.17/README.md)。
