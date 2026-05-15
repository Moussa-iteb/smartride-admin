import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TripService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private router: Router) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getTrips(): Observable<any> {
    return this.http.get(`${this.baseUrl}/trips`, { headers: this.getHeaders() });
  }

  getTripById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/trips/${id}`, { headers: this.getHeaders() });
  }

  getTripDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/trips/${id}`, { headers: this.getHeaders() });
  }

  createTrip(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/trips`, data, { headers: this.getHeaders() });
  }

  addUserToTrip(tripId: number, userId: number, bikeId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/trips/${tripId}/users`,
      { user_id: userId, bike_id: bikeId },
      { headers: this.getHeaders() }
    );
  }

  // ✅ fixed: this.baseUrl (not this.apiUrl)
  cancelTrip(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/trips/${id}/cancel`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteTrip(id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/trips/${id}`, { headers: this.getHeaders() });
  }

  getUserTrips(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/trips/user/${userId}`, { headers: this.getHeaders() });
  }

  handleError(err: any): string {
    if (err.status === 0)   return 'Cannot reach server. Check your connection.';
    if (err.status === 401) return 'Unauthorized. Please login again.';
    if (err.status === 403) return 'Access denied.';
    if (err.status === 404) return 'Trip not found.';
    return err?.error?.message || 'Something went wrong. Please try again.';
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
  completeTripUser(tripId: number, userId: number): Observable<any> {
  return this.http.put(
    `${this.baseUrl}/trips/${tripId}/users/${userId}/complete`,
    {},
    { headers: this.getHeaders() }
  );
}
getUserById(id: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/users/${id}`, { headers: this.getHeaders() });
}
}