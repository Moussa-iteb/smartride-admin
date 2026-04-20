import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  step = 1; // 1 = email, 2 = code + new password

  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';

  isLoading = false;
  error = '';
  success = '';

  constructor(private authService: AuthService, private router: Router) {}

  sendCode() {
    this.error = '';
    if (!this.email) { this.error = 'Please enter your email.'; return; }
    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => { this.isLoading = false; this.step = 2; },
      error: (err: any) => { this.error = err?.error?.message || 'Email not found.'; this.isLoading = false; }
    });
  }

  resetPassword() {
    this.error = '';
    if (!this.code) { this.error = 'Please enter the code.'; return; }
    if (this.newPassword.length < 8) { this.error = 'Password must be at least 8 characters.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
    this.isLoading = true;
    this.authService.resetPassword(this.email, this.code, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = 'Password reset successfully!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => { this.error = err?.error?.message || 'Invalid or expired code.'; this.isLoading = false; }
    });
  }
}