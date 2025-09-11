import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'findLanguageFromKey',
  standalone: true,
})
export default class FindLanguageFromKeyPipe implements PipeTransform {
  private readonly languages: Record<string, { name: string; rtl?: boolean }> = {
    fr: {name: 'Français'},
    en: {name: 'English'},
  };

  transform(lang: string): string {
    return this.languages[lang].name;
  }
}
