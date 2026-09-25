import { Component, inject, OnInit, signal } from '@angular/core';
import { StoreService } from '../../store.service';
import { ButtonComponent } from '../../ui/button/button';
import { ConfirmModalComponent } from '../../ui/confirm-modal/confirm-modal';
import { GuarantorCardComponent } from '../../ui/guarantor-card/guarantor-card';
import { InputComponent } from '../../ui/input/input';
import { ModalComponent } from '../../ui/modal/modal';
import { ToastService } from '../../ui/toast/toast.service';
import { CreateGuarantor, GetGuarantors } from '../../api/guarantor';
import { AdjustCredit } from '../../api/credit';
import { GuarantorDTO } from '../../dto/guarantor.dto';
import { LoaderService } from '../../ui/loader/loader.service';
import { getAllAmountAndPaid } from '../../scripts/guarantor';
import { getDate } from '../../scripts/date';
import { CreditDTO } from '../../dto/credit.dto';

type AdjustAction = 'update' | 'pay';

@Component({
  selector: 'app-fiados',
  imports: [ButtonComponent, ConfirmModalComponent, GuarantorCardComponent, InputComponent, ModalComponent],
  templateUrl: './fiados.html'
})
export class FiadosComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly loader = inject(LoaderService);

  protected guarantors = signal<GuarantorDTO[]>([])

  protected readonly selectedPerson = signal<GuarantorDTO | null>(null);
  protected readonly detailsOpen = signal(false);
  protected readonly addOpen = signal(false);
  protected readonly newPersonName = signal('');

  protected readonly selectedCredit = signal<CreditDTO | null>(null);
  protected readonly adjustCredit = signal(0);
  protected readonly pendingAdjust = signal<AdjustAction | null>(null);

  protected readonly getDate = getDate;

  async ngOnInit() {
    this.loadGuarantors();
  }

  async loadGuarantors(showLoader: boolean = true) {
    if (showLoader) this.loader.show("Cargando fiadores");

    const guarantors = await GetGuarantors(this.toast);
    if (!guarantors) return;

    this.guarantors.set(guarantors);
    if (showLoader) this.loader.hide();
  }

  protected guarantorsNotPaid() {
    return this.guarantors().filter(gur => gur.credits && gur.credits.length > 0 && this.totalAmount(gur) > 0) || []
  }

  protected guarantorsPaid() {
    return this.guarantors().filter(gur => !gur.credits || (gur.credits.length > 0 && this.totalAmount(gur) <= 0)) || []
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
      this.loadGuarantors(false);
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

  protected toggleAdjustCredit(credit: CreditDTO | null) {
    if (!credit) {
      this.selectedCredit.set(null);
    } else {
      this.selectedCredit.set(credit);
    }
    this.adjustCredit.set(0);
    this.pendingAdjust.set(null);
  }

  protected onAdjustCredit(value: string) {
    this.adjustCredit.set(Number(value));
  }

  protected requestAdjust(action: AdjustAction): void {
    const person = this.selectedPerson();
    if (!person) return;

    if (action === 'update') {
      const amount = this.adjustCredit();
      if (amount === 0 || Number.isNaN(amount)) {
        this.toast.error('Cantidad inválida', 'Ingresa una cantidad mayor a cero.');
        return;
      }
      if (amount > (Number(this.selectedCredit()?.totalAmount || 0) - Number(this.selectedCredit()?.paidAmount || 0))) {
        this.toast.error('Monto excede la deuda', `${person.name} solo debe $${this.totalAmount(person)}.`);
        return;
      }
    } else if (this.totalAmount(person) <= 0) {
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

    const amount = action === 'pay' ? this.totalAmount(person) : this.adjustCredit();

    this.loader.show('Aplicando cambios a la cuenta');
    await AdjustCredit(amount, this.selectedCredit()!.id, this.toast);

    this.loadGuarantors(false);

    this.toast.success(
      action === 'pay'
        ? 'Deuda pagada'
        : amount < 0
          ? 'Deuda reducida'
          : 'Deuda incrementada',
      `${person.name} fue actualizado.`
    );

    this.toggleAdjustCredit(null);
    this.selectedCredit.set(null);
    this.selectedPerson.set(null);
    this.detailsOpen.set(false);
    this.loader.hide();
  }

  protected adjustConfirmTitle(action: AdjustAction): string {
    switch (action) {
      case 'update':
        return this.adjustCredit() < 0 ? 'Restar deuda' : 'Incrementar deuda';
      case 'pay':
        return 'Pagar deuda';
    }
  }

  protected adjustConfirmMessage(action: AdjustAction): string {
    const person = this.selectedPerson();
    if (!person) return '';
    if (action === 'pay') {
      const amount = this.totalAmount(person);
      return `¿Registrar el pago total de $${amount} de ${person.name}?`;
    }
    const amount = this.adjustCredit();
    return amount < 0
      ? `¿Restar $${Math.abs(amount)} de la deuda de ${person.name}?`
      : `¿Incrementar la deuda de ${person.name} en $${amount}?`;
  }

  protected onNewPersonNameChange(value: string): void {
    this.newPersonName.set(value);
  }
}