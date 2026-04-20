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

  showDeleteModal = false;
  bikeToDelete: any = null;
  isDeleting = false;

  constructor(private router: Router, private bikeService: BikeService) {}

  ngOnInit() { this.loadBikes(); }

  loadBikes() {
    this.isLoading = true;
    this.bikeService.getBikes().subscribe({
      next: (res) => {
        console.log('Bikes response:', res);

        if (Array.isArray(res)) {
          this.bikes = res;
        } else if (Array.isArray(res.data)) {
          this.bikes = res.data;
        } else if (Array.isArray(res.data?.bikes)) {
          this.bikes = res.data.bikes;
        } else if (Array.isArray(res.bikes)) {
          this.bikes = res.bikes;
        } else {
          this.bikes = [];
          console.error('Structure inconnue:', res);
        }

        this.filteredBikes = [...this.bikes];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading bikes:', err);
        this.isLoading = false;
      }
    });
  }

  // ✅ filterBikes() corrigé — matchSearch était manquant
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

  openAddModal() { this.resetForm(); this.showAddModal = true; }

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
    this.error = ''; this.success = false;
    if (!this.form.serialNumber) { this.error = 'Serial Number is required.'; return; }
    if (!this.form.brand)        { this.error = 'Brand is required.'; return; }
    if (!this.form.model)        { this.error = 'Model is required.'; return; }
    this.isSubmitting = true;
    this.bikeService.createBike(this.form).subscribe({
      next: () => {
        this.success = true;
        this.isSubmitting = false;
        this.loadBikes();
        setTimeout(() => { this.showAddModal = false; this.resetForm(); }, 1500);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error creating bike.';
        this.isSubmitting = false;
      }
    });
  }

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
    }
  }

  onEditSubmit() {
    if (!this.bikeToEdit) return;
    this.editError = '';
    this.isEditing = true;
    const bikeId = this.bikeToEdit.id;
    console.log('Editing bike ID:', bikeId);
    this.bikeService.updateBike(bikeId, this.editForm).subscribe({
      next: () => {
        this.isEditing = false;
        this.showEditModal = false;
        this.loadBikes();
      },
      error: (err) => {
        this.editError = err?.error?.message || 'Error updating bike.';
        this.isEditing = false;
      }
    });
  }

  confirmDelete(bike: any) { this.bikeToDelete = bike; this.showDeleteModal = true; }

  deleteBike() {
    if (!this.bikeToDelete) return;
    this.isDeleting = true;
    const bikeId = this.bikeToDelete.id;
    this.bikeService.deleteBike(bikeId).subscribe({
      next: () => {
        this.bikes = this.bikes.filter(b => b.id !== this.bikeToDelete.id);
        this.filterBikes();
        this.showDeleteModal = false;
        this.bikeToDelete = null;
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('Error deleting bike:', err);
        this.isDeleting = false;
      }
    });
  }

  // ✅ getStatusClass() corrigé — insensible à la casse
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

  logout() { localStorage.removeItem('token'); this.router.navigate(['/login']); }
}