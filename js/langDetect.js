(function () {
  // Use navigator.languages for more robust detection, with fallback.
  // The regex covers zh-TW, zh-HK, zh-MO, and the generic zh-Hant.
  const userLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
  const isTwLocale = userLanguages.some(lang => /^zh(?:[-_](?:TW|HK|MO|HANT))/i.test(lang));

  const { pathname, search, hash } = location;

  // Detect if the site is running in a subdirectory (like GitHub Pages)
  // and determine the correct base path.
  let basePath = '/';
  const onTwPath = /^\/tw(\/|$)/.test(pathname);
  const subdirMatch = pathname.match(/^(\/[^/]+\/)(tw\/)?/);
  if (subdirMatch && subdirMatch[1] !== '/tw/') {
    basePath = subdirMatch[1];
  }

  const inTwSubPath = pathname.startsWith(basePath + 'tw/');

  // Function to build the final URL, preserving query parameters and hash.
  function buildRedirectUrl(newPath) {
    return newPath + search + hash;
  }

  if (isTwLocale) {
    // If browser locale is TW/HK/MO, but we are not on the 'tw' path, redirect.
    if (!inTwSubPath) {
      const relativePath = pathname.substring(basePath.length);
      const newPath = (basePath + 'tw/' + relativePath).replace(/\/\//g, '/');
      location.replace(buildRedirectUrl(newPath));
    }
  } else {
    // If browser locale is not TW/HK/MO, but we are on the 'tw' path, redirect back.
    if (inTwSubPath) {
      const newPath = pathname.replace(basePath + 'tw/', basePath).replace(/\/\//g, '/');
      location.replace(buildRedirectUrl(newPath));
    }
  }
})(); 