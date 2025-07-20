# 语言检测逻辑优化

## 🤔 **问题分析**

### 原有问题
用户访问 `zangli.org/zh-tw` 或 `zangli.org/tw/` 时，如果浏览器语言设置为简体中文，会被强制重定向到简体版本，这违背了用户的主动选择意图。

### 用户体验问题
1. **用户意图被忽略** - 用户主动访问繁体版本，但被强制重定向
2. **URL不一致** - `/zh-tw` 和 `/tw/` 都应该指向繁体版本
3. **循环重定向风险** - 在某些情况下可能造成重定向循环

## ✅ **新的语言检测逻辑**

### 核心原则
1. **用户意图优先** - 用户主动访问特定语言版本时，尊重用户选择
2. **智能自动检测** - 只在用户访问根页面时进行语言自动检测
3. **会话记忆** - 记住用户的语言选择，避免重复重定向

### 具体逻辑

#### 1. URL标准化
```javascript
// 处理 /zh-tw URL 重定向到 /tw/
if (pathname.includes('/zh-tw')) {
  const newPath = pathname.replace('/zh-tw', '/tw');
  location.replace(buildRedirectUrl(newPath));
  return;
}
```

#### 2. 智能自动检测
```javascript
// 只在以下情况进行自动重定向：
// 1. 用户没有手动选择过语言
// 2. 用户访问的是根页面（不是特定语言版本）
if (!hasLanguagePreference && (pathname === basePath || pathname === basePath + 'index.html')) {
  if (isTwLocale && !inTwSubPath) {
    // 重定向到繁体中文版本
    const newPath = basePath + 'tw/';
    sessionStorage.setItem('userLanguageChoice', 'auto-tw');
    location.replace(buildRedirectUrl(newPath));
  }
}
```

#### 3. 用户选择记忆
```javascript
// 记录用户的语言选择
if (inTwSubPath && !hasLanguagePreference) {
  sessionStorage.setItem('userLanguageChoice', 'manual-tw');
} else if (!inTwSubPath && pathname !== basePath && !hasLanguagePreference) {
  sessionStorage.setItem('userLanguageChoice', 'manual-cn');
}
```

## 🎯 **新行为说明**

### 场景1：用户直接访问根页面
- **简体浏览器** → `zangli.org/` → 显示简体版本
- **繁体浏览器** → `zangli.org/` → 自动重定向到 `zangli.org/tw/`

### 场景2：用户主动访问特定语言版本
- **任何浏览器** → `zangli.org/tw/` → 显示繁体版本（不重定向）
- **任何浏览器** → `zangli.org/zh-tw` → 重定向到 `zangli.org/tw/`（URL标准化）

### 场景3：用户在会话中已有语言选择
- 记住用户选择，不再进行自动重定向
- 除非用户主动访问其他语言版本

## 📊 **URL结构更新**

### 支持的URL
| URL | 行为 | 优先级 |
|-----|------|--------|
| `zangli.org/` | 简体中文主页，支持自动检测 | 1.00 |
| `zangli.org/tw/` | 繁体中文页面 | 0.90 |
| `zangli.org/zh-tw/` | 重定向到 `/tw/` | 0.80 |

### Sitemap更新
- 添加了 `/zh-tw/` URL支持
- 保持SEO友好的URL结构

## 🔍 **技术实现细节**

### SessionStorage使用
- `userLanguageChoice`: 记录用户语言选择
  - `auto-tw`: 自动检测选择繁体
  - `manual-tw`: 手动访问繁体版本
  - `manual-cn`: 手动访问简体版本

### 重定向策略
1. **URL标准化重定向** - `/zh-tw` → `/tw/`
2. **语言自动检测重定向** - 仅在根页面
3. **保留查询参数和锚点** - 重定向时保持URL完整性

## 🎉 **优势**

### 用户体验改善
1. **尊重用户选择** - 主动访问特定语言版本时不会被重定向
2. **智能检测** - 首次访问时提供便利的语言自动检测
3. **避免重复重定向** - 会话内记住用户选择

### SEO友好
1. **URL一致性** - `/zh-tw` 和 `/tw/` 都指向同一内容
2. **避免重定向循环** - 更稳定的爬虫体验
3. **保持hreflang标签有效性**

### 技术稳定性
1. **减少重定向次数** - 提高页面加载速度
2. **更清晰的逻辑** - 减少边界情况和bug
3. **更好的调试体验** - 行为更可预测

## 🧪 **测试场景**

### 建议测试的场景
1. **简体浏览器访问根页面** - 应显示简体版本
2. **繁体浏览器访问根页面** - 应重定向到繁体版本
3. **简体浏览器直接访问 `/tw/`** - 应显示繁体版本（不重定向）
4. **访问 `/zh-tw`** - 应重定向到 `/tw/`
5. **会话内的行为一致性** - 记住用户选择

这个优化让语言检测逻辑更加人性化和智能化！