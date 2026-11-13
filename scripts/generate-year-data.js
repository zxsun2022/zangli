// 年度数据（D023）：每年一个 /data/YYYY.json，逐日写出藏历月日、节日、日月食、理发吉日与飞幡日，
// 供 AI 代理和程序直接读取（月历页面本身由 JavaScript 生成，抓取时是空壳）。另有 /data/index.json 列出全部年份。
// 与年份页一样只在 `npm run build` 时生成到发布目录，不读系统时钟：结果只取决于源码和 ASSET_VERSION。
const fs = require('fs');
const path = require('path');
const { ASSET_VERSION } = require('./release-config');
const { runtime, FIRST_YEAR, LAST_YEAR, yearHref } = require('./generate-year-pages');

const SITE = 'https://zangli.org';
const LANGUAGES = [['zh-CN', 'zh-cn'], ['zh-TW', 'tw'], ['en', 'en']];
const ANNUAL_IDS = new Set(['losar', 'chotrul', 'buddha-birth', 'saka-dawa', 'chokhor', 'buddha-conception', 'lhabab', 'ganden-ngamcho']);
const ELEMENTS = ['iron', 'water', 'wood', 'fire', 'earth'];
const ANIMALS = ['tiger', 'rabbit', 'dragon', 'snake', 'horse', 'sheep', 'monkey', 'bird', 'dog', 'pig', 'mouse', 'ox'];
const title = value => value.replace(/(^|-)(\w)/g, (match, dash, letter) => `${dash ? ' ' : ''}${letter.toUpperCase()}`);
// eclipse.js 的类型名（简体，带“有”字）到稳定代号。
const ECLIPSE_KINDS = { 日全食: 'total-solar', 日偏食: 'partial-solar', 日环食: 'annular-solar', 混合日食: 'hybrid-solar', 月全食: 'total-lunar', 月偏食: 'partial-lunar', 半影月食: 'penumbral-lunar' };
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = value => String(value).padStart(2, '0');
const clean = value => String(value || '').replace(/<br\s*\/?>/g, '').replace(/&nbsp;/g, '').trim();
const RULES = 'Dates follow the published Tibetan, Gregorian and Chinese Lunar Calendar Comparison (1951–2050). Observances follow the actual Tibetan month and day: annual observances never fall in a leap month, a repeated day carries its observance on its first occurrence, and an observance on a skipped day moves one day earlier (listed in observedEarly). Hair-cutting and no-prayer-flag days follow the Tibetan date and are not moved for skipped days. Eclipses are filed by Beijing (UTC+8) date; maximumUTC is the time of greatest eclipse. Monasteries, traditions and other published calendars can differ.';

// 按语言调用：contexts 以 locale（zh-cn/tw/en）为键，结果以语言标签（zh-CN/zh-TW/en）为键。
function localized(contexts, read) {
	return Object.fromEntries(LANGUAGES.map(([tag, locale]) => [tag, read(contexts[locale])]));
}

function eachTag(results, read) {
	return Object.fromEntries(LANGUAGES.map(([tag]) => [tag, read(results[tag])]));
}

function buildYear(contexts, year) {
	const zh = contexts['zh-cn'];
	const observances = {};
	const tibetanYears = {};
	const haircut = {};
	const days = [];
	for (let month = 1; month <= 12; month++) {
		const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
		for (let day = 1; day <= daysInMonth; day++) {
			const date = { year, month, day };
			const base = zh.getZangli(date);
			if (base.value === 'error') continue;
			const results = localized(contexts, ctx => ctx.getZangli(date));
			const yearId = `${ELEMENTS[base.elementIndex]}-${ANIMALS[base.animalIndex]}`;
			tibetanYears[yearId] ||= { 'zh-CN': results['zh-CN'].year, 'zh-TW': results['zh-TW'].year, en: title(yearId) };
			const record = {
				date: `${year}-${pad(month)}-${pad(day)}`,
				weekday: WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()],
				tibetan: { year: yearId, month: base.monthNumber, leapMonth: base.monthLeap, day: base.dayNumber, ...(base.dayLeap ? { repeatedDay: true } : {}), ...(base.dayMiss ? { skippedBefore: base.omittedDaysBefore } : {}) }
			};
			if (base.events.length) {
				record.observances = base.events.map(event => event.id);
				const early = base.events.filter(event => event.shifted).map(event => event.id);
				if (early.length) record.observedEarly = early;
				base.events.forEach((event, index) => {
					if (observances[event.id]) return;
					const merit = eachTag(results, result => clean(result.events[index].merit));
					observances[event.id] = { annual: ANNUAL_IDS.has(event.id), name: eachTag(results, result => clean(result.events[index].title)), ...(merit.en ? { merit } : {}) };
				});
			}
			const eclipse = zh.getEclipse(date);
			if (eclipse.value) {
				const names = localized(contexts, ctx => clean(ctx.getEclipse(date).value).replace(/^有/, ''));
				record.eclipse = { kind: ECLIPSE_KINDS[clean(eclipse.value).replace(/^有/, '')], name: names, maximumUTC: new Date(eclipse.maximumTimestamp).toISOString().replace('.000Z', 'Z') };
			}
			if (base.haircut) {
				record.haircut = true;
				haircut[base.dayNumber] ||= eachTag(results, result => result.haircut);
			}
			if (base.flagAvoid) record.noPrayerFlags = true;
			days.push(record);
		}
	}
	return {
		year,
		description: `Day-by-day Gregorian–Tibetan calendar for ${year} from zangli.org (百年藏曆).`,
		pages: Object.fromEntries(LANGUAGES.map(([tag, locale]) => [tag, `${SITE}${yearHref(locale, year)}`])),
		documentation: `${SITE}/llms.txt`,
		version: ASSET_VERSION,
		rules: RULES,
		fields: {
			'tibetan.year': 'key into tibetanYears (element-animal year)',
			'tibetan.month / tibetan.day': 'Tibetan month (1–12) and day (1–30); leapMonth marks the intercalary month',
			'tibetan.repeatedDay': 'second occurrence of a doubled Tibetan day',
			'tibetan.skippedBefore': 'Tibetan day numbers omitted just before this day',
			observances: 'keys into observances; observedEarly lists those moved one day earlier for a skipped day',
			haircut: 'traditional hair-cutting day; meaning in haircutMeanings by Tibetan day',
			noPrayerFlags: 'not a day for hanging prayer flags',
			eclipse: 'eclipse filed on this Beijing date; maximumUTC is greatest eclipse'
		},
		tibetanYears,
		observances,
		haircutMeanings: haircut,
		days
	};
}

function generateYearData(outputRoot) {
	const contexts = Object.fromEntries(LANGUAGES.map(([, locale]) => [locale, runtime(locale)]));
	const dir = path.join(outputRoot, 'data');
	fs.mkdirSync(dir, { recursive: true });
	const years = [];
	for (let year = FIRST_YEAR; year <= LAST_YEAR; year++) {
		fs.writeFileSync(path.join(dir, `${year}.json`), `${JSON.stringify(buildYear(contexts, year))}\n`);
		years.push({ year, url: `${SITE}/data/${year}.json` });
	}
	const index = {
		name: '百年藏曆 Tibetan Calendar data',
		description: 'Gregorian–Tibetan date crosswalk with observances, eclipses, hair-cutting and prayer-flag days, one file per Gregorian year.',
		coverage: { from: '1951-01-08', to: '2051-02-11' },
		documentation: `${SITE}/llms.txt`,
		version: ASSET_VERSION,
		rules: RULES,
		years
	};
	fs.writeFileSync(path.join(dir, 'index.json'), `${JSON.stringify(index, null, '\t')}\n`);
	return years.length;
}

module.exports = { generateYearData };

if (require.main === module) {
	const output = path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist'));
	console.log(`Generated ${generateYearData(output)} yearly data files into ${output}.`);
}
