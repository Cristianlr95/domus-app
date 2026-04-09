export interface ApiResponse<T> {
  data: T;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details: ApiErrorDetail[];
  timestamp: string;
}
