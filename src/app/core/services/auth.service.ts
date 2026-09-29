import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  isActive: boolean;
}

interface LoginResponse {
  message: string;
  user: AuthUser;
  token: string;
}

interface MeResponse {
  user: {
    userId: string;
    email: string;
  };
}

interface JwtPayload {
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly token = signal<string | null>(null);
  readonly currentUser = signal<AuthUser | null>(null);

  constructor() {
    this.restoreSession();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
    }).pipe(
      tap((response) => {
        this.token.set(response.token);
        this.currentUser.set(response.user);

        localStorage.setItem('finanzas_token', response.token);
        localStorage.setItem('finanzas_user', JSON.stringify(response.user));
      }),
    );
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/auth/me`);
  }

  isAuthenticated(): boolean {
    const token = this.token();

    if (!token || this.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return this.token();
  }

  logout(): void {
    this.clearSession();
  }

  private restoreSession(): void {
    const token = localStorage.getItem('finanzas_token');
    const storedUser = localStorage.getItem('finanzas_user');

    if (!token || this.isTokenExpired(token)) {
      this.clearSession();
      return;
    }

    this.token.set(token);

    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser) as AuthUser);
      } catch {
        this.clearSession();
      }
    }
  }

  private clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);

    localStorage.removeItem('finanzas_token');
    localStorage.removeItem('finanzas_user');
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];

      if (!payloadBase64) {
        return true;
      }

      const payload = JSON.parse(atob(payloadBase64)) as JwtPayload;

      if (!payload.exp) {
        return true;
      }

      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}