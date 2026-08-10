# TypeScript 7 迁移评估

> 文档类别：迁移评估。

评估日期：2026-08-09；状态更新：2026-08-10。

**当前决策：暂缓。** 项目继续使用原生 JavaScript。迁移必须在独立分支进行，并以 [TODO.md](TODO.md) 的 P0 历法正确性测试完成为前置条件。该决定记录在 [DECISIONS.md](DECISIONS.md) 的 D001。

## 结论

可以迁移，但不应与界面、可靠性或历法数据修改放在同一批提交中。TypeScript 7 已于 2026-07-08 正式发布，可通过 `typescript` 包和 `tsc` 使用；它的原生编译器已经适合生产，但 7.0 不提供旧式编译器 API。这个项目很小，迁移收益主要来自类型安全和可维护性，不是编译速度。

官方资料：

- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [TypeScript 7 native implementation status](https://github.com/microsoft/typescript-go)

## 当前迁移难点

- `zangli.js`、`eclipse.js`、`js/app.js` 通过浏览器全局变量和固定脚本顺序协作。
- `scripts/test-product.js` 使用 `vm` 直接加载全局脚本，改成 ES 模块后测试加载方式也要调整。
- HTML、Service Worker 和订阅文件是生成物，迁移后需要明确 `src` 与部署输出的边界。
- 历法数据正确性比类型转换更重要；当前全范围检查主要验证结构合法，不能替代跨年代、闰月、缺日和重日的独立黄金样本。

## 推荐顺序

1. 先完成 `TODO.md` 的 P0 黄金样本、性质测试和多时区测试。
2. 为现有 JavaScript 增加 TypeScript 7 的 `allowJs + checkJs + noEmit` 检查，处理真实类型问题。
3. 定义 `ZangliDate`、`EclipseInfo`、`CalendarEvent` 等领域类型，先转换 `app.js`、`widget.js` 和 `sw.js`。
4. 把核心计算脚本改成显式模块导出，同时保留一层浏览器兼容入口，更新 VM 测试。
5. 最后转换页面和订阅生成脚本，统一输出目录与缓存版本流程。

建议单独建立迁移分支，分 4–6 个可验证提交完成。完整迁移预计需要半天到一天的实现与回归验证；如果先补齐历书黄金样本，风险会明显降低。
