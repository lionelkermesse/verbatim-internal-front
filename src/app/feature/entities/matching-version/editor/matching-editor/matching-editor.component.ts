import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// ng-zorro imports
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { MatchingVersionService, IMatchingVersion } from '../../matching-version.service';
import { MatchingTreeComponent } from '../../tree/matching-tree/matching-tree.component';
import { EventDetailComponent } from '../../event-detail/event-detail/event-detail.component';
import { IMatchingResultItem, UpdateMatchRequest } from '@chd-digital-verbatim-front/core/models';

@Component({
  selector: 'app-matching-editor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzDividerModule,
    NzGridModule,
    NzIconModule,
    NzLayoutModule,
    NzSpaceModule,
    NzSpinModule,
    NzTypographyModule,
    MatchingTreeComponent,
    EventDetailComponent,
  ],
  templateUrl: './matching-editor.component.html',
  styleUrls: ['./matching-editor.component.scss']
})
export class MatchingEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchingVersionService = inject(MatchingVersionService);

  // Component state
  readonly matchingVersion = signal<IMatchingVersion | null>(null);
  readonly selectedEvent = signal<IMatchingResultItem | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  ngOnInit(): void {
    const sessionIdentifier = this.route.snapshot.paramMap.get('sessionIdentifier');
    const version = this.route.snapshot.paramMap.get('version');

    if (sessionIdentifier && version) {
      this.loadMatchingVersion(sessionIdentifier, +version);
    }
  }

  private loadMatchingVersion(sessionIdentifier: string, version: number): void {
    this.isLoading.set(true);
    this.matchingVersionService.getMatchingVersion(sessionIdentifier, version).subscribe({
      next: (response) => {
        this.matchingVersion.set(response.body);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading matching version:', error);
        this.isLoading.set(false);
      },
    });
  }

  onEventSelected(event: IMatchingResultItem): void {
    this.selectedEvent.set(event);
  }

  onEventUpdated(updatedEvent: IMatchingResultItem): void {
    const currentMatchingVersion = this.matchingVersion();
    if (currentMatchingVersion && currentMatchingVersion.matchingResult) {
      const updatedResult = currentMatchingVersion.matchingResult.result.map((item: IMatchingResultItem) => {
        if (item.id === updatedEvent.id) {
          return updatedEvent;
        }
        return item;
      });
      const newMatchingResult = { ...currentMatchingVersion.matchingResult, result: updatedResult };
      this.matchingVersion.set({ ...currentMatchingVersion, matchingResult: newMatchingResult });
    }
  }

  onSaveChanges(): void {
    const matchingVersion = this.matchingVersion();
    const selectedEvent = this.selectedEvent();
    if (matchingVersion && selectedEvent) {
      this.isSaving.set(true);
      const updateRequest: UpdateMatchRequest = {
        id: selectedEvent.id,
        version: matchingVersion.version || 0,
        title: selectedEvent.title,
        verbatim: selectedEvent.verbatim,
        speakers: selectedEvent.speakers,
        status: selectedEvent.status,
      };
      this.matchingVersionService.updateMatching(matchingVersion.sessionIdentifier || '', updateRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          // Optionally, show a success notification
        },
        error: (error) => {
          console.error('Error saving matching version:', error);
          this.isSaving.set(false);
        },
      });
    }
  }

  onValidate(): void {
    const matchingVersion = this.matchingVersion();
    if (matchingVersion) {
      this.isSaving.set(true);
      this.matchingVersionService.validateMatching(matchingVersion.sessionIdentifier || '', matchingVersion.version || 0).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/matching', matchingVersion.sessionIdentifier]);
        },
        error: (error) => {
          console.error('Error validating matching version:', error);
          this.isSaving.set(false);
        },
      });
    }
  }
}
