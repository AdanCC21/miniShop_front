import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService } from './session.service';
import { LoaderService } from '../ui/loader/loader.service';
import { Role } from '../entities/Role';
import { compareRol } from '../scripts/role';

/** Protects routes using the allowed roles declared in route data. */
export const roleGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const session = inject(SessionService);
  const loader = inject(LoaderService);
  const allowedRoles = route.data['roles'] as Role[] | undefined;

  loader.show('Cargando...');
  try {
    const user = await session.current();
    if (!user) return router.createUrlTree(['/auth']);
    const isWaiting = compareRol(user.role, Role.WAITING);
    if (route.routeConfig?.path === 'esperando' && !isWaiting) {
      return router.createUrlTree(['/dashboard']);
    }
    if (isWaiting && route.routeConfig?.path !== 'esperando') {
      return router.createUrlTree(['/esperando']);
    }
    if (!allowedRoles?.length || allowedRoles.some((role) => compareRol(user.role, role))) {
      return true;
    }
    return router.createUrlTree(['/no-autorizado']);
  } finally {
    loader.hide();
  }
};
