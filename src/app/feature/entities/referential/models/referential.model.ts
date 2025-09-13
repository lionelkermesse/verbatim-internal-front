export interface IReferentialFile {
  id: number;
  name: string;
  versionNumber: number;
  description: string;
  contentType: string;
  size: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  originalFilename: string;
  isActive: boolean;
  rawContent: string;
  rules: IReferentialRules;
}

export interface IReferentialRules {
  correspondences: ICorrespondence[];
  similarityThreshold: number;
}

export interface ICorrespondence {
  verbatim_term: string;
  event_term: string;
  type: 'exact' | 'approximate';
}

// Keep IReferentialContent for backward compatibility
export interface IReferentialContent {
  correspondences: ICorrespondence[];
  similarityThreshold: number;
}

export type NewReferentialFile = Omit<IReferentialFile, 'id'> & { id?: null };
