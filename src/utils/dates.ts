// src/utils/dates.ts
export function getMonthRange(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const from = new Date(year, month, 1).toISOString().slice(0, 10);
  const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

export function getPreviousMonthRange(date = new Date()) {
  const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getMonthRange(prevMonth);
}

export function formatMonthLabel(date = new Date()) {
  return new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(date);
}