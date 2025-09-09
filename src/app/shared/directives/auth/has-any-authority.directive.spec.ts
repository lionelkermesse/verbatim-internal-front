jest.mock('app/core/auth/account.service');

import {Component, ElementRef, signal, viewChild, WritableSignal} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';

import {AccountService} from '@chd-digital-verbatim-front/core/auth/account.service';
import {Account} from '@chd-digital-verbatim-front/core/auth/account.model';

import HasAnyAuthorityDirective from './has-any-authority.directive';

@Component({
  imports: [HasAnyAuthorityDirective],
  standalone: true,
  template: `
    <div *chdHasAnyAuthority="'ROLE_ADMIN'" #content></div> `,
})
class TestHasAnyAuthorityDirectiveComponent {
  content = viewChild<ElementRef>('content');
}

describe('HasAnyAuthorityDirective tests', () => {
  let mockAccountService: AccountService;
  let currentAccount: WritableSignal<Account | null>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHasAnyAuthorityDirectiveComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), AccountService],
    });
  }));

  beforeEach(() => {
    mockAccountService = TestBed.inject(AccountService);
    currentAccount = signal<Account | null>({activated: true, authorities: []} as any);
    mockAccountService.trackCurrentAccount = jest.fn(() => currentAccount);
  });

  describe('set chdHasAnyAuthority', () => {
    it('should show restricted content to user if user has required role', () => {
      // GIVEN
      mockAccountService.hasAnyAuthority = jest.fn(() => true);
      const fixture = TestBed.createComponent(TestHasAnyAuthorityDirectiveComponent);
      const comp = fixture.componentInstance;

      // WHEN
      fixture.detectChanges();

      // THEN
      expect(comp.content).toBeDefined();
    });

    it('should not show restricted content to user if user has not required role', () => {
      // GIVEN
      mockAccountService.hasAnyAuthority = jest.fn(() => false);
      const fixture = TestBed.createComponent(TestHasAnyAuthorityDirectiveComponent);
      const comp = fixture.componentInstance;

      // WHEN
      fixture.detectChanges();

      // THEN
      expect(comp.content()).toBeUndefined();
    });
  });

  describe('change authorities', () => {
    it('should show or not show restricted content correctly if user authorities are changing', () => {
      // GIVEN
      mockAccountService.hasAnyAuthority = jest.fn((): boolean => Boolean(currentAccount()));
      const fixture = TestBed.createComponent(TestHasAnyAuthorityDirectiveComponent);
      const comp = fixture.componentInstance;

      // WHEN
      fixture.detectChanges();

      // THEN
      expect(comp.content()).toBeDefined();

      // GIVEN
      currentAccount.set(null);

      // WHEN
      fixture.detectChanges();

      // THEN
      expect(comp.content()).toBeUndefined();

      // WHEN
      currentAccount.set({activated: true, authorities: ['foo']} as any);
      fixture.detectChanges();

      // THEN
      expect(comp.content).toBeDefined();
    });
  });
});
