import dayjs from 'dayjs/esm';
import { IMatchingResult, VersionStatus } from '@chd-digital-verbatim-front/core/models';

export interface ISession {
  id: number;
  sessionDate?: dayjs.Dayjs | null;
  sessionIdentifier?: string | null;
  latestVersion?: number | null;
  status?: keyof typeof VersionStatus | null;
  createdBy?: string | null;
  matchingResult?: IMatchingResult;
  lastProcessedAt?: dayjs.Dayjs | null;
}

export type NewSession = Omit<ISession, 'id'> & { id: null };
