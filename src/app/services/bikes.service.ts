import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BikeService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

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
}