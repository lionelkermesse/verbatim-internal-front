import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TranslateModule } from '@ngx-translate/core';

import { OidcAuthService } from '@chd-digital-verbatim-front/core/auth/oidc-auth.service';

@Component({
  selector: 'chd-auth-callback',
  standalone: true,
  imports: [
    CommonModule,
    NzSpinModule,
    NzResultModule,
    NzButtonModule,
    TranslateModule,
  ],
  template: `
    <div class="auth-callback-container">
      <!-- Loading State -->
      <div *ngIf="!isProcessingComplete" class="callback-loading">
        <nz-spin nzSize="large" [nzTip]="'auth.callback.processing' | translate">
        </nz-spin>
      </div>

      <!-- Error State -->
      <div *ngIf="isProcessingComplete && hasError" class="callback-error">
        <nz-result
          nzStatus="error"
          [nzTitle]="'auth.callback.error.title' | translate"
          [nzSubTitle]="'auth.callback.error.subtitle' | translate"
        >
          <div nz-result-extra>
            <button nz-button nzType="primary" (click)="retryAuthentication()">
              {{ 'auth.callback.error.retry' | translate }}
            </button>
            <button (click)="goToLogin()">
              {{ 'auth.callback.error.login' | translate }}
            </button>
          </div>
        </nz-result>
      </div>
    </div>
  `,
  styles: [`
    .auth-callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e6f2ff 0%, #ffffff 100%);
    }

    .callback-loading {
      text-align: center;
      padding: 40px;
    }

    .callback-error {
      max-width: 500px;
      padding: 20px;
    }

    :deep(.ant-spin-text) {
      color: #0066cc;
      font-size: 16px;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly oidcAuthService = inject(OidcAuthService);

  isProcessingComplete = false;
  hasError = false;

  async ngOnInit(): Promise<void> {
    try {
      await this.oidcAuthService.handleAuthCallback();

      // Success - redirect will happen automatically in the service
      this.isProcessingComplete = true;

    } catch (error) {
      console.error('Authentication callback failed:', error);
      this.hasError = true;
      this.isProcessingComplete = true;
    }
  }

  retryAuthentication(): void {
    this.isProcessingComplete = false;
    this.hasError = false;
    this.ngOnInit();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
