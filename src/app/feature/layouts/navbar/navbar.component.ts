import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';

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
  ) {
    // Set default language
    this.selectedLanguage = this.translate.currentLang || 'fr';
  }

  ngOnInit(): void {
  }

  onLanguageChange(language: string): void {
    this.selectedLanguage = language;
    this.translate.use(language);
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
}
