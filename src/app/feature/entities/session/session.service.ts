import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from '@chd-digital-verbatim-front/config/input.constants';
import { ApplicationConfigService } from '@chd-digital-verbatim-front/core/config/application-config.service';
import { createRequestOption } from '@chd-digital-verbatim-front/core/request/request-util';
import { ISession, ISessionPage, NewSession } from '@chd-digital-verbatim-front/feature/entities/session/session.model';

export type PartialUpdateSession = Partial<ISession> & Pick<ISession, 'id'>;

type RestOf<T extends ISession | NewSession> = Omit<T, 'sessionDate' | 'lastProcessedAt'> & {
  sessionDate?: string | null;
  lastProcessedAt?: string | null;
};

export type RestSession = RestOf<ISession>;

export type EntityResponseType = HttpResponse<ISession>;
export type EntityArrayResponseType = HttpResponse<ISession[]>;
export type SessionPageResponseType = HttpResponse<ISessionPage>;

export interface ISessionDateRangeQuery {
  startDate: string;
  endDate: string;
  page: number;
  size: number;
  withMatching?: boolean;
}

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

  queryByDate(params: ISessionDateRangeQuery): Observable<SessionPageResponseType> {
    const options = createRequestOption(params);
    return this.http
      .get<any>(`${this.resourceUrl}/by-date`, {params: options, observe: 'response'})
      .pipe(map(res => this.convertPageResponseFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
  }

  getSessionChdIdentifier(session: Pick<ISession, 'id'>): number {
    return session.id;
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

  protected convertPageResponseFromServer(res: HttpResponse<any>): HttpResponse<ISessionPage> {
    return res.clone({
      body: res.body ? {
        ...res.body,
        content: res.body.content ? res.body.content.map((item: RestSession) => this.convertDateFromServer(item)) : []
      } : null,
    });
  }
}
