import { Routes } from '@angular/router';

const sessionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/session-list.component').then(m => m.SessionListComponent),
    // canActivate: [UserRouteAccessService],
    title: 'session.title'
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/session-detail.component').then(m => m.SessionDetailComponent),
    // canActivate: [UserRouteAccessService],
    data: { authorities: [] },
    title: 'session.detail.title'
  },
];

export default sessionRoute;
