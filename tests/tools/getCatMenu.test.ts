import GetCatMenu from '../../src/tools/getCatMenu.js';
import * as yapi from '../../src/utils/yapi-request.js';
import { YapiResponse } from '../../src/utils/yapi-request.js';
import { CategoryInfo } from '../mocks/MockYapiClient.js';

jest.mock('../../src/utils/yapi-request.js', () => ({
  yapiGet: jest.fn(),
}));

jest.mock('../../src/config.js', () => ({
  getConfig: jest.fn(() => ({
    baseUrl: 'http://test.yapi.com',
    token: 'test-token',
  })),
}));

describe('GetCatMenu工具测试', () => {
  const getCatMenuTool = new GetCatMenu();

  beforeEach(() => {
    (yapi.yapiGet as jest.Mock).mockClear();
  });

  test('应该有正确的工具名称和描述', () => {
    expect(getCatMenuTool.name).toBe('get_cat_menu');
    expect(getCatMenuTool.description).toBe('获取菜单列表 - 获取所有接口分类列表，一般用于了解项目结构和获取分类ID');
  });

  test('应该成功获取分类菜单', async () => {
    const mockData: CategoryInfo[] = [
      { _id: 9877, name: '公共分类', project_id: 1339, desc: '公共分类', uid: 1803, add_time: 1750338018, up_time: 1750338018, index: 0, __v: 0 }
    ];
    const mockResponse: YapiResponse<CategoryInfo[]> = { errcode: 0, errmsg: '成功！', data: mockData };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getCatMenuTool.execute({ project_id: 1339 });

    expect(yapi.yapiGet).toHaveBeenCalledWith('/api/interface/getCatMenu', { project_id: 1339 });
    expect(result.errcode).toBe(0);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('公共分类');
  });

  test('应该处理空分类列表', async () => {
    const mockResponse: YapiResponse<CategoryInfo[]> = { errcode: 0, errmsg: '成功！', data: [] };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getCatMenuTool.execute({ project_id: 1 });
    expect(result.errcode).toBe(0);
    expect(result.data).toHaveLength(0);
  });

  test('应该处理项目不存在错误', async () => {
    const mockResponse: YapiResponse<null> = { errcode: 40021, errmsg: '项目不存在', data: null };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getCatMenuTool.execute({ project_id: 999 });
    expect(result.errcode).toBe(40021);
    expect(result.errmsg).toBe('项目不存在');
  });

  test('应该处理网络异常', async () => {
    (yapi.yapiGet as jest.Mock).mockRejectedValue(new Error('Network error'));
    await expect(getCatMenuTool.execute({ project_id: 1 })).rejects.toThrow('Network error');
  });
});
