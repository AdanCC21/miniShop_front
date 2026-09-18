import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import axios from 'axios';
import { backendRoute } from '../../constants/global';
import { showError } from '../../scripts/error';
import { ToastService } from '../../ui/toast/toast.service';
import { GetSales } from '../../api/sales';
import { SaleDTO } from '../../dto/sale.dto';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  protected readonly toast = inject(ToastService);
  protected salesToday = signal<SaleDTO[]>([]);

  async ngOnInit() {
    const sales = await GetSales(true, this.toast);
    if (sales) {
      console.log(sales);
      this.salesToday.set(sales);
    }
  }

  getTotalSaled() {
    let amount = 0;
    this.salesToday().forEach((sale, indx) => {
      amount += Number(sale.total);
    })
    return amount
  }

  getTotalQuantity(sale: SaleDTO) {
    if (!sale.details) return 0;
    let amount = 0;
    sale.details.forEach((cur) => {
      amount += cur.quantity;
    })
    return amount;
  }

  getLastSale(): string {
    if (this.salesToday().length === 0) return `Sin ventas`

    const lastSale: SaleDTO = this.salesToday()[this.salesToday().length - 1];
    if (!lastSale.details) return 'No hay detalles de la ultima venta';
    
    return `${lastSale.details?.length} productos - $${lastSale.total}`
  }
}