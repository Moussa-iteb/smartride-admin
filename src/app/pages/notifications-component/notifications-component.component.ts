import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent {
  target   = 'all';
  userId?: number;
  title    = '';
  body     = '';
  isLoading = false;
  message  = '';
  success  = false;

  constructor(private notifService: NotificationService) {}

  send() {
    if (!this.title || !this.body) {
      this.message = 'Title and message are required';
      this.success = false;
      return;
    }

    this.isLoading = true;
    this.message = '';

    const payload: any = { title: this.title, body: this.body };
    if (this.target === 'user' && this.userId) {
      payload.userId = this.userId;
    }

    this.notifService.sendNotification(payload).subscribe({
      next: () => {
        this.message = '✅ Notification sent successfully!';
        this.success = true;
        this.isLoading = false;
        this.title = '';
        this.body = '';
      },
      error: (err) => {
        this.message = '❌ Error: ' + (err.error?.message || 'Failed to send');
        this.success = false;
        this.isLoading = false;
      }
    });
  }
}