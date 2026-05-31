import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = 'https://application-production-4e3f.up.railway.app/api';

  constructor(private http: HttpClient, private router: Router) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  sendNotification(data: { userId?: number; title: string; body: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/notifications/send`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getRecent(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/notifications/recent`,
      { headers: this.getHeaders() }
    );
  }
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}