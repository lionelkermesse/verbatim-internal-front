import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { OidcAuthService } from '@chd-digital-verbatim-front/core/auth/oidc-auth.service';
import { AccountService } from '@chd-digital-verbatim-front/core/auth/account.service';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';

@Component({
  selector: 'chd-login',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NzButtonModule,
    NzCardModule,
    NzSpinModule,
    NzAlertModule,
    NzIconModule,
    NzLayoutModule,
    NzTypographyModule,
    TranslatePipe,
    NgOptimizedImage,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly oidcAuthService = inject(OidcAuthService);
  private readonly accountService = inject(AccountService);
  private readonly translate = inject(TranslateService);

  // Component state signals
  readonly isLoading = signal<boolean>(false);
  readonly isInitializing = signal<boolean>(false);

  // Computed properties
  get loginError(): string | null {
    return this.oidcAuthService.getLoginError();
  }

  get translatedLoginError(): string | null {
    return this.loginError ? this.translate.instant(this.loginError) : null;
  }

  get isAuthInitialized(): boolean {
    return this.oidcAuthService.isInitializationComplete();
  }

  ngOnInit(): void {
    // TODO: uncomment this when the backend OIDC authentication will be ready
    // this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Check if user is already authenticated
      if (this.accountService.isAuthenticated()) {
        await this.router.navigate(['/sessions']);
        return;
      }

      // Initialize OIDC if not already done
      if (!this.isAuthInitialized) {
        // await this.oidcAuthService.initializeAuth();
        // Example: set validation handler before initializing auth
        this.oidcAuthService.setTokenValidationHandler(new JwksValidationHandler());
        await this.oidcAuthService.initializeAuth();
      }

      this.isInitializing.set(false);
    } catch (error) {
      console.error('Authentication initialization failed:', error);
      this.isInitializing.set(false);
    }
  }

  onLoginClick(): void {
    this.router.navigate(['/sessions']);
    /* TODO: uncomment this when the backend OIDC authentication will be ready
    if (this.isLoading() || this.isInitializing()) {
      return;
    }

    this.isLoading.set(true);

    try {
      // Store the intended destination
      const returnUrl = this.getReturnUrl();
      if (returnUrl) {
        sessionStorage.setItem('returnUrl', returnUrl);
      }

      // Initiate OIDC login flow
      this.oidcAuthService.login();
    } catch (error) {
      console.error('Login initiation failed:', error);
      this.isLoading.set(false);
    }
     */
  }

  private getReturnUrl(): string {
    // Check if there's a return URL in query params or use default
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('returnUrl') || '/sessions';
  }

  onRetryLogin(): void {
    // Clear any previous error and retry
    this.initializeAuth();
  }
}
