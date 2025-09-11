import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection, APP_INITIALIZER} from '@angular/core';
import {provideRouter, TitleStrategy, withComponentInputBinding} from '@angular/router';

import {routes} from './app.routes';
import {en_US, provideNzI18n} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {FormsModule} from '@angular/forms';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import {BrowserModule, Title} from '@angular/platform-browser';
import {OAuthModule} from 'angular-oauth2-oidc';
import {TranslationModule} from '@chd-digital-verbatim-front/shared/language/translation.module';
import {httpInterceptorProviders} from '@chd-digital-verbatim-front/core/interceptor';
import {AppPageTitleStrategy} from '../app-page-title-strategy';
import {OidcAuthService} from '@chd-digital-verbatim-front/core/auth/oidc-auth.service';

registerLocaleData(en);

// Initialize OIDC authentication
export function initializeOidc(oidcAuthService: OidcAuthService): () => Promise<void> {
  return () => oidcAuthService.initializeAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withComponentInputBinding()),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule, BrowserModule),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    importProvidersFrom(TranslationModule),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(OAuthModule.forRoot()),
    Title,
    {provide: LOCALE_ID, useValue: 'fr'},
    httpInterceptorProviders,
    {provide: TitleStrategy, useClass: AppPageTitleStrategy},
    {
      provide: APP_INITIALIZER,
      useFactory: initializeOidc,
      deps: [OidcAuthService],
      multi: true
    },

  ]
};
