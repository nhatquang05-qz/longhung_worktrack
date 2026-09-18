export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface HealthResponse {
  success: boolean;
  status: string;
  timestamp: string;
  database: string;
}