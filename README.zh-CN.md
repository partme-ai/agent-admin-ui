# Agent Admin UI

简体中文 | [English](README.md)

Agent Admin UI 是适配 Web、Desktop、Pad 和 Mobile 的模型、知识库与智能体管理界面，面向规划智能体管理平台的团队及评审交互流程的开发者。本仓库当前是**前端交互原型**：智能体运行和连接检查由本地逻辑模拟，不调用真实模型、知识服务或生产 API。

```text
管理员输入
  -> React 控制台：模型 -> 知识库 -> 智能体配置
  -> 本地调试 -> 发布配置
  -> 页面状态、执行轨迹和模拟回应
```

界面聚焦智能体工作流的配置与本地验证，验收条件见[当前范围](docs/admin-ui-scope.md)。本仓库尚未提供接入真实 API 的部署版本。

## 快速开始

需要与锁文件兼容的 Node.js、npm，以及用于预览的 Python 3。已检查的环境是 Node.js 24.18.0 和 npm 12.2.0；这不是项目声明的最低版本。

```bash
git clone https://github.com/partme-ai/agent-admin-ui.git
cd agent-admin-ui
npm ci
npm run build
npm run preview -- --port 5188
```

四个入口可分别打开，也可以在对比页按页签切换查看：

| 界面 | 地址 |
| --- | --- |
| Web | `http://127.0.0.1:5188/web/index.html#/w/demo/home` |
| Desktop | `http://127.0.0.1:5188/desktop/index.html#/w/demo/home` |
| Pad | `http://127.0.0.1:5188/tablet/index.html#/w/demo/home` |
| Mobile | `http://127.0.0.1:5188/mobile/index.html#/w/demo/home` |
| 页签对比 | `http://127.0.0.1:5188/compare.html` |

服务从生成的 `dist/` 目录读取文件，仅监听 `127.0.0.1`；修改源码后需重新构建。对比页通过 Web、Desktop、Pad、Mobile 页签一次显示一端，切换时保留当前页面和子页面，并提供主题、视口预设及独立打开。示例使用 `5188`，以避开脚本默认 `5177` 端口上可能已有的预览服务。

## 功能与边界

| 区域 | 当前界面范围 |
| --- | --- |
| 工作台 | 总览和配置引导 |
| 模型 | 服务商连接、能力默认模型、网关规则和使用数据界面 |
| 知识库 | 知识库、共享空间和 MCP 服务配置 |
| 智能体 | 市场、工具、技能、记忆、沙箱、本地调试和发布 |
| 资源与系统 | 存储、用户、角色、主题和系统标识 |

以上是界面与本地状态流程。页面上出现某个服务商、工具或服务，不代表已连接外部系统。模拟调试回应不能证明真实模型或 MCP 服务已运行。

Web 保留包括「系统」在内的完整管理菜单。Desktop 和 Pad 的工作区菜单底部提供账户、互联和设置；设置打开独立的导航。Mobile 使用紧凑的底部导航和完整菜单抽屉。四个专用入口锁定各自的宿主布局，根目录 `index.html` 仍兼容旧预览链接。Web 与 Desktop 的设计核对尺寸为 1280 × 1024，Pad 为 768 × 1024，Mobile 为 390 × 884。这些入口是在浏览器中演示四种宿主界面，本仓库尚不生成原生安装包。

## 源码结构

| 路径 | 职责 |
| --- | --- |
| `src/main.tsx` | 应用入口和页面注册 |
| `src/catalog.ts`、`src/shell_layout.ts` | 路由与菜单 |
| `src/pages/` | 页面与弹窗 |
| `src/state.ts`、`src/product_state.ts` | 演示数据和本地状态 |
| `src/agent_linkage.ts` | 确定性的本地模拟 |
| `src/system_brand.ts`、`src/system_theme_provider.tsx` | 系统标识与主题 |
| `scripts/build.mjs`、`scripts/serve.py` | 构建与预览 |
| `tests/` | 基于 Node 的检查 |

esbuild 脚本生成 `dist/index.html`、`dist/web/index.html`、`dist/desktop/index.html`、`dist/tablet/index.html`、`dist/mobile/index.html` 和 `dist/compare.html`，并复制部分资源与第三方声明。

## 配置、安全与验证

演示数据在浏览器内初始化。系统标识和主题使用浏览器 `localStorage`；除明确持久化的功能外，内存状态会在刷新后重新初始化。清除站点数据前，请保留需要的浏览器本地配置。预览服务设置了 `connect-src 'none'`，不能用于验证真实 API。请勿向原型表单输入生产凭据。

```bash
npm run typecheck
npm test
npm run build
```

预览空白时，先确认构建完成且 `dist/` 中存在对应入口的 HTML。界面行为还需在目标浏览器与真实视口中验证；CI 和原生打包需另行验证。

## 延伸阅读与许可证

- [清理范围](docs/admin-ui-scope.md)
- [MIT 许可证](LICENSE)。第三方声明保留在 `src/vendor/` 和生成的 `dist/licenses/`。
