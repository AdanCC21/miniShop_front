import { dayOfMonth, nextOccurrence, recurrenceLabel, weekdayName } from './recurrence';

describe('recurrence', () => {
  describe('nextOccurrence', () => {
    it('advances one day for diario', () => {
      expect(nextOccurrence('2026-08-14', 'diario')).toBe('2026-08-15');
    });

    it('advances seven days for semanal', () => {
      expect(nextOccurrence('2026-08-14', 'semanal')).toBe('2026-08-21');
    });

    it('advances fourteen days for quincenal', () => {
      expect(nextOccurrence('2026-08-14', 'quincenal')).toBe('2026-08-28');
    });

    it('advances one month keeping the day for mensual', () => {
      expect(nextOccurrence('2026-01-15', 'mensual')).toBe('2026-02-15');
    });

    it('clamps the day at the end of short months', () => {
      expect(nextOccurrence('2026-01-31', 'mensual')).toBe('2026-02-28');
    });

    it('clamps the day to the last day of February on leap years', () => {
      expect(nextOccurrence('2028-01-31', 'mensual')).toBe('2028-02-29');
    });

    it('advances to the next selected weekday for dias_semana', () => {
      expect(nextOccurrence('2026-08-14', 'dias_semana', [1, 3, 4, 5])).toBe('2026-08-17');
    });

    it('skips unselected weekdays for dias_semana', () => {
      expect(nextOccurrence('2026-08-17', 'dias_semana', [3])).toBe('2026-08-19');
    });

    it('falls back to one day when no days selected for dias_semana', () => {
      expect(nextOccurrence('2026-08-14', 'dias_semana', [])).toBe('2026-08-15');
    });
  });

  describe('weekdayName', () => {
    it('returns the Spanish weekday capitalized', () => {
      expect(weekdayName('2026-08-14')).toBe('Viernes');
      expect(weekdayName('2026-08-18')).toBe('Martes');
    });

    it('returns empty for invalid dates', () => {
      expect(weekdayName('')).toBe('');
    });
  });

  describe('dayOfMonth', () => {
    it('returns the day number of the date', () => {
      expect(dayOfMonth('2026-08-14')).toBe(14);
    });
  });

  describe('recurrenceLabel', () => {
    it('describes each recurrence based on the date', () => {
      expect(recurrenceLabel('diario', '2026-08-14')).toBe('Todos los días');
      expect(recurrenceLabel('semanal', '2026-08-18')).toBe('Cada Martes');
      expect(recurrenceLabel('quincenal', '2026-08-14')).toBe('Cada 2 semanas');
      expect(recurrenceLabel('mensual', '2026-08-14')).toBe('Cada 14 de cada mes');
      expect(recurrenceLabel('dias_semana', '2026-08-14', [1, 3, 4, 5])).toBe(
        'Cada Lunes, Miércoles, Jueves y Viernes'
      );
      expect(recurrenceLabel('dias_semana', '2026-08-14', [3])).toBe('Cada Miércoles');
      expect(recurrenceLabel('dias_semana', '2026-08-14', [])).toBe('Varios días a la semana');
    });
  });
});
