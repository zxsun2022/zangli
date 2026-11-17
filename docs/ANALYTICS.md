# 访问统计（GA4）

衡量 ID：`G-WY2HDCMYRL`；网站数据流 ID：`16356658289`（仅用于后台管理，不写入前端）。

## 发布前的 Google 后台设置

1. 管理 → 数据流 → 选择此网站数据流 → **关闭“增强型衡量”总开关**。本项目手动发送页面浏览与功能事件，自动历史变化、点击、搜索等事件会重复统计或带出原始日期 URL。单独设置 `send_page_view: false` 不能关闭后台的历史变化统计。
2. 关闭 Google Signals、广告个性化，不连接 Google Ads。固定报表时区（建议 Asia/Shanghai），避免日统计边界变化。
3. 按需创建事件级自定义维度：`ui_language`、`page_type`、`display_mode`、`kind`。不必创建每个日期或节日名称维度。
4. 发布后在正式域名允许统计，用 Tag Assistant / DebugView 和实时报告验证。普通报告需要处理时间。不要把本地自动化验证视为 Google 后台已收到数据。

官方参考：
- https://developers.google.com/analytics/devguides/collection/ga4/views
- https://developers.google.com/tag-platform/security/concepts/consent-mode
- https://support.google.com/analytics/answer/14240153

## 用户选择与边界

首页及年份页页脚提供“隐私与访问统计”，初次访问默认展开但不弹窗、不遮挡日历。只有主动允许后才加载 Google tag；未选择、拒绝、离线时不发送自定义事件，也不补传此前行为。拒绝不影响日历。

选择存于 `zangli-analytics-consent`，跨语言共享；无法访问本地存储时仅对当前页面有效。随时可在同一入口拒绝，停止事件发送、设置 GA 禁用标记并清除此资源的 `_ga` Cookie；其他标签页同步选择。撤回不删除已发送到 Google 的历史数据。已加载的 Google 脚本在当前页面内不会被卸载，刷新后不再加载。

只有 HTTPS 下的 `zangli.org` 与 `www.zangli.org` 启用，localhost、Pages 预览域名不启用。404 和旧 widget 不接入。藏文 Beta 保留英文隐私说明，不改变隐藏与 noindex 策略。

不发送查询日期、节日、反查输入、分享文字。页面地址按语言入口或年份页归并，去除 query/hash，引用来源只保留 origin；因此本版本不提供 UTM 活动归因或逐日详情排名。GA 仍会处理 Cookie 标识、设备和大致地区，不能称为匿名统计。

## 事件口径

| 事件 | 触发条件 |
|---|---|
| page_view | 每个文档在同意且脚本加载后一次；历史变化不额外计页面浏览 |
| date_detail_view | 日期详情打开，包括直接访问日期链接（仅在统计已就绪时记录） |
| calendar_navigate | 月历导航完成，不记录普通焦点移动；跨月键盘导航会计入 |
| tool_open | 工具展开；kind 为 annualPanel / reversePanel / aboutPanel |
| reverse_lookup | 用户改变反查输入并完成结果渲染；初始化不算 |
| calendar_export | 生成文件并触发下载；kind 为 annual / reminder，不表示已导入日历 |
| subscription_click | 点击 webcal 订阅，不表示订阅成功 |
| share_click / copy_click | 点击分享 / 复制，不表示操作成功 |
| install_open / pwa_installed | 点击安装入口 / 浏览器报告安装完成；后者不覆盖所有平台 |
| print_click | 点击年份页打印按钮，不表示打印完成 |

共享分类：ui_language、page_type（calendar/year）、display_mode（browser/standalone）。未同意、脚本尚未就绪、脚本被拦截、离线期间的功能操作不计；访问次数不是精确自然人数。页脚选择带来主动同意样本偏差，应主要观察趋势。

## 代码与验证

- `scripts/analytics-markup.js`：共享多语言隐私说明，供两种页面生成器使用。
- `js/analytics.js`：同意、生产域名校验、数据最小化与事件白名单。
- `js/app.js`：在实际完成操作的位置记录主要功能；打印及操作入口由统一模块监听。
- `_headers`：仅放行 Google tag 与 GA 收集所需域名，未开启 unsafe-inline / unsafe-eval。
- Service Worker 预缓存本地统计模块；Google 脚本和收集请求仍不进入缓存。
- `npm run verify` 包含统计行为测试；`npm run build` 覆盖 303 个年份页。

停用：关闭后台增强型衡量并不能停用本模块。需要移除两个生成器中的 analytics.js 引用及同意界面，更新资源版本并重新发布。
