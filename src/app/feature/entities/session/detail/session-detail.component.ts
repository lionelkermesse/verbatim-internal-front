import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

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
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { NzSpinModule } from 'ng-zorro-antd/spin';
import { SessionService } from '@chd-digital-verbatim-front/feature/entities/session/session.service';
import {
  MatchingVersionService
} from '@chd-digital-verbatim-front/feature/entities/matching-version/matching-version.service';
import { VersionStatus } from '@chd-digital-verbatim-front/core/models';
import {
  IMatchingVersion
} from '@chd-digital-verbatim-front/feature/entities/matching-version/matching-version-chd.model';
import FormatMediumDatetimePipe from '@chd-digital-verbatim-front/shared/pipes/date/format-medium-datetime.pipe';
import FormatMediumDatePipe from '@chd-digital-verbatim-front/shared/pipes/date/format-medium-date.pipe';
import { ISession } from '@chd-digital-verbatim-front/feature/entities/session/session.model';

@Component({
  selector: 'chd-session-detail',
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
    NzBreadCrumbModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzEmptyModule,
    NzDropDownModule,
    NzMenuModule,
    NzSpinModule,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe
  ],
  templateUrl: './session-detail.component.html',
  styleUrls: ['./session-detail.component.scss'],
})
export class SessionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly matchingVersionService = inject(MatchingVersionService);

  // Component state
  readonly session = signal<ISession | null>(null);
  readonly matchingVersions = signal<IMatchingVersion[]>([]);
  readonly isLoadingSession = signal<boolean>(false);
  readonly isLoadingVersions = signal<boolean>(false);

  // Table configuration
  readonly pageSize = 10;
  readonly pageIndex = signal<number>(1);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('id');
    if (sessionId) {
      this.loadSession(sessionId);
      this.loadMatchingVersions(sessionId);
    }
  }

  private loadSession(sessionId: string): void {
    this.isLoadingSession.set(true);

    this.sessionService.find(sessionId).subscribe({
      next: (response) => {
        this.session.set(response.body);
        this.isLoadingSession.set(false);
      },
      error: (error) => {
        console.error('Error loading session:', error);
        this.isLoadingSession.set(false);
      }
    });
  }

  private loadMatchingVersions(sessionIdentifier: string): void {
    this.isLoadingVersions.set(true);

    this.matchingVersionService.findAll(sessionIdentifier).subscribe({
      next: (response) => {
        this.matchingVersions.set(response.body || []);
        this.isLoadingVersions.set(false);
      },
      error: (error) => {
        console.error('Error loading matching versions:', error);
        this.isLoadingVersions.set(false);
      }
    });
  }

  onNewMatching(): void {
    const sessionIdentifier = this.session()?.sessionIdentifier;
    if (sessionIdentifier) {
      this.router.navigate(['/matching/upload', sessionIdentifier]);
    }
  }

  onViewMatching(matchingVersion: IMatchingVersion): void {
    const sessionIdentifier = this.session()?.sessionIdentifier;
    if (sessionIdentifier && matchingVersion.version) {
      this.router.navigate(['/matching/editor', sessionIdentifier, matchingVersion.version]);
    }
  }

  onEditMatching(matchingVersion: IMatchingVersion): void {
    const sessionIdentifier = this.session()?.sessionIdentifier;
    if (sessionIdentifier && matchingVersion.version) {
      this.router.navigate(['/matching/editor', sessionIdentifier, matchingVersion.version, 'edit']);
    }
  }

  onDeleteMatching(matchingVersion: IMatchingVersion): void {
    const sessionIdentifier = this.session()?.sessionIdentifier;
    if (sessionIdentifier && matchingVersion.version) {
      this.matchingVersionService.deleteMatchingVersion(sessionIdentifier, matchingVersion.version).subscribe({
        next: () => {
          // Reload matching versions after successful delete
          this.loadMatchingVersions(sessionIdentifier);
        },
        error: (error) => {
          console.error('Error deleting matching version:', error);
        }
      });
    }
  }

  onExportMatching(matchingVersion: IMatchingVersion): void {
    const sessionIdentifier = this.session()?.sessionIdentifier;
    if (sessionIdentifier && matchingVersion.version) {
      this.matchingVersionService.exportMatching(sessionIdentifier, matchingVersion.version, 'JSON').subscribe({
        next: (blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `matching_${sessionIdentifier}_v${matchingVersion.version}.json`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error exporting matching:', error);
        }
      });
    }
  }

  onBackToSessions(): void {
    this.router.navigate(['/sessions']);
  }

  getStatusColor(status: keyof typeof VersionStatus): string {
    switch (status) {
      case 'UPLOADED': return 'purple';
      case 'PROCESSING': return 'blue';
      case 'AWAITING_CORRECTION': return 'orange';
      case 'VALIDATED': return 'green';
      case 'ERROR': return 'red';
      default: return 'default';
    }
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
  }
}
