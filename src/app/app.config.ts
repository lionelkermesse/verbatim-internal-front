import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  inject,
  LOCALE_ID,
  PLATFORM_ID,
  provideZoneChangeDetection
} from '@angular/core';
import {
  NavigationError,
  provideRouter, Router,
  RouterFeatures,
  TitleStrategy,
  withComponentInputBinding,
  withDebugTracing, withNavigationErrorHandler
} from '@angular/router';

import { routes } from './app.routes';
import { en_US, fr_FR, de_DE, NZ_I18N, provideNzI18n } from 'ng-zorro-antd/i18n';
import { isPlatformBrowser, registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import fr from '@angular/common/locales/fr';
import de from '@angular/common/locales/de';
import lu from '@angular/common/locales/lb';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { OAuthModule } from 'angular-oauth2-oidc';
import { httpInterceptorProviders } from '@chd-digital-verbatim-front/core/interceptor';
import { AppPageTitleStrategy } from '../app-page-title-strategy';
import { OidcAuthService } from '@chd-digital-verbatim-front/core/auth/oidc-auth.service';
import { environment } from '../environments/environment';
import { NzConfig, provideNzConfig } from 'ng-zorro-antd/core/config';
import { TranslationModule } from '@chd-digital-verbatim-front/shared/directives/language/translation.module';
import { provideNzIcons } from './icons-provider';
import {
  BrowserStorageService,
  ServerStorageService,
  StorageService
} from '@chd-digital-verbatim-front/shared/services/local-storage';
import {
  NgHttpCachingConfig,
  NgHttpCachingLocalStorage,
  NgHttpCachingModule,
  NgHttpCachingStrategy
} from 'ng-http-caching';


registerLocaleData(en);
registerLocaleData(fr);
registerLocaleData(de);
registerLocaleData(lu);
const routerFeatures: RouterFeatures[] = [
  withComponentInputBinding(),
  withNavigationErrorHandler((e: NavigationError) => {
    const router = inject(Router);
    if (e.error.status === 403) {
      router.navigate(['/accessdenied']);
    } else if (e.error.status === 404) {
      router.navigate(['/404']);
    } else if (e.error.status === 401) {
      router.navigate(['/login']);
    } else {
      router.navigate(['/error']);
    }
  }),
];

if (environment.DEBUG_INFO_ENABLED) {
  routerFeatures.push(withDebugTracing());
}

const ngZorroConfig: NzConfig = {
  message: {nzTop: 64},
  notification: {nzTop: 64},
  theme: {
    primaryColor: '#305a8f',
  },
};

const ngHttpCachingConfig: NgHttpCachingConfig = {
  lifetime: 1000 * 60 * 60, // cache expires after 1 hour,
  cacheStrategy: NgHttpCachingStrategy.DISALLOW_ALL, // TODO: ENABLE When needed
  store: new NgHttpCachingLocalStorage(), // new HttpCacheStorageService(),
};


// Initialize OIDC authentication
export function initializeOidc(oidcAuthService: OidcAuthService): () => Promise<void> {
  return () => oidcAuthService.initializeAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideZoneChangeDetection({eventCoalescing: true}),
    importProvidersFrom(BrowserModule),
    importProvidersFrom(TranslationModule),
    importProvidersFrom(OAuthModule.forRoot()),
    importProvidersFrom(NgHttpCachingModule.forRoot(ngHttpCachingConfig)),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideHttpClient(withInterceptorsFromDi()),
    Title,
    {provide: LOCALE_ID, useValue: 'fr'},
    httpInterceptorProviders,
    {provide: TitleStrategy, useClass: AppPageTitleStrategy},
    {provide: TitleStrategy, useClass: AppPageTitleStrategy},
    {
      provide: StorageService,
      useFactory: (platformId: object) => (isPlatformBrowser(platformId) ? new BrowserStorageService() : new ServerStorageService()),
      deps: [PLATFORM_ID],
    },
    provideNzI18n(fr_FR),
    provideNzIcons(),
    provideNzConfig(ngZorroConfig),
    {
      provide: NZ_I18N,
      useFactory() {
        const localId = inject(LOCALE_ID);
        switch (localId) {
          case 'en':
            return en_US;
          case 'fr':
            return fr_FR;
          case 'de':
            return de_DE;
          case 'lu':
            return fr_FR; // Use French for Luxembourgish as fallback
          default:
            return fr_FR;
        }
      },
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeOidc,
      deps: [OidcAuthService],
      multi: true
    },
  ]
};
