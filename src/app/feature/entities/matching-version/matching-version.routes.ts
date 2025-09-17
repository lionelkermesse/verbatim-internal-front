import { Routes } from '@angular/router';

const matchingVersionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./matching-version.component').then(m => m.MatchingVersionComponent),
    data: { authorities: [] },
    children: [
      // Upload route
      {
        path: 'upload/:sessionIdentifier',
        loadComponent: () => import('./upload/matching-upload.component').then(m => m.MatchingUploadComponent),
        title: 'matching.upload.title'
      },
      // Matching version editor routes
      {
        path: ':sessionIdentifier/:version',
        loadComponent: () => import('./editor/matching-editor.component').then(m => m.MatchingEditorComponent),
        title: 'matching.detail.title',
        data: { editMode: false }
      },
      {
        path: ':sessionIdentifier/:version/edit',
        loadComponent: () => import('./editor/matching-editor.component').then(m => m.MatchingEditorComponent),
        title: 'matching.edit.title',
        data: { editMode: true }
      },
    ],
  },
];

export default matchingVersionRoute;
