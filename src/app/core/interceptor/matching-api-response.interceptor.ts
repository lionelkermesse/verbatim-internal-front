import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IApiResponse } from '@chd-digital-verbatim-front/core/models';
import {
  IMatchingVersion
} from '@chd-digital-verbatim-front/feature/entities/matching-version/matching-version-chd.model';

@Injectable()
export class MatchingApiResponseInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map(event => {
        if (
          event instanceof HttpResponse &&
          this.isMatchingApiResponse(event.body) &&
          request.url.includes('api/v1/matching')
        ) {
          // Unwrap the data property and create a new HttpResponse<IMatchingVersion | IMatchingVersion[]>
          return event.clone({ body: event.body.data });
        }
        return event;
      })
    );
  }

  private isMatchingApiResponse(body: any): body is IApiResponse<IMatchingVersion> | IApiResponse<IMatchingVersion[]> {
    return body && typeof body === 'object' && 'success' in body && 'data' in body;
  }
}

