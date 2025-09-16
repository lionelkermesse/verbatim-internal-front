import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { StateStorageService } from '@chd-digital-verbatim-front/core/auth/state-storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzSelectModule,
    NzIconModule,
    NzDividerModule,
    TranslateModule,
    NgOptimizedImage
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  selectedLanguage: string;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private stateStorage: StateStorageService,
  ) {
    // Initialize language from stored locale or current translate language, default to 'fr'
    const stored = this.stateStorage.getLocale();
    this.selectedLanguage = stored || this.translate.currentLang || 'fr';
    if (stored && this.translate.currentLang !== stored) {
      this.translate.use(stored);
    }
  }

  ngOnInit(): void {
  }

  onLanguageChange(language: string): void {
    this.selectedLanguage = language;
    this.translate.use(language);
    // Persist selection so TranslationModule can restore it on reload
    this.stateStorage.storeLocale(language);
  }

  getLanguageCode(langCode: string): string {
    const codeMap: { [key: string]: string } = {
      'fr': 'FR',
      'en': 'EN',
      'de': 'DE',
      'lu': 'LU'
    };
    return codeMap[langCode] || langCode.toUpperCase();
  }

  isSessionsActive(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/sessions') || url.startsWith('/matching');
  }

  // Hide navigation menus on login page
  isLoginRoute(): boolean {
    const url = this.router.url || '';
    return url.startsWith('/login');
  }
}
