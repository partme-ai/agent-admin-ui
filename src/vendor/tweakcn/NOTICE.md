# tweakcn 界面主题参考

来源：https://github.com/jnsahaj/tweakcn
源文件：https://github.com/jnsahaj/tweakcn/blob/a3b47b37cba97dd637de517aab52c45ec0f83456/utils/theme-presets.ts
固定提交：a3b47b37cba97dd637de517aab52c45ec0f83456
在线编辑器：https://tweakcn.com/editor/theme
获取日期：2026-11-07
许可：Apache-2.0，全文见同目录 LICENSE。

presets.json 只提取所选30套原始主题数据，不执行上游TypeScript。保留全部原始light/dark字段，未擅自改名替换原始键。源文件用 TypeScript AST 白名单（字符串、数字、对象、数组字面量）提取。源仓库许可不等于其每个主题都经过用户审美验收；Claude、Twitter等是上游配方名称，不代表相应厂商官方背书。

TinyBot 改动：仅选择配色角色，字体、间距、圆角、阴影仍按已有antd配置。界面主色/文字在不足4.5:1时调整；侧栏不深于页面时压低，Twitter原深色纯黑页面升至#101214以允许侧栏更深。选中背景和选中文字分别映射；不强迫一个文字色适配两个亮度悬殊的背景。

转换脚本：scripts/generate_interface_themes.mjs，从此目录数据生成 interface_theme_recipes.json。新ID interface-* 不覆盖旧配方。修改后的数据采用上游许可要求保留来源和修改说明。
