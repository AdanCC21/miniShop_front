import axios from 'axios';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

let registered = false;

export function registerAuthErrorHandler(auth: AuthService, router: Router): void {
  if (registered) {
    return;
  }
  registered = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const url = error.config?.url ?? '';
        if (!url.includes('/auth/profile') && !router.url.startsWith('/auth')) {
          auth.logout();
          router.navigate(['/auth']);
        }
      }
      return Promise.reject(error);
    }
  );
}