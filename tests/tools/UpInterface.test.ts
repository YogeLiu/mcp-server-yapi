import UpInterface from '../../src/tools/UpInterface.js';
import * as yapi from '../../src/utils/yapi-request.js';
import { YapiResponse } from '../../src/utils/yapi-request.js';
import { HttpMethod } from '../mocks/MockYapiClient.js';

jest.mock('../../src/utils/yapi-request.js', () => ({
  yapiPost: jest.fn(),
}));

jest.mock('../../src/config.js', () => ({
  getConfig: jest.fn(() => ({
    baseUrl: 'http://test.yapi.com',
    token: 'test-token',
  })),
}));

describe('UpInterface工具测试', () => {
  const upInterfaceTool = new UpInterface();

  beforeEach(() => {
    (yapi.yapiPost as jest.Mock).mockClear();
  });

  test('应该成功更新接口', async () => {
    const mockResponse: YapiResponse<any> = {
      errcode: 0,
      errmsg: '成功！',
      data: { n: 1, nModified: 1, ok: 1 },
    };
    (yapi.yapiPost as jest.Mock).mockResolvedValue(mockResponse);

    const input = {
      id: 1,
      title: 'Updated API',
      path: '/api/updated',
      method: HttpMethod.PUT,
      catid: 2,
      status: 'done' as const,
      switch_notice: false,
    };
    const result = await upInterfaceTool.execute(input);

    expect(yapi.yapiPost).toHaveBeenCalledWith('/api/interface/up', input);
    expect(result.errcode).toBe(0);
    expect(result.data.nModified).toBe(1);
  });

  test('应该处理接口不存在错误', async () => {
    const mockResponse: YapiResponse<null> = {
      errcode: 40022,
      errmsg: '接口不存在',
      data: null,
    };
    (yapi.yapiPost as jest.Mock).mockResolvedValue(mockResponse);

    const input = {
      id: 999,
      title: 'Non-existent API',
      path: '/api/non-existent',
      method: HttpMethod.GET,
      catid: 1,
      status: 'done' as const,
      switch_notice: false,
    };
    const result = await upInterfaceTool.execute(input);

    expect(result.errcode).toBe(40022);
    expect(result.errmsg).toBe('接口不存在');
  });

  test('应该处理网络异常', async () => {
    (yapi.yapiPost as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const input = {
      id: 1,
      title: 'Updated API',
      path: '/api/updated',
      method: HttpMethod.PUT,
      catid: 2,
      status: 'done' as const,
      switch_notice: false,
    };
    await expect(upInterfaceTool.execute(input)).rejects.toThrow('Network Error');
  });
});
