# 百年藏历：项目与维护指南

本文档描述 2026-08-10 的当前实现。它替代本文件早期关于“美化版”、横屏优先、渐变背景和未来再添加 PWA/英文版的说明。

## 1. 项目定位与当前状态

百年藏历是一个直接部署到静态托管平台的原生 JavaScript 应用。它不使用前端框架，也没有运行时依赖。Node.js 只用于生成页面、订阅文件和运行验证。

当前状态：

- 查询范围：1951-01-08 至 2051-02-11，共 36,560 个公历日。
- 公共语言：简体中文 `/`、繁体中文 `/tw/`、英文 `/en/`。
- 隐藏测试语言：藏文 `/bo/`，使用 `noindex, follow`，不出现在语言菜单、`hreflang` 或 sitemap。
- 兼容入口：`/zh-tw/` 永久跳转或静态回退到 `/tw/`。
- 资源版本：由 `scripts/release-config.js` 统一控制。
- 自动验证：JavaScript 语法、历法结构、时区、语言、页面结构、PWA、路由配置、生成物一致性和 501 条订阅事件。
- 当前主要缺口：历法测试以结构性检查为主，尚未形成覆盖跨年代、闰月、缺日、重日和边界日期的来源可追溯黄金样本库，见 [TODO.md](TODO.md)。

## 2. 用户看到什么

页面的主信息顺序固定为：

1. 今日或所选日期的藏历摘要。
2. 下一殊胜日。
3. 当月完整月历。
4. 按需展开的年度殊胜日、藏历反查和计算口径。
5. PWA 安装与桌面小组件入口。

桌面内容最大宽度为 1120px，避免月历在大屏上过度横向拉伸。目标视口为 1440×900 和 390×844：两种尺寸都应在首屏看到日期摘要和完整月历。移动端隐藏单元格内的长事件名，只保留标记点；桌面端事件名固定单行，标记点独立排列在下方，避免重叠。

三个工具入口默认全部收起：

- 年度殊胜日首次展开时才计算并渲染列表；当前年份默认展示未来 90 天，可继续展开全年。
- 藏历反查按所选公历年份扫描匹配的藏历月、日，可选择包含闰月。
- 计算口径说明数据来源、时区含义和使用限制。

## 3. 本地运行教程

### 前置条件

- Node.js 22 或更新版本，用于脚本与测试。
- Python 3 或任意静态文件服务器，用于本地预览。

### 第一步：启动页面

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

访问 `http://127.0.0.1:4173/`，即可看到当日藏历与月历。

### 第二步：修改源码

- 修改页面结构或多语言静态文案：编辑 `scripts/generate-pages.js`。
- 修改界面行为：编辑 `js/app.js`。
- 修改视觉：编辑 `css/style.css`。
- 修改历法：编辑 `zangli.js`，并先补对应测试。
- 修改日月食：编辑 `eclipse.js`，同时验证北京时间归档与所在地显示差异。

### 第三步：生成并验证

```bash
npm run generate
npm run verify
```

预期结果包含：

```text
JavaScript syntax checks passed for 14 files.
Product checks passed: locale data, time zones, pages, PWA assets and 501 subscription events.
Generated-file checks passed for 7 files.
```

## 4. 架构

```text
scripts/release-config.js
          │ 统一资源版本
          ▼
scripts/generate-pages.js ───► /, /tw/, /en/, /bo/, widget, sw.js
scripts/generate-subscription.js ───► calendar/zangli-special-days.ics

浏览器加载顺序：
js/langDetect.js
    └─► js/i18n-data.js ─► js/i18n.js
                              └─► zangli.js ─► eclipse.js ─► js/app.js

js/app.js
    ├─► 日期摘要与月历
    ├─► 殊胜日、反查与详情 dialog
    ├─► 分享、提醒和年度导出
    └─► 主题、日期口径、路由和 PWA 注册
```

### 核心模块参考

| 文件 | 责任 | 关键公开接口或产物 |
|---|---|---|
| `zangli.js` | 公历到藏历对照、闰月、缺日、重日、节日 | `startDate`、`endDate`、`getZangli(date)` |
| `eclipse.js` | NASA 日月食数据、北京时间日期索引 | `getEclipse(date)` |
| `js/i18n-data.js` | 简繁转换表、英文和藏文词典 | `window.ZANGLI_*` |
| `js/i18n.js` | 根据路径确定语言并提供翻译 | `window.ZANGLI_LOCALE`、`trans()` |
| `js/langDetect.js` | 根路径首次语言选择、`/zh-tw` 兼容 | `localStorage.zangli-language` |
| `js/app.js` | 主界面状态、渲染、路由、导出与交互 | 浏览器全局脚本，无模块导出 |
| `js/widget.js` | 独立桌面小组件 | `/widget/` |
| `sw.js` | 应用壳预缓存、语言感知离线回退 | `zangli-<ASSET_VERSION>` 缓存 |

这些脚本依赖固定加载顺序和浏览器全局变量。TypeScript 或 ES 模块迁移不能只改扩展名，必须同步调整 HTML 生成器、VM 测试和 Service Worker 构建边界。

## 5. 生成物与源码边界

以下文件由生成脚本维护：

| 生成物 | 来源 |
|---|---|
| `index.html` | `scripts/generate-pages.js` 的 `zh-cn` 配置 |
| `tw/index.html` | `scripts/generate-pages.js` 的 `tw` 配置 |
| `en/index.html` | `scripts/generate-pages.js` 的 `en` 配置 |
| `bo/index.html` | `scripts/generate-pages.js` 的 `bo` 配置 |
| `widget/index.html` | 原文件模板加统一资源版本替换 |
| `sw.js` | 原文件模板加统一资源版本与缓存名替换 |
| `calendar/zangli-special-days.ics` | `scripts/generate-subscription.js` |

`npm run check:generated` 会在临时目录重新生成这 7 个文件并逐字节比较。生成物漂移时，运行 `npm run generate`，不要在检查脚本中绕过差异。

## 6. 路由与语言

| 路径 | 状态 | 日期深链接 |
|---|---|---|
| `/` | 公共简体中文 | `/date/YYYY-MM-DD` |
| `/tw/` | 公共繁体中文 | `/tw/date/YYYY-MM-DD` |
| `/en/` | 公共英文 | `/en/date/YYYY-MM-DD` |
| `/bo/` | 隐藏藏文 Beta | `/bo/date/YYYY-MM-DD` |
| `/widget/` | 公共桌面小组件 | 无 |
| `/zh-tw/` | 兼容重定向 | 重定向到 `/tw/` |

生产环境必须在服务器层将日期深链接回退到对应语言入口。仓库同时维护 `_redirects`、`.htaccess` 和 `nginx.conf`，不能只验证其中一种。

## 7. 日期与时区口径

“设备本地日期”和“北京时间日期”只决定把哪一个公历日传给 `getZangli()`。它们不会按所在地重新推算藏历。

日月食数据按北京时间日期建立索引。详情页可以同时展示设备时区和北京时间，但可见性仍取决于实际地理位置。不要把页面显示的时间描述成用户所在地一定可见的观测预报。

## 8. PWA 与缓存

- 安装时预缓存四个语言入口、小组件、JS、CSS、图标、manifest 和订阅文件。
- 页面导航优先网络，断网时按路径回退到对应语言入口。
- 静态资源优先缓存。
- 只删除 `zangli-` 前缀的旧缓存。
- 404 或其他非成功响应不进入缓存。
- 发布公共资源变化时必须更新 `ASSET_VERSION`，否则已安装 PWA 可能继续使用旧资源。

## 9. 当前测试覆盖与限制

`npm run verify` 当前覆盖：

- 14 个 JavaScript 文件语法有效。
- 36,560 个支持范围内日期都能返回合法的藏历月、日结构。
- 基础历日、日月食和跨时区样本。
- 简体、繁体、英文、藏文页面结构及藏文隐藏策略。
- 日期深链接服务器配置。
- 本地存储不可用时的安全回退代码路径。
- 原生 `dialog`、紧凑首屏、工具默认折叠和事件标记布局约束。
- 501 条 2026–2030 订阅事件及 RFC 行折叠要求。
- 7 个生成文件无漂移。

结构合法不等于历法内容已经逐条与原始历书校验。任何核心历法重构前，先完成 [TODO.md](TODO.md) 的 P0 正确性测试计划。

## 10. 已确认的维护方向

- 保持主页面为高信息密度、低装饰的历书工具，不回到铺满大屏的后台式布局。
- 首屏优先今日、下一殊胜日和完整月历，低频工具按需展开。
- 继续使用原生 JavaScript，直到黄金样本测试具备保护核心数据的能力。
- 生成器是多语言 HTML 的唯一事实来源。
- 藏文版本保持隐藏 Beta，完成语言审校后才能公开。

完整理由和取舍见 [DECISIONS.md](DECISIONS.md)。后续工作见 [TODO.md](TODO.md)。部署步骤见 [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)。

## 11. 历史文档说明

根目录中的 Logo、SEO、语言和 Windows Chrome 专题报告记录了过去的问题与处理过程。它们不是当前架构的事实来源。发生冲突时，以本指南、`AGENTS.md`、`DECISIONS.md`、测试和当前代码为准。
