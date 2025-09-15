import dayjs from 'dayjs/esm';

export interface ISpeaker {
  id?: number;
  title?: string; // M./Mme
  firstName: string;
  lastName: string;
  function?: string;
  party?: string;
}

export interface IEventNode {
  id: string;
  title: string;
  speakers: ISpeaker[];
  verbatim: string;
  children: IEventNode[];
  parent?: IEventNode;
  level: number;
  expanded?: boolean;
  selected?: boolean;
  isEditing?: boolean;
}

export interface IMatchingTreeData {
  id: number;
  version: number;
  status: string;
  sessionId: string;
  events: IEventNode[];
  lastModified?: dayjs.Dayjs;
  createdBy?: string;
}

export type NewSpeaker = Omit<ISpeaker, 'id'> & { id?: null };
export type NewEventNode = Omit<IEventNode, 'id'> & { id?: string };
