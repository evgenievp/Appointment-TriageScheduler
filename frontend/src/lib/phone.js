import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

// Тънка обвивка над libphonenumber-js, за да не се разлива библиотеката из кода.
//
// Изходът е E.164 (`+359888123456`) — точно низът, който бекендът пази, за да може
// търсенето на пациент по телефон да е точно съвпадение. Голи цифри не вършат работа:
// всяко сравнение се разминава.
//
// Ползва се стандартният внос, а не `/max`. Малките метаданни не разпознават всяко
// невалидно национално начало, но никога не отхвърлят валиден номер — а да спреш човек
// да се регистрира е по-лошо от това да пуснеш един измислен номер.

export const DEFAULT_COUNTRY = 'BG';

// Правилата са по страни, не общи: в България водещата нула пада, в Италия остава.
export const toE164 = (input, country = DEFAULT_COUNTRY) =>
  parsePhoneNumberFromString(input ?? '', country)?.number ?? null;

export const isValidPhone = (input, country = DEFAULT_COUNTRY) =>
  isValidPhoneNumber(input ?? '', country);

// Имената идват от браузъра, тоест няма втори списък за превод и няма разминаване
// между bg и en. Списъкът е около 245 реда и не се мени — затова се смята веднъж.
const lists = new Map();

export function countries(language = 'bg') {
  const cached = lists.get(language);
  if (cached) return cached;

  const names = new Intl.DisplayNames([language], { type: 'region', fallback: 'code' });
  const collator = new Intl.Collator(language);

  const list = getCountries()
    .map((code) => ({
      code,
      name: names.of(code) ?? code,
      dial: getCountryCallingCode(code),
    }))
    .sort((a, b) => collator.compare(a.name, b.name));

  lists.set(language, list);
  return list;
}
