# TinyBot 命名中国色目录

此目录用于 UI 配色选择。色值为屏幕 sRGB 参考值，不代表实物颜料、印刷或屏幕校色结果；不是故宫机构发布的官方软件接口。

## 当前故宫目录

当前可选的384色以用户指定 Figma 文件为准，详见 [Figma 对齐、差异和兼容说明](FIGMA-ALIGNMENT.md)。以下说明仅属于 `palettes.json` 的历史合并色谱；该文件继续服务于旧 ID 兼容，不能再作为当前 UI 逐色值的说明。

## 历史数据来源和合并规则

用户指定的技能：`dreamina-prompt-text2image`。

- `references/gugong-384-colors.md`：24 节气 × 每节气 16 色，共 384 个色名；只有 20 个不同色名有明确 HEX。
- `references/color-library/chinese-traditional.md`：逐行提取实际 158 条色名及 HEX。沿用九个色系，不依据标题声称的“159 色”虚增一项。
- 故宫目录缺少的 364 个 HEX 使用 [zhiming-chen/chinacolor](https://github.com/zhiming-chen/chinacolor) 的完整有序色谱补齐，固定提交 `c64b9ed6c38375c75943baf414784b6b1b98bb50`，文件 `inst/extdata/chinacolor.json`。该项目采用 MIT，完整许可保留于本目录并随构建复制到 `dist/licenses/chinacolor-MIT.txt`。

保留技能明确提供的 20 个色值；其中 11 个与补充数据不同，以技能为准。这是 TinyBot 合并色谱，不宣称与外部数据逐色相同。384 个位置的名称顺序核对，只有 `枳黄/柘黄` 和 `葱犗/繱犗` 两处字形差异，保留技能写法，对应位置取色。未推算、随机生成或近似填充缺失色值。

`source.json` 记录源文件 SHA-256、固定上游地址、11 项色值差异及两项名称差异。`palettes.json` 仅保存 UI 所需的 ID、中文名、HEX、节气/色系，不复制书籍说明或正文。

## 身份与兼容

故宫色使用 `gugong-001`～`gugong-384`，传统色使用 `traditional-001`～`traditional-158`。同名或同 HEX 的不同来源原始条目继续保留；自 1.41 起仅展示层按 HEX 合并，全部原名及来源作为别名可查。既有 32 色 ID、色值及自定义六位 HEX 完整保留。最终绘制和导出将 ID 解析为 HEX，配置仍只有原来的 `color` 字段。

## 1.45 当前目录归属

本目录 `palettes.json` 中的 158 条传统色记录只用于历史 ID 兼容及同 HEX 别名，不再混入“中国传统色”的可选目录；当前标准色表统一为[指定仓库的 742 色](https://github.com/nevertoday/zhongguo-traditional-colors)。故宫 384 色单独显示为“中国传统色 · 故宫”。

用户补充的[知乎参考文章](https://zhuanlan.zhihu.com/p/271730089)已记录；2026-11-06 直接读取返回 403，浏览器未显示正文，因此未把该文章作为已核实的逐色 HEX 来源，也未据此修改本目录数据。现有故宫色名、色值和指纹保持，详见[当前目录说明](../../../CHINESE-COLOR-CATALOGS.md)。
