import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzSelectModule,
    NzIconModule,
    TranslateModule,
    NgOptimizedImage
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  selectedLanguage: string;

  constructor(private translate: TranslateService) {
    // Set default language
    this.selectedLanguage = this.translate.currentLang || 'fr';
  }

  ngOnInit(): void {
  }

  onLanguageChange(language: string): void {
    this.selectedLanguage = language;
    this.translate.use(language);
  }
}
