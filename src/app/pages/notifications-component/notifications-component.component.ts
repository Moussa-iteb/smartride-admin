import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

interface NotifHistory {
  title:  string;
  body:   string;
  target: string;
  userId?: number;
  time:   string;
  recent: boolean;
}

interface NotifSettings {
  newBike:      boolean;
  tripComplete: boolean;
  maintenance:  boolean;
}

interface NotifStats {
  sent:     number;
  openRate: number;
  reached:  number;
  failed:   number;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications-component.component.html',
  styleUrls:  ['./notifications-component.component.scss']
})
export class NotificationsComponent implements OnInit {

  target    = 'all';
  userId?: number;
  title     = '';
  body      = '';
  isLoading = false;
  message   = '';
  success   = false;

  history: NotifHistory[] = [];

  stats: NotifStats = {
    sent:     84,
    openRate: 76,
    reached:  142,
    failed:   3
  };

  settings: NotifSettings = {
    newBike:      true,
    tripComplete: true,
    maintenance:  false
  };

  constructor(private notifService: NotificationService) {}

  ngOnInit(): void {
    this.history = [
      { title: 'Maintenance scheduled', body: 'Station 4 bikes offline', target: 'all', time: '2m ago',  recent: true  },
      { title: 'New route available',   body: 'Central park loop added', target: 'all', time: '1h ago',  recent: false },
      { title: 'Ride complete',         body: 'Trip summary ready',      target: 'user', userId: 1042, time: '3h ago', recent: false }
    ];
  }

  reset(): void {
    this.target    = 'all';
    this.userId    = undefined;
    this.title     = '';
    this.body      = '';
    this.message   = '';
    this.success   = false;
    this.isLoading = false;
  }

  send(): void {
    if (!this.title.trim() || !this.body.trim()) {
      this.message = 'Title and message are required.';
      this.success = false;
      return;
    }
    if (this.target === 'user' && !this.userId) {
      this.message = 'Please enter a user ID.';
      this.success = false;
      return;
    }

    this.isLoading = true;
    this.message   = '';

    const payload: any = { title: this.title, body: this.body };
    if (this.target === 'user' && this.userId) {
      payload.userId = this.userId;
    }

    this.notifService.sendNotification(payload).subscribe({
      next: () => {
        this.history.unshift({
          title:  this.title,
          body:   this.body,
          target: this.target,
          userId: this.userId,
          time:   'just now',
          recent: true
        });
        this.history = this.history.slice(0, 5);
        this.stats.sent++;
        this.message   = 'Notification sent successfully!';
        this.success   = true;
        this.isLoading = false;
        this.title     = '';
        this.body      = '';
      },
      error: (err) => {
        this.message   = 'Error: ' + (err.error?.message || 'Failed to send notification.');
        this.success   = false;
        this.isLoading = false;
      }
    });
  }

  saveSettings(): void {
    // appel API settings si nécessaire
    this.message = 'Settings saved successfully!';
    this.success = true;
    setTimeout(() => this.message = '', 3000);
  }
}