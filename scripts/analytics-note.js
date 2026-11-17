// One-line footer notice for GA4 (D026): Google Analytics terms require disclosing its use. No buttons, no prompt.
// Tibetan beta uses English, like other untranslated chrome.
const PARTNER_SITES = 'https://policies.google.com/technologies/partner-sites';
const copy = {
	'zh-cn': ['本站使用 Google Analytics 及其 Cookie 统计访问，不发送查询日期或分享内容。', 'Google 如何使用这些数据'],
	tw: ['本站使用 Google Analytics 及其 Cookie 統計瀏覽，不傳送查詢日期或分享內容。', 'Google 如何使用這些資料'],
	en: ['This site uses Google Analytics cookies to measure visits. Queried dates and shared content are not sent.', 'How Google uses this data']
};
function analyticsNote(locale) {
	const [text, link] = copy[locale] || copy.en;
	return `<p class="analytics-note">${text} <a href="${PARTNER_SITES}" target="_blank" rel="noopener noreferrer">${link}</a></p>`;
}
module.exports = { analyticsNote };
