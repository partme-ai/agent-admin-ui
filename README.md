# agent-admin-ui
Agent Admin UI ：专为智能体项目定制的管理系统界面

## 当前基础

前端基于 `tinybot-server/web` 的现有版本复制，包含 React、TypeScript、Ant Design、三端响应式界面、系统主题、模型服务、知识库、智能体配置与调试等功能。目前为本地交互原型，尚未接入真实业务服务。

本次保留原有页面、路由、包配置、存储键和第三方资源。原项目完整说明保存在 [TinyBot-Web 原始说明](docs/TinyBot-Web-README.md)，通用化调整后续在本仓库推进。

## 本地开发

```sh
cd /Users/wandl/workspaces/workspace-partme-ai/agent-admin-ui
npm ci
npm run typecheck
npm test
npm run build
npm run preview
```

预览默认使用 `http://127.0.0.1:5177/`，运行前确认该端口未被其他项目占用。依赖目录、构建产物和本机缓存未从源工程复制；安装沿用现有 `package-lock.json`。

## 来源与验证

- 复制源：`/Users/wandl/workspaces/workspace-agent-esp32/tinybot-server/web`
- 复制日期：2026-11-12；包含源工作区当前已保存的未提交文件。
- 本次复制未改变原工程文件；目标仓库保留自己的 Git 历史与许可证。
- 源版本已知有一项测试依赖缺失：`tests/gugong-figma.test.ts` 引用的 `evidence/gugong-figma/colors-audit.json` 不在当前源目录中，本次按源目录状态复制。
