import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzResultModule } from 'ng-zorro-antd/result';

import { ReferentialService } from '../referential.service';

@Component({
  selector: 'chd-referential-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NzUploadModule,
    NzButtonModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzTypographyModule,
    NzGridModule,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzAlertModule,
    NzResultModule,
  ],
  templateUrl: './referential-upload.component.html',
  styleUrls: ['./referential-upload.component.scss'],
})
export class ReferentialUploadComponent {
  private readonly router = inject(Router);
  private readonly referentialService = inject(ReferentialService);
  private readonly fb = inject(FormBuilder);

  // Component state
  readonly uploadedFile = signal<NzUploadFile | null>(null);
  readonly isUploading = signal<boolean>(false);
  readonly uploadStatus = signal<'none' | 'success' | 'error'>('none');
  readonly uploadError = signal<string | null>(null);

  // Form
  uploadForm: FormGroup;

  constructor() {
    this.uploadForm = this.fb.group({
      referentialFile: [null, [Validators.required]],
    });
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    // Only accept JSON and XML files
    const isValidFormat = file.type === 'application/json' ||
                         file.type === 'application/xml' ||
                         file.type === 'text/xml' ||
                         file.name?.toLowerCase().endsWith('.json') ||
                         file.name?.toLowerCase().endsWith('.xml');

    if (!isValidFormat) {
      this.uploadError.set('referential.upload.error.invalidFormat');
      return false;
    }

    // Check file size (max 10MB)
    const isLt10M = (file.size || 0) / 1024 / 1024 < 10;
    if (!isLt10M) {
      this.uploadError.set('referential.upload.error.fileSize');
      return false;
    }

    this.uploadedFile.set(file);
    this.uploadError.set(null);
    this.uploadStatus.set('none');
    return false; // Prevent automatic upload
  };

  onUpload(): void {
    if (!this.uploadedFile()) {
      return;
    }

    this.isUploading.set(true);
    this.uploadStatus.set('none');
    this.uploadError.set(null);

    const file = this.uploadedFile()!;
    const formData = new FormData();
    formData.append('file', file as any);

    this.referentialService.uploadFile(formData).subscribe({
      next: (response) => {
        this.isUploading.set(false);
        this.uploadStatus.set('success');

        // Navigate back to referential list after successful upload
        setTimeout(() => {
          this.router.navigate(['/referential']);
        }, 2000);
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.isUploading.set(false);
        this.uploadStatus.set('error');
        this.uploadError.set('referential.upload.error.upload');
      }
    });
  }

  onRemoveFile(): void {
    this.uploadedFile.set(null);
    this.uploadError.set(null);
    this.uploadStatus.set('none');
    this.uploadForm.patchValue({ referentialFile: null });
  }

  onCancel(): void {
    this.router.navigate(['/referential']);
  }

  onRetry(): void {
    this.uploadError.set(null);
    this.uploadStatus.set('none');
  }

  get canUpload(): boolean {
    return !!this.uploadedFile() && !this.isUploading();
  }
}
