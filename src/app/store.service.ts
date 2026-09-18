import { Injectable, signal } from '@angular/core';

import { Order, ORDERS } from './views/orders/orders.data';
import { SaleRecord } from './views/cajero/cajero.data';


export interface DailyClosure {
  date: string;
  sales: number;
  productsSold: number;
  total: number;
  initial?: number;
  history?: SaleRecord[];
}

const CLOSURES_KEY = 'minishop_closures';
const FIADOS_KEY = 'minishop_fiados';

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly openDays = signal<number[]>([1, 2, 3, 4, 5]);
  readonly orders = signal<Order[]>(ORDERS);
  readonly closures = signal<DailyClosure[]>(this.loadClosures());
  // readonly fiados = signal<FiadoPerson[]>(this.loadFiados());

  addClosure(closure: DailyClosure): void {
    this.closures.update((list) => {
      const withoutDay = list.filter((item) => item.date !== closure.date);
      return [...withoutDay, closure];
    });
    localStorage.setItem(CLOSURES_KEY, JSON.stringify(this.closures()));
  }

  // addFiado(personName: string, amount: number, date: string): void {
  //   this.fiados.update((list) => {
  //     const existing = list.find(
  //       (person) => person.name.toLowerCase() === personName.trim().toLowerCase()
  //     );
  //     if (existing) {
  //       return list.map((person) =>
  //         person === existing ? { ...person, fiados: [...person.fiados, { date, amount }] } : person
  //       );
  //     }
  //     return [...list, { name: personName.trim(), fiados: [{ date, amount }] }];
  //   });
  //   localStorage.setItem(FIADOS_KEY, JSON.stringify(this.fiados()));
  // }

  // addPerson(personName: string): void {
  //   const name = personName.trim();
  //   if (name === '') {
  //     return;
  //   }
  //   const exists = this.fiados().some(
  //     (person) => person.name.toLowerCase() === name.toLowerCase()
  //   );
  //   if (exists) {
  //     return;
  //   }
  //   this.fiados.update((list) => [...list, { name, fiados: [] }]);
  //   localStorage.setItem(FIADOS_KEY, JSON.stringify(this.fiados()));
  // }

  closuresForMonth(month: string): DailyClosure[] {
    return this.closures().filter((closure) => closure.date.startsWith(month));
  }

  isOpen(iso: string): boolean {
    const [year, month, day] = iso.split('-').map(Number);
    if ([year, month, day].some((part) => Number.isNaN(part))) {
      return true;
    }
    return this.openDays().includes(new Date(year, month - 1, day).getDay());
  }

  isOpenDay(day: number): boolean {
    return this.openDays().includes(day);
  }

  private loadClosures(): DailyClosure[] {
    const raw = localStorage.getItem(CLOSURES_KEY);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as DailyClosure[];
    } catch {
      return [];
    }
  }

  // private loadFiados(): FiadoPerson[] {
  //   const raw = localStorage.getItem(FIADOS_KEY);
  //   if (!raw) {
  //     return FIADOS;
  //   }
  //   try {
  //     return JSON.parse(raw) as FiadoPerson[];
  //   } catch {
  //     return FIADOS;
  //   }
  // }
}