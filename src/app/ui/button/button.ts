import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'segmented';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-(--primary) text-[var(--primary-foreground)] hover:opacity-90',
  secondary: 'bg-(--secondary) text-[var(--secondary-foreground)] hover:opacity-90',
  outline: 'border border-gray-300 bg-(--card) text-gray-700 hover:bg-gray-100',
  danger: 'bg-(--danger) text-white hover:bg-(--danger-hover)',
  ghost: 'bg-transparent hover:bg-gray-100',
  segmented: ''
};

const disabledClass = 'cursor-not-allowed bg-gray-200 text-gray-400';

@Component({
  selector: 'app-button',
  templateUrl: './button.html'
})
export class ButtonComponent {
  readonly text = input<string>('');
  readonly variant = input<ButtonVariant>('primary');
  readonly disabled = input(false);
  readonly clicked = output<void>();
  readonly extraClass = input<string>('');
  readonly selected = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly ariaLabel = input('');
  readonly ariaExpanded = input<boolean | undefined>(undefined);
  readonly ariaPressed = input<boolean | undefined>(undefined);
  readonly title = input('');

  protected classList(): string {
    const base = `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer ${this.extraClass()}`;
    if (this.disabled()) {
      return `${base} ${disabledClass}`;
    }
    if (this.variant() === 'segmented') {
      const selectedClass = this.selected()
        ? 'bg-(--card) text-black shadow'
        : 'text-gray-500 hover:text-black';
      return `${base} rounded-md px-3 py-2 ${selectedClass}`;
    }
    return `${base} ${variantClasses[this.variant()]}`;
  }
}
