import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {map, Observable} from 'rxjs';

import dayjs from 'dayjs/esm';

import {isPresent} from '@chd-digital-verbatim-front/core/util/operators';
import {ApplicationConfigService} from '@chd-digital-verbatim-front/core/config/application-config.service';
import {createRequestOption} from '@chd-digital-verbatim-front/core/request/request-util';
import {
  IMatchingVersion, NewMatchingVersion
} from '@chd-digital-verbatim-front/feature/entities/matching-version/matching-version-chd.model';

export type PartialUpdateMatchingVersion = Partial<IMatchingVersion> & Pick<IMatchingVersion, 'id'>;

type RestOf<T extends IMatchingVersion | NewMatchingVersion> = Omit<T, 'createdAt' | 'validatedAt'> & {
  createdAt?: string | null;
  validatedAt?: string | null;
};

export type RestMatchingVersion = RestOf<IMatchingVersion>;

export type NewRestMatchingVersion = RestOf<NewMatchingVersion>;

export type PartialUpdateRestMatchingVersion = RestOf<PartialUpdateMatchingVersion>;

export type EntityResponseType = HttpResponse<IMatchingVersion>;
export type EntityArrayResponseType = HttpResponse<IMatchingVersion[]>;

@Injectable({providedIn: 'root'})
export class MatchingVersionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/v1/matching');

  create(matchingVersion: NewMatchingVersion): Observable<EntityResponseType> {
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

  partialUpdate(matchingVersion: PartialUpdateMatchingVersion): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(matchingVersion);
    return this.http
      .patch<RestMatchingVersion>(`${this.resourceUrl}/${this.getMatchingVersionChdIdentifier(matchingVersion)}`, copy, {
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

  compareMatchingVersionChd(o1: Pick<IMatchingVersion, 'id'> | null, o2: Pick<IMatchingVersion, 'id'> | null): boolean {
    return o1 && o2 ? this.getMatchingVersionChdIdentifier(o1) === this.getMatchingVersionChdIdentifier(o2) : o1 === o2;
  }

  addMatchingVersionChdToCollectionIfMissing<Type extends Pick<IMatchingVersion, 'id'>>(
    matchingVersionCollection: Type[],
    ...matchingVersionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const matchingVersions: Type[] = matchingVersionsToCheck.filter(isPresent);
    if (matchingVersions.length > 0) {
      const matchingVersionCollectionIdentifiers = matchingVersionCollection.map(matchingVersionItem =>
        this.getMatchingVersionChdIdentifier(matchingVersionItem),
      );
      const matchingVersionsToAdd = matchingVersions.filter(matchingVersionItem => {
        const matchingVersionIdentifier = this.getMatchingVersionChdIdentifier(matchingVersionItem);
        if (matchingVersionCollectionIdentifiers.includes(matchingVersionIdentifier)) {
          return false;
        }
        matchingVersionCollectionIdentifiers.push(matchingVersionIdentifier);
        return true;
      });
      return [...matchingVersionsToAdd, ...matchingVersionCollection];
    }
    return matchingVersionCollection;
  }

  protected convertDateFromClient<T extends IMatchingVersion | NewMatchingVersion | PartialUpdateMatchingVersion>(
    matchingVersion: T,
  ): RestOf<T> {
    return {
      ...matchingVersion,
      createdAt: matchingVersion.createdAt?.toJSON() ?? null,
      validatedAt: matchingVersion.validatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restMatchingVersion: RestMatchingVersion): IMatchingVersion {
    return {
      ...restMatchingVersion,
      createdAt: restMatchingVersion.createdAt ? dayjs(restMatchingVersion.createdAt) : undefined,
      validatedAt: restMatchingVersion.validatedAt ? dayjs(restMatchingVersion.validatedAt) : undefined,
    };
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
}
