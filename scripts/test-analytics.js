const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/analytics.js'), 'utf8');
function setup({ host = 'zangli.org', readyState = 'complete', offline = false, redirecting = false } = {}) {
	const listeners = {}, scripts = [];
	const context = vm.createContext({ URL, Date, Set, location: { protocol: 'https:', hostname: host, pathname: '/tw/date/2027-02-06', origin: `https://${host}` }, navigator: { onLine: !offline }, matchMedia: () => ({ matches: false }), localStorage: { getItem() { throw Error('Analytics must not read local storage'); }, setItem() { throw Error('Analytics must not write local storage'); } }, document: { readyState, referrer: 'https://example.org/private?q=secret', cookie: '', createElement: () => ({ remove() {} }), head: { appendChild: s => scripts.push(s) }, addEventListener() {} }, addEventListener: (type, fn) => { listeners[type] = fn; } });
	context.window = context;
	context.zangliRedirecting = redirecting;
	vm.runInContext(source, context);
	const events = () => Array.from(context.dataLayer || []).filter(x => x[0] === 'event');
	return { context, scripts, listeners, events };
}
const a = setup();
assert.equal(a.scripts.length, 1, 'Production loads GA4 without a consent UI or user interaction');
a.context.zangliTrack('calendar_export');
assert.equal(a.events().length, 0, 'Events before the tag is ready are not queued');
a.scripts[0].onload();
a.listeners.online();
assert.equal(a.events().length, 1, 'Repeated online events do not duplicate page view');
const consent = a.context.dataLayer.find(x => x[0] === 'consent')[2];
assert.equal(consent.analytics_storage, 'granted');
for (const field of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(consent[field], 'denied');
a.context.zangliTrack('calendar_export', { kind: 'annual', date: '2027-02-06', text: 'secret' });
assert.equal(a.events().length, 2);
const payload = a.events()[1][2];
assert.equal(payload.page_location, 'https://zangli.org/tw/');
assert.equal(payload.page_referrer, 'https://example.org/');
assert.equal(payload.date, undefined); assert.equal(payload.text, undefined);
a.context.zangliTrack('arbitrary'); assert.equal(a.events().length, 2);
assert.equal(setup({ redirecting: true }).scripts.length, 0, 'Language redirect must not count the abandoned page');
for (const host of ['localhost', 'preview.pages.dev']) assert.equal(setup({ host }).scripts.length, 0);
const deferred = setup({ readyState: 'loading' }); assert.equal(deferred.scripts.length, 0); deferred.listeners.load(); assert.equal(deferred.scripts.length, 1);
const offline = setup({ offline: true }); assert.equal(offline.scripts.length, 0); offline.context.navigator.onLine = true; offline.listeners.online(); assert.equal(offline.scripts.length, 1);
const lateOffline = setup(); lateOffline.context.navigator.onLine = false; lateOffline.scripts[0].onload(); assert.equal(lateOffline.events().length, 0); lateOffline.context.navigator.onLine = true; lateOffline.listeners.online(); assert.equal(lateOffline.events().length, 1);
const failure = setup(); failure.scripts[0].onerror(); assert.equal(failure.context.dataLayer.length, 0); failure.listeners.online(); assert.equal(failure.scripts.length, 2); failure.scripts[1].onload(); assert.equal(failure.events().length, 1);
for (const file of ['index.html', 'tw/index.html', 'en/index.html', 'bo/index.html']) {
 const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
 assert.ok(!html.includes('analyticsConsent'), 'Consent UI removed from ' + file);
 assert.equal((html.match(/src="\/js\/analytics.js/g) || []).length, 1);
}
console.log('Analytics checks passed: automatic startup, single page view, advertising disabled, allowlist, sanitized metadata, production-only and offline recovery.');
