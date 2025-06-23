import GetInterface from '../../src/tools/GetInterface.js';
import * as yapi from '../../src/utils/yapi-request.js';
import { YapiResponse } from '../../src/utils/yapi-request.js';
import { InterfaceInfo, HttpMethod, InterfaceStatus, RequestBodyType, ResponseBodyType } from '../mocks/MockYapiClient.js';

jest.mock('../../src/utils/yapi-request.js', () => ({
  yapiGet: jest.fn(),
}));

jest.mock('../../src/config.js', () => ({
  getConfig: jest.fn(() => ({
    baseUrl: 'http://test.yapi.com',
    token: 'test-token',
  })),
  initializeConfig: jest.fn(),
}));

describe('GetInterface工具测试', () => {
  const getInterfaceTool = new GetInterface();

  beforeEach(() => {
    (yapi.yapiGet as jest.Mock).mockClear();
  });

  test('应该成功获取接口详情', async () => {
    const mockData: InterfaceInfo = {
      _id: 1,
      title: 'Get User Info',
      path: '/api/user/info',
      method: HttpMethod.GET,
      project_id: 1,
      catid: 1,
      status: InterfaceStatus.DONE,
      req_body_type: RequestBodyType.NONE,
      res_body_type: ResponseBodyType.JSON,
      res_body: "{\"code\":0,\"data\":{\"id\":1,\"name\":\"John\"}}",
      uid: 100,
      add_time: 1640995200,
      up_time: 1640995300,
      req_params: [],
      req_query: [],
      req_headers: [],
    };
    const mockResponse: YapiResponse<InterfaceInfo> = { errcode: 0, errmsg: 'success', data: mockData };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getInterfaceTool.execute({ id: 1 });
    
    expect(yapi.yapiGet).toHaveBeenCalledWith('/api/interface/get', { id: 1 });
    expect(result.errcode).toBe(0);
    expect(result.data.title).toBe('Get User Info');
  });

  test('应该处理接口不存在错误', async () => {
    const mockResponse: YapiResponse<null> = { errcode: 40022, errmsg: '接口不存在', data: null };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getInterfaceTool.execute({ id: 999 });

    expect(result.errcode).toBe(40022);
    expect(result.errmsg).toBe('接口不存在');
  });

  test('应该处理网络异常', async () => {
    (yapi.yapiGet as jest.Mock).mockRejectedValue(new Error('Network timeout'));
    await expect(getInterfaceTool.execute({ id: 1 })).rejects.toThrow('Network timeout');
  });
}); 