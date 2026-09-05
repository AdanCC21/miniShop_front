import { RecurrenceType } from './orders.data';

const WEEKDAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function nextOccurrence(iso: string, type: RecurrenceType, days?: number[]): string {
  const date = parseISODate(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  switch (type) {
    case 'diario':
      date.setDate(date.getDate() + 1);
      break;
    case 'semanal':
      date.setDate(date.getDate() + 7);
      break;
    case 'quincenal':
      date.setDate(date.getDate() + 14);
      break;
    case 'dias_semana': {
      const selected = days ?? [];
      if (selected.length === 0) {
        date.setDate(date.getDate() + 1);
        break;
      }
      do {
        date.setDate(date.getDate() + 1);
      } while (!selected.includes(date.getDay()));
      break;
    }
    case 'mensual': {
      const day = date.getDate();
      date.setMonth(date.getMonth() + 1);
      if (date.getDate() < day) {
        date.setDate(0);
      }
      break;
    }
  }
  return toISODate(date);
}

export function weekdayName(iso: string): string {
  const date = parseISODate(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const weekday = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(date);
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function dayOfMonth(iso: string): number {
  const date = parseISODate(iso);
  if (Number.isNaN(date.getTime())) {
    return 1;
  }
  return date.getDate();
}

export function recurrenceLabel(type: RecurrenceType, date: string, days?: number[]): string {
  switch (type) {
    case 'diario':
      return 'Todos los días';
    case 'semanal':
      return `Cada ${weekdayName(date)}`;
    case 'quincenal':
      return 'Cada 2 semanas';
    case 'dias_semana': {
      const names = (days ?? [])
        .slice()
        .sort((a, b) => a - b)
        .map((day) => WEEKDAY_NAMES[day]);
      if (names.length === 0) {
        return 'Varios días a la semana';
      }
      if (names.length === 1) {
        return `Cada ${names[0]}`;
      }
      return `Cada ${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
    }
    case 'mensual':
      return `Cada ${dayOfMonth(date)} de cada mes`;
  }
}
