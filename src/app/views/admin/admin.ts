import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { StoreMember, TIENDAS } from './admin.data';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html'
})
export class AdminComponent {
  private readonly router = inject(Router);

  protected readonly tiendas = signal(TIENDAS);

  protected readonly activas = computed(() => this.tiendas().filter((t) => t.status === 'Activa').length);

  protected readonly desactivadas = computed(() => this.tiendas().filter((t) => t.status === 'Desactivada').length);

  protected encargado(tienda: { members: StoreMember[] }): StoreMember | undefined {
    return tienda.members.find((member) => member.role === 'Encargado');
  }

  protected openDetails(tienda: { id: string }): void {
    this.router.navigate(['/admin', tienda.id]);
  }
}
