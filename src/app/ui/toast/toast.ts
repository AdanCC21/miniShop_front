import { Component, inject } from '@angular/core';

import { ToastVariant } from './toast.service';
import { ToastService } from './toast.service';
import { ButtonComponent } from '../button/button';

const borderClasses: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50',
  info: 'border-blue-200 bg-blue-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50'
};

const iconClasses: Record<ToastVariant, string> = {
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500'
};

@Component({
  selector: 'app-toast',
  imports: [ButtonComponent],
  templateUrl: './toast.html'
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.list;
  protected readonly borderClasses = borderClasses;
  protected readonly iconClasses = iconClasses;

  protected dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
