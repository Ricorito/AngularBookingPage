import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./components/bookings/booking-list/booking-list.component').then((m) => m.BookingListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'bookings/new',
    loadComponent: () =>
      import('./components/bookings/booking-form/booking-form.component').then((m) => m.BookingFormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'bookings/edit/:id',
    loadComponent: () =>
      import('./components/bookings/booking-form/booking-form.component').then((m) => m.BookingFormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./components/rooms/room-list/room-list.component').then((m) => m.RoomListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'rooms/new',
    loadComponent: () =>
      import('./components/rooms/room-form/room-form.component').then((m) => m.RoomFormComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'rooms/edit/:id',
    loadComponent: () =>
      import('./components/rooms/room-form/room-form.component').then((m) => m.RoomFormComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'rooms/:id',
    loadComponent: () =>
      import('./components/rooms/room-detail/room-detail.component').then((m) => m.RoomDetailComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'hotels',
    loadComponent: () =>
      import('./components/hotels/hotel-list/hotel-list.component').then((m) => m.HotelListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'hotels/new',
    loadComponent: () =>
      import('./components/hotels/hotel-form/hotel-form.component').then((m) => m.HotelFormComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'hotels/edit/:id',
    loadComponent: () =>
      import('./components/hotels/hotel-form/hotel-form.component').then((m) => m.HotelFormComponent),
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'hotels/:id',
    loadComponent: () =>
      import('./components/hotels/hotel-detail/hotel-detail.component').then((m) => m.HotelDetailComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  { path: '**', redirectTo: '/dashboard' },
];
