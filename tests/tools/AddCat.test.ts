import AddCat from '../../src/tools/AddCat.js';
import * as yapi from '../../src/utils/yapi-request.js';
import { YapiResponse } from '../../src/utils/yapi-request.js';
import { CategoryInfo } from '../mocks/MockYapiClient.js';

jest.mock('../../src/utils/yapi-request', () => ({
  yapiPost: jest.fn(),
}));

jest.mock('../../src/config', () => ({
  getConfig: jest.fn(() => ({
    baseUrl: 'http://test.yapi.com',
    token: 'test-token',
  })),
}));

describe('AddCat工具测试', () => {
  const addCatTool = new AddCat();

  beforeEach(() => {
    (yapi.yapiPost as jest.Mock).mockClear();
  });

  test('应该成功新增分类', async () => {
    const mockData: CategoryInfo = {
      index: 0,
      name: 'New Category',
      project_id: 1,
      desc: 'Category description',
      uid: 1803,
      add_time: 1750402130,
      up_time: 1750402130,
      _id: 9886,
      __v: 0,
    };
    const mockResponse: YapiResponse<CategoryInfo> = {
      errcode: 0,
      errmsg: '成功！',
      data: mockData,
    };
    (yapi.yapiPost as jest.Mock).mockResolvedValue(mockResponse);

    const input = { name: 'New Category', project_id: 1, desc: 'Category description' };
    const result = await addCatTool.execute(input);

    expect(yapi.yapiPost).toHaveBeenCalledWith('/api/interface/add_cat', input);
    expect(result.errcode).toBe(0);
    expect(result.data.name).toBe('New Category');
    expect(result.data._id).toBe(9886);
  });

  test('应该处理分类名称重复的情况', async () => {
    const mockResponse: YapiResponse<null> = {
      errcode: 40001,
      errmsg: '分类名已存在',
      data: null,
    };
    (yapi.yapiPost as jest.Mock).mockResolvedValue(mockResponse);

    const input = { name: 'Existing Category', project_id: 1 };
    const result = await addCatTool.execute(input);

    expect(result.errcode).toBe(40001);
    expect(result.errmsg).toBe('分类名已存在');
  });

  test('应该处理网络异常', async () => {
    (yapi.yapiPost as jest.Mock).mockRejectedValue(new Error('Network Error'));
    const input = { name: 'New Category', project_id: 1 };
    await expect(addCatTool.execute(input)).rejects.toThrow('Network Error');
  });
}); 