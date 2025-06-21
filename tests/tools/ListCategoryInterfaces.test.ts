 import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';

/**
 * ListCategoryInterfaces工具测试
 * 用于获取某个分类下的接口列表
 */
describe('ListCategoryInterfaces工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('成功场景', () => {
    test('应该成功获取分类下的接口列表', async () => {
      // 设置Mock响应
      const listResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 3,
          list: [
            {
              _id: 1,
              title: 'Get User',
              path: '/user/get',
              method: 'GET',
              catid: 1,
              status: 'done',
              add_time: 1640995200,
              up_time: 1640995200
            },
            {
              _id: 2,
              title: 'Update User',
              path: '/user/update',
              method: 'POST',
              catid: 1,
              status: 'done',
              add_time: 1640995300,
              up_time: 1640995300
            },
            {
              _id: 3,
              title: 'Delete User',
              path: '/user/delete',
              method: 'DELETE',
              catid: 1,
              status: 'undone',
              add_time: 1640995400,
              up_time: 1640995400
            }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', listResponse);

      // 模拟工具调用
      const result = await mockYapiClient.get('/api/interface/list_cat', { catid: 1 });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.errmsg).toBe('success');
      expect(result.data.total).toBe(3);
      expect(result.data.list).toHaveLength(3);

      // 验证第一个接口
      const firstInterface = result.data.list[0];
      expect(firstInterface._id).toBe(1);
      expect(firstInterface.title).toBe('Get User');
      expect(firstInterface.path).toBe('/user/get');
      expect(firstInterface.method).toBe('GET');
      expect(firstInterface.catid).toBe(1);

      // 验证调用历史
      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory).toHaveLength(1);
      expect(callHistory[0]?.method).toBe('GET');
      expect(callHistory[0]?.url).toContain('/api/interface/list_cat');
      expect(callHistory[0]?.url).toContain('catid=1');
    });

    test('应该支持分页查询', async () => {
      // 设置Mock响应
      const pagedResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 25,
          list: Array.from({ length: 10 }, (_, i) => ({
            _id: i + 11,
            title: `API ${i + 11}`,
            path: `/api/test${i + 11}`,
            method: 'GET',
            catid: 1,
            status: 'done',
            add_time: 1640995200 + i * 100,
            up_time: 1640995200 + i * 100
          }))
        }
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', pagedResponse);

      // 模拟分页查询
      const result = await mockYapiClient.get('/api/interface/list_cat', {
        catid: 1,
        page: 2,
        limit: 10
      });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.total).toBe(25);
      expect(result.data.list).toHaveLength(10);
      expect(result.data.list[0]._id).toBe(11); // 第二页开始ID

      // 验证调用历史
      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.url).toContain('page=2');
      expect(callHistory[0]?.url).toContain('limit=10');
    });

    test('应该支持按状态筛选', async () => {
      // 设置Mock响应
      const filteredResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 2,
          list: [
            {
              _id: 1,
              title: 'Done API 1',
              path: '/done1',
              method: 'GET',
              catid: 1,
              status: 'done',
              add_time: 1640995200,
              up_time: 1640995200
            },
            {
              _id: 2,
              title: 'Done API 2',
              path: '/done2',
              method: 'POST',
              catid: 1,
              status: 'done',
              add_time: 1640995300,
              up_time: 1640995300
            }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', filteredResponse);

      // 模拟按状态筛选
      const result = await mockYapiClient.get('/api/interface/list_cat', {
        catid: 1,
        status: 'done'
      });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.total).toBe(2);
      expect(result.data.list.every((item: any) => item.status === 'done')).toBe(true);
    });

    test('应该正确处理空分类', async () => {
      // 设置Mock响应
      const emptyResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 0,
          list: []
        }
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', emptyResponse);

      // 模拟查询空分类
      const result = await mockYapiClient.get('/api/interface/list_cat', { catid: 999 });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.total).toBe(0);
      expect(result.data.list).toHaveLength(0);
    });
  });

  describe('错误场景', () => {
    test('应该处理分类不存在的错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40005,
        errmsg: '分类不存在'
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', errorResponse);

      // 模拟查询不存在的分类
      const result = await mockYapiClient.get('/api/interface/list_cat', { catid: -1 });

      // 验证错误响应
      expect(result.errcode).toBe(40005);
      expect(result.errmsg).toBe('分类不存在');
    });

    test('应该处理权限不足的错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40007,
        errmsg: '没有权限'
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', errorResponse);

      // 模拟无权限访问
      const result = await mockYapiClient.get('/api/interface/list_cat', { catid: 1 });

      // 验证错误响应
      expect(result.errcode).toBe(40007);
      expect(result.errmsg).toBe('没有权限');
    });

    test('应该处理参数校验错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40001,
        errmsg: 'catid不能为空'
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', errorResponse);

      // 模拟缺少必要参数
      const result = await mockYapiClient.get('/api/interface/list_cat', {});

      // 验证错误响应
      expect(result.errcode).toBe(40001);
      expect(result.errmsg).toBe('catid不能为空');
    });
  });

  describe('边界条件', () => {
    test('应该处理极大分页参数', async () => {
      // 设置Mock响应
      const maxPageResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 10000,
          list: []
        }
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', maxPageResponse);

      // 模拟极大分页参数
      const result = await mockYapiClient.get('/api/interface/list_cat', {
        catid: 1,
        page: 1000,
        limit: 100
      });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.total).toBe(10000);
      expect(result.data.list).toHaveLength(0); // 超出范围的页面
    });

    test('应该处理单条记录', async () => {
      // 设置Mock响应
      const singleResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 1,
          list: [
            {
              _id: 1,
              title: 'Single API',
              path: '/single',
              method: 'GET',
              catid: 1,
              status: 'done',
              add_time: 1640995200,
              up_time: 1640995200
            }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', singleResponse);

      // 模拟查询单条记录
      const result = await mockYapiClient.get('/api/interface/list_cat', { catid: 1 });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.total).toBe(1);
      expect(result.data.list).toHaveLength(1);
      expect(result.data.list[0].title).toBe('Single API');
    });
  });

  describe('数据完整性', () => {
    test('应该验证返回数据的完整性', async () => {
      // 设置Mock响应
      const completeResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 1,
          list: [
            {
              _id: 1,
              title: 'Complete API',
              path: '/complete',
              method: 'POST',
              catid: 1,
              status: 'done',
              desc: 'Complete API description',
              uid: 1,
              username: 'admin',
              add_time: 1640995200,
              up_time: 1640995300,
              tag: ['tag1', 'tag2']
            }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', completeResponse);

      // 模拟工具调用
      const result = await mockYapiClient.get('/api/interface/list_cat', { catid: 1 });

      // 验证数据完整性
      const api = result.data.list[0];
      expect(api).toHaveProperty('_id');
      expect(api).toHaveProperty('title');
      expect(api).toHaveProperty('path');
      expect(api).toHaveProperty('method');
      expect(api).toHaveProperty('catid');
      expect(api).toHaveProperty('status');
      expect(api).toHaveProperty('add_time');
      expect(api).toHaveProperty('up_time');
      
      // 验证可选字段
      expect(api.desc).toBe('Complete API description');
      expect(api.tag).toEqual(['tag1', 'tag2']);
    });

    test('应该正确处理不同HTTP方法', async () => {
      // 设置Mock响应
      const methodsResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          total: 5,
          list: [
            { _id: 1, title: 'GET API', method: 'GET', catid: 1 },
            { _id: 2, title: 'POST API', method: 'POST', catid: 1 },
            { _id: 3, title: 'PUT API', method: 'PUT', catid: 1 },
            { _id: 4, title: 'DELETE API', method: 'DELETE', catid: 1 },
            { _id: 5, title: 'PATCH API', method: 'PATCH', catid: 1 }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/interface/list_cat', methodsResponse);

      // 模拟工具调用
      const result = await mockYapiClient.get('/api/interface/list_cat', { catid: 1 });

      // 验证不同HTTP方法
      const methods = result.data.list.map((item: any) => item.method);
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
      expect(methods).toContain('PATCH');
    });
  });
}); 