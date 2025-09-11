import { Component, inject } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { environment } from '../environments/environment';
import { ApplicationConfigService } from '@chd-digital-verbatim-front/core/config/application-config.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fontAwesomeIcons } from '@chd-digital-verbatim-front/config/font-awesome-icons';
import MainComponent from '@chd-digital-verbatim-front/feature/layouts/main/main.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainComponent],
  template: '<chd-main />',
})
export class AppComponent {
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly iconLibrary = inject(FaIconLibrary);
  title = 'chd-digital-verbatim-front';

  constructor() {
    this.applicationConfigService.setEndpointPrefix(environment.SERVER_API_URL);
    registerLocaleData(fr);
    this.iconLibrary.addIcons(...fontAwesomeIcons);
  }

}
