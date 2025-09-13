import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from '@chd-digital-verbatim-front/core/config/application-config.service';
import { IReferentialFile, IReferentialContent } from './models/referential.model';

export type EntityResponseType = HttpResponse<IReferentialFile>;
export type EntityArrayResponseType = HttpResponse<IReferentialFile[]>;
export type ContentResponseType = HttpResponse<IReferentialContent>;

@Injectable({ providedIn: 'root' })
export class ReferentialService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/v1/referential/files');

  // User Story 3.2 - Upload new referential file
  uploadFile(file: FormData): Observable<EntityResponseType> {
    return this.http.post<IReferentialFile>(this.resourceUrl, file, { observe: 'response' });
  }

  // User Story 3.3 - Download referential file
  downloadFile(id: number): Observable<Blob> {
    return this.http.get(`${this.resourceUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  // Get file metadata
  getFileMetadata(id: number): Observable<EntityResponseType> {
    return this.http.get<IReferentialFile>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // Get file content
  getFileContent(id: number): Observable<ContentResponseType> {
    return this.http.get<IReferentialContent>(`${this.resourceUrl}/${id}/content`, { observe: 'response' });
  }

  // User Story 3.1 - Get all referential files
  getAllFiles(): Observable<EntityArrayResponseType> {
    return this.http.get<IReferentialFile[]>(this.resourceUrl, { observe: 'response' });
  }

  // Delete referential file
  deleteFile(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // User Story 3.1 - Get current referential
  getCurrentReferential(): Observable<EntityResponseType> {
    return this.http.get<IReferentialFile>(`${this.resourceUrl}/current`, { observe: 'response' });
  }
}
