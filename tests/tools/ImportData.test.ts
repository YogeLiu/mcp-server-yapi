import ImportData from '../../src/tools/ImportData.js';
import * as yapi from '../../src/utils/yapi-request.js';
import { YapiResponse } from '../../src/utils/yapi-request.js';
import { ImportDataResult } from '../mocks/MockYapiClient.js';

jest.mock('../../src/utils/yapi-request.js', () => ({
  yapiPost: jest.fn(),
}));

jest.mock('../../src/config.js', () => ({
  getConfig: jest.fn(() => ({
    baseUrl: 'http://test.yapi.com',
    token: 'test-token',
  })),
}));

describe('ImportData工具测试', () => {
  const importDataTool = new ImportData();

  beforeEach(() => {
    (yapi.yapiPost as jest.Mock).mockClear();
  });

  test('应该成功导入数据', async () => {
    const mockResponse: YapiResponse<ImportDataResult> = {
      errcode: 0,
      errmsg: '成功！',
      data: {
        count: 1,
        message: '导入成功',
        importType: 'swagger',
        details: [
          { title: 'New API', path: '/api/new', method: 'GET', status: 'done' }
        ]
      },
    };
    (yapi.yapiPost as jest.Mock).mockResolvedValue(mockResponse);

    const input = {
      project_id: 1,
      type: 'swagger' as const,
      data_type: 'json' as const,
      json: '{"swagger":"2.0"}',
      merge: 'good' as const,
    };
    const result = await importDataTool.execute(input);

    expect(yapi.yapiPost).toHaveBeenCalledWith('/api/open/import_data', input);
    expect(result.errcode).toBe(0);
    expect(result.data.count).toBe(1);
  });

  test('应该处理导入失败的情况', async () => {
    const mockResponse: YapiResponse<null> = {
      errcode: 400,
      errmsg: '数据格式不正确',
      data: null,
    };
    (yapi.yapiPost as jest.Mock).mockResolvedValue(mockResponse);

    const input = {
      project_id: 1,
      type: 'swagger' as const,
      data_type: 'json' as const,
      json: '{"invalid": "json"}',
      merge: 'good' as const,
    };
    const result = await importDataTool.execute(input);

    expect(result.errcode).toBe(400);
    expect(result.errmsg).toBe('数据格式不正确');
  });

  test('应该处理网络异常', async () => {
    (yapi.yapiPost as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const input = {
      project_id: 1,
      type: 'swagger' as const,
      data_type: 'json' as const,
      json: '{"swagger":"2.0"}',
      merge: 'good' as const,
    };
    await expect(importDataTool.execute(input)).rejects.toThrow('Network Error');
  });
});
