// ① 引入 OpenCC，CDN 版本示例：<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.4/dist/umd/opencc.min.js"></script>
// 支持根域名和项目子目录下的 /tw/ 路径
const isTrad = /(?:^|\/)tw(\/|$)/i.test(location.pathname);
let converter = null;

if (isTrad) {
  // opencc-js's Converter is synchronous
  console.log("Creating OpenCC converter...");
  converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
  console.log("OpenCC converter created.");
}

// 通用转换方法，简体环境直接回传
function trans(str) {
  if (!isTrad || !converter || typeof str !== 'string') return str;
  return converter(str);
}

// 将函数暴露到全局
window.isTrad = isTrad;
window.trans  = trans; 
