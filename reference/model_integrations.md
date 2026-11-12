# 模型平台与官方模型：十仓库源码接入清单

2026-11-05，console-ui-candidate-1.10；设计权威 console-plan-1.0。范围是当前本地检出中的模型提供方注册、适配模块、系统预设和外部运行时，不是全互联网厂商目录，也不是已经通过 TinyBot 调用验收的清单。

## 阅读与复用边界

- 官方模型指模型研发厂商的直接服务；模型平台指可提供多个模型的云平台、聚合或网关。模型作者、实际服务平台、连接、区域、套餐、协议与模型/部署 ID 分别建模。同一模型通过两个平台调用，是两条连接关系。
- 842 条是源项目记录，含别名、不同协议模块、区域/套餐及跨客户端预设；175 个入口仅为产品导航投影，不能称作175家独立厂商。原始记录完整保留，不通过导航别名重写调用身份。
- adapter 是直接注册的协议模块；plugin 是插件声明及注册入口；factory 是配置槽有工厂构造实现；compat 是兼容传输的参数预设；registry 是后端目录元数据；preset 是配置模板；runtime 是外部 SDK/CLI；configuration 是工具配置入口。各类证据不可互换。
- 此次核对静态源码、注册入口和配置；没有调用真实服务、逐模型验证 streaming/tools/vision、刷新外部 models.dev、运行所有参考仓库测试，不能把目录说明或默认 ID 当作官方当前服务承诺。
- cc-switch 的预设不是350个专用适配器，部分是工具配置入口；其服务地址摘自 settingsConfig，官网/推广地址不作为 API 地址。缺失字段保持空白。
- NanoClaw 当前核心只导入 claude.js，内部调用 Claude Agent SDK。扩展技能可添加提供方，但未安装技能不算当前核心已实现。
- OpenHuman 的设置页 BYOK 预设、实际兼容传输、内置产品后端和外部 Claude/Codex 路径分开；其文档中的 Deferred Transports 不算已完成接入。
- OpenCode 动态 SDK 加载器可加载外部包，不等于这些包已存在本地或已经通过验证；本清单列本地内置模块与注册插件，动态目录不冒充本地实现。

## 仓库快照与许可证

| 仓库 | HEAD | 记录数 | 根目录许可 |
| --- | --- | ---: | --- |
| opencode | `bcf23b6775c79a429b1511b255d6d88ab0248d4a` | 87 | MIT |
| openclaw | `ecbe1861efd51fd1987315baf7b4cff797181a7c` | 81 | MIT |
| openhuman | `8a1f8767683d17d4b465325f0fcdfebeb6f199e7` | 29 | GPL-3.0；直接复制实现前须评估目标分发许可证，优先复用协议与行为设计，不直接并入不兼容目标 |
| picoclaw | `bbf6893ca7afad27f1d00a0f5a45982a549c6ed6` | 42 | MIT |
| ZCode | `aac4755666d09fdcd70272fcf063c077a639015f` | 20 | Apache-2.0 |
| zeroclaw | `6c0b1f9eeace7b40b410c0be95b96f8a09faf1ee` | 79 | MIT / Apache-2.0 双许可证 |
| nullclaw | `5f1cade05c19b6ecdfb9565ae3305e892e484da9` | 110 | MIT |
| nanoclaw | `cab10bbc9413a8d25c83a5302fddff06be2d6072` | 1 | MIT |
| microclaw | `088c1260411ed7de1c4a67adad4d3f4dc1a23de5` | 43 | MIT |
| cc-switch | `98b5ae90dcbfcdae0f45dd1002c2f9c9530fd70b` | 350 | MIT |

保留许可证、版权及必要 NOTICE。当前只保存事实字段与源码定位，未复制适配业务实现；后续每个移植项按源文件及依赖的具体许可保留归属。

## 产品目录与实施顺序

| 入口 | 分类 | 优先级 | 原始记录数 |
| --- | --- | --- | ---: |
| DeepSeek | 官方模型 | P0 | 14 |
| 智谱 GLM / Z.AI | 官方模型 | P0 | 40 |
| Kimi / 月之暗面 | 官方模型 | P0 | 34 |
| MiniMax | 官方模型 | P0 | 28 |
| 阿里云 · 百炼 | 模型平台 | P0 | 23 |
| 通义千问 | 官方模型 | P0 | 12 |
| 百度云 · 千帆 | 模型平台 | P1 | 8 |
| 字节 · 火山方舟 | 模型平台 | P0 | 9 |
| 腾讯 · 混元 / TokenHub | 模型平台 | P1 | 6 |
| 小米 · MiMo | 官方模型 | P1 | 18 |
| 阶跃星辰 | 官方模型 | P1 | 17 |
| 硅基流动 | 模型平台 | P1 | 13 |
| 魔搭 ModelScope | 模型平台 | P1 | 7 |
| 美团 · LongCat | 官方模型 | P1 | 8 |
| 蚂蚁 · 百灵 | 官方模型 | P1 | 6 |
| 百川智能 | 官方模型 | P1 | 2 |
| 零一万物 · Yi | 官方模型 | P1 | 1 |
| 快手 · KAT | 官方模型 | P1 | 4 |
| 优刻得 · Compshare | 模型平台 | P1 | 10 |
| 胜算云 | 模型平台 | P1 | 9 |
| OpenAI | 官方模型 | P1 | 10 |
| Anthropic | 官方模型 | P1 | 11 |
| Google Gemini | 官方模型 | P1 | 10 |
| xAI | 官方模型 | P1 | 9 |
| Mistral | 官方模型 | P1 | 7 |
| Cohere | 官方模型 | P1 | 7 |
| Meta | 官方模型 | P1 | 1 |
| OpenRouter | 模型平台 | P1 | 16 |
| Azure / Microsoft Foundry | 模型平台 | P1 | 10 |
| Amazon Bedrock | 模型平台 | P1 | 15 |
| Google Vertex AI | 模型平台 | P1 | 10 |
| NVIDIA NIM | 模型平台 | P1 | 15 |
| Hugging Face | 模型平台 | P1 | 5 |
| BytePlus | 模型平台 | P1 | 10 |
| Ollama | 本地服务 | P1 | 7 |
| LM Studio | 本地服务 | P1 | 7 |
| vLLM | 本地服务 | P1 | 6 |
| llama.cpp | 本地服务 | P1 | 4 |
| SGLang | 本地服务 | P1 | 4 |
| Osaurus | 本地服务 | P1 | 2 |
| Apple Foundation Models | 本地服务 | P1 | 1 |
| LiteLLM | 模型平台 | P1 | 5 |
| NewAPI | 模型平台 | P1 | 1 |
| OpenCode Zen / Go | 模型平台 | P1 | 14 |
| 外部 Agent / CLI | 工具运行时 | P2 | 30 |
| PatewayAI | 兼容服务 | P2 | 3 |
| 火山Agentplan | 兼容服务 | P2 | 6 |
| DouBaoSeed | 兼容服务 | P2 | 6 |
| CCSub | 兼容服务 | P2 | 6 |
| Unity2.ai | 兼容服务 | P2 | 7 |
| AiHubMix | 兼容服务 | P2 | 8 |
| CherryIN | 兼容服务 | P2 | 7 |
| DMXAPI | 兼容服务 | P2 | 6 |
| PackyCode | 兼容服务 | P2 | 7 |
| APIKEY.FUN | 兼容服务 | P2 | 7 |
| APINebula | 兼容服务 | P2 | 7 |
| AtlasCloud | 兼容服务 | P2 | 7 |
| SudoCode | 兼容服务 | P2 | 7 |
| ClaudeAPI | 兼容服务 | P2 | 2 |
| ClaudeCN | 兼容服务 | P2 | 6 |
| RunAPI | 兼容服务 | P2 | 6 |
| RelaxyCode | 兼容服务 | P2 | 3 |
| Cubence | 兼容服务 | P2 | 7 |
| AIGoCode | 兼容服务 | P2 | 7 |
| RightCode | 兼容服务 | P2 | 6 |
| AICodeMirror | 兼容服务 | P2 | 7 |
| CrazyRouter | 兼容服务 | P2 | 7 |
| SSSAiCode | 兼容服务 | P2 | 7 |
| Micu | 兼容服务 | P2 | 6 |
| CTok.ai | 兼容服务 | P2 | 7 |
| E-FlowCode | 兼容服务 | P2 | 7 |
| TheRouter | 兼容服务 | P2 | 7 |
| Novita AI | 兼容服务 | P2 | 8 |
| PIPELLM | 兼容服务 | P2 | 6 |
| 自定义 | 兼容服务 | P2 | 1 |
| Together AI | 兼容服务 | P2 | 2 |
| Nous Research | 兼容服务 | P2 | 1 |
| OpenAI Compatible | 兼容服务 | P2 | 3 |
| 自定义网关 | 兼容服务 | P2 | 1 |
| anthropic-compatible | 兼容服务 | P2 | 1 |
| baseten | 兼容服务 | P2 | 3 |
| cerebras | 兼容服务 | P2 | 8 |
| cloudflare-ai-gateway | 兼容服务 | P2 | 4 |
| cloudflare-workers-ai | 兼容服务 | P2 | 2 |
| deepinfra | 兼容服务 | P2 | 5 |
| digitalocean | 兼容服务 | P2 | 2 |
| fireworks | 兼容服务 | P2 | 6 |
| google/interactions | 兼容服务 | P2 | 1 |
| groq | 兼容服务 | P2 | 7 |
| meta/chat | 兼容服务 | P2 | 1 |
| meta/messages | 兼容服务 | P2 | 1 |
| meta/responses | 兼容服务 | P2 | 1 |
| openai/chat | 兼容服务 | P2 | 1 |
| openai/responses | 兼容服务 | P2 | 1 |
| openai-compatible/responses | 兼容服务 | P2 | 2 |
| togetherai | 兼容服务 | P2 | 1 |
| venice | 兼容服务 | P2 | 7 |
| vercel-ai-gateway | 兼容服务 | P2 | 4 |
| chatgpt | 兼容服务 | P2 | 1 |
| databricks | 兼容服务 | P2 | 1 |
| gitlab | 兼容服务 | P2 | 1 |
| kilo | 兼容服务 | P2 | 2 |
| llmgateway | 兼容服务 | P2 | 1 |
| modal | 兼容服务 | P2 | 1 |
| neon | 兼容服务 | P2 | 1 |
| snowflake-cortex | 兼容服务 | P2 | 1 |
| perplexity | 兼容服务 | P2 | 3 |
| poe | 兼容服务 | P2 | 2 |
| sap-ai-core | 兼容服务 | P2 | 1 |
| vercel | 兼容服务 | P2 | 3 |
| zenmux | 兼容服务 | P2 | 1 |
| arcee | 兼容服务 | P2 | 3 |
| chutes | 兼容服务 | P2 | 3 |
| clawrouter | 兼容服务 | P2 | 1 |
| comfy | 兼容服务 | P2 | 1 |
| fal | 兼容服务 | P2 | 1 |
| featherless | 兼容服务 | P2 | 2 |
| gmi | 兼容服务 | P2 | 2 |
| gmi-cloud | 兼容服务 | P2 | 1 |
| gmicloud | 兼容服务 | P2 | 1 |
| kie | 兼容服务 | P2 | 1 |
| kilocode | 兼容服务 | P2 | 3 |
| novita | 兼容服务 | P2 | 5 |
| novitaai | 兼容服务 | P2 | 1 |
| ollama-cloud | 兼容服务 | P2 | 1 |
| qwencloud | 兼容服务 | P2 | 1 |
| radius | 兼容服务 | P2 | 1 |
| synthetic | 兼容服务 | P2 | 4 |
| together | 兼容服务 | P2 | 5 |
| vydra | 兼容服务 | P2 | 1 |
| Google Code Assist | 兼容服务 | P2 | 1 |
| GPT4Free | 兼容服务 | P2 | 1 |
| ElevenLabs ASR | 兼容服务 | P2 | 1 |
| NEAR AI Cloud | 兼容服务 | P2 | 3 |
| Vivgrid | 兼容服务 | P2 | 1 |
| Avian | 兼容服务 | P2 | 2 |
| OpenHuman | 兼容服务 | P2 | 1 |
| OrcaRouter | 兼容服务 | P2 | 1 |
| SumoPod | 兼容服务 | P2 | 1 |
| Custom (manual config) | 兼容服务 | P2 | 2 |
| Inferrs (local) | 兼容服务 | P2 | 1 |
| Telnyx | 兼容服务 | P2 | 2 |
| Atlas Cloud | 兼容服务 | P2 | 1 |
| Evolink | 兼容服务 | P2 | 1 |
| Eden AI | 兼容服务 | P2 | 1 |
| Vercel AI Gateway | 兼容服务 | P2 | 1 |
| Fireworks AI | 兼容服务 | P2 | 1 |
| Astrai | 兼容服务 | P2 | 2 |
| Amazon Bedrock | 兼容服务 | P2 | 1 |
| Cloudflare AI Gateway | 兼容服务 | P2 | 2 |
| Cloudflare AI Gateway | 兼容服务 | P2 | 1 |
| OVHcloud | 兼容服务 | P2 | 1 |
| OVHcloud | 兼容服务 | P2 | 2 |
| atomic_chat | 兼容服务 | P2 | 1 |
| crusoe | 兼容服务 | P2 | 1 |
| sambanova | 兼容服务 | P2 | 1 |
| hyperbolic | 兼容服务 | P2 | 1 |
| ai21 | 兼容服务 | P2 | 1 |
| reka | 兼容服务 | P2 | 1 |
| nscale | 兼容服务 | P2 | 1 |
| anyscale | 兼容服务 | P2 | 1 |
| nebius | 兼容服务 | P2 | 1 |
| friendli | 兼容服务 | P2 | 1 |
| deepmyst | 兼容服务 | P2 | 1 |
| lepton | 兼容服务 | P2 | 1 |
| manifest | 兼容服务 | P2 | 1 |
| morph | 兼容服务 | P2 | 1 |
| github_models | 兼容服务 | P2 | 1 |
| upstage | 兼容服务 | P2 | 1 |
| lambda_ai | 兼容服务 | P2 | 1 |
| inception | 兼容服务 | P2 | 1 |
| zerorouter | 兼容服务 | P2 | 1 |
| 华为云 · 盘古 / ModelArts | 模型平台 | P1 | 0 |
| 讯飞 · 星火 | 官方模型 | P1 | 0 |
| 商汤 · 日日新 | 官方模型 | P1 | 0 |

华为云盘古/ModelArts、讯飞星火、商汤日日新作为国内整合目标单独保留；本次注册清单没有足够证据，显示待接入，不伪造 API 入口或已支持状态。其他国内入口的目标为全量接入，P0/P1/P2 是实施顺序，不表示删除其余厂商。

## 模块归属与验收

| 层 | 归属与复用重点 | 验收 |
| --- | --- | --- |
| providers：目录与连接协议 | 官方厂商/平台/区域/套餐/协议分开；借鉴 ZeroClaw 工厂表、PicoClaw 元数据与 nullclaw 兼容差异标志 | 同模型不同平台不串凭据；模型 ID 原值保留；不支持能力明确拒绝 |
| providers：原生传输 | OpenAI Chat/Responses、Anthropic Messages、Gemini、Bedrock/Azure/Vertex 分别适配；参考 OpenCode 内置模块与 cc-switch 转换 | 流式分块、工具增量、思考字段、取消、用量、错误、重试边界均有协议夹具与实服务证据 |
| config：连接与密钥 | 连接身份、凭据引用、区域、订阅套餐、协议版本，不把 Coding Plan 通用化 | 凭据不进入前端存储/日志；区域切换不继承未经核实的鉴权资格 |
| AgentScope-Rust / runtime | 统一编排、工具、追踪；参考项目外部 Agent SDK/CLI 仅作可选工具连接，不替换 AgentScope-Rust | 对话取消、超时、事件顺序、故障归因与追踪一致 |
| voice / knowledge | ASR/TTS 音色、Embedding/Rerank 继续各自目录和能力验证，不从 LLM 支持推断 | 音色模型绑定、向量维数/索引版本及引用链分别验收 |
| hosts / 两层插件 | Server 的 HTTP 适配器独立于 Tauri；Desktop/Tablet 原生能力随包编译；动态业务扩展走既有插件合同 | Desktop 本地 CLI 按安装检查；Android/iPad 前台和生命周期限制保留；浏览器不启动本地进程 |

P0：核心协议框架、连接隔离和首批国内官方模型/百炼/火山接入，覆盖文本、流式、工具调用、取消与实际模型列表；P1：国内其余厂商/平台、区域及特殊鉴权、多模态与知识语音能力；P2：长尾兼容服务、订阅 OAuth/CLI、跨平台高级路由。每项必须独立标记实现、测试、实服务和目标平台验收；不以预设存在作为通过。

## 可直接定位的实现入口

| 项目 | 入口与调用路径 | 可借鉴内容 |
| --- | --- | --- |
| OpenCode | packages/core/src/provider.ts → packages/ai/src/providers/*；packages/core/src/plugin/provider.ts | 内置协议模块、多协议变体、包加载与提供方插件分离 |
| OpenClaw | extensions/*/openclaw.plugin.json → index.ts / provider-catalog.ts / stream.ts | 提供方发现、模型能力、思考/工具兼容、用量与认证扩展 |
| OpenHuman | config/schema/cloud_providers.rs → inference/provider/factory.rs、compatible_request.rs、compatible_stream.rs | BYOK 预设与协议/产品后端分离；许可边界见上 |
| PicoClaw | provider_metadata.go → factory_provider.go → openai_compat / anthropic_messages / azure / bedrock | 统一元数据、模型来源、鉴权与协议分派 |
| ZCode | config/provider/zcode-builtin.json → packages/provider/src/config/* → adapters/src/model/runner* | 模板与模型覆盖规则、套餐、请求/重试边界 |
| ZeroClaw | crates/zeroclaw-config/src/providers.rs → crates/zeroclaw-providers/src/factory.rs / compatible.rs / catalog.rs | 类型槽、工厂协议、兼容差异、模型发现与运行隔离 |
| nullclaw | src/providers/factory.zig → compatible.zig / 专用协议模块 | 国内外地址、专用鉴权头、流式/思考/工具差异标志 |
| NanoClaw | container/agent-runner/src/providers/index.ts → claude.ts → Claude Agent SDK | 外部 Agent 生命周期；不是多厂商 HTTP 通用 SDK |
| MicroClaw | crates/microclaw-engine/src/setup/presets.rs → llm/mod.rs → openai.rs / anthropic.rs | 预设、兼容传输、重试/流式/密钥池分离 |
| cc-switch | src/config/*ProviderPresets.ts → src-tauri/src/proxy/providers/* | 配置预设与 Claude/Codex/Gemini 代理协议转换分离 |

## 全部逐项记录

以下每行保留项目、原始 ID、证据等级、协议、源地址与模型快照。地址和模型是检出代码中的值，未经官方服务现状校验；空白不补造。详细 source SHA-256 见 model_integrations.source.json。

### opencode

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| amazon-bedrock / amazon-bedrock | adapter | @opencode/ai/providers/amazon-bedrock | — | [packages/core/src/provider.ts:49](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:49) |
| amazon-bedrock/mantle / amazon-bedrock/mantle | adapter | @opencode/ai/providers/amazon-bedrock/mantle | — | [packages/core/src/provider.ts:50](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:50) |
| amazon-bedrock/mantle/chat / amazon-bedrock/mantle/chat | adapter | @opencode/ai/providers/amazon-bedrock/mantle/chat | — | [packages/core/src/provider.ts:51](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:51) |
| amazon-bedrock/mantle/responses / amazon-bedrock/mantle/responses | adapter | @opencode/ai/providers/amazon-bedrock/mantle/responses | — | [packages/core/src/provider.ts:55](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:55) |
| alibaba/chat / alibaba/chat | adapter | @opencode/ai/providers/alibaba/chat | — | [packages/core/src/provider.ts:59](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:59) |
| alibaba/messages / alibaba/messages | adapter | @opencode/ai/providers/alibaba/messages | — | [packages/core/src/provider.ts:60](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:60) |
| alibaba/responses / alibaba/responses | adapter | @opencode/ai/providers/alibaba/responses | — | [packages/core/src/provider.ts:61](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:61) |
| anthropic / anthropic | adapter | @opencode/ai/providers/anthropic | — | [packages/core/src/provider.ts:62](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:62) |
| anthropic-compatible / anthropic-compatible | adapter | @opencode/ai/providers/anthropic-compatible | — | [packages/core/src/provider.ts:63](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:63) |
| azure / azure | adapter | @opencode/ai/providers/azure | — | [packages/core/src/provider.ts:64](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:64) |
| azure/chat / azure/chat | adapter | @opencode/ai/providers/azure/chat | — | [packages/core/src/provider.ts:65](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:65) |
| azure/responses / azure/responses | adapter | @opencode/ai/providers/azure/responses | — | [packages/core/src/provider.ts:66](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:66) |
| baseten / baseten | adapter | @opencode/ai/providers/baseten | — | [packages/core/src/provider.ts:67](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:67) |
| cerebras / cerebras | adapter | @opencode/ai/providers/cerebras | — | [packages/core/src/provider.ts:68](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:68) |
| cloudflare-ai-gateway / cloudflare-ai-gateway | adapter | @opencode/ai/providers/cloudflare-ai-gateway | — | [packages/core/src/provider.ts:69](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:69) |
| cloudflare-workers-ai / cloudflare-workers-ai | adapter | @opencode/ai/providers/cloudflare-workers-ai | — | [packages/core/src/provider.ts:70](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:70) |
| cohere / cohere | adapter | @opencode/ai/providers/cohere | — | [packages/core/src/provider.ts:71](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:71) |
| cohere/chat / cohere/chat | adapter | @opencode/ai/providers/cohere/chat | — | [packages/core/src/provider.ts:72](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:72) |
| deepinfra / deepinfra | adapter | @opencode/ai/providers/deepinfra | — | [packages/core/src/provider.ts:73](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:73) |
| deepseek / deepseek | adapter | @opencode/ai/providers/deepseek | — | [packages/core/src/provider.ts:74](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:74) |
| digitalocean / digitalocean | adapter | @opencode/ai/providers/digitalocean | — | [packages/core/src/provider.ts:75](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:75) |
| fireworks / fireworks | adapter | @opencode/ai/providers/fireworks | — | [packages/core/src/provider.ts:76](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:76) |
| google / google | adapter | @opencode/ai/providers/google | — | [packages/core/src/provider.ts:77](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:77) |
| google/interactions / google/interactions | adapter | @opencode/ai/providers/google/interactions | — | [packages/core/src/provider.ts:78](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:78) |
| google-vertex / google-vertex | adapter | @opencode/ai/providers/google-vertex | — | [packages/core/src/provider.ts:79](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:79) |
| google-vertex/gemini / google-vertex/gemini | adapter | @opencode/ai/providers/google-vertex/gemini | — | [packages/core/src/provider.ts:80](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:80) |
| google-vertex/interactions / google-vertex/interactions | adapter | @opencode/ai/providers/google-vertex/interactions | — | [packages/core/src/provider.ts:81](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:81) |
| google-vertex/chat / google-vertex/chat | adapter | @opencode/ai/providers/google-vertex/chat | — | [packages/core/src/provider.ts:85](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:85) |
| google-vertex/responses / google-vertex/responses | adapter | @opencode/ai/providers/google-vertex/responses | — | [packages/core/src/provider.ts:86](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:86) |
| google-vertex/messages / google-vertex/messages | adapter | @opencode/ai/providers/google-vertex/messages | — | [packages/core/src/provider.ts:87](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:87) |
| google-vertex/mistral / google-vertex/mistral | adapter | @opencode/ai/providers/google-vertex/mistral | — | [packages/core/src/provider.ts:88](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:88) |
| groq / groq | adapter | @opencode/ai/providers/groq | — | [packages/core/src/provider.ts:89](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:89) |
| meta/chat / meta/chat | adapter | @opencode/ai/providers/meta/chat | — | [packages/core/src/provider.ts:90](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:90) |
| meta/messages / meta/messages | adapter | @opencode/ai/providers/meta/messages | — | [packages/core/src/provider.ts:91](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:91) |
| meta/responses / meta/responses | adapter | @opencode/ai/providers/meta/responses | — | [packages/core/src/provider.ts:92](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:92) |
| minimax/chat / minimax/chat | adapter | @opencode/ai/providers/minimax/chat | — | [packages/core/src/provider.ts:93](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:93) |
| minimax/messages / minimax/messages | adapter | @opencode/ai/providers/minimax/messages | — | [packages/core/src/provider.ts:94](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:94) |
| minimax/responses / minimax/responses | adapter | @opencode/ai/providers/minimax/responses | — | [packages/core/src/provider.ts:95](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:95) |
| mistral / mistral | adapter | @opencode/ai/providers/mistral | — | [packages/core/src/provider.ts:96](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:96) |
| moonshot/chat / moonshot/chat | adapter | @opencode/ai/providers/moonshot/chat | — | [packages/core/src/provider.ts:97](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:97) |
| moonshot/messages / moonshot/messages | adapter | @opencode/ai/providers/moonshot/messages | — | [packages/core/src/provider.ts:98](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:98) |
| moonshot/responses / moonshot/responses | adapter | @opencode/ai/providers/moonshot/responses | — | [packages/core/src/provider.ts:99](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:99) |
| openai / openai | adapter | @opencode/ai/providers/openai | — | [packages/core/src/provider.ts:100](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:100) |
| openai/chat / openai/chat | adapter | @opencode/ai/providers/openai/chat | — | [packages/core/src/provider.ts:101](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:101) |
| openai/responses / openai/responses | adapter | @opencode/ai/providers/openai/responses | — | [packages/core/src/provider.ts:102](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:102) |
| openai-compatible / openai-compatible | adapter | @opencode/ai/providers/openai-compatible | — | [packages/core/src/provider.ts:103](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:103) |
| openai-compatible/responses / openai-compatible/responses | adapter | @opencode/ai/providers/openai-compatible/responses | — | [packages/core/src/provider.ts:104](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:104) |
| openai-compatible-responses / openai-compatible-responses | adapter | @opencode/ai/providers/openai-compatible-responses | — | [packages/core/src/provider.ts:108](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:108) |
| openrouter / openrouter | adapter | @opencode/ai/providers/openrouter | — | [packages/core/src/provider.ts:112](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:112) |
| togetherai / togetherai | adapter | @opencode/ai/providers/togetherai | — | [packages/core/src/provider.ts:113](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:113) |
| venice / venice | adapter | @opencode/ai/providers/venice | — | [packages/core/src/provider.ts:114](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:114) |
| vercel-ai-gateway / vercel-ai-gateway | adapter | @opencode/ai/providers/vercel-ai-gateway | — | [packages/core/src/provider.ts:115](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:115) |
| xai / xai | adapter | @opencode/ai/providers/xai | — | [packages/core/src/provider.ts:116](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:116) |
| zai/chat / zai/chat | adapter | @opencode/ai/providers/zai/chat | — | [packages/core/src/provider.ts:117](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:117) |
| zai-coding-plan/chat / zai-coding-plan/chat | adapter | @opencode/ai/providers/zai-coding-plan/chat | — | [packages/core/src/provider.ts:118](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:118) |
| zai-coding-plan/messages / zai-coding-plan/messages | adapter | @opencode/ai/providers/zai-coding-plan/messages | — | [packages/core/src/provider.ts:119](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:119) |
| zai-coding-plan/responses / zai-coding-plan/responses | adapter | @opencode/ai/providers/zai-coding-plan/responses | — | [packages/core/src/provider.ts:120](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/provider.ts:120) |
| amazon-bedrock / amazon-bedrock | plugin | — | — | [packages/core/src/plugin/provider.ts:36](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:36) |
| azure / azure | plugin | — | — | [packages/core/src/plugin/provider.ts:37](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:37) |
| cerebras / cerebras | plugin | — | — | [packages/core/src/plugin/provider.ts:38](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:38) |
| chatgpt / chatgpt | plugin | — | — | [packages/core/src/plugin/provider.ts:39](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:39) |
| cloudflare-ai-gateway / cloudflare-ai-gateway | plugin | — | — | [packages/core/src/plugin/provider.ts:40](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:40) |
| cloudflare-workers-ai / cloudflare-workers-ai | plugin | — | — | [packages/core/src/plugin/provider.ts:41](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:41) |
| cohere / cohere | plugin | — | — | [packages/core/src/plugin/provider.ts:42](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:42) |
| databricks / databricks | plugin | — | — | [packages/core/src/plugin/provider.ts:43](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:43) |
| digitalocean / digitalocean | plugin | — | — | [packages/core/src/plugin/provider.ts:44](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:44) |
| github-copilot / github-copilot | plugin | — | — | [packages/core/src/plugin/provider.ts:45](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:45) |
| gitlab / gitlab | plugin | — | — | [packages/core/src/plugin/provider.ts:46](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:46) |
| google-vertex / google-vertex | plugin | — | — | [packages/core/src/plugin/provider.ts:47](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:47) |
| kilo / kilo | plugin | — | — | [packages/core/src/plugin/provider.ts:48](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:48) |
| llmgateway / llmgateway | plugin | — | — | [packages/core/src/plugin/provider.ts:49](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:49) |
| lmstudio / lmstudio | plugin | — | — | [packages/core/src/plugin/provider.ts:50](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:50) |
| modal / modal | plugin | — | — | [packages/core/src/plugin/provider.ts:51](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:51) |
| neon / neon | plugin | — | — | [packages/core/src/plugin/provider.ts:52](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:52) |
| nvidia / nvidia | plugin | — | — | [packages/core/src/plugin/provider.ts:53](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:53) |
| ollama / ollama | plugin | — | — | [packages/core/src/plugin/provider.ts:54](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:54) |
| opencode / opencode | plugin | — | — | [packages/core/src/plugin/provider.ts:55](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:55) |
| snowflake-cortex / snowflake-cortex | plugin | — | — | [packages/core/src/plugin/provider.ts:56](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:56) |
| openai / openai | plugin | — | — | [packages/core/src/plugin/provider.ts:57](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:57) |
| openrouter / openrouter | plugin | — | — | [packages/core/src/plugin/provider.ts:58](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:58) |
| perplexity / perplexity | plugin | — | — | [packages/core/src/plugin/provider.ts:59](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:59) |
| poe / poe | plugin | — | — | [packages/core/src/plugin/provider.ts:60](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:60) |
| sap-ai-core / sap-ai-core | plugin | — | — | [packages/core/src/plugin/provider.ts:62](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:62) |
| vercel / vercel | plugin | — | — | [packages/core/src/plugin/provider.ts:63](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:63) |
| vllm / vllm | plugin | — | — | [packages/core/src/plugin/provider.ts:64](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:64) |
| xai / xai | plugin | — | — | [packages/core/src/plugin/provider.ts:65](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:65) |
| zenmux / zenmux | plugin | — | — | [packages/core/src/plugin/provider.ts:66](/Users/wandl/workspaces/workspace-agent-fabric/research/opencode/packages/core/src/plugin/provider.ts:66) |

### openclaw

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| amazon-bedrock / amazon-bedrock | plugin | models | — | [extensions/amazon-bedrock/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/amazon-bedrock/openclaw.plugin.json:1) |
| amazon-bedrock-mantle / amazon-bedrock-mantle | plugin | models | — | [extensions/amazon-bedrock-mantle/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/amazon-bedrock-mantle/openclaw.plugin.json:1) |
| anthropic / anthropic | plugin | anthropic-messages | https://api.anthropic.com<br>claude-opus-5-5<br>claude-fable-5-1<br>claude-fable-5<br>claude-opus-5<br>claude-sonnet-5-5<br>claude-sonnet-5<br>claude-mythos-5<br>claude-opus-4-8<br>claude-haiku-4-5 | [extensions/anthropic/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/anthropic/openclaw.plugin.json:1) |
| anthropic-vertex / anthropic-vertex | plugin | models | — | [extensions/anthropic-vertex/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/anthropic-vertex/openclaw.plugin.json:1) |
| apple-fm / apple-fm | plugin | models | — | [extensions/apple-fm/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/apple-fm/openclaw.plugin.json:1) |
| arcee / arcee | plugin | models | — | [extensions/arcee/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/arcee/openclaw.plugin.json:1) |
| baseten / baseten | plugin | openai-completions | https://inference.baseten.co/v1<br>deepseek-ai/DeepSeek-V4-Pro<br>zai-org/GLM-4.7<br>zai-org/GLM-5.2<br>zai-org/GLM-5.2-Fast<br>thinkingmachines/inkling<br>moonshotai/Kimi-K2.6<br>moonshotai/Kimi-K2.7-Code<br>nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B<br>openai/gpt-oss-120b | [extensions/baseten/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/baseten/openclaw.plugin.json:1) |
| byteplus / byteplus | plugin | openai-completions | https://ark.ap-southeast.bytepluses.com/api/v3<br>dola-seed-2-1-turbo-260628<br>seed-2-0-code-preview-260328<br>glm-5-2-260617<br>deepseek-v4-pro-260425<br>deepseek-v4-flash-260425<br>glm-4-7-251222 | [extensions/byteplus/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/byteplus/openclaw.plugin.json:1) |
| byteplus-plan / byteplus-plan | plugin | openai-completions | https://ark.ap-southeast.bytepluses.com/api/coding/v3<br>ark-code-latest<br>kimi-k2.5 | [extensions/byteplus/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/byteplus/openclaw.plugin.json:1) |
| cerebras / cerebras | plugin | openai-completions | https://api.cerebras.ai/v1<br>zai-glm-4.7<br>gpt-oss-120b<br>gemma-4-31b | [extensions/cerebras/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/cerebras/openclaw.plugin.json:1) |
| chutes / chutes | plugin | openai-completions | https://llm.chutes.ai/v1<br>deepseek-ai/DeepSeek-V3.2-TEE<br>moonshotai/Kimi-K2.6-TEE<br>moonshotai/Kimi-K2.5-TEE<br>zai-org/GLM-5.2-TEE<br>MiniMaxAI/MiniMax-M2.5-TEE<br>Qwen/Qwen3.6-27B-TEE<br>Qwen/Qwen3.5-397B-A17B-TEE | [extensions/chutes/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/chutes/openclaw.plugin.json:1) |
| clawrouter / clawrouter | plugin | models | — | [extensions/clawrouter/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/clawrouter/openclaw.plugin.json:1) |
| cloudflare-ai-gateway / cloudflare-ai-gateway | plugin | models | — | [extensions/cloudflare-ai-gateway/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/cloudflare-ai-gateway/openclaw.plugin.json:1) |
| codex / codex | plugin | agent-runtimes | — | [extensions/codex/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/codex/openclaw.plugin.json:1) |
| cohere / cohere | plugin | openai-completions | https://api.cohere.ai/compatibility/v1<br>command-a-plus-05-2026<br>command-a-03-2025<br>command-a-reasoning-08-2025<br>command-a-vision-07-2025<br>north-mini-code-1-0 | [extensions/cohere/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/cohere/openclaw.plugin.json:1) |
| comfy / comfy | plugin | media | — | [extensions/comfy/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/comfy/openclaw.plugin.json:1) |
| copilot-proxy / copilot-proxy | plugin | models | — | [extensions/copilot-proxy/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/copilot-proxy/openclaw.plugin.json:1) |
| deepinfra / deepinfra | plugin | openai-completions | https://api.deepinfra.com/v1/openai<br>deepseek-ai/DeepSeek-V4-Flash<br>deepseek-ai/DeepSeek-V4-Pro<br>zai-org/GLM-5.2<br>stepfun-ai/Step-3.7-Flash<br>moonshotai/Kimi-K2.7-Code<br>moonshotai/Kimi-K2.6<br>nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B<br>nvidia/NVIDIA-Nemotron-3-Super-120B-A12B<br>deepseek-ai/DeepSeek-V3.2<br>zai-org/GLM-5.1<br>stepfun-ai/Step-3.5-Flash<br>moonshotai/Kimi-K2.5 | [extensions/deepinfra/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/deepinfra/openclaw.plugin.json:1) |
| deepseek / deepseek | plugin | openai-completions | https://api.deepseek.com<br>deepseek-v4-flash<br>deepseek-v4-pro<br>deepseek-v4-flash-vision-exp<br>deepseek-flash | [extensions/deepseek/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/deepseek/openclaw.plugin.json:1) |
| fal / fal | plugin | media | — | [extensions/fal/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/fal/openclaw.plugin.json:1) |
| featherless / featherless | plugin | openai-completions | https://api.featherless.ai/v1<br>Qwen/Qwen3-32B | [extensions/featherless/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/featherless/openclaw.plugin.json:1) |
| fireworks / fireworks | plugin | openai-completions | https://api.fireworks.ai/inference/v1<br>accounts/fireworks/routers/glm-5p3-fast<br>accounts/fireworks/models/kimi-k2p6<br>accounts/fireworks/routers/kimi-k2p6-turbo | [extensions/fireworks/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/fireworks/openclaw.plugin.json:1) |
| github-copilot / github-copilot | plugin | openai-responses | https://api.individual.githubcopilot.com<br>claude-fable-5<br>claude-opus-5<br>claude-sonnet-5<br>claude-haiku-4.5<br>claude-opus-4.8<br>claude-sonnet-4.6<br>gemini-3.6-flash<br>gemini-3.1-pro-preview<br>gemini-3.5-flash<br>gemini-2.5-pro<br>gpt-5.6-sol<br>gpt-5.6-terra<br>gpt-5.6-luna<br>gpt-5.3-codex<br>gpt-5.4<br>gpt-5.5<br>gpt-5.4-mini | [extensions/github-copilot/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/github-copilot/openclaw.plugin.json:1) |
| gmi / gmi | plugin | openai-completions | https://api.gmi-serving.com/v1<br>zai-org/GLM-5.2-FP8<br>zai-org/GLM-5.1-FP8<br>deepseek-ai/DeepSeek-V4-Pro<br>deepseek-ai/DeepSeek-V3.2<br>google/gemini-3.5-flash-lite<br>anthropic/claude-sonnet-5<br>anthropic/claude-sonnet-4.6<br>openai/gpt-5.6-sol | [extensions/gmi/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/gmi/openclaw.plugin.json:1) |
| gmi-cloud / gmi-cloud | plugin | models | — | [extensions/gmi/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/gmi/openclaw.plugin.json:1) |
| gmicloud / gmicloud | plugin | models | — | [extensions/gmi/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/gmi/openclaw.plugin.json:1) |
| google / google | plugin | google-generative-ai | https://generativelanguage.googleapis.com/v1beta<br>gemini-2.5-pro<br>gemini-2.5-flash<br>gemini-2.5-flash-lite<br>gemini-3.5-flash<br>gemini-3.6-flash<br>gemini-3.7-flash<br>gemini-3.5-flash-lite<br>gemini-3.1-pro-preview<br>gemini-3.1-flash-lite<br>gemini-3-flash-preview | [extensions/google/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/google/openclaw.plugin.json:1) |
| google-gemini-cli / google-gemini-cli | plugin | models | — | [extensions/google/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/google/openclaw.plugin.json:1) |
| google-vertex / google-vertex | plugin | models | — | [extensions/google/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/google/openclaw.plugin.json:1) |
| groq / groq | plugin | openai-completions | https://api.groq.com/openai/v1<br>groq/compound<br>groq/compound-mini<br>llama-3.1-8b-instant<br>llama-3.3-70b-versatile<br>openai/gpt-oss-120b<br>openai/gpt-oss-20b<br>openai/gpt-oss-safeguard-20b<br>qwen/qwen3.6-27b | [extensions/groq/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/groq/openclaw.plugin.json:1) |
| huggingface / huggingface | plugin | openai-completions | https://router.huggingface.co/v1<br>deepseek-ai/DeepSeek-R1<br>deepseek-ai/DeepSeek-V3.1<br>openai/gpt-oss-120b | [extensions/huggingface/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/huggingface/openclaw.plugin.json:1) |
| kie / kie | plugin | media | — | [extensions/kie/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/kie/openclaw.plugin.json:1) |
| kilocode / kilocode | plugin | openai-completions | https://api.kilo.ai/api/gateway/<br>kilo-auto/balanced | [extensions/kilocode/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/kilocode/openclaw.plugin.json:1) |
| kimi / kimi | plugin | anthropic-messages | https://api.kimi.com/coding/<br>k3<br>k3-256k<br>kimi-for-coding<br>kimi-for-coding-highspeed | [extensions/kimi-coding/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/kimi-coding/openclaw.plugin.json:1) |
| kimi-code / kimi-code | plugin | models | — | [extensions/kimi-coding/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/kimi-coding/openclaw.plugin.json:1) |
| kimi-coding / kimi-coding | plugin | models | — | [extensions/kimi-coding/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/kimi-coding/openclaw.plugin.json:1) |
| litellm / litellm | plugin | models | — | [extensions/litellm/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/litellm/openclaw.plugin.json:1) |
| llama-cpp / llama-cpp | plugin | models | — | [extensions/llama-cpp/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/llama-cpp/openclaw.plugin.json:1) |
| lmstudio / lmstudio | plugin | models | — | [extensions/lmstudio/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/lmstudio/openclaw.plugin.json:1) |
| longcat / longcat | plugin | openai-completions | https://api.longcat.chat/openai<br>LongCat-2.0 | [extensions/longcat/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/longcat/openclaw.plugin.json:1) |
| meta / meta | plugin | openai-responses | https://api.meta.ai/v1<br>muse-spark-1.3<br>muse-spark-1.3-contributor<br>muse-spark-1.2<br>muse-spark-1.2-contributor<br>muse-spark-1.1 | [extensions/meta/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/meta/openclaw.plugin.json:1) |
| microsoft-foundry / microsoft-foundry | plugin | models | — | [extensions/microsoft-foundry/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/microsoft-foundry/openclaw.plugin.json:1) |
| minimax / minimax | plugin | models | — | [extensions/minimax/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/minimax/openclaw.plugin.json:1) |
| minimax-portal / minimax-portal | plugin | models | — | [extensions/minimax/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/minimax/openclaw.plugin.json:1) |
| mistral / mistral | plugin | openai-completions | https://api.mistral.ai/v1<br>codestral-latest<br>devstral-medium-latest<br>mistral-large-latest<br>mistral-medium-2508<br>mistral-medium-3-5<br>mistral-small-latest<br>mistral-small-2603 | [extensions/mistral/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/mistral/openclaw.plugin.json:1) |
| moonshot / moonshot | plugin | openai-completions | https://api.moonshot.ai/v1<br>kimi-k3<br>kimi-k2.7-code<br>kimi-k2.7-code-highspeed | [extensions/moonshot/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/moonshot/openclaw.plugin.json:1) |
| novita / novita | plugin | openai-completions | https://api.novita.ai/openai/v1<br>moonshotai/kimi-k3<br>moonshotai/kimi-k2.7-code<br>minimax/minimax-m3<br>zai-org/glm-5.2<br>deepseek/deepseek-v4-pro<br>deepseek/deepseek-v4-flash<br>qwen/qwen3.7-max<br>minimax/minimax-m2.7 | [extensions/novita/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/novita/openclaw.plugin.json:1) |
| novita-ai / novita-ai | plugin | models | — | [extensions/novita/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/novita/openclaw.plugin.json:1) |
| novitaai / novitaai | plugin | models | — | [extensions/novita/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/novita/openclaw.plugin.json:1) |
| nvidia / nvidia | plugin | openai-completions | https://integrate.api.nvidia.com/v1<br>nvidia/nemotron-3-ultra-550b-a55b<br>nvidia/nemotron-3.5-lightning-30b-a3b<br>nvidia/nemotron-3-super-120b-a12b<br>z-ai/glm-5.2<br>moonshotai/kimi-k2.6<br>minimaxai/minimax-m3<br>deepseek-ai/deepseek-v4-pro<br>qwen/qwen3.5-397b-a17b<br>moonshotai/kimi-k2.5<br>z-ai/glm-5.1<br>z-ai/glm5<br>minimaxai/minimax-m2.7 | [extensions/nvidia/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/nvidia/openclaw.plugin.json:1) |
| ollama / ollama | plugin | models | — | [extensions/ollama/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/ollama/openclaw.plugin.json:1) |
| ollama-cloud / ollama-cloud | plugin | ollama | https://ollama.com<br>kimi-k2.5<br>kimi-k2.6<br>kimi-k2.7-code<br>kimi-k3<br>deepseek-v4-flash<br>deepseek-v4-flash:0731<br>deepseek-v4-flash:preview<br>deepseek-v4-pro<br>deepseek-v4-pro:0813<br>deepseek-v4-pro:preview<br>gemma4<br>gemma4:31b<br>glm-5.1<br>glm-5.2<br>gpt-oss:120b<br>gpt-oss:20b<br>minimax-m2.7<br>minimax-m3<br>mistral-large-3:675b<br>nemotron-3-nano:30b<br>nemotron-3-super<br>nemotron-3-ultra<br>qwen3.5<br>qwen3.5:397b | [extensions/ollama/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/ollama/openclaw.plugin.json:1) |
| openai / openai | plugin | openai-responses | https://api.openai.com/v1<br>gpt-6-astra<br>gpt-6.1-sol<br>gpt-6-sol<br>gpt-6-luna<br>gpt-5.6-sol<br>gpt-5.6-terra<br>gpt-5.6-luna<br>gpt-5.5<br>gpt-5.5-pro<br>gpt-5.4<br>gpt-5.4-pro<br>gpt-5.4-mini<br>gpt-5.4-nano | [extensions/openai/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/openai/openclaw.plugin.json:1) |
| opencode / opencode | plugin | openai-completions | https://opencode.ai/zen/v1<br>claude-opus-5<br>gpt-5.6-sol<br>gpt-5-nano<br>gemini-3.6-flash<br>minimax-m3<br>kimi-k3<br>big-pickle | [extensions/opencode/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/opencode/openclaw.plugin.json:1) |
| opencode-go / opencode-go | plugin | openai-completions | https://opencode.ai/zen/go/v1<br>deepseek-v4-pro<br>deepseek-v4-flash<br>kimi-k3<br>kimi-k2.6<br>gpt-5.6-luna<br>qwen3.8-max<br>hy3-preview | [extensions/opencode-go/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/opencode-go/openclaw.plugin.json:1) |
| openrouter / openrouter | plugin | models | — | [extensions/openrouter/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/openrouter/openclaw.plugin.json:1) |
| qianfan / qianfan | plugin | openai-completions | https://qianfan.baidubce.com/v2<br>deepseek-v4-pro<br>ernie-5.1<br>ernie-5.0<br>deepseek-v3.2<br>ernie-5.0-thinking-preview | [extensions/qianfan/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/qianfan/openclaw.plugin.json:1) |
| qwen / qwen | plugin | openai-completions | qwen3.5-plus<br>qwen3.6-flash<br>qwen3.6-plus<br>qwen3.7-max<br>qwen3.7-plus<br>qwen3.8-max<br>qwen3.8-flash<br>qwen3-max-2026-01-23<br>qwen3-coder-next<br>qwen3-coder-plus<br>MiniMax-M2.5<br>glm-5<br>glm-4.7<br>kimi-k2.5 | [extensions/qwen/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/qwen/openclaw.plugin.json:1) |
| qwencloud / qwencloud | plugin | models | — | [extensions/qwen/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/qwen/openclaw.plugin.json:1) |
| modelstudio / modelstudio | plugin | models | — | [extensions/qwen/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/qwen/openclaw.plugin.json:1) |
| dashscope / dashscope | plugin | models | — | [extensions/qwen/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/qwen/openclaw.plugin.json:1) |
| qwen-token-plan / qwen-token-plan | plugin | openai-completions | https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1<br>qwen3.7-plus<br>qwen3.8-max<br>qwen3.8-flash<br>qwen3.6-plus<br>qwen3-coder-next<br>kimi-k2.5<br>glm-5<br>MiniMax-M2.5 | [extensions/qwen/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/qwen/openclaw.plugin.json:1) |
| bailian-token-plan / bailian-token-plan | plugin | models | — | [extensions/qwen/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/qwen/openclaw.plugin.json:1) |
| radius / radius | plugin | models | — | [extensions/radius/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/radius/openclaw.plugin.json:1) |
| sglang / sglang | plugin | models | — | [extensions/sglang/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/sglang/openclaw.plugin.json:1) |
| stepfun / stepfun | plugin | openai-completions | https://api.stepfun.ai/v1<br>step-3.7-flash<br>step-3.5-flash | [extensions/stepfun/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/stepfun/openclaw.plugin.json:1) |
| stepfun-plan / stepfun-plan | plugin | openai-completions | https://api.stepfun.ai/step_plan/v1<br>step-3.7-flash<br>step-3.5-flash<br>step-3.5-flash-2603 | [extensions/stepfun/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/stepfun/openclaw.plugin.json:1) |
| synthetic / synthetic | plugin | models | — | [extensions/synthetic/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/synthetic/openclaw.plugin.json:1) |
| tencent-tokenhub / tencent-tokenhub | plugin | openai-completions | https://tokenhub.tencentmaas.com/v1<br>hy3-preview<br>hy3<br>hy4-preview | [extensions/tencent/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/tencent/openclaw.plugin.json:1) |
| tencent-tokenplan / tencent-tokenplan | plugin | openai-completions | https://api.lkeap.cloud.tencent.com/plan/v3<br>hy3<br>hy4-preview | [extensions/tencent/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/tencent/openclaw.plugin.json:1) |
| together / together | plugin | openai-completions | https://api.together.xyz/v1<br>moonshotai/Kimi-K2.6<br>meta-llama/Llama-3.3-70B-Instruct-Turbo<br>deepseek-ai/DeepSeek-V4-Pro<br>zai-org/GLM-5.2 | [extensions/together/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/together/openclaw.plugin.json:1) |
| venice / venice | plugin | openai-completions | https://api.venice.ai/api/v1<br>zai-org-glm-5-2<br>zai-org-glm-4.7<br>venice-uncensored-1-2<br>google-gemma-4-31b-it<br>kimi-k2-6<br>deepseek-v3.2<br>qwen3-235b-a22b-thinking-2507<br>qwen3-coder-480b-a35b-instruct-turbo<br>qwen3-vl-235b-a22b<br>grok-4-5<br>qwen-3-7-max<br>qwen-3-7-plus<br>claude-fable-5<br>claude-opus-5<br>claude-sonnet-4-6<br>openai-gpt-56-sol<br>zai-org-glm-4.6<br>google-gemma-3-27b-it<br>kimi-k2-5 | [extensions/venice/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/venice/openclaw.plugin.json:1) |
| vercel-ai-gateway / vercel-ai-gateway | plugin | models | — | [extensions/vercel-ai-gateway/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/vercel-ai-gateway/openclaw.plugin.json:1) |
| vllm / vllm | plugin | models | — | [extensions/vllm/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/vllm/openclaw.plugin.json:1) |
| volcengine / volcengine | plugin | openai-completions | https://ark.cn-beijing.volces.com/api/v3<br>doubao-seed-evolving<br>doubao-seed-2-1-pro-260628<br>doubao-seed-2-1-turbo-260628<br>glm-5-2-260617<br>deepseek-v4-pro-260425<br>deepseek-v4-flash-260425<br>kimi-k2-5-260127<br>glm-4-7-251222<br>deepseek-v3-2-251201 | [extensions/volcengine/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/volcengine/openclaw.plugin.json:1) |
| volcengine-plan / volcengine-plan | plugin | openai-completions | https://ark.cn-beijing.volces.com/api/coding/v3<br>ark-code-latest<br>doubao-seed-2.1-turbo<br>glm-5.2<br>deepseek-v4-pro<br>deepseek-v4-flash | [extensions/volcengine/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/volcengine/openclaw.plugin.json:1) |
| vydra / vydra | plugin | media | — | [extensions/vydra/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/vydra/openclaw.plugin.json:1) |
| xai / xai | plugin | openai-responses | https://api.x.ai/v1<br>grok-4.7<br>grok-4.6<br>grok-4.5<br>grok-build-0.1<br>grok-4.3<br>grok-4.20-0309-reasoning<br>grok-4.20-0309-non-reasoning | [extensions/xai/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/xai/openclaw.plugin.json:1) |
| xiaomi / xiaomi | plugin | openai-completions | https://api.xiaomimimo.com/v1<br>mimo-v2.6-pro<br>mimo-v2.6-flash<br>mimo-v2.6-pro-ultraspeed<br>mimo-v2.5<br>mimo-v2.5-pro | [extensions/xiaomi/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/xiaomi/openclaw.plugin.json:1) |
| xiaomi-token-plan / xiaomi-token-plan | plugin | openai-completions | https://token-plan-sgp.xiaomimimo.com/v1<br>mimo-v2.6-pro<br>mimo-v2.6-flash<br>mimo-v2.5-pro<br>mimo-v2.5 | [extensions/xiaomi/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/xiaomi/openclaw.plugin.json:1) |
| zai / zai | plugin | openai-completions | https://api.z.ai/api/paas/v4<br>glm-5.3<br>glm-5.3-flash<br>glm-5.2<br>glm-5-turbo<br>glm-5v-turbo<br>glm-5.1 | [extensions/zai/openclaw.plugin.json:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openclaw/extensions/zai/openclaw.plugin.json:1) |

### openhuman

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| openhuman / OpenHuman | preset | OpenhumanJwt | https://api.openhuman.ai/v1 | [src/openhuman/config/schema/cloud_providers.rs:24](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:24) |
| openai / OpenAI | preset | Bearer | https://api.openai.com/v1 | [src/openhuman/config/schema/cloud_providers.rs:30](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:30) |
| anthropic / Anthropic | preset | Anthropic | https://api.anthropic.com/v1 | [src/openhuman/config/schema/cloud_providers.rs:36](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:36) |
| openrouter / OpenRouter | preset | Bearer | https://openrouter.ai/api/v1 | [src/openhuman/config/schema/cloud_providers.rs:42](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:42) |
| orcarouter / OrcaRouter | preset | Bearer | https://api.orcarouter.ai/v1 | [src/openhuman/config/schema/cloud_providers.rs:48](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:48) |
| gmi / GMI | preset | Bearer | https://api.gmi-serving.com/v1 | [src/openhuman/config/schema/cloud_providers.rs:54](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:54) |
| fireworks / Fireworks | preset | Bearer | https://api.fireworks.ai/inference/v1 | [src/openhuman/config/schema/cloud_providers.rs:60](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:60) |
| moonshot / Kimi (Moonshot) | preset | Bearer | https://api.moonshot.ai/v1 | [src/openhuman/config/schema/cloud_providers.rs:66](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:66) |
| groq / Groq | preset | Bearer | https://api.groq.com/openai/v1 | [src/openhuman/config/schema/cloud_providers.rs:72](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:72) |
| mistral / Mistral | preset | Bearer | https://api.mistral.ai/v1 | [src/openhuman/config/schema/cloud_providers.rs:78](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:78) |
| deepseek / DeepSeek | preset | Bearer | https://api.deepseek.com/v1 | [src/openhuman/config/schema/cloud_providers.rs:84](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:84) |
| together / Together AI | preset | Bearer | https://api.together.xyz/v1 | [src/openhuman/config/schema/cloud_providers.rs:90](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:90) |
| google / Google Gemini | preset | Bearer | https://generativelanguage.googleapis.com/v1beta/openai | [src/openhuman/config/schema/cloud_providers.rs:96](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:96) |
| cerebras / Cerebras | preset | Bearer | https://api.cerebras.ai/v1 | [src/openhuman/config/schema/cloud_providers.rs:102](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:102) |
| xai / xAI | preset | Bearer | https://api.x.ai/v1 | [src/openhuman/config/schema/cloud_providers.rs:108](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:108) |
| huggingface / Hugging Face | preset | Bearer | https://router.huggingface.co/v1 | [src/openhuman/config/schema/cloud_providers.rs:114](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:114) |
| nvidia / NVIDIA | preset | Bearer | https://integrate.api.nvidia.com/v1 | [src/openhuman/config/schema/cloud_providers.rs:120](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:120) |
| zai / Z.AI | preset | Bearer | https://api.z.ai/api/paas/v4 | [src/openhuman/config/schema/cloud_providers.rs:126](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:126) |
| minimax / MiniMax | preset | Bearer | https://api.minimax.io/v1 | [src/openhuman/config/schema/cloud_providers.rs:132](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:132) |
| stepfun / StepFun | preset | Bearer | https://api.stepfun.ai/step_plan/v1 | [src/openhuman/config/schema/cloud_providers.rs:146](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:146) |
| kilocode / Kilo Code | preset | Bearer | https://api.kilo.ai/api/gateway | [src/openhuman/config/schema/cloud_providers.rs:152](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:152) |
| deepinfra / DeepInfra | preset | Bearer | https://api.deepinfra.com/v1/openai | [src/openhuman/config/schema/cloud_providers.rs:158](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:158) |
| novita / Novita | preset | Bearer | https://api.novita.ai/v3/openai | [src/openhuman/config/schema/cloud_providers.rs:164](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:164) |
| venice / Venice | preset | Bearer | https://api.venice.ai/api/v1 | [src/openhuman/config/schema/cloud_providers.rs:170](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:170) |
| vercel-ai-gateway / Vercel AI Gateway | preset | Bearer | https://ai-gateway.vercel.sh/v1 | [src/openhuman/config/schema/cloud_providers.rs:176](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:176) |
| sumopod / SumoPod | preset | Bearer | https://ai.sumopod.com/v1 | [src/openhuman/config/schema/cloud_providers.rs:182](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/config/schema/cloud_providers.rs:182) |
| claude-code / claude-code | runtime | — | — | [src/openhuman/inference/provider/claude_code/mod.rs:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/inference/provider/claude_code/mod.rs:1) |
| claude-agent-sdk / claude-agent-sdk | runtime | — | — | [src/openhuman/inference/provider/claude_agent_sdk/mod.rs:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/inference/provider/claude_agent_sdk/mod.rs:1) |
| openai-codex / openai-codex | runtime | — | — | [src/openhuman/inference/provider/openai_codex.rs:1](/Users/wandl/workspaces/workspace-agent-fabric/research/openhuman/src/openhuman/inference/provider/openai_codex.rs:1) |

### picoclaw

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| openai / OpenAI | registry | — | https://api.openai.com/v1<br>gpt-5.4<br>gpt-5.4-mini<br>gpt-5.5 | [pkg/providers/provider_metadata.go:27](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:27) |
| anthropic / Anthropic | registry | — | https://api.anthropic.com/v1<br>claude-opus-4-7<br>claude-sonnet-4-6<br>claude-haiku-4-5 | [pkg/providers/provider_metadata.go:41](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:41) |
| anthropic-messages / Anthropic Messages | registry | — | https://api.anthropic.com/v1<br>claude-opus-4-7<br>claude-sonnet-4-6<br>claude-haiku-4-5 | [pkg/providers/provider_metadata.go:54](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:54) |
| gemini / Google Gemini | registry | — | https://generativelanguage.googleapis.com/v1beta<br>gemini-3.1-pro-preview<br>gemini-3-flash-preview<br>gemini-3.1-flash-lite | [pkg/providers/provider_metadata.go:66](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:66) |
| deepseek / DeepSeek | registry | — | https://api.deepseek.com/v1<br>deepseek-v4-flash<br>deepseek-v4-pro | [pkg/providers/provider_metadata.go:79](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:79) |
| openrouter / OpenRouter | registry | — | https://openrouter.ai/api/v1<br>openai/gpt-5.4<br>anthropic/claude-opus-4.7<br>google/gemini-3.1-pro-preview<br>qwen/qwen3-coder-next | [pkg/providers/provider_metadata.go:92](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:92) |
| qwen-portal / Qwen | registry | — | https://dashscope.aliyuncs.com/compatible-mode/v1<br>qwen3.6-max-preview<br>qwen3.6-plus<br>qwen3.6-flash<br>qwen3-coder-next | [pkg/providers/provider_metadata.go:110](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:110) |
| qwen-intl / Qwen International | registry | — | https://dashscope-intl.aliyuncs.com/compatible-mode/v1<br>qwen3.6-max-preview<br>qwen3.6-plus<br>qwen3.6-flash<br>qwen3-coder-next | [pkg/providers/provider_metadata.go:124](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:124) |
| moonshot / Moonshot | registry | — | https://api.moonshot.cn/v1<br>kimi-k2.5<br>kimi-k2-thinking<br>kimi-k2-thinking-turbo<br>kimi-k2-turbo-preview | [pkg/providers/provider_metadata.go:138](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:138) |
| volcengine / Volcengine | registry | — | https://ark.cn-beijing.volces.com/api/v3<br>doubao-seed-1-6-251015<br>doubao-seed-1-6-flash-250828<br>doubao-seed-1-6-thinking | [pkg/providers/provider_metadata.go:155](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:155) |
| zhipu / Zhipu AI | registry | — | https://open.bigmodel.cn/api/paas/v4<br>glm-5<br>glm-4.7<br>glm-4.5-air<br>glm-4-flash-250414 | [pkg/providers/provider_metadata.go:172](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:172) |
| groq / Groq | registry | — | https://api.groq.com/openai/v1<br>openai/gpt-oss-120b<br>openai/gpt-oss-20b<br>llama-3.3-70b-versatile<br>qwen/qwen3-32b | [pkg/providers/provider_metadata.go:186](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:186) |
| mistral / Mistral AI | registry | — | https://api.mistral.ai/v1<br>mistral-large-latest<br>mistral-medium-3-5<br>mistral-small-latest<br>devstral-latest | [pkg/providers/provider_metadata.go:204](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:204) |
| nvidia / NVIDIA | registry | — | https://integrate.api.nvidia.com/v1<br>openai/gpt-oss-120b<br>openai/gpt-oss-20b<br>qwen/qwen3-coder-480b-a35b-instruct<br>qwen/qwen3-next-80b-a3b-thinking | [pkg/providers/provider_metadata.go:222](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:222) |
| cerebras / Cerebras | registry | — | https://api.cerebras.ai/v1<br>gpt-oss-120b<br>zai-glm-4.7 | [pkg/providers/provider_metadata.go:240](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:240) |
| azure / Azure OpenAI | registry | — | — | [pkg/providers/provider_metadata.go:253](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:253) |
| bedrock / AWS Bedrock | registry | — | — | [pkg/providers/provider_metadata.go:264](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:264) |
| github-copilot / GitHub Copilot | registry | — | localhost:4321 | [pkg/providers/provider_metadata.go:274](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:274) |
| antigravity / Google Code Assist | registry | oauth | — | [pkg/providers/provider_metadata.go:287](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:287) |
| claude-cli / Claude CLI | registry | — | — | [pkg/providers/provider_metadata.go:299](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:299) |
| codex-cli / Codex CLI | registry | — | — | [pkg/providers/provider_metadata.go:311](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:311) |
| ollama / Ollama | registry | — | http://localhost:11434/v1 | [pkg/providers/provider_metadata.go:323](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:323) |
| vllm / VLLM | registry | — | http://localhost:8000/v1 | [pkg/providers/provider_metadata.go:337](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:337) |
| lmstudio / LM Studio | registry | — | http://localhost:1234/v1 | [pkg/providers/provider_metadata.go:350](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:350) |
| gpt4free / GPT4Free | registry | — | http://localhost:1337/v1 | [pkg/providers/provider_metadata.go:363](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:363) |
| elevenlabs / ElevenLabs ASR | registry | — | https://api.elevenlabs.io | [pkg/providers/provider_metadata.go:377](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:377) |
| venice / Venice AI | registry | — | https://api.venice.ai/api/v1 | [pkg/providers/provider_metadata.go:388](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:388) |
| nearai / NEAR AI Cloud | registry | — | https://cloud-api.near.ai/v1<br>zai-org/GLM-5.1-FP8<br>openai/gpt-oss-120b<br>Qwen/Qwen3-30B-A3B-Instruct-2507<br>Qwen/Qwen3.6-35B-A3B-FP8 | [pkg/providers/provider_metadata.go:400](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:400) |
| shengsuanyun / ShengsuanYun | registry | — | https://router.shengsuanyun.com/api/v1 | [pkg/providers/provider_metadata.go:418](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:418) |
| siliconflow / SiliconFlow | registry | — | https://api.siliconflow.cn/v1 | [pkg/providers/provider_metadata.go:429](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:429) |
| vivgrid / Vivgrid | registry | — | https://api.vivgrid.com/v1 | [pkg/providers/provider_metadata.go:440](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:440) |
| minimax / MiniMax | registry | — | https://api.minimaxi.com/v1 | [pkg/providers/provider_metadata.go:451](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:451) |
| longcat / LongCat | registry | — | https://api.longcat.chat/openai | [pkg/providers/provider_metadata.go:462](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:462) |
| modelscope / ModelScope | registry | — | https://api-inference.modelscope.cn/v1 | [pkg/providers/provider_metadata.go:473](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:473) |
| mimo / Xiaomi MiMo | registry | — | https://api.xiaomimimo.com/v1<br>mimo-v2.5<br>mimo-v2.5-pro | [pkg/providers/provider_metadata.go:484](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:484) |
| avian / Avian | registry | — | https://api.avian.io/v1 | [pkg/providers/provider_metadata.go:497](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:497) |
| zai / Z.ai | registry | — | https://api.z.ai/api/coding/paas/v4<br>glm-5<br>glm-4.7<br>glm-4.5-air<br>glm-4-flash-250414 | [pkg/providers/provider_metadata.go:508](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:508) |
| alibaba-coding / Alibaba Coding Plan | registry | — | https://coding-intl.dashscope.aliyuncs.com/v1<br>qwen3.6-plus<br>kimi-k2.5<br>glm-5<br>MiniMax-M2.5 | [pkg/providers/provider_metadata.go:521](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:521) |
| alibaba-coding-anthropic / Alibaba Coding Plan (Anthropic) | registry | — | https://coding-intl.dashscope.aliyuncs.com/apps/anthropic<br>qwen3.6-plus<br>kimi-k2.5<br>glm-5<br>MiniMax-M2.5 | [pkg/providers/provider_metadata.go:534](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:534) |
| novita / Novita AI | registry | — | https://api.novita.ai/openai | [pkg/providers/provider_metadata.go:547](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:547) |
| litellm / LiteLLM | registry | — | http://localhost:4000/v1 | [pkg/providers/provider_metadata.go:558](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:558) |
| qwen-us / Qwen US | registry | — | https://dashscope-us.aliyuncs.com/compatible-mode/v1<br>qwen3.6-max-preview<br>qwen3.6-plus<br>qwen3.6-flash<br>qwen3-coder-next | [pkg/providers/provider_metadata.go:569](/Users/wandl/workspaces/workspace-agent-fabric/research/picoclaw/pkg/providers/provider_metadata.go:569) |

### ZCode

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| zai-api / Z.ai Coding Plan | preset | anthropic-messages | https://api.z.ai/api/anthropic<br>GLM-5.3<br>GLM-5.3-Flash | [config/provider/zcode-builtin.json:8](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:8) |
| zai-standard-api / Z.ai API | preset | openai-chat-completions | https://api.z.ai/api/paas/v4<br>GLM-5.3<br>GLM-5.3-Flash<br>GLM-5V-Turbo<br>GLM-5.1<br>GLM-5.1-Highspeed<br>GLM-5<br>GLM-5-Turbo<br>GLM-4.7<br>GLM-4.7-FlashX<br>GLM-4.7-Flash<br>GLM-4.6<br>GLM-4.5-Air<br>GLM-4.5<br>GLM-4.6V<br>GLM-4.6V-Flash<br>GLM-4.6V-FlashX<br>GLM-4.1V-Thinking-FlashX<br>GLM-4.1V-Thinking-Flash<br>GLM-4-FlashX-250414<br>GLM-4-Flash-250414<br>GLM-4V-Flash<br>codegeex-4<br>charglm-4<br>emohaa | [config/provider/zcode-builtin.json:30](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:30) |
| bigmodel-api / BigModel Coding Plan | preset | anthropic-messages | https://open.bigmodel.cn/api/anthropic<br>GLM-5.3<br>GLM-5.3-Flash | [config/provider/zcode-builtin.json:77](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:77) |
| bigmodel-standard-api / BigModel API | preset | openai-chat-completions | https://open.bigmodel.cn/api/paas/v4<br>GLM-5.3<br>GLM-5.3-Flash<br>GLM-5V-Turbo<br>GLM-5.1<br>GLM-5.1-Highspeed<br>GLM-5<br>GLM-5-Turbo<br>GLM-4.7<br>GLM-4.7-FlashX<br>GLM-4.7-Flash<br>GLM-4.6<br>GLM-4.5-Air<br>GLM-4.5<br>GLM-4.6V<br>GLM-4.6V-Flash<br>GLM-4.6V-FlashX<br>GLM-4.1V-Thinking-FlashX<br>GLM-4.1V-Thinking-Flash<br>GLM-4-FlashX-250414<br>GLM-4-Flash-250414<br>GLM-4V-Flash<br>codegeex-4<br>charglm-4<br>emohaa | [config/provider/zcode-builtin.json:99](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:99) |
| moonshot-kimi / Kimi | preset | anthropic-messages | https://api.moonshot.cn/anthropic<br>kimi-k3<br>kimi-k2.7-code<br>kimi-k2.6<br>kimi-k2.7-code-highspeed<br>k3<br>k3-256k | [config/provider/zcode-builtin.json:146](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:146) |
| minimax / MiniMax | preset | anthropic-messages | https://api.minimaxi.com/anthropic<br>MiniMax-M3<br>MiniMax-M2.7<br>MiniMax-M2.7-highspeed<br>MiniMax-M2.5<br>MiniMax-M2.5-highspeed<br>MiniMax-M2.1<br>MiniMax-M2.1-highspeed<br>MiniMax-M2 | [config/provider/zcode-builtin.json:175](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:175) |
| deepseek / DeepSeek | preset | anthropic-messages | https://api.deepseek.com/anthropic<br>deepseek-flash<br>deepseek-v4-pro | [config/provider/zcode-builtin.json:206](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:206) |
| qwen-alibaba-model-studio-cn / 阿里云百炼（中国） | preset | anthropic-messages | https://dashscope.aliyuncs.com/apps/anthropic<br>qwen3.8-max<br>qwen3.8-flash<br>qwen3.7-max<br>qwen3.7-plus<br>qwen3.7-flash<br>qwen3.6-plus<br>qwen3.6-flash<br>qwen3.5-plus<br>qwen3.5-flash<br>qwen3-max<br>qwen-plus<br>qwen-flash<br>qwen3-vl-plus | [config/provider/zcode-builtin.json:228](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:228) |
| qwen-alibaba-model-studio-intl / 阿里云百炼（国际） | preset | openai-chat-completions | https://dashscope-intl.aliyuncs.com/compatible-mode/v1<br>qwen3.8-max<br>qwen3.8-flash<br>qwen3.8-omni-flash<br>qwen3.7-max<br>qwen3.7-plus<br>qwen3.7-flash<br>qwen3.6-plus<br>qwen3.6-flash<br>qwen3.5-plus<br>qwen3.5-flash<br>qwen3-max<br>qwen-plus<br>qwen-flash<br>qwen3-vl-plus | [config/provider/zcode-builtin.json:264](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:264) |
| xiaomi-mimo / Xiaomi MiMo | preset | anthropic-messages | https://api.xiaomimimo.com/anthropic<br>mimo-v2.5-pro<br>mimo-v2.5 | [config/provider/zcode-builtin.json:301](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:301) |
| openai / OpenAI | preset | openai-responses | https://api.openai.com/v1<br>gpt-6-astra<br>gpt-5.6-sol<br>gpt-5.6-terra<br>gpt-5.6-luna<br>gpt-5.6<br>gpt-5.4<br>gpt-5.4-pro<br>gpt-5.4-mini<br>gpt-5.4-nano<br>gpt-5.3-codex | [config/provider/zcode-builtin.json:323](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:323) |
| anthropic / Anthropic | preset | anthropic-messages | https://api.anthropic.com/v1<br>claude-fable-5-1<br>claude-fable-5<br>claude-opus-5<br>claude-sonnet-5<br>claude-haiku-4-5-20251001 | [config/provider/zcode-builtin.json:356](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:356) |
| xai / xAI | preset | openai-responses | https://api.x.ai/v1<br>grok-4.6<br>grok-build-0.1<br>grok-4.3 | [config/provider/zcode-builtin.json:384](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:384) |
| openrouter / OpenRouter | preset | anthropic-messages | https://openrouter.ai/api<br>anthropic/claude-fable-5.1<br>openai/gpt-6-astra<br>openai/gpt-5.6-sol<br>anthropic/claude-opus-5<br>deepseek/deepseek-v4-pro<br>moonshotai/kimi-k3<br>z-ai/glm-5.3<br>qwen/qwen3.8-max<br>minimax/minimax-m3<br>xiaomi/mimo-v2.5-pro<br>x-ai/grok-4.6<br>deepseek/deepseek-v4.1-flash<br>qwen/qwen3.8-max-0902<br>openai/gpt-5.6-terra<br>openai/gpt-5.6-luna<br>openai/gpt-5.6<br>openai/gpt-5.4<br>openai/gpt-5.4-pro<br>openai/gpt-5.4-mini<br>openai/gpt-5.4-nano<br>openai/gpt-5.3-codex<br>anthropic/claude-sonnet-5<br>anthropic/claude-haiku-4.5<br>anthropic/claude-opus-4.8<br>anthropic/claude-opus-4.7<br>anthropic/claude-opus-4.6<br>anthropic/claude-opus-4.5<br>anthropic/claude-sonnet-4.6<br>anthropic/claude-sonnet-4.5<br>deepseek/deepseek-v4-flash<br>moonshotai/kimi-k2.7-code<br>moonshotai/kimi-k2.6<br>moonshotai/kimi-k2.5<br>z-ai/glm-5.3-flash<br>z-ai/glm-5.2<br>z-ai/glm-5.1<br>z-ai/glm-5v-turbo<br>z-ai/glm-5<br>z-ai/glm-5-turbo<br>z-ai/glm-4.7<br>z-ai/glm-4.7-flash<br>z-ai/glm-4.6<br>z-ai/glm-4.6v<br>z-ai/glm-4.5-air<br>z-ai/glm-4.5<br>qwen/qwen3.8-flash<br>qwen/qwen3.7-max<br>qwen/qwen3.7-plus<br>qwen/qwen3.7-flash<br>qwen/qwen3.6-plus<br>qwen/qwen3.6-flash<br>qwen/qwen3.5-plus-20260420<br>qwen/qwen3-vl-plus<br>qwen/qwen3-vl-flash<br>minimax/minimax-m2.7<br>minimax/minimax-m2.5<br>xiaomi/mimo-v2.5<br>x-ai/grok-build-0.1<br>x-ai/grok-4.3 | [config/provider/zcode-builtin.json:406](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:406) |
| opencode-go-chat / OpenCode Go (Chat) | preset | openai-chat-completions | https://opencode.ai/zen/go/v1<br>glm-5.3-flash<br>glm-5.3<br>kimi-k3<br>kimi-k2.7-code<br>deepseek-v4.1-flash<br>deepseek-v4-pro<br>mimo-v2.5<br>mimo-v2.5-pro<br>glm-5.2<br>glm-5.1<br>kimi-k2.6<br>deepseek-v4-flash<br>deepseek-v4-flash-vision-exp<br>hy4-preview<br>hy3 | [config/provider/zcode-builtin.json:488](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:488) |
| opencode-go-messages / OpenCode Go (Anthropic) | preset | anthropic-messages | https://opencode.ai/zen/go/v1<br>minimax-m3<br>qwen3.8-max<br>qwen3.8-flash<br>minimax-m2.7<br>minimax-m2.5<br>qwen3.7-max<br>qwen3.7-plus<br>qwen3.6-plus | [config/provider/zcode-builtin.json:526](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:526) |
| opencode-go-responses / OpenCode Go (Responses) | preset | openai-responses | https://opencode.ai/zen/go/v1<br>gpt-5.6-luna<br>grok-4.6 | [config/provider/zcode-builtin.json:557](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:557) |
| opencode-zen-responses / OpenCode Zen (Responses) | preset | openai-responses | https://opencode.ai/zen/v1<br>gpt-6-astra<br>gpt-5.6-sol<br>gpt-5.6-terra<br>gpt-5.6-luna<br>gpt-5.5<br>gpt-5.5-pro<br>gpt-5.4<br>gpt-5.4-pro<br>gpt-5.4-mini<br>gpt-5.4-nano<br>gpt-5.3-codex<br>gpt-5.3-codex-spark<br>gpt-5.2<br>gpt-5.1 | [config/provider/zcode-builtin.json:582](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:582) |
| opencode-zen-messages / OpenCode Zen (Anthropic) | preset | anthropic-messages | https://opencode.ai/zen/v1<br>claude-fable-5-1<br>claude-fable-5<br>qwen3.7-max<br>qwen3.6-plus<br>qwen3.5-plus<br>claude-opus-5<br>claude-sonnet-5<br>claude-haiku-4-5<br>claude-opus-4-8<br>claude-opus-4-7<br>claude-opus-4-6<br>claude-opus-4-5<br>claude-sonnet-4-6<br>claude-sonnet-4-5<br>qwen3.7-plus | [config/provider/zcode-builtin.json:619](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:619) |
| opencode-zen-chat / OpenCode Zen (Chat) | preset | openai-chat-completions | https://opencode.ai/zen/v1<br>kimi-k3<br>minimax-m3<br>deepseek-v4-pro<br>glm-5.2<br>big-pickle<br>mimo-v2.5-free<br>hy3-free<br>ling-3.0-flash-fin-free<br>nemotron-3-ultra-free<br>muse-spark-1.2-contributor-free<br>minimax-m2.7<br>deepseek-v4-flash<br>glm-5.1<br>nemotron-3.5-lightning-free | [config/provider/zcode-builtin.json:657](/Users/wandl/workspaces/workspace-agent-fabric/research/ZCode/config/provider/zcode-builtin.json:657) |

### zeroclaw

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| openai / openai | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:149](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:149) |
| azure / azure | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:149](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:149) |
| anthropic / anthropic | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:150](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:150) |
| moonshot / moonshot | factory | OpenAI compatible | — | [crates/zeroclaw-config/src/providers.rs:150](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:150) |
| qwen / qwen | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:151](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:151) |
| glm / glm | factory | OpenAI compatible | — | [crates/zeroclaw-config/src/providers.rs:152](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:152) |
| minimax / minimax | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:153](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:153) |
| zai / zai | factory | OpenAI compatible | — | [crates/zeroclaw-config/src/providers.rs:154](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:154) |
| doubao / doubao | factory | OpenAI compatible | https://ark.cn-beijing.volces.com/api/v3 | [crates/zeroclaw-config/src/providers.rs:155](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:155) |
| yi / yi | factory | OpenAI compatible | https://api.lingyiwanwu.com/v1 | [crates/zeroclaw-config/src/providers.rs:156](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:156) |
| hunyuan / hunyuan | factory | OpenAI compatible | https://api.hunyuan.cloud.tencent.com/v1 | [crates/zeroclaw-config/src/providers.rs:157](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:157) |
| qianfan / qianfan | factory | OpenAI compatible | — | [crates/zeroclaw-config/src/providers.rs:158](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:158) |
| baichuan / baichuan | factory | OpenAI compatible | https://api.baichuan-ai.com/v1 | [crates/zeroclaw-config/src/providers.rs:159](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:159) |
| openrouter / openrouter | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:160](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:160) |
| ollama / ollama | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:161](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:161) |
| hailo_ollama / hailo_ollama | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:162](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:162) |
| gemini / gemini | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:163](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:163) |
| gemini_cli / gemini_cli | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:164](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:164) |
| grok_cli / grok_cli | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:165](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:165) |
| bedrock / bedrock | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:166](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:166) |
| telnyx / telnyx | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:167](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:167) |
| together / together | factory | OpenAI compatible | https://api.together.xyz | [crates/zeroclaw-config/src/providers.rs:168](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:168) |
| fireworks / fireworks | factory | OpenAI compatible | https://api.fireworks.ai/inference/v1 | [crates/zeroclaw-config/src/providers.rs:169](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:169) |
| groq / groq | factory | OpenAI compatible | — | [crates/zeroclaw-config/src/providers.rs:170](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:170) |
| mistral / mistral | factory | OpenAI compatible | https://api.mistral.ai/v1 | [crates/zeroclaw-config/src/providers.rs:171](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:171) |
| deepseek / deepseek | factory | OpenAI compatible | https://api.deepseek.com | [crates/zeroclaw-config/src/providers.rs:172](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:172) |
| atomic_chat / atomic_chat | factory | OpenAI compatible | http://127.0.0.1:1337/v1 | [crates/zeroclaw-config/src/providers.rs:173](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:173) |
| cohere / cohere | factory | OpenAI compatible | https://api.cohere.com/compatibility | [crates/zeroclaw-config/src/providers.rs:174](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:174) |
| perplexity / perplexity | factory | OpenAI compatible | https://api.perplexity.ai | [crates/zeroclaw-config/src/providers.rs:175](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:175) |
| xai / xai | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:176](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:176) |
| cerebras / cerebras | factory | OpenAI compatible | https://api.cerebras.ai/v1 | [crates/zeroclaw-config/src/providers.rs:177](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:177) |
| crusoe / crusoe | factory | OpenAI compatible | — | [crates/zeroclaw-config/src/providers.rs:178](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:178) |
| sambanova / sambanova | factory | OpenAI compatible | https://api.sambanova.ai/v1 | [crates/zeroclaw-config/src/providers.rs:179](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:179) |
| hyperbolic / hyperbolic | factory | OpenAI compatible | https://api.hyperbolic.xyz/v1 | [crates/zeroclaw-config/src/providers.rs:180](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:180) |
| deepinfra / deepinfra | factory | OpenAI compatible | https://api.deepinfra.com/v1/openai | [crates/zeroclaw-config/src/providers.rs:181](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:181) |
| huggingface / huggingface | factory | OpenAI compatible | https://router.huggingface.co/v1 | [crates/zeroclaw-config/src/providers.rs:182](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:182) |
| ai21 / ai21 | factory | OpenAI compatible | https://api.ai21.com/studio/v1 | [crates/zeroclaw-config/src/providers.rs:183](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:183) |
| reka / reka | factory | OpenAI compatible | https://api.reka.ai/v1 | [crates/zeroclaw-config/src/providers.rs:184](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:184) |
| baseten / baseten | factory | OpenAI compatible | https://inference.baseten.co/v1 | [crates/zeroclaw-config/src/providers.rs:185](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:185) |
| nscale / nscale | factory | OpenAI compatible | https://inference.api.nscale.com/v1 | [crates/zeroclaw-config/src/providers.rs:186](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:186) |
| anyscale / anyscale | factory | OpenAI compatible | https://api.endpoints.anyscale.com/v1 | [crates/zeroclaw-config/src/providers.rs:187](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:187) |
| nebius / nebius | factory | OpenAI compatible | https://api.tokenfactory.nebius.com/v1 | [crates/zeroclaw-config/src/providers.rs:188](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:188) |
| friendli / friendli | factory | OpenAI compatible | https://api.friendli.ai/serverless/v1 | [crates/zeroclaw-config/src/providers.rs:189](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:189) |
| stepfun / stepfun | factory | OpenAI compatible | https://api.stepfun.com/v1 | [crates/zeroclaw-config/src/providers.rs:190](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:190) |
| aihubmix / aihubmix | factory | OpenAI compatible | https://aihubmix.com/v1 | [crates/zeroclaw-config/src/providers.rs:191](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:191) |
| siliconflow / siliconflow | factory | OpenAI compatible | https://api.siliconflow.com/v1 | [crates/zeroclaw-config/src/providers.rs:192](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:192) |
| astrai / astrai | factory | OpenAI compatible | https://as-trai.com/v1 | [crates/zeroclaw-config/src/providers.rs:193](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:193) |
| avian / avian | factory | OpenAI compatible | https://api.avian.io/v1 | [crates/zeroclaw-config/src/providers.rs:194](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:194) |
| deepmyst / deepmyst | factory | OpenAI compatible | https://api.deepmyst.com/v1 | [crates/zeroclaw-config/src/providers.rs:195](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:195) |
| venice / venice | factory | OpenAI compatible | https://api.venice.ai | [crates/zeroclaw-config/src/providers.rs:196](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:196) |
| nearai / nearai | factory | OpenAI compatible | https://cloud-api.near.ai/v1 | [crates/zeroclaw-config/src/providers.rs:197](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:197) |
| novita / novita | factory | OpenAI compatible | https://api.novita.ai/openai | [crates/zeroclaw-config/src/providers.rs:198](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:198) |
| nvidia / nvidia | factory | OpenAI compatible | https://integrate.api.nvidia.com/v1 | [crates/zeroclaw-config/src/providers.rs:199](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:199) |
| vercel / vercel | factory | OpenAI compatible | — | [crates/zeroclaw-config/src/providers.rs:200](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:200) |
| cloudflare / cloudflare | factory | OpenAI compatible | https://gateway.ai.cloudflare.com/v1 | [crates/zeroclaw-config/src/providers.rs:201](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:201) |
| atlascloud / atlascloud | factory | OpenAI compatible | https://api.atlascloud.ai/v1 | [crates/zeroclaw-config/src/providers.rs:202](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:202) |
| ovh / ovh | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:203](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:203) |
| copilot / copilot | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:204](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:204) |
| lmstudio / lmstudio | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:205](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:205) |
| llamacpp / llamacpp | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:206](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:206) |
| sglang / sglang | factory | OpenAI compatible | http://localhost:30000/v1 | [crates/zeroclaw-config/src/providers.rs:207](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:207) |
| vllm / vllm | factory | OpenAI compatible | http://localhost:8000/v1 | [crates/zeroclaw-config/src/providers.rs:208](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:208) |
| osaurus / osaurus | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:209](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:209) |
| litellm / litellm | factory | OpenAI compatible | http://localhost:4000/v1 | [crates/zeroclaw-config/src/providers.rs:210](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:210) |
| lepton / lepton | factory | OpenAI compatible | https://llama3-1-405b.lepton.run/api/v1 | [crates/zeroclaw-config/src/providers.rs:211](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:211) |
| manifest / manifest | factory | OpenAI compatible | https://app.manifest.build/v1 | [crates/zeroclaw-config/src/providers.rs:212](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:212) |
| morph / morph | factory | OpenAI compatible | https://api.morphllm.com/v1 | [crates/zeroclaw-config/src/providers.rs:213](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:213) |
| github_models / github_models | factory | OpenAI compatible | https://models.github.ai/inference | [crates/zeroclaw-config/src/providers.rs:214](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:214) |
| upstage / upstage | factory | OpenAI compatible | https://api.upstage.ai/v1 | [crates/zeroclaw-config/src/providers.rs:215](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:215) |
| featherless / featherless | factory | OpenAI compatible | https://api.featherless.ai/v1 | [crates/zeroclaw-config/src/providers.rs:216](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:216) |
| arcee / arcee | factory | OpenAI compatible | https://api.arcee.ai/api/v1 | [crates/zeroclaw-config/src/providers.rs:217](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:217) |
| lambda_ai / lambda_ai | factory | OpenAI compatible | https://api.lambda.ai/v1 | [crates/zeroclaw-config/src/providers.rs:218](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:218) |
| inception / inception | factory | OpenAI compatible | https://api.inceptionlabs.ai/v1 | [crates/zeroclaw-config/src/providers.rs:219](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:219) |
| synthetic / synthetic | factory | OpenAI compatible | https://api.synthetic.new/openai/v1 | [crates/zeroclaw-config/src/providers.rs:220](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:220) |
| opencode / opencode | factory | OpenAI compatible | https://opencode.ai/zen/v1 | [crates/zeroclaw-config/src/providers.rs:221](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:221) |
| kilocli / kilocli | factory | specialized / see factory | — | [crates/zeroclaw-config/src/providers.rs:222](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:222) |
| kilo / kilo | factory | OpenAI compatible | https://kilo.ai/docs/gateway<br>https://api.kilo.ai/api/gateway | [crates/zeroclaw-config/src/providers.rs:223](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:223) |
| zerorouter / zerorouter | factory | OpenAI compatible | — | [crates/zeroclaw-config/src/providers.rs:224](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:224) |
| custom / custom | factory | specialized / see factory | https://your-api.com\ | [crates/zeroclaw-config/src/providers.rs:225](/Users/wandl/workspaces/workspace-agent-fabric/research/zeroclaw/crates/zeroclaw-config/src/providers.rs:225) |

### nullclaw

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| groq / Groq | compat | }, | https://api.groq.com/openai/v1 | [src/providers/factory.zig:74](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:74) |
| mistral / Mistral | compat | }, | https://api.mistral.ai/v1 | [src/providers/factory.zig:75](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:75) |
| deepseek / DeepSeek | compat | }, | https://api.deepseek.com | [src/providers/factory.zig:76](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:76) |
| xai / xAI | compat | }, | https://api.x.ai | [src/providers/factory.zig:77](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:77) |
| grok / xAI | compat | }, | https://api.x.ai | [src/providers/factory.zig:78](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:78) |
| cerebras / Cerebras | compat | }, | https://api.cerebras.ai/v1 | [src/providers/factory.zig:79](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:79) |
| perplexity / Perplexity | compat | }, | https://api.perplexity.ai | [src/providers/factory.zig:80](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:80) |
| cohere / Cohere | compat | }, | https://api.cohere.com/compatibility | [src/providers/factory.zig:81](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:81) |
| telnyx / Telnyx | compat | }, | https://api.telnyx.com/v2/ai | [src/providers/factory.zig:82](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:82) |
| venice / Venice | compat | }, | https://api.venice.ai | [src/providers/factory.zig:85](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:85) |
| nearai / NEAR AI Cloud | compat | }, | https://cloud-api.near.ai/v1 | [src/providers/factory.zig:86](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:86) |
| atlas-cloud / Atlas Cloud | compat | }, | https://api.atlascloud.ai/v1 | [src/providers/factory.zig:87](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:87) |
| evolink / Evolink | compat | }, | https://direct.evolink.ai/v1 | [src/providers/factory.zig:88](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:88) |
| edenai / Eden AI | compat | }, | https://api.edenai.run/v3 | [src/providers/factory.zig:89](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:89) |
| vercel / Vercel AI Gateway | compat | }, | https://ai-gateway.vercel.sh/v1 | [src/providers/factory.zig:90](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:90) |
| vercel-ai / Vercel AI Gateway | compat | }, | https://ai-gateway.vercel.sh/v1 | [src/providers/factory.zig:91](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:91) |
| together / Together AI | compat | }, | https://api.together.xyz | [src/providers/factory.zig:92](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:92) |
| together-ai / Together AI | compat | }, | https://api.together.xyz | [src/providers/factory.zig:93](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:93) |
| fireworks / Fireworks AI | compat | , .max_tokens_non_streaming = 4096 }, | https://api.fireworks.ai/inference/v1 | [src/providers/factory.zig:94](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:94) |
| fireworks-ai / Fireworks AI | compat | , .max_tokens_non_streaming = 4096 }, | https://api.fireworks.ai/inference/v1 | [src/providers/factory.zig:95](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:95) |
| huggingface / Hugging Face | compat | }, | https://router.huggingface.co/v1 | [src/providers/factory.zig:96](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:96) |
| aihubmix / AIHubMix | compat | }, | https://aihubmix.com/v1 | [src/providers/factory.zig:97](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:97) |
| siliconflow / SiliconFlow | compat | }, | https://api.siliconflow.cn/v1 | [src/providers/factory.zig:98](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:98) |
| shengsuanyun / ShengSuanYun | compat | }, | https://router.shengsuanyun.com/api/v1 | [src/providers/factory.zig:99](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:99) |
| chutes / Chutes | compat | }, | https://chutes.ai/api/v1 | [src/providers/factory.zig:100](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:100) |
| synthetic / Synthetic | compat | }, | https://api.synthetic.new/openai/v1 | [src/providers/factory.zig:101](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:101) |
| opencode / OpenCode Zen | compat | }, | https://opencode.ai/zen/v1 | [src/providers/factory.zig:102](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:102) |
| opencode-zen / OpenCode Zen | compat | }, | https://opencode.ai/zen/v1 | [src/providers/factory.zig:103](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:103) |
| astrai / Astrai | compat | }, | https://as-trai.com/v1 | [src/providers/factory.zig:104](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:104) |
| poe / Poe | compat | }, | https://api.poe.com/v1 | [src/providers/factory.zig:105](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:105) |
| moonshot / Moonshot | compat | }, | https://api.moonshot.cn/v1 | [src/providers/factory.zig:108](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:108) |
| kimi / Moonshot | compat | }, | https://api.moonshot.cn/v1 | [src/providers/factory.zig:109](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:109) |
| glm / GLM | compat | , .no_responses_fallback = true, .thinking_param = true, .disable_streaming = true }, | https://api.z.ai/api/paas/v4 | [src/providers/factory.zig:110](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:110) |
| zhipu / GLM | compat | , .no_responses_fallback = true, .thinking_param = true, .disable_streaming = true }, | https://api.z.ai/api/paas/v4 | [src/providers/factory.zig:111](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:111) |
| zai / Z.AI | compat | , .thinking_param = true, .disable_streaming = true }, | https://api.z.ai/api/coding/paas/v4 | [src/providers/factory.zig:112](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:112) |
| z.ai / Z.AI | compat | , .thinking_param = true, .disable_streaming = true }, | https://api.z.ai/api/coding/paas/v4 | [src/providers/factory.zig:113](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:113) |
| minimax / MiniMax | compat | , .no_responses_fallback = true, .merge_system_into_user = true, .native_tools = false, .reasoning_split_param = true }, | https://api.minimax.io/v1 | [src/providers/factory.zig:114](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:114) |
| qwen / Qwen | compat | , .enable_thinking_param = true }, | https://dashscope.aliyuncs.com/compatible-mode/v1 | [src/providers/factory.zig:115](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:115) |
| dashscope / Qwen | compat | , .enable_thinking_param = true }, | https://dashscope.aliyuncs.com/compatible-mode/v1 | [src/providers/factory.zig:116](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:116) |
| qianfan / Qianfan | compat | }, | https://aip.baidubce.com | [src/providers/factory.zig:117](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:117) |
| baidu / Qianfan | compat | }, | https://aip.baidubce.com | [src/providers/factory.zig:118](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:118) |
| doubao / Doubao | compat | }, | https://ark.cn-beijing.volces.com/api/v3 | [src/providers/factory.zig:119](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:119) |
| volcengine / Doubao | compat | }, | https://ark.cn-beijing.volces.com/api/v3 | [src/providers/factory.zig:120](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:120) |
| ark / Doubao | compat | }, | https://ark.cn-beijing.volces.com/api/v3 | [src/providers/factory.zig:121](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:121) |
| xiaomi / Xiaomi MiMo | compat | , .auth_style = .custom, .custom_header = "api-key" }, | https://api.xiaomimimo.com/v1 | [src/providers/factory.zig:122](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:122) |
| hunyuan / Hunyuan | compat | }, | https://api.hunyuan.cloud.tencent.com/v1 | [src/providers/factory.zig:123](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:123) |
| tencent / Hunyuan | compat | }, | https://api.hunyuan.cloud.tencent.com/v1 | [src/providers/factory.zig:124](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:124) |
| baichuan / Baichuan | compat | }, | https://api.baichuan-ai.com/v1 | [src/providers/factory.zig:125](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:125) |
| moonshot-cn / Moonshot | compat | }, | https://api.moonshot.cn/v1 | [src/providers/factory.zig:128](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:128) |
| kimi-cn / Moonshot | compat | }, | https://api.moonshot.cn/v1 | [src/providers/factory.zig:129](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:129) |
| glm-cn / GLM | compat | , .no_responses_fallback = true, .thinking_param = true, .disable_streaming = true }, | https://open.bigmodel.cn/api/paas/v4 | [src/providers/factory.zig:130](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:130) |
| zhipu-cn / GLM | compat | , .no_responses_fallback = true, .thinking_param = true, .disable_streaming = true }, | https://open.bigmodel.cn/api/paas/v4 | [src/providers/factory.zig:131](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:131) |
| bigmodel / GLM | compat | , .no_responses_fallback = true, .thinking_param = true, .disable_streaming = true }, | https://open.bigmodel.cn/api/paas/v4 | [src/providers/factory.zig:132](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:132) |
| zai-cn / Z.AI | compat | , .thinking_param = true, .disable_streaming = true }, | https://open.bigmodel.cn/api/coding/paas/v4 | [src/providers/factory.zig:133](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:133) |
| z.ai-cn / Z.AI | compat | , .thinking_param = true, .disable_streaming = true }, | https://open.bigmodel.cn/api/coding/paas/v4 | [src/providers/factory.zig:134](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:134) |
| minimax-cn / MiniMax | compat | , .no_responses_fallback = true, .merge_system_into_user = true, .native_tools = false, .reasoning_split_param = true }, | https://api.minimaxi.com/v1 | [src/providers/factory.zig:135](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:135) |
| minimaxi / MiniMax | compat | , .no_responses_fallback = true, .merge_system_into_user = true, .native_tools = false, .reasoning_split_param = true }, | https://api.minimaxi.com/v1 | [src/providers/factory.zig:136](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:136) |
| moonshot-intl / Moonshot | compat | }, | https://api.moonshot.ai/v1 | [src/providers/factory.zig:139](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:139) |
| moonshot-global / Moonshot | compat | }, | https://api.moonshot.ai/v1 | [src/providers/factory.zig:140](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:140) |
| kimi-intl / Moonshot | compat | }, | https://api.moonshot.ai/v1 | [src/providers/factory.zig:141](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:141) |
| kimi-global / Moonshot | compat | }, | https://api.moonshot.ai/v1 | [src/providers/factory.zig:142](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:142) |
| glm-global / GLM | compat | , .no_responses_fallback = true, .thinking_param = true, .disable_streaming = true }, | https://api.z.ai/api/paas/v4 | [src/providers/factory.zig:143](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:143) |
| zhipu-global / GLM | compat | , .no_responses_fallback = true, .thinking_param = true, .disable_streaming = true }, | https://api.z.ai/api/paas/v4 | [src/providers/factory.zig:144](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:144) |
| zai-global / Z.AI | compat | , .thinking_param = true, .disable_streaming = true }, | https://api.z.ai/api/coding/paas/v4 | [src/providers/factory.zig:145](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:145) |
| z.ai-global / Z.AI | compat | , .thinking_param = true, .disable_streaming = true }, | https://api.z.ai/api/coding/paas/v4 | [src/providers/factory.zig:146](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:146) |
| minimax-intl / MiniMax | compat | , .no_responses_fallback = true, .merge_system_into_user = true, .native_tools = false, .reasoning_split_param = true }, | https://api.minimax.io/v1 | [src/providers/factory.zig:147](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:147) |
| minimax-io / MiniMax | compat | , .no_responses_fallback = true, .merge_system_into_user = true, .native_tools = false, .reasoning_split_param = true }, | https://api.minimax.io/v1 | [src/providers/factory.zig:148](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:148) |
| minimax-global / MiniMax | compat | , .no_responses_fallback = true, .merge_system_into_user = true, .native_tools = false, .reasoning_split_param = true }, | https://api.minimax.io/v1 | [src/providers/factory.zig:149](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:149) |
| qwen-intl / Qwen | compat | , .enable_thinking_param = true }, | https://dashscope-intl.aliyuncs.com/compatible-mode/v1 | [src/providers/factory.zig:150](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:150) |
| dashscope-intl / Qwen | compat | , .enable_thinking_param = true }, | https://dashscope-intl.aliyuncs.com/compatible-mode/v1 | [src/providers/factory.zig:151](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:151) |
| qwen-us / Qwen | compat | , .enable_thinking_param = true }, | https://dashscope-us.aliyuncs.com/compatible-mode/v1 | [src/providers/factory.zig:152](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:152) |
| dashscope-us / Qwen | compat | , .enable_thinking_param = true }, | https://dashscope-us.aliyuncs.com/compatible-mode/v1 | [src/providers/factory.zig:153](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:153) |
| byteplus / BytePlus | compat | }, | https://ark.ap-southeast.bytepluses.com/api/v3 | [src/providers/factory.zig:154](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:154) |
| kimi-code / Kimi Code | compat | }, | https://api.kimi.com/coding/v1 | [src/providers/factory.zig:157](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:157) |
| kimi_coding / Kimi Code | compat | }, | https://api.kimi.com/coding/v1 | [src/providers/factory.zig:158](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:158) |
| volcengine-plan / Doubao | compat | }, | https://ark.cn-beijing.volces.com/api/coding/v3 | [src/providers/factory.zig:159](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:159) |
| byteplus-plan / BytePlus | compat | }, | https://ark.ap-southeast.bytepluses.com/api/coding/v3 | [src/providers/factory.zig:160](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:160) |
| qwen-portal / Qwen Portal | compat | , .enable_thinking_param = true }, | https://portal.qwen.ai/v1 | [src/providers/factory.zig:161](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:161) |
| bedrock / Amazon Bedrock | compat | }, | https://bedrock-runtime.us-east-1.amazonaws.com | [src/providers/factory.zig:164](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:164) |
| aws-bedrock / Amazon Bedrock | compat | }, | https://bedrock-runtime.us-east-1.amazonaws.com | [src/providers/factory.zig:165](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:165) |
| cloudflare / Cloudflare AI Gateway | compat | }, | https://gateway.ai.cloudflare.com/v1 | [src/providers/factory.zig:166](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:166) |
| cloudflare-ai / Cloudflare AI Gateway | compat | }, | https://gateway.ai.cloudflare.com/v1 | [src/providers/factory.zig:167](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:167) |
| copilot / GitHub Copilot | compat | }, | https://api.githubcopilot.com | [src/providers/factory.zig:168](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:168) |
| github-copilot / GitHub Copilot | compat | }, | https://api.githubcopilot.com | [src/providers/factory.zig:169](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:169) |
| nvidia / NVIDIA NIM | compat | }, | https://integrate.api.nvidia.com/v1 | [src/providers/factory.zig:170](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:170) |
| nvidia-nim / NVIDIA NIM | compat | }, | https://integrate.api.nvidia.com/v1 | [src/providers/factory.zig:171](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:171) |
| build.nvidia.com / NVIDIA NIM | compat | }, | https://integrate.api.nvidia.com/v1 | [src/providers/factory.zig:172](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:172) |
| ovhcloud / OVHcloud | compat | }, | https://oai.endpoints.kepler.ai.cloud.ovh.net/v1 | [src/providers/factory.zig:173](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:173) |
| ovh / OVHcloud | compat | }, | https://oai.endpoints.kepler.ai.cloud.ovh.net/v1 | [src/providers/factory.zig:174](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:174) |
| novita / Novita | compat | }, | https://api.novita.ai/openai/v1 | [src/providers/factory.zig:175](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:175) |
| novita-ai / Novita | compat | }, | https://api.novita.ai/openai/v1 | [src/providers/factory.zig:176](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:176) |
| lmstudio / LM Studio | compat | }, | http://localhost:1234/v1 | [src/providers/factory.zig:179](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:179) |
| lm-studio / LM Studio | compat | }, | http://localhost:1234/v1 | [src/providers/factory.zig:180](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:180) |
| vllm / vLLM | compat | }, | http://localhost:8000/v1 | [src/providers/factory.zig:181](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:181) |
| llamacpp / llama.cpp | compat | }, | http://localhost:8080/v1 | [src/providers/factory.zig:182](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:182) |
| llama.cpp / llama.cpp | compat | }, | http://localhost:8080/v1 | [src/providers/factory.zig:183](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:183) |
| sglang / SGLang | compat | }, | http://localhost:30000/v1 | [src/providers/factory.zig:184](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:184) |
| osaurus / Osaurus | compat | }, | http://localhost:1337/v1 | [src/providers/factory.zig:185](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:185) |
| litellm / LiteLLM | compat | }, | http://localhost:4000 | [src/providers/factory.zig:186](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:186) |
| anthropic / anthropic | adapter | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| openai / openai | adapter | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| azure / azure | adapter | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| openrouter / openrouter | adapter | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| ollama / ollama | adapter | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| gemini / gemini | adapter | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| vertex / vertex | adapter | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| claude_cli / claude_cli | runtime | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| codex_cli / codex_cli | runtime | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| gemini_cli / gemini_cli | runtime | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |
| openai_codex / openai_codex | adapter | — | — | [src/providers/factory.zig:1](/Users/wandl/workspaces/workspace-agent-fabric/research/nullclaw/src/providers/factory.zig:1) |

### nanoclaw

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| claude / Claude Agent SDK | runtime | external agent runtime | — | [container/agent-runner/src/providers/index.ts:5](/Users/wandl/workspaces/workspace-agent-fabric/research/nanoclaw/container/agent-runner/src/providers/index.ts:5) |

### microclaw

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| alibaba / Alibaba Cloud (Qwen / DashScope) | preset | OpenAiCompat | https://dashscope.aliyuncs.com/compatible-mode/v1<br>qwen3.8-max<br>qwen3.7-max<br>qwen3.7-plus | [crates/microclaw-engine/src/setup/presets.rs:20](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:20) |
| aliyun-bailian / Alibaba Cloud Bailian | preset | OpenAiCompat | https://coding.dashscope.aliyuncs.com/v1<br>qwen3.8-max<br>qwen3.7-plus<br>qwen3.6-plus | [crates/microclaw-engine/src/setup/presets.rs:27](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:27) |
| anthropic / Anthropic | preset | Anthropic | claude-fable-5<br>claude-opus-5<br>claude-sonnet-5<br>claude-haiku-4-5-20251001 | [crates/microclaw-engine/src/setup/presets.rs:34](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:34) |
| arcee / Arcee AI | preset | OpenAiCompat | https://api.arcee.ai/api/v1<br>trinity-large-thinking<br>trinity-large<br>blitz | [crates/microclaw-engine/src/setup/presets.rs:46](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:46) |
| azure / Microsoft Azure AI | preset | OpenAiCompat | https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT<br>gpt-5.2<br>gpt-5<br>gpt-4.1 | [crates/microclaw-engine/src/setup/presets.rs:53](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:53) |
| bedrock / Amazon AWS Bedrock | preset | OpenAiCompat | https://bedrock-runtime.YOUR-REGION.amazonaws.com/openai/v1<br>anthropic.claude-opus-4-6-v1<br>anthropic.claude-sonnet-4-5-v2<br>anthropic.claude-haiku-4-5-v1 | [crates/microclaw-engine/src/setup/presets.rs:61](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:61) |
| cerebras / Cerebras | preset | OpenAiCompat | https://api.cerebras.ai/v1<br>zai-glm-4.7<br>llama3.3-70b<br>qwen-3-235b | [crates/microclaw-engine/src/setup/presets.rs:72](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:72) |
| chutes / Chutes | preset | OpenAiCompat | https://llm.chutes.ai/v1<br>deepseek-ai/DeepSeek-V3-0324<br>Qwen/Qwen3-Coder-480B-A35B-Instruct | [crates/microclaw-engine/src/setup/presets.rs:79](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:79) |
| cloudflare-ai-gateway / Cloudflare AI Gateway | preset | OpenAiCompat | https://gateway.ai.cloudflare.com/v1/YOUR-ACCOUNT/YOUR-GATEWAY/openai<br>claude-sonnet-4-6<br>gpt-5.2<br>openrouter/auto | [crates/microclaw-engine/src/setup/presets.rs:89](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:89) |
| cohere / Cohere | preset | OpenAiCompat | https://api.cohere.ai/compatibility/v1<br>command-a-03-2025<br>command-r-plus-08-2024<br>command-r-08-2024 | [crates/microclaw-engine/src/setup/presets.rs:96](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:96) |
| custom / Custom (manual config) | preset | OpenAiCompat | custom-model | [crates/microclaw-engine/src/setup/presets.rs:107](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:107) |
| deepinfra / DeepInfra | preset | OpenAiCompat | https://api.deepinfra.com/v1/openai<br>deepseek-ai/DeepSeek-V3.2<br>meta-llama/Meta-Llama-3.1-70B-Instruct<br>Qwen/Qwen2.5-72B-Instruct | [crates/microclaw-engine/src/setup/presets.rs:114](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:114) |
| deepseek / DeepSeek | preset | OpenAiCompat | https://api.deepseek.com/v1<br>deepseek-v4-pro<br>deepseek-v4-flash | [crates/microclaw-engine/src/setup/presets.rs:125](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:125) |
| fireworks / Fireworks AI | preset | OpenAiCompat | https://api.fireworks.ai/inference/v1<br>accounts/fireworks/routers/kimi-k2p5-turbo<br>accounts/fireworks/models/llama-v3p3-70b-instruct<br>accounts/fireworks/models/qwen3-coder | [crates/microclaw-engine/src/setup/presets.rs:132](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:132) |
| google / Google DeepMind | preset | OpenAiCompat | https://generativelanguage.googleapis.com/v1beta/openai<br>gemini-3.7-flash<br>gemini-3.1-pro-preview<br>gemini-3.6-flash<br>gemini-3.5-flash-lite | [crates/microclaw-engine/src/setup/presets.rs:143](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:143) |
| groq / Groq | preset | OpenAiCompat | https://api.groq.com/openai/v1<br>llama-3.3-70b-versatile<br>llama-3.1-70b-versatile<br>mixtral-8x7b-32768 | [crates/microclaw-engine/src/setup/presets.rs:155](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:155) |
| huggingface / Hugging Face | preset | OpenAiCompat | https://router.huggingface.co/v1<br>Qwen/Qwen3-Coder-Next<br>meta-llama/Llama-3.3-70B-Instruct<br>deepseek-ai/DeepSeek-V3 | [crates/microclaw-engine/src/setup/presets.rs:166](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:166) |
| inferrs / Inferrs (local) | preset | OpenAiCompat | http://127.0.0.1:8080/v1<br>google/gemma-4-E2B-it<br>custom-model | [crates/microclaw-engine/src/setup/presets.rs:177](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:177) |
| kilocode / KiloCode | preset | OpenAiCompat | https://api.kilo.ai/api/gateway/<br>kilo/auto<br>kilo/anthropic/claude-sonnet-4.5 | [crates/microclaw-engine/src/setup/presets.rs:184](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:184) |
| litellm / LiteLLM (proxy) | preset | OpenAiCompat | http://localhost:4000<br>claude-opus-4-6<br>gpt-5<br>custom-model | [crates/microclaw-engine/src/setup/presets.rs:191](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:191) |
| lmstudio / LM Studio (local) | preset | OpenAiCompat | http://localhost:1234/v1<br>custom-model | [crates/microclaw-engine/src/setup/presets.rs:198](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:198) |
| minimax / MiniMax | preset | OpenAiCompat | https://api.minimax.io/v1<br>MiniMax-M3<br>MiniMax-M2.7<br>MiniMax-M2.7-highspeed | [crates/microclaw-engine/src/setup/presets.rs:205](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:205) |
| mistral / Mistral AI | preset | OpenAiCompat | https://api.mistral.ai/v1<br>mistral-large-latest<br>mistral-medium-latest<br>ministral-8b-latest | [crates/microclaw-engine/src/setup/presets.rs:212](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:212) |
| moonshot / Moonshot AI (Kimi) | preset | OpenAiCompat | https://api.moonshot.cn/v1<br>kimi-k3<br>kimi-k2.7-code-highspeed<br>kimi-k2.6 | [crates/microclaw-engine/src/setup/presets.rs:223](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:223) |
| nvidia / NVIDIA NIM | preset | OpenAiCompat | https://integrate.api.nvidia.com/v1<br>meta/llama-3.3-70b-instruct<br>meta/llama-3.1-70b-instruct<br>nvidia/llama-3.1-nemotron-ultra-253b-v1 | [crates/microclaw-engine/src/setup/presets.rs:230](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:230) |
| ollama / Ollama (local) | preset | OpenAiCompat | http://127.0.0.1:11434/v1<br>qwen3.6<br>qwen3-coder:30b<br>gpt-oss:20b<br>llama3.3 | [crates/microclaw-engine/src/setup/presets.rs:241](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:241) |
| openai / OpenAI | preset | OpenAiCompat | https://api.openai.com/v1<br>gpt-5.6-sol<br>gpt-5.6-terra<br>gpt-5.6-luna | [crates/microclaw-engine/src/setup/presets.rs:248](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:248) |
| openai-codex / OpenAI Codex | preset | OpenAiCompat | gpt-5.6-sol<br>gpt-5.6-terra<br>gpt-5.6-luna | [crates/microclaw-engine/src/setup/presets.rs:255](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:255) |
| openrouter / OpenRouter | preset | OpenAiCompat | https://openrouter.ai/api/v1<br>openrouter/auto<br>openai/gpt-5.6-sol<br>anthropic/claude-opus-5<br>google/gemini-3.7-flash | [crates/microclaw-engine/src/setup/presets.rs:262](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:262) |
| qianfan / Baidu Qianfan | preset | OpenAiCompat | https://qianfan.baidubce.com/v2<br>deepseek-v3.2<br>ernie-5.0-thinking-preview | [crates/microclaw-engine/src/setup/presets.rs:274](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:274) |
| qwen-portal / Qwen Portal (OAuth) | preset | OpenAiCompat | https://portal.qwen.ai/v1<br>coder-model<br>vision-model<br>qwen3.5-plus | [crates/microclaw-engine/src/setup/presets.rs:281](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:281) |
| sglang / SGLang (local) | preset | OpenAiCompat | http://127.0.0.1:30000/v1<br>custom-model | [crates/microclaw-engine/src/setup/presets.rs:288](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:288) |
| stepfun / StepFun | preset | OpenAiCompat | https://api.stepfun.ai/v1<br>step-3.5-flash<br>step-3.5-pro | [crates/microclaw-engine/src/setup/presets.rs:295](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:295) |
| synthetic / Synthetic | preset | OpenAiCompat | https://api.synthetic.new/openai/v1<br>hf:openai/gpt-oss-120b<br>hf:deepseek-ai/DeepSeek-V3-0324 | [crates/microclaw-engine/src/setup/presets.rs:302](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:302) |
| tencent / Tencent AI Lab | preset | OpenAiCompat | https://api.hunyuan.cloud.tencent.com/v1<br>hunyuan-t1-latest<br>hunyuan-turbos-latest<br>hunyuan-standard-latest | [crates/microclaw-engine/src/setup/presets.rs:309](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:309) |
| together / Together AI | preset | OpenAiCompat | https://api.together.xyz/v1<br>deepseek-ai/DeepSeek-V3<br>meta-llama/Llama-3.3-70B-Instruct-Turbo<br>Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8 | [crates/microclaw-engine/src/setup/presets.rs:320](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:320) |
| venice / Venice | preset | OpenAiCompat | https://api.venice.ai/api/v1<br>kimi-k2-5<br>qwen-3-coder-480b | [crates/microclaw-engine/src/setup/presets.rs:331](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:331) |
| vercel-ai-gateway / Vercel AI Gateway | preset | OpenAiCompat | https://ai-gateway.vercel.sh/v1<br>anthropic/claude-opus-4.6<br>openai/gpt-5.2<br>google/gemini-2.5-pro | [crates/microclaw-engine/src/setup/presets.rs:338](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:338) |
| vllm / vLLM (local) | preset | OpenAiCompat | http://127.0.0.1:8000/v1<br>custom-model | [crates/microclaw-engine/src/setup/presets.rs:349](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:349) |
| volcengine / Volcano Engine (Doubao) | preset | OpenAiCompat | https://ark.cn-beijing.volces.com/api/v3<br>doubao-1.5-pro-256k<br>doubao-pro-32k | [crates/microclaw-engine/src/setup/presets.rs:356](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:356) |
| xai / xAI | preset | OpenAiCompat | https://api.x.ai/v1<br>grok-4<br>grok-4-fast<br>grok-3 | [crates/microclaw-engine/src/setup/presets.rs:363](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:363) |
| xiaomi / Xiaomi (MiMo) | preset | OpenAiCompat | https://api.xiaomimimo.com/v1<br>mimo-v2.5-pro<br>mimo-v2.5<br>mimo-v2-pro<br>mimo-v2-flash<br>mimo-v2-omni | [crates/microclaw-engine/src/setup/presets.rs:370](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:370) |
| zhipu / Zhipu AI (GLM / Z.AI) | preset | OpenAiCompat | https://open.bigmodel.cn/api/paas/v4<br>glm-4.7<br>glm-4.7-flash<br>glm-4.5-air | [crates/microclaw-engine/src/setup/presets.rs:383](/Users/wandl/workspaces/workspace-agent-fabric/research/microclaw/crates/microclaw-engine/src/setup/presets.rs:383) |

### cc-switch

| 原始标识 / 名称 | 证据 | 协议 | 地址 / 模型快照 | 源码 |
| --- | --- | --- | --- | --- |
| Claude Desktop Official / Claude Desktop Official | configuration | anthropic, claude, anthropic | — | [src/config/claudeDesktopProviderPresets.ts:141](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:141) |
| Shengsuanyun / Shengsuanyun | configuration | anthropic, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8, anthropic/claude-haiku-4.5 | — | [src/config/claudeDesktopProviderPresets.ts:156](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:156) |
| PatewayAI / PatewayAI | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:174](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:174) |
| 火山Agentplan / 火山Agentplan | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:187](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:187) |
| BytePlus / BytePlus | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:207](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:207) |
| DouBaoSeed / DouBaoSeed | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:227](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:227) |
| CCSub / CCSub | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:247](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:247) |
| Unity2.ai / Unity2.ai | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:260](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:260) |
| Gemini Native / Gemini Native | configuration | gemini_native, gemini-3.5-flash, gemini-3.5-flash, gemini-3.5-flash, gemini | — | [src/config/claudeDesktopProviderPresets.ts:273](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:273) |
| GitHub Copilot / GitHub Copilot | preset | openai_chat, claude-sonnet-4.6, claude-sonnet-4.6, claude-haiku-4.5 | — | [src/config/claudeDesktopProviderPresets.ts:291](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:291) |
| Codex / Codex | preset | openai_responses, openai | — | [src/config/claudeDesktopProviderPresets.ts:308](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:308) |
| DeepSeek / DeepSeek | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:321](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:321) |
| OpenCode Go / OpenCode Go | configuration | openai_chat | — | [src/config/claudeDesktopProviderPresets.ts:336](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:336) |
| Zhipu GLM / Zhipu GLM | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:352](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:352) |
| Zhipu GLM en / Zhipu GLM en | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:364](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:364) |
| Baidu Qianfan Coding Plan / Baidu Qianfan Coding Plan | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:376](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:376) |
| Bailian / Bailian | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:394](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:394) |
| Bailian For Coding / Bailian For Coding | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:405](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:405) |
| Kimi / Kimi | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:416](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:416) |
| Kimi For Coding / Kimi For Coding | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:432](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:432) |
| StepFun / StepFun | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:444](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:444) |
| StepFun en / StepFun en | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:461](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:461) |
| ModelScope / ModelScope | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:478](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:478) |
| Longcat / Longcat | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:493](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:493) |
| MiniMax / MiniMax | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:509](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:509) |
| MiniMax en / MiniMax en | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:526](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:526) |
| BaiLing / BaiLing | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:543](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:543) |
| AiHubMix / AiHubMix | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:552](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:552) |
| CherryIN / CherryIN | configuration | anthropic, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8, anthropic/claude-haiku-4.5 | — | [src/config/claudeDesktopProviderPresets.ts:566](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:566) |
| SiliconFlow / SiliconFlow | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:582](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:582) |
| SiliconFlow en / SiliconFlow en | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:600](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:600) |
| DMXAPI / DMXAPI | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:618](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:618) |
| PackyCode / PackyCode | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:631](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:631) |
| APIKEY.FUN / APIKEY.FUN | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:648](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:648) |
| APINebula / APINebula | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:662](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:662) |
| AtlasCloud / AtlasCloud | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:676](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:676) |
| SudoCode / SudoCode | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:690](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:690) |
| ClaudeAPI / ClaudeAPI | configuration | anthropic, claudeapi, claudeapi | — | [src/config/claudeDesktopProviderPresets.ts:702](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:702) |
| ClaudeCN / ClaudeCN | configuration | anthropic, claudecn, claudecn | — | [src/config/claudeDesktopProviderPresets.ts:715](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:715) |
| RunAPI / RunAPI | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:728](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:728) |
| RelaxyCode / RelaxyCode | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:741](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:741) |
| Cubence / Cubence | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:752](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:752) |
| AIGoCode / AIGoCode | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:772](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:772) |
| RightCode / RightCode | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:787](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:787) |
| AICodeMirror / AICodeMirror | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:801](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:801) |
| CrazyRouter / CrazyRouter | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:819](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:819) |
| SSSAiCode / SSSAiCode | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:834](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:834) |
| Compshare / Compshare | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:853](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:853) |
| Compshare Coding Plan / Compshare Coding Plan | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:870](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:870) |
| Micu / Micu | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:887](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:887) |
| CTok.ai / CTok.ai | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:902](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:902) |
| E-FlowCode / E-FlowCode | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:916](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:916) |
| OpenRouter / OpenRouter | configuration | anthropic, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8, anthropic/claude-haiku-4.5 | — | [src/config/claudeDesktopProviderPresets.ts:929](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:929) |
| TheRouter / TheRouter | configuration | anthropic, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8, anthropic/claude-haiku-4.5 | — | [src/config/claudeDesktopProviderPresets.ts:946](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:946) |
| Novita AI / Novita AI | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:962](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:962) |
| Nvidia / Nvidia | configuration | openai_chat | — | [src/config/claudeDesktopProviderPresets.ts:979](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:979) |
| PIPELLM / PIPELLM | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:995](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:995) |
| Xiaomi MiMo / Xiaomi MiMo | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:1006](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:1006) |
| Xiaomi MiMo Token Plan (China) / Xiaomi MiMo Token Plan (China) | configuration | anthropic | — | [src/config/claudeDesktopProviderPresets.ts:1022](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeDesktopProviderPresets.ts:1022) |
| Claude Official / Claude Official | preset | claude, anthropic | — | [src/config/claudeProviderPresets.ts:77](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:77) |
| Shengsuanyun / Shengsuanyun | preset | anthropic/claude-sonnet-4.6, anthropic/claude-haiku-4.5, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8 | https://router.shengsuanyun.com/api | [src/config/claudeProviderPresets.ts:93](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:93) |
| PatewayAI / PatewayAI | preset | — | https://api.pateway.ai | [src/config/claudeProviderPresets.ts:113](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:113) |
| 火山Agentplan / 火山Agentplan | preset | — | https://ark.cn-beijing.volces.com/api/coding | [src/config/claudeProviderPresets.ts:129](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:129) |
| BytePlus / BytePlus | preset | — | https://ark.ap-southeast.bytepluses.com/api/coding | [src/config/claudeProviderPresets.ts:151](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:151) |
| DouBaoSeed / DouBaoSeed | preset | — | https://ark.cn-beijing.volces.com/api/compatible | [src/config/claudeProviderPresets.ts:174](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:174) |
| CCSub / CCSub | preset | — | https://www.ccsub.net | [src/config/claudeProviderPresets.ts:197](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:197) |
| Unity2.ai / Unity2.ai | preset | — | https://api.unity2.ai | [src/config/claudeProviderPresets.ts:212](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:212) |
| Gemini Native / Gemini Native | preset | gemini-3.5-flash, gemini-3.5-flash, gemini-3.5-flash, gemini-3.5-flash, gemini_native, gemini | https://generativelanguage.googleapis.com | [src/config/claudeProviderPresets.ts:227](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:227) |
| DeepSeek / DeepSeek | preset | — | https://api.deepseek.com/anthropic | [src/config/claudeProviderPresets.ts:248](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:248) |
| OpenCode Go / OpenCode Go | preset | openai_chat | https://opencode.ai/zen/go | [src/config/claudeProviderPresets.ts:267](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:267) |
| Zhipu GLM / Zhipu GLM | preset | — | https://open.bigmodel.cn/api/anthropic | [src/config/claudeProviderPresets.ts:286](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:286) |
| Zhipu GLM en / Zhipu GLM en | preset | — | https://api.z.ai/api/anthropic | [src/config/claudeProviderPresets.ts:304](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:304) |
| Baidu Qianfan Coding Plan / Baidu Qianfan Coding Plan | preset | — | https://qianfan.baidubce.com/anthropic/coding | [src/config/claudeProviderPresets.ts:322](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:322) |
| Bailian / Bailian | preset | — | https://dashscope.aliyuncs.com/apps/anthropic | [src/config/claudeProviderPresets.ts:342](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:342) |
| Bailian For Coding / Bailian For Coding | preset | — | https://coding.dashscope.aliyuncs.com/apps/anthropic | [src/config/claudeProviderPresets.ts:355](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:355) |
| Kimi / Kimi | preset | — | https://api.moonshot.cn/anthropic | [src/config/claudeProviderPresets.ts:369](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:369) |
| Kimi For Coding / Kimi For Coding | preset | — | https://api.kimi.com/coding/ | [src/config/claudeProviderPresets.ts:387](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:387) |
| StepFun / StepFun | preset | — | https://api.stepfun.com/step_plan | [src/config/claudeProviderPresets.ts:401](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:401) |
| StepFun en / StepFun en | preset | — | https://api.stepfun.ai/step_plan | [src/config/claudeProviderPresets.ts:420](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:420) |
| ModelScope / ModelScope | preset | — | https://api-inference.modelscope.cn | [src/config/claudeProviderPresets.ts:439](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:439) |
| KAT-Coder / KAT-Coder | preset | — | https://vanchin.streamlake.ai/api/gateway/v1/endpoints/${ENDPOINT_ID}/claude-code-proxy | [src/config/claudeProviderPresets.ts:456](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:456) |
| Longcat / Longcat | preset | — | https://api.longcat.chat/anthropic | [src/config/claudeProviderPresets.ts:482](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:482) |
| MiniMax / MiniMax | preset | — | https://api.minimaxi.com/anthropic | [src/config/claudeProviderPresets.ts:502](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:502) |
| MiniMax en / MiniMax en | preset | — | https://api.minimax.io/anthropic | [src/config/claudeProviderPresets.ts:527](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:527) |
| BaiLing / BaiLing | preset | — | https://api.tbox.cn/api/anthropic | [src/config/claudeProviderPresets.ts:552](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:552) |
| AiHubMix / AiHubMix | preset | — | https://aihubmix.com | [src/config/claudeProviderPresets.ts:567](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:567) |
| CherryIN / CherryIN | preset | anthropic/claude-sonnet-4.6, anthropic/claude-haiku-4.5, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8 | https://open.cherryin.net | [src/config/claudeProviderPresets.ts:585](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:585) |
| SiliconFlow / SiliconFlow | preset | — | https://api.siliconflow.cn | [src/config/claudeProviderPresets.ts:603](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:603) |
| SiliconFlow en / SiliconFlow en | preset | — | https://api.siliconflow.com | [src/config/claudeProviderPresets.ts:623](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:623) |
| DMXAPI / DMXAPI | preset | — | https://www.dmxapi.cn | [src/config/claudeProviderPresets.ts:643](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:643) |
| PackyCode / PackyCode | preset | — | https://www.packyapi.com | [src/config/claudeProviderPresets.ts:659](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:659) |
| APIKEY.FUN / APIKEY.FUN | preset | — | https://api.apikey.fun | [src/config/claudeProviderPresets.ts:679](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:679) |
| APINebula / APINebula | preset | — | https://apinebula.com | [src/config/claudeProviderPresets.ts:696](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:696) |
| AtlasCloud / AtlasCloud | preset | — | https://api.atlascloud.ai | [src/config/claudeProviderPresets.ts:713](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:713) |
| SudoCode / SudoCode | preset | — | https://sudocode.us | [src/config/claudeProviderPresets.ts:734](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:734) |
| ClaudeAPI / ClaudeAPI | preset | claudeapi, claudeapi | https://gw.claudeapi.com | [src/config/claudeProviderPresets.ts:749](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:749) |
| ClaudeCN / ClaudeCN | preset | claudecn, claudecn | https://claudecn.top | [src/config/claudeProviderPresets.ts:764](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:764) |
| RunAPI / RunAPI | preset | — | https://runapi.co | [src/config/claudeProviderPresets.ts:779](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:779) |
| RelaxyCode / RelaxyCode | preset | — | https://www.relaxycode.com | [src/config/claudeProviderPresets.ts:794](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:794) |
| Cubence / Cubence | preset | — | https://api.cubence.com | [src/config/claudeProviderPresets.ts:807](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:807) |
| AIGoCode / AIGoCode | preset | — | https://api.aigocode.com | [src/config/claudeProviderPresets.ts:829](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:829) |
| RightCode / RightCode | preset | — | https://www.right.codes/claude | [src/config/claudeProviderPresets.ts:847](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:847) |
| AICodeMirror / AICodeMirror | preset | — | https://api.aicodemirror.com/api/claudecode | [src/config/claudeProviderPresets.ts:863](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:863) |
| CrazyRouter / CrazyRouter | preset | — | https://cn.crazyrouter.com | [src/config/claudeProviderPresets.ts:883](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:883) |
| SSSAiCode / SSSAiCode | preset | — | https://node-hk.sssaicodeapi.com/api | [src/config/claudeProviderPresets.ts:900](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:900) |
| Compshare / Compshare | preset | — | https://api.modelverse.cn | [src/config/claudeProviderPresets.ts:921](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:921) |
| Compshare Coding Plan / Compshare Coding Plan | preset | — | https://cp.compshare.cn | [src/config/claudeProviderPresets.ts:940](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:940) |
| Micu / Micu | preset | — | https://www.micuapi.ai | [src/config/claudeProviderPresets.ts:959](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:959) |
| CTok.ai / CTok.ai | preset | — | https://api.ctok.ai | [src/config/claudeProviderPresets.ts:976](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:976) |
| E-FlowCode / E-FlowCode | preset | — | https://e-flowcode.cc | [src/config/claudeProviderPresets.ts:992](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:992) |
| OpenRouter / OpenRouter | preset | anthropic/claude-sonnet-4.6, anthropic/claude-haiku-4.5, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8 | https://openrouter.ai/api | [src/config/claudeProviderPresets.ts:1014](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1014) |
| TheRouter / TheRouter | preset | anthropic/claude-sonnet-4.6, anthropic/claude-haiku-4.5, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8 | https://api.therouter.ai | [src/config/claudeProviderPresets.ts:1032](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1032) |
| Novita AI / Novita AI | preset | — | https://api.novita.ai/anthropic | [src/config/claudeProviderPresets.ts:1050](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1050) |
| GitHub Copilot / GitHub Copilot | preset | claude-sonnet-4.6, claude-haiku-4.5, claude-sonnet-4.6, claude-sonnet-4.6, openai_chat | https://api.githubcopilot.com | [src/config/claudeProviderPresets.ts:1069](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1069) |
| Codex / Codex | preset | openai_responses, openai | https://chatgpt.com/backend-api/codex | [src/config/claudeProviderPresets.ts:1088](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1088) |
| Nvidia / Nvidia | preset | openai_chat | https://integrate.api.nvidia.com | [src/config/claudeProviderPresets.ts:1109](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1109) |
| PIPELLM / PIPELLM | preset | claude-opus-4-8, claude-haiku-4-5-20251001, claude-sonnet-4-6, claude-opus-4-8 | https://cc-api.pipellm.ai | [src/config/claudeProviderPresets.ts:1128](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1128) |
| Xiaomi MiMo / Xiaomi MiMo | preset | — | https://api.xiaomimimo.com/anthropic | [src/config/claudeProviderPresets.ts:1146](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1146) |
| Xiaomi MiMo Token Plan (China) / Xiaomi MiMo Token Plan (China) | preset | — | https://token-plan-cn.xiaomimimo.com/anthropic | [src/config/claudeProviderPresets.ts:1164](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1164) |
| AWS Bedrock (AKSK) / AWS Bedrock (AKSK) | preset | — | https://bedrock-runtime.${AWS_REGION}.amazonaws.com | [src/config/claudeProviderPresets.ts:1182](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1182) |
| AWS Bedrock (API Key) / AWS Bedrock (API Key) | preset | — | https://bedrock-runtime.${AWS_REGION}.amazonaws.com | [src/config/claudeProviderPresets.ts:1221](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/claudeProviderPresets.ts:1221) |
| OpenAI Official / OpenAI Official | configuration | openai | — | [src/config/codexProviderPresets.ts:89](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:89) |
| Shengsuanyun / Shengsuanyun | configuration | openai/gpt-5.5 | — | [src/config/codexProviderPresets.ts:104](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:104) |
| PatewayAI / PatewayAI | configuration | — | — | [src/config/codexProviderPresets.ts:120](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:120) |
| 火山Agentplan / 火山Agentplan | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:136](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:136) |
| BytePlus / BytePlus | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:163](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:163) |
| DouBaoSeed / DouBaoSeed | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:192](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:192) |
| CCSub / CCSub | configuration | — | — | [src/config/codexProviderPresets.ts:219](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:219) |
| Unity2.ai / Unity2.ai | configuration | — | — | [src/config/codexProviderPresets.ts:235](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:235) |
| Azure OpenAI / Azure OpenAI | configuration | — | — | [src/config/codexProviderPresets.ts:251](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:251) |
| DeepSeek / DeepSeek | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:279](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:279) |
| Zhipu GLM / Zhipu GLM | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:315](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:315) |
| Zhipu GLM en / Zhipu GLM en | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:341](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:341) |
| Baidu Qianfan Coding Plan / Baidu Qianfan Coding Plan | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:367](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:367) |
| Bailian / Bailian | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:391](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:391) |
| Kimi / Kimi | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:422](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:422) |
| Kimi For Coding / Kimi For Coding | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:453](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:453) |
| StepFun / StepFun | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:484](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:484) |
| StepFun en / StepFun en | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:512](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:512) |
| ModelScope / ModelScope | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:540](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:540) |
| Longcat / Longcat | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:570](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:570) |
| MiniMax / MiniMax | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:593](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:593) |
| MiniMax en / MiniMax en | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:628](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:628) |
| BaiLing / BaiLing | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:663](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:663) |
| Xiaomi MiMo / Xiaomi MiMo | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:684](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:684) |
| Xiaomi MiMo Token Plan (China) / Xiaomi MiMo Token Plan (China) | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:714](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:714) |
| SiliconFlow / SiliconFlow | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:744](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:744) |
| SiliconFlow en / SiliconFlow en | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:769](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:769) |
| Novita AI / Novita AI | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:794](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:794) |
| Nvidia / Nvidia | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:824](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:824) |
| AiHubMix / AiHubMix | configuration | — | — | [src/config/codexProviderPresets.ts:854](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:854) |
| CherryIN / CherryIN | configuration | openai/gpt-5.5 | — | [src/config/codexProviderPresets.ts:869](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:869) |
| DMXAPI / DMXAPI | configuration | — | — | [src/config/codexProviderPresets.ts:883](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:883) |
| PackyCode / PackyCode | configuration | — | — | [src/config/codexProviderPresets.ts:897](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:897) |
| APIKEY.FUN / APIKEY.FUN | configuration | openai_responses | — | [src/config/codexProviderPresets.ts:916](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:916) |
| APINebula / APINebula | configuration | openai_responses | — | [src/config/codexProviderPresets.ts:942](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:942) |
| AtlasCloud / AtlasCloud | configuration | openai_chat | — | [src/config/codexProviderPresets.ts:965](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:965) |
| SudoCode / SudoCode | configuration | openai_responses | — | [src/config/codexProviderPresets.ts:993](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:993) |
| ClaudeCN / ClaudeCN | configuration | claudecn, claudecn, claudecn | — | [src/config/codexProviderPresets.ts:1015](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1015) |
| RunAPI / RunAPI | configuration | — | — | [src/config/codexProviderPresets.ts:1030](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1030) |
| RelaxyCode / RelaxyCode | configuration | — | — | [src/config/codexProviderPresets.ts:1045](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1045) |
| Cubence / Cubence | configuration | — | — | [src/config/codexProviderPresets.ts:1058](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1058) |
| AIGoCode / AIGoCode | configuration | — | — | [src/config/codexProviderPresets.ts:1080](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1080) |
| RightCode / RightCode | configuration | — | — | [src/config/codexProviderPresets.ts:1097](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1097) |
| AICodeMirror / AICodeMirror | configuration | — | — | [src/config/codexProviderPresets.ts:1113](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1113) |
| CrazyRouter / CrazyRouter | configuration | — | — | [src/config/codexProviderPresets.ts:1132](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1132) |
| SSSAiCode / SSSAiCode | configuration | — | — | [src/config/codexProviderPresets.ts:1148](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1148) |
| Compshare / Compshare | configuration | — | — | [src/config/codexProviderPresets.ts:1169](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1169) |
| Compshare Coding Plan / Compshare Coding Plan | configuration | — | — | [src/config/codexProviderPresets.ts:1188](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1188) |
| Micu / Micu | configuration | — | — | [src/config/codexProviderPresets.ts:1207](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1207) |
| CTok.ai / CTok.ai | configuration | — | — | [src/config/codexProviderPresets.ts:1224](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1224) |
| E-FlowCode / E-FlowCode | configuration | — | — | [src/config/codexProviderPresets.ts:1241](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1241) |
| PIPELLM / PIPELLM | configuration | — | — | [src/config/codexProviderPresets.ts:1266](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1266) |
| OpenRouter / OpenRouter | configuration | — | — | [src/config/codexProviderPresets.ts:1287](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1287) |
| TheRouter / TheRouter | configuration | openai/gpt-5.3-codex | — | [src/config/codexProviderPresets.ts:1301](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/codexProviderPresets.ts:1301) |
| Google Official / Google Official | preset | gemini, gemini | — | [src/config/geminiProviderPresets.ts:36](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:36) |
| Shengsuanyun / Shengsuanyun | preset | — | https://router.shengsuanyun.com/api | [src/config/geminiProviderPresets.ts:54](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:54) |
| Unity2.ai / Unity2.ai | preset | gemini-3.1-pro, gemini-3.1-pro | https://api.unity2.ai | [src/config/geminiProviderPresets.ts:73](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:73) |
| PackyCode / PackyCode | preset | gemini-3.5-flash, gemini-3.5-flash | https://www.packyapi.com | [src/config/geminiProviderPresets.ts:91](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:91) |
| APIKEY.FUN / APIKEY.FUN | preset | gemini-3.5-flash, gemini-3.5-flash | https://api.apikey.fun | [src/config/geminiProviderPresets.ts:113](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:113) |
| APINebula / APINebula | preset | gemini-3.5-flash, gemini-3.5-flash | https://apinebula.com | [src/config/geminiProviderPresets.ts:133](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:133) |
| SudoCode / SudoCode | preset | gemini-3.1-flash-lite, gemini-3.1-flash-lite | https://sudocode.us | [src/config/geminiProviderPresets.ts:153](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:153) |
| Cubence / Cubence | preset | gemini-3.5-flash, gemini-3.5-flash | https://api.cubence.com | [src/config/geminiProviderPresets.ts:171](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:171) |
| AIGoCode / AIGoCode | preset | gemini-3.5-flash, gemini-3.5-flash | https://api.aigocode.com | [src/config/geminiProviderPresets.ts:196](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:196) |
| AICodeMirror / AICodeMirror | preset | gemini-3.5-flash, gemini-3.5-flash | https://api.aicodemirror.com/api/gemini | [src/config/geminiProviderPresets.ts:216](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:216) |
| CrazyRouter / CrazyRouter | preset | gemini-3.5-flash, gemini-3.5-flash | https://cn.crazyrouter.com | [src/config/geminiProviderPresets.ts:239](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:239) |
| SSSAiCode / SSSAiCode | preset | gemini-3.5-flash, gemini-3.5-flash | https://node-hk.sssaicodeapi.com/api | [src/config/geminiProviderPresets.ts:259](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:259) |
| CTok.ai / CTok.ai | preset | gemini-3.5-flash, gemini-3.5-flash | https://api.ctok.ai/v1beta | [src/config/geminiProviderPresets.ts:283](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:283) |
| E-FlowCode / E-FlowCode | preset | gemini-3.5-flash, gemini-api-key, gemini-3.5-flash | https://e-flowcode.cc | [src/config/geminiProviderPresets.ts:303](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:303) |
| CherryIN / CherryIN | preset | — | https://open.cherryin.net | [src/config/geminiProviderPresets.ts:338](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:338) |
| OpenRouter / OpenRouter | preset | gemini-3.5-flash, gemini-3.5-flash | https://openrouter.ai/api | [src/config/geminiProviderPresets.ts:356](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:356) |
| TheRouter / TheRouter | preset | gemini-3.5-flash, gemini-3.5-flash | https://api.therouter.ai | [src/config/geminiProviderPresets.ts:373](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:373) |
| 自定义 / 自定义 | preset | gemini-3.5-flash, gemini-3.5-flash | — | [src/config/geminiProviderPresets.ts:389](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/geminiProviderPresets.ts:389) |
| Shengsuanyun / Shengsuanyun | preset | openai/gpt-5.5, openai/gpt-5.5 | https://router.shengsuanyun.com/api/v1 | [src/config/hermesProviderPresets.ts:132](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:132) |
| 火山Agentplan / 火山Agentplan | preset | anthropic_messages | https://ark.cn-beijing.volces.com/api/coding | [src/config/hermesProviderPresets.ts:152](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:152) |
| BytePlus / BytePlus | preset | anthropic_messages | https://ark.ap-southeast.bytepluses.com/api/coding | [src/config/hermesProviderPresets.ts:182](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:182) |
| DouBaoSeed / DouBaoSeed | preset | anthropic_messages | https://ark.cn-beijing.volces.com/api/compatible | [src/config/hermesProviderPresets.ts:212](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:212) |
| CCSub / CCSub | preset | — | https://www.ccsub.net/v1 | [src/config/hermesProviderPresets.ts:242](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:242) |
| Unity2.ai / Unity2.ai | preset | — | https://api.unity2.ai/v1 | [src/config/hermesProviderPresets.ts:267](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:267) |
| OpenRouter / OpenRouter | preset | anthropic/claude-opus-4-8, anthropic/claude-sonnet-4-6, anthropic/claude-haiku-4-5, openai/gpt-5.5, anthropic/claude-opus-4-8 | https://openrouter.ai/api/v1 | [src/config/hermesProviderPresets.ts:292](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:292) |
| DeepSeek / DeepSeek | preset | — | https://api.deepseek.com | [src/config/hermesProviderPresets.ts:337](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:337) |
| Together AI / Together AI | preset | — | https://api.together.xyz/v1 | [src/config/hermesProviderPresets.ts:367](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:367) |
| Nous Research / Nous Research | preset | — | https://inference-api.nousresearch.com/v1 | [src/config/hermesProviderPresets.ts:405](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:405) |
| Zhipu GLM / Zhipu GLM | preset | — | https://open.bigmodel.cn/api/coding/paas/v4 | [src/config/hermesProviderPresets.ts:441](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:441) |
| Zhipu GLM en / Zhipu GLM en | preset | — | https://api.z.ai/api/coding/paas/v4 | [src/config/hermesProviderPresets.ts:459](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:459) |
| Bailian / Bailian | preset | — | https://dashscope.aliyuncs.com/compatible-mode/v1 | [src/config/hermesProviderPresets.ts:477](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:477) |
| Bailian For Coding / Bailian For Coding | preset | anthropic_messages | https://coding.dashscope.aliyuncs.com/apps/anthropic | [src/config/hermesProviderPresets.ts:497](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:497) |
| Kimi / Kimi | preset | — | https://api.moonshot.cn/v1 | [src/config/hermesProviderPresets.ts:517](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:517) |
| Kimi For Coding / Kimi For Coding | preset | anthropic_messages | https://api.kimi.com/coding/ | [src/config/hermesProviderPresets.ts:535](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:535) |
| StepFun / StepFun | preset | — | https://api.stepfun.ai/v1 | [src/config/hermesProviderPresets.ts:553](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:553) |
| ModelScope / ModelScope | preset | — | https://api-inference.modelscope.cn/v1 | [src/config/hermesProviderPresets.ts:571](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:571) |
| KAT-Coder / KAT-Coder | preset | anthropic_messages | https://vanchin.streamlake.ai/api/gateway/v1/endpoints/${ENDPOINT_ID}/claude-code-proxy | [src/config/hermesProviderPresets.ts:588](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:588) |
| Longcat / Longcat | preset | — | https://api.longcat.chat/openai/v1 | [src/config/hermesProviderPresets.ts:617](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:617) |
| MiniMax / MiniMax | preset | — | https://api.minimaxi.com/v1 | [src/config/hermesProviderPresets.ts:635](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:635) |
| MiniMax en / MiniMax en | preset | — | https://api.minimax.io/v1 | [src/config/hermesProviderPresets.ts:655](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:655) |
| BaiLing / BaiLing | preset | anthropic_messages | https://api.tbox.cn/api/anthropic | [src/config/hermesProviderPresets.ts:675](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:675) |
| AiHubMix / AiHubMix | preset | — | https://aihubmix.com/v1 | [src/config/hermesProviderPresets.ts:690](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:690) |
| CherryIN / CherryIN | preset | anthropic_messages, anthropic/claude-opus-4.8, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8 | https://open.cherryin.net | [src/config/hermesProviderPresets.ts:708](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:708) |
| SiliconFlow / SiliconFlow | preset | — | https://api.siliconflow.cn/v1 | [src/config/hermesProviderPresets.ts:728](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:728) |
| SiliconFlow en / SiliconFlow en | preset | — | https://api.siliconflow.com/v1 | [src/config/hermesProviderPresets.ts:756](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:756) |
| DMXAPI / DMXAPI | preset | — | https://www.dmxapi.cn/v1 | [src/config/hermesProviderPresets.ts:779](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:779) |
| PackyCode / PackyCode | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://www.packyapi.com | [src/config/hermesProviderPresets.ts:797](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:797) |
| APIKEY.FUN / APIKEY.FUN | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5, claude-opus-4-8 | https://api.apikey.fun | [src/config/hermesProviderPresets.ts:820](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:820) |
| APINebula / APINebula | preset | — | https://apinebula.com/v1 | [src/config/hermesProviderPresets.ts:855](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:855) |
| AtlasCloud / AtlasCloud | preset | — | https://api.atlascloud.ai/v1 | [src/config/hermesProviderPresets.ts:879](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:879) |
| SudoCode / SudoCode | preset | — | https://sudocode.us/v1 | [src/config/hermesProviderPresets.ts:903](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:903) |
| Cubence / Cubence | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://api.cubence.com | [src/config/hermesProviderPresets.ts:925](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:925) |
| ClaudeCN / ClaudeCN | preset | claudecn, anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5, claudecn, claudecn, claude-sonnet-4-6 | https://claudecn.top | [src/config/hermesProviderPresets.ts:949](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:949) |
| RunAPI / RunAPI | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5, claude-sonnet-4-6 | https://runapi.co | [src/config/hermesProviderPresets.ts:979](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:979) |
| AIGoCode / AIGoCode | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://api.aigocode.com | [src/config/hermesProviderPresets.ts:1009](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1009) |
| RightCode / RightCode | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://www.right.codes/claude | [src/config/hermesProviderPresets.ts:1033](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1033) |
| AICodeMirror / AICodeMirror | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://api.aicodemirror.com/api/claudecode | [src/config/hermesProviderPresets.ts:1057](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1057) |
| CrazyRouter / CrazyRouter | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://cn.crazyrouter.com | [src/config/hermesProviderPresets.ts:1081](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1081) |
| SSSAiCode / SSSAiCode | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://node-hk.sssaicodeapi.com/api | [src/config/hermesProviderPresets.ts:1105](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1105) |
| Compshare / Compshare | preset | — | https://api.modelverse.cn/v1 | [src/config/hermesProviderPresets.ts:1129](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1129) |
| Compshare Coding Plan / Compshare Coding Plan | preset | — | https://cp.compshare.cn/v1 | [src/config/hermesProviderPresets.ts:1151](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1151) |
| Micu / Micu | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://www.micuapi.ai | [src/config/hermesProviderPresets.ts:1173](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1173) |
| CTok.ai / CTok.ai | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://api.ctok.ai | [src/config/hermesProviderPresets.ts:1197](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1197) |
| E-FlowCode / E-FlowCode | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://e-flowcode.cc | [src/config/hermesProviderPresets.ts:1221](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1221) |
| TheRouter / TheRouter | preset | openai/gpt-5.5, openai/gpt-5.4-mini, openai/gpt-5.4-nano, openai/gpt-5.5 | https://api.therouter.ai/v1 | [src/config/hermesProviderPresets.ts:1243](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1243) |
| Novita AI / Novita AI | preset | — | https://api.novita.ai/v3/openai | [src/config/hermesProviderPresets.ts:1266](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1266) |
| Nvidia / Nvidia | preset | — | https://integrate.api.nvidia.com | [src/config/hermesProviderPresets.ts:1284](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1284) |
| PIPELLM / PIPELLM | preset | anthropic_messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-opus-4-8 | https://cc-api.pipellm.ai | [src/config/hermesProviderPresets.ts:1302](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1302) |
| Xiaomi MiMo / Xiaomi MiMo | preset | — | https://api.xiaomimimo.com/v1 | [src/config/hermesProviderPresets.ts:1326](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1326) |
| Xiaomi MiMo Token Plan (China) / Xiaomi MiMo Token Plan (China) | preset | — | https://token-plan-cn.xiaomimimo.com/v1 | [src/config/hermesProviderPresets.ts:1344](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/hermesProviderPresets.ts:1344) |
| Shengsuanyun / Shengsuanyun | preset | anthropic-messages, anthropic/claude-opus-4.8, anthropic/claude-sonnet-4.6 | https://router.shengsuanyun.com/api | [src/config/openclawProviderPresets.ts:102](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:102) |
| 火山Agentplan / 火山Agentplan | preset | openai-completions | https://ark.cn-beijing.volces.com/api/coding/v3 | [src/config/openclawProviderPresets.ts:148](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:148) |
| BytePlus / BytePlus | preset | openai-completions | https://ark.ap-southeast.bytepluses.com/api/coding/v3 | [src/config/openclawProviderPresets.ts:185](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:185) |
| DouBaoSeed / DouBaoSeed | preset | openai-completions | https://ark.cn-beijing.volces.com/api/v3 | [src/config/openclawProviderPresets.ts:222](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:222) |
| CCSub / CCSub | preset | openai-completions | https://www.ccsub.net/v1 | [src/config/openclawProviderPresets.ts:260](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:260) |
| Unity2.ai / Unity2.ai | preset | openai-completions | https://api.unity2.ai/v1 | [src/config/openclawProviderPresets.ts:297](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:297) |
| DeepSeek / DeepSeek | preset | openai-completions | https://api.deepseek.com/v1 | [src/config/openclawProviderPresets.ts:335](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:335) |
| Zhipu GLM / Zhipu GLM | preset | openai-completions | https://open.bigmodel.cn/api/coding/paas/v4 | [src/config/openclawProviderPresets.ts:379](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:379) |
| Zhipu GLM en / Zhipu GLM en | preset | openai-completions | https://api.z.ai/api/coding/paas/v4 | [src/config/openclawProviderPresets.ts:417](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:417) |
| Qwen Coder / Qwen Coder | preset | openai-completions | https://dashscope.aliyuncs.com/compatible-mode/v1 | [src/config/openclawProviderPresets.ts:455](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:455) |
| Kimi K2.7 Code / Kimi K2.7 Code | preset | openai-completions | https://api.moonshot.cn/v1 | [src/config/openclawProviderPresets.ts:493](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:493) |
| Kimi For Coding / Kimi For Coding | preset | openai-completions | https://api.kimi.com/v1 | [src/config/openclawProviderPresets.ts:532](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:532) |
| StepFun / StepFun | preset | openai-completions | https://api.stepfun.com/step_plan/v1 | [src/config/openclawProviderPresets.ts:571](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:571) |
| StepFun en / StepFun en | preset | openai-completions | https://api.stepfun.ai/step_plan/v1 | [src/config/openclawProviderPresets.ts:616](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:616) |
| MiniMax / MiniMax | preset | openai-completions | https://api.minimaxi.com/v1 | [src/config/openclawProviderPresets.ts:661](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:661) |
| MiniMax en / MiniMax en | preset | openai-completions | https://api.minimax.io/v1 | [src/config/openclawProviderPresets.ts:698](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:698) |
| KAT-Coder / KAT-Coder | preset | openai-completions | https://vanchin.streamlake.ai/api/gateway/v1/endpoints/${ENDPOINT_ID}/openai | [src/config/openclawProviderPresets.ts:735](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:735) |
| Longcat / Longcat | preset | openai-completions | https://api.longcat.chat/v1 | [src/config/openclawProviderPresets.ts:780](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:780) |
| BaiLing / BaiLing | preset | openai-completions | https://api.tbox.cn/v1 | [src/config/openclawProviderPresets.ts:819](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:819) |
| Xiaomi MiMo / Xiaomi MiMo | preset | openai-completions | https://api.xiaomimimo.com/v1 | [src/config/openclawProviderPresets.ts:848](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:848) |
| Xiaomi MiMo Token Plan (China) / Xiaomi MiMo Token Plan (China) | preset | openai-completions | https://token-plan-cn.xiaomimimo.com/v1 | [src/config/openclawProviderPresets.ts:883](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:883) |
| AiHubMix / AiHubMix | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6 | https://aihubmix.com | [src/config/openclawProviderPresets.ts:934](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:934) |
| CherryIN / CherryIN | preset | anthropic-messages, anthropic/claude-opus-4.8, anthropic/claude-sonnet-4.6 | https://open.cherryin.net | [src/config/openclawProviderPresets.ts:978](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:978) |
| DMXAPI / DMXAPI | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6 | https://www.dmxapi.cn | [src/config/openclawProviderPresets.ts:1019](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1019) |
| ClaudeCN / ClaudeCN | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5, claudecn, claudecn, claudecn/claude-sonnet-4-6, claudecn/claude-opus-4-8 | https://claudecn.top | [src/config/openclawProviderPresets.ts:1063](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1063) |
| RunAPI / RunAPI | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5 | https://runapi.co | [src/config/openclawProviderPresets.ts:1111](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1111) |
| OpenRouter / OpenRouter | preset | openai-completions, anthropic/claude-opus-4.8, anthropic/claude-sonnet-4.6 | https://openrouter.ai/api/v1 | [src/config/openclawProviderPresets.ts:1159](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1159) |
| TheRouter / TheRouter | preset | openai-completions, anthropic/claude-sonnet-4.6, openai/gpt-5.3-codex, openai/gpt-5.2 | https://api.therouter.ai/v1 | [src/config/openclawProviderPresets.ts:1203](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1203) |
| ModelScope / ModelScope | preset | openai-completions | https://api-inference.modelscope.cn/v1 | [src/config/openclawProviderPresets.ts:1269](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1269) |
| SiliconFlow / SiliconFlow | preset | openai-completions | https://api.siliconflow.cn/v1 | [src/config/openclawProviderPresets.ts:1307](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1307) |
| SiliconFlow en / SiliconFlow en | preset | openai-completions | https://api.siliconflow.com/v1 | [src/config/openclawProviderPresets.ts:1343](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1343) |
| Novita AI / Novita AI | preset | openai-completions | https://api.novita.ai/openai | [src/config/openclawProviderPresets.ts:1379](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1379) |
| Nvidia / Nvidia | preset | openai-completions | https://integrate.api.nvidia.com/v1 | [src/config/openclawProviderPresets.ts:1413](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1413) |
| PIPELLM / PIPELLM | preset | anthropic-messages, claude-opus-4-8, claude-opus-4-8, claude-sonnet-4-6, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-haiku-4-5-20251001 | https://cc-api.pipellm.ai | [src/config/openclawProviderPresets.ts:1445](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1445) |
| PackyCode / PackyCode | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6 | https://www.packyapi.com | [src/config/openclawProviderPresets.ts:1497](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1497) |
| APIKEY.FUN / APIKEY.FUN | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5 | https://api.apikey.fun | [src/config/openclawProviderPresets.ts:1542](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1542) |
| APINebula / APINebula | preset | openai-completions | https://apinebula.com/v1 | [src/config/openclawProviderPresets.ts:1591](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1591) |
| AtlasCloud / AtlasCloud | preset | openai-completions | https://api.atlascloud.ai/v1 | [src/config/openclawProviderPresets.ts:1623](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1623) |
| SudoCode / SudoCode | preset | openai-responses | https://sudocode.us/v1 | [src/config/openclawProviderPresets.ts:1655](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1655) |
| Cubence / Cubence | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6 | https://api.cubence.com | [src/config/openclawProviderPresets.ts:1685](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1685) |
| AIGoCode / AIGoCode | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6 | https://api.aigocode.com | [src/config/openclawProviderPresets.ts:1731](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1731) |
| RightCode / RightCode | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6 | https://www.right.codes/claude | [src/config/openclawProviderPresets.ts:1777](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1777) |
| AICodeMirror / AICodeMirror | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6 | https://api.aicodemirror.com/api/claudecode | [src/config/openclawProviderPresets.ts:1823](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1823) |
| CrazyRouter / CrazyRouter | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6 | https://cn.crazyrouter.com/v1 | [src/config/openclawProviderPresets.ts:1869](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1869) |
| SSSAiCode / SSSAiCode | preset | anthropic-messages, claude-opus-4-8, claude-sonnet-4-6 | https://node-hk.sssaicodeapi.com/api | [src/config/openclawProviderPresets.ts:1915](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1915) |
| Compshare / Compshare | preset | anthropic-messages, claude-opus-4-8 | https://api.modelverse.cn/v1 | [src/config/openclawProviderPresets.ts:1961](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:1961) |
| Compshare Coding Plan / Compshare Coding Plan | preset | anthropic-messages, claude-opus-4-8 | https://cp.compshare.cn/v1 | [src/config/openclawProviderPresets.ts:2001](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:2001) |
| Micu / Micu | preset | anthropic-messages, claude-opus-4-8 | https://www.micuapi.ai | [src/config/openclawProviderPresets.ts:2041](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:2041) |
| CTok.ai / CTok.ai | preset | anthropic-messages, claude-opus-4-8 | https://api.ctok.ai | [src/config/openclawProviderPresets.ts:2079](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:2079) |
| E-FlowCode / E-FlowCode | preset | openai-responses | https://e-flowcode.cc/v1 | [src/config/openclawProviderPresets.ts:2117](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:2117) |
| AWS Bedrock / AWS Bedrock | preset | anthropic.claude-opus-4-8, anthropic.claude-sonnet-4-6, anthropic.claude-haiku-4-5-20251022-v1:0 | https://bedrock-runtime.us-west-2.amazonaws.com | [src/config/openclawProviderPresets.ts:2180](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:2180) |
| OpenAI Compatible / OpenAI Compatible | preset | openai-completions | — | [src/config/openclawProviderPresets.ts:2215](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/openclawProviderPresets.ts:2215) |
| Shengsuanyun / Shengsuanyun | preset | @ai-sdk/anthropic, anthropic/claude-opus-4.8, anthropic/claude-sonnet-4.6 | https://router.shengsuanyun.com/api/v1 | [src/config/opencodeProviderPresets.ts:282](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:282) |
| 火山Agentplan / 火山Agentplan | preset | @ai-sdk/openai-compatible | https://ark.cn-beijing.volces.com/api/coding/v3 | [src/config/opencodeProviderPresets.ts:312](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:312) |
| BytePlus / BytePlus | preset | @ai-sdk/openai-compatible | https://ark.ap-southeast.bytepluses.com/api/coding/v3 | [src/config/opencodeProviderPresets.ts:345](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:345) |
| DouBaoSeed / DouBaoSeed | preset | @ai-sdk/openai-compatible | https://ark.cn-beijing.volces.com/api/v3 | [src/config/opencodeProviderPresets.ts:378](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:378) |
| CCSub / CCSub | preset | @ai-sdk/openai-compatible | https://www.ccsub.net/v1 | [src/config/opencodeProviderPresets.ts:411](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:411) |
| Unity2.ai / Unity2.ai | preset | @ai-sdk/openai-compatible | https://api.unity2.ai/v1 | [src/config/opencodeProviderPresets.ts:439](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:439) |
| DeepSeek / DeepSeek | preset | @ai-sdk/openai-compatible | https://api.deepseek.com/v1 | [src/config/opencodeProviderPresets.ts:467](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:467) |
| Zhipu GLM / Zhipu GLM | preset | @ai-sdk/openai-compatible | https://open.bigmodel.cn/api/coding/paas/v4 | [src/config/opencodeProviderPresets.ts:494](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:494) |
| Zhipu GLM en / Zhipu GLM en | preset | @ai-sdk/openai-compatible | https://api.z.ai/api/coding/paas/v4 | [src/config/opencodeProviderPresets.ts:527](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:527) |
| Bailian / Bailian | preset | @ai-sdk/openai-compatible | https://dashscope.aliyuncs.com/compatible-mode/v1 | [src/config/opencodeProviderPresets.ts:560](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:560) |
| Kimi K2.7 Code / Kimi K2.7 Code | preset | @ai-sdk/openai-compatible | https://api.moonshot.cn/v1 | [src/config/opencodeProviderPresets.ts:591](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:591) |
| Kimi For Coding / Kimi For Coding | preset | @ai-sdk/anthropic | https://api.kimi.com/coding/v1 | [src/config/opencodeProviderPresets.ts:625](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:625) |
| StepFun / StepFun | preset | @ai-sdk/openai-compatible | https://api.stepfun.com/step_plan/v1 | [src/config/opencodeProviderPresets.ts:659](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:659) |
| StepFun en / StepFun en | preset | @ai-sdk/openai-compatible | https://api.stepfun.ai/step_plan/v1 | [src/config/opencodeProviderPresets.ts:693](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:693) |
| StepFun Step Plan / StepFun Step Plan | preset | @ai-sdk/openai-compatible | https://api.stepfun.com/step_plan/v1 | [src/config/opencodeProviderPresets.ts:726](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:726) |
| ModelScope / ModelScope | preset | @ai-sdk/openai-compatible | https://api-inference.modelscope.cn/v1 | [src/config/opencodeProviderPresets.ts:753](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:753) |
| KAT-Coder / KAT-Coder | preset | @ai-sdk/openai-compatible | https://vanchin.streamlake.ai/api/gateway/v1/endpoints/${ENDPOINT_ID}/openai | [src/config/opencodeProviderPresets.ts:786](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:786) |
| Longcat / Longcat | preset | @ai-sdk/openai-compatible | https://api.longcat.chat/v1 | [src/config/opencodeProviderPresets.ts:827](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:827) |
| MiniMax / MiniMax | preset | @ai-sdk/openai-compatible | https://api.minimaxi.com/v1 | [src/config/opencodeProviderPresets.ts:860](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:860) |
| MiniMax en / MiniMax en | preset | @ai-sdk/openai-compatible | https://api.minimax.io/v1 | [src/config/opencodeProviderPresets.ts:892](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:892) |
| BaiLing / BaiLing | preset | @ai-sdk/openai-compatible | https://api.tbox.cn/v1 | [src/config/opencodeProviderPresets.ts:924](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:924) |
| Xiaomi MiMo / Xiaomi MiMo | preset | @ai-sdk/openai-compatible | https://api.xiaomimimo.com/v1 | [src/config/opencodeProviderPresets.ts:948](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:948) |
| Xiaomi MiMo Token Plan (China) / Xiaomi MiMo Token Plan (China) | preset | @ai-sdk/openai-compatible | https://token-plan-cn.xiaomimimo.com/v1 | [src/config/opencodeProviderPresets.ts:984](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:984) |
| AiHubMix / AiHubMix | preset | @ai-sdk/anthropic, claude-sonnet-4-6, claude-opus-4-8 | https://aihubmix.com/v1 | [src/config/opencodeProviderPresets.ts:1021](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1021) |
| CherryIN / CherryIN | preset | @ai-sdk/anthropic, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8 | https://open.cherryin.net/v1 | [src/config/opencodeProviderPresets.ts:1049](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1049) |
| DMXAPI / DMXAPI | preset | @ai-sdk/anthropic, claude-sonnet-4-6, claude-opus-4-8 | https://www.dmxapi.cn/v1 | [src/config/opencodeProviderPresets.ts:1076](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1076) |
| OpenRouter / OpenRouter | preset | @ai-sdk/anthropic, anthropic/claude-sonnet-4.6, anthropic/claude-opus-4.8 | https://openrouter.ai/api/v1 | [src/config/opencodeProviderPresets.ts:1104](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1104) |
| TheRouter / TheRouter | preset | @ai-sdk/openai-compatible, anthropic/claude-sonnet-4.6, openai/gpt-5.3-codex, openai/gpt-5.2 | https://api.therouter.ai/v1 | [src/config/opencodeProviderPresets.ts:1132](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1132) |
| Novita AI / Novita AI | preset | @ai-sdk/openai-compatible | https://api.novita.ai/openai | [src/config/opencodeProviderPresets.ts:1163](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1163) |
| Nvidia / Nvidia | preset | @ai-sdk/openai-compatible | https://integrate.api.nvidia.com/v1 | [src/config/opencodeProviderPresets.ts:1190](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1190) |
| PIPELLM / PIPELLM | preset | @ai-sdk/anthropic, claude-opus-4-8, claude-opus-4-8, claude-sonnet-4-6, claude-sonnet-4-6, claude-haiku-4-5-20251001, claude-haiku-4-5-20251001 | https://cc-api.pipellm.ai | [src/config/opencodeProviderPresets.ts:1217](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1217) |
| PackyCode / PackyCode | preset | @ai-sdk/anthropic, claude-sonnet-4-6, claude-opus-4-8 | https://www.packyapi.com/v1 | [src/config/opencodeProviderPresets.ts:1246](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1246) |
| APIKEY.FUN / APIKEY.FUN | preset | @ai-sdk/anthropic, claude-opus-4-8, claude-sonnet-4-6, claude-haiku-4-5 | https://api.apikey.fun/v1 | [src/config/opencodeProviderPresets.ts:1275](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1275) |
| APINebula / APINebula | preset | @ai-sdk/openai-compatible | https://apinebula.com/v1 | [src/config/opencodeProviderPresets.ts:1305](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1305) |
| AtlasCloud / AtlasCloud | preset | @ai-sdk/openai-compatible | https://api.atlascloud.ai/v1 | [src/config/opencodeProviderPresets.ts:1333](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1333) |
| SudoCode / SudoCode | preset | @ai-sdk/openai | https://sudocode.us/v1 | [src/config/opencodeProviderPresets.ts:1361](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1361) |
| Cubence / Cubence | preset | @ai-sdk/anthropic, claude-sonnet-4-6, claude-opus-4-8 | https://api.cubence.com/v1 | [src/config/opencodeProviderPresets.ts:1387](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1387) |
| AIGoCode / AIGoCode | preset | @ai-sdk/anthropic, claude-sonnet-4-6, claude-opus-4-8 | https://api.aigocode.com | [src/config/opencodeProviderPresets.ts:1417](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1417) |
| RightCode / RightCode | preset | @ai-sdk/openai | https://right.codes/codex/v1 | [src/config/opencodeProviderPresets.ts:1447](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1447) |
| AICodeMirror / AICodeMirror | preset | @ai-sdk/anthropic, claude-sonnet-4.6, claude-opus-4.8 | https://api.aicodemirror.com/api/claudecode | [src/config/opencodeProviderPresets.ts:1476](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1476) |
| ClaudeCN / ClaudeCN | preset | @ai-sdk/anthropic, claude-sonnet-4-6, claude-opus-4-8, claude-haiku-4-5, claudecn, claudecn | https://claudecn.top | [src/config/opencodeProviderPresets.ts:1506](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1506) |
| RunAPI / RunAPI | preset | @ai-sdk/anthropic, claude-sonnet-4-6, claude-opus-4-8, claude-haiku-4-5 | https://runapi.co | [src/config/opencodeProviderPresets.ts:1536](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1536) |
| CrazyRouter / CrazyRouter | preset | @ai-sdk/anthropic, claude-sonnet-4-6, claude-opus-4-8 | https://cn.crazyrouter.com | [src/config/opencodeProviderPresets.ts:1566](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1566) |
| SSSAiCode / SSSAiCode | preset | @ai-sdk/anthropic, claude-sonnet-4-6, claude-opus-4-8 | https://node-hk.sssaicodeapi.com/api/v1 | [src/config/opencodeProviderPresets.ts:1596](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1596) |
| Micu / Micu | preset | @ai-sdk/anthropic, claude-opus-4-8, claude-sonnet-4-6 | https://www.micuapi.ai/v1 | [src/config/opencodeProviderPresets.ts:1626](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1626) |
| CTok.ai / CTok.ai | preset | @ai-sdk/anthropic, claude-opus-4-8, claude-sonnet-4-6 | https://api.ctok.ai/v1 | [src/config/opencodeProviderPresets.ts:1656](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1656) |
| E-FlowCode / E-FlowCode | preset | @ai-sdk/openai | https://e-flowcode.cc/v1 | [src/config/opencodeProviderPresets.ts:1686](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1686) |
| AWS Bedrock / AWS Bedrock | preset | @ai-sdk/amazon-bedrock | — | [src/config/opencodeProviderPresets.ts:1716](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1716) |
| OpenAI Compatible / OpenAI Compatible | preset | @ai-sdk/openai-compatible | — | [src/config/opencodeProviderPresets.ts:1765](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1765) |
| Oh My OpenCode / Oh My OpenCode | preset | — | — | [src/config/opencodeProviderPresets.ts:1795](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1795) |
| Oh My OpenCode Slim / Oh My OpenCode Slim | preset | — | — | [src/config/opencodeProviderPresets.ts:1808](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/opencodeProviderPresets.ts:1808) |
| NewAPI / NewAPI | preset | — | — | [src/config/universalProviderPresets.ts:62](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/universalProviderPresets.ts:62) |
| 自定义网关 / 自定义网关 | preset | openai | — | [src/config/universalProviderPresets.ts:77](/Users/wandl/workspaces/workspace-agent-fabric/research/cc-switch/src/config/universalProviderPresets.ts:77) |

