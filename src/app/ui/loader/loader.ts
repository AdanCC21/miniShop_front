import { Component, computed, effect, inject, signal } from '@angular/core';

import { LoaderService } from './loader.service';

const FADE_OUT_MS = 200;

@Component({
  selector: 'app-loader',
  templateUrl: './loader.html'
})
export class LoaderComponent {
  private readonly loader = inject(LoaderService);

  protected readonly message = this.loader.message;
  protected readonly leaving = signal(false);

  protected readonly shown = computed(() => this.loader.visible() || this.leaving());

  private fadeOutTimer?: ReturnType<typeof setTimeout>;
  private everShown = false;

  constructor() {
    effect(() => {
      if (this.loader.visible()) {
        this.everShown = true;
        this.leaving.set(false);
        if (this.fadeOutTimer !== undefined) {
          clearTimeout(this.fadeOutTimer);
          this.fadeOutTimer = undefined;
        }
      } else if (this.everShown && !this.leaving()) {
        this.leaving.set(true);
        this.fadeOutTimer = setTimeout(() => this.leaving.set(false), FADE_OUT_MS);
      }
    });
  }
}