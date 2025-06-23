import ListCat from '../../src/tools/ListCat.js';
import * as yapi from '../../src/utils/yapi-request.js';
import { YapiResponse } from '../../src/utils/yapi-request.js';
import { PaginationInfo, InterfaceSummary, HttpMethod, InterfaceStatus } from '../mocks/MockYapiClient.js';

jest.mock('../../src/utils/yapi-request.js', () => ({
  yapiGet: jest.fn(),
}));

jest.mock('../../src/config.js', () => ({
  getConfig: jest.fn(() => ({
    baseUrl: 'http://test.yapi.com',
    token: 'test-token',
  })),
}));

describe('ListCat工具测试', () => {
  const listCatTool = new ListCat();

  beforeEach(() => {
    (yapi.yapiGet as jest.Mock).mockClear();
  });

  test('应该成功获取分类下的接口列表', async () => {
    const mockResponse: YapiResponse<PaginationInfo<InterfaceSummary>> = {
      errcode: 0,
      errmsg: '成功！',
      data: {
        total: 1,
        list: [
          { _id: 1, title: 'API 1', path: '/api/1', method: HttpMethod.GET, catid: 1, status: InterfaceStatus.DONE, add_time: 123 },
        ],
      },
    };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const input = { catid: 1, page: 1, limit: 20 };
    const result = await listCatTool.execute(input);

    expect(yapi.yapiGet).toHaveBeenCalledWith('/api/interface/list_cat', input);
    expect(result.errcode).toBe(0);
    expect(result.data.total).toBe(1);
  });

  test('应该处理分类为空的情况', async () => {
    const mockResponse: YapiResponse<PaginationInfo<InterfaceSummary>> = {
      errcode: 0,
      errmsg: '成功！',
      data: {
        total: 0,
        list: [],
      },
    };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const input = { catid: 1, page: 1, limit: 20 };
    const result = await listCatTool.execute(input);

    expect(result.errcode).toBe(0);
    expect(result.data.total).toBe(0);
  });

  test('应该处理分类不存在的错误', async () => {
    const mockResponse: YapiResponse<null> = {
      errcode: 40005,
      errmsg: '分类不存在',
      data: null
    };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await listCatTool.execute({ catid: -1 });
    
    expect(result.errcode).toBe(40005);
    expect(result.errmsg).toBe('分类不存在');
  });

  test('应该处理网络异常', async () => {
    (yapi.yapiGet as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(listCatTool.execute({ catid: 1 })).rejects.toThrow('Network Error');
  });
}); 