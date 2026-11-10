import axios from 'axios';
import { Router } from '@angular/router';

import { SessionService } from '../auth/session.service';

let registered = false;

export function registerAuthErrorHandler(session: SessionService, router: Router): void {
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
          session.clear();
          router.navigate(['/auth']);
        }
      }
      return Promise.reject(error);
    }
  );
}
