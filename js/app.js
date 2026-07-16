const $ = id => document.getElementById(id);
const pad = value => String(value).padStart(2, '0');
const locale = window.ZANGLI_LOCALE || 'zh-cn';
const routeLocale = locale === 'zh-cn' ? '' : locale;
const basePath = routeLocale ? `/${routeLocale}/` : '/';
const intlLocale = { 'zh-cn': 'zh-CN', tw: 'zh-TW', en: 'en-CA', bo: 'bo' }[locale];
const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const BEIJING_TIME_ZONE = 'Asia/Shanghai';

const messages = {
	selectedDate: '所选日期', today: '今天', localBasis: '设备本地日期', beijingBasis: '北京时间日期',
	lookupNote: '查询《百年历书》的公历日期', deviceZone: '设备时区',
	discrepancy: '此刻本地是 {local}，北京是 {beijing}。页面按“{basis}”显示。',
	nextIn: '{days} 天后', nextToday: '就是今天', noNext: '支持范围内没有找到下一殊胜日',
	viewDate: '查看日期', events: '{year} 年共 {count} 个匹配日期', noEvents: '这个筛选条件下没有日期。',
	reverseFound: '找到 {count} 个对应日期', reverseNone: '没有找到对应日期；藏历可能有缺日，或结果位于所选公历年份之外。',
	repeated: '重日', skipped: '缺日', leapMonth: '闰月', localEclipse: '你的时区', beijingEclipse: '北京时区',
	eclipseArchive: '日月食按北京时间日期归档；能否看到以及当地接触时刻取决于地理位置。',
	calendarExported: '日历文件已生成', reminderExported: '提醒文件已生成，可导入系统日历',
	installUnavailable: '可通过浏览器菜单将页面安装到桌面。', offlineReady: '页面已可离线使用',
	copied: '日期信息已复制', linkCopied: '分享链接已复制',
	festival: '节日', multiplier: '功德增广日', eclipse: '日月食', all: '全部',
	annualUpcoming: '{year} 年共 {count} 个匹配日期 · 显示今天起 {days} 天内的 {shown} 个',
	noUpcoming: '未来 {days} 天内没有匹配日期。', expandYear: '展开全年', collapseUpcoming: '收起至近期',
	backToListTop: '回到列表顶部', commonObservance: '节日 · 功德增广日',
	gregorian: '公历', tibetan: '藏历', sourceBadge: '历书对照', dateBasis: '日期口径',
	yearSuffix: '年', monthSuffix: '月', daySuffix: '日', weekdayPrefix: '周',
	monthTitle: '{year} 年 {month} 月', monthShort: '{month}月', dayShort: '{day}',
	viewDetails: '查看详情', observance: '殊胜日', source: '来源与口径',
	localModeDetail: '“本地”只决定今天查哪一个公历日期，不会重新计算所在地的藏历天文参数。',
	icsDescription: '百年藏历：{tibetan}。{detail}',
	openSource: '数据开源', copiedTitle: '百年藏历',
	install: '安装', themeDark: '切换到深色模式', themeLight: '切换到浅色模式'
};

const englishMessages = {
	selectedDate:'Selected date',today:'Today',localBasis:'Device-local date',beijingBasis:'Beijing date',lookupNote:'Gregorian date used to query the published crosswalk',deviceZone:'Device time zone',
	discrepancy:'It is {local} locally and {beijing} in Beijing. This page is using “{basis}.”',nextIn:'In {days} days',nextToday:'Today',noNext:'No later observance was found in the supported range',viewDate:'View date',events:'{count} matching dates in {year}',noEvents:'No dates match this filter.',annualUpcoming:'{count} matching dates in {year} · showing {shown} in the next {days} days',noUpcoming:'No matching dates in the next {days} days.',expandYear:'Show full year',collapseUpcoming:'Show upcoming only',backToListTop:'Back to list top',commonObservance:'Observance · Multiplier day',reverseFound:'Found {count} matching dates',reverseNone:'No date was found. The Tibetan day may be skipped or outside the selected Gregorian year.',repeated:'Repeated day',skipped:'Skipped day',leapMonth:'Leap month',localEclipse:'Your time zone',beijingEclipse:'Beijing time',eclipseArchive:'Eclipses are filed by Beijing date. Visibility and local contact times depend on location.',calendarExported:'Calendar file created',reminderExported:'Reminder file created; import it into your calendar',installUnavailable:'Use your browser menu to install this page.',offlineReady:'Offline access is ready',copied:'Date details copied',linkCopied:'Share link copied',festival:'Observance',multiplier:'Multiplier day',eclipse:'Eclipse',all:'All',gregorian:'Gregorian',tibetan:'Tibetan',sourceBadge:'Published crosswalk',dateBasis:'Date basis',yearSuffix:'',monthSuffix:'',daySuffix:'',weekdayPrefix:'',monthTitle:'{month} {year}',monthShort:'Month {month}',dayShort:'Day {day}',viewDetails:'View details',observance:'Observance',source:'Source & method',localModeDetail:'“Local” only decides which Gregorian day to look up. It does not recalculate local Tibetan astronomical parameters.',icsDescription:'Tibetan calendar: {tibetan}. {detail}',openSource:'Open-source data',copiedTitle:'Tibetan Calendar',install:'Install',themeDark:'Switch to dark mode',themeLight:'Switch to light mode'
};

const tibetanMessages = {
	selectedDate:'བདམས་པའི་ཚེས།',today:'དེ་རིང་།',localBasis:'ས་གནས་ཀྱི་ཚེས།',beijingBasis:'པེ་ཅིང་གི་ཚེས།',nextToday:'དེ་རིང་།',viewDate:'ཚེས་ལ་བལྟ་བ།',festival:'དུས་ཆེན།',multiplier:'དགེ་བ་འཕེལ་བའི་ཉིན།',eclipse:'ཉི་ཟླ་འཛིན་པ།',gregorian:'སྤྱི་ལོ།',tibetan:'བོད་ཟླ།',dateBasis:'ཚེས་གྲངས་ཀྱི་གཞི།',monthShort:'ཟླ་ {month}',dayShort:'ཚེས་ {day}',repeated:'ཚེས་ལྷག།',skipped:'ཚེས་ཆད།',leapMonth:'ཟླ་བཤོལ།',viewDetails:'ཞིབ་ཕྲ།',observance:'དུས་ཆེན།',install:'Install'
};

function msg(key, values = {}) {
	let value = locale === 'en' ? (englishMessages[key] || messages[key] || key)
		: locale === 'bo' ? (tibetanMessages[key] || englishMessages[key] || messages[key] || key)
		: trans(messages[key] || key);
	for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, replacement);
	return value;
}

const state = {
	basis: localStorage.getItem('zangli-date-basis') === 'beijing' ? 'beijing' : 'local',
	theme: localStorage.getItem('zangli-theme') || 'system',
	selectedCell: null,
	activeDate: null,
	previousFocus: null,
	annualEvents: [],
	annualExpanded: false,
	annualRenderedYear: null,
	deferredInstallPrompt: null,
	historyLocation: `${location.pathname}${location.search}${location.hash}`
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

function formatTibetanCalendarCell(zangli) {
	const showMonth = zangli.dayNumber === 1 || (zangli.dayNumber === 2 && zangli.dayMiss);
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

function formatAnnualMonth(date) {
	return new Intl.DateTimeFormat(intlLocale, { month:'long' }).format(date);
}

function formatZoneName(timeZone) {
	const city = timeZone.split('/').pop().replaceAll('_', ' ');
	try {
		const zone = new Intl.DateTimeFormat(intlLocale, { timeZone, timeZoneName:'short' }).formatToParts(new Date()).find(part => part.type === 'timeZoneName');
		return `${city} · ${zone ? zone.value : timeZone}`;
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
	$('basisLabel').textContent = `${basisText} · ${formatZoneName(getBasisTimeZone())}`;
	$('basisButton').title = `${msg('lookupNote')} · ${formatZoneName(getBasisTimeZone())}`;
	const notice = $('dateDiscrepancy');
	if (!isSameDate(localToday, beijingToday)) {
		notice.textContent = msg('discrepancy', { local: formatGregorian(localToday), beijing: formatGregorian(beijingToday), basis: basisText });
		notice.hidden = false;
	} else notice.hidden = true;
	document.querySelectorAll('input[name="dateBasis"]').forEach(input => { input.checked = input.value === state.basis; });
}

function renderSelectedDay(date) {
	const zangli = getZangli(date);
	const festival = cleanInfo(zangli.extraInfo);
	const multiplier = cleanInfo(zangli.extraInfo2);
	const dayLabel = isSameDate(date, getToday()) ? msg('today') : msg('selectedDate');
	$('selectedDay').innerHTML = `<p class="section-kicker">${escapeHTML(dayLabel)} · ${escapeHTML(msg('tibetan'))}</p><p class="tibetan-date">${escapeHTML(formatTibetanDate(zangli))}</p><p class="gregorian-date"><span class="calendar-system-label">${escapeHTML(msg('gregorian'))}</span>${escapeHTML(formatGregorian(date, { weekday:true }))}</p>${festival ? `<p class="selected-event">${escapeHTML(festival)}</p>` : ''}${multiplier ? `<p class="selected-multiplier">${escapeHTML(multiplier)}</p>` : ''}`;
}

function renderNextEvent() {
	const today = clampDate(getToday());
	const events = scanEvents(today, addDays(today, 370));
	const event = events[0];
	if (!event) {
		$('nextSpecialDay').innerHTML = `<p class="section-kicker">${escapeHTML(msg('observance'))}</p><p>${escapeHTML(msg('noNext'))}</p>`;
		return;
	}
	const days = Math.round((event.date - today) / 86400000);
	const distance = days === 0 ? msg('nextToday') : msg('nextIn', { days: String(days) });
	$('nextSpecialDay').innerHTML = `<p class="section-kicker">${escapeHTML(distance)}</p><h2>${escapeHTML(eventTitle(event))}</h2><p><span class="calendar-system-label">${escapeHTML(msg('gregorian'))}</span>${escapeHTML(formatGregorian(event.date, { weekday:true }))}</p><p class="muted"><span class="calendar-system-label">${escapeHTML(msg('tibetan'))}</span>${escapeHTML(formatTibetanDate(event.zangli, true))}</p><button class="inline-link" type="button" data-open-date="${formatDate(event.date)}">${escapeHTML(msg('viewDate'))} →</button>`;
}

function populatePeriodSelects(date) {
	const yearSelect = $('year');
	if (!yearSelect.options.length) {
		for (let year = 1951; year <= 2051; year++) yearSelect.appendChild(new Option(year, year));
		for (let year = 1951; year <= 2051; year++) $('reverseYear').appendChild(new Option(year, year));
	}
	const monthSelect = $('month');
	monthSelect.options.length = 0;
	for (let month = 1; month <= 12; month++) monthSelect.appendChild(new Option(month, month));
	yearSelect.value = date.getFullYear();
	monthSelect.value = date.getMonth() + 1;
	$('reverseYear').value = date.getFullYear();
}

function renderCalendar(date) {
	const tbody = document.querySelector('.calendar-table tbody');
	tbody.replaceChildren();
	const firstDay = createLocalDate(date.getFullYear(), date.getMonth() + 1, 1);
	const lastDay = createLocalDate(date.getFullYear(), date.getMonth() + 2, 0) || new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);
	const today = getToday();
	let row = tbody.insertRow();
	for (let index = 0; index < firstDay.getDay(); index++) row.insertCell().className = 'empty-cell';
	for (let day = 1; day <= lastDay.getDate(); day++) {
		const current = createLocalDate(date.getFullYear(), date.getMonth() + 1, day);
		if (current.getDay() === 0 && day !== 1) row = tbody.insertRow();
		const cell = row.insertCell();
		if (!isSupportedDate(current)) {
			cell.className = 'out-of-range'; cell.innerHTML = `<span class="day-number">${day}</span>`; continue;
		}
		const zangli = getZangli(current);
		const eclipse = getEclipse(current);
		const types = eventTypes(zangli, eclipse);
		cell.dataset.date = formatDate(current);
		cell.tabIndex = 0;
		cell.setAttribute('role', 'button');
		cell.classList.toggle('today', isSameDate(current, today));
		cell.classList.toggle('selected', state.activeDate && isSameDate(current, state.activeDate));
		for (const type of types) cell.classList.add(`has-${type}`);
		const shortTibetan = formatTibetanCalendarCell(zangli);
		const eventLabel = eventTitle({ zangli, eclipse }, false);
		const label = `${formatGregorian(current, { weekday:true })}. ${formatTibetanDate(zangli)}${eventLabel ? `. ${eventLabel}` : ''}`;
		cell.setAttribute('aria-label', label);
		cell.title = label;
		cell.innerHTML = `<span class="day-number">${day}</span><span class="lunar-date">${escapeHTML(shortTibetan)}</span><span class="cell-markers" aria-hidden="true">${types.map(type => `<i class="${type}-marker"></i>`).join('')}</span><span class="cell-event wide">${escapeHTML(cleanInfo(zangli.extraInfo) || eclipse.value || '')}</span>`;
	}
	while (row.cells.length < 7) row.insertCell().className = 'empty-cell';
}

function annualEventIndicators(event) {
	if (event.types.includes('eclipse')) return `<i class="type-pill eclipse">${escapeHTML(msg('eclipse'))}</i>`;
	if (event.types.includes('festival') && event.types.includes('multiplier')) {
		return `<span class="type-dot" aria-label="${escapeHTML(msg('commonObservance'))}" title="${escapeHTML(msg('commonObservance'))}"><i class="legend-dot multiplier-dot" aria-hidden="true"></i></span>`;
	}
	return event.types.map(type => `<i class="type-pill ${type}">${escapeHTML(msg(type))}</i>`).join('');
}

function renderAnnualControls(isCurrentYear) {
	const controls = $('annualRangeControls');
	controls.replaceChildren();
	if (!isCurrentYear) return;
	const toggle = document.createElement('button');
	toggle.className = 'secondary-button';
	toggle.type = 'button';
	toggle.textContent = msg(state.annualExpanded ? 'collapseUpcoming' : 'expandYear');
	toggle.setAttribute('aria-expanded', String(state.annualExpanded));
	toggle.addEventListener('click', () => {
		state.annualExpanded = !state.annualExpanded;
		renderAnnualList();
		if (!state.annualExpanded) $('annualSummary').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' });
	});
	controls.appendChild(toggle);
	if (state.annualExpanded) {
		const back = document.createElement('button');
		back.className = 'text-button annual-back-button';
		back.type = 'button';
		back.textContent = `${msg('backToListTop')} ↑`;
		back.addEventListener('click', () => $('annualSummary').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' }));
		controls.appendChild(back);
	}
}

function renderAnnualList() {
	const year = Number($('year').value);
	if (state.annualRenderedYear !== year) {
		state.annualRenderedYear = year;
		state.annualExpanded = false;
	}
	const from = createLocalDate(year, 1, 1) < startDate ? startDate : createLocalDate(year, 1, 1);
	const to = createLocalDate(year, 12, 31) > endDate ? endDate : createLocalDate(year, 12, 31);
	state.annualEvents = scanEvents(from, to);
	const filter = $('annualFilter').value;
	const filteredEvents = state.annualEvents.filter(event => filter === 'all' || event.types.includes(filter));
	const today = getToday();
	const isCurrentYear = year === today.getFullYear();
	const upcomingEnd = addDays(today, 90);
	const events = isCurrentYear && !state.annualExpanded
		? filteredEvents.filter(event => event.date >= today && event.date <= upcomingEnd)
		: filteredEvents;
	$('annualSummary').textContent = isCurrentYear && !state.annualExpanded
		? msg('annualUpcoming', { year: String(year), count: String(filteredEvents.length), shown: String(events.length), days: '90' })
		: msg('events', { year: String(year), count: String(filteredEvents.length) });
	const list = $('annualList');
	list.replaceChildren();
	renderAnnualControls(isCurrentYear);
	if (!events.length) {
		list.innerHTML = `<li class="empty-state">${escapeHTML(isCurrentYear && !state.annualExpanded ? msg('noUpcoming', { days:'90' }) : msg('noEvents'))}</li>`;
		return;
	}
	let renderedMonth = -1;
	for (const event of events) {
		if (event.date.getMonth() !== renderedMonth) {
			renderedMonth = event.date.getMonth();
			const heading = document.createElement('li');
			heading.className = 'annual-month';
			heading.innerHTML = `<span>${escapeHTML(formatAnnualMonth(event.date))}</span>`;
			list.appendChild(heading);
		}
		const item = document.createElement('li');
		item.className = 'event-row';
		item.innerHTML = `<button type="button" data-open-date="${formatDate(event.date)}"><time datetime="${formatDate(event.date)}"><span class="date-line date-line-gregorian"><i>${escapeHTML(msg('gregorian'))}</i><strong>${escapeHTML(new Intl.DateTimeFormat(intlLocale, { month:'short', day:'numeric' }).format(event.date))}</strong></span><span class="date-line date-line-tibetan"><i>${escapeHTML(msg('tibetan'))}</i><span>${escapeHTML(formatTibetanDate(event.zangli, true))}</span></span></time><span class="event-copy"><strong>${escapeHTML(eventTitle(event))}</strong><span>${annualEventIndicators(event)}</span></span><span aria-hidden="true">→</span></button>`;
		list.appendChild(item);
	}
}

function renderApp(date = getRequestedDate()) {
	date = clampDate(date);
	populatePeriodSelects(date);
	$('year').value = date.getFullYear();
	$('month').value = date.getMonth() + 1;
	$('monthTitle').textContent = formatMonthTitle(date);
	renderBasis();
	renderSelectedDay(date);
	renderCalendar(date);
	renderNextEvent();
	renderAnnualList();
}

function navigateTo(year, month, day = 1) {
	const target = clampDate(new Date(year, month - 1, day, 12, 0, 0));
	const hash = `#${target.getFullYear()}/${target.getMonth() + 1}/${target.getDate()}`;
	if (location.pathname !== basePath) history.replaceState({}, '', `${basePath}${hash}`);
	else if (location.hash !== hash) history.pushState({}, '', hash);
	renderApp(target);
	$('calendarWorkspace').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' });
}

function changeMonth(delta) { navigateTo(Number($('year').value), Number($('month').value) + delta); }
function changeYear(delta) { navigateTo(Number($('year').value) + delta, Number($('month').value)); }
function goToToday() { const today = getToday(); navigateTo(today.getFullYear(), today.getMonth() + 1, today.getDate()); }

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
	let html = `<p class="section-kicker">${escapeHTML(msg('selectedDate'))} · ${escapeHTML(msg('gregorian'))}</p><h2 id="detailTitle">${escapeHTML(formatGregorian(date, { weekday:true }))}</h2><section class="detail-section"><h3>${escapeHTML(msg('tibetan'))}</h3><p class="detail-tibetan">${escapeHTML(formatTibetanDate(zangli))}</p><div class="status-row">${zangli.monthLeap ? `<span>${escapeHTML(msg('leapMonth'))}</span>` : ''}${zangli.dayLeap ? `<span>${escapeHTML(msg('repeated'))}</span>` : ''}${zangli.dayMiss ? `<span>${escapeHTML(msg('skipped'))}</span>` : ''}</div></section>`;
	if (cleanInfo(zangli.extraInfo) || cleanInfo(zangli.extraInfo2)) html += `<section class="detail-section accent-section"><h3>${escapeHTML(msg('observance'))}</h3>${cleanInfo(zangli.extraInfo) ? `<p class="detail-event">${escapeHTML(cleanInfo(zangli.extraInfo))}</p>` : ''}${cleanInfo(zangli.extraInfo2) ? `<p>${escapeHTML(cleanInfo(zangli.extraInfo2))}</p>` : ''}</section>`;
	if (eclipse.value) {
		html += `<section class="detail-section eclipse-section"><h3>${escapeHTML(msg('eclipse'))}</h3><p class="detail-event">${escapeHTML(eclipse.value)}</p>`;
		if (eclipse.maximumTimestamp) html += `<dl class="time-grid"><div><dt>${escapeHTML(msg('localEclipse'))}</dt><dd>${escapeHTML(eclipseTime(eclipse.maximumTimestamp, deviceTimeZone))}</dd></div><div><dt>${escapeHTML(msg('beijingEclipse'))}</dt><dd>${escapeHTML(eclipseTime(eclipse.maximumTimestamp, BEIJING_TIME_ZONE))}</dd></div></dl>`;
		html += `<p class="fine-print">${escapeHTML(msg('eclipseArchive'))}</p></section>`;
	}
	html += `<section class="detail-section source-section"><h3>${escapeHTML(msg('source'))}</h3><p>${escapeHTML(msg('localModeDetail'))}</p></section>`;
	return html;
}

function setBackgroundInert(value) {
	const shell = document.querySelector('.site-shell');
	shell.inert = value;
	if (value) shell.setAttribute('aria-hidden', 'true'); else shell.removeAttribute('aria-hidden');
}

function openDetail(date, anchor) {
	if (!isSupportedDate(date)) return;
	state.activeDate = date;
	state.previousFocus = anchor || document.activeElement;
	$('detailContent').innerHTML = buildDetailHTML(date);
	$('detailMask').style.display = 'block';
	$('detailDialog').style.display = 'block';
	$('detailDialog').setAttribute('aria-hidden', 'false');
	$('detailDialog').classList.toggle('bottom-sheet', innerWidth <= 720);
	requestAnimationFrame(() => $('detailDialog').classList.add('active'));
	setBackgroundInert(true);
	$('closeDetailButton').focus();
	const path = `${basePath}date/${formatDate(date)}`;
	if (location.pathname !== path) history.pushState({ detail:true }, '', path);
}

function closeDetail(updateHistory = true) {
	if ($('detailDialog').style.display !== 'block') return;
	$('detailMask').style.display = 'none';
	$('detailDialog').classList.remove('active');
	$('detailDialog').setAttribute('aria-hidden', 'true');
	setBackgroundInert(false);
	setTimeout(() => { $('detailDialog').style.display = 'none'; }, 160);
	if (updateHistory && location.pathname !== basePath) history.replaceState({}, '', `${basePath}#${state.activeDate.getFullYear()}/${state.activeDate.getMonth() + 1}/${state.activeDate.getDate()}`);
	const previous = state.previousFocus;
	state.activeDate = null;
	if (previous && previous.isConnected) previous.focus();
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
	return [`${msg('gregorian')}: ${formatGregorian(state.activeDate, { weekday:true })}`, `${msg('tibetan')}: ${formatTibetanDate(zangli)}`, cleanInfo(zangli.extraInfo), cleanInfo(zangli.extraInfo2), eclipse.value].filter(Boolean).join('\n');
}

function copyDateInfo() { copyText(activeDateText(), msg('copied')); }

function shareDate() {
	if (!state.activeDate) return;
	const url = `${location.origin}${basePath}date/${formatDate(state.activeDate)}`;
	const data = { title: msg('copiedTitle'), text: activeDateText(), url };
	if (navigator.share) navigator.share(data).catch(error => { if (error.name !== 'AbortError') copyText(url, msg('linkCopied')); });
	else copyText(url, msg('linkCopied'));
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
		const detail = [cleanInfo(event.zangli.extraInfo2), event.eclipse.value].filter(Boolean).join(' · ');
		lines.push('BEGIN:VEVENT',`UID:${formatDate(event.date)}-${event.types.join('-')}@zangli.org`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,`DTSTART;VALUE=DATE:${formatDate(event.date).replaceAll('-', '')}`,`DTEND;VALUE=DATE:${formatDate(next).replaceAll('-', '')}`,`SUMMARY:${escapeIcs(eventTitle(event))}`,`DESCRIPTION:${escapeIcs(msg('icsDescription', { tibetan: formatTibetanDate(event.zangli), detail }))}`,`URL:https://zangli.org${basePath}date/${formatDate(event.date)}`,'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY',`DESCRIPTION:${escapeIcs(eventTitle(event))}`,'END:VALARM','END:VEVENT');
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
	const filter = $('annualFilter').value;
	const events = state.annualEvents.filter(event => filter === 'all' || event.types.includes(filter));
	const year = $('year').value;
	downloadFile(`zangli-${year}-${filter}.ics`, createIcs(events, `${msg('copiedTitle')} ${year}`), 'text/calendar;charset=utf-8');
	showToast(msg('calendarExported'));
}

function runReverseLookup(event) {
	event.preventDefault();
	const year = Number($('reverseYear').value), month = Number($('reverseMonth').value), day = Number($('reverseDay').value), includeLeap = $('reverseLeap').checked;
	const results = [];
	for (let date = createLocalDate(year, 1, 1); date <= createLocalDate(year, 12, 31); date = addDays(date, 1)) {
		if (!isSupportedDate(date)) continue;
		const zangli = getZangli(date);
		if (zangli.monthNumber === month && zangli.dayNumber === day && (!zangli.monthLeap || includeLeap)) results.push({ date:new Date(date), zangli });
	}
	const container = $('reverseResults');
	if (!results.length) { container.innerHTML = `<p class="empty-state">${escapeHTML(msg('reverseNone'))}</p>`; return; }
	container.innerHTML = `<p class="panel-summary">${escapeHTML(msg('reverseFound', { count:String(results.length) }))}</p><div class="result-grid">${results.map(result => `<button type="button" data-open-date="${formatDate(result.date)}"><strong><small class="calendar-system-label">${escapeHTML(msg('gregorian'))}</small>${escapeHTML(formatGregorian(result.date, { weekday:true }))}</strong><span><small class="calendar-system-label">${escapeHTML(msg('tibetan'))}</small>${escapeHTML(formatTibetanDate(result.zangli))}</span>${result.zangli.dayLeap ? `<i>${escapeHTML(msg('repeated'))}</i>` : ''}${result.zangli.dayMiss ? `<i>${escapeHTML(msg('skipped'))}</i>` : ''}</button>`).join('')}</div>`;
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
	localStorage.setItem('zangli-theme', next); applyTheme(next);
}

function activatePanel(button) {
	document.querySelectorAll('.tool-tab').forEach(tab => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', active); $(tab.dataset.panel).hidden = !active; });
}

function handleDocumentClick(event) {
	const openTarget = event.target.closest('[data-open-date], .calendar-table td[data-date]');
	if (openTarget) { openDateFromElement(openTarget); return; }
	const tab = event.target.closest('.tool-tab');
	if (tab) activatePanel(tab);
}

function handleDocumentKeydown(event) {
	if (event.key === 'Escape') closeDetail();
	const cell = event.target.closest?.('.calendar-table td[data-date]');
	if (cell && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openDateFromElement(cell); }
}

function handleHistory() {
	const routeDate = parseRouteDate();
	if (routeDate) { renderApp(routeDate); openDetail(routeDate); }
	else { closeDetail(false); renderApp(parseHashDate() || getToday()); }
}

function initSettings() {
	$('settingsButton').addEventListener('click', () => $('settingsDialog').showModal());
	$('basisButton').addEventListener('click', () => $('settingsDialog').showModal());
	document.querySelectorAll('input[name="dateBasis"]').forEach(input => input.addEventListener('change', () => {
		state.basis = input.value; localStorage.setItem('zangli-date-basis', state.basis); renderApp(getToday());
	}));
}

function initPwa() {
	if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').then(() => console.info(msg('offlineReady'))).catch(() => {});
	window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); state.deferredInstallPrompt = event; $('installButton').hidden = false; });
	$('installButton').addEventListener('click', async () => {
		if (!state.deferredInstallPrompt) { showToast(msg('installUnavailable')); return; }
		state.deferredInstallPrompt.prompt(); await state.deferredInstallPrompt.userChoice; state.deferredInstallPrompt = null; $('installButton').hidden = true;
	});
}

function initApp() {
	applyTheme();
	$('languageSelect').addEventListener('change', event => switchLanguage(event.target.value));
	$('themeButton').addEventListener('click', toggleTheme);
	$('prevMonthButton').addEventListener('click', () => changeMonth(-1));
	$('nextMonthButton').addEventListener('click', () => changeMonth(1));
	$('prevYearButton').addEventListener('click', () => changeYear(-1));
	$('nextYearButton').addEventListener('click', () => changeYear(1));
	$('todayButton').addEventListener('click', goToToday);
	$('annualFilter').addEventListener('change', renderAnnualList);
	$('exportYearButton').addEventListener('click', exportAnnual);
	$('reverseForm').addEventListener('submit', runReverseLookup);
	$('closeDetailButton').addEventListener('click', () => closeDetail());
	$('detailMask').addEventListener('click', () => closeDetail());
	$('copyButton').addEventListener('click', copyDateInfo);
	$('shareButton').addEventListener('click', shareDate);
	$('reminderButton').addEventListener('click', addReminder);
	document.addEventListener('click', handleDocumentClick);
	document.addEventListener('keydown', handleDocumentKeydown);
	window.addEventListener('popstate', handleHistory);
	initSettings(); initPwa(); renderApp();
	const routeDate = parseRouteDate(); if (isSupportedDate(routeDate)) openDetail(routeDate);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp, { once:true }); else initApp();
