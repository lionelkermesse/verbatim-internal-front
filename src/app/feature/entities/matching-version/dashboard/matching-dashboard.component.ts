import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

import { VersionCardComponent } from './version-card/version-card.component';
import { MatchingVersionService } from '../matching-version.service';
import { MatchingEditorStateService } from '../services/matching-editor-state.service';
import { IMatchingVersion } from '../matching-version-chd.model';
import { VersionCardData, MatchingStats } from '../models/matching-editor.models';

type ViewMode = 'grid' | 'list' | 'compact';
type SortBy = 'version' | 'created' | 'status' | 'progress';
type FilterBy = 'all' | 'draft' | 'validated' | 'error';

@Component({
  selector: 'chd-matching-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    NzLayoutModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzSpinModule,
    NzEmptyModule,
    NzAlertModule,
    NzBreadCrumbModule,
    NzTypographyModule,
    NzSpaceModule,
    NzTagModule,
    NzDropDownModule,
    NzMenuModule,
    NzModalModule,
    NzSwitchModule,
    NzInputModule,
    NzSelectModule,
    NzStatisticModule,
    VersionCardComponent
  ],
  templateUrl: './matching-dashboard.component.html',
  styleUrls: ['./matching-dashboard.component.scss']
})
export class MatchingDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchingVersionService = inject(MatchingVersionService);
  private readonly stateService = inject(MatchingEditorStateService);
  private readonly modal = inject(NzModalService);
  private readonly message = inject(NzMessageService);

  // Component state
  readonly sessionIdentifier = signal<string>('');
  readonly matchingVersions = signal<IMatchingVersion[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // UI state
  readonly viewMode = signal<ViewMode>('grid');
  readonly sortBy = signal<SortBy>('version');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');
  readonly filterBy = signal<FilterBy>('all');
  readonly searchTerm = signal<string>('');
  readonly showAdvancedFilters = signal<boolean>(false);

  // Expose for template access
  get filterByValue() { return this.filterBy(); }
  set filterByValue(value: FilterBy) { this.filterBy.set(value); }

  // Computed properties
  readonly versionCards = computed(() => {
    return this.matchingVersions().map(version => 
      this.stateService.createVersionCardData(version)
    );
  });

  readonly filteredAndSortedCards = computed(() => {
    let cards = this.versionCards();
    
    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      cards = cards.filter(card => 
        card.version.toString().includes(search) ||
        card.status.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    const filter = this.filterBy();
    if (filter !== 'all') {
      cards = cards.filter(card => {
        switch (filter) {
          case 'draft': return ['UPLOADED', 'PROCESSING', 'AWAITING_CORRECTION'].includes(card.status);
          case 'validated': return card.status === 'VALIDATED';
          case 'error': return card.status === 'ERROR';
          default: return true;
        }
      });
    }

    // Apply sorting
    const sortBy = this.sortBy();
    const direction = this.sortDirection();
    
    cards.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'version':
          aValue = a.version;
          bValue = b.version;
          break;
        case 'created':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'progress':
          aValue = a.matchingStats.matchedPercentage;
          bValue = b.matchingStats.matchedPercentage;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return cards;
  });

  readonly totalVersions = computed(() => this.matchingVersions().length);
  readonly filteredCount = computed(() => this.filteredAndSortedCards().length);

  readonly summaryStats = computed(() => {
    const versions = this.matchingVersions();
    const totalVersions = versions.length;
    const validatedCount = versions.filter(v => v.status === 'VALIDATED').length;
    const draftCount = versions.filter(v => ['UPLOADED', 'PROCESSING', 'AWAITING_CORRECTION'].includes(v.status || '')).length;
    const errorCount = versions.filter(v => v.status === 'ERROR').length;

    return {
      total: totalVersions,
      validated: validatedCount,
      draft: draftCount,
      error: errorCount
    };
  });

  readonly gridCols = computed(() => {
    const mode = this.viewMode();
    switch (mode) {
      case 'compact': return { xs: 2, sm: 3, md: 4, lg: 6, xl: 8, xxl: 10 };
      case 'list': return { xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 };
      default: return { xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 };
    }
  });

  ngOnInit(): void {
    const sessionIdentifier = this.route.snapshot.paramMap.get('sessionIdentifier');
    if (sessionIdentifier) {
      this.sessionIdentifier.set(sessionIdentifier);
      this.loadMatchingVersions();
    } else {
      this.router.navigate(['/sessions']);
    }
  }

  private loadMatchingVersions(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.matchingVersionService.findAll(this.sessionIdentifier()).subscribe({
      next: (response: any) => {
        const versions = response.body || [];
        this.matchingVersions.set(versions);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading matching versions:', error);
        this.error.set('Failed to load matching versions. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onCreateNewVersion(): void {
    // Navigate to create new matching version
    this.router.navigate(['/sessions', this.sessionIdentifier(), 'matching', 'new']);
  }

  onViewVersion(event: { sessionIdentifier: string; version: number }): void {
    this.router.navigate(['/sessions', event.sessionIdentifier, 'matching', event.version]);
  }

  onEditVersion(event: { sessionIdentifier: string; version: number }): void {
    this.router.navigate(['/sessions', event.sessionIdentifier, 'matching', event.version, 'edit']);
  }

  onDeleteVersion(event: { sessionIdentifier: string; version: number }): void {
    const version = this.matchingVersions().find(v => v.version === event.version);
    if (!version) return;

    this.modal.confirm({
      nzTitle: 'Delete Matching Version',
      nzContent: `Are you sure you want to delete version ${version.version}? This action cannot be undone.`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.performDeleteVersion(event.sessionIdentifier, event.version);
      }
    });
  }

  onExportVersion(event: { sessionIdentifier: string; version: number }): void {
    const version = this.matchingVersions().find(v => v.version === event.version);
    if (!version) return;

    this.matchingVersionService.exportMatching(event.sessionIdentifier, event.version, 'json').subscribe({
      next: (blob: Blob) => {
        // Handle file download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `matching-version-${event.version}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.message.success(`Version ${event.version} exported successfully`);
      },
      error: (error: any) => {
        console.error('Export error:', error);
        this.message.error('Failed to export version');
      }
    });
  }

  onDuplicateVersion(event: { sessionIdentifier: string; version: number }): void {
    const version = this.matchingVersions().find(v => v.version === event.version);
    if (!version) return;

    // For now, show a message that this feature will be implemented later
    this.message.info('Duplicate functionality will be implemented in a future update');
  }

  private performDeleteVersion(sessionIdentifier: string, version: number): void {
    this.matchingVersionService.deleteMatchingVersion(sessionIdentifier, version).subscribe({
      next: () => {
        this.message.success('Matching version deleted successfully');
        this.loadMatchingVersions(); // Refresh the list
      },
      error: (error: any) => {
        console.error('Delete error:', error);
        this.message.error('Failed to delete matching version');
      }
    });
  }

  trackByVersion(index: number, card: VersionCardData): number {
    return card.id;
  }

  onRefresh(): void {
    this.loadMatchingVersions();
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  onSortChange(sortBy: SortBy): void {
    if (this.sortBy() === sortBy) {
      // Toggle direction if same field
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(sortBy);
      this.sortDirection.set('desc'); // Default to desc for new field
    }
  }

  onFilterChange(filter: FilterBy): void {
    this.filterBy.set(filter);
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.set(!this.showAdvancedFilters());
  }

  onBackToSession(): void {
    this.router.navigate(['/sessions', this.sessionIdentifier()]);
  }

  getFilterCount(filter: FilterBy): number {
    const stats = this.summaryStats();
    switch (filter) {
      case 'draft': return stats.draft;
      case 'validated': return stats.validated;
      case 'error': return stats.error;
      default: return stats.total;
    }
  }

  getSortIcon(field: SortBy): string {
    if (this.sortBy() !== field) return 'swap';
    return this.sortDirection() === 'asc' ? 'sort-ascending' : 'sort-descending';
  }

  getStatusTagColor(status: string): string {
    switch (status) {
      case 'VALIDATED': return 'success';
      case 'ERROR': return 'error';
      case 'PROCESSING': return 'processing';
      case 'AWAITING_CORRECTION': return 'warning';
      default: return 'default';
    }
  }
}
