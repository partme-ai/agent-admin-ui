# Agent Admin UI

[简体中文](README.zh-CN.md) | English

Agent Admin UI is a responsive administration interface for models, knowledge bases, and agents across Web, Desktop, Pad, and Mobile. It is for teams designing an agent control plane and developers reviewing its interaction flows. This is a **front-end prototype**: agent runs and connection checks are local simulations. No real model, knowledge service, or production API is called.

```text
Administrator input
  -> React console: models -> knowledge -> agent configuration
  -> local debug run -> publish configuration
  -> on-screen state, trace, and simulated response
```

The interface focuses on the configuration and local validation of agent workflows. See the [current scope](docs/admin-ui-scope.md) for its acceptance criteria. This repository does not provide an API-backed deployment.

## Quick start

Requirements: Node.js and npm compatible with the lockfile, and Python 3 for preview. The checked environment is Node.js 24.18.0 with npm 12.2.0; this is not a declared minimum.

```bash
git clone https://github.com/partme-ai/agent-admin-ui.git
cd agent-admin-ui
npm ci
npm run build
npm run preview -- --port 5188
```

Open any entry independently, or use the comparison page to switch between the four host layouts:

| Surface | URL |
| --- | --- |
| Web | `http://127.0.0.1:5188/web/index.html#/w/demo/home` |
| Desktop | `http://127.0.0.1:5188/desktop/index.html#/w/demo/home` |
| Pad | `http://127.0.0.1:5188/tablet/index.html#/w/demo/home` |
| Mobile | `http://127.0.0.1:5188/mobile/index.html#/w/demo/home` |
| Tabbed comparison | `http://127.0.0.1:5188/compare.html` |

The server reads generated `dist/` files on `127.0.0.1`; rebuild after source changes. The comparison page shows one host at a time in Web, Desktop, Pad, and Mobile tabs. It keeps the selected page and subview when switching tabs, and provides theme controls, viewport presets, and links to each independent entry. Port `5188` avoids a concurrent preview on the script's default port `5177`.

## Capabilities and boundaries

| Area | Current UI scope |
| --- | --- |
| Workbench | Overview and guided configuration |
| Models | Provider connections, capability defaults, gateway rules, and usage views |
| Knowledge | Knowledge bases, shared spaces, and MCP service configuration |
| Agents | Marketplace, tools, skills, memory, sandbox, local debug, and publishing |
| Resources and system | Storage, users, roles, themes, and branding |

These are UI and local-state flows. A visible provider, tool, or service does not prove a working external connection. Simulated debug output does not prove that a real model or MCP server ran.

Web keeps the full administration navigation, including System. Desktop and Pad use a workspace navigation with account, interconnect, and settings at the bottom; settings opens its own navigation. Mobile uses the compact bottom navigation and full-menu drawer. Dedicated entry pages lock the intended host layout. The root `index.html` remains available for older preview links. Design review sizes are 1280 × 1024 for Web and Desktop, 768 × 1024 for Pad, and 390 × 884 for Mobile. These pages demonstrate the four host interfaces in a browser; this repository does not build native packages.

## Source map

| Path | Responsibility |
| --- | --- |
| `src/main.tsx` | Entry point and page registry |
| `src/catalog.ts`, `src/shell_layout.ts` | Routes and menus |
| `src/pages/` | Pages and dialogs |
| `src/state.ts`, `src/product_state.ts` | Seed and local state |
| `src/agent_linkage.ts` | Deterministic local simulation |
| `src/system_brand.ts`, `src/system_theme_provider.tsx` | Branding and theme |
| `scripts/build.mjs`, `scripts/serve.py` | Build and preview |
| `tests/` | Node-based checks |

The esbuild script generates `dist/index.html`, `dist/web/index.html`, `dist/desktop/index.html`, `dist/tablet/index.html`, `dist/mobile/index.html`, and `dist/compare.html`, plus selected assets and third-party notices.

## Configuration, safety, and verification

Demonstration data is seeded in the browser. Branding and theme use browser `localStorage`; other in-memory state is recreated on reload unless explicitly persisted. Back up browser-local customization before clearing site data. The preview sets `connect-src 'none'`, so it cannot validate live APIs. Do not enter production credentials into prototype forms.

```bash
npm run typecheck
npm test
npm run build
```

If the preview is blank, confirm the build completed and the entry HTML exists in `dist/`. Verify UI behavior in the target browser and actual viewport. CI and native packaging require separate verification.

## Further reading and license

- [Cleanup scope](docs/admin-ui-scope.md)
- [MIT license](LICENSE). Third-party notices remain under `src/vendor/` and generated `dist/licenses/`.
