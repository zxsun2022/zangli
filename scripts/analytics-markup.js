// Shared consent copy for generated home and year pages. Tibetan beta uses English.
function analyticsMarkup(locale) {
	const copy = locale === 'zh-cn' ? [
		'隐私与访问统计', '允许使用 Google Analytics 帮助我们了解页面访问和功能使用情况吗？同意后 Google 会使用 Cookie 识别浏览器，并接收访问、设备及大致地区信息。我们不发送具体查询日期或分享内容，也不启用广告个性化。拒绝不影响任何功能；你可以随时在此更改选择。撤回不会删除已发送的数据。', '允许统计', '拒绝统计', '已允许统计', '已拒绝统计', 'Google 隐私政策'
	] : locale === 'tw' ? [
		'隱私與瀏覽統計', '允許使用 Google Analytics 協助我們了解頁面瀏覽和功能使用情況嗎？同意後 Google 會使用 Cookie 識別瀏覽器，並接收瀏覽、裝置及大致地區資訊。我們不傳送具體查詢日期或分享內容，也不啟用廣告個人化。拒絕不影響任何功能；你可以隨時在此變更選擇。撤回不會刪除已傳送的資料。', '允許統計', '拒絕統計', '已允許統計', '已拒絕統計', 'Google 隱私權政策'
	] : [
		'Privacy & analytics', 'May we use Google Analytics to understand page visits and feature use? With your permission, Google uses cookies to recognize your browser and receives usage, device and approximate location information. We do not send queried dates or shared content, or enable ad personalization. All features work if you decline. Change your choice here at any time. Withdrawal does not delete data already sent.', 'Allow analytics', 'Decline analytics', 'Analytics allowed', 'Analytics declined', 'Google Privacy Policy'
	];
	return `<details id="analyticsConsent" class="analytics-consent"><summary>${copy[0]}</summary><p>${copy[1]} <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">${copy[6]}</a></p><div class="analytics-actions"><button type="button" class="secondary-button" data-analytics-choice="granted">${copy[2]}</button><button type="button" class="secondary-button" data-analytics-choice="denied">${copy[3]}</button></div><p id="analyticsStatus" role="status" data-granted="${copy[4]}" data-denied="${copy[5]}"></p></details>`;
}
module.exports = { analyticsMarkup };
