import { YapiClient, YapiResponse } from '../src/yapi-client';
import { YapiConfig } from '../src/config';

// Mock HTTP工具类
jest.mock('../src/http', () => ({
  createHttpClient: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    addResponseInterceptor: jest.fn()
  }))
}));

import { createHttpClient } from '../src/http';

describe('重构后的YAPI客户端', () => {
  let client: YapiClient;
  let mockConfig: YapiConfig;
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      addResponseInterceptor: jest.fn()
    };

    (createHttpClient as jest.Mock).mockReturnValue(mockHttpClient);

    mockConfig = {
      baseUrl: 'http://test-yapi.com',
      token: 'test-token-123',
      timeout: 5000,
      debug: false
    };
    
    client = new YapiClient(mockConfig);
  });

  describe('初始化', () => {
    test('应该正确初始化HTTP客户端', () => {
      expect(createHttpClient).toHaveBeenCalledWith({
        baseURL: 'http://test-yapi.com',
        timeout: 5000,
        debug: false,
        headers: {
          'User-Agent': 'YAPI-MCP-Client/1.0.0'
        }
      });
    });

    test('应该设置YAPI响应拦截器', () => {
      expect(mockHttpClient.addResponseInterceptor).toHaveBeenCalled();
    });
  });

  describe('GET请求', () => {
    test('应该正确发送GET请求并添加token', async () => {
      const expectedResult = { id: 1, name: 'test' };
      mockHttpClient.get.mockResolvedValueOnce(expectedResult);

      const result = await client.get('/api/test', { param1: 'value1' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/test', {
        token: 'test-token-123',
        param1: 'value1'
      });

      expect(result).toEqual(expectedResult);
    });

    test('应该处理空参数', async () => {
      const expectedResult = { success: true };
      mockHttpClient.get.mockResolvedValueOnce(expectedResult);

      await client.get('/api/test');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/test', {
        token: 'test-token-123'
      });
    });
  });

  describe('POST请求', () => {
    test('应该正确发送JSON POST请求', async () => {
      const expectedResult = { created: true };
      mockHttpClient.post.mockResolvedValueOnce(expectedResult);

      const postData = { name: 'test', value: 123 };
      const result = await client.post('/api/create', postData);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/create', {
        token: 'test-token-123',
        name: 'test',
        value: 123
      }, false);

      expect(result).toEqual(expectedResult);
    });

    test('应该正确发送FormData POST请求', async () => {
      const expectedResult = { uploaded: true };
      mockHttpClient.post.mockResolvedValueOnce(expectedResult);

      const postData = { file: 'content' };
      const result = await client.post('/api/upload', postData, true);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/upload', {
        token: 'test-token-123',
        file: 'content'
      }, true);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('YAPI响应拦截器', () => {
    test('应该处理YAPI成功响应', () => {
      // 获取响应拦截器
      const interceptorCall = mockHttpClient.addResponseInterceptor.mock.calls[0];
      const responseInterceptor = interceptorCall[0];

      const mockResponse = {
        data: {
          errcode: 0,
          errmsg: 'success',
          data: { result: 'test data' }
        },
        status: 200,
        statusText: 'OK',
        headers: {}
      };

      const result = responseInterceptor(mockResponse);
      expect(result).toEqual({ result: 'test data' });
    });

    test('应该处理YAPI错误响应', () => {
      const interceptorCall = mockHttpClient.addResponseInterceptor.mock.calls[0];
      const responseInterceptor = interceptorCall[0];

      const mockResponse = {
        data: {
          errcode: 1001,
          errmsg: 'Token无效',
          data: null
        },
        status: 200,
        statusText: 'OK',
        headers: {}
      };

      expect(() => responseInterceptor(mockResponse)).toThrow('YAPI错误 [1001]: Token无效');
    });
  });

  describe('错误处理', () => {
    test('应该传播HTTP客户端错误', async () => {
      const httpError = new Error('HTTP错误: 404 Not Found');
      mockHttpClient.get.mockRejectedValueOnce(httpError);

      await expect(client.get('/api/notfound')).rejects.toThrow('HTTP错误: 404 Not Found');
    });
  });
}); 