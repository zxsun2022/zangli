(function () {
  const LOCALE_TRAD = /^zh(?:[-_](?:TW|HK|MO|HANT))/i;
  const onTwPath    = /^\/tw(\/|$)/i.test(location.pathname);

  const lang = (navigator.languages && navigator.languages[0]) ||
               navigator.language;

  if (LOCALE_TRAD.test(lang)) {
    if (!onTwPath) {
      const newPath = '/tw' + (location.pathname.replace(/\/$/, '') || '') + (location.pathname.endsWith('/') ? '/' : '');
      location.replace(newPath);
    }
  } else {
    if (onTwPath) {
      const newPath = location.pathname.replace(/^\/tw\/?/, '/');
      location.replace(newPath || '/');
    }
  }
})(); 