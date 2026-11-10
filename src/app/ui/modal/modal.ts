import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'| '6xl' | 'wide';

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  wide: 'max-w-[90vw]'
};

@Component({
  selector: 'app-modal',
  imports: [ButtonComponent],
  templateUrl: './modal.html'
})
export class ModalComponent {
  title = input.required<string>();
  size = input<ModalSize>('md');
  readonly close = output<void>();

  protected sizeClass(): string {
    return sizeClasses[this.size()];
  }

  protected onBackdropClick(): void {
    this.close.emit();
  }
}
