import {Routes} from '@angular/router';
import {errorRoute} from '@chd-digital-verbatim-front/feature/layouts/error/error.route';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@chd-digital-verbatim-front/feature/home/home.component'),
    title: 'home.title',
  },
  {
    path: '',
    loadChildren: () => import('@chd-digital-verbatim-front/feature/entities/entity.routes'),
  },
  ...errorRoute,
];
