# 扩展命名配色 · 1.40

新增 371 个目录条目，保留原来的 574 项，合计 945 项；原始记录不跨目录合并；自 1.41 起，展示层按 HEX 合并，原名、来源与所有旧 ID 完整保留。仅增加前端屏幕配色，不改变形象结构、默认颜色、满怀期待表情或 LaoA 渲染器。

| 目录 | 数量 | 色值来源与范围 |
|---|---:|---|
| 莫兰迪 | 15 | 色名来自用户技能；HEX 为 TinyBot 人工选定的灰调参考配色，不宣称存在统一莫兰迪标准色号。 |
| 通用色名 | 131 | 中文/英文及八组色系来自技能，HEX 对应固定版 meodai/color-names。通用色名并非唯一标准，按当前参考预览显示。 |
| Pantone 参考 | 42 | 32 项按名称精确匹配公开 TCX 色号与 HEX；另 10 项明确标为“近似参考”，采用 TinyBot 设计值，不伪造色号。 |
| RAL 工业色 | 183 | 按技能实际收录的 RAL 四位色号匹配 ieskudero/ral-colors；不是完整 RAL Classic 目录，屏幕参考不作为实体配色依据。 |

## 固定来源

- 用户技能 `dreamina-prompt-text2image/references/color-library/modern-schemes.md`、`pantone.md`、`ral.md`。
- [meodai/color-names](https://github.com/meodai/color-names)，提交 `fff6de4722c625fdffab84c3eef221e52f308f0f`，`src/colornames.csv`，MIT。
- [ieskudero/ral-colors](https://github.com/ieskudero/ral-colors)，提交 `55e9cfc3d0b333af74c56acad6bd1aeee840d83a`，`RAL/classic.js`，MIT。
- [Margaret2/pantone-colors](https://github.com/Margaret2/pantone-colors)，提交 `9cb0b0576778b4ffddfafd3bbf3a752499f18019`，`pantone-numbers.json`。只核对并提取 32 个色名/编号/HEX 事实，不拷贝其软件；仓库未声明许可证，不将其描述为 MIT 或已取得 Pantone 官方授权。

两份 MIT 许可原文保留并随构建输出。来源文件 SHA-256、英文检索别名、近似值清单及修正记录见 `source.json`。不依赖在线色库服务，不安装新依赖。

## 必须保留的证据边界

Pantone 42 项中 10 项尚未核对到准确的对应色号/色值：Sunset Coral、Chocolate Martini、Coffee Quartz、Salted Lime、Green Aneth、Matcha、Pistachio、Winterberry、Cattleya Orchid、Wispy Clouds。为了让本次原型可完整比较，使用显式设计近似值；界面同时显示目录说明和每项“近似参考”。不能称为官方完整色卡或用这些参考值验收实物。

技能将 Crocus 写为“番红花绿”，匹配 `16-3115 TCX / #c67fae` 后在界面纠正为“番红花紫”；旧名称保留为检索别名。其余名称按技能保留。

## 交互

宽屏显示七组目录按钮，窄屏使用带数量的目录选择器。色块下方显示完整中文名，长名称换行；RAL/Pantone 已匹配项显示色号。支持中文、英文、HEX、色号和色系筛选。切目录只浏览，选色才修改草稿；自定义取色和既有保存/导入/导出路径不变。
