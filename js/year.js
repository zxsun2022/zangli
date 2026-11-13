// 年份对照表页：启用打印按钮，并按日期口径标出今天所在的格子和殊胜日条目。
(function () {
	const button = document.getElementById('printButton');
	if (button) { button.hidden = false; button.addEventListener('click', () => window.print()); }
	// 手动切换语言时与首页一样记住选择，否则回到根地址会按旧偏好跳走。只在点击时写入，打开页面本身不改偏好。
	document.querySelectorAll('[data-language]').forEach(link => link.addEventListener('click', () => {
		try { localStorage.setItem('zangli-language', link.dataset.language); } catch (error) {}
	}));
	let basis = 'local';
	try { basis = localStorage.getItem('zangli-date-basis') === 'beijing' ? 'beijing' : 'local'; } catch (error) {}
	const options = { year: 'numeric', month: '2-digit', day: '2-digit', ...(basis === 'beijing' ? { timeZone: 'Asia/Shanghai' } : {}) };
	const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', options).formatToParts(new Date()).map(part => [part.type, part.value]));
	const date = `${parts.year}-${parts.month}-${parts.day}`;
	const cell = document.querySelector(`.year-grid td[data-date="${date}"]`);
	if (cell) { cell.classList.add('today'); cell.querySelector('a').setAttribute('aria-current', 'date'); }
	const item = document.querySelector(`.year-specials li[data-date="${date}"]`);
	if (item) item.classList.add('is-today');
})();
