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
	for (const id of ['basisButton','basisAction','selectedDay','selectedDayContent','nextSpecialDay','calendarWorkspace','annualPanel','annualRangeControls','reversePanel','aboutPanel','settingsDialog','dateDiscrepancy']) {
		assert.ok(html.includes(`id="${id}"`), `${file} missing ${id}`);
	}
	assert.ok(html.includes(`v=${ASSET_VERSION}`));
	assert.ok(!html.includes('class="hero-context"'), `${file} should not give date-basis metadata a full-width hero row`);
	assert.ok(html.indexOf('id="dateDiscrepancy"') > html.indexOf('id="settingsDialog"'), `${file} should keep the detailed date discrepancy inside settings`);
}
for (const file of ['index.html','tw/index.html','en/index.html']) assert.ok(!read(file).includes('value="bo"'), `${file} should not expose the Tibetan beta in the language switcher`);
assert.ok(read('bo/index.html').includes('<option value="bo" selected hidden>'), 'The hidden Tibetan route should identify its current language without exposing a public option');
assert.ok(read('index.html').includes('<option value="4">四月（萨嘎月）</option>'));
assert.ok(read('index.html').includes('<option value="20">二十</option>'));
assert.ok(read('bo/index.html').includes('<option value="20">ཚེས་ ༢༠</option>'));
assert.ok(!read('js/app.js').includes("dayShort: '初{day}'"));
assert.ok(!read('js/langDetect.js').includes("preference = 'bo'"));

for (const file of ['widget/index.html','sw.js']) {
	const versions = [...read(file).matchAll(/\?v=(\d{8}-\d+)/g)].map(match => match[1]);
	assert.ok(versions.length, `${file} should contain versioned assets`);
	assert.ok(versions.every(version => version === ASSET_VERSION), `${file} asset versions should match release-config`);
}
assert.ok(read('sw.js').includes(`const CACHE_NAME = 'zangli-${ASSET_VERSION}';`));

const style = read('css/style.css');
assert.ok(style.includes('grid-template-columns: max-content minmax(0, 1fr)'), 'Date labels should size to their translated text');
assert.ok(style.includes(':root:not([data-theme])'), 'System dark mode should have a CSS-only first-paint fallback');
assert.ok(style.includes('grid-template-columns: repeat(3, minmax(0, 1fr))'), 'All three tool tabs should fit in the narrow mobile layout');
assert.ok(read('js/app.js').includes("timeZoneName:'shortOffset'"), 'The compact date-basis label should use a language-neutral GMT offset');

const luminance = hex => {
	const channels = hex.match(/[a-f\d]{2}/gi).map(channel => parseInt(channel, 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
	return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
};
const festivalContrast = (luminance('f4aaa2') + .05) / (luminance('4b2926') + .05);
assert.ok(festivalContrast >= 4.5, `Dark festival label contrast should be at least 4.5:1, received ${festivalContrast.toFixed(2)}:1`);

for (const file of ['manifest.json','tw/manifest.json','en/manifest.json','bo/manifest.json']) JSON.parse(read(file));
for (const file of ['css/style.css','css/widget.css','js/app.js','js/widget.js','js/i18n-data.js','js/i18n.js','zangli.js','eclipse.js','calendar/zangli-special-days.ics']) {
	assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
}

const ics = read('calendar/zangli-special-days.ics');
assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 501);
assert.equal((ics.match(/END:VEVENT/g) || []).length, 501);
assert.equal((ics.match(/BEGIN:VALARM/g) || []).length, 501);
assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
assert.ok(ics.split('\r\n').every(line => Buffer.byteLength(line, 'utf8') <= 75), 'ICS lines must be folded at 75 octets');

console.log('Product checks passed: locale data, time zones, pages, PWA assets and 501 subscription events.');
