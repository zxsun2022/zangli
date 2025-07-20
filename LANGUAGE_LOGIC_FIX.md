# 语言检测逻辑修复说明

## 🔧 **修复的问题**

### 1. Sitemap中的无效URL
**问题**: sitemap.xml中包含了 `/zh-tw/` URL，但实际上这个目录不存在
**修复**: 从sitemap中移除 `/zh-tw/` URL，因为它会重定向到 `/tw/`

### 2. 语言选择记录优化
**问题**: 用户访问 `/zh-tw` 重定向到 `/tw/` 时，没有正确记录语言选择
**修复**: 在重定向时设置 `sessionStorage.setItem('userLanguageChoice', 'manual-tw')`

### 3. 逻辑条件优化
**问题**: 简体版本的语言选择记录条件过于宽泛
**修复**: 添加更精确的条件判断，排除 `index.html` 页面

## ✅ **修复后的行为**

### URL处理
| 用户访问 | 实际行为 | 记录状态 |
|---------|---------|---------|
| `/` | 根据浏览器语言智能检测 | `auto-tw` 或无记录 |
| `/tw/` | 显示繁体版本 | `manual-tw` |
| `/zh-tw` | 重定向到 `/tw/` | `manual-tw` |

### 会话记忆
- **manual-tw**: 用户主动选择繁体版本
- **manual-cn**: 用户主动选择简体版本  
- **auto-tw**: 系统自动检测选择繁体版本

## 🎯 **核心逻辑**

### 1. URL标准化
```javascript
// /zh-tw 重定向到 /tw/，并记录用户选择
if (pathname.includes('/zh-tw')) {
  const newPath = pathname.replace('/zh-tw', '/tw');
  sessionStorage.setItem('userLanguageChoice', 'manual-tw');
  location.replace(buildRedirectUrl(newPath));
  return;
}
```

### 2. 智能自动检测
```javascript
// 只在根页面进行自动检测
if (!hasLanguagePreference && (pathname === basePath || pathname === basePath + 'index.html')) {
  if (isTwLocale && !inTwSubPath) {
    const newPath = basePath + 'tw/';
    sessionStorage.setItem('userLanguageChoice', 'auto-tw');
    location.replace(buildRedirectUrl(newPath));
  }
}
```

### 3. 用户选择记录
```javascript
// 记录用户的明确语言选择
if (inTwSubPath && !hasLanguagePreference) {
  sessionStorage.setItem('userLanguageChoice', 'manual-tw');
} else if (!inTwSubPath && pathname !== basePath && pathname !== basePath + 'index.html' && !hasLanguagePreference) {
  sessionStorage.setItem('userLanguageChoice', 'manual-cn');
}
```

## 📊 **SEO优化**

### Sitemap结构
```xml
<!-- 保留的有效URL -->
<url>
  <loc>https://zangli.org/</loc>
  <priority>1.00</priority>
</url>
<url>
  <loc>https://zangli.org/tw/</loc>
  <priority>0.90</priority>
</url>
<!-- 移除了无效的 /zh-tw/ URL -->
```

### 好处
1. **避免404错误** - 移除不存在的URL
2. **清晰的URL结构** - 只保留实际存在的页面
3. **更好的爬虫体验** - 减少重定向链

## 🧪 **测试场景**

### 推荐测试
1. **访问根页面**
   - 简体浏览器 → 显示简体版本
   - 繁体浏览器 → 重定向到 `/tw/`

2. **直接访问语言版本**
   - 任何浏览器访问 `/tw/` → 显示繁体版本
   - 任何浏览器访问 `/zh-tw` → 重定向到 `/tw/`

3. **会话一致性**
   - 用户选择后，在同一会话中保持选择
   - 刷新页面不会改变语言版本

## 🎉 **修复效果**

### 用户体验
- ✅ 尊重用户的主动语言选择
- ✅ 智能的首次访问语言检测
- ✅ 一致的会话内语言体验

### 技术稳定性
- ✅ 清晰的URL结构
- ✅ 避免无效的sitemap条目
- ✅ 更准确的用户行为记录

### SEO友好
- ✅ 减少重定向链
- ✅ 清晰的页面层次结构
- ✅ 更好的搜索引擎理解

现在语言检测逻辑更加健壮和用户友好了！