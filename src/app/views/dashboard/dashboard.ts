import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ToastService } from '../../ui/toast/toast.service';
import { GetSales } from '../../api/sales';
import { SaleDTO } from '../../dto/sale.dto';
import { ModalComponent } from '../../ui/modal/modal';
import { SaleDetailItem } from './component/sale-detail-item/sale-detail-item';
import { PaymentMethod } from '../../entities/PaymentMethod';
import { comparePaymant, getMethodUsed } from '../../scripts/paymant';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ModalComponent, SaleDetailItem],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  protected readonly toast = inject(ToastService);
  protected salesToday = signal<SaleDTO[]>([]);

  protected saleDetails = signal<SaleDTO | null>(null);

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
      amount += Number(sale.paidCard) + Number(sale.paidCash);
    })
    return amount
  }
  
  getTotalCredit() {
    let amount = 0;
    this.salesToday().forEach((sale) => {
      if(sale.method === PaymentMethod.CREDIT){
        const paid = Number(sale.paidCard) + Number(sale.paidCash)
        amount += sale.total - paid;
        console.log(sale.total - paid);
      }
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

  selectSale(id: string) {
    const sale = this.salesToday().find(sal => sal.id === id) || null;
    console.log(sale);
    this.saleDetails.set(sale);
  }

  unSelectSale() {
    this.saleDetails.set(null);
  }

  getRealWin(sale: SaleDTO) {
    return Number(sale.paidCash) + Number(sale.paidCard);
  }

  getMethodUsed(method: PaymentMethod) {
    return getMethodUsed(method);
  }

  isCash(method: PaymentMethod) {
    return comparePaymant(PaymentMethod.CASH, method);
  }
  
  isCard(method: PaymentMethod) {
    return comparePaymant(PaymentMethod.CARD, method);
  }

  isCredit(method: PaymentMethod) {
    return comparePaymant(PaymentMethod.CREDIT, method);
  }
}