import { Component, OnInit } from '@angular/core';
import { MatchingResultItemDto, MatchingStatus, MatchingVersionDto, SpeakerDto } from '../../../core/models';
import { SharedZorroModule } from '../../../shared/shared-zorro.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatchingService } from '../../../core/services/matching.service';
import { MatchingResultInnerComponent } from './matching-result-inner/matching-result-inner.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matching-result',
  templateUrl: './matching-result.component.html',
  styleUrls: ['./matching-result.component.scss'],
  standalone: true,
  imports: [SharedZorroModule, CommonModule, MatchingResultInnerComponent, RouterLink, FormsModule]
})
export class MatchingResultComponent implements OnInit {
  matchingResult: MatchingVersionDto | null = null;
  selectedSpeaker: SpeakerDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchingService: MatchingService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const sessionIdentifier = params['sessionIdentifier'];
      const version = params['version'];

      if (sessionIdentifier && version) {
        this.matchingService.getMatchingVersion(sessionIdentifier, +version)
          .subscribe(result => {
            this.matchingResult = result;
          });
      }
    });
  }

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
    if (this.selectedSpeaker && this.matchingResult) {
      const request = {
        id: item.id,
        version: this.matchingResult.version,
        speakers: [this.selectedSpeaker],
        status: MatchingStatus.MANUALLY_MATCHED
      };
      this.matchingService.updateMatch(this.matchingResult.sessionIdentifier, request)
        .subscribe(result => {
          this.router.navigate(['/matching', result.sessionIdentifier, result.version]);
        });
    }
  }

  hasUnmatchedItems(): boolean {
    if (!this.matchingResult) {
      return true;
    }
    return this.matchingResult.matchingResult.unMatched.length > 0;
  }

  validate(): void {
    if (this.matchingResult) {
      this.matchingService.validate(this.matchingResult.sessionIdentifier, this.matchingResult.version)
        .subscribe(result => {
          this.matchingResult = result;
        });
    }
  }
}
