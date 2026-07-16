const $ = id => document.getElementById(id);
const pad = value => String(value).padStart(2, '0');
const inTw = /(?:^|\/)tw(?:\/|$)/i.test(location.pathname);
const basePath = inTw ? '/tw/' : '/';

let $m;
let $y;
let selectedCell = null;
let detailMask;
let detailDialog;
let detailContent;
let activeDate;
let previouslyFocusedElement;
let focusCalendarAfterRender = false;
let detailHideTimer;
let historySyncFrame;
let lastHistoryLocation = `${location.pathname}${location.search}${location.hash}`;

function getLocalToday() {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
}

function createLocalDate(year, month, day) {
	const date = new Date(year, month - 1, day, 12, 0, 0);
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}
	return date;
}

function formatDate(date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function matchDeepLinkRoute() {
	return location.pathname.match(/\/date\/(\d{4})-(\d{2})-(\d{2})\/?$/);
}

function parseDeepLinkDate() {
	const match = matchDeepLinkRoute();
	if (!match) return null;
	return createLocalDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

function parseHashDate() {
	const match = location.hash.match(/^#(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
	if (!match) return null;
	return createLocalDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

function isSupportedDate(date) {
	return Boolean(date && date >= startDate && date <= endDate);
}

function clampDate(date) {
	if (!date || Number.isNaN(date.getTime())) return getLocalToday();
	if (date < startDate) return startDate;
	if (date > endDate) return endDate;
	return date;
}

function isSameDate(first, second) {
	return first.getFullYear() === second.getFullYear() &&
		first.getMonth() === second.getMonth() &&
		first.getDate() === second.getDate();
}

function rememberHistoryLocation() {
	lastHistoryLocation = `${location.pathname}${location.search}${location.hash}`;
}

function getRequestedDate() {
	const deepLinkMatch = matchDeepLinkRoute();
	if (deepLinkMatch) {
		const deepLinkDate = parseDeepLinkDate();
		if (!deepLinkDate) {
			history.replaceState({}, '', basePath);
			rememberHistoryLocation();
			return clampDate(getLocalToday());
		}
		const date = clampDate(deepLinkDate);
		if (!isSameDate(deepLinkDate, date) || location.hash) {
			history.replaceState(history.state, '', `${basePath}date/${formatDate(date)}`);
			rememberHistoryLocation();
		}
		return date;
	}

	const hashDate = parseHashDate();
	if (hashDate) {
		const date = clampDate(hashDate);
		if (!isSameDate(hashDate, date)) {
			history.replaceState(history.state, '', `${basePath}#${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
			rememberHistoryLocation();
		}
		return date;
	}
	if (/^#\d{4}\/\d{1,2}\/\d{1,2}$/.test(location.hash)) {
		history.replaceState(history.state, '', basePath);
		rememberHistoryLocation();
	}

	return clampDate(getLocalToday());
}

function zangli_callback() {
	if (!document.body || !$("selectedDay") || !$("selectedDayBottom")) return;

	$m = $("month");
	$y = $("year");
	const date = getRequestedDate();
	const currentToday = getLocalToday();

	updateSelectedDayDisplay(date);
	selectedCell = null;
	hideFestivalTooltip();

	$y.options.length = 0;
	for (let year = 1951; year < 2052; year++) {
		$y.appendChild(new Option(year));
	}

	$m.options.length = 0;
	for (let month = 1; month < 13; month++) {
		if (!(date.getFullYear() === 2051 && month > 2)) {
			$m.appendChild(new Option(month));
		}
	}
	$y.value = date.getFullYear();
	$m.value = date.getMonth() + 1;

	const tbody = document.querySelector('.calendar-table tbody');
	while (tbody.rows.length > 1) {
		tbody.deleteRow(tbody.rows.length - 1);
	}

	const firstDay = new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0);
	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12, 0, 0);
	let row = tbody.insertRow();
	for (let blank = 0; blank < firstDay.getDay(); blank++) {
		row.insertCell();
	}

	let calendarDate = firstDay;
	for (let day = 1; day <= lastDay.getDate(); day++) {
		calendarDate = new Date(date.getFullYear(), date.getMonth(), day, 12, 0, 0);
		if (calendarDate.getDay() === 0 && day !== 1) {
			row = tbody.insertRow();
		}
		if (!isSupportedDate(calendarDate)) {
			const cell = row.insertCell();
			cell.className = 'out-of-range';
			cell.innerHTML = `<div class="day-number">${day}</div>`;
			cell.setAttribute('aria-disabled', 'true');
			continue;
		}

		const zangli = getZangli(calendarDate);
		const eclipse = getEclipse(calendarDate);
		const isToday =
			calendarDate.getFullYear() === currentToday.getFullYear() &&
			calendarDate.getMonth() === currentToday.getMonth() &&
			calendarDate.getDate() === currentToday.getDate();
		const isFestival = Boolean(
			zangli.extraInfo &&
			zangli.extraInfo.trim() !== '' &&
			zangli.extraInfo !== '&nbsp;'
		);
		const festivalClass = isFestival ? ' festival' : '';
		const parts = [];

		if (day === 1) {
			parts.push(trans(`<div class="day-number first-day"><span class="wide">${date.getFullYear()}年${date.getMonth() + 1}月1日</span><span class="narrow">${day}</span>`));
		} else {
			parts.push(`<div class="day-number">${day}`);
		}

		parts.push(`</div><div class="lunar-date${festivalClass}">`);
		if (zangli.day === trans('初一') || (zangli.day === trans('初二') && zangli.dayMiss)) {
			const yearPrefix = zangli.month === trans('正') && !zangli.monthLeap
				? `${zangli.year}${trans('年')}<br>`
				: '';
			parts.push(`<span class="lunar-month">${yearPrefix}${zangli.month}${trans('月')}</span><br>${zangli.day}`);
		} else if (zangli.value !== 'error') {
			parts.push(zangli.day);
		}
		parts.push('</div><div class="extra-info wide">');
		parts.push(zangli.extraInfo || '&nbsp;');
		parts.push('</div><div class="eclipse-info wide">');
		parts.push(
			eclipse.value
				? `${eclipse.value},${eclipse.extraInfo.replace(/，/, ',<br>')}`
				: (zangli.extraInfo2 || '&nbsp;')
		);
		parts.push('</div>');

		const cell = row.insertCell();
		cell.innerHTML = parts.join('');
		cell.dataset.date = formatDate(calendarDate);
		cell.tabIndex = 0;
		cell.setAttribute('role', 'button');

		if (isToday) cell.classList.add('today');
		if (zangli.value !== 'error') {
			cell.title = trans(`公历${calendarDate.getFullYear()}年${calendarDate.getMonth() + 1}月${calendarDate.getDate()}日，藏历${zangli.value}`);
		}
		if (eclipse.value) {
			cell.title = trans(`${cell.title},${eclipse.value}`);
			cell.classList.add(/日/.test(eclipse.value) ? 'solareclipse' : 'lunareclipse');
		}
		if (eclipse.extraInfo) {
			cell.title = trans(`${cell.title},${eclipse.extraInfo}`);
		}
		cell.setAttribute('aria-label', cell.title);
	}

	for (let blank = calendarDate.getDay(); blank < 6; blank++) {
		row.insertCell();
	}
	if (focusCalendarAfterRender) {
		const focusTarget = tbody.querySelector(`td[data-date="${formatDate(date)}"]`) ||
			tbody.querySelector('td[role="button"]');
		focusCalendarAfterRender = false;
		if (focusTarget) focusTarget.focus();
	}
}

function updateSelectedDayDisplay(date) {
	const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
	const zangli = getZangli(normalizedDate);
	const dateText = trans(`公历${normalizedDate.getFullYear()}年${normalizedDate.getMonth() + 1}月${normalizedDate.getDate()}日，藏历${zangli.value}`);
	let festivalInfo = '';

	if (zangli.extraInfo && zangli.extraInfo.trim() !== '' && zangli.extraInfo !== '&nbsp;') {
		festivalInfo = zangli.extraInfo.replace(/<br>/g, ' ');
		if (zangli.extraInfo2 && zangli.extraInfo2.trim() !== '' && zangli.extraInfo2 !== '&nbsp;') {
			festivalInfo += `, ${zangli.extraInfo2}`;
		}
	}

	const festivalHtml = festivalInfo
		? `<div class="festival-info">${festivalInfo}</div>`
		: '';
	$("selectedDay").innerHTML = dateText + festivalHtml;
	$("selectedDayBottom").innerHTML = dateText + festivalHtml;
}

function getCalendarCell(target) {
	if (!target) return null;
	const cell = target.closest ? target.closest('td') : target;
	return cell && cell.dataset && cell.dataset.date ? cell : null;
}

function showDay(target) {
	const cell = getCalendarCell(target);
	if (!cell) return;

	if (selectedCell) selectedCell.classList.remove('selected');
	selectedCell = cell;
	cell.classList.add('selected');

	const match = cell.dataset.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return;
	const selectedDate = createLocalDate(Number(match[1]), Number(match[2]), Number(match[3]));
	if (!selectedDate) return;

	updateSelectedDayDisplay(selectedDate);
	openDetail(selectedDate, cell);
}

function handleCalendarKeydown(event) {
	if (event.key !== 'Enter' && event.key !== ' ') return;
	const cell = getCalendarCell(event.target);
	if (!cell) return;
	event.preventDefault();
	showDay(cell);
}

function showFestivalTooltip(cell) {
	hideFestivalTooltip();
	const info = cell.querySelector('.extra-info');
	if (!info || !info.textContent.trim()) return;

	const tooltip = document.createElement('div');
	tooltip.className = 'festival-tooltip';
	tooltip.id = 'festivalTooltip';
	tooltip.innerHTML = `${info.innerHTML.replace(/<br>/g, ' ')}<button class="close-btn" type="button" aria-label="${trans('关闭')}">×</button>`;
	tooltip.querySelector('button').addEventListener('click', hideFestivalTooltip);
	document.body.appendChild(tooltip);

	const cellRect = cell.getBoundingClientRect();
	const tooltipRect = tooltip.getBoundingClientRect();
	let left = cellRect.left + (cellRect.width - tooltipRect.width) / 2;
	let top = cellRect.top - tooltipRect.height - 10;
	left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
	if (top < 10) top = cellRect.bottom + 10;
	tooltip.style.left = `${left}px`;
	tooltip.style.top = `${top}px`;
	tooltip.style.display = 'block';
	setTimeout(hideFestivalTooltip, 3000);
}

function hideFestivalTooltip() {
	const tooltip = $('festivalTooltip');
	if (tooltip) tooltip.remove();
}

function navigateTo(year, month, day = 1) {
	const candidate = new Date(year, month - 1, day, 12, 0, 0);
	const date = clampDate(candidate);
	const hash = `#${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

	if (location.pathname !== basePath) {
		history.replaceState({}, '', `${basePath}${hash}`);
		rememberHistoryLocation();
		zangli_callback();
	} else if (location.hash === hash) {
		zangli_callback();
	} else {
		location.hash = hash;
	}
	window.scrollTo(0, 0);
}

function changeDate(code) {
	if (!$m || !$y) return;
	let month = Number($m.value);
	let year = Number($y.value);

	if (code === 37) month--;
	else if (code === 38) year--;
	else if (code === 39) month++;
	else if (code === 40) year++;
	else if (code !== 'year' && code !== 'month') return;

	navigateTo(year, month);
}

function goToToday() {
	const currentToday = getLocalToday();
	const alreadyToday =
		Number($y.value) === currentToday.getFullYear() &&
		Number($m.value) === currentToday.getMonth() + 1;
	navigateTo(currentToday.getFullYear(), currentToday.getMonth() + 1, currentToday.getDate());
	if (alreadyToday) {
		const todayCell = document.querySelector('.calendar-table td.today');
		if (todayCell) showDay(todayCell);
	}
}

function changeYear(direction) {
	navigateTo(Number($y.value) + direction, Number($m.value));
}

function changeMonth(direction) {
	navigateTo(Number($y.value), Number($m.value) + direction);
}

function initDetailElements() {
	detailMask = $('detailMask');
	detailDialog = $('detailDialog');
	detailContent = $('detailContent');
}

function setBackgroundInert(disabled) {
	const container = document.querySelector('.container');
	if (!container) return;
	container.inert = disabled;
	if (disabled) container.setAttribute('aria-hidden', 'true');
	else container.removeAttribute('aria-hidden');
}

function buildDetailHTML(date) {
	const zangli = getZangli(date);
	const eclipse = getEclipse(date);
	const weekDays = ['日', '一', '二', '三', '四', '五', '六'].map(trans);
	let html = `<h3 id="detailTitle">${date.getFullYear()}${trans('年')}${date.getMonth() + 1}${trans('月')}${date.getDate()}${trans('日 周')}${weekDays[date.getDay()]}</h3>`;

	html += '<div class="detail-section">';
	html += `<h4>📖 ${trans('藏历信息')}</h4>`;
	html += `<p><strong>${trans('藏历日期：')}</strong>${zangli.value}</p>`;
	if (zangli.monthLeap) html += `<p><small>🔸 ${trans('闰月')}</small></p>`;
	if (zangli.dayLeap) html += `<p><small>🔸 ${trans('闰日')}</small></p>`;
	if (zangli.dayMiss) html += `<p><small>🔸 ${trans('缺日')}</small></p>`;
	html += '</div>';

	if (zangli.extraInfo && zangli.extraInfo.trim() !== '' && zangli.extraInfo !== '&nbsp;') {
		html += '<div class="detail-section festival-section">';
		html += `<h4>🎊 ${trans('节日庆典')}</h4>`;
		html += `<p class="festival-info">${zangli.extraInfo}</p>`;
		if (zangli.extraInfo2 && zangli.extraInfo2.trim() !== '' && zangli.extraInfo2 !== '&nbsp;') {
			html += `<p class="festival-desc">${zangli.extraInfo2}</p>`;
		}
		html += '</div>';
	}

	if (eclipse.value) {
		html += '<div class="detail-section eclipse-section">';
		html += `<h4>🌙 ${trans('天象信息')}</h4>`;
		html += `<p><strong>${eclipse.value}</strong></p>`;
		if (eclipse.extraInfo) html += `<p>${eclipse.extraInfo}</p>`;
		if (eclipse.extraInfo2) html += `<p>${eclipse.extraInfo2}</p>`;
		html += '</div>';
	}

	return html;
}

function copyWithLegacyFallback(text, successMessage) {
	const legacyCopy = () => {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.setAttribute('readonly', '');
		textArea.style.position = 'fixed';
		textArea.style.opacity = '0';
		textArea.style.pointerEvents = 'none';
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand('copy');
		textArea.remove();
		showToast(successMessage);
	};

	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(text).then(
			() => showToast(successMessage),
			legacyCopy
		);
	} else {
		legacyCopy();
	}
}

function copyDateInfo() {
	if (!activeDate) return;
	const zangli = getZangli(activeDate);
	const eclipse = getEclipse(activeDate);
	const weekDays = ['日', '一', '二', '三', '四', '五', '六'].map(trans);
	let text = `${activeDate.getFullYear()}${trans('年')}${activeDate.getMonth() + 1}${trans('月')}${activeDate.getDate()}${trans('日 周')}${weekDays[activeDate.getDay()]}\n`;
	text += `${trans('藏历：')}${zangli.value}\n`;

	if (zangli.extraInfo && zangli.extraInfo.trim() !== '' && zangli.extraInfo !== '&nbsp;') {
		text += `${trans('节日：')}${zangli.extraInfo.replace(/<br>/g, ' ')}\n`;
		if (zangli.extraInfo2 && zangli.extraInfo2.trim() !== '' && zangli.extraInfo2 !== '&nbsp;') {
			text += `${zangli.extraInfo2}\n`;
		}
	}
	if (eclipse.value) {
		text += `${trans('天象：')}${eclipse.value}\n`;
		if (eclipse.extraInfo) text += `${eclipse.extraInfo.replace(/<br>/g, ' ')}\n`;
	}

	copyWithLegacyFallback(text, trans('日期信息已复制'));
}

function openDetail(date, anchor) {
	if (!detailDialog) initDetailElements();
	if (detailHideTimer) {
		clearTimeout(detailHideTimer);
		detailHideTimer = undefined;
	}
	activeDate = date;
	previouslyFocusedElement = anchor || document.activeElement;
	const isMobile = window.innerWidth <= 768;
	detailDialog.classList.toggle('bottom-sheet', isMobile);
	detailContent.innerHTML = buildDetailHTML(date);
	detailMask.style.display = 'block';
	detailDialog.style.display = 'block';
	detailDialog.setAttribute('aria-hidden', 'false');
	setBackgroundInert(true);
	if (isMobile) requestAnimationFrame(() => detailDialog.classList.add('active'));
	detailDialog.querySelector('.close-btn').focus();

	const path = `${basePath}date/${formatDate(date)}`;
	if (location.pathname !== path || location.hash) {
		history.pushState({ zangliDetail: true }, '', path);
		rememberHistoryLocation();
	}
}

function closeDetail(updateHistory = true) {
	if (!detailDialog || detailDialog.style.display !== 'block') return;
	if (detailHideTimer) {
		clearTimeout(detailHideTimer);
		detailHideTimer = undefined;
	}
	detailMask.style.display = 'none';
	detailDialog.setAttribute('aria-hidden', 'true');
	setBackgroundInert(false);
	if (detailDialog.classList.contains('bottom-sheet')) {
		detailDialog.classList.remove('active');
		detailHideTimer = setTimeout(() => {
			detailDialog.style.display = 'none';
			detailHideTimer = undefined;
		}, 150);
	} else {
		detailDialog.style.display = 'none';
	}
	activeDate = null;
	if (updateHistory && history.state && history.state.zangliDetail) {
		focusCalendarAfterRender = true;
		history.back();
		return;
	}
	if (updateHistory && (location.pathname !== basePath || location.hash)) {
		history.replaceState({}, '', basePath);
		rememberHistoryLocation();
		focusCalendarAfterRender = true;
		zangli_callback();
	}
	if (previouslyFocusedElement && previouslyFocusedElement.isConnected && previouslyFocusedElement.focus) {
		previouslyFocusedElement.focus();
	}
}

function shareDate() {
	if (!activeDate) return;
	const dateText = `${activeDate.getFullYear()}${trans('年')}${activeDate.getMonth() + 1}${trans('月')}${activeDate.getDate()}${trans('日')}`;
	const url = `${location.origin}${basePath}date/${formatDate(activeDate)}`;
	const shareData = {
		title: `${trans('百年藏历')} - ${dateText}`,
		text: `${trans('查看')}${dateText}${trans('的藏历信息')}`,
		url
	};

	if (navigator.share) {
		navigator.share(shareData).catch(error => {
			if (error && error.name !== 'AbortError') {
				copyWithLegacyFallback(url, trans('分享链接已复制'));
			}
		});
	} else {
		copyWithLegacyFallback(url, trans('分享链接已复制'));
	}
}

function showToast(message) {
	const toast = document.createElement('div');
	toast.textContent = message;
	toast.style.position = 'fixed';
	toast.style.bottom = '20px';
	toast.style.left = '50%';
	toast.style.transform = 'translateX(-50%)';
	toast.style.background = 'rgba(0,0,0,0.7)';
	toast.style.color = '#fff';
	toast.style.padding = '8px 12px';
	toast.style.borderRadius = '4px';
	toast.style.zIndex = '1002';
	toast.setAttribute('role', 'status');
	document.body.appendChild(toast);
	setTimeout(() => toast.remove(), 2000);
}

function checkDeepLink() {
	const date = parseDeepLinkDate();
	if (!isSupportedDate(date)) return;
	const cell = document.querySelector(`.calendar-table td[data-date="${formatDate(date)}"]`);
	if (cell) showDay(cell);
}

function handleHistoryChange() {
	const hadDeepLink = Boolean(matchDeepLinkRoute());
	if (hadDeepLink) zangli_callback();
	const date = parseDeepLinkDate();
	if (isSupportedDate(date)) {
		if (!hadDeepLink) zangli_callback();
		const cell = document.querySelector(`.calendar-table td[data-date="${formatDate(date)}"]`);
		if (cell) showDay(cell);
		return;
	}
	const wasDetailOpen = Boolean(
		detailDialog &&
		detailDialog.style.display === 'block' &&
		detailDialog.getAttribute('aria-hidden') === 'false'
	);
	if (wasDetailOpen) focusCalendarAfterRender = true;
	closeDetail(false);
	zangli_callback();
}

function scheduleHistoryChange() {
	const locationKey = `${location.pathname}${location.search}${location.hash}`;
	if (locationKey === lastHistoryLocation) return;
	lastHistoryLocation = locationKey;
	if (historySyncFrame) return;
	historySyncFrame = requestAnimationFrame(() => {
		historySyncFrame = undefined;
		handleHistoryChange();
		lastHistoryLocation = `${location.pathname}${location.search}${location.hash}`;
	});
}

function trapDialogFocus(event) {
	if (event.key !== 'Tab') return;
	const focusable = [...detailDialog.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
		.filter(element => element.offsetParent !== null);
	if (!focusable.length) {
		event.preventDefault();
		detailDialog.focus();
		return;
	}

	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (!detailDialog.contains(document.activeElement)) {
		event.preventDefault();
		first.focus();
	} else if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

function handleDocumentKeydown(event) {
	if (event.key === 'Escape') {
		closeDetail();
		return;
	}
	if (detailDialog && detailDialog.style.display === 'block') {
		trapDialogFocus(event);
		if (event.key.toLowerCase() === 'c' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			copyDateInfo();
		}
		if (event.key.toLowerCase() === 's' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			shareDate();
		}
		return;
	}

	const interactive = /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/i.test(event.target.tagName);
	if (!interactive && ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
		event.preventDefault();
		focusCalendarAfterRender = Boolean(getCalendarCell(event.target));
		changeDate(event.keyCode);
	}
}

function initApp() {
	initDetailElements();
	const calendarBody = document.querySelector('.calendar-table tbody');
	calendarBody.addEventListener('click', event => showDay(event.target));
	calendarBody.addEventListener('keydown', handleCalendarKeydown);
	detailMask.addEventListener('click', () => closeDetail());
	document.addEventListener('keydown', handleDocumentKeydown);
	window.addEventListener('hashchange', scheduleHistoryChange);
	window.addEventListener('popstate', scheduleHistoryChange);
	zangli_callback();
	checkDeepLink();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
	initApp();
}
