import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';
import GetInterface from '../../src/tools/GetInterface.js';
import { YapiClient } from '../../src/yapi-client.js';
import { YapiService } from '../../src/services/yapi-service.js';

// Mock依赖
jest.mock('../../src/yapi-client.js');
jest.mock('../../src/services/yapi-service.js');
jest.mock('../../src/config.js', () => ({
  loadConfig: jest.fn(() => ({
    baseUrl: 'http://test.yapi.com',
    token: 'test-token'
  }))
}));

/**
 * GetInterface工具测试
 * 这是最重要的YAPI工具之一，用于获取完整的接口数据
 */
describe('GetInterface工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('成功场景', () => {
    test('应该成功获取接口信息', async () => {
      // 设置Mock响应
      mockYapiClient.setMockResponse('/api/interface/get', MockResponses.interfaceInfo);

      // 模拟工具调用
      const result = await mockYapiClient.get('/api/interface/get', { id: 1 });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.errmsg).toBe('success');
      expect(result.data._id).toBe(1);
      expect(result.data.title).toBe('Test API');
      expect(result.data.path).toBe('/test');
      expect(result.data.method).toBe('GET');

      // 验证调用历史
      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory).toHaveLength(1);
      expect(callHistory[0]?.method).toBe('GET');
      expect(callHistory[0]?.url).toContain('/api/interface/get');
      expect(callHistory[0]?.url).toContain('id=1');
    });

    test('应该包含完整的接口数据结构', async () => {
      mockYapiClient.setMockResponse('/api/interface/get', MockResponses.interfaceInfo);

      const result = await mockYapiClient.get('/api/interface/get', { id: 1 });
      const interfaceData = result.data;

      // 验证基本信息
      expect(interfaceData).toHaveProperty('_id');
      expect(interfaceData).toHaveProperty('title');
      expect(interfaceData).toHaveProperty('path');
      expect(interfaceData).toHaveProperty('method');
      expect(interfaceData).toHaveProperty('project_id');
      expect(interfaceData).toHaveProperty('catid');
      expect(interfaceData).toHaveProperty('status');
      expect(interfaceData).toHaveProperty('desc');

      // 验证请求参数结构
      expect(interfaceData).toHaveProperty('req_params');
      expect(interfaceData).toHaveProperty('req_query');
      expect(interfaceData).toHaveProperty('req_headers');
      expect(interfaceData).toHaveProperty('req_body_type');

      // 验证响应结构
      expect(interfaceData).toHaveProperty('res_body_type');
      expect(interfaceData).toHaveProperty('res_body');

      // 验证时间戳
      expect(interfaceData).toHaveProperty('add_time');
      expect(interfaceData).toHaveProperty('up_time');
    });
  });

  describe('错误处理', () => {
    test('应该处理接口不存在的情况', async () => {
      const errorResponse = {
        errcode: 40022,
        errmsg: '接口不存在'
      };
      mockYapiClient.setMockResponse('/api/interface/get', errorResponse);

      const result = await mockYapiClient.get('/api/interface/get', { id: 999 });

      expect(result.errcode).toBe(40022);
      expect(result.errmsg).toBe('接口不存在');
    });

    test('应该处理权限不足的情况', async () => {
      const errorResponse = {
        errcode: 40011,
        errmsg: '没有权限'
      };
      mockYapiClient.setMockResponse('/api/interface/get', errorResponse);

      const result = await mockYapiClient.get('/api/interface/get', { id: 1 });

      expect(result.errcode).toBe(40011);
      expect(result.errmsg).toBe('没有权限');
    });

    test('应该处理参数缺失的情况', async () => {
      const errorResponse = {
        errcode: 400,
        errmsg: '缺少参数id'
      };
      mockYapiClient.setMockResponse('/api/interface/get', errorResponse);

      const result = await mockYapiClient.get('/api/interface/get', {});

      expect(result.errcode).toBe(400);
      expect(result.errmsg).toBe('缺少参数id');
    });
  });

  describe('参数验证', () => {
    test('应该正确传递id参数', async () => {
      mockYapiClient.setMockResponse('/api/interface/get', MockResponses.interfaceInfo);

      await mockYapiClient.get('/api/interface/get', { id: 123 });

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.url).toContain('id=123');
    });

    test('应该正确传递token参数', async () => {
      mockYapiClient.setMockResponse('/api/interface/get', MockResponses.interfaceInfo);

      await mockYapiClient.get('/api/interface/get', { 
        id: 1, 
        token: 'test-token' 
      });

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.url).toContain('token=test-token');
    });

    test('应该过滤undefined和null参数', async () => {
      mockYapiClient.setMockResponse('/api/interface/get', MockResponses.interfaceInfo);

      await mockYapiClient.get('/api/interface/get', { 
        id: 1,
        undefined_param: undefined,
        null_param: null,
        empty_string: ''
      });

      const callHistory = mockYapiClient.getCallHistory();
      const url = callHistory[0]?.url;
      
      expect(url).toContain('id=1');
      expect(url).not.toContain('undefined_param');
      expect(url).not.toContain('null_param');
      expect(url).toContain('empty_string='); // 空字符串应该保留
    });
  });

  describe('数据格式验证', () => {
    test('应该正确解析JSON响应体', async () => {
      const interfaceWithJsonBody = {
        ...MockResponses.interfaceInfo,
        data: {
          ...MockResponses.interfaceInfo.data,
          res_body: JSON.stringify({
            code: 0,
            message: 'success',
            data: {
              list: [],
              total: 0
            }
          })
        }
      };

      mockYapiClient.setMockResponse('/api/interface/get', interfaceWithJsonBody);

      const result = await mockYapiClient.get('/api/interface/get', { id: 1 });
      const resBody = JSON.parse(result.data.res_body);

      expect(resBody).toHaveProperty('code');
      expect(resBody).toHaveProperty('message');
      expect(resBody).toHaveProperty('data');
      expect(resBody.data).toHaveProperty('list');
      expect(resBody.data).toHaveProperty('total');
    });

    test('应该处理不同的HTTP方法', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of methods) {
        const interfaceData = {
          ...MockResponses.interfaceInfo,
          data: {
            ...MockResponses.interfaceInfo.data,
            method: method
          }
        };

        mockYapiClient.setMockResponse('/api/interface/get', interfaceData);
        const result = await mockYapiClient.get('/api/interface/get', { id: 1 });
        
        expect(result.data.method).toBe(method);
        mockYapiClient.clearCallHistory();
      }
    });

    test('应该处理不同的接口状态', async () => {
      const statuses = ['undone', 'done', 'deprecated'];
      
      for (const status of statuses) {
        const interfaceData = {
          ...MockResponses.interfaceInfo,
          data: {
            ...MockResponses.interfaceInfo.data,
            status: status
          }
        };

        mockYapiClient.setMockResponse('/api/interface/get', interfaceData);
        const result = await mockYapiClient.get('/api/interface/get', { id: 1 });
        
        expect(result.data.status).toBe(status);
        mockYapiClient.clearCallHistory();
      }
    });
  });
});

/**
 * GetInterface MCPTool 测试
 * 测试获取YAPI接口详情的MCP工具
 */
describe('GetInterface MCPTool', () => {
  let getInterfaceTool: GetInterface;
  let mockYapiService: jest.Mocked<YapiService>;

  beforeEach(() => {
    jest.clearAllMocks();
    getInterfaceTool = new GetInterface();
    mockYapiService = {
      getInterface: jest.fn()
    } as any;
    (YapiService as jest.MockedClass<typeof YapiService>).mockImplementation(() => mockYapiService);
  });

  describe('MCPTool基本属性', () => {
    test('应该有正确的工具名称', () => {
      expect(getInterfaceTool.name).toBe('get_interface');
    });

    test('应该有正确的描述', () => {
      expect(getInterfaceTool.description).toContain('获取指定YAPI接口的完整详细信息');
      expect(getInterfaceTool.description).toContain('⚡ 使用说明');
      expect(getInterfaceTool.description).toContain('API详情：GET /api/interface/get');
      expect(getInterfaceTool.description).toContain('真实验证：已通过真实API测试');
    });

    test('应该有正确的schema', () => {
      expect(getInterfaceTool.schema).toBeDefined();
      
      const validInput = { id: 1 };
      const result = getInterfaceTool.schema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      const invalidInput = { id: -1 };
      const invalidResult = getInterfaceTool.schema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('execute方法测试', () => {
    test('应该成功获取接口详情', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 1,
          title: 'Get User Info',
          path: '/api/user/info',
          method: 'GET' as any,
          project_id: 1,
          catid: 1,
          status: 'done' as any,
          desc: 'Get user information by ID',
          uid: 100,
          add_time: 1640995200,
          up_time: 1640995300,
          req_params: [
            { name: 'id', desc: 'User ID', required: '1' as '1' }
          ],
          req_query: [
            { name: 'format', desc: 'Response format', required: '0' as '0' }
          ],
          req_headers: [
            { name: 'Authorization', value: 'Bearer token', desc: 'Auth token', required: '1' as '1' }
          ],
          req_body_type: 'none' as any,
          res_body_type: 'json' as any,
          res_body: '{"code":0,"data":{"id":1,"name":"John"}}'
        }
      };
      mockYapiService.getInterface.mockResolvedValue(mockResponse);

      const result = await getInterfaceTool.execute({ id: 1 });

      expect(result).toContain('✅ 接口详情获取成功');
      expect(result).toContain('📝 接口名称: Get User Info');
      expect(result).toContain('🔗 接口路径: /api/user/info');
      expect(result).toContain('📡 请求方法: GET');
      expect(result).toContain('📊 接口状态: done');
      expect(result).toContain('📄 描述: Get user information by ID');
      expect(mockYapiService.getInterface).toHaveBeenCalledWith({ id: 1 });
    });

    test('应该处理接口不存在错误', async () => {
      const mockResponse = {
        errcode: 40022,
        errmsg: '接口不存在',
        data: {} as any
      };
      mockYapiService.getInterface.mockResolvedValue(mockResponse);

      const result = await getInterfaceTool.execute({ id: 999 });

      expect(result).toBe('❌ 获取接口详情失败: 接口不存在');
    });

    test('应该处理权限不足错误', async () => {
      const mockResponse = {
        errcode: 40011,
        errmsg: '没有权限',
        data: {} as any
      };
      mockYapiService.getInterface.mockResolvedValue(mockResponse);

      const result = await getInterfaceTool.execute({ id: 1 });

      expect(result).toBe('❌ 获取接口详情失败: 没有权限');
    });

    test('应该处理网络异常', async () => {
      const error = new Error('Network timeout');
      mockYapiService.getInterface.mockRejectedValue(error);

      const result = await getInterfaceTool.execute({ id: 1 });

      expect(result).toBe('❌ 获取接口详情时发生错误: Network timeout');
    });
  });

  describe('参数验证', () => {
    test('应该要求正整数ID', () => {
      const schema = getInterfaceTool.schema;
      
      expect(schema.safeParse({ id: 1 }).success).toBe(true);
      expect(schema.safeParse({ id: 100 }).success).toBe(true);
      expect(schema.safeParse({ id: 0 }).success).toBe(false);
      expect(schema.safeParse({ id: -1 }).success).toBe(false);
      expect(schema.safeParse({}).success).toBe(false);
    });
  });

  describe('复杂接口数据处理', () => {
    test('应该正确显示复杂接口信息', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 2,
          title: 'Create User',
          path: '/api/user/create',
          method: 'POST' as any,
          project_id: 1,
          catid: 2,
          status: 'undone' as any,
          desc: 'Create a new user account',
          uid: 101,
          add_time: 1640995400,
          up_time: 1640995500,
          req_params: [],
          req_query: [],
          req_headers: [
            { name: 'Content-Type', value: 'application/json', desc: 'Content type', required: '1' as '1' }
          ],
          req_body_type: 'json' as any,
          req_body_other: '{"name":"string","email":"string","password":"string"}',
          res_body_type: 'json' as any,
          res_body: '{"code":0,"message":"success","data":{"id":1,"name":"John","email":"john@example.com"}}'
        }
      };
      mockYapiService.getInterface.mockResolvedValue(mockResponse);

      const result = await getInterfaceTool.execute({ id: 2 });

      expect(result).toContain('✅ 接口详情获取成功');
      expect(result).toContain('📝 接口名称: Create User');
      expect(result).toContain('🔗 接口路径: /api/user/create');
      expect(result).toContain('📡 请求方法: POST');
      expect(result).toContain('📊 接口状态: undone');
      expect(result).toContain('📄 描述: Create a new user account');
    });
  });
}); 