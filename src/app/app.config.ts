import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, TitleStrategy, withComponentInputBinding} from '@angular/router';

import {routes} from './app.routes';
import {en_US, provideNzI18n} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {FormsModule} from '@angular/forms';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import {BrowserModule, Title} from '@angular/platform-browser';
import {TranslationModule} from '@chd-digital-verbatim-front/shared/language/translation.module';
import {httpInterceptorProviders} from '@chd-digital-verbatim-front/core/interceptor';
import {AppPageTitleStrategy} from '../app-page-title-strategy';

registerLocaleData(en);

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
    Title,
    {provide: LOCALE_ID, useValue: 'fr'},
    httpInterceptorProviders,
    {provide: TitleStrategy, useClass: AppPageTitleStrategy},

  ]
};
