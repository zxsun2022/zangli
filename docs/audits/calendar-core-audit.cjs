// Read-only diagnostic. Run from any directory: TZ=UTC node <this file>
// Uses pinned local Git objects; does not fetch, checkout, or change production files.
// Fresh clones lack the upstream objects; fetch them once first:
//   git fetch https://github.com/stonelf/zangli master
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const refs = { base: '1c5ec6e30142bce6cd1b616ffac478177e1dafe8', current: 'b0b89b8', upstream: 'c29e60f' };
const source = (ref, file) => cp.execFileSync('git', ['show', `${ref}:${file}`], { cwd: root, encoding: 'utf8' });
const quiet = { error() {}, warn() {}, log() {} };
function loadLegacy(ref) {
  const ctx = vm.createContext({ Date, console: quiet, trans: x => x });
  vm.runInContext(source(ref, 'zangli.js') + '\nthis.table = specialDays;', ctx);
  if (ref === refs.current) vm.runInContext(source(ref, 'eclipse.js'), ctx);
  return ctx;
}
function loadModule(file) {
  const ctx = vm.createContext({ Date, console: quiet, module: { exports: {} },
    require: name => loadModule(name.replace(/^\.\//, '') + '.js') });
  vm.runInContext(source(refs.upstream, file), ctx);
  return ctx.module.exports;
}
const base = loadLegacy(refs.base), current = loadLegacy(refs.current);
const upstream = loadModule('zangli.js');
const upstreamData = loadModule('data/special-days.js');
const upstreamEclipses = loadModule('data/eclipse-list.js');
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const civilDate = (s, hour = 12) => { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d,hour); };
const safely = (fn, input) => { try { return fn(input) ?? { returnedUndefined: true }; } catch(e) { return { threw: e.message }; } };
let offset = 0, decodeMismatches = 0, upstreamDateDifferences = 0, infoDifferences = 0;
let clampNeeded = 0;
const strict = vm.createContext({ Date, console: quiet, trans: x => x });
vm.runInContext(source(refs.current, 'zangli.js').replace('if (tDays2 < 0) tDays2 = 0;', 'if (tDays2 < 0) throw Error("clamp");').replace('if (tDays2 > 29) tDays2 = 29;', 'if (tDays2 > 29) throw Error("clamp");'), strict);
const monthLengths = {}, misplacedSaga = [], invalidTableEntries = [], decoderExamples = [];
// Independent decoder of the SAME encoding, not independent historical evidence.
for (let yi = 0; yi < current.table.length; yi++) {
  let month = yi === 0 ? 11 : 0;
  for (const exceptions of current.table[yi]) {
    if (!exceptions.includes(0)) month++;
    if (new Set(exceptions).size !== exceptions.length || exceptions.some(x => !Number.isInteger(x) || Math.abs(x) > 30 || (x > 0 && exceptions.includes(-x)))) invalidTableEntries.push({ yi, month, exceptions });
    const sequence = [];
    for (let day = 1; day <= 30; day++) {
      if (exceptions.includes(-day)) continue;
      sequence.push({ day, repeated: false });
      if (exceptions.includes(day)) sequence.push({ day, repeated: true });
    }
    monthLengths[sequence.length] = (monthLengths[sequence.length] || 0) + 1;
    for (const expected of sequence) {
      const utc = new Date(Date.UTC(1951,0,8 + offset++));
      const key = utc.toISOString().slice(0,10), date = civilDate(key);
      const got = current.getZangli(date), other = upstream.getZangli(date);
      try { strict.getZangli(date); } catch { clampNeeded++; }
      if (got?.dayNumber !== expected.day || got?.dayLeap !== expected.repeated || got?.monthNumber !== month || got?.monthLeap !== exceptions.includes(0)) {
        decodeMismatches++;
        if (decoderExamples.length < 3) decoderExamples.push({ key, expected, month, got });
      }
      if (['year','month','day','monthLeap','dayLeap','dayMiss'].some(k => got?.[k] !== other?.[k])) upstreamDateDifferences++;
      if (['extraInfo','extraInfo2'].some(k => got?.[k] !== other?.[k])) infoDifferences++;
      if (got?.extraInfo.includes('成道日') && got.monthNumber !== 4) misplacedSaga.push(key);
    }
  }
}
const examples = ['2019-05-18','2019-06-17','2025-02-28','2025-04-02','2025-04-03','2025-11-10','2025-11-11','2025-11-19','2025-11-20','2026-02-18'].map(date => ({ date, result: current.getZangli(civilDate(date)) }));
const inputs = [civilDate('1951-01-08',0),civilDate('2051-02-12',0),new Date(NaN),NaN,null,'2026-02-18','2026-02-30'];
const malformedContacts = current.eclipseList.filter(e => e.length > 2 && !(e[2] <= e[0] && e[0] <= e[3])).map(e => ({ maximum:new Date(e[0]).toISOString(),start:new Date(e[2]).toISOString(),end:new Date(e[3]).toISOString() }));
const eclipseDataDifferences = current.eclipseList.flatMap((e,i) => JSON.stringify(e) === JSON.stringify(upstreamEclipses.eclipseList[i]) ? [] : [{ index:i,current:e,upstream:upstreamEclipses.eclipseList[i] }]);
console.log(JSON.stringify({ refs, timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
  dataHashes:{base:hash(base.table),current:hash(current.table),upstream:hash(upstreamData.specialDays)},
  eclipseHashes:{base:hash(base.eclipseList),current:hash(current.eclipseList),upstream:hash(upstreamEclipses.eclipseList)},
  years:current.table.length,days:offset,monthLengths,invalidTableEntries,decodeMismatches,decoderExamples,clampNeeded,upstreamDateDifferences,infoDifferences,misplacedSaga,
  examples,inputs:inputs.map(input => ({ input:String(input),current:safely(current.getZangli,input),upstream:safely(upstream.getZangli,input) })),
  eclipseCount:current.eclipseList.length,malformedContacts,eclipseDataDifferences,eclipseExample:current.getEclipse(civilDate('2024-03-25'))
},null,2));
