import {Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'sessions',
    data: {pageTitle: 'session.title'},
    loadChildren: () => import('@chd-digital-verbatim-front/feature/entities/session/session.routes'),
  },
  {
    path: 'referential',
    data: {pageTitle: 'referential.title'},
    loadChildren: () => import('@chd-digital-verbatim-front/feature/entities/referential/referential.routes'),
  },
  {
    path: 'matching',
    loadChildren: () => import('@chd-digital-verbatim-front/feature/entities/matching-version/matching-version.routes'),
  },
];

export default routes;
