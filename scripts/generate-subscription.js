const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({ console, trans: value => value, Map, Date, Math, String, Number, Object, Array, RegExp, Boolean });
vm.runInContext(fs.readFileSync(path.join(root, 'zangli.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'eclipse.js'), 'utf8'), context);

const events = vm.runInContext(`(function () {
	const output = [];
	for (let date = new Date(2026, 0, 1, 12); date <= new Date(2030, 11, 31, 12); date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 12)) {
		const zangli = getZangli(date);
		const eclipse = getEclipse(date);
		if ((zangli.extraInfo && zangli.extraInfo !== '&nbsp;') || eclipse.value) {
			output.push({
				year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(),
				title: String(zangli.extraInfo || eclipse.value).replace(/<br>/g, ' '),
				detail: [zangli.extraInfo2, eclipse.value].filter(Boolean).join(' · '),
				tibetan: zangli.year + '年' + (zangli.monthLeap ? '闰' : '') + zangli.monthNumber + '月' + zangli.dayNumber + '日'
			});
		}
	}
	return output;
})()`, context);

const pad = value => String(value).padStart(2, '0');
const dateKey = event => `${event.year}${pad(event.month)}${pad(event.day)}`;
const nextKey = event => {
	const next = new Date(Date.UTC(event.year, event.month - 1, event.day + 1));
	return `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
};
const escapeIcs = value => String(value || '').replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n');
const foldIcsLine = line => {
	const chunks = [];
	let chunk = '';
	for (const character of line) {
		if (Buffer.byteLength(chunk + character, 'utf8') > 70) {
			const hadTrailingSpace = chunk.endsWith(' ');
			chunks.push(chunk.trimEnd());
			chunk = `${hadTrailingSpace ? ' ' : ''}${character}`;
		}
		else chunk += character;
	}
	chunks.push(chunk);
	return chunks.join('\r\n ');
};
const lines = [
	'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//zangli.org//Tibetan Calendar//ZH-CN',
	'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:百年藏历殊胜日 2026–2030',
	'X-WR-CALDESC:来自 zangli.org 的藏历节日与日月食；按公历全天事件订阅。'
];
for (const event of events) {
	const iso = `${event.year}-${pad(event.month)}-${pad(event.day)}`;
	lines.push(
		'BEGIN:VEVENT', `UID:${iso}@zangli.org`, 'DTSTAMP:20260716T000000Z',
		`DTSTART;VALUE=DATE:${dateKey(event)}`, `DTEND;VALUE=DATE:${nextKey(event)}`,
		`SUMMARY:${escapeIcs(event.title)}`, `DESCRIPTION:${escapeIcs(`藏历：${event.tibetan}。${event.detail}`)}`,
		`URL:https://zangli.org/date/${iso}`, 'TRANSP:TRANSPARENT',
		'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-P1D', `DESCRIPTION:${escapeIcs(event.title)}`, 'END:VALARM',
		'END:VEVENT'
	);
}
lines.push('END:VCALENDAR');
fs.mkdirSync(path.join(root, 'calendar'), { recursive: true });
fs.writeFileSync(path.join(root, 'calendar', 'zangli-special-days.ics'), `${lines.map(foldIcsLine).join('\r\n')}\r\n`);
console.log(`Generated ${events.length} subscription events.`);
