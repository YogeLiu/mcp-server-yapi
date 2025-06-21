import fetch from 'node-fetch';
import { logger } from 'mcp-framework';
import { IHttpClient, HttpClientConfig, ResponseInterceptor } from './types.js';
import { log } from 'console';

export class FetchHttpClient implements IHttpClient {
  private config: HttpClientConfig;
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: HttpClientConfig) {
    this.config = { ...config };
  }
  
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private async applyInterceptors(data: any, response: any) {
      let interceptedData = data;
      for (const interceptor of this.responseInterceptors) {
          interceptedData = await interceptor({
              data: interceptedData,
              status: response.status,
              statusText: response.statusText,
              headers: response.headers.raw(),
          });
      }
      return interceptedData;
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.config.baseURL}${path}`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));
    }
    
    try {
      logger.info(`[FetchHttpClient GET] Requesting URL: ${url.toString()}`);
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.config.headers,
        timeout: this.config.timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logger.info(`[FetchHttpClient GET] Response: ${JSON.stringify(data)}`);
      return this.applyInterceptors(data, response);
    } catch (error) {
      throw error;
    }
  }

  async post<T>(path: string, data?: Record<string, any>, isFormData = false): Promise<T> {
    const url = `${this.config.baseURL}${path}`;
    const headers = { ...this.config.headers };

    let body: any;

    if (isFormData) {
      // FormData would require a library like 'form-data' in Node.js
      body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }
    
    try {
      logger.info(`[FetchHttpClient POST] Requesting URL: ${url}`);
      logger.info(`[FetchHttpClient POST] Body: ${JSON.stringify(body)}`);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: body,
        timeout: this.config.timeout,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      logger.info(`[FetchHttpClient POST] Response: ${JSON.stringify(responseData)}`);
      return this.applyInterceptors(responseData, response);
    } catch (error) {
      throw error;
    }
  }
} 