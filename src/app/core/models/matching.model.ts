import { SpeakerDto } from './speaker.model';

export enum MatchingStatus {
  AUTOMATICALLY_MATCHED = 'AUTOMATICALLY_MATCHED',
  MANUALLY_MATCHED = 'MANUALLY_MATCHED',
  UNMATCHED = 'UNMATCHED',
  MATCHING_CONFLICT = 'MATCHING_CONFLICT',
}

export enum VersionStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  AWAITING_CORRECTION = 'AWAITING_CORRECTION',
  VALIDATED = 'VALIDATED',
  ERROR = 'ERROR',
}

export interface MatchingResultItemDto {
  id: number;
  verbatim: string;
  lineNumber: number;
  title: string;
  inners: MatchingResultItemDto[];
  speakers: SpeakerDto[];
  status: MatchingStatus;
  level: number;
  expand: boolean;
}

export interface MatchingResultDto {
  result: MatchingResultItemDto[];
  speakers: SpeakerDto[];
  matched: MatchingResultItemDto[];
  unMatched: MatchingResultItemDto[];
}

export interface MatchingVersionDto {
  id: number;
  sessionIdentifier: string;
  version: number;
  matchingResult: MatchingResultDto;
  status: VersionStatus;
  createdBy: string;
  createdAt: string;
  validatedBy: string;
  validatedAt: string;
}

export interface UpdateMatchRequest {
  id: number;
  version: number;
  title?: string;
  verbatim?: string;
  status?: MatchingStatus;
  speakers?: SpeakerDto[];
}
