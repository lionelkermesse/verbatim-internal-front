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
import { IReferentialFile, IReferentialContent } from '@chd-digital-verbatim-front/feature/entities/referential/models/referential.model';

@Injectable()
export class ReferentialApiResponseInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map(event => {
        if (
          event instanceof HttpResponse &&
          this.isReferentialApiResponse(event.body) &&
          request.url.includes('api/v1/referential/files')
        ) {
          // Unwrap the data property and create a new HttpResponse<IReferentialFile | IReferentialFile[] | IReferentialContent>
          return event.clone({ body: event.body.data });
        }
        return event;
      })
    );
  }

  private isReferentialApiResponse(body: any): body is IApiResponse<IReferentialFile> | IApiResponse<IReferentialFile[]> | IApiResponse<IReferentialContent> {
    return body && typeof body === 'object' && 'success' in body && 'data' in body;
  }
}
