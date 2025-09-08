import { VersionStatus } from './matching.model';
import { MatchingResultDto } from './matching.model';

export interface SessionCreateDto {
  sessionIdentifier: string;
}

export interface SessionDto {
  id: number;
  sessionIdentifier: string;
  sessionDate: string;
  status: VersionStatus;
  latestVersion: number;
  matchingResult: MatchingResultDto;
  lastProcessedAt: string;
}
