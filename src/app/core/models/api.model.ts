
export interface ResultDto<T> {
  success: boolean;
  code?: string;
  message: string;
  data: T;
  errors?: string[];
  timestamp: string;
}
