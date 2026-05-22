import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUser, AuthState } from '../models/auth.model';

export interface RegisterUser {
  email: string;
  password: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    isLoggedIn: false,
    user: null
  });

  public authState$: Observable<AuthState> = this.authState.asObservable();

  // Almacenar usuarios registrados
  private registeredUsers: Map<string, { password: string; fullName: string; type: string }> = new Map();

  // Usuario barbero especial
  private readonly BARBER_EMAIL = 'barbero@barbershop.local';
  private readonly BARBER_PASSWORD = 'barbero123';

  constructor() {
    this.loadAuthState();
    this.initializeBarber();
  }

  private initializeBarber(): void {
    this.registeredUsers.set(this.BARBER_EMAIL, {
      password: this.BARBER_PASSWORD,
      fullName: 'Barbero',
      type: 'barber'
    });
  }

  private loadAuthState(): void {
    const stored = localStorage.getItem('authState');
    if (stored) {
      try {
        const state = JSON.parse(stored);
        if (state.user && state.isLoggedIn) {
          this.authState.next(state);
        }
      } catch (e) {
        console.error('Error loading auth state:', e);
      }
    }

    // Cargar usuarios registrados
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        this.registeredUsers = new Map(Object.entries(users));
      } catch (e) {
        console.error('Error loading users:', e);
      }
    }
  }

  register(email: string, password: string, fullName: string): { success: boolean; message: string } {
    // Validar email
    if (!this.isValidEmail(email)) {
      return { success: false, message: 'Email inválido' };
    }

    // Validar contraseña
    if (password.length < 6) {
      return { success: false, message: 'La contraseña debe tener mínimo 6 caracteres' };
    }

    // Validar que no exista
    if (this.registeredUsers.has(email)) {
      return { success: false, message: 'El email ya está registrado' };
    }

    // Registrar nuevo usuario
    this.registeredUsers.set(email, {
      password,
      fullName,
      type: 'client'
    });

    // Guardar en localStorage
    this.saveUsersToLocalStorage();

    return { success: true, message: 'Registro exitoso' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const user = this.registeredUsers.get(email);

    if (!user) {
      return { success: false, message: 'Email no registrado' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Login exitoso
    const authUser: AuthUser = {
      type: user.type as 'client' | 'barber',
      id: Date.now().toString(),
      email: email
    };

    const state: AuthState = {
      isLoggedIn: true,
      user: authUser
    };

    localStorage.setItem('authState', JSON.stringify(state));
    this.authState.next(state);

    return { success: true, message: 'Sesión iniciada' };
  }

  logout(): void {
    localStorage.removeItem('authState');
    this.authState.next({
      isLoggedIn: false,
      user: null
    });
  }

  isLoggedIn(): boolean {
    return this.authState.value.isLoggedIn;
  }

  getCurrentUser(): AuthUser | null {
    return this.authState.value.user;
  }

  isBarber(): boolean {
    return this.authState.value.user?.type === 'barber';
  }

  isClient(): boolean {
    return this.authState.value.user?.type === 'client';
  }

  getAuthState(): AuthState {
    return this.authState.value;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private saveUsersToLocalStorage(): void {
    const usersObj = Object.fromEntries(this.registeredUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(usersObj));
  }

  getBarberCredentials(): { email: string; password: string } {
    return {
      email: this.BARBER_EMAIL,
      password: this.BARBER_PASSWORD
    };
  }
}
