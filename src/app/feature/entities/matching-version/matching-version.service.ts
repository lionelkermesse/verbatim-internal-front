import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { dateTimeToStr, strToDate } from '@chd-digital-verbatim-front/shared/util';
import { ApplicationConfigService } from '@chd-digital-verbatim-front/core/config/application-config.service';
import { createRequestOption } from '@chd-digital-verbatim-front/core/request/request-util';
import {
  IMatchingVersion,
  NewMatchingVersion
} from '@chd-digital-verbatim-front/feature/entities/matching-version/matching-version-chd.model';

export type PartialUpdateMatchingVersion = Partial<IMatchingVersion> & Pick<IMatchingVersion, 'id'>;

type RestOf<T extends IMatchingVersion | NewMatchingVersion> = Omit<T, 'createdAt' | 'validatedAt'> & {
  createdAt?: string | null;
  validatedAt?: string | null;
};

export type RestMatchingVersion = RestOf<IMatchingVersion>;

export type EntityResponseType = HttpResponse<IMatchingVersion>;
export type EntityArrayResponseType = HttpResponse<IMatchingVersion[]>;

@Injectable({providedIn: 'root'})
export class MatchingVersionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/v1/matching');

  createMatching(matchingVersion: NewMatchingVersion): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(matchingVersion);
    return this.http
      .post<RestMatchingVersion>(this.resourceUrl, copy, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(matchingVersion: IMatchingVersion): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(matchingVersion);
    return this.http
      .put<RestMatchingVersion>(`${this.resourceUrl}/${this.getMatchingVersionChdIdentifier(matchingVersion)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestMatchingVersion>(`${this.resourceUrl}/${id}`, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  findAll(sessionId: string): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestMatchingVersion[]>(`${this.resourceUrl}/${sessionId}`, {observe: 'response'})
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  startMatching(sessionIdentifier: string, formData: FormData): Observable<EntityResponseType> {
    return this.http.post<RestMatchingVersion>(`${this.resourceUrl}/${sessionIdentifier}/start`, formData, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  getMatchingVersion(sessionIdentifier: string, version: number): Observable<EntityResponseType> {
    return this.http.get<RestMatchingVersion>(`${this.resourceUrl}/${sessionIdentifier}/${version}`, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  updateMatching(sessionIdentifier: string, updateRequest: any): Observable<EntityResponseType> {
    return this.http.put<RestMatchingVersion>(`${this.resourceUrl}/${sessionIdentifier}/update`, updateRequest, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  validateMatching(sessionIdentifier: string, version: number): Observable<EntityResponseType> {
    return this.http.post<RestMatchingVersion>(`${this.resourceUrl}/${sessionIdentifier}/${version}/validate`, {}, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  deleteMatchingVersion(sessionIdentifier: string, version: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${sessionIdentifier}/${version}`, {observe: 'response'});
  }

  exportMatching(sessionIdentifier: string, version: number, format: string): Observable<Blob> {
    return this.http.get(`${this.resourceUrl}/${sessionIdentifier}/${version}/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestMatchingVersion[]>(this.resourceUrl, {params: options, observe: 'response'})
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
  }

  getMatchingVersionChdIdentifier(matchingVersion: Pick<IMatchingVersion, 'id'>): number {
    return matchingVersion.id;
  }

  protected convertResponseFromServer(res: HttpResponse<RestMatchingVersion>): HttpResponse<IMatchingVersion> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMatchingVersion[]>): HttpResponse<IMatchingVersion[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }

  protected convertDateFromClient<T extends IMatchingVersion | NewMatchingVersion | PartialUpdateMatchingVersion>(
    matchingVersion: T,
  ): RestOf<T> {
    return {
      ...matchingVersion,
      createdAt: dateTimeToStr(matchingVersion.createdAt),
      validatedAt: dateTimeToStr(matchingVersion.validatedAt),
    };
  }

  protected convertDateFromServer(restMatchingVersion: RestMatchingVersion): IMatchingVersion {
    return {
      ...restMatchingVersion,
      createdAt: strToDate(restMatchingVersion.createdAt),
      validatedAt: strToDate(restMatchingVersion.validatedAt),
    };
  }

}
