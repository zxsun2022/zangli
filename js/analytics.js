// GA4 starts automatically on production pages. Advertising stays disabled.
(function () {
	'use strict';
	const id = 'G-WY2HDCMYRL';
	const production = !window.zangliRedirecting && location.protocol === 'https:' && ['zangli.org', 'www.zangli.org'].includes(location.hostname);
	let loading = false, ready = false, viewed = false;
	const prefix = /^\/(tw|en|bo)(?:\/|$)/.exec(location.pathname)?.[1];
	const language = prefix || 'zh-cn';
	const year = /\/(\d{4})\/$/.exec(location.pathname)?.[1];
	const pagePath = `${prefix ? `/${prefix}` : ''}/${year ? `${year}/` : ''}`;
	let referrer = '';
	try { referrer = new URL(document.referrer).origin + '/'; } catch (error) {}
	const metadata = {
		page_location: location.origin + pagePath,
		page_title: year ? `Tibetan calendar ${year}` : 'Tibetan calendar',
		page_referrer: referrer,
		page_type: year ? 'year' : 'calendar',
		ui_language: language,
		display_mode: matchMedia('(display-mode: standalone)').matches || navigator.standalone ? 'standalone' : 'browser'
	};
	const allowed = new Set(['page_view', 'date_detail_view', 'calendar_navigate', 'tool_open', 'reverse_lookup', 'calendar_export', 'subscription_click', 'share_click', 'copy_click', 'install_open', 'pwa_installed', 'print_click']);
	function track(name, params = {}) {
		if (!production || !ready || !navigator.onLine || !allowed.has(name)) return;
		const safe = {};
		// Only fixed classification values, never dates, copied text or arbitrary URLs.
		if (['annual', 'reminder', 'annualPanel', 'reversePanel', 'aboutPanel'].includes(params.kind)) safe.kind = params.kind;
		window.gtag('event', name, { ...metadata, ...safe, send_to: id });
	}
	window.zangliTrack = track;
	function pageView() {
		if (ready && navigator.onLine && !viewed) { viewed = true; track('page_view'); }
	}
	function start() {
		if (!production || loading || ready || !navigator.onLine) return;
		loading = true;
		window[`ga-disable-${id}`] = false;
		window.dataLayer = [];
		window.gtag = function () { window.dataLayer.push(arguments); };
		window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
		window.gtag('js', new Date());
		window.gtag('set', metadata);
		window.gtag('config', id, { ...metadata, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
		script.onload = () => {
			loading = false;
			ready = true;
			pageView();
		};
		script.onerror = () => { loading = false; script.remove(); window.dataLayer.length = 0; };
		document.head.appendChild(script);
	}
	window.addEventListener('online', () => { start(); pageView(); });
	document.addEventListener('click', event => {
		const button = event.target.closest('button, a');
		if (!button) return;
		const events = { shareButton: 'share_click', copyButton: 'copy_click', installButton: 'install_open', printButton: 'print_click' };
		if (events[button.id]) track(events[button.id]);
		if (button.getAttribute('href')?.startsWith('webcal:')) track('subscription_click');
	});
	window.addEventListener('appinstalled', () => track('pwa_installed'));
	// Let language redirects finish before starting a network request.
	if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
})();
