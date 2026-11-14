const $ = id => document.getElementById(id);
const pad = value => String(value).padStart(2, '0');
const locale = window.ZANGLI_LOCALE || 'zh-cn';
const routeLocale = locale === 'zh-cn' ? '' : locale;
const basePath = routeLocale ? `/${routeLocale}/` : '/';
const intlLocale = { 'zh-cn': 'zh-CN', tw: 'zh-TW', en: 'en-CA', bo: 'bo' }[locale];
const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const BEIJING_TIME_ZONE = 'Asia/Shanghai';

function readStorage(key, fallback) {
	try { return localStorage.getItem(key) ?? fallback; }
	catch (error) { return fallback; }
}

function writeStorage(key, value) {
	try { localStorage.setItem(key, value); return true; }
	catch (error) { return false; }
}

const messages = {
	today: '今天', localBasis: '设备本地日期', beijingBasis: '北京时间日期',
	lookupNote: '查询《百年历书》的公历日期', deviceZone: '设备时区',
	discrepancy: '当前本地日期为 {local}，北京日期为 {beijing}。页面按“{basis}”显示。',
	basisCompact: '{basis} · {zone}',
	nextIn: '{days} 天后', nextTomorrow: '明天', noNext: '支持范围内没有找到下一殊胜日',
 noEvents: '这一年没有匹配的日期。', yearTitle: '{year} 年', exportYear: '下载 {year} 年 .ics', skippedEarly: '缺日，提前一天',

	repeated: '重日', skipped: '缺日', leapMonth: '闰月', localEclipse: '你的时区', beijingEclipse: '北京时区',
	eclipseArchive: '日月食按北京时间日期归档；能否看到以及当地接触时刻取决于地理位置。',
	calendarExported: '日历文件已生成', reminderExported: '提醒文件已生成，可导入系统日历',
	installShare: '点浏览器的“分享”按钮', installAddHome: '选择“添加到主屏幕”', installConfirm: '点“添加”完成',
	installShareToolbar: '点工具栏的“分享”按钮', installAddDock: '选择“添加到程序坞”',
	installMenu: '打开浏览器菜单', installAndroidAdd: '选择“安装应用”或“添加到主屏幕”',
	installAddressBar: '点地址栏右侧的安装图标', installDesktopMenu: '或在浏览器菜单中选择“安装百年藏历”',
	installInAppMenu: '点右上角的“···”', installOpenBrowser: '选择“在浏览器中打开”', installThen: '再按这里的步骤安装',
	installed: '已安装到桌面', offlineReady: '页面已可离线使用',
	copied: '日期信息已复制', linkCopied: '分享内容已复制',
	shiftedObservance: '{title}：藏历{day}缺日，提前至本日',
	festival: '节日', multiplier: '功德增广日', eclipse: '日月食', all: '全部',
	haircut: '理发吉日', flagAvoid: '飞幡日', flagAvoidNote: '不宜悬挂经幡', yearTableLink: '查看 {year} 年藏历对照表 →',



	gregorian: '公历', tibetan: '藏历', sourceBadge: '历书对照', dateBasis: '日期口径',
	yearSuffix: '年', monthSuffix: '月', daySuffix: '日', weekdayPrefix: '周',
	monthTitle: '{year} 年 {month} 月', monthShort: '{month}月', dayShort: '{day}',
	viewDetails: '查看详情', observance: '殊胜日',
	icsDescription: '百年藏历：{tibetan}。{detail}',
	openSource: '数据开源', copiedTitle: '百年藏历',
	install: '安装', themeDark: '切换到深色模式', themeLight: '切换到浅色模式'
};

const englishMessages = {
	today:'Today',localBasis:'Device-local date',beijingBasis:'Beijing date',lookupNote:'Gregorian date used to query the published crosswalk',deviceZone:'Device time zone',
	discrepancy:'Your local date is {local}; the Beijing date is {beijing}. This page is using “{basis}.”',basisCompact:'{basis} · {zone}',nextIn:'In {days} days',nextTomorrow:'Tomorrow',noNext:'No later observance was found in the supported range',noEvents:'No matching dates this year.',yearTitle:'{year}',exportYear:'Download {year} .ics',skippedEarly:'Skipped day, one day early',repeated:'Repeated day',skipped:'Skipped day',leapMonth:'Leap month',localEclipse:'Your time zone',beijingEclipse:'Beijing time',eclipseArchive:'Eclipses are filed by Beijing date. Visibility and local contact times depend on location.',calendarExported:'Calendar file created',reminderExported:'Reminder file created; import it into your calendar',installShare:'Tap the browser’s Share button',installAddHome:'Choose “Add to Home Screen”',installConfirm:'Tap “Add”',installShareToolbar:'Click Share in the toolbar',installAddDock:'Choose “Add to Dock”',installMenu:'Open the browser menu',installAndroidAdd:'Choose “Install app” or “Add to Home screen”',installAddressBar:'Click the install icon at the right of the address bar',installDesktopMenu:'Or choose “Install Tibetan Calendar” in the browser menu',installInAppMenu:'Tap “···” in the top-right corner',installOpenBrowser:'Choose “Open in browser”',installThen:'Then follow these steps again',installed:'Installed',offlineReady:'Offline access is ready',copied:'Date details copied',linkCopied:'Share text copied',shiftedObservance:'{title}: Tibetan day {day} is skipped this month, so it is observed one day early',festival:'Observance',multiplier:'Multiplier day',eclipse:'Eclipse',all:'All',haircut:'Hair-cutting day',yearTableLink:'Full {year} Tibetan calendar →',flagAvoid:'No prayer flags',flagAvoidNote:'Not a day for hanging prayer flags',gregorian:'Gregorian',tibetan:'Tibetan',sourceBadge:'Published crosswalk',dateBasis:'Date basis',yearSuffix:'',monthSuffix:'',daySuffix:'',weekdayPrefix:'',monthTitle:'{month} {year}',monthShort:'Month {month}',dayShort:'Day {day}',viewDetails:'View details',observance:'Observance',icsDescription:'Tibetan calendar: {tibetan}. {detail}',openSource:'Open-source data',copiedTitle:'Tibetan Calendar',install:'Install',themeDark:'Switch to dark mode',themeLight:'Switch to light mode'
};

const tibetanMessages = {
	today:'དེ་རིང་།',localBasis:'ས་གནས་ཀྱི་ཚེས།',beijingBasis:'པེ་ཅིང་གི་ཚེས།',festival:'དུས་ཆེན།',multiplier:'དགེ་བ་འཕེལ་བའི་ཉིན།',eclipse:'ཉི་ཟླ་འཛིན་པ།',gregorian:'སྤྱི་ལོ།',tibetan:'བོད་ཟླ།',dateBasis:'ཚེས་གྲངས་ཀྱི་གཞི།',monthShort:'ཟླ་ {month}',dayShort:'ཚེས་ {day}',repeated:'ཚེས་ལྷག།',skipped:'ཚེས་ཆད།',leapMonth:'ཟླ་བཤོལ།',viewDetails:'ཞིབ་ཕྲ།',observance:'དུས་ཆེན།',install:'Install'
};

function msg(key, values = {}) {
	let value = locale === 'en' ? (englishMessages[key] || messages[key] || key)
		: locale === 'bo' ? (tibetanMessages[key] || englishMessages[key] || messages[key] || key)
		: trans(messages[key] || key);
	for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, replacement);
	return value;
}

const state = {
	basis: readStorage('zangli-date-basis', 'local') === 'beijing' ? 'beijing' : 'local',
	theme: readStorage('zangli-theme', 'system'),
	selectedDate: null,
	focusDate: null,
	activeDate: null,
	previousFocus: null,
	detailCloseTimer: null,
	annualEvents: [],
	annualYear: null,
	annualRenderedYear: null,
	deferredInstallPrompt: null,
	nextLabel: '',
	baseTitle: document.title,
	picker: { year: null, page: null, closeTimer: null }
};

function escapeHTML(value) {
	return String(value).replace(/[&<>'"]/g, character => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' })[character]);
}

function stripHTML(value) {
	const container = document.createElement('div');
	container.innerHTML = value || '';
	return container.textContent.trim();
}

function createLocalDate(year, month, day) {
	const date = new Date(year, month - 1, day, 12, 0, 0);
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function addDays(date, days) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12, 0, 0);
}

function formatDate(date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dateInTimeZone(now, timeZone) {
	const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(now);
	const values = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
	return createLocalDate(values.year, values.month, values.day);
}

function getBasisTimeZone() {
	return state.basis === 'beijing' ? BEIJING_TIME_ZONE : deviceTimeZone;
}

function getToday() {
	return dateInTimeZone(new Date(), getBasisTimeZone());
}

function isSupportedDate(date) {
	return Boolean(date && date >= startDate && date <= endDate);
}

function clampDate(date) {
	if (!date || Number.isNaN(date.getTime())) return getToday();
	if (date < startDate) return new Date(startDate);
	if (date > endDate) return new Date(endDate);
	return date;
}

function isSameDate(first, second) {
	return Boolean(first && second) && formatDate(first) === formatDate(second);
}

function parseRouteDate() {
	const match = location.pathname.match(/\/date\/(\d{4})-(\d{2})-(\d{2})\/?$/);
	return match ? createLocalDate(Number(match[1]), Number(match[2]), Number(match[3])) : null;
}

function parseHashDate() {
	const match = location.hash.match(/^#(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
	return match ? createLocalDate(Number(match[1]), Number(match[2]), Number(match[3])) : null;
}

function getRequestedDate() {
	return clampDate(parseRouteDate() || parseHashDate() || getToday());
}

function getYearLabel(zangli) {
	if (locale === 'en') {
		const elements = ['Iron','Water','Wood','Fire','Earth'];
		const animals = ['Tiger','Rabbit','Dragon','Snake','Horse','Sheep','Monkey','Bird','Dog','Pig','Mouse','Ox'];
		return `${elements[zangli.elementIndex]} ${animals[zangli.animalIndex]}`;
	}
	if (locale === 'bo') {
		const elements = ['ལྕགས','ཆུ','ཤིང','མེ','ས'];
		const animals = ['སྟག','ཡོས','འབྲུག','སྦྲུལ','རྟ','ལུག','སྤྲེལ','བྱ','ཁྱི','ཕག','བྱི','གླང'];
		return `${elements[zangli.elementIndex]} ${animals[zangli.animalIndex]}`;
	}
	return trans(zangli.year);
}

function toTibetanDigits(value) {
	return String(value).replace(/\d/g, digit => '༠༡༢༣༤༥༦༧༨༩'[Number(digit)]);
}

function formatTibetanDate(zangli, compact = false) {
	const leapMonth = zangli.monthLeap ? (locale === 'en' ? 'Leap ' : locale === 'bo' ? 'ཟླ་བཤོལ་ ' : trans('闰')) : '';
	const repeated = zangli.dayLeap ? (locale === 'en' ? 'Repeated ' : locale === 'bo' ? 'ཚེས་ལྷག་ ' : '') : '';
	if (locale === 'en') return `${compact ? '' : `${getYearLabel(zangli)} · `}${leapMonth}Month ${zangli.monthNumber}, ${repeated}Day ${zangli.dayNumber}`;
	if (locale === 'bo') return `${compact ? '' : `${getYearLabel(zangli)} · `}${leapMonth}ཟླ་ ${toTibetanDigits(zangli.monthNumber)} · ${repeated}ཚེས་ ${toTibetanDigits(zangli.dayNumber)}`;
	const year = compact ? '' : `${getYearLabel(zangli)}${trans('年')} · `;
	const repeatedStatus = zangli.dayLeap ? `（${msg('repeated')}）` : '';
	return `${year}${leapMonth}${getZangliMonthOrdinal(zangli.monthNumber)}${trans('月')}（${getZangliTraditionalMonth(zangli.monthNumber)}${trans('月')}）${getZangliDayName(zangli.dayNumber)}${repeatedStatus}`;
}

// 主行只写月日；传统月名、年份与重日、缺日退为旁注，首屏、详情和列表共用同一层次。
function tibetanParts(zangli) {
	const month = zangli.monthNumber, day = zangli.dayNumber;
	const status = [zangli.dayLeap ? msg('repeated') : '', zangli.dayMiss ? msg('skipped') : ''].filter(Boolean);
	if (locale === 'en') return { main: `${zangli.monthLeap ? 'Leap ' : ''}Month ${month} · Day ${day}`, notes: [getYearLabel(zangli), ...status] };
	if (locale === 'bo') return { main: `${zangli.monthLeap ? 'ཟླ་བཤོལ་ ' : ''}ཟླ་ ${toTibetanDigits(month)} · ཚེས་ ${toTibetanDigits(day)}`, notes: [getYearLabel(zangli), ...status] };
	return {
		main: `${zangli.monthLeap ? trans('闰') : ''}${getZangliMonthOrdinal(month)}${trans('月')}${getZangliDayName(day)}`,
		notes: [`${getZangliTraditionalMonth(month)}${trans('月')}`, `${getYearLabel(zangli)}${trans('年')}`, ...status]
	};
}

function tibetanNotesHTML(zangli) {
	return `<p class="tibetan-notes">${tibetanParts(zangli).notes.map(note => `<span>${escapeHTML(note)}</span>`).join('')}</p>`;
}

function isTibetanMonthStart(zangli) {
	return zangli.dayNumber === 1 || (zangli.dayNumber === 2 && zangli.dayMiss);
}

function formatTibetanCalendarCell(zangli) {
	const showMonth = isTibetanMonthStart(zangli);
	if (locale === 'en') return showMonth
		? msg('monthShort', { month: `${zangli.monthLeap ? 'Leap ' : ''}${zangli.monthNumber}` })
		: msg('dayShort', { day: String(zangli.dayNumber) });
	if (locale === 'bo') return showMonth
		? `${zangli.monthLeap ? 'ཟླ་བཤོལ་ ' : ''}ཟླ་ ${toTibetanDigits(zangli.monthNumber)}`
		: `ཚེས་ ${toTibetanDigits(zangli.dayNumber)}`;
	return showMonth
		? `${zangli.monthLeap ? trans('闰') : ''}${getZangliMonthOrdinal(zangli.monthNumber)}${trans('月')}`
		: getZangliDayName(zangli.dayNumber);
}

function formatGregorian(date, options = {}) {
	return new Intl.DateTimeFormat(intlLocale, { year:'numeric', month: options.short ? 'short' : 'long', day:'numeric', ...(options.weekday ? { weekday:'long' } : {}) }).format(date);
}

function formatMonthTitle(date) {
	if (locale === 'en') return new Intl.DateTimeFormat('en-CA', { year:'numeric', month:'long' }).format(date);
	if (locale === 'bo') return `${date.getFullYear()} · ཟླ་ ${date.getMonth() + 1}`;
	return msg('monthTitle', { year: String(date.getFullYear()), month: String(date.getMonth() + 1) });
}

function formatShortGregorian(date, weekday = false) {
	return new Intl.DateTimeFormat(intlLocale, { month:'short', day:'numeric', ...(weekday ? { weekday:'short' } : {}) }).format(date);
}

function formatAnnualMonth(date) {
	return new Intl.DateTimeFormat(intlLocale, { month:'long' }).format(date);
}

function formatZoneOffset(timeZone) {
	try {
		const zone = new Intl.DateTimeFormat(intlLocale, { timeZone, timeZoneName:'shortOffset' }).formatToParts(new Date()).find(part => part.type === 'timeZoneName');
		return zone ? zone.value : timeZone;
	} catch (error) { return timeZone; }
}

function cleanInfo(value) {
	return stripHTML(value || '').replace(/\s+/g, ' ');
}

function eventTypes(zangli, eclipse) {
	const types = [];
	if (cleanInfo(zangli.extraInfo)) types.push('festival');
	if (cleanInfo(zangli.extraInfo2)) types.push('multiplier');
	if (eclipse.value) types.push('eclipse');
	return types;
}

function eventTitle(event, fallback = true) {
	const titles = [];
	if (cleanInfo(event.zangli.extraInfo)) titles.push(cleanInfo(event.zangli.extraInfo));
	if (!titles.length && cleanInfo(event.zangli.extraInfo2)) titles.push(cleanInfo(event.zangli.extraInfo2));
	if (event.eclipse.value) titles.push(event.eclipse.value);
	return titles.join(' · ') || (fallback ? msg('observance') : '');
}

function scanEvents(from, to) {
	const events = [];
	for (let date = new Date(from); date <= to && date <= endDate; date = addDays(date, 1)) {
		if (!isSupportedDate(date)) continue;
		const zangli = getZangli(date);
		const eclipse = getEclipse(date);
		const types = eventTypes(zangli, eclipse);
		if (types.length) events.push({ date: new Date(date), zangli, eclipse, types });
	}
	return events;
}

function renderBasis() {
	const localToday = dateInTimeZone(new Date(), deviceTimeZone);
	const beijingToday = dateInTimeZone(new Date(), BEIJING_TIME_ZONE);
	const basisText = state.basis === 'beijing' ? msg('beijingBasis') : msg('localBasis');
	const zoneOffset = formatZoneOffset(getBasisTimeZone());
	$('basisLabel').textContent = msg('basisCompact', { basis:basisText, zone:zoneOffset });
	$('basisLabel').title = `${msg('lookupNote')} · ${zoneOffset}`;
	const notice = $('dateDiscrepancy');
	if (!isSameDate(localToday, beijingToday)) {
		notice.textContent = msg('discrepancy', { local: formatGregorian(localToday), beijing: formatGregorian(beijingToday), basis: basisText });
		notice.hidden = false;
	} else notice.hidden = true;
	document.querySelectorAll('input[name="dateBasis"]').forEach(input => { input.checked = input.value === state.basis; });
}

function dayEventsHTML(zangli, eclipse) {
	const festival = cleanInfo(zangli.extraInfo);
	const multiplier = cleanInfo(zangli.extraInfo2);
	const lines = [];
	if (festival || multiplier) lines.push(`<p class="day-event ${festival ? 'festival' : 'multiplier'}"><strong>${escapeHTML(festival || multiplier)}</strong>${festival && multiplier ? `<span>${escapeHTML(multiplier)}</span>` : ''}</p>`);
	if (eclipse.value) lines.push(`<p class="day-event eclipse"><strong>${escapeHTML(eclipse.value)}</strong></p>`);
	return lines.join('');
}

// 理发吉日与飞幡日只取决于藏历月日，放在节日之后，作为次一级的备注。
function dayNotesHTML(zangli) {
	const notes = [];
	if (zangli.haircut) notes.push([msg('haircut'), zangli.haircut]);
	if (zangli.flagAvoid) notes.push([msg('flagAvoid'), msg('flagAvoidNote')]);
	return notes.length ? `<dl class="day-notes">${notes.map(([term, text]) => `<div><dt>${escapeHTML(term)}</dt><dd>${escapeHTML(text)}</dd></div>`).join('')}</dl>` : '';
}

// 首屏卡片始终是“今天”；其他日期通过月历打开详情查看，翻月不会改变这里。
function renderSelectedDay() {
	const today = clampDate(getToday());
	const zangli = getZangli(today);
	$('selectedDayContent').innerHTML = `<p class="today-line"><span class="section-kicker">${escapeHTML(msg('today'))}</span><span>${escapeHTML(formatGregorian(today, { weekday:true }))}</span></p><p class="tibetan-date">${escapeHTML(tibetanParts(zangli).main)}</p>${tibetanNotesHTML(zangli)}${dayEventsHTML(zangli, getEclipse(today))}${dayNotesHTML(zangli)}`;
}

// 今天的殊胜日已在首屏卡片中，这里从明天起找下一个。
function renderNextEvent() {
	const today = clampDate(getToday());
	const event = scanEvents(addDays(today, 1), addDays(today, 370))[0];
	if (!event) {
		$('nextSpecialDay').innerHTML = `<p class="section-kicker">${escapeHTML(state.nextLabel)}</p><p class="next-empty">${escapeHTML(msg('noNext'))}</p>`;
		return;
	}
	const days = Math.round((event.date - today) / 86400000);
	const distance = days === 1 ? msg('nextTomorrow') : msg('nextIn', { days: String(days) });
	const typeClass = event.types.includes('festival') ? 'festival' : event.types[0];
	$('nextSpecialDay').innerHTML = `<button class="next-link ${typeClass}" type="button" data-open-date="${formatDate(event.date)}"><span class="next-head"><span class="section-kicker">${escapeHTML(state.nextLabel)}</span><span class="next-distance">${escapeHTML(distance)}</span></span><strong class="next-title">${escapeHTML(eventTitle(event))}</strong><span class="next-date">${escapeHTML(formatShortGregorian(event.date, true))} · ${escapeHTML(tibetanParts(event.zangli).main)}</span></button>`;
}

function populatePeriodSelects(date) {
	const yearSelect = $('year');
	const monthSelect = $('month');
	if (!yearSelect.options.length) {
		for (let year = 1951; year <= 2051; year++) yearSelect.appendChild(new Option(msg('yearTitle', { year: String(year) }), year));
		for (let month = 1; month <= 12; month++) {
			const label = locale === 'en' ? formatAnnualMonth(new Date(2000, month - 1, 1, 12)) : locale === 'bo' ? `ཟླ་ ${month}` : trans(`${month} 月`);
			monthSelect.appendChild(new Option(label, month));
		}
	}
	yearSelect.value = date.getFullYear();
	monthSelect.value = date.getMonth() + 1;
}

function renderCalendar(date) {
	const tbody = document.querySelector('.calendar-table tbody');
	tbody.replaceChildren();
	// 星期与天数按公历计算，不经过本地时区：有些时区跳过了整天（如 Pacific/Apia 2011-12-30），本地没有这一天。
	const year = date.getFullYear(), monthIndex = date.getMonth();
	const weekdayOf = day => new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
	const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
	const today = getToday();
	const inMonth = candidate => candidate && candidate.getFullYear() === date.getFullYear() && candidate.getMonth() === date.getMonth() && isSupportedDate(candidate);
	const rovingDate = [state.focusDate, state.selectedDate, today].find(inMonth);
	let row = tbody.insertRow();
	for (let index = 0; index < weekdayOf(1); index++) row.insertCell().className = 'empty-cell';
	for (let day = 1; day <= daysInMonth; day++) {
		const current = createLocalDate(year, monthIndex + 1, day);
		if (weekdayOf(day) === 0 && day !== 1) row = tbody.insertRow();
		const cell = row.insertCell();
		// 本地时区不存在的日子（current 为 null）与支持范围外的日子一样，显示为不可选。
		if (!current || !isSupportedDate(current)) {
			cell.className = 'out-of-range'; cell.innerHTML = `<span class="day-number">${day}</span>`; continue;
		}
		const zangli = getZangli(current);
		const eclipse = getEclipse(current);
		const types = eventTypes(zangli, eclipse);
		cell.dataset.date = formatDate(current);
		cell.tabIndex = -1;
		cell.setAttribute('role', 'gridcell');
		cell.setAttribute('aria-selected', String(isSameDate(current, state.selectedDate)));
		cell.classList.toggle('today', isSameDate(current, today));
		if (isSameDate(current, today)) cell.setAttribute('aria-current', 'date');
		cell.classList.toggle('selected', isSameDate(current, state.selectedDate));
		cell.classList.toggle('month-start', isTibetanMonthStart(zangli));
		for (const type of types) cell.classList.add(`has-${type}`);
		const shortTibetan = formatTibetanCalendarCell(zangli);
		const eventLabel = eventTitle({ zangli, eclipse }, false);
		const label = `${formatGregorian(current, { weekday:true })}. ${formatTibetanDate(zangli)}${eventLabel ? `. ${eventLabel}` : ''}${zangli.haircut ? `. ${msg('haircut')}` : ''}`;
		cell.setAttribute('aria-label', label);
		cell.title = label;
		cell.innerHTML = `<span class="day-number">${day}</span><span class="lunar-date">${escapeHTML(shortTibetan)}</span><span class="cell-meta"><span class="cell-event wide">${escapeHTML(cleanInfo(zangli.extraInfo) || eclipse.value || '')}</span><span class="cell-markers" aria-hidden="true">${types.map(type => `<i class="${type}-marker"></i>`).join('')}${zangli.haircut ? '<i class="haircut-marker"></i>' : ''}</span></span>`;
	}
	while (row.cells.length < 7) row.insertCell().className = 'empty-cell';
	const rovingCell = (rovingDate && calendarCell(rovingDate)) || tbody.querySelector('td[data-date]');
	if (rovingCell) rovingCell.tabIndex = 0;
}

function calendarCell(date) {
	return document.querySelector(`.calendar-table td[data-date="${formatDate(date)}"]`);
}

// 月历整体只占一个 Tab 停靠点，落在最近操作的格子上。
function setRovingCell(cell) {
	document.querySelectorAll('.calendar-table td[tabindex="0"]').forEach(other => { other.tabIndex = -1; });
	cell.tabIndex = 0;
}

function annualEventIndicators(types) {
	return `<span class="cell-markers" aria-label="${escapeHTML(types.map(type => msg(type)).join(' · '))}">${types.map(type => `<i class="${type}-marker"></i>`).join('')}</span>`;
}

const annualObservanceIds = new Set(zangliAnnualObservances.map(rule => rule.id));

// 默认只列年度节日与日月食，一年约十条；每月例行殊胜日需要时再打开。
function hasAnnualObservance(event) {
	return event.zangli.events.some(item => annualObservanceIds.has(item.id));
}

function isAnnualEvent(event) {
	return event.types.includes('eclipse') || hasAnnualObservance(event);
}

// 只看年度节日时，例行殊胜日的圆点不应出现在日月食那一行。
function annualTypes(event) {
	return event.types.filter(type => type === 'eclipse' || (type === 'festival' && hasAnnualObservance(event)));
}

function annualTitle(event) {
	const titles = event.zangli.events.filter(item => annualObservanceIds.has(item.id)).map(item => cleanInfo(item.title));
	if (event.eclipse.value) titles.push(event.eclipse.value);
	return titles.join(' · ');
}

function annualDetail(event) {
	const merits = event.zangli.events.filter(item => annualObservanceIds.has(item.id)).map(item => cleanInfo(item.merit)).filter(Boolean);
	return [...merits, event.eclipse.value].filter(Boolean).join(' · ');
}

function annualVisibleEvents() {
	return $('annualRoutine').checked ? state.annualEvents : state.annualEvents.filter(isAnnualEvent);
}

function renderAnnualList(revealUpcoming = false) {
	const year = state.annualYear;
	if (state.annualRenderedYear !== year) {
		state.annualRenderedYear = year;
		// 用可顺延的构造：个别时区没有 1 月 1 日或 12 月 31 日（如 Pacific/Kiritimati 1994-12-31）。
		const first = new Date(year, 0, 1, 12), last = new Date(year, 11, 31, 12);
		const from = first < startDate ? startDate : first;
		const to = last > endDate ? endDate : last;
		// 12 月 31 日不存在的时区（如 Pacific/Kiritimati 1994-12-31）会把终点顺延到次年 1 月 1 日，所以按年份再筛一次。
		state.annualEvents = scanEvents(from, to).filter(event => event.date.getFullYear() === year);
	}
	$('annualYear').textContent = msg('yearTitle', { year: String(year) });
	$('annualPrevYear').disabled = year <= startDate.getFullYear();
	$('annualNextYear').disabled = year >= endDate.getFullYear();
	$('exportYearButton').textContent = msg('exportYear', { year: String(year) });
	const tableLink = $('annualTableLink');
	if (tableLink) { tableLink.href = `${basePath}${year}/`; tableLink.textContent = msg('yearTableLink', { year: String(year) }); }
	const routine = $('annualRoutine').checked;
	const events = annualVisibleEvents();
	const today = getToday();
	const list = $('annualList');
	list.replaceChildren();
	if (!events.length) {
		list.innerHTML = `<li class="empty-state">${escapeHTML(msg('noEvents'))}</li>`;
		return;
	}
	let renderedMonth = -1;
	for (const event of events) {
		if (routine && event.date.getMonth() !== renderedMonth) {
			renderedMonth = event.date.getMonth();
			const heading = document.createElement('li');
			heading.className = 'annual-month';
			heading.textContent = formatAnnualMonth(event.date);
			list.appendChild(heading);
		}
		const item = document.createElement('li');
		item.className = `event-row${event.date < today && !isSameDate(event.date, today) ? ' past' : ''}`;
		item.innerHTML = `<button type="button" data-open-date="${formatDate(event.date)}"><time datetime="${formatDate(event.date)}"><strong>${escapeHTML(formatShortGregorian(event.date, true))}</strong><span>${escapeHTML(tibetanParts(event.zangli).main)}</span></time><span class="event-copy">${annualEventIndicators(routine ? event.types : annualTypes(event))}<strong>${escapeHTML(routine ? eventTitle(event) : annualTitle(event))}</strong></span></button>`;
		list.appendChild(item);
	}
	// 全年例行殊胜日有一百多行：打开时把今天之后的第一条带到眼前，不必滚过已经过去的月份。
	const upcoming = revealUpcoming && routine && list.querySelector('.event-row.past') ? list.querySelector('.event-row:not(.past)') : null;
	if (upcoming) upcoming.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'center' });
}

function changeAnnualYear(delta) {
	state.annualYear = Math.min(endDate.getFullYear(), Math.max(startDate.getFullYear(), state.annualYear + delta));
	renderAnnualList();
}

function renderApp(date = getRequestedDate()) {
	date = clampDate(date);
	populatePeriodSelects(date);
	$('year').value = date.getFullYear();
	$('month').value = date.getMonth() + 1;
	$('monthTitle').textContent = formatMonthTitle(date);
	renderBasis();
	renderSelectedDay();
	renderCalendar(date);
	renderNextEvent();
	updateTodayButton();
	updateFooterTableLink();
	if (!$('annualPanel').hidden) renderAnnualList();
}

// 页脚的年份对照表链接跟随“今天”所在的年份；静态 HTML 里的发布年份只是没有 JavaScript 时的后备。
function updateFooterTableLink() {
	const link = $('footerTableLink');
	if (!link) return;
	const year = String(clampDate(getToday()).getFullYear());
	link.href = `${basePath}${year}/`;
	link.textContent = link.textContent.replace(/\d{4}/, year);
}

// 已在今天所在月份且没有选中其他日期时，“今天”按钮无事可做，只在视觉上弱化；它仍可点击，所以不标 aria-disabled。
function updateTodayButton() {
	const today = getToday();
	const atToday = Number($('year').value) === today.getFullYear() && Number($('month').value) === today.getMonth() + 1
		&& (!state.selectedDate || isSameDate(state.selectedDate, today));
	$('todayButton').classList.toggle('is-current', atToday);
}

function navigateTo(year, month, day = 1) {
	const target = clampDate(new Date(year, month - 1, day, 12, 0, 0));
	const hash = `#${target.getFullYear()}/${target.getMonth() + 1}/${target.getDate()}`;
	const monthDelta = target.getFullYear() * 12 + target.getMonth() + 1 - (Number($('year').value) * 12 + Number($('month').value));
	if (location.pathname !== basePath) history.replaceState({}, '', `${basePath}${hash}`);
	// 翻月只替换当前历史记录：否则翻几十个月后要按同样多次“后退”才能离开页面。
	else if (location.hash !== hash) history.replaceState({}, '', hash);
	renderApp(target);
	if (monthDelta) slideMonth(monthDelta > 0 ? 'next' : 'prev');
	// 只有月历顶部已滚出视口时才回滚，避免翻月把首屏卡片推走。
	const workspace = $('calendarWorkspace');
	if (workspace.getBoundingClientRect().top < 0) workspace.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' });
}

function slideMonth(direction) {
	const body = document.querySelector('.calendar-table tbody');
	body.classList.remove('slide-next', 'slide-prev');
	void body.offsetWidth;
	body.classList.add(`slide-${direction}`);
}

function changeMonth(delta) { navigateTo(Number($('year').value), Number($('month').value) + delta); }
function changeYear(delta) { navigateTo(Number($('year').value) + delta, Number($('month').value)); }
function goToToday() { const today = getToday(); state.selectedDate = null; state.focusDate = null; navigateTo(today.getFullYear(), today.getMonth() + 1, today.getDate()); }

function parseDataDate(value) {
	const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
	return match ? createLocalDate(Number(match[1]), Number(match[2]), Number(match[3])) : null;
}

function eclipseTime(timestamp, timeZone) {
	return new Intl.DateTimeFormat(intlLocale, { timeZone, year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', hour12:false }).format(new Date(timestamp));
}

function buildDetailHTML(date) {
	const zangli = getZangli(date);
	const eclipse = getEclipse(date);
	let html = `<h2 id="detailTitle">${escapeHTML(formatGregorian(date, { weekday:true }))}</h2><p class="detail-tibetan">${escapeHTML(tibetanParts(zangli).main)}</p>${tibetanNotesHTML(zangli)}`;
	const events = dayEventsHTML(zangli, eclipse);
	if (events) {
		const shiftedNotes = zangli.events.filter(event => event.shifted).map(event => `<p class="fine-print">${escapeHTML(msg('shiftedObservance', { title: cleanInfo(event.title), day: locale === 'en' || locale === 'bo' ? String(event.dayNumber) : getZangliDayName(event.dayNumber) }))}</p>`).join('');
		html += `<section class="detail-section">${events}${shiftedNotes}`;
		if (eclipse.maximumTimestamp) html += `<dl class="time-grid"><div><dt>${escapeHTML(msg('localEclipse'))}</dt><dd>${escapeHTML(eclipseTime(eclipse.maximumTimestamp, deviceTimeZone))}</dd></div><div><dt>${escapeHTML(msg('beijingEclipse'))}</dt><dd>${escapeHTML(eclipseTime(eclipse.maximumTimestamp, BEIJING_TIME_ZONE))}</dd></div></dl>`;
		if (eclipse.value) html += `<p class="fine-print">${escapeHTML(msg('eclipseArchive'))}</p>`;
		html += '</section>';
	}
	const notes = dayNotesHTML(zangli);
	if (notes) html += `<section class="detail-section">${notes}</section>`;
	return html;
}

// 选中状态在关闭详情后保留，标出“刚才看的是哪天”；只改相关格子，不重绘月历，以免丢失焦点恢复目标。
function markSelected(date) {
	state.selectedDate = date;
	for (const cell of document.querySelectorAll('.calendar-table td[data-date]')) {
		const selected = cell.dataset.date === formatDate(date);
		cell.classList.toggle('selected', selected);
		cell.setAttribute('aria-selected', String(selected));
	}
	const cell = calendarCell(date);
	if (cell) setRovingCell(cell);
	updateTodayButton();
}

function openDetail(date, anchor) {
	if (!isSupportedDate(date)) return;
	state.activeDate = date;
	markSelected(date);
	state.previousFocus = anchor || document.activeElement;
	$('detailContent').innerHTML = buildDetailHTML(date);
	const dialog = $('detailDialog');
	if (state.detailCloseTimer) { clearTimeout(state.detailCloseTimer); state.detailCloseTimer = null; }
	dialog.classList.toggle('bottom-sheet', innerWidth <= 720);
	if (!dialog.open) dialog.showModal();
	requestAnimationFrame(() => dialog.classList.add('active'));
	$('closeDetailButton').focus();
	const path = `${basePath}date/${formatDate(date)}`;
	if (location.pathname !== path) history.pushState({ detail:true }, '', path);
	// 标签页、浏览器历史和收藏里能分辨是哪一天。
	document.title = `${formatGregorian(date)} · ${tibetanParts(getZangli(date)).main} · ${msg('copiedTitle')}`;
}

function closeDetail(updateHistory = true) {
	const dialog = $('detailDialog');
	if (!dialog.open || state.detailCloseTimer) return;
	dialog.classList.remove('active');
	document.title = state.baseTitle;
	if (updateHistory && location.pathname !== basePath) history.replaceState({}, '', `${basePath}#${state.activeDate.getFullYear()}/${state.activeDate.getMonth() + 1}/${state.activeDate.getDate()}`);
	const previous = state.previousFocus;
	// 浏览器后退等路径会在关闭后重绘月历，原来的格子节点已断开；记下日期，重绘后按日期找回新格子。
	const focusDates = [previous && previous.dataset ? previous.dataset.date : '', formatDate(state.activeDate)];
	state.activeDate = null;
	state.detailCloseTimer = setTimeout(() => {
		state.detailCloseTimer = null;
		if (dialog.open) dialog.close();
		const target = previous && previous.isConnected ? previous
			: focusDates.map(value => value && document.querySelector(`.calendar-table td[data-date="${value}"]`)).find(Boolean) || document.querySelector('.calendar-table td[tabindex="0"]');
		if (!target) return;
		if (target.matches('.calendar-table td')) setRovingCell(target);
		target.focus();
	}, 160);
}

// A click on the dialog element itself lands either on ::backdrop or on the card's own
// padding ring; only the former should dismiss it.
function isBackdropClick(dialog, event) {
	if (event.target !== dialog) return false;
	const box = dialog.getBoundingClientRect();
	return !(event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom);
}

function handleDetailBackdropClick(event) {
	if (isBackdropClick($('detailDialog'), event)) closeDetail();
}

/* 年月面板：一页 12 个年份（按 1950 起每 12 年分页，2026 年在 2022–2033 页）加 12 个月。
 * 选年份只改面板里的年份，选月份才跳转并关闭。桌面端贴在标题下方，手机端从底部弹出。
 * 两个网格各只占一个 Tab 停靠点，方向键在格子之间移动，PageUp / PageDown 翻 12 年。
 */
const PICKER_FIRST_PAGE = 1950;
const PICKER_PAGE_SIZE = 12;
const PICKER_COLUMNS = 4;
const pickerFirstYear = () => startDate.getFullYear();
const pickerLastYear = () => endDate.getFullYear();

function pickerPageStart(year) {
	return PICKER_FIRST_PAGE + Math.floor((year - PICKER_FIRST_PAGE) / PICKER_PAGE_SIZE) * PICKER_PAGE_SIZE;
}

function pickerMonthLabel(month) {
	if (locale === 'en') return new Intl.DateTimeFormat('en-CA', { month:'short' }).format(new Date(2000, month - 1, 1, 12));
	if (locale === 'bo') return `ཟླ་ ${toTibetanDigits(month)}`;
	return trans(`${month} 月`);
}

function isPickerMonthSupported(year, month) {
	const last = new Date(year, month, 0, 12);
	const first = new Date(year, month - 1, 1, 12);
	return last >= startDate && first <= endDate;
}

function pickerCell({ label, value, pressed, today, disabled, focusable }) {
	return `<button class="picker-cell${today ? ' is-today' : ''}" type="button" data-value="${value}" aria-pressed="${pressed}" tabindex="${focusable ? 0 : -1}"${disabled ? ' disabled' : ''}>${escapeHTML(label)}</button>`;
}

function renderPeriodPicker() {
	const { year, page } = state.picker;
	const shownYear = Number($('year').value), shownMonth = Number($('month').value);
	const today = getToday();
	const years = Array.from({ length: PICKER_PAGE_SIZE }, (_, index) => page + index);
	const enabledYears = years.filter(value => value >= pickerFirstYear() && value <= pickerLastYear());
	const yearStop = years.includes(year) ? year : enabledYears[0];
	$('pickerRange').textContent = `${enabledYears[0]} – ${enabledYears[enabledYears.length - 1]}`;
	$('pickerPrev').disabled = page <= pickerFirstYear();
	$('pickerNext').disabled = page + PICKER_PAGE_SIZE > pickerLastYear();
	$('pickerYears').innerHTML = years.map(value => pickerCell({
		label: String(value), value, pressed: value === year, today: value === today.getFullYear(),
		disabled: value < pickerFirstYear() || value > pickerLastYear(), focusable: value === yearStop
	})).join('');
	const monthStop = year === shownYear ? shownMonth : (year === today.getFullYear() ? today.getMonth() + 1 : 1);
	$('pickerMonths').innerHTML = Array.from({ length: 12 }, (_, index) => index + 1).map(month => pickerCell({
		label: pickerMonthLabel(month), value: month, pressed: year === shownYear && month === shownMonth,
		today: year === today.getFullYear() && month === today.getMonth() + 1,
		disabled: !isPickerMonthSupported(year, month), focusable: month === monthStop && isPickerMonthSupported(year, month)
	})).join('');
	if (!$('pickerMonths').querySelector('[tabindex="0"]')) $('pickerMonths').querySelector('.picker-cell:not(:disabled)')?.setAttribute('tabindex', '0');
}

function positionPeriodPicker() {
	const dialog = $('periodPicker');
	const sheet = innerWidth <= 720;
	dialog.classList.toggle('bottom-sheet', sheet);
	if (sheet) { dialog.style.top = ''; dialog.style.left = ''; dialog.style.maxHeight = ''; return; }
	// 下方放得下就向下展开，否则向上；两边都不够时贴住视口底边，面板内部滚动。
	const margin = 12, gap = 6;
	const anchor = $('periodButton').getBoundingClientRect();
	dialog.style.maxHeight = `${innerHeight - margin * 2}px`;
	const height = dialog.offsetHeight;
	const below = innerHeight - anchor.bottom - gap - margin;
	const above = anchor.top - gap - margin;
	const top = height <= below ? anchor.bottom + gap : height <= above ? anchor.top - gap - height : Math.max(margin, innerHeight - margin - height);
	dialog.style.top = `${Math.round(top)}px`;
	dialog.style.left = `${Math.round(Math.max(12, Math.min(anchor.left, innerWidth - dialog.offsetWidth - 12)))}px`;
}

function openPeriodPicker() {
	const dialog = $('periodPicker');
	if (state.picker.closeTimer) { clearTimeout(state.picker.closeTimer); state.picker.closeTimer = null; }
	const year = Number($('year').value);
	state.picker.year = year;
	state.picker.page = pickerPageStart(year);
	renderPeriodPicker();
	if (!dialog.open) dialog.showModal();
	positionPeriodPicker();
	$('periodButton').setAttribute('aria-expanded', 'true');
	requestAnimationFrame(() => dialog.classList.add('active'));
	$('pickerYears').querySelector('[tabindex="0"]')?.focus();
}

function closePeriodPicker() {
	const dialog = $('periodPicker');
	if (!dialog.open || state.picker.closeTimer) return;
	dialog.classList.remove('active');
	$('periodButton').setAttribute('aria-expanded', 'false');
	state.picker.closeTimer = setTimeout(() => {
		state.picker.closeTimer = null;
		if (dialog.open) dialog.close();
		$('periodButton').focus();
	}, 140);
}

function turnPickerPage(delta, focusGrid = false) {
	const page = state.picker.page + delta * PICKER_PAGE_SIZE;
	if (page + PICKER_PAGE_SIZE <= pickerFirstYear() || page > pickerLastYear()) return;
	state.picker.page = page;
	renderPeriodPicker();
	if (focusGrid) $('pickerYears').querySelector('[tabindex="0"]')?.focus();
}

function handlePeriodPickerClick(event) {
	if (isBackdropClick($('periodPicker'), event)) { closePeriodPicker(); return; }
	const cell = event.target.closest('.picker-cell');
	if (!cell || cell.disabled) return;
	const value = Number(cell.dataset.value);
	if (cell.parentElement.id === 'pickerYears') {
		state.picker.year = value;
		renderPeriodPicker();
		$('pickerYears').querySelector(`[data-value="${value}"]`)?.focus();
		return;
	}
	const year = state.picker.year;
	closePeriodPicker();
	if (year !== Number($('year').value) || value !== Number($('month').value)) navigateTo(year, value);
}

// 方向键在同一网格内移动；年份网格左右越界时翻页。
function handlePeriodPickerKeydown(event) {
	const cell = event.target.closest?.('.picker-cell');
	if (!cell) return;
	const grid = cell.parentElement;
	if (grid.id === 'pickerYears' && (event.key === 'PageUp' || event.key === 'PageDown')) {
		event.preventDefault(); turnPickerPage(event.key === 'PageUp' ? -1 : 1, true); return;
	}
	const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -PICKER_COLUMNS, ArrowDown: PICKER_COLUMNS };
	const cells = [...grid.querySelectorAll('.picker-cell')];
	const index = cells.indexOf(cell);
	let target = null;
	if (event.key in steps) {
		const next = index + steps[event.key];
		if (grid.id === 'pickerYears' && (next < 0 || next >= cells.length)) {
			const year = Number(cell.dataset.value) + steps[event.key];
			if (year < pickerFirstYear() || year > pickerLastYear()) { event.preventDefault(); return; }
			event.preventDefault();
			turnPickerPage(next < 0 ? -1 : 1);
			target = $('pickerYears').querySelector(`[data-value="${year}"]`);
		} else target = cells[next];
	} else if (event.key === 'Home') target = cells.find(item => !item.disabled);
	else if (event.key === 'End') target = [...cells].reverse().find(item => !item.disabled);
	if (event.key in steps || event.key === 'Home' || event.key === 'End') event.preventDefault();
	if (!target || target.disabled) return;
	grid.querySelectorAll('.picker-cell').forEach(item => { item.tabIndex = -1; });
	target.tabIndex = 0;
	target.focus();
}

function initPeriodPicker() {
	$('periodButton').addEventListener('click', openPeriodPicker);
	$('pickerPrev').addEventListener('click', () => turnPickerPage(-1));
	$('pickerNext').addEventListener('click', () => turnPickerPage(1));
	$('periodPicker').addEventListener('click', handlePeriodPickerClick);
	$('periodPicker').addEventListener('keydown', handlePeriodPickerKeydown);
	$('periodPicker').addEventListener('cancel', event => { event.preventDefault(); closePeriodPicker(); });
	// 面板贴着标题定位：页面滚动或窗口变化时跟着移动。
	addEventListener('scroll', () => { if ($('periodPicker').open) positionPeriodPicker(); }, { passive:true });
	addEventListener('resize', () => { if ($('periodPicker').open) positionPeriodPicker(); });
}

function openDateFromElement(element) {
	const date = parseDataDate(element.dataset.openDate || element.closest('[data-date]')?.dataset.date);
	if (date) openDetail(date, element);
}

function copyText(text, success) {
	const fallback = () => {
		const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove(); showToast(success);
	};
	if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(text).then(() => showToast(success), fallback); else fallback();
}

function activeDateText() {
	if (!state.activeDate) return '';
	const zangli = getZangli(state.activeDate); const eclipse = getEclipse(state.activeDate);
	return [`${msg('gregorian')}: ${formatGregorian(state.activeDate, { weekday:true })}`, `${msg('tibetan')}: ${formatTibetanDate(zangli)}`, cleanInfo(zangli.extraInfo), cleanInfo(zangli.extraInfo2), eclipse.value, zangli.haircut ? `${msg('haircut')}: ${zangli.haircut}` : '', zangli.flagAvoid ? `${msg('flagAvoid')}: ${msg('flagAvoidNote')}` : ''].filter(Boolean).join('\n');
}

function copyDateInfo() { copyText(activeDateText(), msg('copied')); }

// 链接并入正文、只分享一段文本：iOS 把单独的 url 字段作为第二个附件交给微信等应用，
// 收到的人会看到文本和一个无法识别的小文件。
function shareDate() {
	if (!state.activeDate) return;
	const url = `${location.origin}${basePath}date/${formatDate(state.activeDate)}`;
	const text = `${activeDateText()}\n${url}`;
	if (navigator.share) navigator.share({ title: msg('copiedTitle'), text }).catch(error => { if (error.name !== 'AbortError') copyText(text, msg('linkCopied')); });
	else copyText(text, msg('linkCopied'));
}

function escapeIcs(value) { return String(value).replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n'); }

function foldIcsLine(line) {
	const chunks = [];
	let chunk = '';
	for (const character of line) {
		if (new TextEncoder().encode(chunk + character).length > 70) {
			const hadTrailingSpace = chunk.endsWith(' ');
			chunks.push(chunk.trimEnd());
			chunk = `${hadTrailingSpace ? ' ' : ''}${character}`;
		} else chunk += character;
	}
	chunks.push(chunk);
	return chunks.join('\r\n ');
}

function createIcs(events, calendarName) {
	const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//zangli.org//Tibetan Calendar//EN','CALSCALE:GREGORIAN',`X-WR-CALNAME:${escapeIcs(calendarName)}`];
	for (const event of events) {
		const next = addDays(event.date, 1);
		// 年度导出只含年度节日时，标题与说明沿用列表的投影（D017），UID 仍按全部类型生成，重复导入时覆盖而不重复。
		const title = event.title || eventTitle(event);
		const detail = event.detail ?? [cleanInfo(event.zangli.extraInfo2), event.eclipse.value].filter(Boolean).join(' · ');
		lines.push('BEGIN:VEVENT',`UID:${formatDate(event.date)}-${event.types.join('-')}@zangli.org`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,`DTSTART;VALUE=DATE:${formatDate(event.date).replaceAll('-', '')}`,`DTEND;VALUE=DATE:${formatDate(next).replaceAll('-', '')}`,`SUMMARY:${escapeIcs(title)}`,`DESCRIPTION:${escapeIcs(msg('icsDescription', { tibetan: formatTibetanDate(event.zangli), detail }))}`,`URL:https://zangli.org${basePath}date/${formatDate(event.date)}`,'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY',`DESCRIPTION:${escapeIcs(title)}`,'END:VALARM','END:VEVENT');
	}
	lines.push('END:VCALENDAR');
	return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

function downloadFile(name, content, type) {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const link = document.createElement('a'); link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function addReminder() {
	if (!state.activeDate) return;
	const zangli = getZangli(state.activeDate), eclipse = getEclipse(state.activeDate);
	const event = { date: state.activeDate, zangli, eclipse, types: eventTypes(zangli, eclipse).length ? eventTypes(zangli, eclipse) : ['festival'] };
	downloadFile(`zangli-${formatDate(state.activeDate)}.ics`, createIcs([event], msg('copiedTitle')), 'text/calendar;charset=utf-8');
	showToast(msg('reminderExported'));
}

function exportAnnual() {
	const year = state.annualYear;
	const routine = $('annualRoutine').checked;
	const events = routine ? annualVisibleEvents() : annualVisibleEvents().map(event => ({ ...event, title: annualTitle(event), detail: annualDetail(event) }));
	downloadFile(`zangli-${year}${routine ? '-all' : ''}.ics`, createIcs(events, `${msg('copiedTitle')} ${year}`), 'text/calendar;charset=utf-8');
	showToast(msg('calendarExported'));
	$('exportYearButton').closest('details').open = false;
}

// 从今天所在的藏历年起列出五个藏历年里的对应日期；闰月照列并标注，缺日按惯例提前一天。
function renderReverseResults() {
	const month = Number($('reverseMonth').value), day = Number($('reverseDay').value);
	const today = clampDate(getToday());
	const firstYear = getZangli(today).yearIndex;
	const groups = new Map();
	for (let date = clampDate(addDays(today, -400)); isSupportedDate(date); date = addDays(date, 1)) {
		const zangli = getZangli(date);
		if (zangli.yearIndex > firstYear + 4) break;
		if (zangli.yearIndex < firstYear || zangli.monthNumber !== month) continue;
		let result = null;
		if (zangli.dayNumber === day) result = { date: new Date(date), zangli };
		else if (zangli.omittedDaysBefore.includes(day)) {
			const earlier = addDays(date, -1);
			if (isSupportedDate(earlier)) result = { date: earlier, zangli: getZangli(earlier), skipped: true };
		} else if (day === 30 && zangli.dayNumber === 29 && isSupportedDate(addDays(date, 1))) {
			// 月末的三十缺日不会出现在任何一天的 omittedDaysBefore 里：廿九之后直接换月，就是这种情况。
			const next = getZangli(addDays(date, 1));
			if (next.monthNumber !== zangli.monthNumber || next.monthLeap !== zangli.monthLeap) result = { date: new Date(date), zangli, skipped: true };
		}
		if (!result) continue;
		if (!groups.has(zangli.yearIndex)) groups.set(zangli.yearIndex, []);
		groups.get(zangli.yearIndex).push(result);
	}
	const rows = [];
	for (const results of groups.values()) {
		rows.push(`<li class="annual-month">${escapeHTML(locale === 'en' || locale === 'bo' ? getYearLabel(results[0].zangli) : `${getYearLabel(results[0].zangli)}${trans('年')}`)}</li>`);
		for (const result of results) {
			const tags = [result.zangli.monthLeap && !result.skipped ? msg('leapMonth') : '', result.zangli.dayLeap ? msg('repeated') : '', result.skipped ? msg('skippedEarly') : ''].filter(Boolean);
			const past = result.date < today && !isSameDate(result.date, today);
			rows.push(`<li class="event-row${past ? ' past' : ''}"><button type="button" data-open-date="${formatDate(result.date)}"><time datetime="${formatDate(result.date)}"><strong>${escapeHTML(formatShortGregorian(result.date, true))}</strong><span>${result.date.getFullYear()}</span></time><span class="event-copy"><strong>${escapeHTML(cleanInfo(result.zangli.extraInfo) || tibetanParts(result.zangli).main)}</strong>${tags.map(tag => `<i class="result-tag">${escapeHTML(tag)}</i>`).join('')}</span></button></li>`);
		}
	}
	$('reverseResults').innerHTML = rows.join('');
}

function showToast(message) {
	const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = message; toast.setAttribute('role', 'status'); document.body.appendChild(toast); requestAnimationFrame(() => toast.classList.add('active')); setTimeout(() => { toast.classList.remove('active'); setTimeout(() => toast.remove(), 180); }, 2200);
}

function switchLanguage(value) {
	try { localStorage.setItem('zangli-language', value === 'zh-cn' ? 'zh-cn' : value); } catch (error) {}
	const suffix = location.pathname.match(/\/date\/\d{4}-\d{2}-\d{2}\/?$/)?.[0] || '';
	const prefix = value === 'zh-cn' ? '/' : `/${value}/`;
	location.href = suffix ? `${prefix}${suffix.replace(/^\//, '')}` : `${prefix}${location.hash}`;
}

function applyTheme(theme = state.theme) {
	state.theme = theme;
	const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.dataset.theme = dark ? 'dark' : 'light';
	$('themeButton').setAttribute('aria-label', msg(dark ? 'themeLight' : 'themeDark'));
}

function toggleTheme() {
	const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
	writeStorage('zangli-theme', next); applyTheme(next);
}

function activatePanel(button) {
	const shouldOpen = $(button.dataset.panel).hidden;
	document.querySelectorAll('.tool-tab').forEach(tab => {
		const active = tab === button && shouldOpen;
		tab.classList.toggle('active', active);
		tab.setAttribute('aria-expanded', String(active));
		$(tab.dataset.panel).hidden = !active;
	});
	if (shouldOpen && button.dataset.panel === 'annualPanel') renderAnnualList();
	if (shouldOpen && button.dataset.panel === 'reversePanel') renderReverseResults();
	// 面板在入口下方展开，常常落在视口之外；把入口带到顶部，让人看到点开了什么。
	// 等一帧再滚动：同一帧里面板刚从 hidden 变为可见，平滑滚动会被随后的布局打断。
	if (shouldOpen) requestAnimationFrame(() => {
		if ($(button.dataset.panel).getBoundingClientRect().bottom > innerHeight) {
			button.closest('.tools').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' });
		}
	});
}

function handleDocumentClick(event) {
	const openTarget = event.target.closest('[data-open-date], .calendar-table td[data-date]');
	if (openTarget) { openDateFromElement(openTarget); return; }
	document.querySelectorAll('details.calendar-menu[open]').forEach(menu => { if (!menu.contains(event.target)) menu.open = false; });
	if (event.target.closest('[data-open-settings]')) { $('settingsDialog').showModal(); return; }
	const tab = event.target.closest('.tool-tab');
	if (tab) activatePanel(tab);
}

function shiftMonths(date, months) {
	const first = new Date(date.getFullYear(), date.getMonth() + months, 1, 12);
	// 月份天数按公历（UTC）计算：本地时区可能跳过某天（如 Pacific/Kiritimati 1994-12-31），本地末日会顺延到下月。
	const lastDay = new Date(Date.UTC(first.getFullYear(), first.getMonth() + 1, 0)).getUTCDate();
	const day = Math.min(date.getDate(), lastDay);
	// 目标日在本地时区不存在时，取同月的前一天或后一天。
	return createLocalDate(first.getFullYear(), first.getMonth() + 1, day) || createLocalDate(first.getFullYear(), first.getMonth() + 1, day - 1) || createLocalDate(first.getFullYear(), first.getMonth() + 1, day + 1) || new Date(first.getFullYear(), first.getMonth(), day, 12);
}

function calendarKeyTarget(date, event) {
	switch (event.key) {
		case 'ArrowLeft': return addDays(date, -1);
		case 'ArrowRight': return addDays(date, 1);
		case 'ArrowUp': return addDays(date, -7);
		case 'ArrowDown': return addDays(date, 7);
		case 'Home': return addDays(date, -date.getDay());
		case 'End': return addDays(date, 6 - date.getDay());
		case 'PageUp': return shiftMonths(date, event.shiftKey ? -12 : -1);
		case 'PageDown': return shiftMonths(date, event.shiftKey ? 12 : 1);
		default: return null;
	}
}

// 方向键只移动焦点，越过月界时翻月；选中只在 Enter / 空格打开详情时改变。
function moveCalendarFocus(target) {
	if (!isSupportedDate(target)) return;
	state.focusDate = target;
	if (target.getFullYear() !== Number($('year').value) || target.getMonth() + 1 !== Number($('month').value)) navigateTo(target.getFullYear(), target.getMonth() + 1, target.getDate());
	const cell = calendarCell(target);
	if (cell) { setRovingCell(cell); cell.focus(); }
}

function handleDocumentKeydown(event) {
	if (event.key === 'Escape') document.querySelectorAll('details.calendar-menu[open]').forEach(menu => { menu.open = false; menu.querySelector('summary').focus(); });
	const cell = event.target.closest?.('.calendar-table td[data-date]');
	if (!cell) return;
	if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDateFromElement(cell); return; }
	if (event.altKey || event.ctrlKey || event.metaKey) return;
	const target = calendarKeyTarget(parseDataDate(cell.dataset.date), event);
	if (target) { event.preventDefault(); moveCalendarFocus(target); }
}

function handleHistory() {
	const routeDate = parseRouteDate();
	if (routeDate) { renderApp(routeDate); openDetail(routeDate); }
	else { closeDetail(false); renderApp(parseHashDate() || getToday()); }
}

function initSettings() {
	$('settingsButton').addEventListener('click', () => $('settingsDialog').showModal());
	document.querySelectorAll('input[name="dateBasis"]').forEach(input => input.addEventListener('change', () => {
		state.basis = input.value; writeStorage('zangli-date-basis', state.basis); renderApp(getToday());
	}));
}

const stepIcon = paths => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const installIcons = {
	share: stepIcon('<path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'),
	addHome: stepIcon('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8.5v7M8.5 12h7"/>'),
	check: stepIcon('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
	dock: stepIcon('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M7 20h10M9 12h1.5M13.5 12H15"/>'),
	menu: stepIcon('<circle cx="12" cy="5.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor"/>'),
	dots: stepIcon('<circle cx="5.5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18.5" cy="12" r="1.2" fill="currentColor"/>'),
	install: stepIcon('<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 7.5v6M9.5 11l2.5 2.5 2.5-2.5M8 20h8"/>'),
	browser: stepIcon('<circle cx="12" cy="12" r="8"/><path d="m15 9-4 2-2 4 4-2z"/>')
};

// 只有部分浏览器提供安装弹窗；其余平台按设备给出两三步图示。
function installPlatform() {
	const ua = navigator.userAgent;
	if (/MicroMessenger|Weibo|QQ\/|DingTalk|AlipayClient/i.test(ua)) return 'inApp';
	if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
	if (/Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua)) return 'macSafari';
	if (/Android/.test(ua)) return 'android';
	if (/Firefox\//.test(ua)) return null;
	return 'desktop';
}

const installGuides = {
	ios: [['share', 'installShare'], ['addHome', 'installAddHome'], ['check', 'installConfirm']],
	macSafari: [['share', 'installShareToolbar'], ['dock', 'installAddDock']],
	android: [['menu', 'installMenu'], ['addHome', 'installAndroidAdd']],
	desktop: [['install', 'installAddressBar'], ['menu', 'installDesktopMenu']],
	inApp: [['dots', 'installInAppMenu'], ['browser', 'installOpenBrowser'], ['addHome', 'installThen']]
};

function isInstalled() {
	return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

async function startInstall() {
	if (state.deferredInstallPrompt) {
		const prompt = state.deferredInstallPrompt;
		state.deferredInstallPrompt = null;
		prompt.prompt();
		await prompt.userChoice.catch(() => {});
		return;
	}
	$('installSteps').innerHTML = installGuides[installPlatform()].map(([icon, key]) => `<li><span class="step-icon">${installIcons[icon]}</span><span>${escapeHTML(msg(key))}</span></li>`).join('');
	$('installDialog').showModal();
}

function initPwa() {
	if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then(() => console.info(msg('offlineReady'))).catch(() => {});
	$('installButton').hidden = isInstalled() || !installPlatform();
	window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); state.deferredInstallPrompt = event; $('installButton').hidden = false; });
	window.addEventListener('appinstalled', () => {
		state.deferredInstallPrompt = null;
		$('installButton').hidden = true;
		if ($('installDialog').open) $('installDialog').close();
		showToast(msg('installed'));
	});
	$('installButton').addEventListener('click', startInstall);
}

function initApp() {
	state.nextLabel = document.querySelector('#nextSpecialDay .section-kicker')?.textContent || msg('observance');
	const today = clampDate(getToday());
	const todayZangli = getZangli(today);
	state.annualYear = today.getFullYear();
	$('reverseMonth').value = todayZangli.monthNumber;
	$('reverseDay').value = todayZangli.dayNumber;
	applyTheme();
	$('languageSelect').addEventListener('change', event => switchLanguage(event.target.value));
	$('themeButton').addEventListener('click', toggleTheme);
	$('prevMonthButton').addEventListener('click', () => changeMonth(-1));
	$('nextMonthButton').addEventListener('click', () => changeMonth(1));
	$('prevYearButton').addEventListener('click', () => changeYear(-1));
	$('nextYearButton').addEventListener('click', () => changeYear(1));
	$('todayButton').addEventListener('click', goToToday);
	$('annualRoutine').addEventListener('change', () => renderAnnualList(true));

	$('annualPrevYear').addEventListener('click', () => changeAnnualYear(-1));
	$('annualNextYear').addEventListener('click', () => changeAnnualYear(1));
	$('exportYearButton').addEventListener('click', exportAnnual);
	$('reverseForm').addEventListener('change', renderReverseResults);
	$('reverseForm').addEventListener('submit', event => event.preventDefault());
	$('closeDetailButton').addEventListener('click', () => closeDetail());
	$('detailDialog').addEventListener('cancel', event => { event.preventDefault(); closeDetail(); });
	$('detailDialog').addEventListener('click', handleDetailBackdropClick);
	$('copyButton').addEventListener('click', copyDateInfo);
	$('shareButton').addEventListener('click', shareDate);
	$('reminderButton').addEventListener('click', addReminder);
	document.addEventListener('click', handleDocumentClick);
	document.addEventListener('keydown', handleDocumentKeydown);
	window.addEventListener('popstate', handleHistory);
	initSettings(); initPwa(); initPeriodPicker(); renderApp();
	const routeDate = parseRouteDate(); if (isSupportedDate(routeDate)) openDetail(routeDate);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp, { once:true }); else initApp();
