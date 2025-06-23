import SaveInterface from '../../src/tools/SaveInterface.js';
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

/**
 * SaveInterface工具测试
 * 智能保存工具：根据是否提供id来决定新增还是更新
 */
describe('SaveInterface工具测试', () => {
  const saveInterfaceTool = new SaveInterface();

  beforeEach(() => {
    (yapi.yapiPost as jest.Mock).mockClear();
  });

  test('应该成功保存（新增）接口', async () => {
    const mockResponse: YapiResponse<any> = {
      errcode: 0,
      errmsg: '成功！',
      data: [{ _id: 123, title: 'New API' }],
    };
    (yapi.yapiPost as jest.Mock).mockResolvedValue(mockResponse);

    const input = {
      title: 'New API',
      path: '/api/new',
      method: HttpMethod.POST,
      catid: 1,
      status: 'undone' as const,
      switch_notice: false,
    };
    const result = await saveInterfaceTool.execute(input);

    expect(yapi.yapiPost).toHaveBeenCalledWith('/api/interface/save', input);
    expect(result.errcode).toBe(0);
    expect(result.data[0]._id).toBe(123);
  });

  test('应该处理接口已存在错误', async () => {
    const mockResponse: YapiResponse<null> = {
      errcode: 40011,
      errmsg: '接口已存在',
      data: null,
    };
    (yapi.yapiPost as jest.Mock).mockResolvedValue(mockResponse);

    const input = {
      title: 'Existing API',
      path: '/api/existing',
      method: HttpMethod.GET,
      catid: 1,
      status: 'done' as const,
      switch_notice: false,
    };
    const result = await saveInterfaceTool.execute(input);

    expect(result.errcode).toBe(40011);
    expect(result.errmsg).toBe('接口已存在');
  });
}); 