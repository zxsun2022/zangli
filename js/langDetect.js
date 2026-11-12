(function () {
	const { pathname, search, hash } = location;
	if (/^\/zh-tw(?:\/|$)/i.test(pathname)) {
		location.replace(pathname.replace(/^\/zh-tw/i, '/tw') + search + hash);
		return;
	}

	if (pathname !== '/' && pathname !== '/index.html') return;
	// 搜索引擎爬虫的浏览器语言通常是 en-US。让它留在所请求的地址，否则简体首页会被当成跳转到 /en/ 的页面。
	if (/bot|crawl|spider|slurp|bingpreview/i.test(navigator.userAgent || '')) return;

	let preference = '';
	try { preference = localStorage.getItem('zangli-language') || ''; } catch (error) {}
	if (!preference) {
		const languages = navigator.languages || [navigator.language || ''];
		const first = String(languages[0] || '').toLowerCase();
		if (/^zh-(tw|hk|mo|hant)/.test(first)) preference = 'tw';
		else if (first && !/^zh(?:-|$)/.test(first)) preference = 'en';
	}
	// 手动选过的语言同样适用于根地址；选过简体（zh-cn）时留在这里。
	if (preference === 'tw' || preference === 'en') location.replace(`/${preference}/${search}${hash}`);
})();
