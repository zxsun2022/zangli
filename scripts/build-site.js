// 只把站点文件复制到发布目录（默认 dist/）。仓库里的文档、脚本、测试和服务器配置示例不发布。
// 托管平台设置：构建命令 `npm run build`，发布目录 `dist`。
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'dist');
const publicEntries = [
	'index.html', '404.html', 'tw', 'en', 'bo', 'widget', 'zh-tw',
	'css', 'js', 'calendar', 'zangli.js', 'eclipse.js', 'sw.js',
	'manifest.json', 'robots.txt', 'sitemap.xml', '_headers', '_redirects',
	'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png',
	'logo-192x192-circle.png', 'logo-250x250-circle.png', 'logo-512x512-circle.png'
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const entry of publicEntries) {
	const source = path.join(root, entry);
	if (!fs.existsSync(source)) throw new Error(`Missing site file: ${entry}`);
	fs.cpSync(source, path.join(output, entry), { recursive: true, filter: file => path.basename(file) !== '.DS_Store' });
}
console.log(`Built ${publicEntries.length} site entries into ${path.relative(root, output) || output}.`);
