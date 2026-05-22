import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/layout.component';
import { HomeComponent } from './features/appointments/home.component';
import { BookingComponent } from './features/bookings/booking.component';
import { AppointmentsComponent } from './features/appointments/appointments.component';
import { BarberDashboardComponent } from './features/barber/barber-dashboard.component';
import { LoginComponent } from './features/auth/login.component';
import { ClientGuard } from './core/guards/client.guard';
import { BarberGuard } from './core/guards/barber.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      
      // Cliente Routes
      {
        path: 'cliente',
        children: [
          { path: 'booking', component: BookingComponent, canActivate: [ClientGuard] },
          { path: 'appointments', component: AppointmentsComponent, canActivate: [ClientGuard] }
        ]
      },

      // Barbero Routes
      { path: 'barbero', component: BarberDashboardComponent, canActivate: [BarberGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
