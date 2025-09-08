import {Component, inject, OnInit, signal} from '@angular/core';
import {RouterModule} from '@angular/router';

import SharedModule from '@chd-digital-verbatim-front/shared/shared.module';
import {LoginService} from '@chd-digital-verbatim-front/feature/login/login.service';
import {AccountService} from '@chd-digital-verbatim-front/core/auth/account.service';
import {Account} from '@chd-digital-verbatim-front/core/auth/account.model';

@Component({
  selector: 'chd-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule]
})
export default class HomeComponent implements OnInit {
  account = signal<Account | null>(null);

  private readonly accountService = inject(AccountService);
  private readonly loginService = inject(LoginService);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => this.account.set(account));
  }

  login(): void {
    this.loginService.login();
  }
}
