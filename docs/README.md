# 百年藏历

百年藏历是一个无框架、可离线使用的公历与藏历对照工具，查询范围为 1951-01-08 至 2051-02-11。项目提供简体中文、繁体中文、英文页面，以及不公开索引的藏文 Beta。

## 当前能力

- 今日公历与藏历摘要、下一殊胜日和完整月历
- 殊胜日、功德增广日及日月食标记
- 藏历反查、日期详情、分享链接和 `.ics` 提醒
- 2026–2030 日历订阅与年度导出
- 设备本地日期、北京时间两种“今天”口径
- PWA 安装、离线访问、深色模式和多语言日期深链接

当前桌面内容最大宽度为 1120px。PC 与手机均优先在首屏展示日期摘要和月历；年度殊胜日、藏历反查和计算口径默认收起，按需展开。

## 三步开始开发

项目没有运行时依赖。开发工具建议使用 Node.js 22 或更新版本。

```bash
# 1. 启动仅本机可访问的静态服务器
python3 -m http.server 4173 --bind 127.0.0.1

# 2. 修改后重新生成页面、缓存版本和订阅文件
npm run generate

# 3. 提交前运行完整验证
npm run verify
```

打开 `http://127.0.0.1:4173/`。这个静态服务器不会模拟生产环境的日期深链接重写；相关规则位于 `_redirects`、`.htaccess` 和 `nginx.conf`。

## 维护规则

- `index.html`、`tw/index.html`、`en/index.html` 和 `bo/index.html` 由 `scripts/generate-pages.js` 生成，不要只修改生成后的 HTML。
- 修改模板、公共资源或缓存策略时，先更新 `scripts/release-config.js`，再运行 `npm run generate`。
- `zangli.js` 和 `eclipse.js` 是历法与日月食核心。修改前先补充来源可追溯的正确性测试。
- 项目目前仍使用原生 JavaScript。TypeScript 7 迁移已评估，但需在历法正确性测试增强后单独进行。
- 历法黄金样本在 `tests/fixtures/zangli-golden.json`，每条必须附来源与页码；`npm run test:calendar` 单独运行历法测试。

## 文档入口

- [完整项目与维护指南](README_ENHANCED.md)
- [AI / 自动化代理接手说明](../AGENTS.md)
- [已确认的产品与工程决策](DECISIONS.md)
- [项目待办](TODO.md)
- [生产部署检查清单](DEPLOYMENT_CHECKLIST.md)
- [TypeScript 7 迁移评估](TYPESCRIPT_7_MIGRATION.md)
- [当前优化状态报告](OPTIMIZATION_REPORT.md)
- [历法核心审计（2026-10-26）](audits/CALENDAR_CORE_AUDIT_2026-10-26.md)

## 数据口径

藏历对照来自《藏历、公历、农历对照百年历书（1951–2050）》。设备本地日期模式只决定查询哪个公历日，不会按用户所在地重新推算藏历天文参数。不同寺院、传承或历书的日期可能存在差异。节日按藏历真实月日标注：年度节日不落在闰月，重日只在第一天标注，缺日的节日提前一天（见 [D011](DECISIONS.md)）。日月食按北京时间日期归档，食甚时间已由力学时换算为世界时，实际可见性取决于所在地。

原项目：[stonelf/zangli](https://github.com/stonelf/zangli)。许可证见 [LICENSE.md](../LICENSE.md)。
