import { Component, input, output } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.html'
})
export class SelectComponent {
  readonly label = input<string>('');
  readonly value = input<string>('');
  readonly options = input.required<SelectOption[]>();
  readonly autocomplete = input<string | null>(null);
  readonly valueChange = output<string>();

  protected onChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}
