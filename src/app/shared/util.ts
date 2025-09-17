import { MatchingStatus, VersionStatus } from '@chd-digital-verbatim-front/core/models';
import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from '@chd-digital-verbatim-front/config/input.constants';

export const strToDate = (date?: string | null): dayjs.Dayjs | null | undefined => date ? dayjs(date) : undefined
export const dateToStr = (date?: dayjs.Dayjs | null): string | null => date?.format(DATE_FORMAT) ?? null
export const dateTimeToStr = (date?: dayjs.Dayjs | null): string | null => date?.toJSON() ?? null

export const getStatusColor = (status?: (keyof typeof VersionStatus) | (keyof typeof MatchingStatus) | string | null): string => {
  if (!status) return '';

  // Supports both version-level statuses and item-level matching statuses
  switch (status) {
    // Version statuses
    case 'UPLOADED': return 'purple';
    case 'PROCESSING': return 'blue';
    case 'AWAITING_CORRECTION': return 'orange';
    case 'VALIDATED': return 'green';
    case 'ERROR': return 'red';

    // Item (event) matching statuses
    case 'AUTOMATICALLY_MATCHED': return 'green';
    case 'MANUALLY_MATCHED': return 'blue';
    case 'UNMATCHED': return 'orange';
    case 'MATCHING_CONFLICT': return 'red';

    default: return 'default';
  }
}

