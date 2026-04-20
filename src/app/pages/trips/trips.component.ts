import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TripService } from '../../services/trips.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})
export class TripsComponent implements OnInit {

  trips: any[] = [];
  filteredTrips: any[] = [];
  searchTerm = '';
  statusFilter = '';
  isLoading = false;

  showDeleteModal = false;
  tripToDelete: any = null;
  isDeleting = false;

  constructor(private router: Router, private tripService: TripService) {}

  ngOnInit() { this.loadTrips(); }

  loadTrips() {
  this.isLoading = true;
  this.tripService.getTrips().subscribe({
    next: (res) => {
      console.log('Trips response:', res);
      // ✅ La structure est res.data.assignments
      this.trips = res.data?.assignments || res.data || [];
      this.filteredTrips = [...this.trips];
      this.isLoading = false;
    },
    error: (err) => { console.error('Error:', err); this.isLoading = false; }
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

  // ✅ assigned_at → returned_at pour la durée
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

  confirmDelete(trip: any) { this.tripToDelete = trip; this.showDeleteModal = true; }

  deleteTrip() {
    if (!this.tripToDelete) return;
    this.isDeleting = true;
    this.tripService.deleteTrip(this.tripToDelete.id).subscribe({
      next: () => {
        this.trips = this.trips.filter(t => t.id !== this.tripToDelete.id);
        this.filterTrips();
        this.showDeleteModal = false;
        this.tripToDelete = null;
        this.isDeleting = false;
      },
      error: (err) => { console.error('Error deleting trip:', err); this.isDeleting = false; }
    });
  }

  logout() { localStorage.removeItem('token'); this.router.navigate(['/login']); }
}