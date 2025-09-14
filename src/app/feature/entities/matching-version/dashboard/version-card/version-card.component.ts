import { Component, input, output, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { VersionCardData, DonutChartData } from '../../models/matching-editor.models';

@Component({
  selector: 'chd-version-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NzCardModule,
    NzButtonModule,
    NzTagModule,
    NzIconModule,
    NzDropDownModule,
    NzMenuModule,
    NzProgressModule,
    NzStatisticModule,
    NzSpaceModule,
    NzDividerModule,
    NzPopoverModule,
    NzGridModule
  ],
  templateUrl: './version-card.component.html',
  styleUrls: ['./version-card.component.scss']
})
export class VersionCardComponent {
  @ViewChild('cardActions', { static: true }) cardActions!: TemplateRef<any>;

  readonly versionData = input.required<VersionCardData>();
  readonly sessionIdentifier = input.required<string>();
  readonly isCompact = input<boolean>(false);

  // Outputs for actions
  readonly onView = output<{ sessionIdentifier: string; version: number }>();
  readonly onEdit = output<{ sessionIdentifier: string; version: number }>();
  readonly onDelete = output<{ sessionIdentifier: string; version: number }>();
  readonly onExport = output<{ sessionIdentifier: string; version: number }>();
  readonly onDuplicate = output<{ sessionIdentifier: string; version: number }>();

  onViewVersion(): void {
    this.onView.emit({
      sessionIdentifier: this.sessionIdentifier(),
      version: this.versionData().version
    });
  }

  onEditVersion(): void {
    if (this.versionData().canEdit) {
      this.onEdit.emit({
        sessionIdentifier: this.sessionIdentifier(),
        version: this.versionData().version
      });
    }
  }

  onDeleteVersion(): void {
    if (this.versionData().canDelete) {
      this.onDelete.emit({
        sessionIdentifier: this.sessionIdentifier(),
        version: this.versionData().version
      });
    }
  }

  onExportVersion(): void {
    if (this.versionData().canExport) {
      this.onExport.emit({
        sessionIdentifier: this.sessionIdentifier(),
        version: this.versionData().version
      });
    }
  }

  onDuplicateVersion(): void {
    this.onDuplicate.emit({
      sessionIdentifier: this.sessionIdentifier(),
      version: this.versionData().version
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'UPLOADED': return 'purple';
      case 'PROCESSING': return 'blue';
      case 'AWAITING_CORRECTION': return 'orange';
      case 'VALIDATED': return 'green';
      case 'ERROR': return 'red';
      default: return 'default';
    }
  }

  getProgressColor(): string {
    const stats = this.versionData().matchingStats;
    if (stats.conflictPercentage > 10) return '#f5222d'; // red
    if (stats.unmatchedPercentage > 30) return '#fa8c16'; // orange
    if (stats.matchedPercentage > 80) return '#52c41a'; // green
    return '#1890ff'; // blue
  }

  getProgressValue(): number {
    return this.versionData().matchingStats.matchedPercentage;
  }

  getCreatedAtFormatted(): string {
    return this.versionData().createdAt.toLocaleDateString();
  }

  getTimeAgo(): string {
    const now = new Date();
    const created = this.versionData().createdAt;
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  getStatsTooltip(): string {
    const stats = this.versionData().matchingStats;
    return `Matched: ${stats.matchedCount}\nUnmatched: ${stats.unmatchedCount}\nConflicts: ${stats.conflictCount}\nTotal: ${stats.totalEvents}`;
  }
}
