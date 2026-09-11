import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const session = inject(SessionService);

  const profile = await session.current();
  if (!profile) {
    auth.logout();
    return router.createUrlTree(['/auth']);
  }

  auth.syncFromBackend(profile);
  return true;
};