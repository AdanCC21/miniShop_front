import { TestBed } from '@angular/core/testing';

import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    service = TestBed.inject(LoaderService);
  });

  it('starts hidden', () => {
    expect(service.visible()).toBe(false);
    expect(service.message()).toBeUndefined();
  });

  it('shows and hides', () => {
    service.show();
    expect(service.visible()).toBe(true);
    service.hide();
    expect(service.visible()).toBe(false);
  });

  it('stores an optional message', () => {
    service.show('Cargando pedidos...');
    expect(service.message()).toBe('Cargando pedidos...');
  });

  it('clears the message when hidden', () => {
    service.show('Cargando...');
    service.hide();
    expect(service.message()).toBeUndefined();
  });
});