import {computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef} from '@angular/core';

import {AccountService} from '@chd-digital-verbatim-front/core/auth/account.service';

/**
 * @whatItDoes Conditionally includes an HTML element if current user has any
 * of the authorities passed as the `expression`.
 *
 * @howToUse
 * ```
 *     <some-element *chdHasAnyAuthority="'ROLE_ADMIN'">...</some-element>
 *
 *     <some-element *chdHasAnyAuthority="['ROLE_ADMIN', 'ROLE_USER']">...</some-element>
 * ```
 */
@Directive({
  selector: '[chdHasAnyAuthority]',
  standalone: true,
})
export default class HasAnyAuthorityDirective {
  public authorities = input<string | string[]>([], {alias: 'chdHasAnyAuthority'});

  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  constructor() {
    const accountService = inject(AccountService);
    const currentAccount = accountService.trackCurrentAccount();
    const hasPermission = computed(() => currentAccount()?.authorities && accountService.hasAnyAuthority(this.authorities()));

    effect(() => {
      if (hasPermission()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
    });
  }
}
