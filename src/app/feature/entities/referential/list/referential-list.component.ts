import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// ng-zorro imports
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { ReferentialService } from '../referential.service';
import { IReferentialFile, IReferentialContent } from '../models/referential.model';
import { AlertService } from '@chd-digital-verbatim-front/core/util/alert.service';

@Component({
  selector: 'chd-referential-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NzTableModule,
    NzButtonModule,
    NzCardModule,
    NzTagModule,
    NzSpaceModule,
    NzIconModule,
    NzTypographyModule,
    NzGridModule,
    NzLayoutModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzAlertModule,
    NzSpinModule,
    NzDropDownModule,
    NzMenuModule,
    NzModalModule,
    NzTabsModule,
  ],
  templateUrl: './referential-list.component.html',
  styleUrls: ['./referential-list.component.scss'],
})
export class ReferentialListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly referentialService = inject(ReferentialService);
  private readonly modalService = inject(NzModalService);
  private readonly alertService = inject(AlertService);
  private readonly translate = inject(TranslateService);

  // Component state
  readonly currentReferential = signal<IReferentialFile | null>(null);
  readonly allFiles = signal<IReferentialFile[]>([]);
  readonly currentContent = signal<IReferentialContent | null>(null);
  readonly isLoadingCurrent = signal<boolean>(false);
  readonly isLoadingFiles = signal<boolean>(false);
  readonly isLoadingContent = signal<boolean>(false);
  readonly showRawContent = signal<boolean>(false);
  readonly previewModalVisible = signal<boolean>(false);
  readonly previewFile = signal<IReferentialFile | null>(null);
  readonly selectedTabIndex = signal<number>(0);
  readonly isSettingDefault = signal<number | null>(null);

  ngOnInit(): void {
    this.loadCurrentReferential();
    this.loadAllFiles();
  }

  private loadCurrentReferential(): void {
    this.isLoadingCurrent.set(true);

    this.referentialService.getCurrentReferential().subscribe({
      next: (response) => {
        const referentialFile = response.body;
        if (referentialFile) {
          this.currentReferential.set(referentialFile);
          // Set content from rules property
          const content: IReferentialContent = {
            correspondences: referentialFile.rules?.correspondences || [],
            similarityThreshold: referentialFile.rules?.similarityThreshold || 0
          };
          this.currentContent.set(content);
        }
        this.isLoadingCurrent.set(false);
      },
      error: (error) => {
        console.error('Error loading current referential:', error);
        this.isLoadingCurrent.set(false);
      }
    });
  }

  private loadAllFiles(): void {
    this.isLoadingFiles.set(true);

    this.referentialService.getAllFiles().subscribe({
      next: (response) => {
        this.allFiles.set(response.body || []);
        this.isLoadingFiles.set(false);
      },
      error: (error) => {
        console.error('Error loading referential files:', error);
        this.isLoadingFiles.set(false);
      }
    });
  }

  onUploadNew(): void {
    this.router.navigate(['/referential/upload']);
  }

  onDownloadFile(file: IReferentialFile): void {
    this.referentialService.downloadFile(file.id).subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalFilename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
      }
    });
  }

  onSetDefaultFile(file: IReferentialFile): void {
    this.isSettingDefault.set(file.id);

    this.referentialService.setDefault(file.id).subscribe({
      next: () => {
        // Reload both lists to ensure current content is refreshed
        this.loadCurrentReferential();
        this.loadAllFiles();
        this.alertService.addAlert({
          type: 'success',
          translationKey: 'referential.actions.setDefaultSuccess',
        });
        this.isSettingDefault.set(null);
      },
      error: (error) => {
        console.error('Error setting file as default:', error);
        this.alertService.addAlert({
          type: 'danger',
          translationKey: 'referential.actions.setDefaultError',
        });
        this.isSettingDefault.set(null);
      }
    });
  }

  onDeleteFile(file: IReferentialFile): void {
    // Guard: Prevent deletion of active referential
    if (file.isActive) {
      this.alertService.addAlert({
        type: 'warning',
        translationKey: 'referential.actions.cannotDeleteActive',
      });
      return;
    }

    // Confirmation modal
    this.modalService.confirm({
      nzTitle: this.translate.instant('referential.confirm.deleteTitle'),
      nzContent: this.translate.instant('referential.confirm.deleteContent'),
      nzOkText: this.translate.instant('entity.action.delete'),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.confirmDeleteFile(file),
      nzCancelText: this.translate.instant('entity.action.cancel')
    });
  }

  private confirmDeleteFile(file: IReferentialFile): void {
    this.referentialService.deleteFile(file.id).subscribe({
      next: () => {
        // Reload files after deletion
        this.loadAllFiles();
        // If deleted file was current, reload current
        if (this.currentReferential()?.id === file.id) {
          this.loadCurrentReferential();
        }
        this.alertService.addAlert({
          type: 'success',
          translationKey: 'entity.action.deleted',
        });
      },
      error: (error) => {
        console.error('Error deleting file:', error);
        this.alertService.addAlert({
          type: 'danger',
          translationKey: 'error.http.500',
        });
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleRawContent(): void {
    this.showRawContent.set(!this.showRawContent());
  }

  onPreviewRawContent(file: IReferentialFile): void {
    this.previewFile.set(file);
    this.previewModalVisible.set(true);
  }

  closePreviewModal(): void {
    this.previewModalVisible.set(false);
    this.previewFile.set(null);
  }

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
  }
}
