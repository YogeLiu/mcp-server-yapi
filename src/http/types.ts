/**
 * HTTP请求配置接口
 */
export interface HttpRequestConfig {
  /** 请求URL */
  url: string;
  /** HTTP方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 请求头 */
  headers?: Record<string, string>;
  /** 查询参数 */
  params?: Record<string, any>;
  /** 请求体数据 */
  data?: any;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 是否为FormData */
  isFormData?: boolean;
}

/**
 * HTTP响应接口
 */
export interface HttpResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** HTTP状态码 */
  status: number;
  /** 状态文本 */
  statusText: string;
  /** 响应头 */
  headers: Record<string, string>;
}

/**
 * HTTP错误接口
 */
export interface HttpError extends Error {
  /** 错误类型 */
  type: 'TIMEOUT' | 'NETWORK' | 'HTTP' | 'UNKNOWN';
  /** HTTP状态码（如果有） */
  status?: number;
  /** 响应数据（如果有） */
  response?: any;
}

/**
 * HTTP客户端配置接口
 */
export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, any>;
  debug?: boolean;
}

/**
 * 请求拦截器函数类型
 */
export type RequestInterceptor = (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;

/**
 * 响应拦截器函数类型
 */
export type ResponseInterceptor = (response: any) => any;

/**
 * 错误拦截器函数类型
 */
export type ErrorInterceptor = (error: HttpError) => never | Promise<never>;

/**
 * HTTP客户端接口
 */
export interface IHttpClient {
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
  get<T>(path: string, params?: Record<string, any>): Promise<T>;
  post<T>(path: string, data?: any, isFormData?: boolean): Promise<T>;
} 