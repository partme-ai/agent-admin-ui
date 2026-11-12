/** WeKnora zh-CN 知识库编辑文案快照；MIT 来源见 vendor/weknora/NOTICE.md。 */
export const knowledgeEditorCopy = {
  "wiki": {
    "title": "Wiki 设置",
    "synthesisModelLabel": "Wiki 合成模型",
    "synthesisModelPlaceholder": "选择用于 Wiki 生成的 LLM 模型",
    "synthesisModelTip": "不设置时将回退使用摘要模型",
    "autoGenerateLabel": "自动生成 Wiki 页面",
    "autoGenerateTip": "关闭后仍可浏览和手工维护 Wiki 页面，但文档处理不会自动调用 LLM 生成或更新页面",
    "extractionGranularityLabel": "提取粒度",
    "contentInstructionsLabel": "Wiki 内容生成要求",
    "contentInstructionsTip": "控制摘要、页面和首页的表达重点；引用、合并与防幻觉规则由系统固定维护。修改后需重新解析才能影响已有内容。",
    "contentInstructionsPlaceholder": "例如：使用法务审阅口吻，优先展示责任主体、时间线和风险提示…",
    "extractionInstructionsLabel": "Wiki 提取重点",
    "extractionInstructionsTip": "说明应重点识别的领域实体和概念，不会替换系统的 JSON 与引用协议。",
    "extractionInstructionsPlaceholder": "例如：重点识别产品、版本、组织、负责人和关键技术概念…",
    "extractionGranularityTip": "控制每篇文档抽取的 Wiki 实体/概念数量。粒度越细，索引越聚焦；粒度越粗，索引越详尽",
    "granularityFocused": "聚焦",
    "granularityStandard": "标准",
    "granularityExhaustive": "详尽",
    "granularityFocusedHint": "只抽取文档的主角（如简历 → 人物和项目）。最干净，但可能漏掉次要实体。",
    "granularityStandardHint": "抽取主角 + 被详细描述的次要实体/概念。跳过一带而过的通用名词。适合大多数场景。",
    "granularityExhaustiveHint": "抽取所有可识别的命名实体与概念，包括一带而过的技术栈。适合将知识库当作术语表使用。"
  },
  "models": {
    "title": "模型配置",
    "description": "为知识库选择合适的 AI 模型",
    "llmLabel": "LLM 大语言模型",
    "llmDesc": "用于总结和摘要的大语言模型",
    "llmPlaceholder": "请选择 LLM 模型（可选）",
    "embeddingLabel": "Embedding 嵌入模型",
    "embeddingDesc": "用于文本向量化的嵌入模型",
    "embeddingPlaceholder": "请选择 Embedding 模型",
    "embeddingLocked": "知识库中已有文件，无法修改 Embedding 模型",
    "embeddingOptional": "（可选）",
    "embeddingWikiOptionalDesc": "可选。配置后用于 Wiki 目录归类的相似度匹配，让新页面更好地复用已有目录；不配置则按完整目录树归类。"
  },
  "chunking": {
    "title": "分块设置",
    "description": "控制上传文档在嵌入前的切分方式。默认值适用于大多数场景，仅在检索质量异常时调整。",
    "sizeLabel": "分块大小",
    "sizeDescription": "每个分块的最大字符数（100-4000）。默认 512 ≈ 中文 300 tokens / 英文 100-130 tokens。FAQ 用 200-400，叙述性长文档用 1000-2000。",
    "characters": "字符",
    "overlapLabel": "分块重叠",
    "overlapDescription": "相邻分块之间共享的字符数（0-500）。默认 80 ≈ 分块大小的 15%，符合当前研究推荐。FAQ/结构化数据用 0，长篇叙述用 150-200。",
    "separatorsLabel": "分隔符",
    "separatorsDescription": "切分时优先使用的字符或字符串。优先级高的分隔符先尝试；默认顺序优先段落 → 句子 → 标点。",
    "separatorsPlaceholder": "选择或自定义分隔符",
    "parentChildLabel": "父子分块",
    "parentChildDescription": "两级分块：小的子块用于向量匹配（精准命中），大的父块返回给 LLM（更丰富上下文）。建议用于长文档（>10 页）；短 FAQ 可关闭以节省存储。",
    "parentChunkSizeLabel": "父块大小",
    "parentChunkSizeDescription": "返回给 LLM 的上下文块大小（512-8192）。默认 4096 ≈ 1000 英文 tokens，适合所有现代 LLM 上下文窗口。",
    "childChunkSizeLabel": "子块大小",
    "childChunkSizeDescription": "用于向量匹配的嵌入块大小（64-2048）。默认 384 ≈ 80 tokens，是 sentence-transformer / BGE 类嵌入模型的最佳点。",
    "strategyLabel": "分块策略",
    "strategyDescription": "选择文档的分块方式。自动模式会分析每个文档的结构并选择最佳策略。",
    "strategyPlaceholder": "选择分块策略（不填则按长度切分）",
    "overlapWarning": "重叠相对于分块大小较大——分块之间会共享大部分内容。",
    "advancedLabel": "高级选项",
    "tokenLimitLabel": "每块 Token 上限",
    "tokenLimitDescription": "每个分块的硬性 Token 上限（0-8192）。0 = 关闭（仅按字符数）。当嵌入模型 Token 上限较小时启用：MiniLM (256 tok) 用 200，BGE/Cohere (512 tok) 用 400。现代嵌入器（OpenAI、Voyage、Jina-v3）支持 >2000 tokens，保持 0 即可。",
    "languagesLabel": "语言提示",
    "languagesDescription": "限制启发式模式只识别选定的语言（DE/EN/ZH）。留空 = 自动检测。同质化语料库可显式设置以避免跨语言误匹配。",
    "languagesPlaceholder": "自动检测",
    "debug": {
      "toggle": "测试分块效果",
      "toggleHint": "无需重新上传即可对示例文本运行分块器",
      "sampleLabel": "示例文本",
      "samplePlaceholder": "粘贴 Markdown / 纯文本片段以查看当前配置的分块结果…",
      "presetLabel": "载入示例：",
      "runButton": "运行预览",
      "loading": "正在对示例运行分块器…",
      "errorPrefix": "预览失败",
      "selectedTier": "选定策略",
      "rejected": "被拒绝的层级",
      "contextHeader": "上下文标题",
      "fallbackWarning": "策略链已穷尽 — 当前设置无法智能分块此内容",
      "stats": {
        "chunks": "块",
        "truncated": "已截断；总数 {total}"
      },
      "profile": {
        "lines": "行",
        "chars": "字符",
        "headings": "Markdown 标题",
        "pageBreaks": "分页符",
        "chapterMarkers": "章节标记",
        "languages": "语言"
      },
      "samples": {
        "markdown": "Markdown 文档",
        "faq": "FAQ 列表",
        "chapter": "PDF 章节",
        "plain": "纯文本"
      }
    },
    "languageOptions": {
      "de": "德语",
      "en": "英语",
      "zh": "中文"
    },
    "strategies": {
      "legacy": {
        "label": "按长度切分",
        "tooltip": "忽略结构，仅按字符数和分隔符递归切分——原始行为。当上述策略对你的内容效果不佳时使用。"
      },
      "heuristic": {
        "label": "结构感知",
        "tooltip": "识别分页符、编号章节、多语言章节标记（DE/EN/ZH）、全大写标题等结构信号进行切分。适合没有 Markdown 标题的 PDF / 扫描件。"
      },
      "heading": {
        "label": "按标题切分",
        "tooltip": "在 Markdown 标题（#、##、###）边界处切分，每块自动带上所在标题路径。适合结构清晰的 Markdown 文档。"
      },
      "auto": {
        "label": "自动",
        "tooltip": "文档分析器根据内容结构自动在「按标题切分」「结构感知」「按长度切分」之间选择。"
      }
    },
    "separators": {
      "doubleNewline": "双换行 (\\n\\n)",
      "singleNewline": "单换行 (\\n)",
      "periodCn": "中文句号 (。)",
      "exclamationCn": "感叹号 (！)",
      "questionCn": "问号 (？)",
      "semicolonCn": "中文分号 (；)",
      "semicolonEn": "英文分号 (;)",
      "space": "空格 ( )"
    }
  },
  "advanced": {
    "title": "高级设置",
    "description": "配置问题生成等高级功能",
    "multimodal": {
      "label": "多模态功能",
      "description": "启用图片等多模态内容的理解能力",
      "vllmLabel": "VLLM 视觉模型",
      "vllmDescription": "用于多模态理解的视觉语言模型（必选）",
      "vllmPlaceholder": "请选择 VLLM 模型（必选）",
      "descriptionLanguageLabel": "图片描述语言",
      "descriptionLanguageDescription": "留空时跟随文档语言；不再强制使用中文",
      "descriptionLanguageAuto": "自动跟随文档语言",
      "customInstructionsLabel": "图片解析要求",
      "customInstructionsDescription": "补充需要重点识别的视觉信息，OCR 和 Markdown 格式协议保持不变",
      "customInstructionsPlaceholder": "例如：重点识别设备铭牌、型号、告警代码和表格中的单位…",
      "imageAttrsLabel": "图片属性观察",
      "imageAttrsDescription": "开启后，解析时对每张图片先「观察属性＋描述」，再按属性决定是否对图内文字再跑一轮 OCR；关闭则沿用基础模式：所有图片逐张描述并全部 OCR",
      "imageVectorLabel": "图片向量检索",
      "imageVectorDescription": "开启后，生成图片描述之后再用向量模型直接对图片编码，检索时按图片内容召回描述没写到的信息。需要向量模型支持图片输入；每张图片多一次向量调用，向量检索的候选范围也会放大。只对此后入库或重新解析的文档生效，扫描件 PDF 页不生成",
      "imageVectorModelUnsupported": "当前向量模型未声明图片输入，开启后不会生成或召回图片向量",
      "imageAttrsSchemaLabel": "可观察的图片属性",
      "imageAttrsSchemaDescription": "模型会观察以下属性（由后端注册表定义）以驱动 OCR 策略",
      "imagePipelineSectionLabel": "图片解析方案",
      "imagePipelineSectionDescription": "多模态解析开启后，可以根据需要选择图片的解析方案",
      "imagePipelineLabel": "选择解析方案",
      "advancedSettingsLabel": "高级设置",
      "notesLabel": "附加说明",
      "imagePipelinePlaceholder": "请选择解析方案",
      "imagePipelineLoading": "正在读取流水线…",
      "imagePipelineLoadError": "读取流水线失败",
      "imagePipelineValidateError": "无法校验当前设置，保存时后端会再次检查。",
      "imageAttrsOcrConditions": "根据观察到的属性条件触发 OCR",
      "imageAttrsOcrConditionsDesc": "当观察到的属性满足以下条件时，对图片进行 OCR",
      "imagePipelineKbNote": "默认跟随知识库设置，可针对本次任务调整"
    },
    "tableMetadataInstructions": {
      "label": "表格元数据生成要求",
      "description": "为 CSV/Excel 摘要补充业务背景和字段语义，帮助后续检索理解表格内容",
      "placeholder": "例如：这是销售订单表，金额单位为元，status 字段使用公司内部状态码…"
    },
    "questionGeneration": {
      "modelLabel": "问题生成模型",
      "modelDescription": "留空时使用知识库摘要模型。",
      "modelPlaceholder": "请选择问题生成模型",
      "label": "AI 问题生成",
      "description": "解析文档时调用大模型为每个分块生成相关问题，提高检索召回率。启用后会增加文档解析耗时。",
      "countLabel": "生成问题数量",
      "countDescription": "每个文档分块生成的问题数量（1-10）",
      "instructionsLabel": "问题生成要求",
      "instructionsDescription": "指定问题面向的人群、场景和表达方式，系统仍维护稳定输出格式",
      "instructionsPlaceholder": "例如：生成客服用户常问的自然语言问题，避免考试题式表达…"
    },
    "profile": {
      "label": "自动生成知识库描述",
      "description": "文档新增、删除或摘要更新后，从文档画像聚合自动生成知识库描述。聚合本身不调用模型，仅当聚合结果变化时才发起一次小模型调用。",
      "modelLabel": "生成模型",
      "modelDescription": "留空时使用知识库摘要模型。",
      "modelPlaceholder": "请选择生成模型",
      "instructionsLabel": "描述生成要求",
      "instructionsDescription": "补充面向的读者、需要保留的术语或表达风格，系统仍维护稳定的输出格式。",
      "instructionsPlaceholder": "例如：面向售后客服，用通俗说法描述产品线，保留产品型号…"
    },
    "autoTag": {
      "label": "自动关联标签",
      "description": "文档解析完成后，从当前知识库已有标签中选择合适标签自动关联。不会创建或删除标签，并会增加一次模型调用。",
      "modelLabel": "分类模型",
      "modelDescription": "留空时使用知识库摘要模型。",
      "modelPlaceholder": "请选择分类模型",
      "maxTagsLabel": "单篇文档最多标签数",
      "maxTagsDescription": "每篇文档最多自动关联 1-10 个已有标签。",
      "skipIfTaggedLabel": "跳过已有标签的文档",
      "skipIfTaggedDescription": "开启后，上传时已手动设置标签的文档不再自动打标签，避免覆盖人工分类意图。"
    }
  },
  "asr": {
    "title": "音频语音识别",
    "description": "配置语音识别（ASR），启用后可上传音频文件并整段转写为文本（常见格式：mp3、wav、m4a、flac、ogg 等）。暂不支持视频上传。",
    "label": "启用音频语音识别",
    "desc": "启用后可上传音频到知识库，系统自动将语音转写为文本并参与解析与检索",
    "modelLabel": "ASR 模型",
    "modelDescription": "用于音频中语音转文本的识别模型（如 OpenAI Whisper）",
    "modelPlaceholder": "请选择 ASR 模型",
    "languageLabel": "音频语言提示",
    "languageDescription": "可选；指定主要语种可提高部分 ASR 模型的识别稳定性，留空时自动检测",
    "languagePlaceholder": "例如 zh、en，留空自动检测"
  },
  "faq": {
    "indexModeDescription": "仅索引问题可提升精度，索引问答可提高召回率",
    "questionIndexModeDescription": "合并索引：标准问和相似问合并索引；分别索引：标准问和每个相似问独立索引，检索更精确但需要更多存储",
    "entryGuide": "FAQ 条目由标准问、相似问、反例和多个答案组成，可在知识库详情中批量导入、编辑。",
    "modes": {
      "questionOnly": "仅标准问/相似问",
      "questionAnswer": "标准问 + 答案",
      "combined": "合并索引",
      "separate": "分别索引"
    }
  }
} as const;
export const wikiCopy=knowledgeEditorCopy.wiki;
export const wikiGranularityHint=(value:string)=>value==="focused"?wikiCopy.granularityFocusedHint:value==="exhaustive"?wikiCopy.granularityExhaustiveHint:wikiCopy.granularityStandardHint;

export const imagePipelineCopy = {
  "errors": {
    "noActionEnabled": "至少开启一个解析动作，否则多模态不会处理任何内容。"
  },
  "default": {
    "name": "传统",
    "note_actions": {
      "label": "两项动作互相独立",
      "description": "两项各自开关：关掉识别，图片仍会被描述；关掉描述，文字仍会被识别。只有两个都关掉时这张图才不会被处理 —— 所以面板不允许这种组合。"
    },
    "description": "用户根据任务需要手动选择解析动作开关。",
    "caption_enabled": {
      "label": "图片描述",
      "description": "让模型为每张图片生成一句内容描述，作为图片的说明文字。"
    },
    "ocr_enabled": {
      "label": "文字识别",
      "description": "提取图片中出现的文字。"
    },
    "caption": {
      "thinking_enabled": {
        "label": "图片描述时开启思考",
        "description": "让模型在写描述前先思考。一般情况下不需要开启思考，开启之后不仅更慢，还可能造成大模型思考内容过长截断正文输出造成任务失败。请仅在确认有必要的情况下开启。"
      }
    },
    "ocr": {
      "thinking_enabled": {
        "label": "文字识别时开启思考",
        "description": "让模型在提取文字前先思考。一般情况下不需要开启思考，开启之后不仅更慢，还可能造成大模型思考内容过长截断正文输出造成任务失败。请仅在确认有必要的情况下开启。"
      }
    }
  },
  "smartocr": {
    "ocr_on_unobserved": {
      "label": "图片属性观察失败时仍执行 OCR",
      "description": "当模型未能正确观察到图片属性时，默认仍执行 OCR 兜底，以免漏掉正文文字；关闭则跳过。（采用 4B 等小参数视觉模型，或自定义的图片解析提示词与系统提示词冲突时，可能造成观察失败；8B 及以上模型的失败概率很低，不建议关闭）"
    },
    "name": "智能模式",
    "note_flow": {
      "label": "由观察结果决定",
      "description": "先描述图片并观察属性，由属性决定是否值得再为它花一次 OCR。属性显示页面需要摆正时，会先摆正并裁掉周围环境再识别；若该步骤不可用或判定不适用，则直接用原图，绝不会比不启用更差。"
    },
    "preprocess": {
      "mode": {
        "label": "文档预处理",
        "description": "默认关闭。开启后，会在 OCR 前摆正并裁剪页面，增加处理耗时。自动：按观察结果判断；总是：对进入 OCR 的图片都尝试预处理；繁忙或超限时使用原图。",
        "options": {
          "auto": "自动",
          "off": "关闭",
          "always": "总是"
        }
      }
    },
    "observation": {
      "thinking_enabled": {
        "label": "描述时开启思考",
        "description": "让模型在描述图片并观察属性前先思考。一般情况下不需要开启思考，开启之后不仅更慢，还可能造成大模型思考内容过长截断正文输出造成任务失败。请仅在确认有必要的情况下开启。"
      }
    },
    "ocr": {
      "thinking_enabled": {
        "label": "文字识别时开启思考",
        "description": "让模型在提取文字前先思考。一般情况下不需要开启思考，开启之后不仅更慢，还可能造成大模型思考内容过长截断正文输出造成任务失败。请仅在确认有必要的情况下开启。"
      }
    },
    "description": "先观察图片特征并进行图片描述，再根据图片特征决定是否调用OCR对图片进行识别，以节省模型调用次数并提升解析速度。当识别到图片为可校正的文档或标签页照片时，会在识别前自动摆正并裁剪页面，以提升 OCR 准确率；若校正失败则直接使用原图。"
  }
} as const;
