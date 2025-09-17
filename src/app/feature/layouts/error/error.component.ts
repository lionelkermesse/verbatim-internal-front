import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import SharedModule from '@chd-digital-verbatim-front/shared/shared.module';
import { NzResultComponent } from 'ng-zorro-antd/result';
import { NzButtonComponent } from 'ng-zorro-antd/button';

@Component({
  selector: 'chd-error',
  standalone: true,
  templateUrl: './error.component.html',
  imports: [SharedModule, NzResultComponent, NzButtonComponent],
})
export default class ErrorComponent implements OnInit, OnDestroy {
  errorMessage = signal<string | undefined>(undefined);
  errorKey?: string;
  langChangeSubscription?: Subscription;

  private readonly translateService = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe(routeData => {
      if (routeData['errorMessage']) {
        this.errorKey = routeData['errorMessage'];
        this.getErrorMessageTranslation();
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => this.getErrorMessageTranslation());
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private getErrorMessageTranslation(): void {
    this.errorMessage.set('');
    if (this.errorKey) {
      this.translateService.get(this.errorKey).subscribe(translatedErrorMessage => {
        this.errorMessage.set(translatedErrorMessage);
      });
    }
  }
}
