import { ISpeaker } from './speaker.model';

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

export interface IMatchingResultItem {
  id: number;
  verbatim: string;
  lineNumber: number;
  title: string;
  inners: IMatchingResultItem[];
  speakers: ISpeaker[];
  status: keyof typeof MatchingStatus | null;
  level: number;
  expand: boolean;
  isSelected?: boolean;
}

export interface IMatchingResult {
  result: IMatchingResultItem[];
  speakers: ISpeaker[];
  matched: IMatchingResultItem[];
  unMatched: IMatchingResultItem[];
}

export interface UpdateMatchRequest {
  id: number;
  version: number;
  title?: string;
  verbatim?: string;
  status?: keyof typeof MatchingStatus | null;
  speakers?: ISpeaker[];
}
