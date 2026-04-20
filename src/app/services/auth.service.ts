import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password });
  }

  // ✅ localStorage centralisé ici
  saveSession(res: any): void {
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  }

  navigateHome(): void {
    this.router.navigate(['/home']);
  }

  // ✅ handleError centralisé ici
  handleError(err: any): string {
    if (err.status === 0)   return 'Cannot reach server. Check your connection.';
    if (err.status === 401) return 'Invalid email or password.';
    if (err.status === 403) return 'Access denied. Admins only.';
    return err?.error?.message || 'Login failed. Please try again.';
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, { email, code, newPassword });
  }
}