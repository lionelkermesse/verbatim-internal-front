import dayjs from 'dayjs/esm';

export interface ISession {
  id: number;
  sessionDate?: dayjs.Dayjs | null;
  sessionIdentifier?: string | null;
  verbatimFileContent?: string | null;
  eventFileContent?: string | null;
  createdBy?: string | null;
  createdDate?: dayjs.Dayjs | null;
  lastModifiedBy?: string | null;
  lastModifiedDate?: dayjs.Dayjs | null;
}

export type NewSession = Omit<ISession, 'id'> & { id: null };
