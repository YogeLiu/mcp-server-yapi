import { YapiConfig } from './config.js';
import { IHttpClient, createHttpClient } from './http/index.js';
import { logger } from 'mcp-framework';

/**
 * YAPI API响应接口
 */
export interface YapiResponse<T = any> {
  /** 错误码，0表示成功 */
  errcode: number;
  /** 错误消息 */
  errmsg: string;
  /** 响应数据 */
  data: T;
}

/**
 * YAPI API客户端类
 * 专注于YAPI业务逻辑，HTTP调用委托给通用HTTP工具类
 */
export class YapiClient {
  private config: YapiConfig;
  private httpClient: IHttpClient;
  
  /**
   * 构造函数
   * @param config YAPI配置
   */
  constructor(config: YapiConfig) {
    this.config = config;
    
    // 初始化HTTP客户端
    this.httpClient = createHttpClient({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      debug: config.debug,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    // 设置YAPI特有的拦截器
    this.setupYapiInterceptors();
  }

  /**
   * 设置YAPI特有的拦截器
   * @private
   */
  private setupYapiInterceptors(): void {
    // 响应拦截器：处理YAPI特有的响应格式
    this.httpClient.addResponseInterceptor((response) => {
      const yapiResponse = response.data as YapiResponse;
      
      // 检查YAPI错误码
      if (yapiResponse.errcode !== 0) {
        throw new Error(`YAPI错误 [${yapiResponse.errcode}]: ${yapiResponse.errmsg}`);
      }
      
      // 返回实际数据
      return yapiResponse.data;
    });
  }
  
  /**
   * 发送GET请求
   * @param path API路径
   * @param params 查询参数
   * @returns Promise<T> 响应数据
   */
  async get<T = any>(path: string, params: Record<string, any> = {}): Promise<T> {
    // 添加token到查询参数
    const requestParams = {
      token: this.config.token,
      ...params
    }

    // 过滤掉值为undefined的参数
    const filteredParams = Object.fromEntries(
      Object.entries(requestParams).filter(([_, value]) => value !== undefined)
    );

    return await this.httpClient.get<T>(path, filteredParams);
  }
  
  /**
   * 发送POST请求
   * @param path API路径
   * @param data 请求体数据
   * @param isFormData 是否为表单数据
   * @returns Promise<T> 响应数据
   */
  async post<T = any>(path: string, data: Record<string, any> = {}, isFormData = false): Promise<T> {
    // 添加token到请求数据
    const requestData = {
      token: this.config.token,
      ...data
    };
    return await this.httpClient.post<T>(path, requestData, isFormData);
  }
} 