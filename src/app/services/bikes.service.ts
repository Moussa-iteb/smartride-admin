import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class BikeService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getBikes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/bikes`, { headers: this.getHeaders() });
  }

  createBike(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bikes`, data, { headers: this.getHeaders() });
  }

  updateBike(id: any, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/bikes/${id}`, data, { headers: this.getHeaders() });
  }

  deleteBike(id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/bikes/${id}`, { headers: this.getHeaders() });
  }

  // ✅ handleError centralisé ici
  handleError(err: any): string {
    if (err.status === 0)   return 'Cannot reach server. Check your connection.';
    if (err.status === 401) return 'Unauthorized. Please login again.';
    if (err.status === 403) return 'Access denied.';
    if (err.status === 404) return 'Bike not found.';
    if (err.status === 409) return 'Serial number already exists.';
    return err?.error?.message || 'Something went wrong. Please try again.';
  }

  // ✅ logout centralisé ici
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}