import { Component, input } from '@angular/core';

@Component({
  selector: 'app-sale-detail-item',
  imports: [],
  templateUrl: './sale-detail-item.html',
})
export class SaleDetailItem {
  title = input.required<string>();
  value = input.required<string>();
}
