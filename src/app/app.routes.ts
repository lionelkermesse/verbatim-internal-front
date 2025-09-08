import { Routes } from '@angular/router';
import { MatchingComponent } from './feature/matching/matching.component';
import { MatchingResultComponent } from './feature/matching/matching-result/matching-result.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: MatchingComponent },
  { path: 'matching/:sessionIdentifier/:version', component: MatchingResultComponent },
];
