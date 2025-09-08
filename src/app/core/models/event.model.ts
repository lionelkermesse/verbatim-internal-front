import { SpeakerDto } from './speaker.model';
import { VerbatimTextRecord } from './verbatim.model';

export interface EventDto {
  id: number;
  sessionDate: string;
  sessionStart: string;
  sessionEnd: string;
  sessionNumber: number;
  cutStart: string;
  cutEnd: string;
  eventId: number;
  rank: number;
  debutEventMs: number;
  hierarchy: string;
  title: string;
  eventType: string;
  details: EventDto[];
  verbatim: VerbatimTextRecord;
  speaker: SpeakerDto;
}

export interface ParsedEventDto {
  sessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  root: EventDto[];
  orphans: EventDto[];
}
