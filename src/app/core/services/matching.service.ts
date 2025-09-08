import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable } from 'rxjs';
import { MatchingVersionDto, ResultDto, UpdateMatchRequest } from '../models';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MatchingService {

  constructor(private http: HttpClient) { }

  startMatching(sessionIdentifier: string, verbatimFile: File, eventFile: File): Observable<MatchingVersionDto> {
    const formData = new FormData();
    formData.append('verbatim', verbatimFile);
    formData.append('event', eventFile);

    return this.http.post<ResultDto<MatchingVersionDto>>(`/api/v1/matching/${sessionIdentifier}/start`, formData)
      .pipe(
        map(result => result.data)
      );
  }

  getMatchingVersion(sessionIdentifier: string, version: number): Observable<MatchingVersionDto> {
    return this.http.get<ResultDto<MatchingVersionDto>>(`/api/v1/matching/${sessionIdentifier}/${version}`)
      .pipe(
        map(result => result.data)
      );
  }

  updateMatch(sessionIdentifier: string, request: UpdateMatchRequest): Observable<MatchingVersionDto> {
    return this.http.put<ResultDto<MatchingVersionDto>>(`/api/v1/matching/${sessionIdentifier}/update`, request)
      .pipe(
        map(result => result.data)
      );
  }

  validate(sessionIdentifier: string, version: number): Observable<MatchingVersionDto> {
    return this.http.post<ResultDto<MatchingVersionDto>>(`/api/v1/matching/${sessionIdentifier}/${version}/validate`, null)
      .pipe(
        map(result => result.data)
      );
  }
}
