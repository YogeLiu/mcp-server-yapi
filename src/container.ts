import 'reflect-metadata';
import { container } from 'tsyringe';
import { YapiConfig } from './config.js';
import { IHttpClient } from './http/types.js';
import { createHttpClient } from './http/index.js';
import { YapiClient } from './yapi-client.js';

/**
 * 依赖注入容器配置
 * 管理所有依赖关系
 */
export class Container {
  private static initialized = false;

  /**
   * 初始化依赖注入容器
   */
  static initialize(config: YapiConfig): void {
    if (this.initialized) {
      return;
    }

    // 注册配置
    container.registerInstance<YapiConfig>('YapiConfig', config);

    // 注册HTTP客户端
    container.register<IHttpClient>('IHttpClient', {
      useFactory: () => createHttpClient({
        baseURL: config.baseUrl,
        timeout: config.timeout,
        debug: config.debug,
        headers: {
          'User-Agent': 'YAPI-MCP-Client/1.0.0'
        }
      })
    });

    // 注册YAPI客户端
    container.register<YapiClient>('YapiClient', {
      useFactory: (c) => {
        const httpClient = c.resolve<IHttpClient>('IHttpClient');
        const yapiConfig = c.resolve<YapiConfig>('YapiConfig');
        return new YapiClient(yapiConfig);
      }
    });

    this.initialized = true;
  }

  /**
   * 解析依赖
   */
  static resolve<T>(token: string): T {
    return container.resolve<T>(token);
  }

  /**
   * 重置容器（用于测试）
   */
  static reset(): void {
    container.clearInstances();
    this.initialized = false;
  }
} 