import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  GetShop,
  RemoveShopMember,
  SetShopActive,
  UpdateShopMemberRole,
} from '../../../api/shop';
import { ShopDTO } from '../../../dto/shop.dto';
import { UserDTO } from '../../../dto/user.dto';
import { Role } from '../../../entities/Role';
import { ButtonComponent } from '../../../ui/button/button';
import { ConfirmModalComponent } from '../../../ui/confirm-modal/confirm-modal';
import { ToastService } from '../../../ui/toast/toast.service';

type ShopDetails = { shop: ShopDTO; manager: UserDTO | null; employees: UserDTO[]; waiting: UserDTO[] };
type PendingAction = { type: 'status' } | { type: 'role' | 'remove'; member: UserDTO };

@Component({
  selector: 'app-store-details',
  imports: [ButtonComponent, ConfirmModalComponent, RouterLink],
  templateUrl: './store-details.html',
})
export class StoreDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly shopUuid = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly shop = signal<ShopDetails | null>(null);
  protected readonly pendingAction = signal<PendingAction | null>(null);
  protected readonly members = computed(() => {
    const details = this.shop();
    if (!details) return [];
    const all = details.manager ? [details.manager, ...details.employees] : details.employees;
    return all.filter((member, index) => all.findIndex((item) => item.id === member.id) === index);
  });

  async ngOnInit() {
    await this.loadShopDetails();
  }

  protected async loadShopDetails() {
    const data = await GetShop(this.toast, this.shopUuid);
    this.shop.set(data && !Array.isArray(data) ? data as ShopDetails : null);
  }

  protected openStatusConfirmation() {
    this.pendingAction.set({ type: 'status' });
  }

  protected openRoleConfirmation(member: UserDTO) {
    this.pendingAction.set({ type: 'role', member });
  }

  protected openRemoveConfirmation(member: UserDTO) {
    this.pendingAction.set({ type: 'remove', member });
  }

  protected closeConfirmation() {
    this.pendingAction.set(null);
  }

  protected confirmationTitle(): string {
    const action = this.pendingAction();
    if (action?.type === 'status') return this.shop()?.shop.active ? 'Desactivar tienda' : 'Activar tienda';
    if (action?.type === 'role') return 'Cambiar rol';
    return 'Remover usuario';
  }

  protected confirmationMessage(): string {
    const action = this.pendingAction();
    if (action?.type === 'status') {
      return this.shop()?.shop.active
        ? 'La tienda quedará desactivada y sus datos se conservarán. ¿Deseas continuar?'
        : 'La tienda volverá a quedar activa. ¿Deseas continuar?';
    }
    if (action?.type === 'role') {
      const nextRole = action.member.role === Role.MANAGER ? 'empleado' : 'encargado';
      return `¿Deseas cambiar a ${action.member.name} al rol de ${nextRole}?`;
    }
    return action?.type === 'remove'
      ? `¿Deseas desligar a ${action.member.name} de esta tiendita? Su cuenta quedará en espera.`
      : '';
  }

  protected confirmationText(): string {
    const action = this.pendingAction();
    if (action?.type === 'status') return this.shop()?.shop.active ? 'Desactivar' : 'Activar';
    if (action?.type === 'role') return 'Cambiar rol';
    return 'Remover';
  }

  protected async confirmAction() {
    const action = this.pendingAction();
    const details = this.shop();
    if (!action || !details) return;

    let succeeded = false;
    if (action.type === 'status') {
      succeeded = await SetShopActive(this.shopUuid, !details.shop.active, this.toast);
    } else if (action.type === 'role') {
      const role = action.member.role === Role.MANAGER ? Role.EMPLOYEE : Role.MANAGER;
      succeeded = await UpdateShopMemberRole(this.shopUuid, action.member.id, role, this.toast);
    } else {
      succeeded = await RemoveShopMember(this.shopUuid, action.member.id, this.toast);
    }

    this.pendingAction.set(null);
    if (succeeded) {
      this.toast.success('Los cambios se guardaron correctamente.');
      await this.loadShopDetails();
    }
  }

  protected roleActionLabel(member: UserDTO): string {
    return member.role === Role.MANAGER ? 'Bajar a empleado' : 'Hacer encargado';
  }

  protected isDangerAction(): boolean {
    const action = this.pendingAction();
    return action?.type === 'remove' || (action?.type === 'status' && !!this.shop()?.shop.active);
  }

  protected initial(name: string): string {
    return name.charAt(0);
  }
}
