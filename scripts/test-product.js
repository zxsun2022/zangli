const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { ASSET_VERSION } = require('./release-config');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function runtime(localePath) {
	const window = {};
	const context = vm.createContext({
		window, location: { pathname: localePath }, console, Map, Date, Math, String, Number,
		Object, Array, RegExp, Boolean
	});
	vm.runInContext(read('js/i18n-data.js'), context);
	Object.assign(context, window);
	vm.runInContext(read('js/i18n.js'), context);
	context.trans = context.window.trans;
	vm.runInContext(read('zangli.js'), context);
	vm.runInContext(read('eclipse.js'), context);
	return context;
}

const en = runtime('/en/');
assert.equal(en.trans('有'), '', 'English empty translations must not fall back to Chinese');
const zh = runtime('/');
assert.equal(vm.runInContext('getZangliDayName(10)', zh), '初十');
assert.equal(vm.runInContext('getZangliDayName(20)', zh), '二十');
assert.equal(vm.runInContext('getZangliDayName(21)', zh), '廿一');
assert.equal(vm.runInContext('getZangliMonthOrdinal(1)', zh), '正');
assert.equal(vm.runInContext('getZangliTraditionalMonth(4)', zh), '萨嘎');
const july15 = vm.runInContext('getZangli(new Date(2026, 6, 15, 12))', en);
assert.deepEqual(
	{ month: july15.monthNumber, day: july15.dayNumber, element: july15.elementIndex, animal: july15.animalIndex },
	{ month: 6, day: 1, element: 3, animal: 4 }
);
const eclipse = vm.runInContext('getEclipse(new Date(2026, 1, 17, 12))', en);
assert.equal(eclipse.value, 'Annular solar eclipse');
assert.ok(eclipse.maximumTimestamp);
assert.ok(Object.prototype.hasOwnProperty.call(eclipse, 'startTimestamp'));
assert.ok(Object.prototype.hasOwnProperty.call(eclipse, 'endTimestamp'));
const lunarEclipse = vm.runInContext('getEclipse(new Date(2026, 2, 3, 12))', en);
assert.ok(!/[有，复圆]/.test(`${lunarEclipse.value}${lunarEclipse.extraInfo}`));

const fullRange = vm.runInContext(`(function () {
	let days = 0, festivals = 0, eclipses = 0;
	for (let date = new Date(startDate); date <= endDate; date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 12)) {
		const zangli = getZangli(date);
		if (!zangli || zangli.value === 'error' || zangli.monthNumber < 1 || zangli.monthNumber > 12 || zangli.dayNumber < 1 || zangli.dayNumber > 30) throw new Error('invalid date ' + date.toISOString());
		const eclipse = getEclipse(date);
		days++; if (zangli.extraInfo) festivals++; if (eclipse.value) eclipses++;
	}
	return { days, festivals, eclipses };
})()`, en);
assert.equal(fullRange.days, 36560);
assert.ok(fullRange.festivals > 9000);
assert.ok(fullRange.eclipses > 200);

const instant = new Date('2026-07-16T06:15:00Z');
const dayIn = timeZone => new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).format(instant);
assert.equal(dayIn('America/Vancouver'), '2026-07-15');
assert.equal(dayIn('Asia/Shanghai'), '2026-07-16');

for (const [file, language] of [['index.html','zh-CN'],['tw/index.html','zh-TW'],['en/index.html','en'],['bo/index.html','bo']]) {
	const html = read(file);
	assert.ok(html.includes(`<html lang="${language}">`), `${file} language`);
	for (const id of ['basisLabel','settingsButton','languageSelect','themeButton','selectedDay','selectedDayContent','nextSpecialDay','calendarWorkspace','annualPanel','annualYear','annualRoutine','reversePanel','reverseResults','aboutPanel','settingsDialog','dateDiscrepancy']) {
		assert.ok(html.includes(`id="${id}"`), `${file} missing ${id}`);
	}
	assert.ok(html.includes(`v=${ASSET_VERSION}`));
	assert.ok(!html.includes('class="hero-context"'), `${file} should not give date-basis metadata a full-width hero row`);
	assert.ok(!html.includes('class="hero-copy"'), `${file} should not repeat a visible page title above the primary cards`);
	assert.ok(html.includes('<h1 id="pageTitle" class="sr-only">'), `${file} should retain an accessible page heading`);
	assert.ok(html.includes(`id="settingsButton" class="icon-button settings-button" type="button" aria-label="`), `${file} should give the icon-only settings button an accessible name`);
	assert.ok(!html.includes('class="install-card"'), `${file} should keep the install entry in the footer instead of a promotional block`);
	assert.ok(!html.includes('id="reverseYear"') && !html.includes('id="reverseLeap"') && !html.includes('type="submit"'), `${file} reverse lookup should answer on change without year, leap or submit controls`);
	assert.ok(html.includes('<dl class="about-list">') && html.includes('data-open-settings'), `${file} method notes should be short labelled items with a link to the date basis`);
	assert.ok(!html.includes('href="/widget/"'), `${file} should not link the redundant widget page`);
	assert.ok(html.includes('<dialog id="installDialog"') && html.includes('id="installSteps"'), `${file} should guide installation where the browser has no install prompt`);
	assert.ok(html.indexOf('id="basisLabel"') < html.indexOf('id="settingsButton"'), `${file} should show date basis before settings`);
	assert.ok(html.indexOf('id="settingsButton"') < html.indexOf('id="languageSelect"'), `${file} should show settings before language`);
	assert.ok(html.indexOf('id="languageSelect"') < html.indexOf('id="themeButton"'), `${file} should show language before theme`);
	assert.ok(html.indexOf('id="dateDiscrepancy"') > html.indexOf('id="settingsDialog"'), `${file} should keep the detailed date discrepancy inside settings`);
	assert.ok(html.includes('<dialog id="detailDialog"'), `${file} should use the native modal dialog`);
	assert.ok(html.includes('<table class="calendar-table" role="grid" aria-labelledby="monthTitle">'), `${file} should expose the month as a navigable grid`);
	assert.ok(!html.includes('id="detailMask"'), `${file} should not retain the custom modal backdrop`);
	assert.ok(html.includes('id="annualTab" type="button" aria-expanded="false"'), `${file} should keep annual observances collapsed by default`);
	assert.ok(html.includes('id="annualPanel" class="tool-panel" role="region" aria-labelledby="annualTab" hidden'), `${file} should hide the annual list until requested`);
	assert.ok(!html.includes('role="tablist"'), `${file} should use disclosure controls when every tool can be collapsed`);
}
for (const file of ['index.html','tw/index.html','en/index.html']) assert.ok(!read(file).includes('value="bo"'), `${file} should not expose the Tibetan beta in the language switcher`);
for (const file of ['index.html','tw/index.html','en/index.html']) assert.ok(!read(file).includes('hreflang="bo"'), `${file} should not advertise the hidden Tibetan beta to search engines`);
assert.ok(read('bo/index.html').includes('<option value="bo" selected hidden>'), 'The hidden Tibetan route should identify its current language without exposing a public option');
assert.ok(read('bo/index.html').includes('<meta name="robots" content="noindex, follow">'), 'The hidden Tibetan beta should not be indexed');
assert.ok(!read('sitemap.xml').includes('/bo/'), 'The hidden Tibetan beta should not be in the public sitemap');
assert.ok(read('index.html').includes('<option value="4">四月（萨嘎月）</option>'));
assert.ok(read('index.html').includes('<option value="20">二十</option>'));
assert.ok(read('bo/index.html').includes('<option value="20">ཚེས་ ༢༠</option>'));
assert.ok(!read('js/app.js').includes("dayShort: '初{day}'"));
assert.ok(!read('js/langDetect.js').includes("preference = 'bo'"));

// 语言跳转：只在根地址生效；手动选择优先于浏览器语言；爬虫不跳转。
function languageRedirect({ pathname = '/', languages = ['zh-CN'], stored = null, userAgent = 'Mozilla/5.0 (Macintosh) Safari/605.1.15' }) {
	let target = null;
	vm.runInContext(read('js/langDetect.js'), vm.createContext({
		location: { pathname, search: '', hash: '', replace: value => { target = value; } },
		navigator: { languages, language: languages[0], userAgent },
		localStorage: { getItem: () => stored }
	}));
	return target;
}
assert.equal(languageRedirect({ languages: ['zh-CN'] }), null, 'Simplified Chinese browsers stay on the root entry');
assert.equal(languageRedirect({ languages: ['en-US'] }), '/en/', 'Other languages are sent to English on first visit');
assert.equal(languageRedirect({ languages: ['zh-TW'] }), '/tw/', 'Traditional Chinese browsers are sent to /tw/');
assert.equal(languageRedirect({ languages: ['zh-CN'], stored: 'en' }), '/en/', 'A language chosen by hand should also apply at the root address');
assert.equal(languageRedirect({ languages: ['en-US'], stored: 'tw' }), '/tw/', 'A language chosen by hand should win over the browser language');
assert.equal(languageRedirect({ languages: ['en-US'], stored: 'zh-cn' }), null, 'Choosing Simplified Chinese should keep the root entry');
assert.equal(languageRedirect({ languages: ['en-US'], userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }), null, 'Crawlers should index the address they requested');
assert.equal(languageRedirect({ languages: ['en-US'], userAgent: 'Mozilla/5.0 (compatible; Baiduspider/2.0)' }), null, 'Crawlers should index the address they requested');
assert.equal(languageRedirect({ pathname: '/en/', languages: ['zh-CN'], stored: 'tw' }), null, 'An explicit language path is never redirected');
assert.equal(languageRedirect({ pathname: '/date/2026-11-12', languages: ['en-US'] }), null, 'Shared date links keep their language');
assert.equal(languageRedirect({ pathname: '/zh-tw/date/2026-11-12' }), '/tw/date/2026-11-12', 'The legacy /zh-tw/ prefix still maps to /tw/');

// 404：每个语言目录一份，未知路径不再回退成首页。
for (const [file, language, home] of [['404.html','zh-CN','/'],['tw/404.html','zh-TW','/tw/'],['en/404.html','en','/en/'],['bo/404.html','bo','/bo/']]) {
	const html = read(file);
	assert.ok(html.includes(`<html lang="${language}">`), `${file} language`);
	assert.ok(html.includes('<meta name="robots" content="noindex, follow">'), `${file} should not be indexed`);
	assert.ok(html.includes(`<a class="primary-button" href="${home}">`), `${file} should lead back to its own language entry`);
	assert.ok(html.includes(`/css/style.css?v=${ASSET_VERSION}`), `${file} should use the current stylesheet`);
	assert.ok(!html.includes('<script'), `${file} should not load scripts or register the service worker`);
	assert.ok(!html.includes('href="/bo/"') || file === 'bo/404.html', `${file} should not link to the hidden Tibetan beta`);
}
assert.ok(!/try_files \$uri \$uri\/ \/[a-z/]*index\.html/.test(read('nginx.conf')), 'Nginx should not serve an entry page for unknown paths');
assert.ok(read('nginx.conf').includes('error_page 404 /en/404.html;') && read('.htaccess').includes('ErrorDocument 404 /404.html'), 'Self-hosted configs should return the 404 page');
assert.ok(!/new Date\(\)|Date\.now\(\)/.test(read('scripts/generate-pages.js')), 'Generated pages must not depend on the build date');
for (const rule of ['/*.md', '/docs/*', '/scripts/*', '/tests/*']) {
	assert.ok(read('_headers').includes(`${rule}\n  X-Robots-Tag: noindex`), `${rule} should not be indexed`);
}

for (const file of ['widget/index.html','sw.js']) {
	const versions = [...read(file).matchAll(/\?v=(\d{8}-\d+)/g)].map(match => match[1]);
	assert.ok(versions.length, `${file} should contain versioned assets`);
	assert.ok(versions.every(version => version === ASSET_VERSION), `${file} asset versions should match release-config`);
}
assert.ok(read('sw.js').includes(`const CACHE_NAME = 'zangli-${ASSET_VERSION}';`));
assert.ok(read('sw.js').includes("key.startsWith('zangli-')"), 'Service worker should only delete its own caches');
assert.ok(read('sw.js').includes('if (!response.ok'), 'Service worker should not cache error responses');
assert.ok(read('sw.js').includes('.catch(() => {}).then(() => response)'), 'A failed cache write should not fail the request it came from');
assert.ok(/const cached = await caches\.match\(event\.request\);\s*if \(cached\) return cached;[\s\S]*?return caches\.match\(fallback\);/.test(read('sw.js')), 'Offline navigation should serve the page’s own cache (e.g. a visited year page) before falling back to the language entry');
assert.ok(read('js/app.js').includes('height <= below ? anchor.bottom + gap : height <= above ? anchor.top - gap - height') && read('js/app.js').includes("dialog.style.maxHeight = `${innerHeight - margin * 2}px`;"), 'The year/month picker should open upwards or clamp to the viewport on short windows');
assert.ok(read('js/app.js').includes('const weekdayOf = day => new Date(Date.UTC(year, monthIndex, day)).getUTCDay();') && read('js/app.js').includes('if (!current || !isSupportedDate(current)) {'), 'The month grid should not depend on local dates that a time zone skipped (Pacific/Apia 2011-12-30)');
assert.ok(read('js/app.js').includes("focusDates.map(value => value && document.querySelector(`.calendar-table td[data-date=\"${value}\"]`))"), 'Closing the detail through browser Back should refocus the redrawn date cell');
assert.ok(read('js/app.js').includes('title: annualTitle(event), detail: annualDetail(event)') && read('js/app.js').includes('const title = event.title || eventTitle(event);'), 'Annual export without monthly days should use the same titles as the list (D017)');
assert.ok(/@media print \{[\s\S]*?\.year-page \.year-legend \{ display: flex !important; \}/.test(read('css/style.css')), 'Printed year pages should keep the marker legend');
assert.ok(read('js/year.js').includes("localStorage.setItem('zangli-language', link.dataset.language)") && /\[data-language\]'\)\.forEach\(link => link\.addEventListener\('click'/.test(read('js/year.js')), 'Year pages should remember a language only when one is picked');

const app = read('js/app.js');
assert.ok(app.includes("readStorage('zangli-date-basis'"), 'Main app should tolerate unavailable browser storage');
assert.ok(app.includes("writeStorage('zangli-theme'"), 'Theme changes should tolerate unavailable browser storage');
assert.ok(app.includes('clearTimeout(state.detailCloseTimer)'), 'Reopening the detail dialog should cancel a pending close');
assert.ok(app.includes('dialog.getBoundingClientRect()'), 'Backdrop dismissal should ignore clicks on the dialog padding');
assert.ok(!app.includes('trapDetailFocus'), 'The native modal dialog already traps focus');
assert.ok(read('js/widget.js').includes("readStorage('zangli-theme'"), 'Widget should tolerate unavailable browser storage');

const nginx = read('nginx.conf');
const apache = read('.htaccess');
for (const route of ['en', 'bo']) {
	assert.ok(nginx.includes(`^/${route}/date/`), `Nginx should resolve ${route} date deep links`);
	assert.ok(apache.includes(`^${route}/date/`), `Apache should resolve ${route} date deep links`);
}

const style = read('css/style.css');
assert.ok(style.includes(':root:not([data-theme])'), 'System dark mode should have a CSS-only first-paint fallback');
assert.ok(style.includes('grid-template-columns: repeat(3, minmax(0, 1fr))'), 'All three tool tabs should fit in the narrow mobile layout');
assert.ok(style.includes('.site-shell { width: min(1000px, calc(100% - 32px));'), 'Desktop content should stay within a readable 1000px canvas');
assert.ok(style.includes('.header-basis-status { display: none; }'), 'Mobile should hide the compact date-basis status');
assert.ok(style.includes('.calendar-table td { height: 58px;'), 'Mobile calendar cells should stay compact enough for first-screen scanning');
assert.ok(style.includes('.calendar-toolbar { min-height: 54px;'), 'Mobile month controls should remain on a compact row');
assert.ok(style.includes('.calendar-table td.selected[data-date] { box-shadow: inset 0 0 0 1.5px var(--ink); }'), 'The selected date should be a frame so it is not mistaken for another today');
assert.ok(!/td\.today\[data-date\] \{[^}]*box-shadow/.test(style), 'Today is the circle and tint; the frame belongs to the selected date');
assert.ok(app.includes('function markSelected(date)') && !app.includes('selectedCell'), 'The last opened date should stay marked after its detail closes');
assert.ok(app.includes("cell.setAttribute('role', 'gridcell');") && app.includes('cell.tabIndex = -1;') && app.includes('function setRovingCell(cell)'), 'The month grid should be a single Tab stop with roving focus');
assert.ok(app.includes("case 'ArrowDown': return addDays(date, 7);") && app.includes("case 'PageDown': return shiftMonths(date, event.shiftKey ? 12 : 1);"), 'Arrow keys and Page keys should move focus through days, weeks, months and years');
assert.ok(app.includes("cell.setAttribute('aria-selected'"), 'Assistive technology should hear which date is selected');
assert.ok(style.includes('.calendar-table td:last-child { border-right: 0; }'), 'Calendar cells should keep column rules so each day reads as one unit');
assert.ok(style.includes('.cell-event:empty, .cell-markers:empty { display: none; }'), 'Empty calendar metadata should not reserve space');
assert.ok(style.includes('-webkit-line-clamp: 1;'), 'Calendar event labels should stay on one line above their markers');
assert.ok(app.includes('<span class="cell-meta"><span class="cell-event wide">'), 'Calendar event labels and markers should share one non-overlapping metadata region');
assert.ok(app.includes('scanEvents(addDays(today, 1), addDays(today, 370))'), 'The next-observance card should not repeat today, which the summary card already shows');
assert.ok(app.includes("if (workspace.getBoundingClientRect().top < 0) workspace.scrollIntoView("), 'Changing months should not scroll the summary cards out of view');
assert.ok(app.includes("$('annualRoutine').checked ? state.annualEvents : state.annualEvents.filter(isAnnualEvent)"), 'The annual list should default to annual observances and eclipses, with monthly days opt-in');
assert.ok(app.includes('const year = state.annualYear;'), 'The annual list should keep its own year rather than follow the month grid');
assert.ok(app.includes('zangli.yearIndex > firstYear + 4') && app.includes('omittedDaysBefore.includes(day)'), 'Reverse lookup should cover five Tibetan years and report skipped days one day early');
assert.ok(app.includes("if (!$('annualPanel').hidden) renderAnnualList();"), 'Annual observances should render lazily only when their panel is visible');
assert.ok(read('js/app.js').includes("timeZoneName:'shortOffset'"), 'The compact date-basis label should use a language-neutral GMT offset');

const luminance = hex => {
	const channels = hex.match(/[a-f\d]{2}/gi).map(channel => parseInt(channel, 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
	return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
};
for (const platform of ['ios', 'macSafari', 'android', 'desktop', 'inApp']) assert.ok(app.includes(`${platform}: [[`), `Install guide should cover ${platform}`);
assert.ok(app.includes("matchMedia('(display-mode: standalone)')") && app.includes("'appinstalled'"), 'The install entry should disappear once the app runs installed');
for (const file of ['manifest.json', 'tw/manifest.json', 'en/manifest.json', 'bo/manifest.json']) assert.ok(!read(file).includes('/widget/'), `${file} should not offer the widget shortcut`);
assert.ok(!app.includes("'aria-disabled'"), 'The Today button stays clickable, so it must not be announced as disabled');
const faintText = style.match(/^[^\n]*[;{]\s*color: var\(--ink-faint\)[^\n]*$/gm) || [];
assert.deepEqual(faintText.map(line => line.trim().split(' {')[0]), ['.tibetan-notes span + span::before', '.picker-cell:disabled', '.calendar-table td.out-of-range'], 'Readable text must not use --ink-faint; it is for separators and disabled dates only');
for (const [ink, surface] of [['6b645b', 'ffffff'], ['6b645b', 'f4f1ea'], ['b3aba0', '24221f'], ['b3aba0', '171614']]) {
	const ratio = (Math.max(luminance(ink), luminance(surface)) + .05) / (Math.min(luminance(ink), luminance(surface)) + .05);
	assert.ok(ratio >= 4.5, `Secondary text #${ink} on #${surface} should reach 4.5:1, received ${ratio.toFixed(2)}:1`);
}
const festivalContrast = (luminance('f4aaa2') + .05) / (luminance('4b2926') + .05);
assert.ok(festivalContrast >= 4.5, `Dark festival label contrast should be at least 4.5:1, received ${festivalContrast.toFixed(2)}:1`);

for (const file of ['manifest.json','tw/manifest.json','en/manifest.json','bo/manifest.json']) JSON.parse(read(file));
for (const file of ['css/style.css','css/widget.css','js/app.js','js/widget.js','js/i18n-data.js','js/i18n.js','zangli.js','eclipse.js','calendar/zangli-special-days.ics']) {
	assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const ics = read('calendar/zangli-special-days.ics');
assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 514);
assert.equal((ics.match(/END:VEVENT/g) || []).length, 514);
assert.equal((ics.match(/BEGIN:VALARM/g) || []).length, 514);
assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
assert.ok(ics.split('\r\n').every(line => Buffer.byteLength(line, 'utf8') <= 75), 'ICS lines must be folded at 75 octets');

// D019–D020：年月可直接选择、翻月不堆历史、只发布站点文件。
for (const file of ['index.html','tw/index.html','en/index.html','bo/index.html']) {
	const html = read(file);
	assert.ok(html.includes('<button id="periodButton" class="period-button" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="periodPicker"'), `${file} should open the year and month picker from the month title`);
	assert.ok(html.includes('<span id="monthTitle">'), `${file} should keep the month title as the grid label`);
	assert.ok(/<dialog id="periodPicker" class="period-picker" aria-labelledby="pickerTitle"><h2 id="pickerTitle" class="sr-only">[^<]+<\/h2>/.test(html), `${file} should give the picker an accessible name`);
	assert.ok(html.includes('<select id="year" hidden') && html.includes('<select id="month" hidden'), `${file} should keep the hidden year and month state`);
}
for (const file of ['index.html','tw/index.html']) assert.ok(!/aria-label="(Year|Month|Calendar tools|Toggle dark mode)"|>Skip to calendar<|>Language</.test(read(file)), `${file} should not carry English-only accessibility labels`);
assert.ok(!app.includes("history.pushState({}, '', hash)"), 'Paging through months should not pile up history entries');
assert.ok(app.includes('zangli.dayNumber === 29 && isSupportedDate(addDays(date, 1))'), 'Reverse lookup should report a skipped day 30 at the end of a month');
assert.ok(app.includes('function openPeriodPicker()') && app.includes('function closePeriodPicker()') && app.includes("$('periodButton').focus();"), 'The year and month picker should return focus to its title button');
assert.ok(app.includes("event.key === 'PageUp' || event.key === 'PageDown'") && app.includes('turnPickerPage(next < 0 ? -1 : 1)'), 'The year grid should page by keyboard, including arrow keys across page edges');
assert.ok(app.includes('function isPickerMonthSupported(year, month)'), 'Months outside 1951-01 to 2051-02 should be disabled in the picker');
assert.ok(style.includes('.period-picker.bottom-sheet {'), 'On phones the picker should open as a bottom sheet');
assert.ok(app.includes('dayNotesHTML(zangli)') && app.includes("msg('flagAvoidNote')"), 'Hair-cutting and prayer-flag notes should be shown with the date');
assert.ok(read('sitemap.xml').includes('<loc>https://zangli.org/tw/2027/</loc>') && read('sitemap.xml').includes('<loc>https://zangli.org/en/1951/</loc>') && !read('sitemap.xml').includes('/bo/'), 'The sitemap should list the public year pages');
assert.ok(read('tw/index.html').includes('<title>藏曆查詢｜今日藏曆、公曆藏曆對照表與殊勝日 - 百年藏曆</title>') && read('tw/index.html').includes('content="今天藏曆幾號？') && read('index.html').includes('<title>藏历查询｜今日藏历、公历藏历对照表与殊胜日 - 百年藏历</title>'), 'Chinese home titles should lead with 藏曆 and cover 今日藏曆 / 對照表 queries');
assert.ok(read('tw/index.html').includes('<a id="footerTableLink" href="/tw/2026/">2026 藏曆對照表</a>') && !read('bo/index.html').includes('annualTableLink'), 'Home pages should link to the release year table, except the hidden Tibetan beta');
assert.ok(app.includes('function updateFooterTableLink()') && app.includes('updateFooterTableLink();'), 'The footer year-table link should follow today’s year, not only the release year');
assert.ok(app.includes(`zangli.haircut ? '<i class="haircut-marker"></i>' : ''`) && read('index.html').includes('<i class="legend-dot haircut-marker"></i>理发吉日') && read('tw/index.html').includes('理髮吉日</span></p>'), 'The month calendar should mark hair-cutting days and explain the mark in its legend');
assert.ok(['index.html', 'tw/index.html', 'en/index.html'].every(file => read(file).includes('<a href="mailto:hello@zangli.org" title="hello@zangli.org">')) && read('llms.txt').includes('hello@zangli.org'), 'Home pages and llms.txt should give the contact address');
assert.ok(style.includes('.cell-markers i, .legend-dot, .cell-tag { -webkit-print-color-adjust: exact; print-color-adjust: exact; }'), 'Calendar dots should print even when background graphics are off');
assert.ok(/@page \{ margin: 16mm 14mm; \}/.test(style), 'Printed pages and PDFs should keep a comfortable margin');
assert.ok(/\.footer-links \{[^}]*align-items: center/.test(style), 'Footer links should share one vertical centre line');
assert.ok(!read('sitemap.xml').includes('/widget/') && read('widget/index.html').includes('noindex'), 'The retired widget page should not be advertised to search engines');
assert.ok(read('sw.js').includes("path.includes('/date/') ? response : cacheResponse"), 'Date deep links should not each take a cache entry');
assert.ok(read('js/langDetect.js').includes("localStorage.getItem('zangli-theme')"), 'A saved theme should apply before first paint');
const tw = runtime('/tw/');
assert.equal(vm.runInContext("getZangli('2026-11-13').haircut", tw), '懷業增上，容光煥發', 'Traditional Chinese should convert the hair-cutting notes');
assert.equal(vm.runInContext("getZangli('2026-11-13').haircut", en), 'increases magnetizing power and radiance');
assert.equal(vm.runInContext("getZangli('2027-02-07').extraInfo", en), 'Losar (Tibetan New Year)');
assert.equal(vm.runInContext("getZangli('2027-02-20').extraInfo", en), 'Chotrul Düchen');
{
	const os = require('os');
	const { spawnSync } = require('child_process');
	const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zangli-dist-'));
	try {
		assert.equal(spawnSync(process.execPath, [path.join(root, 'scripts/build-site.js'), out]).status, 0, 'build-site should succeed');
		const built = fs.readdirSync(out);
		for (const entry of ['index.html', '404.html', 'en', 'sw.js', '_headers', '_redirects', 'sitemap.xml', 'zangli.js']) assert.ok(built.includes(entry), `build output should include ${entry}`);
		// D022：年份对照表页只在构建时生成，简体、繁体、英文各 1951–2051 年。
		for (const dir of ['', 'tw', 'en']) {
			const years = fs.readdirSync(path.join(out, dir)).filter(name => /^\d{4}$/.test(name));
			assert.equal(years.length, 101, `${dir || 'zh-cn'} should have 101 year pages`);
		}
		assert.ok(!fs.existsSync(path.join(out, 'bo', '2027')), 'The hidden Tibetan beta should not get year pages');
		const yearPage = fs.readFileSync(path.join(out, 'tw', '2027', 'index.html'), 'utf8');
		assert.ok(yearPage.includes('<a href="/2027/" hreflang="zh-CN" data-language="zh-cn">简体</a>') && yearPage.includes('<a href="/en/2027/" hreflang="en" data-language="en">English</a>'), 'Year-page language links should carry the language to remember');
		assert.ok(yearPage.includes('<html lang="zh-TW">') && yearPage.includes('<link rel="canonical" href="https://zangli.org/tw/2027/">'), 'Year pages should be self-canonical in their own language');
		for (const href of ['https://zangli.org/2027/', 'https://zangli.org/tw/2027/', 'https://zangli.org/en/2027/']) assert.ok(yearPage.includes(`href="${href}"`), `Year pages should link alternates (${href})`);
		assert.ok(yearPage.indexOf('id="daysTitle"') < yearPage.indexOf('id="highlightsTitle"') && yearPage.includes('<p class="year-lead">2027 年對應藏曆火馬年、火羊年，藏曆新年是 2月7日。</p>'), 'Year pages should open with one short sentence and put the month grids before the annual list');
		assert.ok(yearPage.includes('歡迎來信：<a href="mailto:hello@zangli.org">hello@zangli.org</a>'), 'Year pages should invite corrections by email');
		assert.ok(yearPage.includes('<title>2027 藏曆對照表｜'), 'The Traditional Chinese year page should target the 對照表 query');
		assert.ok(/<li data-date="2027-02-07"[^>]*>.*?<strong>藏曆新年<\/strong><span>正月初一<\/span>/.test(yearPage), 'Losar 2027 should appear in the static holy-day list');
		assert.ok(/<li data-date="2027-02-20"[^>]*>.*?<strong>神變節<\/strong><span>正月十五 缺十四<\/span>/.test(yearPage), 'Chotrul Düchen 2027 should appear in the list with its skipped-day note');
		assert.ok(/<td data-date="2027-01-31"><a href="\/tw\/date\/2027-01-31" title="[^"]*十二月廿四 重日[^"]*"><span class="year-cell" aria-hidden="true"><span class="day-number">31<\/span><span class="lunar-date">廿四<b class="cell-tag">重<\/b>/.test(yearPage), 'Repeated days should be tagged in the grid');
		assert.ok(/<li data-date="2027-01-27"[^>]*>.*?地藏王菩薩節日（缺日提前）/.test(yearPage), 'Observances moved for a skipped day should say so');
		assert.ok(/<td data-date="2027-02-02"><a [^>]*title="[^"]*理髮吉日：[^"]+"/.test(yearPage) && /<td data-date="2027-02-27"[^>]*>.*?<i class="flag-marker"><\/i>/.test(yearPage), 'Hair-cutting and prayer-flag days should be marked in the grid');
		assert.equal((yearPage.match(/<td data-date="2027-/g) || []).length, 365, 'Every day of 2027 should have a grid cell');
		assert.equal((yearPage.match(/<table class="calendar-table year-grid"/g) || []).length, 12, 'Each month should have its own grid');
		assert.deepEqual([...yearPage.matchAll(/<script[^>]*src="([^"?]+)/g)].map(match => match[1]), ['/js/langDetect.js', '/js/year.js'], 'Year pages should only load the language/theme helper and the print helper');
		const firstYear = fs.readFileSync(path.join(out, '1951', 'index.html'), 'utf8');
		assert.ok(!firstYear.includes('data-date="1951-01-07"') && firstYear.includes('data-date="1951-01-08"') && firstYear.includes('<td class="out-of-range"><span class="day-number">7</span></td>') && !firstYear.includes('rel="prev"'), 'The 1951 page should start at the supported range');
		const lastYear = fs.readFileSync(path.join(out, 'en', '2051', 'index.html'), 'utf8');
		assert.ok(lastYear.includes('data-date="2051-02-11"') && !lastYear.includes('data-date="2051-02-12"') && !lastYear.includes('rel="next"'), 'The 2051 page should end at the supported range');
		for (const entry of ['docs', 'scripts', 'tests', 'AGENTS.md', 'package.json', 'nginx.conf', '.htaccess']) assert.ok(!built.includes(entry), `build output should not include ${entry}`);
		// 年度数据与 llms.txt（D023）。
		assert.ok(built.includes('llms.txt') && fs.readFileSync(path.join(out, 'llms.txt'), 'utf8').includes('https://zangli.org/data/YYYY.json'), 'llms.txt should ship and explain the data files');
		const dataDir = fs.readdirSync(path.join(out, 'data'));
		assert.equal(dataDir.filter(name => /^\d{4}\.json$/.test(name)).length, 101, 'There should be one data file per year');
		const index = JSON.parse(fs.readFileSync(path.join(out, 'data', 'index.json'), 'utf8'));
		assert.equal(index.years.length, 101);
		const data2027 = JSON.parse(fs.readFileSync(path.join(out, 'data', '2027.json'), 'utf8'));
		const day = date => data2027.days.find(item => item.date === date);
		assert.equal(data2027.days.length, 365);
		assert.deepEqual(day('2027-02-07').observances, ['losar']);
		assert.equal(data2027.tibetanYears[day('2027-02-07').tibetan.year].en, 'Fire Sheep');
		assert.deepEqual(day('2027-02-20').tibetan, { year: 'fire-sheep', month: 1, leapMonth: false, day: 15, skippedBefore: [14] });
		assert.equal(day('2027-01-31').tibetan.repeatedDay, true);
		assert.deepEqual(day('2027-01-27').observedEarly, ['kshitigarbha']);
		assert.equal(day('2027-02-06').eclipse.kind, 'annular-solar');
		// 与独立摘录的 2027 全年名单比对，而不是与当前函数输出比对。
		const golden2027 = JSON.parse(read('tests/fixtures/zangli-golden.json')).yearLists.find(list => list.year === 2027);
		assert.deepEqual(data2027.days.filter(item => item.haircut).map(item => item.date), golden2027.haircut, 'Data haircut days should match the 2027 list');
		assert.deepEqual(data2027.days.filter(item => item.noPrayerFlags).map(item => item.date), golden2027.flagAvoid, 'Data prayer-flag days should match the 2027 list');
		const data1951 = JSON.parse(fs.readFileSync(path.join(out, 'data', '1951.json'), 'utf8'));
		const data2051 = JSON.parse(fs.readFileSync(path.join(out, 'data', '2051.json'), 'utf8'));
		assert.ok(data1951.days[0].date === '1951-01-08' && data2051.days.at(-1).date === '2051-02-11', 'Data files should respect the supported range');
		const ld = JSON.parse(yearPage.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
		assert.deepEqual(ld['@graph'].map(node => node['@type']), ['Dataset', 'FAQPage']);
		assert.ok(yearPage.includes('<dd>2027年2月7日（星期日），藏曆正月初一。</dd>') && yearPage.includes('<link rel="alternate" type="application/json" href="/data/2027.json">'), 'Year pages should answer festival dates in plain text and point to their data');
		assert.ok(fs.readFileSync(path.join(out, '1977', 'index.html'), 'utf8').includes('藏历十二月三十（原日为缺日，提前一天）'), 'A Losar moved for a skipped day should say so');
	} finally { fs.rmSync(out, { recursive: true, force: true }); }
}

console.log('Product checks passed: locale data, time zones, pages, PWA assets and 514 subscription events.');
