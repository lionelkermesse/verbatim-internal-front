import {Component, inject, OnInit, signal} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {StateStorageService} from '@chd-digital-verbatim-front/core/auth/state-storage.service';
import SharedModule from '@chd-digital-verbatim-front/shared/shared.module';
import {LANGUAGES} from '@chd-digital-verbatim-front/config/language.constants';
import {AccountService} from '@chd-digital-verbatim-front/core/auth/account.service';
import {LoginService} from '@chd-digital-verbatim-front/feature/login/login.service';
import {EntityNavbarItems} from '@chd-digital-verbatim-front/feature/entities/entity-navbar-items';
import NavbarItem from './navbar-item.model';
import {environment} from '../../../../environments/environment';
import HasAnyAuthorityDirective from '@chd-digital-verbatim-front/shared/directives/auth/has-any-authority.directive';
import {ProfileInfoStore} from '@chd-digital-verbatim-front/feature/layouts/profiles/profile-info.store';

@Component({
  selector: 'jhi-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [RouterModule, SharedModule, HasAnyAuthorityDirective],
})
export default class NavbarComponent implements OnInit {
  inProduction?: boolean;
  isNavbarCollapsed = signal(true);
  languages = LANGUAGES;
  openAPIEnabled?: boolean;
  version = '';
  account = inject(AccountService).trackCurrentAccount();
  entitiesNavbarItems: NavbarItem[] = [];

  private readonly loginService = inject(LoginService);
  private readonly translateService = inject(TranslateService);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly profileInfoStore = inject(ProfileInfoStore);
  private readonly router = inject(Router);

  constructor() {
    const {VERSION} = environment;
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    }
  }

  ngOnInit(): void {
    this.entitiesNavbarItems = EntityNavbarItems;
    this.inProduction = this.profileInfoStore.inProduction();
    this.openAPIEnabled = this.profileInfoStore.openAPIEnabled();
  }

  changeLanguage(languageKey: string): void {
    this.stateStorageService.storeLocale(languageKey);
    this.translateService.use(languageKey);
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed.set(true);
  }

  login(): void {
    this.loginService.login();
  }

  logout(): void {
    this.collapseNavbar();
    this.loginService.logout();
    this.router.navigate(['']);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed.update(isNavbarCollapsed => !isNavbarCollapsed);
  }
}
