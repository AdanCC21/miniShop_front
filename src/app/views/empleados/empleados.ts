import { Component, inject, OnInit, signal } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button';
import { GetMyShop, HireEmployee, RejectEmployee, RemoveEmployee } from '../../api/shop';
import { ToastService } from '../../ui/toast/toast.service';
import { UserDTO } from '../../dto/user.dto';
import { getDate } from '../../scripts/date';
import { ConfirmModalComponent } from '../../ui/confirm-modal/confirm-modal';


@Component({
  selector: 'app-empleados',
  imports: [ButtonComponent, ConfirmModalComponent],
  templateUrl: './empleados.html'
})
export class EmpleadosComponent implements OnInit {
  protected readonly toast = inject(ToastService);
  protected readonly employees = signal<UserDTO[]>([]);
  protected readonly waiting = signal<UserDTO[]>([]);
  protected readonly loading = signal(true);
  protected readonly removeTarget = signal<UserDTO | null>(null);

  async ngOnInit() {
    await this.loadData();
  }

  protected async loadData() {
    this.loading.set(true);
    const myShop = await GetMyShop(this.toast, true, true);
    if (myShop) {
      this.waiting.set(myShop.waiting ?? []);
      this.employees.set(myShop.employees ?? []);
    }
    this.loading.set(false);
  }

  protected initial(name: string): string {
    return name.charAt(0);
  }

  protected formatDate(date: Date | string): string {
    return getDate(date);
  }

  protected async hireEmployee(userUuid: string) {
    const res = await HireEmployee(userUuid, this.toast);
    if (!res) return;
    this.toast.success('Solicitud aceptada');
    await this.loadData();
  }
  
  protected async rejectEmployee(userUuid: string) {
    const res = await RejectEmployee(userUuid, this.toast);
    if (!res) return;
    this.toast.success('Solicitud rechazada');
    await this.loadData();
  }

  protected confirmRemove(employee: UserDTO): void {
    this.removeTarget.set(employee);
  }

  protected cancelRemove(): void {
    this.removeTarget.set(null);
  }

  protected async removeEmployee(userUuid: string) {
    const res = await RemoveEmployee(userUuid, this.toast);
    if (!res) return;
    this.removeTarget.set(null);
    this.toast.success('Acceso de empleado eliminado');
    await this.loadData();
  }
}
