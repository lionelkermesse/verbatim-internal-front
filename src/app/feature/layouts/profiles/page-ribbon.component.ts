import {Component, computed, inject} from '@angular/core';

import SharedModule from '@chd-digital-verbatim-front/shared/shared.module';
import {ProfileInfoStore} from '@chd-digital-verbatim-front/feature/layouts/profiles/profile-info.store';

@Component({
  selector: 'chd-page-ribbon',
  standalone: true,
  template: `
    @if (ribbonEnv()) {
      <div class="ribbon">
        <a href="" [chdTranslate]="'global.ribbon.' + ribbonEnv()">{{ {dev: 'Development'}[ribbonEnv() ?? ''] }}</a>
      </div>
    }
  `,
  styleUrl: './page-ribbon.component.scss',
  imports: [SharedModule],
})
export default class PageRibbonComponent {
  readonly pageRibbonStore = inject(ProfileInfoStore);
  ribbonEnv = computed(() => this.pageRibbonStore.ribbonEnv());
}
