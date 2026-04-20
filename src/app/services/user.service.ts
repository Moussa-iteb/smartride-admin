import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // GET /api/users
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, {
      headers: this.getHeaders()
    });
  }

  // POST /api/auth/register (création via register)
  createUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data, {
      headers: this.getHeaders()
    });
  }

  // PUT /api/users/:id
  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // PATCH /api/users/:id/block
  toggleBlockUser(id: string, blocked: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}/block`, { blocked }, {
      headers: this.getHeaders()
    });
  }

  // DELETE /api/users/:id
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`, {
      headers: this.getHeaders()
    });
  }
}