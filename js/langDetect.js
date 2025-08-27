(function () {
  // Use navigator.languages for more robust detection, with fallback.
  // The regex covers zh-TW, zh-HK, zh-MO, and the generic zh-Hant.
  const userLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
  const isTwLocale = userLanguages.some(lang => /^zh(?:[-_](?:TW|HK|MO|HANT))/i.test(lang));

  const { pathname, search, hash } = location;

  // Compute if in tw subpath and determine site root for project pages
  const pathSegs = pathname.split('/').filter(Boolean);
  const first = pathSegs[0] || '';
  const inTwSubPath = pathSegs.includes('tw');
  const siteRoot = /^tw$/i.test(first) ? '/' : (first ? `/${first}/` : '/');

  // Check if user has manually visited a specific language version
  const hasLanguagePreference = (typeof sessionStorage !== 'undefined') && sessionStorage.getItem('userLanguageChoice');

  // Helper to build redirect URL, preserving query and hash
  function buildRedirectUrl(newPath) {
    return newPath + search + hash;
  }

  // Normalize legacy /zh-tw to /tw/
  if (/\/zh-tw(\/|$)/i.test(pathname)) {
    const newPath = pathname.replace(/\/zh-tw/ig, '/tw');
    try { sessionStorage.setItem('userLanguageChoice', 'manual-tw'); } catch (e) {}
    location.replace(buildRedirectUrl(newPath));
    return;
  }

  // Only auto-redirect from root/index.html and when no manual choice exists
  const isRoot = pathname === siteRoot || pathname === siteRoot + 'index.html';
  if (!hasLanguagePreference && isRoot) {
    if (isTwLocale && !inTwSubPath) {
      const newPath = siteRoot + 'tw/';
      try { sessionStorage.setItem('userLanguageChoice', 'auto-tw'); } catch (e) {}
      location.replace(buildRedirectUrl(newPath));
      return;
    }
  }

  // Persist user's language choice when they land on a language-specific path
  if (!hasLanguagePreference) {
    try {
      if (inTwSubPath) sessionStorage.setItem('userLanguageChoice', 'manual-tw');
      else if (!isRoot) sessionStorage.setItem('userLanguageChoice', 'manual-cn');
    } catch (e) {}
  }
})();
