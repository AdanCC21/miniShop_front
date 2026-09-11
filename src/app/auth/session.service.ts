import { Injectable } from '@angular/core';

import { SessionProfile, validateSession } from '../api/user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  current(): Promise<SessionProfile | null> {
    return validateSession();
  }
}