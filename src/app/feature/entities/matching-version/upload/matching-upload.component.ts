import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzUploadModule, NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { SessionService } from '@chd-digital-verbatim-front/feature/entities/session/session.service';
import { MatchingVersionService } from '@chd-digital-verbatim-front/feature/entities/matching-version/matching-version.service';
import { ISession } from '@chd-digital-verbatim-front/feature/entities/session/session-chd.model';

@Component({
  selector: 'chd-matching-upload',
  standalone: true,
  imports: [
    CommonModule,
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
    NzProgressModule,
    NzResultModule,
    NzStepsModule,
  ],
  templateUrl: './matching-upload.component.html',
  styleUrls: ['./matching-upload.component.scss'],
})
export class MatchingUploadComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly matchingVersionService = inject(MatchingVersionService);
  private readonly fb = inject(FormBuilder);

  // Component state
  readonly session = signal<ISession | null>(null);
  readonly uploadedFile = signal<NzUploadFile | null>(null);
  readonly isValidating = signal<boolean>(false);
  readonly validationStatus = signal<'none' | 'ready' | 'error'>('none');
  readonly validationError = signal<string | null>(null);
  readonly isProcessing = signal<boolean>(false);
  readonly processingProgress = signal<number>(0);
  readonly currentStep = signal<number>(0);

  // Form
  uploadForm: FormGroup;

  constructor() {
    this.uploadForm = this.fb.group({
      verbatimFile: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (sessionId) {
      this.loadSession(sessionId);
    }
  }

  private loadSession(sessionId: string): void {
    this.sessionService.find(sessionId).subscribe({
      next: (response) => {
        this.session.set(response.body);
      },
      error: (error) => {
        console.error('Error loading session:', error);
      }
    });
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    // Only accept DOCX files
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.name?.toLowerCase().endsWith('.docx');

    if (!isDocx) {
      this.validationError.set('matching.upload.error.invalidFormat');
      return false;
    }

    // Check file size (max 50MB)
    const isLt50M = (file.size || 0) / 1024 / 1024 < 50;
    if (!isLt50M) {
      this.validationError.set('matching.upload.error.fileSize');
      return false;
    }

    this.uploadedFile.set(file);
    this.validateFile(file);
    return false; // Prevent automatic upload
  };

  private validateFile(file: NzUploadFile): void {
    this.isValidating.set(true);
    this.validationStatus.set('none');
    this.validationError.set(null);
    this.currentStep.set(1);

    const formData = new FormData();
    formData.append('file', file as any);

    this.matchingVersionService.validateVerbatimFile(formData).subscribe({
      next: (response) => {
        this.isValidating.set(false);

        if (response.status === 'READY') {
          this.validationStatus.set('ready');
          this.currentStep.set(2);
        } else {
          this.validationStatus.set('error');
          this.validationError.set(response.message || 'matching.upload.error.validation');
        }
      },
      error: (error) => {
        console.error('Validation error:', error);
        this.isValidating.set(false);
        this.validationStatus.set('error');
        this.validationError.set('matching.upload.error.server');
      }
    });
  }

  onStartMatching(): void {
    if (!this.uploadedFile() || this.validationStatus() !== 'ready') {
      return;
    }

    this.isProcessing.set(true);
    this.currentStep.set(3);
    this.processingProgress.set(0);

    const sessionId = this.session()?.id;
    const file = this.uploadedFile();

    if (!sessionId || !file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file as any);
    formData.append('sessionId', sessionId.toString());

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      const current = this.processingProgress();
      if (current < 90) {
        this.processingProgress.set(current + 10);
      }
    }, 500);

    this.matchingVersionService.createMatching(formData).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.processingProgress.set(100);
        this.isProcessing.set(false);
        this.currentStep.set(4);

        // Navigate to matching result page
        setTimeout(() => {
          this.router.navigate(['/matching', response.id]);
        }, 1000);
      },
      error: (error) => {
        clearInterval(progressInterval);
        console.error('Processing error:', error);
        this.isProcessing.set(false);
        this.validationStatus.set('error');
        this.validationError.set('matching.upload.error.processing');
      }
    });
  }

  onRemoveFile(): void {
    this.uploadedFile.set(null);
    this.validationStatus.set('none');
    this.validationError.set(null);
    this.currentStep.set(0);
    this.uploadForm.patchValue({ verbatimFile: null });
  }

  onCancel(): void {
    this.router.navigate(['/session', this.session()?.id]);
  }

  onRetry(): void {
    if (this.uploadedFile()) {
      this.validateFile(this.uploadedFile()!);
    }
  }

  get canStartMatching(): boolean {
    return this.validationStatus() === 'ready' && !this.isProcessing();
  }
}
