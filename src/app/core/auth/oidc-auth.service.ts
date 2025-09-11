import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService, AuthConfig, JwksValidationHandler } from 'angular-oauth2-oidc';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { Account } from './account.model';
import { AccountService } from './account.service';
import { ApplicationConfigService } from '../config/application-config.service';

@Injectable({ providedIn: 'root' })
export class OidcAuthService {
  private readonly router = inject(Router);
  private readonly oauthService = inject(OAuthService);
  private readonly accountService = inject(AccountService);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly http = inject(HttpClient);

  private readonly loginError = signal<string | null>(null);
  private readonly isInitialized = signal<boolean>(false);

  private authConfig: AuthConfig = {
    // These will be configured from environment or backend
    issuer: '', // Will be set from environment
    redirectUri: window.location.origin + '/auth/callback',
    clientId: '', // Will be set from environment
    responseType: 'code',
    scope: 'openid profile email',
    showDebugInformation: false,
    strictDiscoveryDocumentValidation: false,
    skipSubjectCheck: true,
  };

  constructor() {
    this.configureOAuth();
  }

  private configureOAuth(): void {
    // Configure OAuth service
    this.oauthService.configure(this.authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.setupAutomaticSilentRefresh();

    // Listen to token events
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received') {
        this.handleTokenReceived();
      }
      if (event.type === 'token_error') {
        this.handleTokenError();
      }
    });
  }

  async initializeAuth(): Promise<void> {
    try {
      // Load OIDC configuration from backend or environment
      await this.loadOidcConfig();

      // Discover document and init
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      // Check if user is already authenticated
      if (this.oauthService.hasValidAccessToken()) {
        await this.loadUserProfile();
      }

      this.isInitialized.set(true);
    } catch (error) {
      console.error('OIDC initialization failed:', error);
      this.loginError.set('Authentication configuration failed');
      this.isInitialized.set(true);
    }
  }
public setTokenValidationHandler(handler: any): void {
  this.oauthService.tokenValidationHandler = handler;
}
  private async loadOidcConfig(): Promise<void> {
    try {
      // In a real implementation, you would load this from your backend API
      // For now, we'll use environment variables or default config
      const config = await this.http.get<any>(
        this.applicationConfigService.getEndpointFor('api/auth/oidc-config')
      ).pipe(
        catchError(() => of({
          issuer: 'https://your-oidc-provider.com',
          clientId: 'verbatim-chamber-app',
          // Add other OIDC config from your provider
        }))
      ).toPromise();

      this.authConfig = {
        ...this.authConfig,
        issuer: config.issuer,
        clientId: config.clientId,
        // Set other dynamic config values
      };

      this.oauthService.configure(this.authConfig);
    } catch (error) {
      console.warn('Could not load OIDC config from backend, using defaults');
    }
  }

  login(): void {
    this.loginError.set(null);
    this.oauthService.initLoginFlow();
  }

  logout(): void {
    this.oauthService.logOut();
    this.accountService.authenticate(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  getIdToken(): string {
    return this.oauthService.getIdToken();
  }

  getUserClaims(): any {
    return this.oauthService.getIdentityClaims();
  }

  getLoginError(): string | null {
    return this.loginError();
  }

  isInitializationComplete(): boolean {
    return this.isInitialized();
  }

  private async handleTokenReceived(): Promise<void> {
    try {
      await this.loadUserProfile();

      // Navigate to stored URL or default page
      const returnUrl = sessionStorage.getItem('returnUrl') || '/sessions';
      sessionStorage.removeItem('returnUrl');
      this.router.navigateByUrl(returnUrl);

    } catch (error) {
      console.error('Failed to load user profile after token received:', error);
      this.loginError.set('Failed to load user profile');
    }
  }

  private handleTokenError(): void {
    this.loginError.set('Authentication failed. Please try again.');
    this.accountService.authenticate(null);
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const claims = this.getUserClaims();

      if (!claims) {
        throw new Error('No user claims available');
      }

      // Map OIDC claims to Account model
      const account = new Account(
        true, // activated
        claims.authorities || claims.roles || ['ROLE_USER'], // authorities from token
        claims.email || claims.preferred_username || '',
        claims.given_name || claims.first_name || null,
        claims.locale || 'fr', // default to French for Chamber
        claims.family_name || claims.last_name || null,
        claims.preferred_username || claims.sub || '',
        claims.picture || null
      );

      // Authenticate user in account service
      this.accountService.authenticate(account);

    } catch (error) {
      console.error('Failed to create user profile from token:', error);
      throw error;
    }
  }

  refreshToken(): Observable<boolean> {
    return from(this.oauthService.refreshToken()).pipe(
      map(() => this.oauthService.hasValidAccessToken()),
      catchError(() => of(false))
    );
  }

  // Method to handle authentication callback
  async handleAuthCallback(): Promise<void> {
    try {
      await this.oauthService.tryLoginCodeFlow();
      if (this.oauthService.hasValidAccessToken()) {
        await this.loadUserProfile();
      }
    } catch (error) {
      console.error('Auth callback handling failed:', error);
      this.loginError.set('Authentication callback failed');
    }
  }
}
