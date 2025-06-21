import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';
import ListInterfaces from '../../src/tools/ListInterfaces.js';
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
 * ListInterfaces工具测试
 * 用于获取接口列表，支持分页
 */
describe('ListInterfaces工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('成功场景', () => {
    test('应该成功获取接口列表', async () => {
      mockYapiClient.setMockResponse('/api/interface/list', MockResponses.interfaceList);

      const result = await mockYapiClient.get('/api/interface/list', { 
        project_id: 1,
        page: 1,
        limit: 20
      });

      expect(result.errcode).toBe(0);
      expect(result.errmsg).toBe('success');
      expect(result.data).toHaveProperty('total');
      expect(result.data).toHaveProperty('list');
      expect(Array.isArray(result.data.list)).toBe(true);
    });

    test('应该包含分页信息', async () => {
      const paginatedResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 50,
          list: Array.from({ length: 20 }, (_, i) => ({
            _id: i + 1,
            title: `Test API ${i + 1}`,
            path: `/test/${i + 1}`,
            method: 'GET',
            status: 'done',
            add_time: 1640995200
          }))
        }
      };

      mockYapiClient.setMockResponse('/api/interface/list', paginatedResponse);

      const result = await mockYapiClient.get('/api/interface/list', {
        project_id: 1,
        page: 1,
        limit: 20
      });

      expect(result.data.total).toBe(50);
      expect(result.data.list).toHaveLength(20);
    });

    test('应该支持不同的分页参数', async () => {
      mockYapiClient.setMockResponse('/api/interface/list', MockResponses.interfaceList);

      await mockYapiClient.get('/api/interface/list', {
        project_id: 1,
        page: 2,
        limit: 10
      });

      const callHistory = mockYapiClient.getCallHistory();
      const url = callHistory[0]?.url;
      
      expect(url).toContain('page=2');
      expect(url).toContain('limit=10');
    });
  });

  describe('错误处理', () => {
    test('应该处理项目不存在的情况', async () => {
      const errorResponse = {
        errcode: 40021,
        errmsg: '项目不存在'
      };
      mockYapiClient.setMockResponse('/api/interface/list', errorResponse);

      const result = await mockYapiClient.get('/api/interface/list', { project_id: 999 });

      expect(result.errcode).toBe(40021);
      expect(result.errmsg).toBe('项目不存在');
    });

    test('应该处理权限不足的情况', async () => {
      const errorResponse = {
        errcode: 40011,
        errmsg: '没有权限'
      };
      mockYapiClient.setMockResponse('/api/interface/list', errorResponse);

      const result = await mockYapiClient.get('/api/interface/list', { project_id: 1 });

      expect(result.errcode).toBe(40011);
      expect(result.errmsg).toBe('没有权限');
    });
  });

  describe('参数验证', () => {
    test('应该正确传递必需参数', async () => {
      mockYapiClient.setMockResponse('/api/interface/list', MockResponses.interfaceList);

      await mockYapiClient.get('/api/interface/list', {
        project_id: 123,
        page: 1,
        limit: 20
      });

      const callHistory = mockYapiClient.getCallHistory();
      const url = callHistory[0]?.url;
      
      expect(url).toContain('project_id=123');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=20');
    });

    test('应该支持可选的分类过滤参数', async () => {
      mockYapiClient.setMockResponse('/api/interface/list', MockResponses.interfaceList);

      await mockYapiClient.get('/api/interface/list', {
        project_id: 1,
        catid: 5,
        page: 1,
        limit: 20
      });

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.url).toContain('catid=5');
    });
  });

  describe('数据格式验证', () => {
    test('接口列表项应该包含必要字段', async () => {
      mockYapiClient.setMockResponse('/api/interface/list', MockResponses.interfaceList);

      const result = await mockYapiClient.get('/api/interface/list', { project_id: 1 });
      const firstInterface = result.data.list[0];

      expect(firstInterface).toHaveProperty('_id');
      expect(firstInterface).toHaveProperty('title');
      expect(firstInterface).toHaveProperty('path');
      expect(firstInterface).toHaveProperty('method');
      expect(firstInterface).toHaveProperty('status');
      expect(firstInterface).toHaveProperty('add_time');
    });

    test('应该处理空列表的情况', async () => {
      const emptyResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 0,
          list: []
        }
      };

      mockYapiClient.setMockResponse('/api/interface/list', emptyResponse);

      const result = await mockYapiClient.get('/api/interface/list', { project_id: 1 });

      expect(result.data.total).toBe(0);
      expect(result.data.list).toHaveLength(0);
    });
  });
});

/**
 * ListInterfaces MCPTool 测试
 * 测试获取YAPI接口列表的MCP工具
 */
describe('ListInterfaces MCPTool', () => {
  let listInterfacesTool: ListInterfaces;
  let mockYapiService: jest.Mocked<YapiService>;

  beforeEach(() => {
    jest.clearAllMocks();
    listInterfacesTool = new ListInterfaces();
    mockYapiService = {
      listInterfaces: jest.fn()
    } as any;
    (YapiService as jest.MockedClass<typeof YapiService>).mockImplementation(() => mockYapiService);
  });

  describe('MCPTool基本属性', () => {
    test('应该有正确的工具名称', () => {
      expect(listInterfacesTool.name).toBe('list_interfaces');
    });

    test('应该有正确的描述', () => {
      expect(listInterfacesTool.description).toContain('获取YAPI项目的接口列表，支持分页和过滤查询');
      expect(listInterfacesTool.description).toContain('⚡ 使用说明');
      expect(listInterfacesTool.description).toContain('API详情：GET /api/interface/list');
      expect(listInterfacesTool.description).toContain('已调用真实API');
    });

    test('应该有正确的schema', () => {
      expect(listInterfacesTool.schema).toBeDefined();
      
      const validInput = { project_id: 1, page: 1, limit: 20 };
      const result = listInterfacesTool.schema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      const invalidInput = { project_id: -1 };
      const invalidResult = listInterfacesTool.schema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('execute方法测试', () => {
    test('应该成功获取接口列表', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 25,
          list: [
            {
              _id: 1,
              title: 'Get User List',
              path: '/api/users',
              method: 'GET' as any,
              catid: 1,
              status: 'done' as any,
              add_time: 1640995200,
              up_time: 1640995200
            },
            {
              _id: 2,
              title: 'Create User',
              path: '/api/users',
              method: 'POST' as any,
              catid: 1,
              status: 'undone' as any,
              add_time: 1640995300,
              up_time: 1640995300
            }
          ]
        }
      };
      mockYapiService.listInterfaces.mockResolvedValue(mockResponse);

      const result = await listInterfacesTool.execute({
        project_id: 1,
        page: 1,
        limit: 20
      });

      expect(result).toContain('✅ 成功获取接口列表');
      expect(result).toContain('总接口数：25个');
      expect(result).toContain('当前页码：第1页');
      expect(result).toContain('🔗 Get User List');
      expect(result).toContain('[GET] /api/users');
      expect(result).toContain('🔗 Create User');
      expect(result).toContain('[POST] /api/users');
      expect(mockYapiService.listInterfaces).toHaveBeenCalledWith({
        project_id: 1,
        page: 1,
        limit: 20
      });
    });

    test('应该处理空接口列表', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 0,
          list: []
        }
      };
      mockYapiService.listInterfaces.mockResolvedValue(mockResponse);

      const result = await listInterfacesTool.execute({
        project_id: 1,
        page: 1,
        limit: 20
      });

      expect(result).toContain('✅ 成功获取接口列表');
      expect(result).toContain('总接口数：0个');
      expect(result).toContain('当前页码：第1页');
    });

    test('应该处理项目不存在错误', async () => {
      const mockResponse = {
        errcode: 40021,
        errmsg: '项目不存在',
        data: {} as any
      };
      mockYapiService.listInterfaces.mockResolvedValue(mockResponse);

      const result = await listInterfacesTool.execute({
        project_id: 999,
        page: 1,
        limit: 20
      });

      expect(result).toBe('❌ 获取接口列表失败: 项目不存在');
    });

    test('应该处理网络异常', async () => {
      const error = new Error('Connection timeout');
      mockYapiService.listInterfaces.mockRejectedValue(error);

      const result = await listInterfacesTool.execute({
        project_id: 1,
        page: 1,
        limit: 20
      });

      expect(result).toBe('❌ 获取接口列表时发生错误: Connection timeout');
    });
  });

  describe('参数验证', () => {
    test('应该要求正整数项目ID', () => {
      const schema = listInterfacesTool.schema;
      
      expect(schema.safeParse({ project_id: 1 }).success).toBe(true);
      expect(schema.safeParse({ project_id: 0 }).success).toBe(false);
      expect(schema.safeParse({ project_id: -1 }).success).toBe(false);
      expect(schema.safeParse({}).success).toBe(false);
    });

    test('应该支持可选的分页参数', () => {
      const schema = listInterfacesTool.schema;
      
      // 只有项目ID
      expect(schema.safeParse({ project_id: 1 }).success).toBe(true);
      
      // 带分页参数
      expect(schema.safeParse({ 
        project_id: 1, 
        page: 1, 
        limit: 20 
      }).success).toBe(true);
      
      // 无效分页参数
      expect(schema.safeParse({ 
        project_id: 1, 
        page: 0 
      }).success).toBe(false);
      expect(schema.safeParse({ 
        project_id: 1, 
        limit: 0 
      }).success).toBe(false);
    });
  });

  describe('分页显示测试', () => {
    test('应该正确显示分页信息', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 100,
          list: Array.from({ length: 10 }, (_, i) => ({
            _id: i + 1,
            title: `API ${i + 1}`,
            path: `/api/test${i + 1}`,
            method: 'GET' as any,
            catid: 1,
            status: 'done' as any,
            add_time: 1640995200 + i * 100,
            up_time: 1640995200 + i * 100
          }))
        }
      };
      mockYapiService.listInterfaces.mockResolvedValue(mockResponse);

      const result = await listInterfacesTool.execute({
        project_id: 1,
        page: 2,
        limit: 10
      });

      expect(result).toContain('✅ 成功获取接口列表');
      expect(result).toContain('总接口数：100个');
      expect(result).toContain('当前页码：第2页');
      expect(result).toContain('🔗 API 1');
      expect(result).toContain('🔗 API 10');
    });
  });
}); 