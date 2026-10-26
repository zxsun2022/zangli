// 历法核心测试：独立来源黄金样本、节日口径、历书表结构、连续性和跨时区一致性。
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const quiet = { error() {}, warn() {}, log() {} };

function loadCalendar() {
	const context = vm.createContext({ console: quiet, trans: value => value });
	vm.runInContext(`${read('zangli.js')}\nthis.specialDays = specialDays;`, context);
	vm.runInContext(read('eclipse.js'), context);
	return context;
}

const DAYS = 36560;
const isoForOffset = offset => new Date(Date.UTC(1951, 0, 8 + offset)).toISOString().slice(0, 10);
const civilNoon = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const eventIds = result => result.events.map(event => event.id);

// 子进程模式：输出全范围结果摘要，供不同 TZ 比较。
if (process.env.ZANGLI_TZ_DIGEST) {
	const { getZangli, getEclipse } = loadCalendar();
	const hash = crypto.createHash('sha256');
	for (let offset = 0; offset < DAYS; offset++) {
		const iso = isoForOffset(offset);
		// 某些时区历史上整日跳过（如 Pacific/Apia 的 2011-12-30），该日无法构造本地 Date，只比较字符串入参。
		const noon = civilNoon(iso);
		const dateExists = noon.getDate() === Number(iso.slice(8));
		const fromString = getZangli(iso), fromDate = dateExists ? getZangli(noon) : fromString;
		const eclipse = getEclipse(iso);
		hash.update(JSON.stringify([iso, fromDate.value, fromDate.events, fromString.value, fromString.events, eclipse.value, eclipse.extraInfo]));
	}
	process.stdout.write(hash.digest('hex'));
	process.exit(0);
}

const calendar = loadCalendar();
const { getZangli, getEclipse, specialDays } = calendar;
const failures = [];
function check(name, fn) {
	try { fn(); }
	catch (error) { failures.push(`${name}: ${error.message}`); }
}

// 1. 独立来源黄金样本
const golden = JSON.parse(read('tests/fixtures/zangli-golden.json'));
for (const sample of golden.samples) {
	check(`golden ${sample.date}`, () => {
		assert.ok(sample.evidence.length && sample.evidence.every(item => golden.sources[item.source] && item.locator), 'every sample needs a traceable source');
		const result = getZangli(sample.date);
		const { expect } = sample;
		if (expect.year) assert.deepEqual([result.year[0], result.year[1]], expect.year, 'year');
		for (const key of ['monthNumber', 'monthLeap', 'dayNumber', 'dayOccurrence']) {
			if (key in expect) assert.equal(result[key], expect[key], `${key} expected ${expect[key]}, received ${result[key]} (${result.value})`);
		}
		for (const id of expect.events || []) assert.ok(eventIds(result).includes(id), `missing event ${id}; received [${eventIds(result)}]`);
	});
}
for (const sample of golden.absent) {
	check(`golden absent ${sample.date}`, () => {
		const ids = eventIds(getZangli(sample.date));
		for (const id of sample.events) assert.ok(!ids.includes(id), `unexpected event ${id} (${getZangli(sample.date).value})`);
	});
}

// 2. 输入与支持范围契约
check('range boundaries', () => {
	assert.equal(getZangli(new Date(1951, 0, 8, 0, 0)).value !== 'error', true, 'start date at local midnight is supported');
	assert.equal(getZangli('1951-01-08').value !== 'error', true);
	assert.equal(getZangli('1951-01-07').value, 'error');
	assert.equal(getZangli('2051-02-11').value !== 'error', true);
	assert.equal(getZangli(new Date(2051, 1, 11, 23, 59)).value !== 'error', true);
	assert.equal(getZangli(new Date(2051, 1, 12, 0, 0)).value, 'error', 'the day after the end returns an explicit error');
	assert.equal(getZangli('2051-02-12').value, 'error');
});
check('invalid inputs', () => {
	for (const input of [new Date(NaN), NaN, Infinity, null, true, {}, 'not a date', '2026-02-30', '2026-13-01', { year: 2026, month: 2, day: 29 }]) {
		const result = getZangli(input);
		assert.equal(result.value, 'error', `${String(input)} should be rejected`);
		assert.ok(result.error, `${String(input)} should explain the error`);
		assert.deepEqual(Array.from(result.events), []);
	}
});
check('equivalent inputs', () => {
	const reference = getZangli(new Date(2026, 1, 18, 12)).value;
	for (const input of ['2026-02-18', '2026/2/18', ' 2026-02-18 ', { year: 2026, month: 2, day: 18 }, new Date(2026, 1, 18, 0, 0), new Date(2026, 1, 18, 23, 59), new Date(2026, 1, 18).getTime()]) {
		assert.equal(getZangli(input).value, reference, `${String(input)}`);
	}
});

// 3. 历书表结构
check('table structure', () => {
	assert.equal(specialDays.length, 101);
	assert.equal(specialDays[0].length, 1, 'the first block is only the twelfth month of 1950');
	let months = 0;
	specialDays.forEach((year, yearIndex) => {
		if (yearIndex > 0) assert.ok(year.length === 12 || year.length === 13, `year ${yearIndex} has ${year.length} months`);
		const leapMonths = year.filter(month => month.includes(0)).length;
		if (yearIndex > 0) assert.equal(leapMonths, year.length === 13 ? 1 : 0, `year ${yearIndex} leap marker count`);
		assert.ok(!year[0].includes(0), `year ${yearIndex} cannot start with a leap month`);
		for (const month of year) {
			months++;
			assert.equal(new Set(month).size, month.length, `duplicate entry ${month}`);
			for (const value of month) {
				assert.ok(Number.isInteger(value) && Math.abs(value) <= 30, `invalid entry ${value}`);
				if (value > 0) assert.ok(!month.includes(-value), `day ${value} both repeated and omitted`);
				if (value < 0) assert.ok(!month.includes(value - 1), `adjacent omitted days ${month}`);
			}
		}
	});
	assert.equal(months, 1238);
});

// 4. 用另一种写法直接展开同一张表，与 getZangli 全范围对照（同源数据，不是独立历书证据）
check('independent expansion of the table', () => {
	let offset = 0;
	specialDays.forEach((year, yearIndex) => {
		let monthNumber = yearIndex === 0 ? 11 : 0;
		for (const month of year) {
			const leap = month.includes(0);
			if (!leap) monthNumber++;
			for (let day = 1; day <= 30; day++) {
				if (month.includes(-day)) continue;
				const occurrences = month.includes(day) ? [1, 2] : [1];
				for (const occurrence of occurrences) {
					const iso = isoForOffset(offset++);
					const result = getZangli(iso);
					const actual = [result.yearIndex, result.monthNumber, result.monthLeap, result.dayNumber, result.dayOccurrence, result.dayMiss];
					const expected = [yearIndex, monthNumber, leap, day, occurrence, occurrence === 1 && day > 1 && month.includes(-(day - 1))];
					assert.deepEqual(actual, expected, `${iso}: expected ${expected}, received ${actual}`);
				}
			}
		}
	});
	assert.equal(offset, DAYS);
});

// 5. 节日口径（D011）：真实月号、闰月不过年度节日、重日取第一次、缺日提前一天
const results = Array.from({ length: DAYS }, (_, offset) => getZangli(isoForOffset(offset)));
const annualIds = ['chotrul', 'buddha-birth', 'saka-dawa', 'chokhor', 'buddha-conception', 'lhabab'];
const annualRules = { chotrul: [1, 1], 'buddha-birth': [4, 7], 'saka-dawa': [4, 15], chokhor: [6, 4], 'buddha-conception': [6, 15], lhabab: [9, 22] };
check('annual observances occur once per Tibetan year in the correct month', () => {
	const counts = new Map();
	results.forEach((result, offset) => {
		for (const event of result.events) {
			if (!annualIds.includes(event.id)) continue;
			assert.deepEqual([event.monthNumber, event.dayNumber, event.monthLeap], [...annualRules[event.id], false], `${isoForOffset(offset)} ${event.id}`);
			const key = `${event.yearIndex}:${event.id}`;
			counts.set(key, (counts.get(key) || 0) + 1);
		}
	});
	for (let yearIndex = 1; yearIndex <= 100; yearIndex++) {
		for (const id of annualIds) assert.equal(counts.get(`${yearIndex}:${id}`), 1, `Tibetan year ${yearIndex} ${id}`);
	}
});
check('every event targets its own date or the day before an omitted day', () => {
	results.forEach((result, offset) => {
		const iso = isoForOffset(offset);
		for (const event of result.events) {
			if (!event.shifted) {
				assert.equal(result.dayOccurrence, 1, `${iso} events belong only to the first occurrence of a repeated day`);
				assert.deepEqual([event.monthNumber, event.monthLeap, event.dayNumber], [result.monthNumber, result.monthLeap, result.dayNumber], iso);
			} else {
				const next = results[offset + 1];
				assert.ok(next, `${iso} shifted event without a following day`);
				const omitted = event.monthNumber === next.monthNumber && event.monthLeap === next.monthLeap
					? next.omittedDaysBefore.includes(event.dayNumber)
					: event.dayNumber === 30 || next.omittedDaysBefore.includes(event.dayNumber);
				assert.ok(omitted, `${iso} ${event.id} was shifted from a day that is not omitted`);
			}
		}
	});
});
check('policy examples', () => {
	// 缺日：1954 年九月廿二缺，天降日提前到廿一（与地藏王菩萨节日并存）。
	const lhabab1954 = getZangli('1954-11-16');
	assert.deepEqual([lhabab1954.monthNumber, lhabab1954.dayNumber], [9, 21]);
	assert.deepEqual(Array.from(eventIds(lhabab1954)), ['kshitigarbha', 'lhabab']);
	assert.equal(lhabab1954.events[1].shifted, true);
	assert.equal(lhabab1954.extraInfo, '地藏王菩萨节日 · 释迦牟尼佛天降日');
	// 重日：2025 年九月三十的节日只在第一次出现时标注。
	assert.deepEqual(Array.from(eventIds(getZangli('2025-11-19'))), ['shakyamuni']);
	assert.deepEqual(Array.from(eventIds(getZangli('2025-11-20'))), []);
	// 闰月：例行殊胜日照常出现，年度节日不进入闰月。
	const leapMonthDay = getZangli('1951-06-19');
	assert.deepEqual([leapMonthDay.monthNumber, leapMonthDay.monthLeap, leapMonthDay.dayNumber], [4, true, 15]);
	assert.deepEqual(Array.from(eventIds(leapMonthDay)), ['amitabha']);
});

// 6. 相邻公历日的藏历推进
check('day-to-day continuity', () => {
	for (let offset = 1; offset < DAYS; offset++) {
		const previous = results[offset - 1], current = results[offset], iso = isoForOffset(offset);
		const sameMonth = previous.yearIndex === current.yearIndex && previous.monthNumber === current.monthNumber && previous.monthLeap === current.monthLeap;
		if (current.dayOccurrence === 2) {
			assert.ok(sameMonth && previous.dayNumber === current.dayNumber && previous.dayOccurrence === 1, `${iso} repeated day must follow its first occurrence`);
		} else if (sameMonth) {
			assert.equal(current.dayNumber, previous.dayNumber + 1 + current.omittedDaysBefore.length, `${iso} advances by one plus omitted days`);
		} else {
			assert.equal(current.dayNumber, 1 + current.omittedDaysBefore.length, `${iso} starts a month`);
			assert.ok(previous.dayNumber >= 29, `${iso} previous month ended on day ${previous.dayNumber}`);
		}
	}
});

// 7. 日月食类型与时间尺度
check('eclipse samples', () => {
	const penumbral = getEclipse('2024-03-25');
	assert.equal(penumbral.value, '有半影月食');
	assert.equal(getEclipse('2024-09-18').value, '有月偏食');
	// NASA 目录 2024-04-08 日全食食甚：TD 18:18:29，ΔT 74 s，UT 18:17:15/16；北京时间已是 4 月 9 日。
	const total = getEclipse('2024-04-09');
	assert.equal(total.value, '有日全食');
	assert.ok(Math.abs(total.maximumTimestamp - Date.UTC(2024, 3, 8, 18, 17, 15)) <= 2000, new Date(total.maximumTimestamp).toISOString());
	assert.equal(getEclipse('1951-01-07').value, '', 'out-of-range or invalid input returns an empty result');
	assert.equal(getEclipse(null).value, '');
});

// 8. 跨时区一致性
const zones = ['UTC', 'Asia/Shanghai', 'America/Vancouver', 'Pacific/Apia'];
const digests = zones.map(zone => {
	const run = spawnSync(process.execPath, [__filename], { env: { ...process.env, TZ: zone, ZANGLI_TZ_DIGEST: '1' }, encoding: 'utf8' });
	if (run.status !== 0) failures.push(`time zone ${zone}: ${run.stderr}`);
	return run.stdout;
});
check('results do not depend on the runtime time zone', () => {
	zones.forEach((zone, index) => assert.equal(digests[index], digests[0], `${zone} differs from ${zones[0]}`));
});

if (failures.length) {
	console.error(`Calendar checks failed (${failures.length}):\n${failures.map(line => `- ${line}`).join('\n')}`);
	process.exit(1);
}
console.log(`Calendar checks passed: ${golden.samples.length + golden.absent.length} sourced samples, ${DAYS} days, observance policy and ${zones.length} time zones.`);
