import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SignupComponent } from './signup.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SignupComponent],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center py-5" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow-lg border-0">
              <div class="card-body p-5">
                <div class="text-center mb-5">
                  <h1 class="h2 fw-bold mb-2">✂️ BarberShop Pro</h1>
                  <p class="text-muted" *ngIf="!showSignup">Inicia sesión en tu cuenta</p>
                  <p class="text-muted" *ngIf="showSignup">Crea tu cuenta de cliente</p>
                </div>

                <!-- Login Form -->
                <div *ngIf="!showSignup">
                  <!-- Tabs for User Type -->
                  <div class="btn-group w-100 mb-5" role="group">
                    <input type="radio" class="btn-check" name="userType"
                           [(ngModel)]="selectedType" value="client" id="clientType">
                    <label class="btn btn-outline-primary" for="clientType">
                      👤 Cliente
                    </label>

                    <input type="radio" class="btn-check" name="userType"
                           [(ngModel)]="selectedType" value="barber" id="barberType">
                    <label class="btn btn-outline-primary" for="barberType">
                      ✂️ Barbero
                    </label>
                  </div>

                  <!-- Client Login -->
                  <div *ngIf="selectedType === 'client'">
                    <form (ngSubmit)="loginAsClient()" #clientLoginForm="ngForm">
                      <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input 
                          type="email" 
                          class="form-control"
                          [(ngModel)]="clientEmail"
                          name="clientEmail"
                          placeholder="tu@email.com"
                          required>
                      </div>

                      <div class="mb-3">
                        <label class="form-label">Contraseña</label>
                        <input 
                          type="password" 
                          class="form-control"
                          [(ngModel)]="clientPassword"
                          name="clientPassword"
                          placeholder="Tu contraseña"
                          required>
                      </div>

                      <div *ngIf="errorMessage" class="alert alert-danger mb-3">
                        {{ errorMessage }}
                      </div>

                      <button 
                        type="submit" 
                        class="btn btn-primary w-100 mb-3"
                        [disabled]="!clientLoginForm.valid">
                        Iniciar Sesión como Cliente
                      </button>
                    </form>

                    <p class="text-center text-muted small">
                      ¿No tienes cuenta? 
                      <button class="btn btn-link p-0" (click)="toggleSignup()">
                        Regístrate aquí
                      </button>
                    </p>
                  </div>

                  <!-- Barber Login -->
                  <div *ngIf="selectedType === 'barber'">
                    <div class="card bg-light mb-3">
                      <div class="card-body">
                        <p class="small text-muted mb-0">
                          <strong>Acceso Barbero:</strong> Si eres el propietario de la barbería, usa las credenciales proporcionadas.
                        </p>
                      </div>
                    </div>

                    <form (ngSubmit)="loginAsBarber()" #barberLoginForm="ngForm">
                      <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input 
                          type="email" 
                          class="form-control"
                          [(ngModel)]="barberEmail"
                          name="barberEmail"
                          placeholder="barbero@barbershop.local"
                          required>
                      </div>

                      <div class="mb-3">
                        <label class="form-label">Contraseña</label>
                        <input 
                          type="password" 
                          class="form-control"
                          [(ngModel)]="barberPassword"
                          name="barberPassword"
                          placeholder="Tu contraseña"
                          required>
                      </div>

                      <div *ngIf="errorMessage" class="alert alert-danger mb-3">
                        {{ errorMessage }}
                      </div>

                      <button 
                        type="submit" 
                        class="btn btn-success w-100 mb-3"
                        [disabled]="!barberLoginForm.valid">
                        Iniciar Sesión como Barbero
                      </button>
                    </form>

                    <div class="alert alert-info small">
                      <strong>💡 Tip:</strong> Si no tienes credenciales de barbero, contacta al propietario de la barbería.
                    </div>
                  </div>
                </div>

                <!-- Signup Form -->
                <div *ngIf="showSignup">
                  <app-signup (goToLogin)="toggleSignup()"></app-signup>
                </div>
              </div>
            </div>

            <!-- Back Link -->
            <div class="text-center mt-4">
              <a routerLink="/" class="text-light text-decoration-none">
                ← Volver al Inicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-100 {
      min-height: 100vh;
    }
    .card {
      border-radius: 0.75rem;
      border: 1px solid #E0E0E0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .btn-group {
      gap: 0.5rem;
    }
    .btn-check:checked + .btn-outline-primary {
      background-color: #25D366;
      border-color: #25D366;
      color: white;
      box-shadow: 0 2px 8px rgba(37, 211, 102, 0.2);
    }
    .form-control, .form-select {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border: 1.5px solid #E0E0E0;
    }
    .form-control:focus, .form-select:focus {
      border-color: #25D366;
      box-shadow: 0 0 0 0.2rem rgba(37, 211, 102, 0.15);
    }
    .btn-primary {
      background-color: #25D366;
      border-color: #25D366;
      border-radius: 6px;
    }
    .btn-primary:hover {
      background-color: #1FA857;
      border-color: #1FA857;
    }
    .btn-success {
      background-color: #25D366;
      border-radius: 6px;
    }
    .btn-success:hover {
      background-color: #1FA857;
    }
  `]
})
export class LoginComponent {
  selectedType: 'client' | 'barber' = 'client';
  showSignup = false;

  clientEmail = '';
  clientPassword = '';
  barberEmail = '';
  barberPassword = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Pre-fill barber credentials as hint
    const barberCreds = this.authService.getBarberCredentials();
    this.barberEmail = barberCreds.email;
  }

  loginAsClient(): void {
    this.errorMessage = '';

    if (!this.clientEmail.trim() || !this.clientPassword.trim()) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (!this.isValidEmail(this.clientEmail)) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return;
    }

    const result = this.authService.login(this.clientEmail.trim(), this.clientPassword);
    
    if (result.success) {
      this.router.navigate(['/cliente/booking']);
    } else {
      this.errorMessage = result.message;
    }
  }

  loginAsBarber(): void {
    this.errorMessage = '';

    if (!this.barberEmail.trim() || !this.barberPassword.trim()) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    const result = this.authService.login(this.barberEmail.trim(), this.barberPassword);
    
    if (result.success) {
      this.router.navigate(['/barbero']);
    } else {
      this.errorMessage = result.message;
    }
  }

  toggleSignup(): void {
    this.showSignup = !this.showSignup;
    this.errorMessage = '';
    this.clientEmail = '';
    this.clientPassword = '';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

