import { Routes } from '@angular/router';
import { errorRoute } from '@chd-digital-verbatim-front/feature/layouts/error/error.route';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature/layouts/main/main.component').then(m => m.default),
    children: [
      // Default redirect
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: '',
        loadComponent: () => import('./feature/layouts/navbar/navbar.component'),
        outlet: 'navbar',
      },
      {
        path: '',
        loadComponent: () => import('./feature/layouts/footer/footer.component'),
        outlet: 'footer',
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
        path: '',
        // canActivate: [UserRouteAccessService],
        loadChildren: () => import('@chd-digital-verbatim-front/feature/entities/entity.routes'),
      },
      // Access denied page - temporary simple component
      ...errorRoute,
    ]
  }
];
