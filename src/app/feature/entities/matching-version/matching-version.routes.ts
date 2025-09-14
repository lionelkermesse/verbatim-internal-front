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
        path: ':sessionIdentifier',
        loadComponent: () => import('./dashboard/matching-dashboard/matching-dashboard.component').then(m => m.MatchingDashboardComponent),
        title: 'matching.dashboard.title'
      },
      {
        path: ':sessionIdentifier/:version/edit',
        loadComponent: () => import('./editor/matching-editor/matching-editor.component').then(m => m.MatchingEditorComponent),
        title: 'matching.editor.title'
      },
    ],
  },
];

export default matchingVersionRoute;
