import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user$.pipe(
    filter(user => user !== null), // Espera a que user esté definido
    take(1),
    map(user => {
      console.log('[adminGuard] user:', user);
      if (user?.role === 'admin') {
        return true;
      } else {
        router.navigate(['/home']);
        return false;
      }
    })
  );
};
