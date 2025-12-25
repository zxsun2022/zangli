// ① 引入 OpenCC，CDN 版本示例：<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js"></script>
// 支持根域名和项目子目录下的 /tw/ 路径
const isTrad = /(?:^|\/)tw(\/|$)/i.test(location.pathname);
let converter = null;

if (isTrad) {
  try {
    // 检查 OpenCC 是否成功加载
    if (typeof OpenCC === 'undefined') {
      console.error("OpenCC library not loaded. Traditional Chinese conversion will not work.");
    } else {
      // opencc-js's Converter is synchronous
      console.log("Creating OpenCC converter...");
      converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
      console.log("OpenCC converter created.");
    }
  } catch (err) {
    console.error("Failed to create OpenCC converter:", err);
    converter = null;
  }
}

// 通用转换方法，简体环境直接回传
function trans(str) {
  if (!isTrad || !converter || typeof str !== 'string') return str;
  try {
    return converter(str);
  } catch (err) {
    console.error("OpenCC conversion error:", err);
    return str;
  }
}

// 将函数暴露到全局
window.isTrad = isTrad;
window.trans  = trans;
