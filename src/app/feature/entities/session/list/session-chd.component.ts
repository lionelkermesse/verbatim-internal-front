import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ISession } from '@chd-digital-verbatim-front/feature/entities/session/session-chd.model';
import { VersionStatus } from '@chd-digital-verbatim-front/core/models';
import { SessionService } from '@chd-digital-verbatim-front/feature/entities/session/session.service';
import dayjs from 'dayjs/esm';
import FormatMediumDatetimePipe from '../../../../shared/pipes/date/format-medium-datetime.pipe';
import FormatMediumDatePipe from '../../../../shared/pipes/date/format-medium-date.pipe';

@Component({
  selector: 'chd-session',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzCardModule,
    NzTagModule,
    NzSpaceModule,
    NzIconModule,
    NzTypographyModule,
    NzGridModule,
    NzLayoutModule,
    NzEmptyModule,
    FormatMediumDatePipe,
    FormatMediumDatetimePipe,
  ],
  templateUrl: './session-chd.component.html',
  styleUrls: ['./session-chd.component.scss'],
})
export class SessionChdComponent implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  // Component state
  readonly sessions = signal<ISession[]>([]);
  readonly filteredSessions = signal<ISession[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly searchTerm = signal<string>('');

  // Table configuration
  readonly pageSize = 10;
  readonly pageIndex = signal<number>(1);

  ngOnInit(): void {
    this.loadSessions();
  }

  private loadSessions(): void {
    this.isLoading.set(true);

    this.sessionService.query().subscribe({
      next: (response) => {
        const sessions = response.body || [];
        this.sessions.set(sessions);
        this.filteredSessions.set(sessions);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm().toLowerCase();
    const filtered = this.sessions().filter(session =>
      session.sessionIdentifier?.toLowerCase().includes(term) ||
      session.sessionDate?.format('YYYY-MM-DD').includes(term)
    );
    this.filteredSessions.set(filtered);
    this.pageIndex.set(1); // Reset to first page
  }

  onSessionClick(session: ISession): void {
    this.router.navigate(['/session', session.sessionIdentifier]);
  }

  getStatusColor(status?: keyof typeof VersionStatus | null): string {
    if (!status) return '';

    switch (status) {
      case 'UPLOADED': return 'purple';
      case 'PROCESSING': return 'blue';
      case 'AWAITING_CORRECTION': return 'orange';
      case 'VALIDATED': return 'green';
      case 'ERROR': return 'red';
      default: return 'brown';
    }
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
  }
}
