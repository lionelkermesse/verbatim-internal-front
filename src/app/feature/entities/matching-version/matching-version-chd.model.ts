import dayjs from 'dayjs/esm';
import {ISession} from '@chd-digital-verbatim-front/feature/entities/session/session-chd.model';
import {VersionStatus} from '@chd-digital-verbatim-front/feature/entities/enumerations/version-status.model';

export interface IMatchingVersion {
  id: number;
  version?: number | null;
  matchingResult?: string | null;
  status?: keyof typeof VersionStatus | null;
  createdBy?: string | null;
  createdDate?: dayjs.Dayjs | null;
  validatedBy?: string | null;
  validatedAt?: dayjs.Dayjs | null;
  session?: Pick<ISession, 'id'> | null;
}

export type NewMatchingVersion = Omit<IMatchingVersion, 'id'> & { id: null };
