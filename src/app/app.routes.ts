import { Routes } from '@angular/router';
import { UserRouteAccessService } from './core/auth/user-route-access.service';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/sessions',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./feature/layouts/navbar/navbar.component').then(m => m.NavbarComponent),
    outlet: 'navbar',
  },
  // Authentication routes
  {
    path: 'login',
    loadComponent: () => import('./feature/login/login.component').then(m => m.LoginComponent),
    title: 'login.title'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'callback',
        loadComponent: () => import('./feature/login/auth-callback.component').then(m => m.AuthCallbackComponent),
        title: 'auth.callback.title'
      }
    ]
  },

  // Protected routes
  {
    path: 'sessions',
    // canActivate: [UserRouteAccessService],
    loadComponent: () => import('./feature/entities/session/list/session-chd.component').then(m => m.SessionChdComponent),
    data: { authorities: [] }, // No specific authorities required, just authentication
    title: 'sessions.title'
  },
  {
    path: 'session/:id',
    // canActivate: [UserRouteAccessService],
    loadComponent: () => import('./feature/entities/session/detail/session-detail.component').then(m => m.SessionDetailComponent),
    data: { authorities: [] },
    title: 'sessions.detail.title'
  },

  // Home route (will redirect to sessions for authenticated users)
  {
    path: 'home',
    loadComponent: () => import('./feature/home/home.component').then(m => m.default)
  },

  // Access denied page - temporary simple component
  {
    path: 'accessdenied',
    component: class AccessDeniedComponent {
      constructor() {}
    },
    title: 'error.access-denied.title'
  },

  // Wildcard route - temporary redirect to login
  {
    path: '**',
    redirectTo: '/login'
  }
];
