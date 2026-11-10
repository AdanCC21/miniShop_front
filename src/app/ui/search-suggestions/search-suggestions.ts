import { NgTemplateOutlet } from '@angular/common';
import { Component, HostListener, input, output, signal, TemplateRef } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-search-suggestions',
  imports: [NgTemplateOutlet, ButtonComponent],
  templateUrl: './search-suggestions.html'
})
export class SearchSuggestionsComponent<T> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly query = input<string>('');
  readonly items = input<T[]>([]);
  readonly emptyMessage = input<string>('');
  readonly itemTemplate = input.required<TemplateRef<{ $implicit: T }>>();

  readonly queryChange = output<string>();
  readonly selected = output<T>();

  protected readonly open = signal(false);

  protected onInput(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
    this.open.set(true);
  }

  protected onFocus(): void {
    this.open.set(true);
  }

  protected select(item: T): void {
    this.selected.emit(item);
    this.open.set(false);
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.open.set(false);
  }
}
