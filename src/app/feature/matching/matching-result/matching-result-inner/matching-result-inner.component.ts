import { Component, Input } from '@angular/core';
import { MatchingResultItemDto, MatchingStatus, SpeakerDto } from '../../../../core/models';
import { SharedZorroModule } from '../../../../shared/shared-zorro.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchingService } from '../../../../core/services/matching.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-matching-result-inner',
  templateUrl: './matching-result-inner.component.html',
  styleUrls: ['./matching-result-inner.component.scss'],
  standalone: true,
  imports: [SharedZorroModule, CommonModule, FormsModule]
})
export class MatchingResultInnerComponent {
  @Input() items: MatchingResultItemDto[] = [];
  @Input() speakers: SpeakerDto[] = [];
  @Input() sessionIdentifier: string = '';
  @Input() version: number = 0;
  selectedSpeaker: SpeakerDto | null = null;

  constructor(private matchingService: MatchingService, private router: Router) {}

  getNzTableRowClass(item: MatchingResultItemDto): string {
    switch (item.status) {
      case MatchingStatus.UNMATCHED:
      case MatchingStatus.MATCHING_CONFLICT:
        return 'table-row-error';
      default:
        return '';
    }
  }

  isUnmatched(item: MatchingResultItemDto): boolean {
    return item.status === MatchingStatus.UNMATCHED || item.status === MatchingStatus.MATCHING_CONFLICT;
  }

  updateMatch(item: MatchingResultItemDto): void {
    if (this.selectedSpeaker) {
      const request = {
        id: item.id,
        version: this.version,
        speakers: [this.selectedSpeaker],
        status: MatchingStatus.MANUALLY_MATCHED
      };
      this.matchingService.updateMatch(this.sessionIdentifier, request)
        .subscribe(result => {
          this.router.navigate(['/matching', result.sessionIdentifier, result.version]);
        });
    }
  }
}
