import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-light">
      <div class="card-body">
        <h5 class="card-title mb-4">📝 Crear Nueva Cuenta</h5>
        
        <form (ngSubmit)="onRegister()" #signupForm="ngForm">
          <div class="mb-3">
            <label class="form-label">Nombre Completo *</label>
            <input 
              type="text" 
              class="form-control"
              [(ngModel)]="fullName"
              name="fullName"
              placeholder="Tu nombre"
              required>
          </div>

          <div class="mb-3">
            <label class="form-label">Email *</label>
            <input 
              type="email" 
              class="form-control"
              [(ngModel)]="email"
              name="email"
              placeholder="tu@email.com"
              required>
          </div>

          <div class="mb-3">
            <label class="form-label">Contraseña *</label>
            <input 
              type="password" 
              class="form-control"
              [(ngModel)]="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              required>
          </div>

          <div class="mb-3">
            <label class="form-label">Confirmar Contraseña *</label>
            <input 
              type="password" 
              class="form-control"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              placeholder="Repite tu contraseña"
              required>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="alert alert-danger mb-3">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="alert alert-success mb-3">
            {{ successMessage }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-100 mb-3"
            [disabled]="!signupForm.valid">
            Registrarse
          </button>

          <p class="text-center text-muted small mb-0">
            ¿Ya tienes cuenta? 
            <button 
              type="button" 
              class="btn btn-link p-0"
              (click)="onGoToLogin()">
              Inicia sesión aquí
            </button>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class SignupComponent {
  @Output() goToLogin = new EventEmitter<void>();

  email = '';
  password = '';
  fullName = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validar campos vacíos
    if (!this.email.trim() || !this.password.trim() || !this.fullName.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = 'Todos los campos son requeridos';
      return;
    }

    // Validar nombre
    if (this.fullName.trim().length < 3) {
      this.errorMessage = 'El nombre debe tener al menos 3 caracteres';
      return;
    }

    // Validar email
    if (!this.isValidEmail(this.email.trim())) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return;
    }

    // Validar contraseña
    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    // Validar coincidencia de contraseñas
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    // Registrar
    const result = this.authService.register(this.email.trim(), this.password, this.fullName.trim());
    
    if (result.success) {
      this.successMessage = '✅ ' + result.message + '. Ahora puedes iniciar sesión.';
      this.resetForm();
      setTimeout(() => this.goToLogin.emit(), 2000);
    } else {
      this.errorMessage = '❌ ' + result.message;
    }
  }

  onGoToLogin(): void {
    this.goToLogin.emit();
  }

  private resetForm(): void {
    this.email = '';
    this.password = '';
    this.fullName = '';
    this.confirmPassword = '';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
