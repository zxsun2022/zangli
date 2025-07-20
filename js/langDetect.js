(function () {
  // Early exit if we're already being redirected or if document is not ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arguments.callee);
    return;
  }

  // Use navigator.languages for more robust detection, with fallback.
  // The regex covers zh-TW, zh-HK, zh-MO, and the generic zh-Hant.
  const userLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
  const isTwLocale = userLanguages.some(lang => /^zh(?:[-_](?:TW|HK|MO|HANT))/i.test(lang));

  const { pathname, search, hash } = location;

  // Detect if the site is running in a subdirectory (like GitHub Pages)
  // and determine the correct base path.
  let basePath = '/';
  const subdirMatch = pathname.match(/^(\/[^/]+\/)(tw\/)?/);
  if (subdirMatch && subdirMatch[1] !== '/tw/') {
    basePath = subdirMatch[1];
  }

  const inTwSubPath = pathname.startsWith(basePath + 'tw/');

  // Check if user has manually visited a specific language version
  // by checking if there's a language preference stored or if they came from a direct link
  const hasLanguagePreference = sessionStorage.getItem('userLanguageChoice');

  // Function to build the final URL, preserving query parameters and hash.
  function buildRedirectUrl(newPath) {
    return newPath + search + hash;
  }

  // Handle /zh-tw URL redirect to /tw/ with immediate execution
  if (pathname.includes('/zh-tw')) {
    const newPath = pathname.replace('/zh-tw', '/tw');
    sessionStorage.setItem('userLanguageChoice', 'manual-tw');

    // Immediate redirect to prevent any script loading issues
    const redirectUrl = buildRedirectUrl(newPath);

    // Stop any further script execution
    document.addEventListener('DOMContentLoaded', function (e) {
      e.stopImmediatePropagation();
    });

    // Multiple redirect methods for maximum compatibility
    if (history.replaceState) {
      history.replaceState(null, null, redirectUrl);
      location.reload();
    } else {
      location.replace(redirectUrl);
    }

    // Prevent any further execution
    throw new Error('Redirecting to ' + redirectUrl);
  }

  // Only auto-redirect based on browser language if:
  // 1. User hasn't made a manual language choice in this session
  // 2. User is accessing the root page (not a specific language version)
  if (!hasLanguagePreference && (pathname === basePath || pathname === basePath + 'index.html')) {
    if (isTwLocale && !inTwSubPath) {
      // Redirect to traditional Chinese version
      const newPath = basePath + 'tw/';
      sessionStorage.setItem('userLanguageChoice', 'auto-tw');
      location.replace(buildRedirectUrl(newPath));
    }
  }

  // Store user's language choice when they visit a specific language version
  if (inTwSubPath && !hasLanguagePreference) {
    sessionStorage.setItem('userLanguageChoice', 'manual-tw');
  } else if (!inTwSubPath && pathname !== basePath && pathname !== basePath + 'index.html' && !hasLanguagePreference) {
    sessionStorage.setItem('userLanguageChoice', 'manual-cn');
  }
})(); 