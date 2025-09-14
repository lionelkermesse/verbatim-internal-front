import { Routes } from '@angular/router';

const matchingVersionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./matching-version.component').then(m => m.MatchingVersionComponent),
    data: { authorities: [] },
    children: [
      // Dashboard route - NEW
      {
        path: 'dashboard/:sessionIdentifier',
        loadComponent: () => import('./dashboard/matching-dashboard.component').then(m => m.MatchingDashboardComponent),
        title: 'matching.dashboard.title'
      },
      // Upload route
      {
        path: 'upload/:sessionIdentifier',
        loadComponent: () => import('./upload/matching-upload.component').then(m => m.MatchingUploadComponent),
        title: 'matching.upload.title'
      },
      // Enhanced editor route - NEW (replaces detail)
      {
        path: 'editor/:sessionIdentifier/:version',
        loadComponent: () => import('./editor/matching-editor.component').then(m => m.MatchingEditorComponent),
        title: 'matching.detail.title',
        data: { editMode: false }
      },
      // Enhanced editor edit route - NEW
      {
        path: 'editor/:sessionIdentifier/:version/edit',
        loadComponent: () => import('./editor/matching-editor.component').then(m => m.MatchingEditorComponent),
        title: 'matching.edit.title',
        data: { editMode: true }
      },
      // Legacy routes (keep for backward compatibility)
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
