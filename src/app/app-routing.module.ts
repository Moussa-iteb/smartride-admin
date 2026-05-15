import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { BikesComponent } from './pages/bikes/bikes.component';
import { TripsComponent } from './pages/trips/trips.component';
import { AuthGuard } from './guards/auth.guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { TripDetailComponent } from './pages/trip-detail-component/trip-detail-component.component';
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
   { path: 'home',  component: HomeComponent,  canActivate: [AuthGuard] },
  { path: 'bikes', component: BikesComponent, canActivate: [AuthGuard] },
  { path: 'trips', component: TripsComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'trips/:id', component: TripDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }