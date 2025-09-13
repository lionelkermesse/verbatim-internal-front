import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthExpiredInterceptor } from '@chd-digital-verbatim-front/core/interceptor/auth-expired.interceptor';
import { ErrorHandlerInterceptor } from '@chd-digital-verbatim-front/core/interceptor/error-handler.interceptor';
import { NotificationInterceptor } from '@chd-digital-verbatim-front/core/interceptor/notification.interceptor';
import {
  SessionApiResponseInterceptor
} from '@chd-digital-verbatim-front/core/interceptor/session-api-response.interceptor';
import {
  MatchingApiResponseInterceptor
} from '@chd-digital-verbatim-front/core/interceptor/matching-api-response.interceptor';
import {
  ReferentialApiResponseInterceptor
} from '@chd-digital-verbatim-front/core/interceptor/referential-api-response.interceptor';

export const httpInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthExpiredInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorHandlerInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: NotificationInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: SessionApiResponseInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: MatchingApiResponseInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ReferentialApiResponseInterceptor,
    multi: true
  }
];
