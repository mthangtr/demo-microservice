/**
 * Interface định nghĩa cấu trúc response từ microservices
 */
export interface ProxyResponse<T = any> {
  /** HTTP status code */
  status: number;

  /** Response data */
  data: T;

  /** Response headers */
  headers?: any;
}

/**
 * Giúp TypeScript chuyển đổi các kiểu dữ liệu headers Axios
 */
export type SafeHeaders = Record<string, string | string[]>;
