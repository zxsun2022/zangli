(function () {
  const LOCALE_TRAD = /^(zh-(TW|HK|MO))/i;
  const onTwPath    = /^\/tw(\/|$)/i.test(location.pathname);

  if (LOCALE_TRAD.test(navigator.language || navigator.userLanguage)) {
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