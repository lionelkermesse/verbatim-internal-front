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
import { ISession } from '@chd-digital-verbatim-front/feature/entities/session/session-chd.model';

@Injectable()
export class SessionApiResponseInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map(event => {
        if (
          event instanceof HttpResponse &&
          this.isSessionApiResponse(event.body) &&
          request.url.includes('api/v1/sessions')
        ) {
          // Unwrap the data property and create a new HttpResponse<ISession | ISession[]>
          return event.clone({ body: event.body.data });
        }
        return event;
      })
    );
  }

  private isSessionApiResponse(body: any): body is IApiResponse<ISession> | IApiResponse<ISession[]> {
    return body && typeof body === 'object' && 'success' in body && 'data' in body;
  }
}

