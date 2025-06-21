// 导出类型定义
export * from './types.js';

// 导出工厂函数，便于创建HTTP客户端实例
import { IHttpClient, HttpClientConfig } from './types.js';
import { FetchHttpClient } from './FetchHttpClient.js';

/**
 * 创建HTTP客户端实例的工厂函数
 * @param config HTTP客户端配置
 * @returns HTTP客户端实例
 */
export function createHttpClient(config: HttpClientConfig): IHttpClient {
  return new FetchHttpClient(config);
}