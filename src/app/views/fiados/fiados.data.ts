export interface Fiado {
  date: string;
  amount: number;
}

export interface FiadoPerson {
  name: string;
  fiados: Fiado[];
}

export const FIADOS: FiadoPerson[] = [
  {
    name: 'María López',
    fiados: [
      { date: '2026-08-10', amount: 85.5 },
      { date: '2026-08-14', amount: 120.0 },
      { date: '2026-08-18', amount: 45.75 }
    ]
  },
  {
    name: 'José Hernández',
    fiados: [
      { date: '2026-08-05', amount: 210.0 },
      { date: '2026-08-16', amount: 32.25 }
    ]
  },
  {
    name: 'Ana Martínez',
    fiados: [{ date: '2026-08-19', amount: 98.0 }]
  },
  {
    name: 'Pedro Ramírez',
    fiados: [
      { date: '2026-07-28', amount: 156.5 },
      { date: '2026-08-02', amount: 64.0 },
      { date: '2026-08-12', amount: 89.9 }
    ]
  },
  {
    name: 'Carmen Torres',
    fiados: [
      { date: '2026-08-08', amount: 45.0 },
      { date: '2026-08-20', amount: 132.75 }
    ]
  },
  {
    name: 'Luis García',
    fiados: [{ date: '2026-07-30', amount: 78.25 }]
  }
];

export function personTotal(person: FiadoPerson): number {
  return person.fiados.reduce((sum, fiado) => sum + fiado.amount, 0);
}

export function personLastDate(person: FiadoPerson): string {
  return person.fiados.reduce((latest, fiado) => (fiado.date > latest ? fiado.date : latest), '');
}