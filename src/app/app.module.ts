import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { BikesComponent } from './pages/bikes/bikes.component';
import { TripsComponent } from './pages/trips/trips.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { TripDetailComponent } from './pages/trip-detail-component/trip-detail-component.component';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    BikesComponent,
    TripsComponent,
    ForgotPasswordComponent,
    TripDetailComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    GoogleMapsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }