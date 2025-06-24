import { YapiConfig, loadConfig, validateConfig, initializeConfig } from '../src/config.js';

jest.mock('mcp-framework', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('配置模块 (config.ts)', () => {
  // 保存原始环境变量
  const originalEnv = process.env;

  beforeEach(() => {
    // 每个测试前重置环境变量
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // 恢复原始环境变量
    process.env = originalEnv;
  });

  describe('YapiConfig接口', () => {
    test('应该正确定义配置接口', () => {
      const config: YapiConfig = {
        baseUrl: 'http://test.com',
        token: 'test-token'
      };

      expect(config.baseUrl).toBe('http://test.com');
      expect(config.token).toBe('test-token');
    });
  });

  describe('loadConfig函数', () => {
    test('应该成功加载有效配置', () => {
      // 设置测试环境变量
      process.env.YAPI_BASE_URL = 'http://test-yapi.com';
      process.env.YAPI_TOKEN = 'test-token-123';

      const config = loadConfig();

      expect(config.baseUrl).toBe('http://test-yapi.com');
      expect(config.token).toBe('test-token-123');
    });

    test('应该移除URL末尾的斜杠', () => {
      process.env.YAPI_BASE_URL = 'http://test.com/';
      process.env.YAPI_TOKEN = 'token';

      const config = loadConfig();

      expect(config.baseUrl).toBe('http://test.com');
    });

    test('应该在缺少必需环境变量时抛出错误', () => {
      // 不设置任何环境变量
      delete process.env.YAPI_BASE_URL;
      delete process.env.YAPI_TOKEN;

      expect(() => loadConfig()).toThrow('配置验证失败');
    });

    test('应该在URL格式错误时抛出错误', () => {
      process.env.YAPI_BASE_URL = 'invalid-url';
      process.env.YAPI_TOKEN = 'token';

      expect(() => loadConfig()).toThrow('配置验证失败');
    });

    test('应该在超时时间无效时抛出错误', () => {
      process.env.YAPI_BASE_URL = 'http://test.com';
      process.env.YAPI_TOKEN = 'token';
      process.env.YAPI_TIMEOUT = 'invalid';

      expect(() => loadConfig()).toThrow('YAPI_TIMEOUT必须是大于0的数字');
    });
  });

  describe('validateConfig函数', () => {
    test('应该验证有效配置', () => {
      const validConfig: YapiConfig = {
        baseUrl: 'http://test.com',
        token: 'test-token'
      };

      expect(validateConfig(validConfig)).toBe(true);
    });

    test('应该拒绝无效配置', () => {
      const invalidConfigs = [
        { baseUrl: '', token: 'token'},
        { baseUrl: 'http://test.com', token: ''},
        { baseUrl: 'http://test.com', token: 'token'},
      ];

      invalidConfigs.forEach(config => {
        expect(validateConfig(config as YapiConfig)).toBe(false);
      });
    });
  });
}); 