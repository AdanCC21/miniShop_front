import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { GetShops } from '../../api/shop';
import { ToastService } from '../../ui/toast/toast.service';
import { ShopDTO } from '../../dto/shop.dto';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html'
})
export class AdminComponent implements OnInit {
  private readonly router = inject(Router);

  protected readonly tiendas = signal<ShopDTO[]>([]);

  protected readonly activas = computed(() => this.tiendas().filter((t) => t.active).length);

  protected readonly desactivadas = computed(() => this.tiendas().filter((t) => !t.active).length);

  protected readonly toast = inject(ToastService);

  async ngOnInit() {
    this.loadShops();
  }

  protected async loadShops() {
    const data = await GetShops(this.toast);
    this.tiendas.set(data);
    console.log(data);
  }

  // protected encargado(tienda: { members: StoreMember[] }): StoreMember | undefined {
  //   return tienda.members.find((member) => member.role === 'Encargado');
  // }

  protected openDetails(uuid:string): void {
    this.router.navigate(['/admin', uuid]);
  }
}
