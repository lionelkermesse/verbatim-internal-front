import {Routes} from '@angular/router';

import {UserRouteAccessService} from '@chd-digital-verbatim-front/core/auth/user-route-access.service';
import {ASC} from '@chd-digital-verbatim-front/config/navigation.constants';

const sessionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./session-chd.component').then(m => m.SessionChdComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default sessionRoute;
