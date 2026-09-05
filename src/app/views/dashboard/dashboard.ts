import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  protected readonly summaryCards = [
    { label: 'Productos vendidos hoy', value: '42' },
    { label: 'Cantidad total vendida', value: '87' },
    { label: 'Detalles de la última venta', value: '3 productos · $25.99' }
  ];

  protected readonly sales = [
    { id: '#0001', name: 'Playera Básica', price: 12.5, time: '09:15' },
    { id: '#0002', name: 'Taza Cerámica', price: 8.75, time: '09:42' },
    { id: '#0003', name: 'Libreta A5', price: 4.99, time: '10:03' },
    { id: '#0004', name: 'Auriculares BT', price: 35.0, time: '11:27' },
    { id: '#0005', name: 'Botella Térmica', price: 15.5, time: '12:50' },
    { id: '#0006', name: 'Camiseta Deportiva', price: 18.0, time: '13:33' },
    { id: '#0007', name: 'Mochila Urbana', price: 42.75, time: '14:18' }
  ];
}
