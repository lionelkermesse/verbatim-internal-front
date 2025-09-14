import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

// ng-zorro imports
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { MatchingVersionService, IMatchingVersion } from '../../matching-version.service';
import { SessionService } from '../../../session/session.service';
import { VersionStatus } from '@chd-digital-verbatim-front/core/models';
import FormatMediumDatetimePipe from '@chd-digital-verbatim-front/shared/pipes/date/format-medium-datetime.pipe';
import { ISession } from '@chd-digital-verbatim-front/feature/entities/session/session.model';

@Component({
  selector: 'app-matching-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgxChartsModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzDropDownModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzLayoutModule,
    NzListModule,
    NzSpaceModule,
    NzSpinModule,
    NzTagModule,
    NzTypographyModule,
    FormatMediumDatetimePipe,
  ],
  templateUrl: './matching-dashboard.component.html',
  styleUrls: ['./matching-dashboard.component.scss']
})
export class MatchingDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchingVersionService = inject(MatchingVersionService);
  private readonly sessionService = inject(SessionService);

  // Component state
  readonly session = signal<ISession | null>(null);
  readonly matchingVersions = signal<IMatchingVersion[]>([]);
  readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    const sessionIdentifier = this.route.snapshot.paramMap.get('sessionIdentifier');
    if (sessionIdentifier) {
      this.loadSession(sessionIdentifier);
      this.loadMatchingVersions(sessionIdentifier);
    }
  }

  private loadSession(sessionIdentifier: string): void {
    this.sessionService.find(sessionIdentifier).subscribe({
      next: (response) => this.session.set(response.body),
      error: (error) => console.error('Error loading session:', error),
    });
  }

  private loadMatchingVersions(sessionIdentifier: string): void {
    this.isLoading.set(true);
    this.matchingVersionService.findAll(sessionIdentifier).subscribe({
      next: (response) => {
        this.matchingVersions.set(response.body || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading matching versions:', error);
        this.isLoading.set(false);
      },
    });
  }

  onNewMatching(): void {
    const sessionIdentifier = this.session()?.sessionIdentifier;
    if (sessionIdentifier) {
      this.router.navigate(['/matching/upload', sessionIdentifier]);
    }
  }

  onEditMatching(matchingVersion: IMatchingVersion): void {
    const sessionIdentifier = this.session()?.sessionIdentifier;
    if (sessionIdentifier && matchingVersion.version) {
      this.router.navigate(['/matching', sessionIdentifier, matchingVersion.version, 'edit']);
    }
  }

  onDeleteMatching(matchingVersion: IMatchingVersion): void {
    const sessionIdentifier = this.session()?.sessionIdentifier;
    if (sessionIdentifier && matchingVersion.version) {
      this.matchingVersionService.deleteMatchingVersion(sessionIdentifier, matchingVersion.version).subscribe({
        next: () => this.loadMatchingVersions(sessionIdentifier),
        error: (error) => console.error('Error deleting matching version:', error),
      });
    }
  }

  onExportMatching(matchingVersion: IMatchingVersion): void {
    const sessionIdentifier = this.session()?.sessionIdentifier;
    if (sessionIdentifier && matchingVersion.version) {
      this.matchingVersionService.exportMatching(sessionIdentifier, matchingVersion.version, 'JSON').subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `matching_${sessionIdentifier}_v${matchingVersion.version}.json`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => console.error('Error exporting matching:', error),
      });
    }
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

  getChartData(matchingVersion: IMatchingVersion): any[] {
    const result = matchingVersion.matchingResult;
    if (!result) {
      return [];
    }
    return [
      { name: 'Matched', value: result.matched.length },
      { name: 'Unmatched', value: result.unMatched.length },
    ];
  }
}
