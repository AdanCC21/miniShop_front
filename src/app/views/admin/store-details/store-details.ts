import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { findTiendaById, StoreMember } from '../admin.data';
import { ButtonComponent } from '../../../ui/button/button';
import { ConfirmModalComponent } from '../../../ui/confirm-modal/confirm-modal';

@Component({
  selector: 'app-store-details',
  imports: [ButtonComponent, ConfirmModalComponent, RouterLink],
  templateUrl: './store-details.html'
})
export class StoreDetailsComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly tienda = signal(findTiendaById(this.route.snapshot.paramMap.get('id') ?? ''));

  protected readonly removeTarget = signal<StoreMember | null>(null);

  protected readonly encargado = computed<StoreMember | undefined>(() =>
    this.tienda()?.members.find((member) => member.role === 'Encargado')
  );

  protected toggleStatus(): void {
    const tienda = this.tienda();
    if (!tienda) {
      return;
    }
    this.tienda.set({
      ...tienda,
      status: tienda.status === 'Activa' ? 'Desactivada' : 'Activa'
    });
  }

  protected changeRole(member: StoreMember): void {
    const tienda = this.tienda();
    if (!tienda) {
      return;
    }
    this.tienda.set({
      ...tienda,
      members: tienda.members.map((item) =>
        item.id === member.id
          ? { ...item, role: item.role === 'Encargado' ? 'Empleado' : 'Encargado' }
          : item
      )
    });
  }

  protected confirmRemove(member: StoreMember): void {
    this.removeTarget.set(member);
  }

  protected cancelRemove(): void {
    this.removeTarget.set(null);
  }

  protected removeEmployee(): void {
    const member = this.removeTarget();
    const tienda = this.tienda();
    this.removeTarget.set(null);
    if (!tienda || !member) {
      return;
    }
    this.tienda.set({
      ...tienda,
      members: tienda.members.filter((item) => item.id !== member.id)
    });
  }

  protected roleActionLabel(member: StoreMember): string {
    return member.role === 'Encargado' ? 'Cambiar a empleado' : 'Hacer encargado';
  }

  protected initial(name: string): string {
    return name.charAt(0);
  }
}
