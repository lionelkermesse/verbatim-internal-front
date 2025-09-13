import { Routes } from '@angular/router';

const matchingVersionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./matching-version.component').then(m => m.MatchingVersionComponent),
    data: { authorities: [] },
    children: [
      {
        path: 'upload/:sessionIdentifier',
        loadComponent: () => import('./upload/matching-upload.component').then(m => m.MatchingUploadComponent),
        title: 'matching.upload.title'
      },
      {
        path: ':sessionIdentifier/:version',
        loadComponent: () => import('./detail/matching-detail.component').then(m => m.MatchingDetailComponent),
        title: 'matching.detail.title'
      },
      {
        path: ':sessionIdentifier/:version/edit',
        loadComponent: () => import('./detail/matching-detail.component').then(m => m.MatchingDetailComponent),
        data: { editMode: true },
        title: 'matching.edit.title'
      },
    ],
  },
];

export default matchingVersionRoute;
