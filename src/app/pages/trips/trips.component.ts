import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TripService } from '../../services/trips.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})
export class TripsComponent implements OnInit, OnDestroy {

  trips: any[] = [];
  filteredTrips: any[] = [];
  searchTerm = '';
  statusFilter = '';
  isLoading = false;
  error = '';

  showDeleteModal = false;
  tripToDelete: any = null;
  isDeleting = false;
  deleteError = '';

  // ✅ Subscriptions pour éviter memory leak
  private tripsSub?: Subscription;
  private deleteSub?: Subscription;

  constructor(private tripService: TripService) {}  // ✅ Router supprimé

  ngOnInit() { this.loadTrips(); }

  loadTrips() {
    this.isLoading = true;
    this.tripsSub = this.tripService.getTrips().subscribe({
      next: (res) => {
        this.trips = res.data?.assignments || res.data || [];
        this.filteredTrips = [...this.trips];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = this.tripService.handleError(err);  // ✅
        this.isLoading = false;
      }
    });
  }

  filterTrips() {
    this.filteredTrips = this.trips.filter(t => {
      const matchStatus = this.statusFilter
        ? t.status?.toLowerCase() === this.statusFilter.toLowerCase()
        : true;
      const matchSearch = this.searchTerm
        ? t.User?.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          t.Bike?.serialNumber?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          String(t.user_id).includes(this.searchTerm) ||
          String(t.bike_id).includes(this.searchTerm)
        : true;
      return matchStatus && matchSearch;
    });
  }

  getDuration(start: string, end: string): string {
    if (!start || !end) return '—';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.floor(ms / 60000);
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  }

  getStatusClass(status: string) {
    if (!status) return 'badge-blue';
    switch (status.toLowerCase()) {
      case 'active':    return 'badge-blue';
      case 'completed': return 'badge-green';
      case 'returned':  return 'badge-green';
      case 'cancelled': return 'badge-red';
      default:          return 'badge-blue';
    }
  }

  confirmDelete(trip: any) {
    this.tripToDelete = trip;
    this.deleteError = '';
    this.showDeleteModal = true;
  }

  deleteTrip() {
    if (!this.tripToDelete) return;
    this.isDeleting = true;
    this.deleteSub = this.tripService.deleteTrip(this.tripToDelete.id).subscribe({
      next: () => {
        this.trips = this.trips.filter(t => t.id !== this.tripToDelete.id);
        this.filterTrips();
        this.showDeleteModal = false;
        this.tripToDelete = null;
        this.isDeleting = false;
      },
      error: (err) => {
        this.deleteError = this.tripService.handleError(err);  // ✅
        this.isDeleting = false;
      }
    });
  }

  logout() { this.tripService.logout(); }  // ✅

  // ✅ Cleanup à la destruction du composant
  ngOnDestroy(): void {
    this.tripsSub?.unsubscribe();
    this.deleteSub?.unsubscribe();
  }
}