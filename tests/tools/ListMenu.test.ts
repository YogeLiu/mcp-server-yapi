import ListMenu from '../../src/tools/ListMenu.js';
import * as yapi from '../../src/utils/yapi-request.js';
import { YapiResponse } from '../../src/utils/yapi-request.js';
import { CategoryMenu, HttpMethod, InterfaceStatus } from '../mocks/MockYapiClient.js';

jest.mock('../../src/utils/yapi-request.js', () => ({
  yapiGet: jest.fn(),
}));

jest.mock('../../src/config.js', () => ({
  getConfig: jest.fn(() => ({
    baseUrl: 'http://test.yapi.com',
    token: 'test-token',
  })),
}));

describe('ListMenu工具测试', () => {
  const listMenuTool = new ListMenu();

  beforeEach(() => {
    (yapi.yapiGet as jest.Mock).mockClear();
  });

  test('应该成功获取接口菜单', async () => {
    const mockResponse: YapiResponse<CategoryMenu[]> = {
      errcode: 0,
      errmsg: '成功！',
      data: [
        {
          _id: 1,
          name: 'Category 1',
          project_id: 1,
          desc: 'Desc 1',
          uid: 1,
          add_time: 123,
          up_time: 123,
          index: 0,
          list: [
            { _id: 101, title: 'API 1.1', path: '/api/1.1', method: HttpMethod.GET, catid: 1, status: InterfaceStatus.DONE, add_time: 123 },
          ],
        },
      ],
    };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await listMenuTool.execute({ project_id: 1 });

    expect(yapi.yapiGet).toHaveBeenCalledWith('/api/interface/list_menu', { project_id: 1 });
    expect(result.errcode).toBe(0);
    expect(result.data[0].name).toBe('Category 1');
  });

  test('应该处理空菜单的情况', async () => {
    const mockResponse: YapiResponse<CategoryMenu[]> = { errcode: 0, errmsg: '成功！', data: [] };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await listMenuTool.execute({ project_id: 1 });

    expect(result.errcode).toBe(0);
    expect(result.data).toHaveLength(0);
  });

  test('应该处理项目不存在的错误', async () => {
    const mockResponse: YapiResponse<null> = {
      errcode: 40013,
      errmsg: '项目不存在',
      data: null
    };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await listMenuTool.execute({ project_id: -1 });

    expect(result.errcode).toBe(40013);
    expect(result.errmsg).toBe('项目不存在');
  });

  test('应该处理网络异常', async () => {
    (yapi.yapiGet as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(listMenuTool.execute({ project_id: 1 })).rejects.toThrow('Network Error');
  });
});
