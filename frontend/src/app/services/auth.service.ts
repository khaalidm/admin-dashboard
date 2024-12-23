import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // Adjust the URL as needed

  constructor(private http: HttpClient) {}

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  totpSetup(email: string): Observable<{ qrCodeUrl: string }> {
    return this.http.post<{ qrCodeUrl: string }>(`${this.apiUrl}/totp-setup`, { email });
  }

  verifyTotp(data: { email: string, token: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/verify-totp`, data);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }
}

