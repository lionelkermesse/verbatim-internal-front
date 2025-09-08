import { SpeakerDto } from './speaker.model';

export interface VerbatimTextRecord {
  type: string;
  date: string;
  key: string;
  queueId: string;
  title: string;
  text: string;
  lineNumber: number;
  speakers: SpeakerDto[];
}

export interface ParsedVerbatimDto {
  sessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  verbatims: VerbatimTextRecord[];
}
