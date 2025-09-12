import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {map, Observable} from 'rxjs';

import dayjs from 'dayjs/esm';

import {isPresent} from '@chd-digital-verbatim-front/core/util/operators';
import {DATE_FORMAT} from '@chd-digital-verbatim-front/config/input.constants';
import {ApplicationConfigService} from '@chd-digital-verbatim-front/core/config/application-config.service';
import {createRequestOption} from '@chd-digital-verbatim-front/core/request/request-util';
import {ISession, NewSession} from './session-chd.model';

export type PartialUpdateSession = Partial<ISession> & Pick<ISession, 'id'>;

type RestOf<T extends ISession | NewSession> = Omit<T, 'sessionDate' | 'lastProcessedAt'> & {
  sessionDate?: string | null;
  lastProcessedAt?: string | null;
};

export type RestSession = RestOf<ISession>;

export type NewRestSessionChd = RestOf<NewSession>;

export type PartialUpdateRestSessionChd = RestOf<PartialUpdateSession>;

export type EntityResponseType = HttpResponse<ISession>;
export type EntityArrayResponseType = HttpResponse<ISession[]>;

@Injectable({providedIn: 'root'})
export class SessionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/v1/sessions');

  create(session: NewSession): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(session);
    return this.http
      .post<RestSession>(this.resourceUrl, copy, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(session: ISession): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(session);
    return this.http
      .put<RestSession>(`${this.resourceUrl}/${this.getSessionChdIdentifier(session)}`, copy, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(session: PartialUpdateSession): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(session);
    return this.http
      .patch<RestSession>(`${this.resourceUrl}/${this.getSessionChdIdentifier(session)}`, copy, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestSession>(`${this.resourceUrl}/${id}`, {observe: 'response'})
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSession[]>(this.resourceUrl, {params: options, observe: 'response'})
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
  }

  getSessionChdIdentifier(session: Pick<ISession, 'id'>): number {
    return session.id;
  }

  compareSessionChd(o1: Pick<ISession, 'id'> | null, o2: Pick<ISession, 'id'> | null): boolean {
    return o1 && o2 ? this.getSessionChdIdentifier(o1) === this.getSessionChdIdentifier(o2) : o1 === o2;
  }

  addSessionChdToCollectionIfMissing<Type extends Pick<ISession, 'id'>>(
    sessionCollection: Type[],
    ...sessionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const sessions: Type[] = sessionsToCheck.filter(isPresent);
    if (sessions.length > 0) {
      const sessionCollectionIdentifiers = sessionCollection.map(sessionItem => this.getSessionChdIdentifier(sessionItem));
      const sessionsToAdd = sessions.filter(sessionItem => {
        const sessionIdentifier = this.getSessionChdIdentifier(sessionItem);
        if (sessionCollectionIdentifiers.includes(sessionIdentifier)) {
          return false;
        }
        sessionCollectionIdentifiers.push(sessionIdentifier);
        return true;
      });
      return [...sessionsToAdd, ...sessionCollection];
    }
    return sessionCollection;
  }

  protected convertDateFromClient<T extends ISession | NewSession | PartialUpdateSession>(session: T): RestOf<T> {
    return {
      ...session,
      sessionDate: session.sessionDate?.format(DATE_FORMAT) ?? null,
      lastProcessedAt: session.lastProcessedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restSessionChd: RestSession): ISession {
    return {
      ...restSessionChd,
      sessionDate: restSessionChd.sessionDate ? dayjs(restSessionChd.sessionDate) : undefined,
      lastProcessedAt: restSessionChd.lastProcessedAt ? dayjs(restSessionChd.lastProcessedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestSession>): HttpResponse<ISession> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestSession[]>): HttpResponse<ISession[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
