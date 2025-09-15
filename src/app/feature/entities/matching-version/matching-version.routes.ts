import { Routes } from '@angular/router';

const matchingVersionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./matching-version.component').then(m => m.MatchingVersionComponent),
    data: { authorities: [] },
    children: [
      // Session version route
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
      // Upload route
      {
        path: 'upload/:sessionIdentifier',
        loadComponent: () => import('./upload/matching-upload.component').then(m => m.MatchingUploadComponent),
        title: 'matching.upload.title'
      },
      // Matching version editor Read-only route
      {
        path: 'editor/:sessionIdentifier/:version',
        loadComponent: () => import('./editor/matching-editor.component').then(m => m.MatchingEditorComponent),
        title: 'matching.detail.title',
        data: { editMode: false }
      },
      // Matching version editor Edit route
      {
        path: 'editor/:sessionIdentifier/:version/edit',
        loadComponent: () => import('./editor/matching-editor.component').then(m => m.MatchingEditorComponent),
        title: 'matching.edit.title',
        data: { editMode: true }
      },
    ],
  },
];

export default matchingVersionRoute;
