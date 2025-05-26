# 🚀 部署指南

这个藏历应用是完全静态的，可以部署在任何静态文件托管服务上。

## 📋 部署前准备

确保您的项目包含以下文件：
- `index.html` - 主页面
- `zangli.js` - 藏历计算逻辑
- `eclipse.js` - 日月食数据
- `favicon.ico` - 网站图标
- `sitemap.xml` - 搜索引擎地图
- `calendar/` 目录 - 静态HTML版本（可选）

## 🌟 GitHub Pages 部署（推荐）

### 方法1：通过GitHub网页界面

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "部署美化版藏历应用"
   git push origin master
   ```

2. **启用GitHub Pages**
   - 进入您的GitHub仓库
   - 点击 `Settings` 标签
   - 滚动到 `Pages` 部分
   - 在 `Source` 下选择 `Deploy from a branch`
   - 选择 `master` 分支和 `/ (root)` 文件夹
   - 点击 `Save`

3. **访问网站**
   - 几分钟后，您的网站将在 `https://yourusername.github.io/zangli` 可用

### 方法2：使用GitHub Actions（自动部署）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## ☁️ Vercel 部署

### 方法1：通过Vercel网页界面

1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择您的GitHub仓库
5. 保持默认设置，点击 "Deploy"
6. 几分钟后获得 `https://your-project.vercel.app` 链接

### 方法2：使用Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 在项目目录中运行
vercel

# 按照提示完成部署
```

### Vercel配置文件（可选）

创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## 🌐 Cloudflare Pages 部署

### 方法1：通过Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 "Pages" > "Create a project"
3. 连接您的GitHub账号
4. 选择仓库
5. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: 留空
   - **Build output directory**: `/`
6. 点击 "Save and Deploy"

### 方法2：使用Wrangler CLI

```bash
# 安装Wrangler
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 部署
wrangler pages publish . --project-name=zangli
```

## 🌍 Netlify 部署

### 拖拽部署（最简单）

1. 访问 [netlify.com](https://netlify.com)
2. 将整个项目文件夹拖拽到部署区域
3. 获得随机生成的URL

### Git集成部署

1. 在Netlify中点击 "New site from Git"
2. 选择GitHub并授权
3. 选择您的仓库
4. 构建设置：
   - **Build command**: 留空
   - **Publish directory**: `/`
5. 点击 "Deploy site"

## 📱 其他部署选项

### Firebase Hosting

```bash
# 安装Firebase CLI
npm install -g firebase-tools

# 登录
firebase login

# 初始化项目
firebase init hosting

# 部署
firebase deploy
```

### Surge.sh

```bash
# 安装Surge
npm install -g surge

# 部署
surge .
```

## 🔧 自定义域名

所有这些平台都支持自定义域名：

1. **GitHub Pages**: 在仓库设置中添加CNAME文件
2. **Vercel**: 在项目设置中添加域名
3. **Cloudflare Pages**: 在Pages设置中配置自定义域名
4. **Netlify**: 在站点设置中添加域名

## 📊 性能优化建议

1. **启用压缩**: 大多数平台自动启用Gzip压缩
2. **CDN**: 所有推荐的平台都提供全球CDN
3. **缓存**: 静态文件会被自动缓存
4. **HTTPS**: 所有平台都提供免费SSL证书

## 🎯 推荐选择

- **GitHub Pages**: 免费，与GitHub集成好，适合开源项目
- **Vercel**: 性能优秀，部署快速，开发者友好
- **Cloudflare Pages**: 全球CDN性能最佳，免费额度大
- **Netlify**: 功能丰富，表单处理，A/B测试等

## 🔍 部署后验证

部署完成后，请验证：
- ✅ 网站正常加载
- ✅ 藏历计算功能正常
- ✅ 今天日期正确高亮
- ✅ 移动端响应式布局正常
- ✅ 键盘导航功能正常
- ✅ 触摸手势在移动设备上工作

---

选择任一平台，几分钟内就能让您的美化版藏历应用上线！🎉 