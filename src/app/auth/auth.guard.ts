import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService } from './session.service';
import { LoaderService } from '../ui/loader/loader.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const session = inject(SessionService);
  const loader = inject(LoaderService);

  loader.show('Cargando...');
  try {
    const user = await session.current();
    return user ? true : router.createUrlTree(['/auth']);
  } finally {
    loader.hide();
  }
};
