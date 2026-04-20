import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  email = '';
  password = '';
  isLoading = false;
  error = '';

  private loginSub?: Subscription; // ✅ évite memory leak

  constructor(private authService: AuthService) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.loginSub = this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.saveSession(res);
        this.isLoading = false;
        this.authService.navigateHome();
      },
      error: (err) => {
        this.error = this.authService.handleError(err); // ✅
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.loginSub?.unsubscribe(); // ✅ cleanup à la destruction du composant
  }
}