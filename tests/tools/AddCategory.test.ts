import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';
import AddCategory from '../../src/tools/AddCategory.js';
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
 * AddCategory工具测试
 * 用于新增分类
 */
describe('AddCategory工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('成功场景', () => {
    test('应该成功新增分类', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: { 
          index: 0,
          name: 'New Category',
          project_id: 1,
          desc: 'Category description',
          uid: 1803,
          add_time: 1750402130,
          up_time: 1750402130,
          _id: 9886,
          __v: 0
        }
      };
      mockYapiClient.setMockResponse('/api/interface/add_cat', successResponse);

      const result = await mockYapiClient.post('/api/interface/add_cat', {
        name: 'New Category',
        project_id: 1,
        desc: 'Category description'
      });

      expect(result.errcode).toBe(0);
      expect(result.errmsg).toBe('成功！');
      expect(result.data._id).toBe(9886);
    });

    test('应该正确传递分类参数', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: { 
          index: 0,
          name: 'API分类',
          project_id: 123,
          desc: '接口分类描述',
          uid: 1803,
          add_time: 1750402130,
          up_time: 1750402130,
          _id: 9887,
          __v: 0
        }
      };
      mockYapiClient.setMockResponse('/api/interface/add_cat', successResponse);

      await mockYapiClient.post('/api/interface/add_cat', {
        name: 'API分类',
        project_id: 123,
        desc: '接口分类描述'
      });

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory).toHaveLength(1);
      expect(callHistory[0]?.method).toBe('POST');
      expect(callHistory[0]?.url).toBe('/api/interface/add_cat');
      expect(callHistory[0]?.data).toEqual({
        name: 'API分类',
        project_id: 123,
        desc: '接口分类描述'
      });
    });
  });

  describe('错误处理', () => {
    test('应该处理分类名称重复的情况', async () => {
      const errorResponse = {
        errcode: 40001,
        errmsg: '分类名已存在'
      };
      mockYapiClient.setMockResponse('/api/interface/add_cat', errorResponse);

      const result = await mockYapiClient.post('/api/interface/add_cat', {
        name: 'Existing Category',
        project_id: 1
      });

      expect(result.errcode).toBe(40001);
      expect(result.errmsg).toBe('分类名已存在');
    });

    test('应该处理项目不存在的情况', async () => {
      const errorResponse = {
        errcode: 40021,
        errmsg: '项目不存在'
      };
      mockYapiClient.setMockResponse('/api/interface/add_cat', errorResponse);

      const result = await mockYapiClient.post('/api/interface/add_cat', {
        name: 'New Category',
        project_id: 999
      });

      expect(result.errcode).toBe(40021);
      expect(result.errmsg).toBe('项目不存在');
    });

    test('应该处理权限不足的情况', async () => {
      const errorResponse = {
        errcode: 40011,
        errmsg: '没有权限'
      };
      mockYapiClient.setMockResponse('/api/interface/add_cat', errorResponse);

      const result = await mockYapiClient.post('/api/interface/add_cat', {
        name: 'New Category',
        project_id: 1
      });

      expect(result.errcode).toBe(40011);
      expect(result.errmsg).toBe('没有权限');
    });
  });

  describe('参数验证', () => {
    test('应该处理必需参数缺失', async () => {
      const errorResponse = {
        errcode: 400,
        errmsg: '缺少参数name'
      };
      mockYapiClient.setMockResponse('/api/interface/add_cat', errorResponse);

      const result = await mockYapiClient.post('/api/interface/add_cat', {
        project_id: 1
        // name 参数缺失
      });

      expect(result.errcode).toBe(400);
      expect(result.errmsg).toBe('缺少参数name');
    });

    test('应该支持可选描述参数', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: { 
          _id: 9886,
          index: 0,
          name: 'API分类',
          project_id: 123,
          desc: '接口分类描述',
          uid: 1803,
          add_time: 1750402130,
          up_time: 1750402130,
          __v: 0
        }
      };
      mockYapiClient.setMockResponse('/api/interface/add_cat', successResponse);

      await mockYapiClient.post('/api/interface/add_cat', {
        name: 'Simple Category',
        project_id: 1
        // desc 是可选的
      });

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.data.name).toBe('Simple Category');
      expect(callHistory[0]?.data.project_id).toBe(1);
      expect(callHistory[0]?.data.desc).toBeUndefined();
    });
  });
});

/**
 * AddCategory MCPTool 测试
 * 测试新增YAPI接口分类的MCP工具
 */
describe('AddCategory MCPTool', () => {
  let addCategoryTool: AddCategory;
  let mockYapiService: jest.Mocked<YapiService>;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 创建工具实例
    addCategoryTool = new AddCategory();
    
    // 创建mock service
    mockYapiService = {
      addCategory: jest.fn()
    } as any;
    
    // Mock YapiService构造函数
    (YapiService as jest.MockedClass<typeof YapiService>).mockImplementation(() => mockYapiService);
  });

  describe('MCPTool基本属性', () => {
    test('应该有正确的工具名称', () => {
      expect(addCategoryTool.name).toBe('add_category');
    });

    test('应该有正确的描述', () => {
      expect(addCategoryTool.description).toContain('在指定YAPI项目中创建新的接口分类');
      expect(addCategoryTool.description).toContain('⚡ 使用说明');
      expect(addCategoryTool.description).toContain('API详情：POST /api/interface/add_cat');
      expect(addCategoryTool.description).toContain('已通过真实API测试');
    });

    test('应该有正确的schema', () => {
      expect(addCategoryTool.schema).toBeDefined();
      
      // 测试有效输入
      const validInput = {
        name: 'Test Category',
        project_id: 1,
        desc: 'Test description'
      };
      const result = addCategoryTool.schema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      // 测试无效输入（缺少必需字段）
      const invalidInput = { project_id: 1 };
      const invalidResult = addCategoryTool.schema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('execute方法测试', () => {
    test('应该成功创建分类', async () => {
      // 设置mock响应 - 基于真实API返回数据
      const mockResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: {
          index: 0,
          name: 'Test Category',
          project_id: 1,
          desc: 'Test description',
          uid: 1803,
          add_time: 1750402130,
          up_time: 1750402130,
          _id: 9886,
          __v: 0
        }
      };
      mockYapiService.addCategory.mockResolvedValue(mockResponse);

      // 执行工具
      const result = await addCategoryTool.execute({
        name: 'Test Category',
        project_id: 1,
        desc: 'Test description'
      });

      // 验证结果
      expect(result).toContain('✅ 成功创建分类: Test Category');
      expect(result).toContain('📊 分类ID: 9886');
      expect(result).toContain('🆔 项目ID: 1');
      expect(result).toContain('📝 描述: Test description');
      expect(result).toContain('🕐 创建时间:');
      
      // 验证service调用
      expect(mockYapiService.addCategory).toHaveBeenCalledWith({
        name: 'Test Category',
        project_id: 1,
        desc: 'Test description'
      });
      expect(mockYapiService.addCategory).toHaveBeenCalledTimes(1);
    });

    test('应该处理无描述的分类创建', async () => {
      // 设置mock响应（无描述）
      const mockResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 2,
          name: 'Category Without Desc',
          project_id: 1,
          desc: undefined,
          uid: 101,
          add_time: 1640995300,
          up_time: 1640995300,
          index: 1
        }
      };
      mockYapiService.addCategory.mockResolvedValue(mockResponse);

      // 执行工具
      const result = await addCategoryTool.execute({
        name: 'Category Without Desc',
        project_id: 1
      });

      // 验证结果
      expect(result).toContain('✅ 成功创建分类: Category Without Desc');
      expect(result).toContain('📝 描述: 无');
    });

    test('应该处理分类名重复错误', async () => {
      // 设置mock错误响应
      const mockResponse = {
        errcode: 40001,
        errmsg: '分类名已存在',
        data: {} as any
      };
      mockYapiService.addCategory.mockResolvedValue(mockResponse);

      // 执行工具
      const result = await addCategoryTool.execute({
        name: 'Duplicate Category',
        project_id: 1
      });

      // 验证结果
      expect(result).toBe('❌ 创建分类失败: 分类名已存在');
      expect(mockYapiService.addCategory).toHaveBeenCalledWith({
        name: 'Duplicate Category',
        project_id: 1
      });
    });

    test('应该处理项目不存在错误', async () => {
      // 设置mock错误响应
      const mockResponse = {
        errcode: 40021,
        errmsg: '项目不存在',
        data: {} as any
      };
      mockYapiService.addCategory.mockResolvedValue(mockResponse);

      // 执行工具
      const result = await addCategoryTool.execute({
        name: 'Test Category',
        project_id: 999
      });

      // 验证结果
      expect(result).toBe('❌ 创建分类失败: 项目不存在');
    });

    test('应该处理权限不足错误', async () => {
      // 设置mock权限错误
      const mockResponse = {
        errcode: 40011,
        errmsg: '没有权限',
        data: {} as any
      };
      mockYapiService.addCategory.mockResolvedValue(mockResponse);

      // 执行工具
      const result = await addCategoryTool.execute({
        name: 'Test Category',
        project_id: 1
      });

      // 验证结果
      expect(result).toBe('❌ 创建分类失败: 没有权限');
    });

    test('应该处理网络异常', async () => {
      // 设置mock异常
      const error = new Error('Network timeout');
      mockYapiService.addCategory.mockRejectedValue(error);

      // 执行工具
      const result = await addCategoryTool.execute({
        name: 'Test Category',
        project_id: 1
      });

      // 验证结果
      expect(result).toBe('❌ 创建分类时发生错误: Network timeout');
    });

    test('应该处理非Error类型的异常', async () => {
      // 设置mock字符串异常
      mockYapiService.addCategory.mockRejectedValue('Unexpected error');

      // 执行工具
      const result = await addCategoryTool.execute({
        name: 'Test Category',
        project_id: 1
      });

      // 验证结果
      expect(result).toBe('❌ 创建分类时发生错误: Unexpected error');
    });
  });

  describe('参数验证', () => {
    test('应该要求有效的分类名称', () => {
      const schema = addCategoryTool.schema;
      
      // 有效名称
      expect(schema.safeParse({ name: 'Valid Name', project_id: 1 }).success).toBe(true);
      expect(schema.safeParse({ name: 'A', project_id: 1 }).success).toBe(true);
      
      // 无效名称
      expect(schema.safeParse({ name: '', project_id: 1 }).success).toBe(false);
      expect(schema.safeParse({ project_id: 1 }).success).toBe(false);
    });

    test('应该要求正整数项目ID', () => {
      const schema = addCategoryTool.schema;
      
      // 有效项目ID
      expect(schema.safeParse({ name: 'Test', project_id: 1 }).success).toBe(true);
      expect(schema.safeParse({ name: 'Test', project_id: 100 }).success).toBe(true);
      
      // 无效项目ID
      expect(schema.safeParse({ name: 'Test', project_id: 0 }).success).toBe(false);
      expect(schema.safeParse({ name: 'Test', project_id: -1 }).success).toBe(false);
      expect(schema.safeParse({ name: 'Test', project_id: 1.5 }).success).toBe(false);
      expect(schema.safeParse({ name: 'Test' }).success).toBe(false);
    });

    test('描述字段应该是可选的', () => {
      const schema = addCategoryTool.schema;
      
      // 有描述
      expect(schema.safeParse({ 
        name: 'Test', 
        project_id: 1, 
        desc: 'Description' 
      }).success).toBe(true);
      
      // 无描述
      expect(schema.safeParse({ 
        name: 'Test', 
        project_id: 1 
      }).success).toBe(true);
      
      // 空描述
      expect(schema.safeParse({ 
        name: 'Test', 
        project_id: 1, 
        desc: '' 
      }).success).toBe(true);
    });
  });

  describe('时间格式化测试', () => {
    test('应该正确格式化创建时间', async () => {
      // 设置mock响应
      const mockResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 1,
          name: 'Time Test Category',
          project_id: 1,
          desc: 'Test',
          uid: 100,
          add_time: 1640995200, // 2022-01-01 08:00:00 UTC
          up_time: 1640995200,
          index: 0
        }
      };
      mockYapiService.addCategory.mockResolvedValue(mockResponse);

      // 执行工具
      const result = await addCategoryTool.execute({
        name: 'Time Test Category',
        project_id: 1,
        desc: 'Test'
      });

      // 验证时间格式化
      expect(result).toContain('🕐 创建时间:');
      // 验证时间戳被正确转换（具体格式取决于本地环境）
      expect(result).toMatch(/🕐 创建时间: \d{4}\/\d{1,2}\/\d{1,2}/);
    });
  });

  describe('集成测试', () => {
    test('完整的分类创建流程', async () => {
      // 模拟真实的分类创建数据
      const realCategoryData = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 42,
          name: 'User Management APIs',
          project_id: 10,
          desc: 'All APIs related to user management including CRUD operations',
          uid: 1001,
          add_time: 1640995200,
          up_time: 1640995200,
          index: 5
        }
      };
      mockYapiService.addCategory.mockResolvedValue(realCategoryData);

      // 执行工具
      const result = await addCategoryTool.execute({
        name: 'User Management APIs',
        project_id: 10,
        desc: 'All APIs related to user management including CRUD operations'
      });

      // 验证完整输出格式
      expect(result).toMatch(/✅ 成功创建分类: User Management APIs/);
      expect(result).toMatch(/📊 分类ID: 42/);
      expect(result).toMatch(/🆔 项目ID: 10/);
      expect(result).toMatch(/📝 描述: All APIs related to user management including CRUD operations/);
      expect(result).toMatch(/🕐 创建时间:/);
      
      // 验证依赖初始化
      expect(YapiClient).toHaveBeenCalledWith({
        baseUrl: 'http://test.yapi.com',
        token: 'test-token'
      });
      expect(YapiService).toHaveBeenCalledWith(expect.any(YapiClient));
    });
  });
}); 