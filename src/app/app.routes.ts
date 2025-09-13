import { Routes } from '@angular/router';

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
    loadChildren: () => import('@chd-digital-verbatim-front/feature/entities/session/session.routes'),
  },
  {
    path: 'matching',
    // canActivate: [UserRouteAccessService],
    loadChildren: () => import('@chd-digital-verbatim-front/feature/entities/matching-version/matching-version.routes'),
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
