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
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { NotificationsComponentComponent } from './pages/notifications-component/notifications-component.component';


// ✅ NOTE : importez Firebase ICI après avoir exécuté :
//    npm uninstall @angular/fire
//    npm install @angular/fire@7.6.1 firebase@9.23.0
//
// Puis décommentez ces lignes :
// import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
// import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    BikesComponent,
    TripsComponent,
    ForgotPasswordComponent,
    TripDetailComponent,
    NotificationsComponentComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    GoogleMapsModule,
  ],
  providers: [
    // Décommentez après réinstallation de @angular/fire@7.6.1 :
    // provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    // provideAnalytics(() => getAnalytics()),
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }