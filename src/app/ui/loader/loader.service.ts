import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly visibleSignal = signal(false);
  private readonly messageSignal = signal<string | undefined>(undefined);

  readonly visible = this.visibleSignal.asReadonly();
  readonly message = this.messageSignal.asReadonly();

  show(message?: string): void {
    this.messageSignal.set(message);
    this.visibleSignal.set(true);
  }

  hide(): void {
    this.visibleSignal.set(false);
    this.messageSignal.set(undefined);
  }
}