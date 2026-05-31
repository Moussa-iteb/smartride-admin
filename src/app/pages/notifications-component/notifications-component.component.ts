import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

interface NotifHistory {
  title:   string;
  body:    string;
  target:  string;
  userId?: number;
  time:    string;
  recent:  boolean;
}

interface NotifSettings {
  newBike:      boolean;
  tripComplete: boolean;
  maintenance:  boolean;
}

@Component({
  selector:    'app-notifications',
  templateUrl: './notifications-component.component.html',
  styleUrls:   ['./notifications-component.component.scss']
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

  settings: NotifSettings = {
    newBike:      true,
    tripComplete: true,
    maintenance:  false
  };

  constructor(private notifService: NotificationService) {}

  ngOnInit(): void {
    this.loadRecent();
  }

  loadRecent(): void {
    this.notifService.getRecent().subscribe({
      next: (res) => {
        this.history = res.data.map((item: any) => ({
          title:  item.title,
          body:   item.body,
          target: item.target,
          userId: item.userId,
          time:   this.timeAgo(item.createdAt),
          recent: this.isRecent(item.createdAt)
        }));
      },
      error: () => {
        this.history = [];
      }
    });
  }

  private timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  private isRecent(dateStr: string): boolean {
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 10 * 60 * 1000; // moins de 10 minutes
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
  if (this.isLoading) return;  // ✅ empêche double appel

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
      this.message   = 'Notification sent successfully!';
      this.success   = true;
      this.isLoading = false;
      this.title     = '';
      this.body      = '';
      this.loadRecent();
    },
    error: (err) => {
      this.message   = 'Error: ' + (err.error?.message || 'Failed to send notification.');
      this.success   = false;
      this.isLoading = false;
    }
  });
}