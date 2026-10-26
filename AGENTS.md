# AI / 自动化代理接手说明

本文件适用于整个仓库。开始工作前先阅读本文件、`docs/README.md`、`docs/DECISIONS.md` 和 `docs/TODO.md`。

## 当前快照

- 快照日期：2026-10-26。
- 历法核心：2026-10-26 按[审计报告](docs/audits/CALENDAR_CORE_AUDIT_2026-10-26.md)修复节日口径、输入与日序计算、日月食时间尺度，见 `docs/DECISIONS.md` D011–D014。
- 界面基线（D015）：最大内容宽度 1120px；首屏卡片始终是“今天”，下一殊胜日从明天起找；年度殊胜日、藏历反查和计算口径默认收起，年度列表首次打开时才生成。
- 低频工具（D017）：年度殊胜日默认只列年度节日和日月食，有独立年份切换；藏历反查只选月、日，按藏历年列出五年；计算口径为四个短条目。
- 月历状态：红圆 + 浅红底 = 今天，细墨框 = 选中（最近打开过详情的日期），蓝色外框 = 键盘焦点。月历是 `role="grid"`，只占一个 Tab 停靠点，方向键 / Home / End / PageUp / PageDown 移动焦点，Enter 才选中。
- 安装（D016）：页脚“安装到桌面”优先调用浏览器安装弹窗，否则按设备显示步骤；已安装或 Firefox 桌面版不显示。`/widget/` 只为旧书签保留，没有入口。
- 资源版本：`20261026-3`（`scripts/release-config.js`）。
- 已验证视口：1440×900 与 390×844，日期摘要和完整月历均能进入首屏。
- 当前技术：无框架原生 JavaScript、HTML、CSS、Service Worker；Node.js 只用于生成和测试。
- TypeScript 7：已评估，暂不迁移。先补齐 `docs/TODO.md` 的 P0 独立来源样本。
- 当前公开语言：简体中文、繁体中文、英文。藏文 `/bo/` 是隐藏 Beta。

快照可能随提交变化。每次接手仍要运行：

```bash
git status --short
git branch --show-current
git log -5 --oneline
npm run verify
```

## 项目事实

- 支持日期：1951-01-08 至 2051-02-11。
- 藏历数据来源：《藏历、公历、农历对照百年历书（1951–2050）》。
- `zangli.js` 提供 `getZangli(date)`，处理藏历月日、闰月、缺日、重日，并返回节日事件 `events[]`。节日口径：真实月日匹配、年度节日不进闰月、重日取第一天、缺日提前一天。
- `eclipse.js` 提供 `getEclipse(date)`，把 NASA 食甚 TD 换算为 UT 后按北京时间日期索引。
- 不合并上游 `stonelf/zangli` 的前端、小程序或整个 `zangli.js`；审计结论见 `docs/audits/`。
- “设备本地日期 / 北京时间日期”只决定查询哪个公历日，不会重新计算所在地藏历。
- 页面依赖固定的全局脚本顺序：`i18n-data.js` → `i18n.js` → `zangli.js` → `eclipse.js` → `app.js`。

## 事实来源优先级

发生冲突时，按以下顺序判断：

1. 当前代码与自动测试。
2. `docs/DECISIONS.md` 中状态为“已接受”的决策。
3. `docs/README_ENHANCED.md` 和 `docs/DEPLOYMENT_CHECKLIST.md`。
4. `docs/` 中的历史专题报告。

Logo、SEO、语言和 Windows Chrome 专题报告保留的是历史过程，不能直接当成当前实现说明。

## 源码与生成物

不要只修改生成后的入口 HTML。

| 要改变什么 | 修改哪里 |
|---|---|
| 多语言页面结构、静态文案、SEO 元数据 | `scripts/generate-pages.js` |
| 主界面行为 | `js/app.js` |
| 主界面视觉 | `css/style.css` |
| 藏历计算与节日 | `zangli.js` |
| 日月食 | `eclipse.js` |
| 订阅文件 | `scripts/generate-subscription.js` |
| 资源缓存版本 | `scripts/release-config.js` |
| 历法测试与黄金样本 | `scripts/test-calendar.js`、`tests/fixtures/zangli-golden.json` |
| 产品与生成物测试 | `scripts/test-product.js`、`scripts/check-generated.js` |

以下 7 个文件由脚本维护并应随源码一起提交：

- `index.html`
- `tw/index.html`
- `en/index.html`
- `bo/index.html`
- `widget/index.html`
- `sw.js`
- `calendar/zangli-special-days.ics`

修改模板或公共资源后：

```bash
npm run generate
npm run verify
```

## 不可破坏的产品决策

- 首屏的主线是“今日 → 下一殊胜日 → 完整月历”，其他日期用详情弹窗查看。不要在它们前面增加营销区或大标题，也不要用说明文字替代版式（D015）。
- 桌面最大内容宽度保持 1120px，除非有跨视口截图证明更改更好。
- 三个低频工具默认全部收起，并保持互斥展开；不要恢复默认长列表。
- 移动端不显示日历单元格内的长事件名；桌面端事件名与圆点必须分行且不重叠。
- 详情使用原生 `<dialog>`，必须保留 Escape 关闭、焦点循环和焦点恢复。
- 月历状态按形状区分（圆 = 今天、框 = 选中、蓝框 = 焦点），三者可叠加；方向键只移动焦点，不改变选中。
- 安装入口只在页脚，不做自动弹出的安装横幅。
- 藏文 Beta 不进入语言菜单、`hreflang` 或 sitemap，并继续使用 `noindex, follow`。
- Service Worker 只清理 `zangli-` 前缀缓存，不能缓存 404 或其他错误响应。
- 日期深链接要回退到同语言入口，修改路由时同步 `_redirects`、`.htaccess` 和 `nginx.conf`。

完整理由见 `docs/DECISIONS.md`。

## 测试要求

任何提交至少运行：

```bash
npm run verify
git diff --check
```

高风险修改还需要：

- UI：1440×900、390×844 浏览器截图和控制台错误检查。
- 对话框：键盘打开、Tab 循环、Escape 关闭、焦点恢复。
- PWA：在线加载后断网刷新，确认对应语言仍可用且 404 不会离线命中。
- 路由：四种语言的 `/date/YYYY-MM-DD` 直接访问。
- 历法核心：先增加独立来源的黄金样本，再改实现。禁止用当前函数输出反向生成“预期值”。

## 已知缺口

当前测试能证明 36,560 个支持日期的解码与节日规则自洽、不受时区影响，并通过少量独立来源样本（2019、2025 年），但不能证明每个结果都与原始历书一致。项目负责人没有原历书；跨年代、闰月和边界日期的独立来源样本仍是最高优先级工作。

浏览器首屏、折叠面板、离线、焦点、月历键盘导航和安装引导做过人工/无头浏览器验证，但尚未纳入 CI 端到端测试。安装引导只在模拟的 iPhone、微信、Android、Mac Safari 和 Windows Chrome 上验证过，尚未真机验证。

## 文档维护

产品或架构决策变化时：

1. 更新 `docs/DECISIONS.md`，说明新理由和被替代的决定。
2. 更新 `docs/README.md` 与 `docs/README_ENHANCED.md` 的用户和维护说明。
3. 更新 `docs/TODO.md` 的状态和验收标准。
4. 如果影响发布，再更新 `docs/DEPLOYMENT_CHECKLIST.md`。

不要让历史报告重新成为当前事实来源。
