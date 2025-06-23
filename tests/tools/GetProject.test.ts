import GetProject from '../../src/tools/GetProject.js';
import * as yapi from '../../src/utils/yapi-request.js';
import { YapiResponse } from '../../src/utils/yapi-request.js';
import { ProjectInfo } from '../mocks/MockYapiClient.js';

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

describe('GetProject工具测试', () => {
  const getProjectTool = new GetProject();

  beforeEach(() => {
    (yapi.yapiGet as jest.Mock).mockClear();
  });

  test('应该成功获取项目信息', async () => {
    const mockData: ProjectInfo = {
      _id: 1339,
      name: '测试项目',
      desc: '这是一个测试项目',
      basepath: '/seeyon',
      project_type: 'private',
      uid: 1803,
      group_id: 1214,
      add_time: 1750338018,
      up_time: 1750338018,
    };
    const mockResponse: YapiResponse<ProjectInfo> = {
      errcode: 0,
      errmsg: '成功！',
      data: mockData,
    };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getProjectTool.execute({});

    expect(yapi.yapiGet).toHaveBeenCalledWith('/api/project/get');
    expect(result.errcode).toBe(0);
    expect(result.data.name).toBe('测试项目');
  });

  test('应该处理项目不存在的情况', async () => {
    const mockResponse: YapiResponse<null> = {
      errcode: 40021,
      errmsg: '项目不存在',
      data: null,
    };
    (yapi.yapiGet as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getProjectTool.execute({});

    expect(result.errcode).toBe(40021);
    expect(result.errmsg).toBe('项目不存在');
  });

  test('应该处理网络异常', async () => {
    (yapi.yapiGet as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(getProjectTool.execute({})).rejects.toThrow('Network Error');
  });
});
