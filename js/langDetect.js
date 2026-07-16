(function () {
	const { pathname, search, hash } = location;
	if (/^\/zh-tw(?:\/|$)/i.test(pathname)) {
		location.replace(pathname.replace(/^\/zh-tw/i, '/tw') + search + hash);
		return;
	}

	const isRoot = pathname === '/' || pathname === '/index.html';
	let preference = '';
	try { preference = localStorage.getItem('zangli-language') || ''; } catch (error) {}
	if (!preference && isRoot) {
		const languages = navigator.languages || [navigator.language || ''];
		const first = String(languages[0] || '').toLowerCase();
		if (/^zh-(tw|hk|mo|hant)/.test(first)) preference = 'tw';
		else if (/^bo(?:-|$)/.test(first)) preference = 'bo';
		else if (first && !/^zh(?:-|$)/.test(first)) preference = 'en';
		if (preference) {
			location.replace(`/${preference}/${search}${hash}`);
		}
	}
})();
