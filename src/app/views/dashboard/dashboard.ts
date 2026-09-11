import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import axios from 'axios';
import { backendRoute } from '../../constants/global';
import { showError } from '../../scripts/error';
import { ToastService } from '../../ui/toast/toast.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  protected readonly toast = inject(ToastService);
  protected salesToday = signal<any[]>([]);

  async ngOnInit() {
    try{
      const res = await axios.get(`${backendRoute}/sale/myshop?today=true`, { withCredentials: true })
      console.log(res.data);
      this.salesToday.set(res.data);
    }catch(e){
      showError(e, this.toast);
    }
  }

  getTotalSaled() {
    let amount = 0;
    this.salesToday().forEach((sale, indx) => {
      amount += sale.total;
    })
    return amount
  }

  getLastSale() {
    if(this.salesToday.length === 0) return `Sin ventas`
    const lastSale = this.salesToday()[this.salesToday().length];
    return `${lastSale.details?.length} productos - ${lastSale.total}`
  }

  protected readonly summaryCards = [
    { label: 'Productos vendidos hoy', value: this.salesToday.length },
    { label: 'Cantidad total vendida', value: this.getTotalSaled() },
    { label: 'Detalles de la última venta', value: this.getLastSale() }
  ];
}
