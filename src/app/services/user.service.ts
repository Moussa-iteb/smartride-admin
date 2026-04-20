import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserService {

  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, { headers: this.getHeaders() });
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data, { headers: this.getHeaders() });
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, data, { headers: this.getHeaders() });
  }

  toggleBlockUser(id: string, blocked: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}/block`, { blocked }, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  // ✅ handleError centralisé ici
  handleError(err: any): string {
    if (err.status === 0)   return 'Cannot reach server. Check your connection.';
    if (err.status === 401) return 'Unauthorized. Please login again.';
    if (err.status === 403) return 'Access denied. Admins only.';
    if (err.status === 404) return 'User not found.';
    if (err.status === 409) return 'Email or username already exists.';
    return err?.error?.message || 'Something went wrong. Please try again.';
  }

  // ✅ logout centralisé ici
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}