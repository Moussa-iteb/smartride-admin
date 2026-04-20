import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  error = '';

  constructor(private router: Router, private authService: AuthService) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        // ✅ Le token est dans res.data.token selon votre backend
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.error = 'Invalid email or password.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Admins only.';
        } else if (err.status === 0) {
          this.error = 'Cannot reach server. Check your connection.';
        } else {
          this.error = err?.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }
}