import ListInterface from '../../src/tools/ListInterface.js';
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

describe('ListInterface工具测试', () => {
  const listInterfaceTool = new ListInterface();

  beforeEach(() => {
    (yapi.yapiGet as jest.Mock).mockClear();
  });

  test('应该成功获取项目下的接口列表', async () => {
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

    const input = { project_id: 1, page: 1, limit: 20 };
    const result = await listInterfaceTool.execute(input);

    expect(yapi.yapiGet).toHaveBeenCalledWith('/api/interface/list', input);
    expect(result.errcode).toBe(0);
    expect(result.data.total).toBe(1);
  });

  test('应该处理项目为空的情况', async () => {
    const mockResponse: YapiResponse<PaginationInfo<InterfaceSummary>> = {
      errcode: 0,
      errmsg: '成功！',
      data: {
        total: 0,
        list: [],
      },
    };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const input = { project_id: 1, page: 1, limit: 20 };
    const result = await listInterfaceTool.execute(input);

    expect(result.errcode).toBe(0);
    expect(result.data.total).toBe(0);
  });
}); 