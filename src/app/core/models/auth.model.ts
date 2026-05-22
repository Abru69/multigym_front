export interface AuthUser {
  type: 'barber' | 'client';
  id: string;
  email?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
}
