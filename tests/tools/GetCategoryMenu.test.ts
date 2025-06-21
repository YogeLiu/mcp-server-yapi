import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';
import GetCategoryMenu from '../../src/tools/GetCategoryMenu.js';
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
 * GetCategoryMenu MCPTool 测试
 * 测试获取YAPI分类菜单的MCP工具
 */
describe('GetCategoryMenu MCPTool', () => {
  let getCategoryMenuTool: GetCategoryMenu;
  let mockYapiService: jest.Mocked<YapiService>;

  beforeEach(() => {
    jest.clearAllMocks();
    getCategoryMenuTool = new GetCategoryMenu();
    mockYapiService = {
      getCategoryMenu: jest.fn()
    } as any;
    (YapiService as jest.MockedClass<typeof YapiService>).mockImplementation(() => mockYapiService);
  });

  describe('MCPTool基本属性', () => {
    test('应该有正确的工具名称', () => {
      expect(getCategoryMenuTool.name).toBe('get_category_menu');
    });

    test('应该有正确的描述', () => {
      expect(getCategoryMenuTool.description).toContain('获取指定YAPI项目的所有接口分类列表');
      expect(getCategoryMenuTool.description).toContain('⚡ 使用说明');
      expect(getCategoryMenuTool.description).toContain('API详情：GET /api/interface/getCatMenu');
    });

    test('应该有正确的schema', () => {
      expect(getCategoryMenuTool.schema).toBeDefined();
      
      const validInput = { project_id: 1 };
      const result = getCategoryMenuTool.schema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      const invalidInput = { project_id: -1 };
      const invalidResult = getCategoryMenuTool.schema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('execute方法测试', () => {
    test('应该成功获取分类菜单', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: [
          {
            index: 0,
            _id: 9877,
            name: '公共分类',
            project_id: 1339,
            desc: '公共分类',
            uid: 1803,
            add_time: 1750338018,
            up_time: 1750338018,
            __v: 0
          },
          {
            index: 0,
            _id: 9886,
            name: 'API测试分类1750402130756',
            project_id: 1339,
            desc: '这是一个用于测试的接口分类',
            uid: 1803,
            add_time: 1750402130,
            up_time: 1750402130,
            __v: 0
          }
        ]
      };
      mockYapiService.getCategoryMenu.mockResolvedValue(mockResponse);

      const result = await getCategoryMenuTool.execute({ project_id: 1 });

      expect(result).toContain('✅ 成功获取分类菜单，共2个分类');
      expect(result).toContain('📁 公共分类');
      expect(result).toContain('🆔 ID: 9877');
      expect(result).toContain('📁 API测试分类1750402130756');
      expect(result).toContain('🆔 ID: 9886');
      expect(mockYapiService.getCategoryMenu).toHaveBeenCalledWith(1);
    });

    test('应该处理空分类列表', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: []
      };
      mockYapiService.getCategoryMenu.mockResolvedValue(mockResponse);

      const result = await getCategoryMenuTool.execute({ project_id: 1 });

      expect(result).toContain('✅ 成功获取分类菜单，共0个分类');
    });

    test('应该处理项目不存在错误', async () => {
      const mockResponse = {
        errcode: 40021,
        errmsg: '项目不存在',
        data: {} as any
      };
      mockYapiService.getCategoryMenu.mockResolvedValue(mockResponse);

      const result = await getCategoryMenuTool.execute({ project_id: 999 });

      expect(result).toBe('❌ 获取分类菜单失败: 项目不存在');
    });

    test('应该处理网络异常', async () => {
      const error = new Error('Network error');
      mockYapiService.getCategoryMenu.mockRejectedValue(error);

      const result = await getCategoryMenuTool.execute({ project_id: 1 });

      expect(result).toBe('❌ 获取分类菜单时发生错误: Network error');
    });
  });

  describe('参数验证', () => {
    test('应该要求正整数项目ID', () => {
      const schema = getCategoryMenuTool.schema;
      
      expect(schema.safeParse({ project_id: 1 }).success).toBe(true);
      expect(schema.safeParse({ project_id: 0 }).success).toBe(false);
      expect(schema.safeParse({ project_id: -1 }).success).toBe(false);
      expect(schema.safeParse({}).success).toBe(false);
    });
  });
});

/**
 * GetCategoryMenu工具测试
 * 用于获取分类菜单
 */
describe('GetCategoryMenu工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('成功场景', () => {
    test('应该成功获取分类菜单', async () => {
      mockYapiClient.setMockResponse('/api/interface/getCatMenu', MockResponses.categoryMenu);

      const result = await mockYapiClient.get('/api/interface/getCatMenu', { project_id: 1 });

      expect(result.errcode).toBe(0);
      expect(result.errmsg).toBe('成功！');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]._id).toBe(9877);
      expect(result.data[0].name).toBe('公共分类');
    });

    test('应该包含完整的分类信息', async () => {
      mockYapiClient.setMockResponse('/api/interface/getCatMenu', MockResponses.categoryMenu);

      const result = await mockYapiClient.get('/api/interface/getCatMenu', { project_id: 1 });
      const category = result.data[0];

      expect(category).toHaveProperty('_id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('project_id');
      expect(category).toHaveProperty('desc');
      expect(category).toHaveProperty('uid');
      expect(category).toHaveProperty('add_time');
      expect(category).toHaveProperty('up_time');
    });

    test('应该处理空分类列表', async () => {
      const emptyResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: []
      };
      mockYapiClient.setMockResponse('/api/interface/getCatMenu', emptyResponse);

      const result = await mockYapiClient.get('/api/interface/getCatMenu', { project_id: 1 });

      expect(result.errcode).toBe(0);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('错误处理', () => {
    test('应该处理项目不存在的情况', async () => {
      const errorResponse = {
        errcode: 40021,
        errmsg: '项目不存在'
      };
      mockYapiClient.setMockResponse('/api/interface/getCatMenu', errorResponse);

      const result = await mockYapiClient.get('/api/interface/getCatMenu', { project_id: 999 });

      expect(result.errcode).toBe(40021);
      expect(result.errmsg).toBe('项目不存在');
    });

    test('应该处理权限不足的情况', async () => {
      const errorResponse = {
        errcode: 40011,
        errmsg: '没有权限'
      };
      mockYapiClient.setMockResponse('/api/interface/getCatMenu', errorResponse);

      const result = await mockYapiClient.get('/api/interface/getCatMenu', { project_id: 1 });

      expect(result.errcode).toBe(40011);
      expect(result.errmsg).toBe('没有权限');
    });
  });

  describe('参数验证', () => {
    test('应该正确传递项目ID参数', async () => {
      mockYapiClient.setMockResponse('/api/interface/getCatMenu', MockResponses.categoryMenu);

      await mockYapiClient.get('/api/interface/getCatMenu', { project_id: 123 });

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.url).toContain('project_id=123');
    });
  });
}); 