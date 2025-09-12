import {inject} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {EMPTY, Observable, of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

import {IMatchingVersion} from './matching-version-chd.model';
import {MatchingVersionService} from './matching-version.service';

const matchingVersionResolve = (route: ActivatedRouteSnapshot): Observable<null | IMatchingVersion> => {
  const id = route.params['id'];
  if (id) {
    return inject(MatchingVersionService)
      .find(id)
      .pipe(
        mergeMap((matchingVersion: HttpResponse<IMatchingVersion>) => {
          if (matchingVersion.body) {
            return of(matchingVersion.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default matchingVersionResolve;
