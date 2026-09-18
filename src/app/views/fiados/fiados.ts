import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { FiadoPerson, personLastDate, personTotal } from './fiados.data';
import { StoreService } from '../../store.service';
import { formatDate } from '../orders/orders.data';
import { ButtonComponent } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { ModalComponent } from '../../ui/modal/modal';
import { ToastService } from '../../ui/toast/toast.service';
import { CreateGuarantor, GetGuarantors } from '../../api/guarantor';
import { GuarantorDTO } from '../../dto/guarantor';
import { LoaderService } from '../../ui/loader/loader.service';

@Component({
  selector: 'app-fiados',
  imports: [ButtonComponent, InputComponent, ModalComponent],
  templateUrl: './fiados.html'
})
export class FiadosComponent implements OnInit {
  private readonly store = inject(StoreService);
  private readonly toast = inject(ToastService);
  private readonly loader = inject(LoaderService);

  protected guarantors = signal<GuarantorDTO[]>([])
  protected readonly people = computed<FiadoPerson[]>(() =>
    [...this.store.fiados()].sort((a, b) => personLastDate(b).localeCompare(personLastDate(a)))
  );

  protected readonly selectedPerson = signal<FiadoPerson | null>(null);
  protected readonly addOpen = signal(false);
  protected readonly newPersonName = signal('');

  async ngOnInit() {
    this.loader.show("Cargando fiadores");

    const guarantors = await GetGuarantors(this.toast);
    if (!guarantors) return;

    this.guarantors.set(guarantors);
    this.loader.hide();
  }

  async submitGuarantor() {
    if (this.newPersonName().trim() === '') {
      this.toast.error('Nombre vacío', 'Escribe el nombre de la persona.');
      return;
    }

    this.loader.show("Subiendo fiador");
    const result = await CreateGuarantor(this.newPersonName(), this.toast);
    if (result) {
      this.toast.success('Persona agregada', `${name} fue registrada.`);
    };
    
    this.newPersonName.set("");
    this.addOpen.set(false);
    this.loader.hide();
  }

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
}