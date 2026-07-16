const isTrad = /(?:^|\/)tw(?:\/|$)/i.test(location.pathname);
const traditionalPhrases = window.ZANGLI_TRADITIONAL_PHRASES || [];
const traditionalCharacters = window.ZANGLI_TRADITIONAL_CHARACTERS || {};
const traditionalCharacterPattern = Object.keys(traditionalCharacters).length
  ? new RegExp(`[${Object.keys(traditionalCharacters).join('')}]`, 'g')
  : null;

function trans(value) {
  if (!isTrad || typeof value !== 'string') return value;

  let result = value;
  for (const [simplified, traditional] of traditionalPhrases) {
    result = result.split(simplified).join(traditional);
  }
  if (traditionalCharacterPattern) {
    result = result.replace(
      traditionalCharacterPattern,
      character => traditionalCharacters[character]
    );
  }
  return result;
}

window.isTrad = isTrad;
window.trans = trans;
