import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { SessionService } from '@chd-digital-verbatim-front/feature/entities/session/session.service';
import {
  MatchingVersionService
} from '@chd-digital-verbatim-front/feature/entities/matching-version/matching-version.service';
import { ISession } from '@chd-digital-verbatim-front/feature/entities/session/session.model';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzDividerComponent } from 'ng-zorro-antd/divider';

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
    NzSpinComponent,
    NzDividerComponent,
    RouterLink,
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

  // Navigation
  private returnUrl: string | null = null;

  // Form
  uploadForm: FormGroup;

  constructor() {
    this.uploadForm = this.fb.group({
      verbatimFile: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    const sessionIdentifier = this.route.snapshot.paramMap.get('sessionIdentifier');
    if (sessionIdentifier) {
      this.loadSession(sessionIdentifier);
    }

    // Read return URL from navigation state or query params
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || window.history.state;
    this.returnUrl = state?.returnUrl ?? this.route.snapshot.queryParamMap.get('returnTo') ?? null;
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
    this.validationStatus.set('ready');
    this.currentStep.set(1);
    return false; // Prevent automatic upload
  };

  onStartMatching(): void {
    if (!this.uploadedFile() || this.validationStatus() !== 'ready') {
      return;
    }

    this.isProcessing.set(true);
    this.currentStep.set(3);
    this.processingProgress.set(0);

    const sessionIdentifier = this.session()?.sessionIdentifier;
    const file = this.uploadedFile();

    if (!sessionIdentifier || !file) {
      return;
    }

    const formData = new FormData();
    formData.append('verbatim', file as any);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      const current = this.processingProgress();
      if (current < 90) {
        this.processingProgress.set(current + 10);
      }
    }, 500);

    this.matchingVersionService.startMatching(sessionIdentifier, formData).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.processingProgress.set(100);
        this.isProcessing.set(false);
        this.currentStep.set(4);

        // Navigate to matching editor page
        const matchingVersion = response.body;
        if (matchingVersion) {
          setTimeout(() => {
            this.router.navigate(['/matching/editor', sessionIdentifier, matchingVersion.version]);
          }, 1000);
        }
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
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      // Fallback to session detail or sessions list
      const sessionIdentifier = this.session()?.sessionIdentifier;
      if (sessionIdentifier) {
        this.router.navigate(['/sessions', sessionIdentifier]);
      } else {
        this.router.navigate(['/sessions']);
      }
    }
  }

  onRetry(): void {
    // Reset validation status to allow retry
    this.validationStatus.set('ready');
    this.validationError.set(null);
    this.currentStep.set(1);
  }

  get canStartMatching(): boolean {
    return this.validationStatus() === 'ready' && !this.isProcessing();
  }
}
