const pad = (value: number) => String(value).padStart(2, "0");

// "2009-03-14" como fecha local (new Date("2009-03-14") la tomaría en UTC y en
// Colombia mostraría el día anterior).
export const parseDateOnly = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Valor para <input type="date">: "2026-09-27"
export const toDateInputValue = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Valor para <input type="datetime-local">: "2026-09-27T10:00"
export const toDateTimeInputValue = (iso: string): string => {
  const date = new Date(iso);
  return `${toDateInputValue(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Hora local del navegador ("2026-09-27T10:00") a ISO en UTC.
export const fromDateTimeInputValue = (value: string): string =>
  new Date(value).toISOString();

// Inicio del día local de un "YYYY-MM-DD" en ISO.
export const startOfDayIso = (value: string): string =>
  parseDateOnly(value).toISOString();

// Inicio del día siguiente: sirve como límite exclusivo de un rango [from, to).
export const endOfDayExclusiveIso = (value: string): string => {
  const date = parseDateOnly(value);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const getAge = (dateOfBirth: string, today: Date): number => {
  const birth = parseDateOnly(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age;
};

export const isSameMonth = (iso: string, reference: Date): boolean => {
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
};

// "2026-09-27"
export const formatDate = (iso: string): string =>
  toDateInputValue(iso.length === 10 ? parseDateOnly(iso) : new Date(iso));

// "2026-09-27 10:00"
export const formatDateTime = (iso: string): string =>
  toDateTimeInputValue(iso).replace("T", " ");

// "27 sep"
export const formatShortDate = (iso: string): string =>
  new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" })
    .format(new Date(iso))
    .replace(".", "");

// "sep 2026"
export const formatMonthYear = (date: Date): string =>
  new Intl.DateTimeFormat("es-CO", { month: "short", year: "numeric" })
    .format(date)
    .replace(".", "")
    .replace(" de ", " ");
