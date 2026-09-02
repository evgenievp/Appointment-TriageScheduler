// Строи колоните на седмичния грид от плоския списък слотове.
//
// Живее тук, защото два екрана го ползват: календарът на пациента и прегледът
// преди създаване на часове. Различават се само по това как оцветяват клетката.
//
// Две правила определят вида:
//
// 1. Всеки ден има своята стъпка — тя се чете от неговите слотове
//    (`endTime − startTime`). Ден без слотове взима най-едрата в седмицата, за
//    да е с най-малко клетки.
//
// 2. Всички колони се разпъват до обхвата на седмицата — от най-ранното начало
//    до най-късния край. Часовете, за които ден няма слот, стават `none`.
//    Оттам идва и подравняването: колоните са еднакво високи и покриват един и
//    същ интервал, значи позицията на даден час е една и съща във всяка колона,
//    независимо от стъпката. Без разпъването това важи само докато всички дни
//    имат еднакво работно време.

// "2026-08-13T09:20:00" → 560. Минути от полунощ.
const minutesOf = (localDateTime) =>
  Number(localDateTime.slice(11, 13)) * 60 + Number(localDateTime.slice(14, 16));

const clockLabel = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const timeLabel = (localDateTime) => localDateTime.slice(11, 16);

/**
 * @param days [{ key: "2026-09-07", weekday, label }] — вече форматирани
 * @param slots SlotDto[] — плоският списък за седмицата
 * @param stateOf (slot) => 'free' | 'mine' | 'taken' | 'blocked' | 'past'
 */
export function buildSlotColumns(days, slots, stateOf) {
  const all = slots ?? [];

  const byDay = days.map((day) => {
    const raw = all
      .filter((slot) => slot.startTime.startsWith(day.key))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      ...day,
      raw,
      slots: raw.map((slot) => ({
        id: slot.id,
        time: timeLabel(slot.startTime),
        startTime: slot.startTime,
        state: stateOf(slot),
      })),
    };
  });

  // `raw` е вътрешно — не излиза от помощника.
  const strip = ({ key, weekday, label, slots: cells }) => ({
    key,
    weekday,
    label,
    slots: cells,
  });

  if (!all.length) return byDay.map(strip);

  const spanStart = Math.min(...all.map((slot) => minutesOf(slot.startTime)));
  const spanEnd = Math.max(...all.map((slot) => minutesOf(slot.endTime)));

  const cadenceOf = (raw) =>
    raw.length ? minutesOf(raw[0].endTime) - minutesOf(raw[0].startTime) : 0;

  const cadences = byDay.map((day) => cadenceOf(day.raw)).filter(Boolean);
  const widest = cadences.length ? Math.max(...cadences) : 0;

  return byDay.map((full) => {
    const day = strip(full);
    const step = cadenceOf(full.raw) || widest;
    if (!step || spanEnd <= spanStart) return day;

    const byTime = new Map(day.slots.map((slot) => [slot.time, slot]));
    const cells = [];
    for (let m = spanStart; m + step <= spanEnd; m += step) {
      const time = clockLabel(m);
      cells.push(byTime.get(time) ?? { id: `${day.key}-${time}`, time, state: 'none' });
    }
    return { ...day, slots: cells };
  });
}
