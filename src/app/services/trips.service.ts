import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TripService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ✅ /api/bike-assignments = vos trips
  getTrips(): Observable<any> {
    return this.http.get(`${this.baseUrl}/bike-assignments`, { headers: this.getHeaders() });
  }

  deleteTrip(id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/bike-assignments/${id}`, { headers: this.getHeaders() });
  }
}