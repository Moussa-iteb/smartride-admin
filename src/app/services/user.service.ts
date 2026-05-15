import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { catchError } from 'rxjs/operators';
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
  const payload: any = {
    username: data.username,
    email: data.email,
    password: data.password,
    role: data.role || 'user',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    first_name: data.firstName || '',
    last_name: data.lastName || '',
  };

  // ✅ Ajoute ce log pour voir exactement ce qui est envoyé
  console.log('Payload envoyé:', payload);

  return this.http.post(`${this.baseUrl}/auth/register`, payload, {
    headers: this.getHeaders()
  }).pipe(
    // ✅ Log la réponse d'erreur complète
    catchError((err) => {
      console.log('Backend error response:', err.error);
      console.log('Backend errors array:', err.error?.errors); 
      throw err;
    })
  );
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
  if (err.status === 409) return err?.error?.message || 'Email or username already exists.';
  if (err.status === 400) return err?.error?.message || 'Validation failed. Check your inputs.';
  return err?.error?.message || 'Something went wrong. Please try again.';
}

  // ✅ logout centralisé ici
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}