/**
 * Language detection and redirection helper.
 *
 * Redirects Traditional Chinese users to the `/tw/` path **within** the current
 * base directory. The previous implementation prefixed the entire path with
 * `/tw`, resulting in URLs like `/tw/zangli/`. This updated logic extracts the
 * directory part of the current path (e.g. `/zangli/`) and inserts `tw/` after
 * it, producing `/zangli/tw/`.
 */
(function () {
  const LOCALE_TRAD = /^(zh-(TW|HK|MO))/i;

  const baseMatch = location.pathname.match(/^\/[^\/]*\//);
  const basePath  = baseMatch ? baseMatch[0] : '/';
  const twPrefix  = basePath + 'tw/';
  const onTwPath  = new RegExp('^' + twPrefix.replace(/\//g, '\\/'), 'i')
    .test(location.pathname);

  const browserLang = (navigator.languages && navigator.languages[0]) ||
                      navigator.language || navigator.userLanguage;

  function redirect(path) {
    location.replace(path + location.search + location.hash);
  }

  if (LOCALE_TRAD.test(browserLang)) {
    if (!onTwPath) {
      const newPath = twPrefix + location.pathname.slice(basePath.length);
      redirect(newPath);
    }
  } else {
    if (onTwPath) {
      const newPath = basePath + location.pathname.slice(twPrefix.length);
      redirect(newPath);
    }
  }
})();