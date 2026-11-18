import { Component, inject, OnInit, signal } from '@angular/core';

import { GetRegisterClosureDetails, GetRegisterClosures } from '../../api/sales';
import { ShopRegisterClosureDTO, ShopRegisterClosureDetailsDTO } from '../../dto/sale.dto';
import { ButtonComponent } from '../../ui/button/button';
import { RegisterClosureDetailsModalComponent } from '../../ui/register-closure-details-modal/register-closure-details-modal';
import { ToastService } from '../../ui/toast/toast.service';

@Component({
  selector: 'app-sales',
  imports: [ButtonComponent, RegisterClosureDetailsModalComponent],
  templateUrl: './sales.html'
})
export class SalesComponent implements OnInit {
  private readonly toast = inject(ToastService);

  protected readonly closures = signal<ShopRegisterClosureDTO[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly loadingDetails = signal<string | null>(null);
  protected readonly selectedClosure = signal<ShopRegisterClosureDetailsDTO | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadClosures();
  }

  protected async loadClosures(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);

    const closures = await GetRegisterClosures(48, this.toast);
    if (closures === null) {
      this.loadError.set(true);
    } else {
      this.closures.set([...closures].sort(
        (a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
      ));
    }
    this.loading.set(false);
  }

  protected async openDetails(closure: ShopRegisterClosureDTO): Promise<void> {
    this.loadingDetails.set(closure.uuid);
    const details = await GetRegisterClosureDetails(closure.uuid, this.toast);
    if (details) {
      this.selectedClosure.set(details);
    }
    this.loadingDetails.set(null);
  }

  protected closeDetails(): void {
    this.selectedClosure.set(null);
  }

  protected formatMoney(value: number): string {
    return Number(value).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  protected formatDate(value: Date | string): string {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

}
