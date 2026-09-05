import { Component, computed, inject, signal } from '@angular/core';

import { FiadoPerson, personLastDate, personTotal } from './fiados.data';
import { StoreService } from '../../store.service';
import { formatDate } from '../orders/orders.data';
import { ButtonComponent } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { ModalComponent } from '../../ui/modal/modal';
import { ToastService } from '../../ui/toast/toast.service';

@Component({
  selector: 'app-fiados',
  imports: [ButtonComponent, InputComponent, ModalComponent],
  templateUrl: './fiados.html'
})
export class FiadosComponent {
  private readonly store = inject(StoreService);
  private readonly toast = inject(ToastService);

  protected readonly people = computed<FiadoPerson[]>(() =>
    [...this.store.fiados()].sort((a, b) => personLastDate(b).localeCompare(personLastDate(a)))
  );

  protected readonly selectedPerson = signal<FiadoPerson | null>(null);
  protected readonly addOpen = signal(false);
  protected readonly newPersonName = signal('');

  protected total(person: FiadoPerson): number {
    return personTotal(person);
  }

  protected lastDate(person: FiadoPerson): string {
    return personLastDate(person);
  }

  protected formatDate(iso: string): string {
    return formatDate(iso);
  }

  protected formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  protected openDetails(person: FiadoPerson): void {
    this.selectedPerson.set(person);
  }

  protected closeDetails(): void {
    this.selectedPerson.set(null);
  }

  protected openAddPerson(): void {
    this.newPersonName.set('');
    this.addOpen.set(true);
  }

  protected closeAddPerson(): void {
    this.addOpen.set(false);
  }

  protected onNewPersonNameChange(value: string): void {
    this.newPersonName.set(value);
  }

  protected confirmAddPerson(): void {
    const name = this.newPersonName().trim();
    if (name === '') {
      this.toast.error('Nombre vacío', 'Escribe el nombre de la persona.');
      return;
    }
    this.store.addPerson(name);
    this.addOpen.set(false);
    this.toast.success('Persona agregada', `${name} fue registrada.`);
  }
}