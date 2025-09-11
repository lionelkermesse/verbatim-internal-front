import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export const translationNotFoundMessage = 'translation-not-found';

export class MissingTranslationHandlerImpl implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    const { key } = params;
    return `${translationNotFoundMessage}[${key}]`;
  }
}

export function translatePartialLoader(http: HttpClient): TranslateLoader {
  const hash = (typeof I18N_HASH !== 'undefined' && I18N_HASH) ? I18N_HASH : '';
  return new TranslateHttpLoader(http, 'assets/i18n/', `.json?_${hash ? '=' + hash : ''}`);
}

export function missingTranslationHandler(): MissingTranslationHandler {
  return new MissingTranslationHandlerImpl();
}
