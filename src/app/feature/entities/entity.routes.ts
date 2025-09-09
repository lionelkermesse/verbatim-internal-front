import {Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'session',
    data: {pageTitle: 'verbatimMatchingApp.session.home.title'},
    loadChildren: () => import('@chd-digital-verbatim-front/feature/entities/session/session-chd.routes'),
  },
  {
    path: 'matching-version',
    data: {pageTitle: 'verbatimMatchingApp.matchingVersion.home.title'},
    loadChildren: () => import('@chd-digital-verbatim-front/feature/entities/matching-version/matching-version-chd.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
