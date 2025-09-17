import { Component, computed, inject, isDevMode, signal } from '@angular/core';
import { NzFooterComponent } from 'ng-zorro-antd/layout';
import { ProfileInfoStore } from '@chd-digital-verbatim-front/feature/layouts/profiles/profile-info.store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'chd-footer',
  standalone: true,
  styleUrls: ['./footer.component.scss'],
  imports: [NzFooterComponent, TranslateModule, ],
  template: `
    <nz-footer class="footer">
      <div class="footer-content">
        <div class="footer-left">
          <span>{{ 'footer.copyright' | translate: { year: year() } }}</span>
        </div>
        <div class="footer-center">
          <a href="https://chd.lu/wps/portal/public/Accueil/AProposDeLaChambre/MentionsLegales"
             target="_blank"
             rel="noopener noreferrer">
            {{ 'footer.links.legal' | translate }}
          </a>
          <span class="separator">•</span>
          <a href="https://chd.lu/wps/portal/public/Accueil/AProposDeLaChambre/PolitiqueConfidentialite"
             target="_blank"
             rel="noopener noreferrer">
            {{ 'footer.links.privacy' | translate }}
          </a>
          <span class="separator">•</span>
          <a href="https://chd.lu/wps/portal/public/Accueil/AProposDeLaChambre/Accessibilite"
             target="_blank"
             rel="noopener noreferrer">
            {{ 'footer.links.accessibility' | translate }}
          </a>
        </div>
        <div class="footer-right">
          @if (isDevMode()) {
            <span class="version">v{{ version() }}</span>
          }
        </div>
      </div>
    </nz-footer>
  `,
})
export default class FooterComponent {
  private readonly translate = inject(TranslateService);

  readonly isDevMode = isDevMode;
  readonly pageRibbonStore = inject(ProfileInfoStore);
  readonly year = signal<number>(new Date().getFullYear());
  readonly version = computed(() => this.pageRibbonStore.version());


}
