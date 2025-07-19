import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./components/auth/signup/signup.component').then(m => m.SignupComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'vehicles', 
    loadComponent: () => import('./components/vehicles/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'vehicles/add', 
    loadComponent: () => import('./components/vehicles/add-vehicle/add-vehicle.component').then(m => m.AddVehicleComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'vehicles/edit/:id', 
    loadComponent: () => import('./components/vehicles/edit-vehicle/edit-vehicle.component').then(m => m.EditVehicleComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'vehicles/my-listings', 
    loadComponent: () => import('./components/vehicles/my-listings/my-listings.component').then(m => m.MyListingsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'vehicles/:id', 
    loadComponent: () => import('./components/vehicles/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'bookings', 
    loadComponent: () => import('./components/bookings/booking-list/booking-list.component').then(m => m.BookingListComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: 'admin/users', 
    loadComponent: () => import('./components/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: 'admin/vehicles', 
    loadComponent: () => import('./components/admin/vehicle-management/vehicle-management.component').then(m => m.VehicleManagementComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  { 
    path: 'admin/bookings', 
    loadComponent: () => import('./components/admin/booking-management/booking-management.component').then(m => m.BookingManagementComponent),
    canActivate: [AuthGuard, AdminGuard]
  }
];