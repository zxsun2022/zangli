(function () {
	const $ = id => document.getElementById(id);
	const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	const locale = /^zh/i.test(navigator.language) ? 'zh-CN' : 'en-CA';
	const parts = new Intl.DateTimeFormat('en-CA', { timeZone:zone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
	const values = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
	const today = new Date(values.year, values.month - 1, values.day, 12);
	const clean = value => String(value || '').replace(/<br>/g, ' ').replace(/&nbsp;/g, '').trim();
	const format = date => new Intl.DateTimeFormat(locale, { year:'numeric', month:'long', day:'numeric', weekday:'long' }).format(date);
	const formatTibetan = value => `${value.year}年${value.monthNumber}月${value.dayNumber}日`;
	const data = getZangli(today);
	$('widgetToday').innerHTML = `<p class="date">${format(today)}</p><h1>${formatTibetan(data)}</h1>${clean(data.extraInfo) ? `<p class="festival">${clean(data.extraInfo)}</p>` : ''}`;
	let next;
	for (let offset = 0; offset < 370; offset++) {
		const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, 12);
		if (date > endDate) break;
		const zangli = getZangli(date), eclipse = getEclipse(date);
		if (clean(zangli.extraInfo) || eclipse.value) { next = { date, zangli, eclipse, offset }; break; }
	}
	if (next) $('widgetNext').innerHTML = `<p>${next.offset ? `${next.offset} 天后` : '今天'} · ${format(next.date)}</p><h2>${clean(next.zangli.extraInfo) || next.eclipse.value}</h2>`;
	$('widgetZone').textContent = zone.replace('_', ' ');
	const theme = localStorage.getItem('zangli-theme') || 'system';
	const apply = value => { document.documentElement.dataset.theme = value === 'dark' || (value === 'system' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; };
	apply(theme);
	$('widgetTheme').addEventListener('click', () => { const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('zangli-theme', nextTheme); apply(nextTheme); });
	if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
})();
