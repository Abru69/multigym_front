import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { BarberInfoService } from '../core/services/barber-info.service';
import { AuthState } from '../core/models/auth.model';
import { BarberInfo } from '../core/models/barber-info.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div id="app-root">
      <!-- Navigation -->
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container-xl">
          <a class="navbar-brand" routerLink="/">
            <div *ngIf="barberInfo?.logo" class="logo-container me-2">
              <img [src]="barberInfo?.logo" alt="Logo" class="navbar-logo">
            </div>
            <div *ngIf="!barberInfo?.logo" class="logo-placeholder me-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H5.75A2.75 2.75 0 003 4.25v11.5A2.75 2.75 0 005.75 18.5h8.5A2.75 2.75 0 0017 15.75V4.25A2.75 2.75 0 0014.25 1.5h-3.75m0 0V.75a.75.75 0 00-1.5 0v.75m0 0h1.5m6 3h-11m3 2h-3m3 2h-3m3 2h-3"/>
              </svg>
            </div>
            <span>{{ barberInfo?.name || 'BarberShop Pro' }}</span>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item"><a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio</a></li>
              
              <!-- Cliente Links -->
              <ng-container *ngIf="authState?.user?.type === 'client'">
                <li class="nav-item"><a class="nav-link" routerLink="/cliente/booking" routerLinkActive="active">Reservar</a></li>
                <li class="nav-item"><a class="nav-link" routerLink="/cliente/appointments" routerLinkActive="active">Mis Citas</a></li>
              </ng-container>

              <!-- Barbero Links -->
              <ng-container *ngIf="authState?.user?.type === 'barber'">
                <li class="nav-item"><a class="nav-link" routerLink="/barbero" routerLinkActive="active">🔧 Panel</a></li>
              </ng-container>

              <!-- Auth Links -->
              <ng-container *ngIf="!authState?.isLoggedIn">
                <li class="nav-item"><a class="nav-link btn btn-sm btn-primary text-white ms-2" routerLink="/login">Iniciar Sesión</a></li>
              </ng-container>
              <ng-container *ngIf="authState?.isLoggedIn">
                <li class="nav-item">
                  <button (click)="logout()" class="btn btn-sm btn-danger ms-2">
                    Cerrar Sesión
                  </button>
                </li>
              </ng-container>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="container-xl py-5">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="mt-5">
        <div class="container-xl">
          <div class="row mb-4">
            <div class="col-md-4 col-12 mb-4">
              <h5>Contacto</h5>
              <p>📍 {{ barberInfo?.location || 'Calle Principal 123, Madrid' }}</p>
              <p>📞 {{ barberInfo?.phone || '+34 91 123 4567' }}</p>
              <p>✉️ {{ barberInfo?.email || 'info@barbershop.com' }}</p>
            </div>
            <div class="col-md-4 col-12 mb-4">
              <h5>Horario</h5>
              <p *ngIf="barberInfo?.openingHours?.monday">Lunes - Viernes: {{ barberInfo?.openingHours?.monday?.start }} - {{ barberInfo?.openingHours?.monday?.end }}</p>
              <p *ngIf="barberInfo?.openingHours?.saturday">Sábado: {{ barberInfo?.openingHours?.saturday?.start }} - {{ barberInfo?.openingHours?.saturday?.end }}</p>
              <p>Domingo: Cerrado</p>
            </div>
            <div class="col-md-4 col-12 mb-4">
              <h5>Síguenos</h5>
              <div class="d-flex gap-3">
                <a *ngIf="barberInfo?.socialMedia?.facebook" href="#" class="social-link">Facebook</a>
                <a *ngIf="barberInfo?.socialMedia?.instagram" href="#" class="social-link">Instagram</a>
                <a *ngIf="barberInfo?.socialMedia?.whatsapp" href="#" class="social-link">WhatsApp</a>
              </div>
            </div>
          </div>
          <hr>
          <p class="text-center text-muted mb-0">© 2026 {{ barberInfo?.name || 'BarberShop Pro' }}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    #app-root {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    main {
      flex: 1;
      background-color: #FFFFFF;
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #025E2B !important;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    
    .logo-container {
      display: inline-block;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .navbar-logo {
      max-height: 40px;
      max-width: 40px;
      width: auto;
      height: auto;
      border-radius: 4px;
    }
    
    .logo-placeholder {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo-placeholder svg {
      width: 32px;
      height: 32px;
      color: #25D366;
    }
    
    .nav-link {
      transition: all 0.3s ease;
      color: #3C3C3C !important;
    }
    
    .nav-link:hover {
      color: #25D366 !important;
    }
    
    .nav-link.active {
      color: #25D366 !important;
      font-weight: 600;
    }
    
    footer {
      margin-top: auto;
    }

    .social-link {
      color: #E0E0E0;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      color: #FFFFFF;
      text-decoration: underline;
    }
  `]
})
export class LayoutComponent implements OnInit {
  authState: AuthState | null = null;
  barberInfo: BarberInfo | null = null;

  constructor(
    private authService: AuthService,
    private barberInfoService: BarberInfoService
  ) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe(state => {
      this.authState = state;
    });

    this.barberInfoService.barberInfo$.subscribe(info => {
      this.barberInfo = info;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
