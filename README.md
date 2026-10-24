# 五毛钱人生仪表盘 · FIVE-CENT LIFE OS

> 记录得越认真，看板越离谱。

一个**日记 + 数据看板 + 五毛钱特效**的单页 Demo。纯前端、零联网、零 API Key，数据只存在本机。

核心创意是一根**「特效预算」滑杆**：同一个应用，从 ¥0.00 的方格稿纸（克制排版），一路滑到 ¥5.00 的县城大屏（艺术字 + 旋转放射线 + 星星转场 + 合成音效）。用对照制造笑点，也顺手证明我们不是只会做花。

---

## 快速开始

```bash
npm install          # 国内网络可加 --registry=https://registry.npmmirror.com
npm run dev          # http://127.0.0.1:5174
```

生产构建与预览：

```bash
npm run build        # tsc --noEmit + vite build → dist/
npm run preview      # http://127.0.0.1:4174
```

> 端口固定 5174 / 4174（`--strictPort`）。5173 留给别的项目。

## 全部命令

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器（5174） |
| `npm run typecheck` | TypeScript 类型检查（编译门禁第一关） |
| `npm test` | 单元测试（51 条，统计引擎 / 关键词 / 存储 / 分析） |
| `npm run build` | typecheck + 生产构建 |
| `npm run e2e` | 冒烟 + 回归 + 截图（32 条，真实 Chrome） |
| `npm run shots` | 生成 UI 审查截图 → `output/playwright/shots/` |
| `npm run verify` | 上述四关串起来跑一遍 |

## 怎么玩

- **写日记**：`#/write`。选日期 → 写 → 停笔 0.4 秒自动保存。心情、天气、标签都会进看板。
- **数据看板**：`#/dashboard`。战斗力仪表、4 个 KPI、6 张手写 SVG 图、跑马灯。
- **日记本**：`#/entries`。搜索、详情弹窗、删除、导出 JSON、载入示例、清空。
- **拉滑杆**：顶栏右侧「特效预算」，六个档位。或者按 `¥0` / `MAX` 一键对照。
- **快捷键**：`1` `2` `3` 切换视图；`Ctrl/⌘ + Shift + $` 触发彩蛋（直接拉满 ¥5.00）。

## URL 就是状态

每一个界面状态都能被直接打开，方便演示、截图和复盘：

```
http://127.0.0.1:5174/?fx=5#/dashboard     满配看板
http://127.0.0.1:5174/?fx=0#/write         极简稿纸
http://127.0.0.1:5174/?fx=3.5#/entries     默认档位的日记本
```

`fx` 取值：`0` `0.5` `1` `2` `3.5` `5`，非法值就近吸附。

## 技术栈

React 18 + TypeScript + Vite 5，**没有 UI 库、没有图表库、没有字体文件、没有图片资源**。
图表是手写 SVG，特效是 CSS 变量 + 少量 canvas 粒子，音效用 WebAudio 实时合成。

首屏产物：JS 68 KB（gzip）+ CSS 8.3 KB（gzip）。

## 目录

```
src/
├─ lib/        类型、日期、存储、示例数据、统计引擎、关键词、文本分析、音效、URL 状态
├─ charts/     6 张手写 SVG 图 + 几何工具
├─ views/      写日记 / 数据看板 / 日记本 / 详情弹窗
├─ components/ 顶栏、底部导航、弹窗、粒子层、转场、图标
├─ styles/     tokens(6 套视觉令牌) → base → layout → fx(特效层)
└─ test/       单元测试
e2e/           冒烟、回归、截图
docs/          设计说明、演示脚本、测试报告
```

## 文档

- [设计说明](docs/DESIGN.md)：为什么这么做，六档视觉怎么分，哪些地方刻意「土」。
- [演示脚本](docs/DEMO_SCRIPT.md)：90 秒怎么讲，翻车了怎么办。
- [测试报告](docs/QA.md)：门禁结果、用例清单、UI 审查结论。
