import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { BikeService } from '../../services/bikes.service';
import { TripService } from '../../services/trips.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  // ===== STATS =====
  stats = {
    totalUsers: 0,
    activeBikes: 0,
    tripsToday: 0,
    alerts: 0
  };

  // ===== USERS =====
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm = '';
  roleFilter = '';
  isLoading = false;

  // ===== ACTIVITY =====
  recentActivity: any[] = [];

  // ===== MODAL ADD USER =====
  showAddModal  = false;
  showPassword  = false;
  isSubmitting  = false;
  error         = '';
  success       = false;

  form = {
    username:  '',
    email:     '',
    firstName: '',
    lastName:  '',
    password:  '',
    role:      'user'
  };

  // ===== MODAL EDIT USER =====
  showEditModal = false;
  userToEdit: any = null;
  isEditing = false;
  editError = '';

  editForm = {
    username:  '',
    email:     '',
    firstName: '',
    lastName:  '',
    role:      'user'
  };

  // ===== MODAL DELETE =====
  showDeleteModal = false;
  userToDelete: any = null;
  isDeleting = false;
  deleteError = '';

  // ===== MODAL BLOCK =====
  showBlockModal = false;
  userToBlock: any = null;
  isBlocking = false;
  blockError = '';

  // ✅ Subscriptions pour éviter memory leak
  private usersSub?: Subscription;
  private bikesSub?: Subscription;
  private tripsSub?: Subscription;
  private createSub?: Subscription;
  private editSub?: Subscription;
  private deleteSub?: Subscription;
  private blockSub?: Subscription;

  constructor(
    private userService: UserService,
    private bikeService: BikeService,
    private tripService: TripService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadBikes();
    this.loadTrips();
  }

  // ===== LOAD USERS =====
  loadUsers() {
    this.isLoading = true;
    this.usersSub = this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res.data.users || [];
        this.filteredUsers = [...this.users];
        this.stats.totalUsers = res.data.pagination?.total || this.users.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = this.userService.handleError(err); // ✅
        this.isLoading = false;
      }
    });
  }

  // ===== LOAD BIKES =====
  loadBikes() {
    this.bikesSub = this.bikeService.getBikes().subscribe({
      next: (res) => {
        const bikes = Array.isArray(res.data) ? res.data :
                      Array.isArray(res) ? res : [];
        this.stats.activeBikes = bikes.filter((b: any) =>
          b.status === 'Available' || b.status === 'In Use'
        ).length;
        this.stats.alerts = bikes.filter((b: any) =>
          b.status === 'Offline' || b.status?.toLowerCase() === 'maintenance'
        ).length;
      },
      error: (err) => {
        this.error = this.bikeService.handleError(err); // ✅
      }
    });
  }

  // ===== LOAD TRIPS =====
  loadTrips() {
    this.tripsSub = this.tripService.getTrips().subscribe({
      next: (res) => {
        const trips = res.data?.assignments || res.data || [];
        const today = new Date().toDateString();
        this.stats.tripsToday = trips.filter((t: any) =>
          new Date(t.assigned_at || t.createdAt).toDateString() === today
        ).length;
        this.recentActivity = trips.slice(0, 5).map((t: any) => ({
          title: `Bike assigned to user ID ${t.user_id}`,
          time: new Date(t.assigned_at || t.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
          type: t.status === 'returned' ? 'green' : 'blue',
          value: t.status === 'returned' ? 'Returned' : 'Active'
        }));
      },
      error: (err) => {
        this.error = this.userService.handleError(err); // ✅
      }
    });
  }

  // ===== FILTER =====
  filterUsers() {
    this.filteredUsers = this.users.filter(u => {
      const matchRole = this.roleFilter ? u.role === this.roleFilter : true;
      const matchSearch = this.searchTerm
        ? u.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      return matchRole && matchSearch;
    });
  }

  get adminCount() { return this.users.filter(u => u.role === 'admin').length; }
  get userCount()  { return this.users.filter(u => u.role === 'user').length;  }

  // ===== MODAL ADD =====
  openAddModal() { this.resetForm(); this.showAddModal = true; }

  closeAddModal(event?: MouseEvent) {
    if (!event || (event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showAddModal = false;
      this.resetForm();
    }
  }

  resetForm() {
    this.form = { username: '', email: '', firstName: '', lastName: '', password: '', role: 'user' };
    this.error        = '';
    this.success      = false;
    this.showPassword = false;
    this.isSubmitting = false;
  }

  onSubmit() {
    this.error   = '';
    this.success = false;

    if (!this.form.username || !this.form.email || !this.form.password) {
      this.error = 'Please fill in all required fields.';
      return;
    }
    if (this.form.password.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }

    this.isSubmitting = true;
    this.createSub = this.userService.createUser(this.form).subscribe({
      next: () => {
        this.success = true;
        this.isSubmitting = false;
        this.loadUsers();
        setTimeout(() => { this.showAddModal = false; this.resetForm(); }, 1500);
      },
      error: (err) => {
        this.error = this.userService.handleError(err); // ✅
        this.isSubmitting = false;
      }
    });
  }

  // ===== MODAL EDIT =====
  editUser(user: any) {
    this.userToEdit = user;
    this.editForm = {
      username:  user.username  || '',
      email:     user.email     || '',
      firstName: user.firstName || '',
      lastName:  user.lastName  || '',
      role:      user.role      || 'user'
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
    if (!this.userToEdit) return;
    this.editError = '';
    this.isEditing = true;

    this.editSub = this.userService.updateUser(this.userToEdit.id, this.editForm).subscribe({
      next: () => {
        this.isEditing = false;
        this.showEditModal = false;
        this.loadUsers();
      },
      error: (err) => {
        this.editError = this.userService.handleError(err); // ✅
        this.isEditing = false;
      }
    });
  }

  // ===== MODAL DELETE =====
  confirmDelete(user: any) {
    this.userToDelete    = user;
    this.deleteError     = '';
    this.showDeleteModal = true;
  }

  deleteUser() {
    if (!this.userToDelete) return;
    this.isDeleting = true;
    this.deleteSub = this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.userToDelete.id);
        this.filterUsers();
        this.stats.totalUsers = this.users.length;
        this.showDeleteModal = false;
        this.userToDelete = null;
        this.isDeleting = false;
      },
      error: (err) => {
        this.deleteError = this.userService.handleError(err); // ✅
        this.isDeleting = false;
      }
    });
  }

  // ===== MODAL BLOCK =====
  confirmBlock(user: any) {
    this.userToBlock    = user;
    this.blockError     = '';
    this.showBlockModal = true;
  }

  toggleBlock() {
    if (!this.userToBlock) return;
    this.isBlocking = true;
    const newStatus = !this.userToBlock.isBlocked;
    this.blockSub = this.userService.toggleBlockUser(this.userToBlock.id, newStatus).subscribe({
      next: () => {
        this.isBlocking = false;
        this.showBlockModal = false;
        this.loadUsers();
      },
      error: (err) => {
        this.blockError = this.userService.handleError(err); // ✅
        this.isBlocking = false;
      }
    });
  }

  // ===== LOGOUT =====
  logout() { this.userService.logout(); } // ✅

  // ===== CLEANUP =====
  ngOnDestroy(): void {
    this.usersSub?.unsubscribe();
    this.bikesSub?.unsubscribe();
    this.tripsSub?.unsubscribe();
    this.createSub?.unsubscribe();
    this.editSub?.unsubscribe();
    this.deleteSub?.unsubscribe();
    this.blockSub?.unsubscribe();
  }
}