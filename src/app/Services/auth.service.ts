import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { API_URL } from './Api.Service';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  customerStatus?: 'Pending' | 'Approved' | 'Rejected' | string;
  avatarUrl?: string | null;
}

export interface TokenResponse {
  tokenType: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserSession;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  document: string;
  fullName: string;
  age: number;
  email: string;
  phone: string;
  address: string | null;
  password: string;
  confirmPassword: string;
}

export interface CompleteProfileRequest {
  document: string;
  fullName?: string;
  age: number;
  phone: string;
  address?: string | null;
}

export const ADMINISTRATOR_ROLE = 'Administrador';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenKey = 'firmeza_accessToken';
  private readonly refreshTokenKey = 'firmeza_refreshToken';
  private readonly userKey = 'firmeza_user';

  // Reactividad moderna con Angular Signals
  readonly currentUser = signal<UserSession | null>(this.getStoredUser());
  readonly isAuthenticatedSignal = computed(() => !!this.currentUser() && !!this.getToken());

  register(userData: RegisterRequest): Observable<UserSession> {
    return this.http.post<UserSession>(`${API_URL}/auth/register`, userData);
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${API_URL}/auth/login`, credentials);
  }

  loginWithExternal(provider: 'GitHub' = 'GitHub', mode: 'login' | 'register' = 'login'): void {
    const returnUrl = encodeURIComponent(`${window.location.origin}/auth/callback`);
    window.location.href = `${API_URL}/auth/external-login?provider=${provider}&mode=${mode}&returnUrl=${returnUrl}`;
  }

  refresh(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token almacenado.'));
    }

    return this.http.post<TokenResponse>(`${API_URL}/auth/refresh`, { refreshToken });
  }

  me(): Observable<UserSession> {
    return this.http.get<UserSession>(`${API_URL}/auth/me`);
  }

  completeProfile(data: CompleteProfileRequest): Observable<UserSession> {
    return this.http.post<UserSession>(`${API_URL}/auth/complete-profile`, data);
  }

  deleteMyAccount(): Observable<void> {
    return this.http.delete<void>(`${API_URL}/auth/me`);
  }

  saveSession(tokens: TokenResponse): void {
    localStorage.setItem(this.tokenKey, tokens.accessToken);
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(tokens.user));
    this.currentUser.set(tokens.user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getUser(): UserSession | null {
    return this.currentUser();
  }

  isAdministrator(): boolean {
    return !!this.currentUser()?.roles.includes(ADMINISTRATOR_ROLE);
  }

  isCustomerPending(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (this.isAdministrator()) return false;
    return user.customerStatus === 'Pending' || user.customerStatus === 'RequiresProfile';
  }

  requiresProfileCompletion(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (this.isAdministrator()) return false;
    return user.customerStatus === 'RequiresProfile';
  }

  isCustomerApproved(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (this.isAdministrator()) return true;
    return user.customerStatus === 'Approved';
  }

  updateCurrentUser(user: UserSession): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Validación básica de expiración del JWT en cliente
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return false;

      const decodedJson = JSON.parse(atob(payloadBase64));
      if (decodedJson.exp && decodedJson.exp * 1000 < Date.now()) {
        return false;
      }

      return true;
    } catch {
      return true;
    }
  }

  logout(redirectToLogin = true): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('firmeza_product_capacities');
    localStorage.removeItem('firmeza-draft-login');
    localStorage.removeItem('firmeza-draft-register');
    sessionStorage.removeItem('admin_login_alert_shown');
    sessionStorage.removeItem('admin_last_seen_pending_sales');
    this.currentUser.set(null);

    if (redirectToLogin) {
      this.router.navigate(['/login']);
    }
  }

  private getStoredUser(): UserSession | null {
    try {
      const stored = localStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
