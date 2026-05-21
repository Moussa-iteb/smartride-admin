import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService } from '../../services/trips.service';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail-component.component.html',
  styleUrls: ['./trip-detail-component.component.scss']
})
export class TripDetailComponent implements OnInit {
  trip: any = null;
  selectedTripUser: any = null;
  isLoading = false;
  error = '';

  // ─── Map ──────────────────────────────────────────────────────────────────────
  mapCenter: google.maps.LatLngLiteral | null = null;
  mapZoom = 15;
  polylinePath: google.maps.LatLngLiteral[] = [];
  startMarker: google.maps.LatLngLiteral | null = null;
  endMarker: google.maps.LatLngLiteral | null = null;

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 5,
  };

  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#2196F3',
    strokeWeight: 4,
    strokeOpacity: 0.8
  };

  // ✅ CORRIGÉ : new google.maps.Size() ne peut pas être appelé au niveau
  //    de la classe (avant que l'API Maps soit chargée).
  //    On initialise ces options dans ngOnInit() à la place.
  startMarkerOptions: google.maps.MarkerOptions = {};
  endMarkerOptions: google.maps.MarkerOptions = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService
  ) {}

  ngOnInit() {
    // ✅ CORRIGÉ : google.maps.Size est instancié ici, après que
    //    l'API Google Maps est garantie d'être disponible.
    this.startMarkerOptions = {
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new google.maps.Size(40, 40)
      },
      title: 'Start'
    };

    this.endMarkerOptions = {
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(40, 40)
      },
      title: 'End'
    };

    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTrip(Number(id));
  }

  loadTrip(id: number) {
    this.isLoading = true;
    this.tripService.getTripById(id).subscribe({
      next: (res: any) => {
        this.trip = res.data || res;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Trip not found';
        this.isLoading = false;
      }
    });
  }

  openTripUserDetail(tu: any) {
    if (tu.status !== 'completed') return;

    this.tripService.getUserById(tu.user.id).subscribe({
      next: (res: any) => {
        tu.user = res.data || res;
        this.selectedTripUser = tu;
        this.buildMap(tu);
      },
      error: () => {
        this.selectedTripUser = tu;
        this.buildMap(tu);
      }
    });
  }

  buildMap(tu: any) {
    const points: any[] = tu?.trackingPoints || [];

    if (!points.length) {
      this.mapCenter = null;
      this.polylinePath = [];
      this.startMarker = null;
      this.endMarker = null;
      return;
    }

    this.polylinePath = points.map((p: any) => ({
      lat: parseFloat(p.latitude),
      lng: parseFloat(p.longitude)
    }));

    this.startMarker = this.polylinePath[0];
    this.endMarker   = this.polylinePath[this.polylinePath.length - 1];

    const midIndex = Math.floor(this.polylinePath.length / 2);
    this.mapCenter  = this.polylinePath[midIndex];

    const allSame = this.polylinePath.every(
      p => p.lat === this.polylinePath[0].lat && p.lng === this.polylinePath[0].lng
    );
    this.mapZoom = allSame ? 17 : 15;
  }

  closeTripUserDetail() {
    this.selectedTripUser = null;
    this.mapCenter  = null;
    this.polylinePath = [];
    this.startMarker  = null;
    this.endMarker    = null;
  }

  goBack() {
    this.router.navigate(['/trips']);
  }

  getDuration(start: string, end: string): string {
    if (!start || !end) return '—';
    const ms   = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 0) return '—';
    return mins >= 60
      ? `${Math.floor(mins / 60)}h ${mins % 60}m`
      : `${mins}m`;
  }

  getAvatarColor(index: number): string {
    return ['av-blue', 'av-green', 'av-orange', 'av-purple', 'av-pink'][index % 5];
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

  getUserPoints(tu: any): number {
    return tu?.trackingPoints?.length || 0;
  }
}