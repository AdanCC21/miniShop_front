import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { GetUsers, UpdateUserRole, DeleteUser } from '../../../api/user';
import { RemoveShopMember } from '../../../api/shop';
import { UserDTO } from '../../../dto/user.dto';
import { Role } from '../../../entities/Role';
import { getDate } from '../../../scripts/date';
import { ButtonComponent } from '../../../ui/button/button';
import { ConfirmModalComponent } from '../../../ui/confirm-modal/confirm-modal';
import { ToastService } from '../../../ui/toast/toast.service';

type UserAction = 'role' | 'shop' | 'delete';
type PendingAction = { type: UserAction; user: UserDTO };
type RoleFilter = Role | 'ALL';
type UserSort = 'name' | 'role' | 'recent';

@Component({
  selector: 'app-admin-users',
  imports: [ButtonComponent, ConfirmModalComponent],
  templateUrl: './users.html',
})
export class AdminUsersComponent implements OnInit {
  private readonly toast = inject(ToastService);
  protected readonly users = signal<UserDTO[]>([]);
  protected readonly pendingAction = signal<PendingAction | null>(null);
  protected readonly loading = signal(true);
  protected readonly pendingCount = computed(() => this.users().length);
  protected readonly search = signal('');
  protected readonly roleFilter = signal<RoleFilter>('ALL');
  protected readonly sortBy = signal<UserSort>('recent');
  protected readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('es');
    const role = this.roleFilter();
    const users = this.users().filter((user) => {
      const matchesRole = role === 'ALL' || user.role === role;
      const matchesSearch = !query || [user.id, user.name, user.email]
        .some((value) => value.toLocaleLowerCase('es').includes(query));
      return matchesRole && matchesSearch;
    });
    const sortBy = this.sortBy();
    return users.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      if (sortBy === 'role') {
        const roleOrder = this.roleLabel(a.role).localeCompare(this.roleLabel(b.role), 'es', { sensitivity: 'base' });
        return roleOrder || a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  async ngOnInit() {
    await this.loadUsers();
  }

  protected async loadUsers() {
    this.loading.set(true);
    this.users.set(await GetUsers(this.toast));
    this.loading.set(false);
  }

  protected setSearch(value: string) {
    this.search.set(value);
  }

  protected setRoleFilter(value: string) {
    this.roleFilter.set(value === 'ALL' ? 'ALL' : value as Role);
  }

  protected setSortBy(value: string) {
    if (value === 'name' || value === 'role' || value === 'recent') this.sortBy.set(value);
  }

  protected openAction(type: UserAction, user: UserDTO) {
    this.pendingAction.set({ type, user });
  }

  protected closeConfirmation() {
    this.pendingAction.set(null);
  }

  protected nextRole(user: UserDTO): Role {
    switch (user.role) {
      case Role.ADMIN: return Role.MANAGER;
      case Role.MANAGER: return Role.EMPLOYEE;
      case Role.EMPLOYEE: return Role.MANAGER;
      case Role.WAITING: return Role.EMPLOYEE;
    }
  }

  protected roleLabel(role: Role): string {
    return ({
      [Role.ADMIN]: 'Administrador',
      [Role.MANAGER]: 'Encargado',
      [Role.EMPLOYEE]: 'Empleado',
      [Role.WAITING]: 'En espera',
    })[role];
  }

  protected actionTitle(): string {
    const action = this.pendingAction();
    if (action?.type === 'role') return 'Cambiar rol del usuario';
    if (action?.type === 'shop') return 'Remover de la tiendita';
    return 'Eliminar usuario';
  }

  protected actionMessage(): string {
    const action = this.pendingAction();
    if (!action) return '';
    if (action.type === 'role') {
      return `¿Deseas cambiar el rol de ${action.user.name} de ${this.roleLabel(action.user.role)} a ${this.roleLabel(this.nextRole(action.user))}?`;
    }
    if (action.type === 'shop') {
      return `¿Deseas desvincular a ${action.user.name} de su tiendita? Su cuenta se conservará y quedará en espera.`;
    }
    return `¿Deseas eliminar permanentemente la cuenta de ${action.user.name}? Esta acción no se puede deshacer.`;
  }

  protected actionConfirmText(): string {
    const action = this.pendingAction();
    if (action?.type === 'role') return 'Cambiar rol';
    if (action?.type === 'shop') return 'Remover tiendita';
    return 'Eliminar usuario';
  }

  protected isDangerAction(): boolean {
    return this.pendingAction()?.type !== 'role';
  }

  protected async confirmAction() {
    const action = this.pendingAction();
    if (!action) return;
    let succeeded = false;
    if (action.type === 'role') {
      succeeded = await UpdateUserRole(action.user.id, this.nextRole(action.user), this.toast);
    } else if (action.type === 'shop' && action.user.shopUuid) {
      succeeded = await RemoveShopMember(action.user.shopUuid, action.user.id, this.toast);
    } else if (action.type === 'delete') {
      succeeded = await DeleteUser(action.user.id, this.toast);
    }
    this.pendingAction.set(null);
    if (succeeded) {
      this.toast.success('Los cambios se guardaron correctamente.');
      await this.loadUsers();
    }
  }

  protected formatDate(value: Date | string): string {
    return getDate(value);
  }
}
