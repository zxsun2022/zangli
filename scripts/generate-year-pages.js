// 年份对照表页（D022）：为简体、繁体、英文各生成 1951–2051 年的静态页面，内容直接写在 HTML 里，
// 搜索引擎和不执行 JavaScript 的读者都能读到。只在 `npm run build` 时生成到发布目录，不提交进仓库。
// 与其他生成器一样不读系统时钟：结果只取决于源码和 ASSET_VERSION。
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { ASSET_VERSION } = require('./release-config');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const RELEASE_YEAR = ASSET_VERSION.slice(0, 4);
const FIRST_YEAR = 1951;
const LAST_YEAR = 2051;
const ANNUAL_IDS = new Set(['losar', 'chotrul', 'buddha-birth', 'saka-dawa', 'chokhor', 'buddha-conception', 'lhabab', 'ganden-ngamcho']);

const locales = {
	'zh-cn': {
		dir: '', lang: 'zh-CN', intl: 'zh-CN', ogLocale: 'zh_CN', name: '百年藏历', languageLabel: '语言',
		title: year => `${year} 藏历对照表｜公历藏历逐日对照、殊胜日与节日 - 百年藏历`,
		heading: year => `${year} 藏历对照表`,
		description: (year, losar, saka) => `${year} 年公历与藏历逐日对照表${losar ? `，藏历新年 ${losar}` : ''}${saka ? `，萨嘎达瓦 ${saka}` : ''}。含每月殊胜日、日月食、理发吉日与飞幡日，可打印或存为 PDF。`,
		lead: (year, tibetanYears, losar) => `${year} 年对应藏历${tibetanYears.join('、')}${losar ? `，藏历新年是 ${losar}` : ''}。下面每月一张公历藏历对照月历，旁边列出当月的殊胜日与日月食；理发吉日、飞幡日、重日和缺日标在月历格子里。`,
		tibetanYear: label => `${label}年`,
		highlights: '年度节日与日月食', days: '全年月历', source: '资料来源与口径', otherYears: '其他年份',
		week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'], monthDays: '当月殊胜日', prev: '上一年', next: '下一年', openCalendar: '在月历中查看',
		print: '打印或存为 PDF', skip: '跳到全年月历', months: '月份',
		legend: { festival: '节日', multiplier: '功德增广日', eclipse: '日月食', haircut: '理发吉日', flagAvoid: '飞幡日', repeated: ['重', '重日'], skipped: ['缺', '前一日缺'] },
		monthCaption: (year, month) => `${year} 年 ${month} 月`,
		monthParts: (year, month) => [`${year} 年`, `${month} 月`],
		repeated: '重日', skipped: day => `缺${day}`, shifted: '缺日提前',
		tibetanMonths: list => `藏历 ${list.join(' · ')}`,
		noHighlights: '这一年在支持范围内没有年度节日或日月食。',
		partial: { 1951: '对照从 1951 年 1 月 8 日开始。', 2051: '对照到 2051 年 2 月 11 日为止。' },
		sourceText: '藏历对照来自《藏历、公历、农历对照百年历书（1951–2050）》。不同寺院、传承或历书的日期可能不同。节日按藏历真实月日标注：年度节日不落在闰月，重日只在第一天标注，缺日的节日提前一天。理发吉日与飞幡日按藏历日期推算，缺日不提前。日月食按北京时间日期归档。'
	},
	tw: {
		dir: 'tw', lang: 'zh-TW', intl: 'zh-TW', ogLocale: 'zh_TW', name: '百年藏曆', languageLabel: '語言',
		title: year => `${year} 藏曆對照表｜公曆藏曆逐日對照、殊勝日與節日 - 百年藏曆`,
		heading: year => `${year} 藏曆對照表`,
		description: (year, losar, saka) => `${year} 年公曆與藏曆逐日對照表${losar ? `，藏曆新年 ${losar}` : ''}${saka ? `，薩嘎達瓦 ${saka}` : ''}。含每月殊勝日、日月食、理髮吉日與飛幡日，可列印或存成 PDF。`,
		lead: (year, tibetanYears, losar) => `${year} 年對應藏曆${tibetanYears.join('、')}${losar ? `，藏曆新年是 ${losar}` : ''}。下面每月一張公曆藏曆對照月曆，旁邊列出當月的殊勝日與日月食；理髮吉日、飛幡日、重日和缺日標在月曆格子裡。`,
		tibetanYear: label => `${label}年`,
		highlights: '年度節日與日月食', days: '全年月曆', source: '資料來源與口徑', otherYears: '其他年份',
		week: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'], monthDays: '當月殊勝日', prev: '上一年', next: '下一年', openCalendar: '在月曆中查看',
		print: '列印或存成 PDF', skip: '跳到全年月曆', months: '月份',
		legend: { festival: '節日', multiplier: '功德增廣日', eclipse: '日月食', haircut: '理髮吉日', flagAvoid: '飛幡日', repeated: ['重', '重日'], skipped: ['缺', '前一日缺'] },
		monthCaption: (year, month) => `${year} 年 ${month} 月`,
		monthParts: (year, month) => [`${year} 年`, `${month} 月`],
		repeated: '重日', skipped: day => `缺${day}`, shifted: '缺日提前',
		tibetanMonths: list => `藏曆 ${list.join(' · ')}`,
		noHighlights: '這一年在支援範圍內沒有年度節日或日月食。',
		partial: { 1951: '對照從 1951 年 1 月 8 日開始。', 2051: '對照到 2051 年 2 月 11 日為止。' },
		sourceText: '藏曆對照來自《藏曆、公曆、農曆對照百年曆書（1951–2050）》。不同寺院、傳承或曆書的日期可能不同。節日按藏曆真實月日標註：年度節日不落在閏月，重日只在第一天標註，缺日的節日提前一天。理髮吉日與飛幡日按藏曆日期推算，缺日不提前。日月食按北京時間日期歸檔。'
	},
	en: {
		dir: 'en', lang: 'en', intl: 'en-CA', ogLocale: 'en_US', name: 'Tibetan Calendar', languageLabel: 'Language',
		title: year => `Tibetan Calendar ${year}: Gregorian–Tibetan dates, Losar and holy days`,
		heading: year => `Tibetan Calendar ${year}`,
		description: (year, losar, saka) => `Day-by-day Gregorian–Tibetan calendar for ${year}${losar ? `: Losar on ${losar}` : ''}${saka ? `, Saka Dawa on ${saka}` : ''}. Monthly holy days, eclipses, hair-cutting days and prayer-flag days. Printable.`,
		lead: (year, tibetanYears, losar) => `${year} spans the Tibetan ${tibetanYears.join(' and ')} years${losar ? `; Losar (Tibetan New Year) falls on ${losar}` : ''}. Each month below has a Gregorian–Tibetan calendar with its holy days and eclipses listed alongside; hair-cutting days, prayer-flag days, repeated days and skipped days are marked in the calendar cells.`,
		tibetanYear: label => label,
		highlights: 'Major observances and eclipses', days: 'Month by month', source: 'Source and method', otherYears: 'Other years',
		week: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], monthDays: 'Holy days this month', prev: 'Previous year', next: 'Next year', openCalendar: 'Open in calendar',
		print: 'Print or save as PDF', skip: 'Skip to the monthly calendars', months: 'Months',
		legend: { festival: 'Observances', multiplier: 'Multiplier days', eclipse: 'Eclipses', haircut: 'Hair-cutting day', flagAvoid: 'No prayer flags', repeated: ['+', 'repeated day'], skipped: ['−', 'previous day skipped'] },
		monthCaption: (year, month) => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1))),
		monthParts: (year, month) => [String(year), new Intl.DateTimeFormat('en-CA', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)))],
		repeated: 'repeated day', skipped: day => `day ${day} skipped`, shifted: 'moved for a skipped day',
		tibetanMonths: list => `Tibetan ${list.join(' · ')}`,
		noHighlights: 'No major observances or eclipses fall in the supported range this year.',
		partial: { 1951: 'The crosswalk starts on 8 January 1951.', 2051: 'The crosswalk ends on 11 February 2051.' },
		sourceText: 'Dates follow the published Tibetan, Gregorian and Chinese Lunar Calendar Comparison (1951–2050). Dates can differ across monasteries, traditions and published calendars. Observances follow the actual Tibetan month and day: annual observances never fall in a leap month, a repeated day carries its observance on the first occurrence, and an observance on a skipped day moves one day earlier. Hair-cutting and prayer-flag days follow the Tibetan date and are not moved for skipped days. Eclipses are filed by Beijing date.'
	}
};

const ELEMENTS_EN = ['Iron', 'Water', 'Wood', 'Fire', 'Earth'];
const ANIMALS_EN = ['Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Sheep', 'Monkey', 'Bird', 'Dog', 'Pig', 'Mouse', 'Ox'];

function escapeHTML(value) {
	return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

const clean = value => String(value || '').replace(/<br\s*\/?>/g, '').replace(/&nbsp;/g, '').trim();
// 中文日月食名称带“有”字（“有日环食”），在表格里去掉。
const eclipseName = value => clean(value).replace(/^有/, '');
const pad = value => String(value).padStart(2, '0');
const iso = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

// 与浏览器相同的脚本顺序，在 VM 中按语言加载历法与翻译。
function runtime(locale) {
	const window = {};
	const pathname = locale === 'zh-cn' ? '/' : `/${locale}/`;
	const context = vm.createContext({ window, location: { pathname }, console: { error() {} }, Map, Set, Date, Math, String, Number, Object, Array, RegExp, Boolean });
	vm.runInContext(read('js/i18n-data.js'), context);
	Object.assign(context, window);
	vm.runInContext(read('js/i18n.js'), context);
	context.trans = context.window.trans;
	vm.runInContext(read('zangli.js'), context);
	vm.runInContext(read('eclipse.js'), context);
	return context;
}

function yearLabel(locale, zangli) {
	if (locale === 'en') return `${ELEMENTS_EN[zangli.elementIndex]} ${ANIMALS_EN[zangli.animalIndex]}`;
	return zangli.year;
}

function tibetanDate(locale, ctx, zangli) {
	if (locale === 'en') return `${zangli.monthLeap ? 'Leap ' : ''}Month ${zangli.monthNumber} · Day ${zangli.dayNumber}`;
	return `${zangli.monthLeap ? ctx.trans('闰') : ''}${ctx.getZangliMonthOrdinal(zangli.monthNumber)}${ctx.trans('月')}${ctx.getZangliDayName(zangli.dayNumber)}`;
}

function tibetanDayName(locale, ctx, day) {
	return locale === 'en' ? String(day) : ctx.getZangliDayName(day);
}

// 月历格子里的短藏历：月初写月份，其他日子只写日（与首页月历相同）。
function shortTibetan(locale, ctx, zangli) {
	if (isMonthStart(zangli)) return locale === 'en'
		? `${zangli.monthLeap ? 'Leap ' : ''}Month ${zangli.monthNumber}`
		: `${zangli.monthLeap ? ctx.trans('闰') : ''}${ctx.getZangliMonthOrdinal(zangli.monthNumber)}${ctx.trans('月')}`;
	return locale === 'en' ? `Day ${zangli.dayNumber}` : ctx.getZangliDayName(zangli.dayNumber);
}

const isMonthStart = zangli => zangli.dayNumber === 1 || (zangli.dayNumber === 2 && zangli.dayMiss);
const joinNote = (locale, label, value) => value ? (locale === 'en' ? `${label}: ${value}` : `${label}：${value}`) : label;

function collectYear(locale, ctx, year) {
	const s = locales[locale];
	const longDate = new Intl.DateTimeFormat(s.intl, { month: 'long', day: 'numeric', timeZone: 'UTC' });
	const shortDate = new Intl.DateTimeFormat(s.intl, { month: 'short', day: 'numeric', timeZone: 'UTC' });
	const weekday = new Intl.DateTimeFormat(s.intl, { weekday: 'short', timeZone: 'UTC' });
	const months = [];
	const highlights = [];
	const tibetanYears = [];
	let losar = '', saka = '';
	for (let month = 1; month <= 12; month++) {
		const cells = [];
		const specials = [];
		const tibetanMonths = [];
		const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
		for (let day = 1; day <= daysInMonth; day++) {
			const instant = new Date(Date.UTC(year, month - 1, day));
			const weekdayIndex = instant.getUTCDay();
			const zangli = ctx.getZangli({ year, month, day });
			if (zangli.value === 'error') { cells.push({ day, weekdayIndex, outOfRange: true }); continue; }
			const eclipse = ctx.getEclipse({ year, month, day });
			const label = s.tibetanYear(yearLabel(locale, zangli));
			if (!tibetanYears.includes(label)) tibetanYears.push(label);
			const events = zangli.events.map(event => `${clean(event.title)}${event.shifted ? (locale === 'en' ? ` (${s.shifted})` : `（${s.shifted}）`) : ''}`);
			if (eclipse.value) events.push(eclipseName(eclipse.value));
			// 年度节日与日月食摘要：同一天的合并为一行。
			const annual = zangli.events.filter(event => ANNUAL_IDS.has(event.id));
			for (const event of annual) {
				if (event.id === 'losar' && !losar) losar = longDate.format(instant);
				if (event.id === 'saka-dawa' && !saka) saka = longDate.format(instant);
			}
			const titles = [...annual.map(event => clean(event.title)), ...(eclipse.value ? [eclipseName(eclipse.value)] : [])];
			const tibetan = tibetanDate(locale, ctx, zangli);
			if (titles.length) highlights.push({ date: iso(year, month, day), gregorian: longDate.format(instant), weekday: weekday.format(instant), tibetan, title: titles.join(' · '), eclipse: !annual.length });
			const types = [];
			if (clean(zangli.extraInfo)) types.push('festival');
			if (clean(zangli.extraInfo2)) types.push('multiplier');
			if (eclipse.value) types.push('eclipse');
			const status = [];
			if (zangli.dayLeap) status.push(s.repeated);
			if (zangli.dayMiss) status.push(...zangli.omittedDaysBefore.map(omitted => s.skipped(tibetanDayName(locale, ctx, omitted))));
			const notes = [];
			if (zangli.haircut) notes.push(joinNote(locale, s.legend.haircut, zangli.haircut));
			if (zangli.flagAvoid) notes.push(s.legend.flagAvoid);
			const date = iso(year, month, day);
			const monthLabel = locale === 'en' ? `${zangli.monthLeap ? 'Leap ' : ''}Month ${zangli.monthNumber}` : `${zangli.monthLeap ? ctx.trans('闰') : ''}${ctx.getZangliMonthOrdinal(zangli.monthNumber)}${ctx.trans('月')}`;
			if (!tibetanMonths.includes(monthLabel)) tibetanMonths.push(monthLabel);
			const tibetanWithStatus = status.length ? (locale === 'en' ? `${tibetan} (${status.join(', ')})` : [tibetan, ...status].join(' ')) : tibetan;
			// 格子的完整说明：同时作为悬停提示和读屏名称。
			const fullLabel = [`${longDate.format(instant)} ${weekday.format(instant)}`, tibetanWithStatus, ...events, ...notes].join(' · ');
			cells.push({ date, day, weekdayIndex, lunar: shortTibetan(locale, ctx, zangli), monthStart: isMonthStart(zangli), types, eventName: clean(zangli.extraInfo) || eclipseName(eclipse.value), repeated: zangli.dayLeap, skipped: zangli.dayMiss, haircut: Boolean(zangli.haircut), flagAvoid: zangli.flagAvoid, label: fullLabel });
			if (events.length) specials.push({ date, gregorian: shortDate.format(instant), weekday: weekday.format(instant), tibetan: tibetanWithStatus, events, type: types[0] || 'festival' });
		}
		if (cells.some(cell => !cell.outOfRange)) months.push({ month, cells, specials, tibetanMonths });
	}
	return { months, highlights, tibetanYears, losar, saka };
}

function renderCell(s, prefix, cell) {
	if (cell.outOfRange) return `<td class="out-of-range"><span class="day-number">${cell.day}</span></td>`;
	const classes = [...cell.types.map(type => `has-${type}`), ...(cell.monthStart ? ['month-start'] : [])];
	const tags = `${cell.repeated ? `<b class="cell-tag">${s.legend.repeated[0]}</b>` : ''}${cell.skipped ? `<b class="cell-tag">${s.legend.skipped[0]}</b>` : ''}`;
	const markers = `${cell.types.map(type => `<i class="${type}-marker"></i>`).join('')}${cell.haircut ? '<i class="haircut-marker"></i>' : ''}${cell.flagAvoid ? '<i class="flag-marker"></i>' : ''}`;
	return `<td data-date="${cell.date}"${classes.length ? ` class="${classes.join(' ')}"` : ''}><a href="${prefix}date/${cell.date}" title="${escapeHTML(cell.label)}"><span class="year-cell" aria-hidden="true"><span class="day-number">${cell.day}</span><span class="lunar-date">${escapeHTML(cell.lunar)}${tags}</span>${markers ? `<span class="cell-meta">${cell.eventName ? `<span class="cell-event">${escapeHTML(cell.eventName)}</span>` : ''}<span class="cell-markers">${markers}</span></span>` : ''}</span></a></td>`;
}

function renderMonthGrid(s, prefix, month, cells) {
	const rows = [];
	let row = Array.from({ length: cells[0].weekdayIndex }, () => '<td class="empty-cell"></td>');
	for (const cell of cells) {
		if (cell.weekdayIndex === 0 && row.length) { rows.push(row); row = []; }
		row.push(renderCell(s, prefix, cell));
	}
	while (row.length < 7) row.push('<td class="empty-cell"></td>');
	rows.push(row);
	return `<table class="calendar-table year-grid" aria-labelledby="m${month}-title"><thead><tr>${s.week.map(day => `<th scope="col">${day}</th>`).join('')}</tr></thead><tbody>${rows.map(cellsInRow => `<tr>${cellsInRow.join('')}</tr>`).join('')}</tbody></table>`;
}

function renderSpecials(s, month, specials) {
	if (!specials.length) return '';
	return `<div class="year-month-days"><h4 id="m${month}-days">${s.monthDays}</h4><ol class="year-specials" aria-labelledby="m${month}-days">${specials.map(item => `<li data-date="${item.date}" class="is-${item.type}"><time datetime="${item.date}">${escapeHTML(item.gregorian)} <small>${escapeHTML(item.weekday)}</small></time><div><strong>${escapeHTML(item.events.join(' · '))}</strong><span>${escapeHTML(item.tibetan)}</span></div></li>`).join('')}</ol></div>`;
}

function yearHref(locale, year) {
	const dir = locales[locale].dir;
	return `${dir ? `/${dir}` : ''}/${year}/`;
}

function render(locale, ctx, year) {
	const s = locales[locale];
	const data = collectYear(locale, ctx, year);
	const prefix = s.dir ? `/${s.dir}/` : '/';
	const canonical = `https://zangli.org${yearHref(locale, year)}`;
	const description = s.description(year, data.losar, data.saka);
	const languageLinks = [['zh-cn', '简体'], ['tw', '繁體'], ['en', 'English']]
		.map(([value, label]) => value === locale ? `<span aria-current="page">${label}</span>` : `<a href="${yearHref(value, year)}" hreflang="${locales[value].lang}" data-language="${value}">${label}</a>`).join('');
	const pager = [
		year > FIRST_YEAR ? `<a rel="prev" href="${yearHref(locale, year - 1)}">← ${year - 1}<span class="sr-only"> ${s.prev}</span></a>` : '<span></span>',
		`<a href="${prefix}#${year}/1/1">${s.openCalendar}</a>`,
		year < LAST_YEAR ? `<a rel="next" href="${yearHref(locale, year + 1)}">${year + 1} →<span class="sr-only"> ${s.next}</span></a>` : '<span></span>'
	].join('');
	const highlights = data.highlights.length
		? `<ol class="year-highlights">${data.highlights.map(item => `<li${item.eclipse ? ' class="is-eclipse"' : ''}><time datetime="${item.date}">${escapeHTML(item.gregorian)} <small>${escapeHTML(item.weekday)}</small></time><span class="year-highlight-tibetan">${escapeHTML(item.tibetan)}</span><strong>${escapeHTML(item.title)}</strong></li>`).join('')}</ol>`
		: `<p>${s.noHighlights}</p>`;
	const monthJump = `<nav class="year-month-jump" aria-label="${s.months}">${data.months.map(({ month }) => `<a href="#m${month}">${locale === 'en' ? s.monthCaption(year, month).replace(` ${year}`, '').slice(0, 3) : `${month} 月`}</a>`).join('')}</nav>`;
	const tables = data.months.map(({ month, cells, specials, tibetanMonths }) => {
		const [yearPart, monthPart] = s.monthParts(year, month);
		return `<section class="year-month" id="m${month}" aria-labelledby="m${month}-title"><header class="year-month-head"><h3 id="m${month}-title"><span class="year-month-year">${escapeHTML(yearPart)}</span> <span class="year-month-name">${escapeHTML(monthPart)}</span></h3><p class="year-month-tibetan">${escapeHTML(s.tibetanMonths(tibetanMonths))}</p><a class="year-month-open" href="${prefix}#${year}/${month}/1">${s.openCalendar}</a></header>${renderMonthGrid(s, prefix, month, cells)}${renderSpecials(s, month, specials)}</section>`;
	}).join('');
	const legend = `<p class="calendar-legend year-legend"><span><i class="legend-dot festival-dot"></i>${s.legend.festival}</span><span><i class="legend-dot multiplier-dot"></i>${s.legend.multiplier}</span><span><i class="legend-dot eclipse-dot"></i>${s.legend.eclipse}</span><span><i class="legend-dot haircut-marker"></i>${s.legend.haircut}</span><span><i class="legend-dot flag-marker"></i>${s.legend.flagAvoid}</span><span><b class="cell-tag">${s.legend.repeated[0]}</b>${s.legend.repeated[1]}</span><span><b class="cell-tag">${s.legend.skipped[0]}</b>${s.legend.skipped[1]}</span></p>`;
	const yearIndex = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => FIRST_YEAR + index)
		.map(value => value === year ? `<span aria-current="page">${value}</span>` : `<a href="${yearHref(locale, value)}">${value}</a>`).join('');
	const partial = s.partial[year] ? `<p class="year-partial">${s.partial[year]}</p>` : '';
	const hreflang = ['zh-cn', 'tw', 'en'].map(value => `<link rel="alternate" hreflang="${locales[value].lang}" href="https://zangli.org${yearHref(value, year)}">`).join('')
		+ `<link rel="alternate" hreflang="x-default" href="https://zangli.org${yearHref('en', year)}">`;
	return `<!DOCTYPE html>
<html lang="${s.lang}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
	<meta name="description" content="${escapeHTML(description)}">
	<meta name="robots" content="index, follow">
	<meta name="theme-color" content="#8f2f2c">
	<link rel="canonical" href="${canonical}">
	<meta property="og:title" content="${escapeHTML(s.title(year))}"><meta property="og:description" content="${escapeHTML(description)}"><meta property="og:type" content="article"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://zangli.org/logo-512x512-circle.png"><meta property="og:locale" content="${s.ogLocale}">
	<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHTML(s.title(year))}"><meta name="twitter:description" content="${escapeHTML(description)}">
	<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
	<title>${escapeHTML(s.title(year))}</title>
	${hreflang}
	<link rel="stylesheet" href="/css/style.css?v=${ASSET_VERSION}">
	<script src="/js/langDetect.js?v=${ASSET_VERSION}"></script>
	<script defer src="/js/year.js?v=${ASSET_VERSION}"></script>
</head>
<body class="year-page">
	<a class="skip-link" href="#days">${s.skip}</a>
	<div class="site-shell">
		<header class="site-header"><a class="brand" href="${prefix}" aria-label="${s.name}"><span class="brand-mark" aria-hidden="true">ལོ</span><strong>${s.name}</strong></a><nav class="year-languages" aria-label="${s.languageLabel}">${languageLinks}</nav></header>
		<main class="year-main">
			<nav class="year-pager" aria-label="${s.otherYears}">${pager}</nav>
			<h1>${escapeHTML(s.heading(year))}</h1>
			<p class="year-lead">${escapeHTML(s.lead(year, data.tibetanYears, data.losar))}</p>
			${partial}
			<p class="year-actions"><button id="printButton" class="secondary-button" type="button" hidden>${s.print}</button></p>
			<section class="year-section year-card" aria-labelledby="highlightsTitle"><h2 id="highlightsTitle">${s.highlights}</h2>${highlights}</section>
			<section class="year-section" id="days" aria-labelledby="daysTitle"><h2 id="daysTitle">${s.days}</h2>${monthJump}${legend}${tables}</section>
			<section class="year-section year-source" aria-labelledby="sourceTitle"><h2 id="sourceTitle">${s.source}</h2><p>${s.sourceText}</p></section>
			<nav class="year-section year-index" aria-labelledby="otherYearsTitle"><h2 id="otherYearsTitle">${s.otherYears}</h2><p>${yearIndex}</p></nav>
		</main>
		<footer><p>© ${RELEASE_YEAR} ${s.name} · 1951–2051</p></footer>
	</div>
</body></html>
`;
}

function generateYearPages(outputRoot) {
	let count = 0;
	for (const locale of Object.keys(locales)) {
		const ctx = runtime(locale);
		for (let year = FIRST_YEAR; year <= LAST_YEAR; year++) {
			const dir = path.join(outputRoot, locales[locale].dir, String(year));
			fs.mkdirSync(dir, { recursive: true });
			fs.writeFileSync(path.join(dir, 'index.html'), render(locale, ctx, year));
			count++;
		}
	}
	return count;
}

module.exports = { generateYearPages, FIRST_YEAR, LAST_YEAR, yearHref };

if (require.main === module) {
	const output = path.resolve(process.argv[2] || path.join(root, 'dist'));
	console.log(`Generated ${generateYearPages(output)} year pages into ${output}.`);
}
