import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, TitleStrategy, withComponentInputBinding} from '@angular/router';

import {routes} from './app.routes';
import {fr_FR, provideNzI18n} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import fr from '@angular/common/locales/fr';
import {FormsModule} from '@angular/forms';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import {BrowserModule, Title} from '@angular/platform-browser';
import {TranslationModule} from '@chd-digital-verbatim-front/shared/language/translation.module';
import {httpInterceptorProviders} from '@chd-digital-verbatim-front/core/interceptor';
import {AppPageTitleStrategy} from '../app-page-title-strategy';
import {provideAuth} from 'angular-auth-oidc-client';

registerLocaleData(fr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withComponentInputBinding()),
    provideNzI18n(fr_FR),
    importProvidersFrom(FormsModule, BrowserModule),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    importProvidersFrom(TranslationModule),
    provideHttpClient(withInterceptorsFromDi()),
    Title,
    {provide: LOCALE_ID, useValue: 'fr'},
    httpInterceptorProviders,
    {provide: TitleStrategy, useClass: AppPageTitleStrategy},
    // provideNzIcons(),
    provideAuth({
      config: {
        authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0',
        redirectUrl: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        clientId: 'YOUR_CLIENT_ID',
        scope: 'openid profile email offline_access',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
      }
    })

  ]
};
