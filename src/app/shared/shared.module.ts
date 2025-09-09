import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {TranslateModule} from '@ngx-translate/core';
import {FindLanguageFromKeyPipe, TranslateDirective} from '@chd-digital-verbatim-front/shared/directives/language';


/**
 * Application wide Module
 */
@NgModule({
  imports: [FindLanguageFromKeyPipe, TranslateDirective],
  exports: [
    CommonModule,
    FontAwesomeModule,
    TranslateModule,
    FindLanguageFromKeyPipe,
    TranslateDirective,
  ],
})
export default class SharedModule {
}
