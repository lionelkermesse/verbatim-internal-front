import dayjs from 'dayjs/esm';
import { IMatchingResult, VersionStatus } from '@chd-digital-verbatim-front/core/models';

export interface IMatchingVersion {
  id: number;
  version?: number | null;
  sessionIdentifier?: string | null;
  matchingResult?: IMatchingResult | null;
  status?: keyof typeof VersionStatus | null;
  createdBy?: string | null;
  createdAt?: dayjs.Dayjs | null;
  validatedBy?: string | null;
  validatedAt?: dayjs.Dayjs | null;
}

export type NewMatchingVersion = Omit<IMatchingVersion, 'id'> & { id: null };
