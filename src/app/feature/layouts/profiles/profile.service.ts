import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {ApplicationConfigService} from '@chd-digital-verbatim-front/core/config/application-config.service';
import {InfoResponse} from './profile-info.model';

@Injectable({providedIn: 'root'})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly infoUrl = this.applicationConfigService.getEndpointFor('management/info');

  getInfo = (): Observable<InfoResponse> => this.http.get<InfoResponse>(this.infoUrl);
}
