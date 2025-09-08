import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthExpiredInterceptor } from '@chd-digital-verbatim-front/core/interceptor/auth-expired.interceptor';
import { ErrorHandlerInterceptor } from '@chd-digital-verbatim-front/core/interceptor/error-handler.interceptor';
import { NotificationInterceptor } from '@chd-digital-verbatim-front/core/interceptor/notification.interceptor';

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
  }
];
