import { Component, computed, inject, signal } from '@angular/core';

import { AuthService, PendingEmployee, StoreEmployee } from '../../auth/auth.service';
import { ButtonComponent } from '../../ui/button/button';

@Component({
  selector: 'app-empleados',
  imports: [ButtonComponent],
  templateUrl: './empleados.html'
})
export class EmpleadosComponent {
  private readonly auth = inject(AuthService);

  protected readonly requests = signal<PendingEmployee[]>(this.auth.pendingEmployees());

  protected readonly employees = signal<StoreEmployee[]>(this.auth.storeEmployees());

  protected readonly pendingRequests = computed(() =>
    [...this.requests()].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  );

  protected acceptRequest(request: PendingEmployee): void {
    this.auth.approveEmployee(request.email);
    this.refresh();
  }

  protected rejectRequest(request: PendingEmployee): void {
    this.auth.removeUser(request.email);
    this.refresh();
  }

  protected removeEmployee(employee: StoreEmployee): void {
    this.auth.removeUser(employee.email);
    this.refresh();
  }

  protected initial(name: string): string {
    return name.charAt(0);
  }

  protected formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  private refresh(): void {
    this.requests.set(this.auth.pendingEmployees());
    this.employees.set(this.auth.storeEmployees());
  }
}
