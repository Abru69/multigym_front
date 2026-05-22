import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar tipo de usuario requerido
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.type !== requiredRole) {
        this.router.navigate(['/']);
        return false;
      }
    }

    return true;
  }
}
