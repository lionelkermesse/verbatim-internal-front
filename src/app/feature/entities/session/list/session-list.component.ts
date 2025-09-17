import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import dayjs from 'dayjs/esm';

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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { SessionService } from '@chd-digital-verbatim-front/feature/entities/session/session.service';
import { StorageService } from '@chd-digital-verbatim-front/shared/services/local-storage';
import FormatMediumDatetimePipe from '@chd-digital-verbatim-front/shared/pipes/date/format-medium-datetime.pipe';
import FormatMediumDatePipe from '@chd-digital-verbatim-front/shared/pipes/date/format-medium-date.pipe';
import { ISession } from '@chd-digital-verbatim-front/feature/entities/session/session.model';
import { DATE_FORMAT } from '@chd-digital-verbatim-front/config/input.constants';
import { getStatusColor } from '@chd-digital-verbatim-front/shared/util';

@Component({
  selector: 'chd-session-list',
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
    NzDatePickerModule,
    FormatMediumDatePipe,
    FormatMediumDatetimePipe,
  ],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss'],
})
export class SessionListComponent implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly DATE_RANGE_STORAGE_KEY = 'session:list:dateRange';

  // Utils
  readonly getStatusColor = getStatusColor;

  // Component state
  readonly sessions = signal<ISession[]>([]);
  readonly filteredSessions = signal<ISession[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly searchTerm = signal<string>('');

  // Date range state
  readonly rangeStart = signal<dayjs.Dayjs | null>(null);
  readonly rangeEnd = signal<dayjs.Dayjs | null>(null);
  dateRangeModel: [Date, Date] | null = null;

  // Server-side pagination state
  readonly total = signal<number>(0);
  readonly pageIndex = signal<number>(1);
  readonly pageSize = signal<number>(10);

  ngOnInit(): void {
    this.initializeDateRangeFromStorageOrDefault();
    this.fetchPage(1);
  }

  private initializeDateRangeFromStorageOrDefault(): void {
    const raw = this.storage.getItem(this.DATE_RANGE_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { start?: string; end?: string };
        if (parsed?.start && parsed?.end) {
          const start = dayjs(parsed.start, DATE_FORMAT);
          const end = dayjs(parsed.end, DATE_FORMAT);
          if (start.isValid() && end.isValid()) {
            this.rangeStart.set(start);
            this.rangeEnd.set(end);
            this.dateRangeModel = [start.toDate(), end.toDate()];
            return;
          }
        }
      } catch {
        // ignore and fall back
      }
    }
    // fallback to last 7 days default
    const end = dayjs();
    const start = end.subtract(6, 'day');
    this.rangeStart.set(start);
    this.rangeEnd.set(end);
    this.dateRangeModel = [start.toDate(), end.toDate()];
  }

  private initializeDefaultDateRange(): void {
    const end = dayjs();
    const start = end.subtract(6, 'day'); // Last 7 days inclusive
    this.rangeStart.set(start);
    this.rangeEnd.set(end);
    this.dateRangeModel = [start.toDate(), end.toDate()];
  }

  private persistDateRange(): void {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    if (start && end) {
      this.storage.setItem(this.DATE_RANGE_STORAGE_KEY, JSON.stringify({
        start: start.format(DATE_FORMAT),
        end: end.format(DATE_FORMAT),
      }));
    }
  }

  private fetchPage(pageIndex: number): void {
    const start = this.rangeStart();
    const end = this.rangeEnd();

    if (!start || !end) {
      return;
    }

    this.isLoading.set(true);

    const params = {
      startDate: start.format(DATE_FORMAT),
      endDate: end.format(DATE_FORMAT),
      page: pageIndex - 1, // Backend expects 0-based
      size: this.pageSize(),
      withMatching: false
    };

    this.sessionService.getByDate(params).subscribe({
      next: (response) => {
        const page = response.body;
        if (page) {
          this.sessions.set(page.content);
          this.filteredSessions.set(page.content);
          this.total.set(page.totalElements);
          this.pageIndex.set(page.number + 1); // UI expects 1-based
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
        this.isLoading.set(false);
      }
    });
  }

  onDateRangeModelChange(dates: [Date, Date] | null): void {
    console.log("onDateRangeModelChange: ", dates);
    if (dates && dates.length === 2) {
      this.rangeStart.set(dayjs(dates[0]));
      this.rangeEnd.set(dayjs(dates[1]));
    } else {
      this.rangeStart.set(null);
      this.rangeEnd.set(null);
    }
  }

  onApplyRange(): void {
    if (this.rangeStart() && this.rangeEnd()) {
      this.persistDateRange();
      this.fetchPage(1);
    }
  }

  onResetRange(): void {
    this.initializeDefaultDateRange();
    this.persistDateRange();
    this.fetchPage(1);
  }

  isRangeValid(): boolean {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    return !!(start && end && !start.isAfter(end));
  }

  onSearch(): void {
    const term = this.searchTerm().toLowerCase();
    const filtered = this.sessions().filter(session =>
      session.sessionIdentifier?.toLowerCase().includes(term) ||
      session.sessionDate?.format('YYYY-MM-DD').includes(term)
    );
    this.filteredSessions.set(filtered);
  }

  onSessionClick(session: ISession): void {
    this.router.navigate(['/sessions', session.sessionIdentifier]);
  }

  onCreateMatching(session: ISession): void {
    this.router.navigate(['/matching/upload', session.sessionIdentifier], {
      state: { returnUrl: this.router.url }
    });
  }

  onPageIndexChange(pageIndex: number): void {
    this.fetchPage(pageIndex);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.fetchPage(1);
  }

}
