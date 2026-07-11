// src/utils/dates.ts

/**
 * Calcula el rango del ciclo de sueldo actual.
 * Si hoy es >= incomeDay, el ciclo va desde el incomeDay de este mes
 * hasta el día anterior al incomeDay del mes siguiente.
 * Si hoy es < incomeDay, el ciclo va desde el incomeDay del mes anterior
 * hasta el día anterior al incomeDay de este mes.
 */
export function getCycleRange(incomeDay = 1, referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const day = referenceDate.getDate();

  let startYear = year;
  let startMonth = month;

  

  if (day < incomeDay) {
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }

  const start = clampToValidDate(startYear, startMonth, incomeDay);

  let endMonth = startMonth + 1;
  let endYear = startYear;
  if (endMonth > 11) {
    endMonth = 0;
    endYear += 1;
  }
  const end = clampToValidDate(endYear, endMonth, incomeDay);
  end.setDate(end.getDate() - 1); // el día anterior al próximo incomeDay

  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export function getPreviousCycleRange(incomeDay = 1, referenceDate = new Date()) {
  const current = getCycleRange(incomeDay, referenceDate);
  const prevReference = new Date(current.from);
  prevReference.setDate(prevReference.getDate() - 1); // un día antes del inicio del ciclo actual
  return getCycleRange(incomeDay, prevReference);
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function advanceDate(dateStr: string, frequency: 'weekly' | 'monthly' | 'yearly'): string {
  const date = parseLocalDate(dateStr);

  if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else {
    date.setFullYear(date.getFullYear() + 1);
  }

  return date.toISOString().slice(0, 10);
}

/** Rango de los últimos 7 días, para comparación semanal */
export function getWeekRange(referenceDate = new Date()) {
  const to = new Date(referenceDate);
  const from = new Date(referenceDate);
  from.setDate(from.getDate() - 6);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function getPreviousWeekRange(referenceDate = new Date()) {
  const prevReference = new Date(referenceDate);
  prevReference.setDate(prevReference.getDate() - 7);
  return getWeekRange(prevReference);
}

/** Clampea el día al último día válido del mes (ej: incomeDay=31 en febrero -> 28/29) */
function clampToValidDate(year: number, month: number, day: number): Date {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDayOfMonth));
}

export function formatCycleLabel(from: string, to: string) {
  const formatter = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' });
  return `${formatter.format(new Date(from))} – ${formatter.format(new Date(to))}`;
}

