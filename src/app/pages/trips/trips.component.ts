import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TripService } from '../../services/trips.service';
import { Router } from '@angular/router';

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

  showQrModal = false;
  selectedTrip: any = null;
  qrCodeUrl = '';
  qrLoading = false;

  showDetailsModal = false;
  detailsTrip: any = null;
  selectedTripUser: any = null;

  isCancellingTrip = false;
  cancelTripError = '';

  showCreateModal = false;
  isCreating = false;
  createError = '';
  createForm = {
    start_address: '',
    destination_address: '',
    start_point_lat: null as number | null,
    start_point_lng: null as number | null,
    scheduled_at: ''
  };

  private tripsSub?: Subscription;
  private deleteSub?: Subscription;

  constructor(
    private tripService: TripService,
    private router: Router
  ) {}

  ngOnInit() { this.loadTrips(); }

  loadTrips() {
    this.isLoading = true;
    this.error = '';
    this.tripsSub = this.tripService.getTrips().subscribe({
      next: (res: any) => {
        if (Array.isArray(res))           this.trips = res;
        else if (Array.isArray(res.data)) this.trips = res.data;
        else                              this.trips = [];
        this.filteredTrips = [...this.trips];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = this.tripService.handleError(err);
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
        ? t.tripUsers?.some((tu: any) =>
            tu.user?.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            tu.user?.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            tu.bike?.model?.toLowerCase().includes(this.searchTerm.toLowerCase())
          ) || String(t.id).includes(this.searchTerm)
        : true;
      return matchStatus && matchSearch;
    });
  }

  // ─── Create Modal ─────────────────────────────────────────────────────────────

  openCreateModal() {
    this.createForm = {
      start_address: '',
      destination_address: '',
      start_point_lat: null,
      start_point_lng: null,
      scheduled_at: ''
    };
    this.createError = '';
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.createError = '';
  }

  submitCreateTrip() {
    if (!this.createForm.start_address || !this.createForm.destination_address) {
      this.createError = 'Start address and destination are required.';
      return;
    }
    this.isCreating = true;
    this.createError = '';
    const payload = {
      ...this.createForm,
      start_point_lat: this.createForm.start_point_lat ?? 0,
      start_point_lng: this.createForm.start_point_lng ?? 0,
    };
    this.tripService.createTrip(payload).subscribe({
      next: (res: any) => {
        const newTrip = res.data || res;
        this.trips.unshift(newTrip);
        this.filterTrips();
        this.isCreating = false;
        this.showCreateModal = false;
      },
      error: (err: any) => {
        this.createError = this.tripService.handleError(err);
        this.isCreating = false;
      }
    });
  }

  // ─── Trip Details → navigate to page ─────────────────────────────────────────

  openDetails(trip: any) {
    this.router.navigate(['/trips', trip.id]);
  }

  closeDetails() {
    this.showDetailsModal = false;
    this.detailsTrip = null;
    this.selectedTripUser = null;
    this.cancelTripError = '';
  }

  openTripUserDetail(tu: any) {
    this.tripService.getTripById(this.detailsTrip.id).subscribe({
      next: (res: any) => {
        this.detailsTrip = res.data || res;
        const freshTu = this.detailsTrip.tripUsers?.find(
          (u: any) => u.user?.id === tu.user?.id
        );
        this.selectedTripUser = freshTu || tu;
      },
      error: () => {
        this.selectedTripUser = tu;
      }
    });
  }

  closeTripUserDetail() { this.selectedTripUser = null; }

  // ─── Cancel Trip ──────────────────────────────────────────────────────────────

  cancelTrip(trip: any) {
    if (!trip) return;
    this.isCancellingTrip = true;
    this.cancelTripError = '';
    this.tripService.cancelTrip(trip.id).subscribe({
      next: () => {
        const idx = this.trips.findIndex(t => t.id === trip.id);
        if (idx !== -1) this.trips[idx] = { ...this.trips[idx], status: 'cancelled' };
        this.filterTrips();
        if (this.detailsTrip) {
          this.detailsTrip = { ...this.detailsTrip, status: 'cancelled' };
        }
        this.isCancellingTrip = false;
      },
      error: (err: any) => {
        this.cancelTripError = this.tripService.handleError(err);
        this.isCancellingTrip = false;
      }
    });
  }

  // ─── Active Trip Modal ────────────────────────────────────────────────────────

  openActiveTripUserDetail(tu: any) {
    this.tripService.getTripById(this.activeTrip.id).subscribe({
      next: (res: any) => {
        this.detailsTrip = res.data || res;
        const freshTu = this.detailsTrip.tripUsers?.find(
          (u: any) => u.user?.id === tu.user?.id
        );
        this.selectedTripUser = freshTu || tu;
        this.closeActiveModal();
        this.showDetailsModal = true;
      },
      error: () => {
        this.detailsTrip = { ...this.activeTrip };
        this.selectedTripUser = tu;
        this.closeActiveModal();
        this.showDetailsModal = true;
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  getActiveUsers(trip: any): any[] {
    if (!trip?.tripUsers) return [];
    return trip.tripUsers;
  }

  get totalTrips(): number  { return this.trips.length; }
  get activeTrips(): number {
  return this.trips.filter(t => t.status === 'active').length;
}

  get completedTrips(): number {
    return this.trips
      .flatMap(t => t.tripUsers || [])
      .filter((tu: any) => tu.status === 'completed').length;
  }

  get plannedTrips(): number { return this.trips.filter(t => t.status === 'planned').length; }

  get totalUsers(): number {
    const ids = new Set(this.trips.flatMap(t =>
      t.tripUsers?.map((tu: any) => tu.user?.id) || []
    ));
    return ids.size;
  }

  getVisibleUsers(trip: any): any[]     { return (trip.tripUsers || []).slice(0, 3); }
  getExtraUsersCount(trip: any): number { return Math.max(0, (trip.tripUsers?.length || 0) - 3); }

  getAvatarColor(index: number): string {
    return ['av-blue', 'av-green', 'av-orange', 'av-purple', 'av-pink'][index % 5];
  }

  getUserPoints(tu: any): number  { return tu?.trackingPoints?.length || 0; }

  getTotalPoints(trip: any): number {
    if (!trip?.tripUsers?.length) return 0;
    return trip.tripUsers.reduce(
      (sum: number, tu: any) => sum + (tu.trackingPoints?.length || 0), 0
    );
  }

  getDuration(start: string, end: string): string {
    if (!start || !end) return '—';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 0) return '—';
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':    return 'badge-blue';
      case 'completed': return 'badge-green';
      case 'planned':   return 'badge-yellow';
      case 'cancelled': return 'badge-red';
      default:          return 'badge-blue';
    }
  }

  getTripStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'start':     return 'badge-yellow';
      case 'active':    return 'badge-blue';
      case 'completed': return 'badge-green';
      case 'cancelled': return 'badge-red';
      default:          return 'badge-yellow';
    }
  }

  // ─── QR Modal ─────────────────────────────────────────────────────────────────

  async openQrModal(trip: any, event: Event) {
    event.stopPropagation();
    this.selectedTrip = trip;
    this.qrCodeUrl = '';
    this.qrLoading = true;
    this.showQrModal = true;

    if (trip.qr_code || trip.qrCode) {
      this.qrCodeUrl = trip.qr_code || trip.qrCode;
      this.qrLoading = false;
      return;
    }

    try {
      const QRCode = await import('qrcode');
      this.qrCodeUrl = await (QRCode as any).toDataURL(
        JSON.stringify({ type: 'trip', tripId: trip.id }),
        { width: 250, margin: 2, color: { dark: '#1a8a4a', light: '#ffffff' } }
      );
    } catch { this.qrCodeUrl = ''; }
    finally   { this.qrLoading = false; }
  }

  closeQrModal() {
    this.showQrModal = false;
    this.selectedTrip = null;
    this.qrCodeUrl = '';
    this.qrLoading = false;
  }

  downloadQR() {
    if (!this.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = `QR_Trip_${this.selectedTrip?.id}.png`;
    link.click();
  }

  // ─── Delete Modal ─────────────────────────────────────────────────────────────

  confirmDelete(trip: any, event: Event) {
    event.stopPropagation();
    this.tripToDelete = trip;
    this.deleteError = '';
    this.showDeleteModal = true;
  }

  deleteTrip() {
    if (!this.tripToDelete) return;
    this.isDeleting = true;
    this.deleteSub = this.tripService.deleteTrip(this.tripToDelete.id).subscribe({
      next: () => {
        const deletedId = this.tripToDelete.id;
        this.trips = this.trips.filter(t => t.id !== deletedId);
        this.filterTrips();
        this.showDeleteModal = false;
        this.tripToDelete = null;
        this.isDeleting = false;
        this.deleteError = '';
        if (this.detailsTrip?.id === deletedId) this.closeDetails();
      },
      error: (err: any) => {
        this.deleteError = this.tripService.handleError(err);
        this.isDeleting = false;
      }
    });
  }

  // ─── Real-Time Active Trip ────────────────────────────────────────────────────

  showActiveModal = false;
  activeTrip: any = null;
  private activeRefreshInterval: any = null;

  openActiveTrip(trip: any) {
    this.tripService.getTripById(trip.id).subscribe({
      next: (res: any) => {
        this.activeTrip = res.data || res;
        this.showActiveModal = true;
        this.startActiveRefresh(trip.id);
      },
      error: () => {
        this.activeTrip = { ...trip };
        this.showActiveModal = true;
        this.startActiveRefresh(trip.id);
      }
    });
  }

  closeActiveModal() {
    this.showActiveModal = false;
    this.activeTrip = null;
    this.stopActiveRefresh();
  }

  private startActiveRefresh(tripId: number) {
    this.stopActiveRefresh();
    this.activeRefreshInterval = setInterval(() => {
      this.tripService.getTripById(tripId).subscribe({
        next: (res: any) => {
          this.activeTrip = res.data || res;
          if (this.activeTrip.status !== 'active') {
            this.stopActiveRefresh();
            this.loadTrips();
          }
        },
        error: () => this.stopActiveRefresh()
      });
    }, 30000);
  }

  private stopActiveRefresh() {
    if (this.activeRefreshInterval) {
      clearInterval(this.activeRefreshInterval);
      this.activeRefreshInterval = null;
    }
  }

  logout() { this.tripService.logout(); }

  ngOnDestroy() {
    this.tripsSub?.unsubscribe();
    this.deleteSub?.unsubscribe();
    this.stopActiveRefresh();
  }
}