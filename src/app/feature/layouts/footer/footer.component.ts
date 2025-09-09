import {Component, computed, inject, isDevMode, signal} from '@angular/core';
import {NzFooterComponent} from 'ng-zorro-antd/layout';
import {NgIf} from '@angular/common';
import {ProfileInfoStore} from '@chd-digital-verbatim-front/feature/layouts/profiles/profile-info.store';

@Component({
  selector: 'chd-footer',
  standalone: true,
  styleUrls: ['./footer.component.scss'],
  imports: [NzFooterComponent, NgIf],
  template: `
    <nz-footer>
      <span>CHD Copyright© {{ year() }}</span>
      <span *ngIf="isDevMode()">{{ '- v' + version() }}</span>
    </nz-footer>
  `,
})
export class FooterComponent {
  readonly isDevMode = isDevMode;
  readonly pageRibbonStore = inject(ProfileInfoStore);
  readonly year = signal<number>(new Date().getFullYear());
  readonly version = computed(() => this.pageRibbonStore.version());
}
