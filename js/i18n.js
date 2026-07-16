(function () {
	const pathMatch = location.pathname.match(/^\/(tw|en|bo)(?:\/|$)/i);
	const locale = pathMatch ? pathMatch[1].toLowerCase() : 'zh-cn';
	const traditionalPhrases = window.ZANGLI_TRADITIONAL_PHRASES || [];
	const traditionalCharacters = window.ZANGLI_TRADITIONAL_CHARACTERS || {};
	const messages = window.ZANGLI_MESSAGES || {};
	const traditionalCharacterPattern = Object.keys(traditionalCharacters).length
		? new RegExp(`[${Object.keys(traditionalCharacters).join('')}]`, 'g')
		: null;

	function toTraditional(value) {
		let result = value;
		for (const [simplified, traditional] of traditionalPhrases) {
			result = result.split(simplified).join(traditional);
		}
		return traditionalCharacterPattern
			? result.replace(traditionalCharacterPattern, character => traditionalCharacters[character])
			: result;
	}

	function trans(value) {
		if (typeof value !== 'string') return value;
		if (locale === 'tw') return toTraditional(value);
		if (locale === 'en' || locale === 'bo') {
			return Object.prototype.hasOwnProperty.call(messages[locale], value) ? messages[locale][value] : value;
		}
		return value;
	}

	window.ZANGLI_LOCALE = locale;
	window.isTrad = locale === 'tw';
	window.trans = trans;
})();
