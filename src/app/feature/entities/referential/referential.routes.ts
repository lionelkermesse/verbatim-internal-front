import { Routes } from '@angular/router';

const referentialRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./referential.component').then(m => m.ReferentialComponent),
    data: { authorities: [] },
    children: [
      {
        path: '',
        loadComponent: () => import('./list/referential-list.component').then(m => m.ReferentialListComponent),
        title: 'referential.title'
      },
      {
        path: 'upload',
        loadComponent: () => import('./upload/referential-upload.component').then(m => m.ReferentialUploadComponent),
        title: 'referential.upload.title'
      },
    ],
  },
];

export default referentialRoute;
