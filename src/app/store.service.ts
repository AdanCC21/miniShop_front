import { Injectable, signal } from '@angular/core';

import { Order, ORDERS } from './views/orders/orders.data';

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly openDays = signal<number[]>([1, 2, 3, 4, 5]);
  readonly orders = signal<Order[]>(ORDERS);

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
}
