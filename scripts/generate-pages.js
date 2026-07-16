const fs = require('fs');
const path = require('path');
const { ASSET_VERSION } = require('./release-config');

const root = path.resolve(__dirname, '..');
const locales = {
	'zh-cn': {
		dir: '', lang: 'zh-CN', locale: 'zh_CN', name: '百年藏历', short: '现代历书',
		title: '百年藏历｜公历藏历对照、殊胜日与提醒',
		description: '1951–2051 公历藏历对照工具，支持本地日期口径、殊胜日清单、藏历反查、日历提醒与离线使用。',
		eyebrow: '公历 ↔ 藏历 · 1951–2051', tagline: '今日藏历',
		basis: '日期口径', next: '下一殊胜日', monthView: '月历', today: '今天',
		annual: '年度殊胜日', reverse: '藏历反查', about: '计算口径',
		all: '全部类型', festival: '节日', multiplier: '功德增广日', eclipse: '日月食',
		export: '导出本年 .ics', subscribe: '订阅 2026–2030', reverseHint: '选择公历年份范围及藏历月、日，查找对应的公历日期。',
		gregYear: '公历年份范围', lunarMonth: '藏历月份', lunarDay: '藏历日', includeLeap: '包含闰月', search: '开始反查',
		sourceTitle: '你正在查看的是什么历日？',
		source: '藏历对照来自《藏历、公历、农历对照百年历书（1951–2050）》。本地模式只用你设备所在时区确定“今天”，再查询同一份历书；它不是按所在地重新推算的天文历法。不同寺院、传承或历书的殊胜日口径可能不同。日月食按北京时间日期归档，实际可见性与当地位置有关。显示上，公历保留阿拉伯数字并明确标注；藏历使用正月、初一至初十、十一至三十等中文历日写法，并附传统月名，例如四月“萨嘎月”。',
		install: '离线使用', installText: '安装到桌面后，可离线查看已缓存的页面。', installButton: '安装应用', widget: '打开桌面小组件 →',
		settings: '设置', settingsTitle: '日期与显示设置', localBasis: '设备本地日期', beijingBasis: '北京时间日期', localHelp: '适合确认你所在地的“今天”对应哪一个历书日期。', beijingHelp: '与原始日月食归档及中国常用历日保持同一天。', close: '完成',
		share: '分享', copy: '复制信息', reminder: '添加提醒', prevMonth: '上一月', nextMonth: '下一月', prevYear: '上一年', nextYear: '下一年',
		week: ['周日','周一','周二','周三','周四','周五','周六'], noscript: '此日历需要启用 JavaScript 才能查询。', boBeta: ''
	},
	tw: {
		dir: 'tw', lang: 'zh-TW', locale: 'zh_TW', name: '百年藏曆', short: '現代曆書',
		title: '百年藏曆｜公曆藏曆對照、殊勝日與提醒', description: '1951–2051 公曆藏曆對照工具，支援本地日期口徑、殊勝日清單、藏曆反查、日曆提醒與離線使用。',
		eyebrow: '公曆 ↔ 藏曆 · 1951–2051', tagline: '今日藏曆', basis: '日期口徑', next: '下一殊勝日', monthView: '月曆', today: '今天', annual: '年度殊勝日', reverse: '藏曆反查', about: '計算口徑', all: '全部類型', festival: '節日', multiplier: '功德增廣日', eclipse: '日月食', export: '匯出本年 .ics', subscribe: '訂閱 2026–2030', reverseHint: '選擇公曆年份範圍及藏曆月、日，查找對應的公曆日期。', gregYear: '公曆年份範圍', lunarMonth: '藏曆月份', lunarDay: '藏曆日', includeLeap: '包含閏月', search: '開始反查', sourceTitle: '你正在查看的是什麼曆日？', source: '藏曆對照來自《藏曆、公曆、農曆對照百年曆書（1951–2050）》。本地模式只用你裝置所在時區確定「今天」，再查詢同一份曆書；它不是按所在地重新推算的天文曆法。不同寺院、傳承或曆書的殊勝日口徑可能不同。日月食按北京時間日期歸檔，實際可見性與當地位置有關。顯示上，公曆保留阿拉伯數字並明確標註；藏曆使用正月、初一至初十、十一至三十等中文曆日寫法，並附傳統月名，例如四月「薩嘎月」。', install: '離線使用', installText: '安裝到桌面後，可離線查看已快取的頁面。', installButton: '安裝應用', widget: '打開桌面小組件 →', settings: '設定', settingsTitle: '日期與顯示設定', localBasis: '裝置本地日期', beijingBasis: '北京時間日期', localHelp: '適合確認你所在地的「今天」對應哪一個曆書日期。', beijingHelp: '與原始日月食歸檔及中國常用曆日保持同一天。', close: '完成', share: '分享', copy: '複製資訊', reminder: '添加提醒', prevMonth: '上一月', nextMonth: '下一月', prevYear: '上一年', nextYear: '下一年', week: ['週日','週一','週二','週三','週四','週五','週六'], noscript: '此日曆需要啟用 JavaScript 才能查詢。', boBeta: ''
	},
	en: {
		dir: 'en', lang: 'en', locale: 'en_US', name: 'Tibetan Calendar', short: 'Modern Almanac',
		title: 'Tibetan Calendar 1951–2051 | Dates, observances and reminders', description: 'Gregorian–Tibetan date lookup for 1951–2051 with local-day context, observance lists, reverse lookup, calendar reminders and offline access.',
		eyebrow: 'Gregorian ↔ Tibetan · 1951–2051', tagline: 'Today’s Tibetan date', basis: 'Date basis', next: 'Next observance', monthView: 'Month', today: 'Today', annual: 'Annual observances', reverse: 'Reverse lookup', about: 'Method & sources', all: 'All types', festival: 'Observances', multiplier: 'Multiplier days', eclipse: 'Eclipses', export: 'Export year .ics', subscribe: 'Subscribe 2026–2030', reverseHint: 'Choose a Gregorian search year and Tibetan month/day to find matching Gregorian dates.', gregYear: 'Gregorian search year', lunarMonth: 'Tibetan month', lunarDay: 'Tibetan day', includeLeap: 'Include leap month', search: 'Find dates', sourceTitle: 'What date are you looking at?', source: 'The crosswalk comes from the Tibetan, Gregorian and Chinese Lunar Calendar Comparison (1951–2050). Local mode only uses your device time zone to decide which Gregorian “today” to look up in that same source; it is not a new location-specific astronomical calculation. Dates can differ across monasteries, traditions and published calendars. Eclipses are filed by Beijing date; local visibility depends on location.', install: 'Use offline', installText: 'Install the app for cached offline access.', installButton: 'Install app', widget: 'Open desktop widget →', settings: 'Settings', settingsTitle: 'Date and display settings', localBasis: 'Device-local date', beijingBasis: 'Beijing date', localHelp: 'Useful when you want “today” to follow your current location.', beijingHelp: 'Keeps the day aligned with the source’s eclipse filing and common China date.', close: 'Done', share: 'Share', copy: 'Copy details', reminder: 'Add reminder', prevMonth: 'Previous month', nextMonth: 'Next month', prevYear: 'Previous year', nextYear: 'Next year', week: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], noscript: 'JavaScript is required to use this calendar.', boBeta: ''
	},
	bo: {
		dir: 'bo', lang: 'bo', locale: 'bo', name: 'བོད་ཀྱི་ལོ་ཐོ།', short: 'ལོ་ཐོ།',
		title: 'བོད་ཀྱི་ལོ་ཐོ། 1951–2051', description: 'བོད་ཟླ་དང་སྤྱི་ལོའི་ཚེས་གྲངས་བལྟ་བ།',
		eyebrow: 'སྤྱི་ལོ། ↔ བོད་ཟླ། · 1951–2051', tagline: 'དེ་རིང་གི་ཚེས་གྲངས།', basis: 'ཚེས་གྲངས་ཀྱི་གཞི།', next: 'དུས་ཆེན་རྗེས་མ།', monthView: 'ཟླ་ཐོ།', today: 'དེ་རིང་།', annual: 'ལོ་འཁོར་དུས་ཆེན།', reverse: 'བོད་ཟླ་འཚོལ་བ།', about: 'རྩིས་སྟངས།', all: 'ཆ་ཚང་།', festival: 'དུས་ཆེན།', multiplier: 'དགེ་བ་འཕེལ་བའི་ཉིན།', eclipse: 'ཉི་ཟླ་འཛིན་པ།', export: '.ics ཕྱིར་འདྲེན།', subscribe: '2026–2030 མངགས་ཉོ།', reverseHint: 'Choose a Gregorian year and Tibetan month/day. Tibetan-language terminology is in beta.', gregYear: 'སྤྱི་ལོ།', lunarMonth: 'བོད་ཟླ།', lunarDay: 'ཚེས།', includeLeap: 'ཟླ་བཤོལ།', search: 'འཚོལ་བ།', sourceTitle: 'ཚེས་གྲངས་ཀྱི་གཞི།', source: 'This beta interface uses the same 1951–2050 published Chinese crosswalk. Device-local mode changes which Gregorian day is looked up; it does not recalculate a location-specific Tibetan astronomical calendar. Dates can differ by tradition and source.', install: 'Offline', installText: 'Install for cached access and a compact desktop view.', installButton: 'Install', widget: 'Desktop widget', settings: 'སྒྲིག་འགོད།', settingsTitle: 'ཚེས་གྲངས་སྒྲིག་འགོད།', localBasis: 'ས་གནས་དུས་ཚོད།', beijingBasis: 'པེ་ཅིང་དུས་ཚོད།', localHelp: 'Follows the device-local Gregorian day.', beijingHelp: 'Follows the Beijing Gregorian day used for eclipse filing.', close: 'འགྲུབ།', share: 'མཉམ་སྤྱོད།', copy: 'འདྲ་བཤུས།', reminder: 'དྲན་སྐུལ།', prevMonth: 'ཟླ་སྔོན་མ།', nextMonth: 'ཟླ་རྗེས་མ།', prevYear: 'ལོ་སྔོན་མ།', nextYear: 'ལོ་རྗེས་མ།', week: ['ཉི་མ།','ཟླ་བ།','མིག་དམར།','ལྷག་པ།','ཕུར་བུ།','པ་སངས།','སྤེན་པ།'], noscript: 'JavaScript is required.', boBeta: '<span class="beta-badge">Beta</span>'
	}
};

function render(locale, s) {
	const prefix = s.dir ? `/${s.dir}/` : '/';
	const hiddenCurrentLanguage = locale === 'bo' ? '<option value="bo" selected hidden>བོད་ཡིག</option>' : '';
	const languageOptions = hiddenCurrentLanguage + [['zh-cn','简体'],['tw','繁體'],['en','English']]
		.map(([value, label]) => `<option value="${value}"${value === locale ? ' selected' : ''}>${label}</option>`).join('');
	const monthOrdinals = locale === 'tw'
		? ['正','二','三','四','五','六','七','八','九','十','十一','十二']
		: ['正','二','三','四','五','六','七','八','九','十','十一','十二'];
	const traditionalMonths = locale === 'tw'
		? ['神變','苦行','具香','薩嘎','作淨','明淨','具醉','具賢','天降','持眾','莊嚴','滿意']
		: ['神变','苦行','具香','萨嘎','作净','明净','具醉','具贤','天降','持众','庄严','满意'];
	const dayNames = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
	const tibetanDigits = value => String(value).replace(/\d/g, digit => '༠༡༢༣༤༥༦༧༨༩'[Number(digit)]);
	const monthOptions = Array.from({length: 12}, (_, i) => {
		const value = i + 1;
		const label = locale === 'zh-cn' || locale === 'tw' ? `${monthOrdinals[i]}月（${traditionalMonths[i]}月）`
			: locale === 'bo' ? `ཟླ་ ${tibetanDigits(value)}` : value;
		return `<option value="${value}">${label}</option>`;
	}).join('');
	const dayOptions = Array.from({length: 30}, (_, i) => {
		const value = i + 1;
		const label = locale === 'zh-cn' || locale === 'tw' ? dayNames[i]
			: locale === 'bo' ? `ཚེས་ ${tibetanDigits(value)}` : value;
		return `<option value="${value}">${label}</option>`;
	}).join('');
	return `<!DOCTYPE html>
<html lang="${s.lang}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
	<meta name="description" content="${s.description}">
	<meta name="author" content="Stone Huang">
	<meta name="robots" content="index, follow">
	<meta name="theme-color" content="#8f2f2c">
	<link rel="canonical" href="https://zangli.org${prefix}">
	<meta property="og:title" content="${s.title}"><meta property="og:description" content="${s.description}"><meta property="og:type" content="website"><meta property="og:url" content="https://zangli.org${prefix}"><meta property="og:image" content="https://zangli.org/logo-512x512-circle.png"><meta property="og:locale" content="${s.locale}">
	<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${s.title}"><meta name="twitter:description" content="${s.description}"><meta name="twitter:image" content="https://zangli.org/logo-512x512-circle.png">
	<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="${prefix}manifest.json?v=${ASSET_VERSION}">
	<title>${s.title}</title>
	<link rel="alternate" hreflang="zh-CN" href="https://zangli.org/"><link rel="alternate" hreflang="zh-TW" href="https://zangli.org/tw/"><link rel="alternate" hreflang="en" href="https://zangli.org/en/"><link rel="alternate" hreflang="bo" href="https://zangli.org/bo/"><link rel="alternate" hreflang="x-default" href="https://zangli.org/en/">
	<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"${s.name}","url":"https://zangli.org${prefix}","description":"${s.description}","applicationCategory":"Calendar","operatingSystem":"All","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"inLanguage":"${s.lang}"}</script>
	<link rel="stylesheet" href="/css/style.css?v=${ASSET_VERSION}">
	<script src="/js/langDetect.js?v=${ASSET_VERSION}"></script>
	<script defer src="/js/i18n-data.js?v=${ASSET_VERSION}"></script><script defer src="/js/i18n.js?v=${ASSET_VERSION}"></script><script defer src="/zangli.js?v=${ASSET_VERSION}"></script><script defer src="/eclipse.js?v=${ASSET_VERSION}"></script><script defer src="/js/app.js?v=${ASSET_VERSION}"></script>
</head>
<body>
	<a class="skip-link" href="#calendarWorkspace">Skip to calendar</a>
	<div class="site-shell">
		<header class="site-header"><a class="brand" href="${prefix}" aria-label="${s.name}"><span class="brand-mark" aria-hidden="true">ལོ</span><span><strong>${s.name}</strong><small>${s.short}</small></span></a><div class="header-actions"><span id="basisLabel" class="header-basis-status" aria-live="polite">—</span><button id="settingsButton" class="text-button settings-button" type="button" aria-label="${s.settings}"><span class="settings-text">${s.settings}</span><span class="settings-icon" aria-hidden="true">⚙</span></button><span class="header-actions-divider" aria-hidden="true"></span><label class="sr-only" for="languageSelect">Language</label><select id="languageSelect" class="quiet-select">${languageOptions}</select><button id="themeButton" class="icon-button" type="button" aria-label="Toggle dark mode"><span aria-hidden="true">◐</span></button></div></header>
		<main>
			<section class="hero" aria-labelledby="pageTitle"><h1 id="pageTitle" class="sr-only">${s.title}</h1><div id="selectedDay" class="today-card"><div id="selectedDayContent" aria-live="polite"></div></div><article id="nextSpecialDay" class="next-card" aria-live="polite"><p class="section-kicker">${s.next}</p><div class="skeleton-line"></div></article></section>
			<section id="calendarWorkspace" class="calendar-workspace" aria-labelledby="monthTitle"><div class="calendar-toolbar"><div class="period-controls"><button id="prevYearButton" class="step-button secondary-step" type="button" aria-label="${s.prevYear}">−1</button><button id="prevMonthButton" class="step-button" type="button" aria-label="${s.prevMonth}">←</button><div class="period-title"><p>${s.monthView}</p><h2 id="monthTitle">—</h2></div><button id="nextMonthButton" class="step-button" type="button" aria-label="${s.nextMonth}">→</button><button id="nextYearButton" class="step-button secondary-step" type="button" aria-label="${s.nextYear}">+1</button></div><button id="todayButton" class="primary-button" type="button">${s.today}</button><select id="year" hidden aria-label="Year"></select><select id="month" hidden aria-label="Month"></select></div><div class="calendar-scroll"><table class="calendar-table"><thead><tr>${s.week.map(day => `<th scope="col">${day}</th>`).join('')}</tr></thead><tbody></tbody></table></div><p class="calendar-legend"><span><i class="legend-dot festival-dot"></i>${s.festival}</span><span><i class="legend-dot multiplier-dot"></i>${s.multiplier}</span><span><i class="legend-dot eclipse-dot"></i>${s.eclipse}</span></p></section>
			<section class="tools" aria-label="Calendar tools"><div class="tool-tabs" role="tablist"><button class="tool-tab active" id="annualTab" role="tab" aria-selected="true" aria-controls="annualPanel" data-panel="annualPanel">${s.annual}</button><button class="tool-tab" id="reverseTab" role="tab" aria-selected="false" aria-controls="reversePanel" data-panel="reversePanel">${s.reverse}</button><button class="tool-tab" id="aboutTab" role="tab" aria-selected="false" aria-controls="aboutPanel" data-panel="aboutPanel">${s.about}</button></div>
				<div id="annualPanel" class="tool-panel" role="tabpanel" aria-labelledby="annualTab"><div class="panel-toolbar"><label><span class="sr-only">Filter</span><select id="annualFilter"><option value="all">${s.all}</option><option value="festival">${s.festival}</option><option value="multiplier">${s.multiplier}</option><option value="eclipse">${s.eclipse}</option></select></label><div class="button-group"><button id="exportYearButton" class="secondary-button" type="button">${s.export}</button><a class="secondary-button" href="webcal://zangli.org/calendar/zangli-special-days.ics">${s.subscribe}</a></div></div><div id="annualSummary" class="panel-summary"></div><ol id="annualList" class="event-list"></ol><div id="annualRangeControls" class="annual-range-controls"></div></div>
				<div id="reversePanel" class="tool-panel" role="tabpanel" aria-labelledby="reverseTab" hidden><p class="panel-intro">${s.reverseHint}</p><form id="reverseForm" class="reverse-form"><label>${s.gregYear}<select id="reverseYear"></select></label><label>${s.lunarMonth}<select id="reverseMonth">${monthOptions}</select></label><label>${s.lunarDay}<select id="reverseDay">${dayOptions}</select></label><label class="check-field"><input id="reverseLeap" type="checkbox"><span>${s.includeLeap}</span></label><button class="primary-button" type="submit">${s.search}</button></form><div id="reverseResults" class="reverse-results" aria-live="polite"></div></div>
				<div id="aboutPanel" class="tool-panel" role="tabpanel" aria-labelledby="aboutTab" hidden><h2>${s.sourceTitle}</h2><p>${s.source}</p><p class="source-links"><a href="https://github.com/stonelf/zangli" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="https://eclipse.gsfc.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA Eclipse Web Site</a></p></div>
			</section>
			<section class="install-card"><div><p class="section-kicker">${s.install}</p><p>${s.installText}</p></div><div class="button-group install-actions"><button id="installButton" class="secondary-button" type="button" hidden>${s.installButton}</button><a class="widget-link" href="/widget/">${s.widget}</a></div></section>
			<noscript><p class="noscript">${s.noscript}</p></noscript>
		</main><footer><p>© ${new Date().getFullYear()} ${s.name} · 1951-01-08—2051-02-11</p></footer>
	</div>
	<div id="detailMask" aria-hidden="true"></div><div id="detailDialog" aria-modal="true" aria-hidden="true" role="dialog" tabindex="-1" aria-labelledby="detailTitle"><div class="dialog-header"><button id="shareButton" class="text-button" type="button">${s.share}</button><button id="closeDetailButton" class="icon-button" type="button" aria-label="${s.close}">×</button></div><div id="detailContent"></div><div class="dialog-footer"><button id="reminderButton" class="primary-button" type="button">${s.reminder}</button><button id="copyButton" class="secondary-button" type="button">${s.copy}</button></div></div>
	<dialog id="settingsDialog" class="settings-dialog"><form method="dialog"><div class="dialog-title-row"><h2>${s.settingsTitle}</h2><button class="icon-button" value="cancel" aria-label="${s.close}">×</button></div><div id="dateDiscrepancy" class="settings-date-notice" role="status" hidden></div><fieldset><label class="choice-card"><input type="radio" name="dateBasis" value="local"><span><strong>${s.localBasis}</strong><small>${s.localHelp}</small></span></label><label class="choice-card"><input type="radio" name="dateBasis" value="beijing"><span><strong>${s.beijingBasis}</strong><small>${s.beijingHelp}</small></span></label></fieldset><button class="primary-button dialog-done" value="default">${s.close}</button></form></dialog>
</body></html>`;
}

for (const [locale, strings] of Object.entries(locales)) {
	const targetDir = path.join(root, strings.dir);
	fs.mkdirSync(targetDir, { recursive: true });
	fs.writeFileSync(path.join(targetDir, 'index.html'), render(locale, strings));
}

for (const relativePath of ['widget/index.html', 'sw.js']) {
	const file = path.join(root, relativePath);
	let source = fs.readFileSync(file, 'utf8').replace(/\?v=\d{8}-\d+/g, `?v=${ASSET_VERSION}`);
	if (relativePath === 'sw.js') source = source.replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = 'zangli-${ASSET_VERSION}';`);
	fs.writeFileSync(file, source);
}
