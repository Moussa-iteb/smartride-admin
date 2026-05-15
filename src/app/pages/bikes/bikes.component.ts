import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BikeService } from '../../services/bikes.service';

@Component({
  selector: 'app-bikes',
  templateUrl: './bikes.component.html',
  styleUrls: ['./bikes.component.scss']
})
export class BikesComponent implements OnInit {

  bikes: any[] = [];
  filteredBikes: any[] = [];
  searchTerm = '';
  statusFilter = '';
  isLoading = false;

  // ✅ Add Modal
  showAddModal = false;
  isSubmitting = false;
  error = '';
  success = false;

  form = {
    serialNumber: '',
    model: '',
    brand: '',
    status: 'Available',
    batteryLevel: 100,
    notes: ''
  };

  // ✅ Edit Modal
  showEditModal = false;
  bikeToEdit: any = null;
  isEditing = false;
  editError = '';

  editForm = {
    serialNumber: '',
    model: '',
    brand: '',
    status: 'Available',
    batteryLevel: 100,
    notes: ''
  };

  // ✅ Delete Modal
  showDeleteModal = false;
  bikeToDelete: any = null;
  isDeleting = false;
  deleteError = '';

  // ✅ QR Code Modal
  showQrModal = false;
  selectedBike: any = null;
  qrCodeUrl = '';
  qrLoading = false;

  constructor(private router: Router, private bikeService: BikeService) {}

  ngOnInit() { this.loadBikes(); }

  // ══════════════════════════════
  // LOAD BIKES
  // ══════════════════════════════
  loadBikes() {
    this.isLoading = true;
    this.bikeService.getBikes().subscribe({
      next: (res) => {
        if (Array.isArray(res))             this.bikes = res;
        else if (Array.isArray(res.data))   this.bikes = res.data;
        else if (Array.isArray(res.data?.bikes)) this.bikes = res.data.bikes;
        else if (Array.isArray(res.bikes))  this.bikes = res.bikes;
        else                                this.bikes = [];

        this.filteredBikes = [...this.bikes];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = this.bikeService.handleError(err);
        this.isLoading = false;
      }
    });
  }

  // ══════════════════════════════
  // FILTER
  // ══════════════════════════════
  filterBikes() {
    this.filteredBikes = this.bikes.filter(b => {
      const matchStatus = this.statusFilter
        ? b.status?.toLowerCase() === this.statusFilter.toLowerCase()
        : true;
      const matchSearch = this.searchTerm
        ? b.serialNumber?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          b.brand?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          b.model?.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      return matchStatus && matchSearch;
    });
  }

  // ══════════════════════════════
  // ✅ QR CODE MODAL
  // ══════════════════════════════
  async openQrModal(bike: any) {
    this.selectedBike = bike;
    this.qrCodeUrl = '';
    this.qrLoading = true;
    this.showQrModal = true;

    // إذا الـ bike عنده QR من الباكاند
    if (bike.qrCode || bike.qr_code) {
      this.qrCodeUrl = bike.qrCode || bike.qr_code;
      this.qrLoading = false;
      return;
    }

    // نولد QR من الفرونتاند
    try {
      const QRCode = await import('qrcode');
      this.qrCodeUrl = await (QRCode as any).toDataURL(
        JSON.stringify({
          type: 'bike',
          bikeId: bike.id,
          serialNumber: bike.serialNumber,
          brand: bike.brand,
          model: bike.model
        }),
        {
          width: 250,
          margin: 2,
          color: {
            dark: '#1a8a4a',
            light: '#ffffff'
          }
        }
      );
    } catch (err) {
      console.error('QR generation error:', err);
      this.qrCodeUrl = '';
    } finally {
      this.qrLoading = false;
    }
  }

  closeQrModal() {
    this.showQrModal = false;
    this.selectedBike = null;
    this.qrCodeUrl = '';
    this.qrLoading = false;
  }

  downloadQR() {
    if (!this.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = `QR_Bike_${this.selectedBike?.serialNumber || this.selectedBike?.id}.png`;
    link.click();
  }

  // ══════════════════════════════
  // ADD BIKE
  // ══════════════════════════════
  openAddModal() {
    this.resetForm();
    this.showAddModal = true;
  }

  closeAddModal(event?: MouseEvent) {
    if (!event || (event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showAddModal = false;
      this.resetForm();
    }
  }

  resetForm() {
    this.form = {
      serialNumber: '',
      model: '',
      brand: '',
      status: 'Available',
      batteryLevel: 100,
      notes: ''
    };
    this.error = '';
    this.success = false;
    this.isSubmitting = false;
  }

  onSubmit() {
    this.error = '';
    this.success = false;

    if (!this.form.serialNumber) { this.error = 'Serial Number is required.'; return; }
    if (!this.form.brand)        { this.error = 'Brand is required.'; return; }
    if (!this.form.model)        { this.error = 'Model is required.'; return; }

    this.isSubmitting = true;
    this.bikeService.createBike(this.form).subscribe({
      next: () => {
        this.success = true;
        this.isSubmitting = false;
        this.loadBikes();
        setTimeout(() => {
          this.showAddModal = false;
          this.resetForm();
        }, 1500);
      },
      error: (err) => {
        this.error = this.bikeService.handleError(err);
        this.isSubmitting = false;
      }
    });
  }

  // ══════════════════════════════
  // EDIT BIKE
  // ══════════════════════════════
  editBike(bike: any) {
    this.bikeToEdit = bike;
    this.editForm = {
      serialNumber: bike.serialNumber || '',
      model:        bike.model        || '',
      brand:        bike.brand        || '',
      status:       bike.status       || 'Available',
      batteryLevel: bike.batteryLevel ?? 100,
      notes:        bike.notes        || ''
    };
    this.editError = '';
    this.showEditModal = true;
  }

  closeEditModal(event?: MouseEvent) {
    if (!event || (event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showEditModal = false;
      this.bikeToEdit = null;
      this.editError = '';
    }
  }

  onEditSubmit() {
    if (!this.bikeToEdit) return;
    this.editError = '';
    this.isEditing = true;

    this.bikeService.updateBike(this.bikeToEdit.id, this.editForm).subscribe({
      next: () => {
        this.isEditing = false;
        this.showEditModal = false;
        this.bikeToEdit = null;
        this.loadBikes();
      },
      error: (err) => {
        this.editError = this.bikeService.handleError(err);
        this.isEditing = false;
      }
    });
  }

  // ══════════════════════════════
  // DELETE BIKE
  // ══════════════════════════════
  confirmDelete(bike: any) {
    this.bikeToDelete = bike;
    this.deleteError = '';
    this.showDeleteModal = true;
  }

  deleteBike() {
    if (!this.bikeToDelete) return;
    this.isDeleting = true;

    this.bikeService.deleteBike(this.bikeToDelete.id).subscribe({
      next: () => {
        this.bikes = this.bikes.filter(b => b.id !== this.bikeToDelete.id);
        this.filterBikes();
        this.showDeleteModal = false;
        this.bikeToDelete = null;
        this.isDeleting = false;
        this.deleteError = '';
      },
      error: (err) => {
        this.deleteError = this.bikeService.handleError(err);
        this.isDeleting = false;
      }
    });
  }

  // ══════════════════════════════
  // HELPERS
  // ══════════════════════════════
  getStatusClass(status: string) {
    if (!status) return 'badge-blue';
    switch (status.toLowerCase()) {
      case 'available':   return 'badge-green';
      case 'in use':      return 'badge-blue';
      case 'maintenance': return 'badge-orange';
      case 'offline':     return 'badge-red';
      default:            return 'badge-blue';
    }
  }

  logout() { this.bikeService.logout(); }
}