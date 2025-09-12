
export interface IApiResponse<T> {
  success: boolean;
  code?: string;
  message: string;
  data: T | T[] | null;
  errors?: string[];
  timestamp: string;
}
