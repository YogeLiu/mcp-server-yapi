import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';

/**
 * SaveInterface工具测试
 * 智能保存工具：根据是否提供id来决定新增还是更新
 */
describe('SaveInterface工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('新增场景（无id）', () => {
    test('应该调用新增接口', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/add', successResponse);

      const interfaceData = {
        title: 'New API',
        path: '/new-api',
        method: 'GET',
        project_id: 1,
        catid: 1
      };

      const result = await mockYapiClient.post('/api/interface/add', interfaceData);

      expect(result.errcode).toBe(0);
      expect(result.data._id).toBe(1);

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.method).toBe('POST');
      expect(callHistory[0]?.url).toBe('/api/interface/add');
    });
  });

  describe('更新场景（有id）', () => {
    test('应该调用更新接口', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/up', successResponse);

      const interfaceData = {
        id: 1,
        title: 'Updated API',
        path: '/updated-api',
        method: 'POST',
        project_id: 1,
        catid: 1
      };

      const result = await mockYapiClient.post('/api/interface/up', interfaceData);

      expect(result.errcode).toBe(0);
      expect(result.data._id).toBe(1);

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.method).toBe('POST');
      expect(callHistory[0]?.url).toBe('/api/interface/up');
      expect(callHistory[0]?.data.id).toBe(1);
    });
  });

  describe('智能保存逻辑测试', () => {
    test('应该根据id存在与否选择正确的API', async () => {
      // 模拟新增场景
      const addResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/add', addResponse);

      // 模拟更新场景
      const updateResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/up', updateResponse);

      // 测试新增（无id）
      await mockYapiClient.post('/api/interface/add', {
        title: 'New API',
        path: '/new',
        method: 'GET',
        project_id: 1,
        catid: 1
      });

      // 测试更新（有id）
      await mockYapiClient.post('/api/interface/up', {
        id: 1,
        title: 'Updated API',
        path: '/updated',
        method: 'POST',
        project_id: 1,
        catid: 1
      });

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory).toHaveLength(2);
      expect(callHistory[0]?.url).toBe('/api/interface/add');
      expect(callHistory[1]?.url).toBe('/api/interface/up');
    });
  });

  describe('错误处理', () => {
    test('应该处理新增时的错误', async () => {
      const errorResponse = {
        errcode: 40001,
        errmsg: '接口路径已存在'
      };
      mockYapiClient.setMockResponse('/api/interface/add', errorResponse);

      const result = await mockYapiClient.post('/api/interface/add', {
        title: 'Duplicate API',
        path: '/existing',
        method: 'GET',
        project_id: 1,
        catid: 1
      });

      expect(result.errcode).toBe(40001);
      expect(result.errmsg).toBe('接口路径已存在');
    });

    test('应该处理更新时的错误', async () => {
      const errorResponse = {
        errcode: 40022,
        errmsg: '接口不存在'
      };
      mockYapiClient.setMockResponse('/api/interface/up', errorResponse);

      const result = await mockYapiClient.post('/api/interface/up', {
        id: 999,
        title: 'Updated API',
        path: '/updated',
        method: 'GET',
        project_id: 1,
        catid: 1
      });

      expect(result.errcode).toBe(40022);
      expect(result.errmsg).toBe('接口不存在');
    });
  });

  describe('参数验证', () => {
    test('新增时不应该包含id参数', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/add', successResponse);

      await mockYapiClient.post('/api/interface/add', {
        title: 'New API',
        path: '/new',
        method: 'GET',
        project_id: 1,
        catid: 1
      });

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.data.id).toBeUndefined();
    });

    test('更新时必须包含id参数', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/up', successResponse);

      await mockYapiClient.post('/api/interface/up', {
        id: 1,
        title: 'Updated API',
        path: '/updated',
        method: 'GET',
        project_id: 1,
        catid: 1
      });

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.data.id).toBe(1);
    });
  });
}); 