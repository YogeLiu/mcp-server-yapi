import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';
import GetProject from '../../src/tools/GetProject.js';
import { YapiClient } from '../../src/yapi-client.js';
import { YapiService } from '../../src/services/yapi-service.js';
import { loadConfig } from '../../src/config.js';

// Mock所有依赖
jest.mock('../../src/services/yapi-service.js');
jest.mock('../../src/yapi-client.js');
jest.mock('../../src/config.js');

/**
 * GetProject工具测试
 * 用于获取项目信息
 */
describe('GetProject工具测试', () => {
  let mockYapiService: jest.Mocked<YapiService>;
  let getProjectTool: GetProject;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();

    // Mock loadConfig
    (loadConfig as jest.MockedFunction<typeof loadConfig>).mockReturnValue({
      baseUrl: 'http://test.yapi.com',
      token: 'test-token',
      timeout: 10000,
      debug: false
    });

    // 创建mock YapiService
    mockYapiService = {
      getProject: jest.fn(),
      addCategory: jest.fn(),
      getCategoryMenu: jest.fn(),
      getInterface: jest.fn(),
      listInterfaces: jest.fn(),
      listCategoryInterfaces: jest.fn(),
      getInterfaceMenu: jest.fn(),
      addInterface: jest.fn(),
      updateInterface: jest.fn(),
      saveInterface: jest.fn(),
      importData: jest.fn(),
      batchGetInterfaces: jest.fn(),
      batchUpdateInterfaces: jest.fn(),
      checkProjectExists: jest.fn(),
      checkInterfaceExists: jest.fn(),
      getAllProjectInterfaces: jest.fn(),
      findInterfaceByPath: jest.fn()
    } as unknown as jest.Mocked<YapiService>;

    // 创建工具实例
    getProjectTool = new GetProject();

    // Mock YapiService构造函数
    (YapiService as jest.MockedClass<typeof YapiService>).mockImplementation(() => mockYapiService);
  });

  describe('成功场景', () => {
    test('应该成功获取项目信息', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: {
          switch_notice: true,
          is_mock_open: false,
          strice: false,
          is_json5: false,
          _id: 1339,
          name: '测试项目',
          desc: '这是一个测试项目',
          basepath: '/seeyon',
          project_type: 'private',
          uid: 1803,
          group_id: 1214,
          icon: 'code-o',
          color: 'blue',
          add_time: 1750338018,
          up_time: 1750338018,
          env: [
            {
              header: [],
              global: [],
              _id: '685409e237bcc214e006fece',
              name: 'local',
              domain: 'http://127.0.0.1'
            }
          ],
          tag: [],
          cat: [],
          role: false
        }
      };
      mockYapiService.getProject.mockResolvedValue(mockResponse);

      const result = await getProjectTool.execute({});

      expect(result).toContain('✅ 成功获取项目信息');
      expect(result).toContain('📊 项目ID: 1339');
      expect(result).toContain('📝 项目名称: 测试项目');
      expect(result).toContain('🔗 基础路径: /seeyon');
      expect(result).toContain('📄 项目描述: 这是一个测试项目');
      expect(result).toContain('👤 创建者ID: 1803');
      expect(result).toContain('🏷️ 项目标签: 无标签');
      expect(mockYapiService.getProject).toHaveBeenCalledWith();
    });

    test('应该包含完整的项目数据结构', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: {
          switch_notice: false,
          is_mock_open: true,
          strice: true,
          is_json5: true,
          _id: 2024,
          name: '完整项目测试',
          desc: '包含所有字段的完整项目',
          basepath: '/api/v2',
          project_type: 'public',
          uid: 2000,
          group_id: 500,
          icon: 'folder-o',
          color: 'red',
          add_time: 1750400000,
          up_time: 1750500000,
          env: [
            {
              header: [{ name: 'Authorization', value: 'Bearer token', required: '1' }],
              global: [{ name: 'baseUrl', value: 'https://api.example.com' }],
              _id: '675409e237bcc214e006fede',
              name: 'production',
              domain: 'https://prod.example.com'
            }
          ],
          tag: ['production', 'v2'],
          cat: [{ _id: 1, name: '用户管理' }],
          role: true
        }
      };
      mockYapiService.getProject.mockResolvedValue(mockResponse);

      const result = await getProjectTool.execute({});

      // 验证所有字段都被正确显示
      expect(result).toContain('📊 项目ID: 2024');
      expect(result).toContain('📝 项目名称: 完整项目测试');
      expect(result).toContain('🔗 基础路径: /api/v2');
      expect(result).toContain('📄 项目描述: 包含所有字段的完整项目');
      expect(result).toContain('👤 创建者ID: 2000');
      expect(result).toContain('🏷️ 项目标签: production, v2');
      expect(result).toContain('🕒 创建时间: ');
      expect(result).toContain('🔄 更新时间: ');
    });
  });

  describe('错误处理', () => {
    test('应该处理项目不存在的情况', async () => {
      const mockResponse = {
        errcode: 40021,
        errmsg: '项目不存在',
        data: {} as any
      };
      mockYapiService.getProject.mockResolvedValue(mockResponse);

      const result = await getProjectTool.execute({});

      expect(result).toBe('❌ 获取项目信息失败: 项目不存在');
      expect(mockYapiService.getProject).toHaveBeenCalledWith();
    });

    test('应该处理权限不足的情况', async () => {
      const mockResponse = {
        errcode: 40011,
        errmsg: 'token不正确',
        data: {} as any
      };
      mockYapiService.getProject.mockResolvedValue(mockResponse);

      const result = await getProjectTool.execute({});

      expect(result).toBe('❌ 获取项目信息失败: token不正确');
    });
  });

  describe('参数验证', () => {
    test('应该正确传递空参数', () => {
      // 验证schema接受空对象
      const schema = getProjectTool.schema;
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

/**
 * GetProject MCPTool 测试
 * 测试获取YAPI项目信息的MCP工具
 */
describe('GetProject MCPTool', () => {
  let mockYapiService: jest.Mocked<YapiService>;
  let getProjectTool: GetProject;

  beforeEach(() => {
    jest.clearAllMocks();

    (loadConfig as jest.MockedFunction<typeof loadConfig>).mockReturnValue({
      baseUrl: 'http://test.yapi.com',
      token: 'test-token',
      timeout: 10000,
      debug: false
    });

    mockYapiService = {
      getProject: jest.fn(),
      addCategory: jest.fn(),
      getCategoryMenu: jest.fn(),
      getInterface: jest.fn(),
      listInterfaces: jest.fn(),
      listCategoryInterfaces: jest.fn(),
      getInterfaceMenu: jest.fn(),
      addInterface: jest.fn(),
      updateInterface: jest.fn(),
      saveInterface: jest.fn(),
      importData: jest.fn(),
      batchGetInterfaces: jest.fn(),
      batchUpdateInterfaces: jest.fn(),
      checkProjectExists: jest.fn(),
      checkInterfaceExists: jest.fn(),
      getAllProjectInterfaces: jest.fn(),
      findInterfaceByPath: jest.fn()
    } as unknown as jest.Mocked<YapiService>;

    getProjectTool = new GetProject();
    (YapiService as jest.MockedClass<typeof YapiService>).mockImplementation(() => mockYapiService);
  });

  describe('MCPTool基本属性', () => {
    test('应该有正确的工具名称', () => {
      expect(getProjectTool.name).toBe('get_project');
    });

    test('应该有正确的描述', () => {
      expect(getProjectTool.description).toContain('获取当前YAPI项目的详细信息');
      expect(getProjectTool.description).toContain('⚡ 使用说明');
      expect(getProjectTool.description).toContain('无需任何参数');
      expect(getProjectTool.description).toContain('API详情：GET /api/project/get');
    });

    test('应该有正确的schema', () => {
      expect(getProjectTool.schema).toBeDefined();
      
      // 测试schema验证 - 现在应该接受空对象
      const validInput = {};
      const result = getProjectTool.schema.safeParse(validInput);
      expect(result.success).toBe(true);
      
      // 额外参数也应该被接受
      const extraInput = { extraParam: 'ignored' };
      const extraResult = getProjectTool.schema.safeParse(extraInput);
      expect(extraResult.success).toBe(true);
    });
  });

  describe('execute方法测试', () => {
    test('应该成功获取项目信息', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: '成功！',
        data: {
          switch_notice: true,
          is_mock_open: false,
          strice: false,
          is_json5: false,
          _id: 1339,
          name: '测试项目',
          desc: '这是一个测试项目',
          basepath: '/seeyon',
          project_type: 'private',
          uid: 1803,
          group_id: 1214,
          icon: 'code-o',
          color: 'blue',
          add_time: 1750338018,
          up_time: 1750338018,
          env: [
            {
              header: [],
              global: [],
              _id: '685409e237bcc214e006fece',
              name: 'local',
              domain: 'http://127.0.0.1'
            }
          ],
          tag: [],
          cat: [],
          role: false
        }
      };
      mockYapiService.getProject.mockResolvedValue(mockResponse);

      const result = await getProjectTool.execute({});

      expect(result).toContain('✅ 成功获取项目信息:');
      expect(result).toContain('📊 项目ID: 1339');
      expect(result).toContain('📝 项目名称: 测试项目');
      expect(result).toContain('🔗 基础路径: /seeyon');
      expect(result).toContain('📄 项目描述: 这是一个测试项目');
      expect(result).toContain('👤 创建者ID: 1803');
      
      expect(mockYapiService.getProject).toHaveBeenCalledWith();
      expect(mockYapiService.getProject).toHaveBeenCalledTimes(1);
    });

    test('应该处理无描述的项目', async () => {
      const mockResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 2,
          name: 'Project Without Desc',
          basepath: '/api/v2',
          desc: undefined,
          group_id: 1,
          uid: 101,
          add_time: 1640995200,
          up_time: 1640995300
        }
      };
      mockYapiService.getProject.mockResolvedValue(mockResponse);

      const result = await getProjectTool.execute({});

      expect(result).toContain('✅ 成功获取项目信息:');
      expect(result).toContain('📝 项目名称: Project Without Desc');
      expect(result).toContain('📄 项目描述: 无描述');
    });

    test('应该处理API错误响应', async () => {
      const mockResponse = {
        errcode: 40021,
        errmsg: '项目不存在',
        data: {} as any
      };
      mockYapiService.getProject.mockResolvedValue(mockResponse);

      const result = await getProjectTool.execute({});

      expect(result).toBe('❌ 获取项目信息失败: 项目不存在');
      expect(mockYapiService.getProject).toHaveBeenCalledWith();
    });

    test('应该处理权限不足错误', async () => {
      const mockResponse = {
        errcode: 40011,
        errmsg: '没有权限',
        data: {} as any
      };
      mockYapiService.getProject.mockResolvedValue(mockResponse);

      const result = await getProjectTool.execute({});

      expect(result).toBe('❌ 获取项目信息失败: 没有权限');
    });

    test('应该处理网络异常', async () => {
      const error = new Error('Network connection failed');
      mockYapiService.getProject.mockRejectedValue(error);

      const result = await getProjectTool.execute({});

      expect(result).toBe('❌ 网络错误: 无法连接到YAPI服务器，请检查环境变量YAPI_BASE_URL是否正确');
    });

    test('应该处理非Error类型的异常', async () => {
      mockYapiService.getProject.mockRejectedValue('String error');

      const result = await getProjectTool.execute({});

      expect(result).toBe('❌ 获取项目信息时发生未知错误: String error');
    });
  });

  describe('参数验证', () => {
    test('应该接受空对象参数', () => {
      const schema = getProjectTool.schema;
      
      // 空对象应该被接受
      expect(schema.safeParse({}).success).toBe(true);
      
      // 任何额外参数都应该被忽略但不会导致验证失败
      expect(schema.safeParse({ ignoredParam: 'value' }).success).toBe(true);
    });
  });

  describe('集成测试', () => {
    test('完整的工具执行流程', async () => {
      const realProjectData = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 42,
          name: 'Production API',
          basepath: '/api/v1',
          desc: 'Production environment API project',
          uid: 1001,
          group_id: 5,
          add_time: 1640995200,
          up_time: 1641081600
        }
      };
      mockYapiService.getProject.mockResolvedValue(realProjectData);

      const result = await getProjectTool.execute({});

      expect(result).toMatch(/✅ 成功获取项目信息:/);
      expect(result).toMatch(/📊 项目ID: 42/);
      expect(result).toMatch(/📝 项目名称: Production API/);
      expect(result).toMatch(/🔗 基础路径: \/api\/v1/);
      expect(result).toMatch(/📄 项目描述: Production environment API project/);
      expect(result).toMatch(/👤 创建者ID: 1001/);
      
      expect(YapiClient).toHaveBeenCalledWith({
        baseUrl: 'http://test.yapi.com',
        token: 'test-token',
        timeout: 10000,
        debug: false
      });
      expect(YapiService).toHaveBeenCalledWith(expect.any(YapiClient));
    });
  });
}); 