import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.html'
})
export class InputComponent {
  readonly label = input<string>('');
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string | null>(null);
  readonly id = input<string>('');
  readonly value = input<string | number>('');
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
