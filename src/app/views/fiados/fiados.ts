import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { StoreService } from '../../store.service';
import { ButtonComponent } from '../../ui/button/button';
import { ConfirmModalComponent } from '../../ui/confirm-modal/confirm-modal';
import { InputComponent } from '../../ui/input/input';
import { ModalComponent } from '../../ui/modal/modal';
import { ToastService } from '../../ui/toast/toast.service';
import { AddCreditToGuarantor, CreateGuarantor, GetGuarantors, ReduceCreditToGuarantor } from '../../api/guarantor';
import { GuarantorDTO } from '../../dto/guarantor.dto';
import { LoaderService } from '../../ui/loader/loader.service';
import { getAllAmountAndPaid } from '../../scripts/guarantor';
import { getDate } from '../../scripts/date';

type AdjustAction = 'increment' | 'reduce' | 'pay';

@Component({
  selector: 'app-fiados',
  imports: [ButtonComponent, ConfirmModalComponent, InputComponent, ModalComponent],
  templateUrl: './fiados.html'
})
export class FiadosComponent implements OnInit {
  private readonly store = inject(StoreService);
  private readonly toast = inject(ToastService);
  private readonly loader = inject(LoaderService);

  protected guarantors = signal<GuarantorDTO[]>([])

  protected readonly selectedPerson = signal<GuarantorDTO | null>(null);
  protected readonly detailsOpen = signal(false);
  protected readonly addOpen = signal(false);
  protected readonly newPersonName = signal('');

  protected readonly openAdjust = signal(false);
  protected readonly adjustCredit = signal(0);
  protected readonly pendingAdjust = signal<AdjustAction | null>(null);

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

  protected totalAmount(guarantor: GuarantorDTO): number {
    if (!guarantor.credits) return 0;
    const credit = getAllAmountAndPaid(guarantor.credits)
    return credit.amount - credit.paid
  }

  protected totalPaid(guarantor: GuarantorDTO): number {
    return guarantor.credits ? getAllAmountAndPaid(guarantor.credits).paid : 0;
  }

  protected lastCreditDate(guarantor: GuarantorDTO): string {
    if (!guarantor.credits) return getDate(guarantor.createdAt);

    const lastDate = guarantor.credits[guarantor.credits.length - 1];
    return getDate(lastDate.createdAt);
  }

  protected toggleDetails(person: GuarantorDTO | null) {
    this.selectedPerson.set(person)
    this.detailsOpen.set(person ? true : false)
  }

  protected toggleAddPerson(state: boolean) {
    this.newPersonName.set('');
    this.addOpen.set(state);
  }

  protected toggleAdjustCredit(person: GuarantorDTO | null) {
    if (!person) {
      this.pendingAdjust.set(null);
    }
    this.adjustCredit.set(0);
    this.selectedPerson.set(person)
    this.openAdjust.set(person ? true : false);
  }

  protected onAdjustCredit(value: string) {
    this.adjustCredit.set(Number(value));
  }

  protected requestAdjust(action: AdjustAction): void {
    const person = this.selectedPerson();
    const amount = this.adjustCredit();

    if (action !== 'pay' && amount <= 0) {
      this.toast.error('Cantidad inválida', 'Ingresa una cantidad mayor a cero.');
      return;
    }
    if (!person) return;
    if (action === 'reduce' && amount > this.totalAmount(person)) {
      this.toast.error('Monto excede la deuda', `${person.name} solo debe $${this.totalAmount(person)}.`);
      return;
    }
    if (action === 'pay' && this.totalAmount(person) <= 0) {
      this.toast.info('Sin deuda', `${person.name} no tiene deuda pendiente.`);
      return;
    }

    this.pendingAdjust.set(action);
  }

  protected cancelAdjust(): void {
    this.pendingAdjust.set(null);
  }

  protected async confirmAdjust(): Promise<void> {
    const person = this.selectedPerson();
    const action = this.pendingAdjust();
    if (!person || !action) return;

    this.loader.show('Aplicando cambios a la cuenta');
    let saved = false;
    if (action === 'increment') {
      saved = (await AddCreditToGuarantor(person.id, this.adjustCredit(), this.toast)) === true;
    } else {
      const amount = action === 'pay' ? this.totalAmount(person) : this.adjustCredit();
      saved = (await ReduceCreditToGuarantor(person.id, amount, this.toast)) === true;
    }

    if (saved) {
      const guarantors = await GetGuarantors(this.toast);
      if (guarantors) {
        this.guarantors.set(guarantors);
      }
      this.toast.success(
        action === 'increment' ? 'Deuda incrementada' : action === 'reduce' ? 'Deuda reducida' : 'Deuda pagada',
        `${person.name} fue actualizado.`
      );
      this.toggleAdjustCredit(null);
    }
    this.loader.hide();
  }

  protected adjustConfirmTitle(action: AdjustAction): string {
    switch (action) {
      case 'increment':
        return 'Incrementar deuda';
      case 'reduce':
        return 'Restar deuda';
      case 'pay':
        return 'Pagar deuda';
    }
  }

  protected adjustConfirmMessage(action: AdjustAction): string {
    const person = this.selectedPerson();
    if (!person) return '';
    const amount = action === 'pay' ? this.totalAmount(person) : this.adjustCredit();
    switch (action) {
      case 'increment':
        return `¿Incrementar la deuda de ${person.name} en $${amount}?`;
      case 'reduce':
        return `¿Restar $${amount} de la deuda de ${person.name}?`;
      case 'pay':
        return `¿Registrar el pago total de $${amount} de ${person.name}?`;
    }
  }

  protected onNewPersonNameChange(value: string): void {
    this.newPersonName.set(value);
  }
}