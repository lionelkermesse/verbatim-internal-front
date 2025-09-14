import { Routes } from '@angular/router';

const matchingVersionRoute: Routes = [
  // Dashboard route - shows all versions for a session
  {
    path: 'sessions/:sessionIdentifier/matching/dashboard',
    loadComponent: () => import('./dashboard/matching-dashboard.component').then(m => m.MatchingDashboardComponent),
    title: 'matching.dashboard.title'
  },
  // View route - view specific version (read-only)
  {
    path: 'sessions/:sessionIdentifier/matching/:version',
    loadComponent: () => import('./detail/matching-detail.component').then(m => m.MatchingDetailComponent),
    title: 'matching.detail.title',
    data: { editMode: false }
  },
  // Edit route - edit specific version
  {
    path: 'sessions/:sessionIdentifier/matching/:version/edit',
    loadComponent: () => import('./detail/matching-detail.component').then(m => m.MatchingDetailComponent),
    title: 'matching.detail.edit.title',
    data: { editMode: true }
  },
  // Create new version route
  {
    path: 'sessions/:sessionIdentifier/matching/new',
    loadComponent: () => import('./detail/matching-detail.component').then(m => m.MatchingDetailComponent),
    title: 'matching.detail.new.title',
    data: { editMode: true, isNew: true }
  }
];

export default matchingVersionRoute;
