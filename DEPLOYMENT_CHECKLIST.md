# 生产部署检查清单

## 发布前

- [ ] `npm run verify` 通过。
- [ ] `git status --short` 不包含意外生成物。
- [ ] `scripts/release-config.js` 的资源版本已更新。
- [ ] `index.html`、`tw/`、`en/`、`widget/` 均能加载。
- [ ] `/date/YYYY-MM-DD`、`/tw/date/YYYY-MM-DD`、`/en/date/YYYY-MM-DD` 分享链接能直接打开。
- [ ] Service Worker 更新后，旧缓存会被替换且离线页面仍能加载。

藏文 `/bo/` 当前是可直接访问但不公开索引的 Beta：不出现在语言菜单和 sitemap，并使用 `noindex, follow`。

## 路由

仓库同时维护三套部署规则：

- Netlify 或兼容平台：`_redirects`、`_headers`
- Apache：`.htaccess`
- Nginx：`nginx.conf`

切换托管平台时，要验证每种语言的日期深链接都返回对应语言的入口 HTML，而不是 404 或简体中文首页。

## 缓存与响应头

- HTML 和 `sw.js` 不应长期缓存。
- 带 `?v=<ASSET_VERSION>` 的 JS/CSS 可以使用一年 immutable 缓存。
- 日历订阅文件使用 `text/calendar; charset=utf-8`。
- 至少启用 `X-Content-Type-Options`、`Referrer-Policy` 和适合当前内联 JSON-LD 的 CSP。

## 发布后抽查

1. 桌面 1440×900 和手机 390×844 的首屏能看到日期摘要、下一殊胜日和主要月历区域。
2. 切换语言后，日期深链接保留语言前缀。
3. 禁止站点存储后，页面仍能渲染，主题和日期口径回退到默认值。
4. 键盘打开日期详情后，Tab 焦点不会离开模态框，Escape 能关闭并恢复原焦点。
5. 在线加载一次后断网刷新，当前语言页面仍可使用。
6. Search Console / 站点地图中不包含隐藏的 `/bo/` Beta。
