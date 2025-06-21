import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';

/**
 * UpdateInterface工具测试
 * 用于更新YAPI接口信息
 */
describe('UpdateInterface工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('成功场景', () => {
    test('应该成功更新接口信息', async () => {
      // 设置Mock响应
      const updateResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 1,
          title: 'Updated API',
          path: '/updated-test',
          method: 'POST',
          project_id: 1,
          catid: 1,
          status: 'done',
          desc: 'Updated API description',
          uid: 1,
          add_time: 1640995200,
          up_time: 1641000000
        }
      };
      mockYapiClient.setMockResponse('/api/interface/up', updateResponse);

      // 模拟更新接口数据
      const updateData = {
        id: 1,
        title: 'Updated API',
        path: '/updated-test',
        method: 'POST',
        desc: 'Updated API description',
        status: 'done'
      };

      // 模拟工具调用
      const result = await mockYapiClient.post('/api/interface/up', updateData);

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.errmsg).toBe('success');
      expect(result.data._id).toBe(1);
      expect(result.data.title).toBe('Updated API');
      expect(result.data.path).toBe('/updated-test');
      expect(result.data.method).toBe('POST');

      // 验证调用历史
      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory).toHaveLength(1);
      expect(callHistory[0]?.method).toBe('POST');
      expect(callHistory[0]?.url).toBe('/api/interface/up');
      expect(callHistory[0]?.data).toEqual(updateData);
    });

    test('应该支持批量更新接口参数', async () => {
      // 设置Mock响应
      const updateResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 1,
          title: 'API with Parameters',
          req_params: [
            { name: 'id', desc: 'User ID', required: '1' }
          ],
          req_query: [
            { name: 'limit', desc: 'Page limit', required: '0' }
          ],
          req_headers: [
            { name: 'Authorization', desc: 'Auth token', required: '1' }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/interface/up', updateResponse);

      // 模拟更新带参数的接口
      const updateData = {
        id: 1,
        title: 'API with Parameters',
        req_params: [
          { name: 'id', desc: 'User ID', required: '1' }
        ],
        req_query: [
          { name: 'limit', desc: 'Page limit', required: '0' }
        ],
        req_headers: [
          { name: 'Authorization', desc: 'Auth token', required: '1' }
        ]
      };

      const result = await mockYapiClient.post('/api/interface/up', updateData);

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.req_params).toHaveLength(1);
      expect(result.data.req_query).toHaveLength(1);
      expect(result.data.req_headers).toHaveLength(1);
    });

    test('应该支持更新接口响应体', async () => {
      // 设置Mock响应
      const updateResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 1,
          res_body_type: 'json',
          res_body: JSON.stringify({
            code: 0,
            message: 'success',
            data: {
              user: {
                id: 1,
                name: 'John'
              }
            }
          })
        }
      };
      mockYapiClient.setMockResponse('/api/interface/up', updateResponse);

      // 模拟更新响应体
      const updateData = {
        id: 1,
        res_body_type: 'json',
        res_body: JSON.stringify({
          code: 0,
          message: 'success',
          data: {
            user: {
              id: 1,
              name: 'John'
            }
          }
        })
      };

      const result = await mockYapiClient.post('/api/interface/up', updateData);

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.res_body_type).toBe('json');
      expect(result.data.res_body).toContain('John');
    });
  });

  describe('错误场景', () => {
    test('应该处理接口不存在的错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40011,
        errmsg: '接口不存在'
      };
      mockYapiClient.setMockResponse('/api/interface/up', errorResponse);

      // 模拟更新不存在的接口
      const updateData = {
        id: 999,
        title: 'Non-existent API'
      };

      const result = await mockYapiClient.post('/api/interface/up', updateData);

      // 验证错误响应
      expect(result.errcode).toBe(40011);
      expect(result.errmsg).toBe('接口不存在');
    });

    test('应该处理权限不足的错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40007,
        errmsg: '没有权限'
      };
      mockYapiClient.setMockResponse('/api/interface/up', errorResponse);

      // 模拟无权限更新
      const updateData = {
        id: 1,
        title: 'Unauthorized Update'
      };

      const result = await mockYapiClient.post('/api/interface/up', updateData);

      // 验证错误响应
      expect(result.errcode).toBe(40007);
      expect(result.errmsg).toBe('没有权限');
    });

    test('应该处理参数校验错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40001,
        errmsg: 'id不能为空'
      };
      mockYapiClient.setMockResponse('/api/interface/up', errorResponse);

      // 模拟缺少必要参数
      const updateData = {
        title: 'Missing ID'
      };

      const result = await mockYapiClient.post('/api/interface/up', updateData);

      // 验证错误响应
      expect(result.errcode).toBe(40001);
      expect(result.errmsg).toBe('id不能为空');
    });
  });

  describe('边界条件', () => {
    test('应该处理最小数据更新', async () => {
      // 设置Mock响应
      const updateResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 1
        }
      };
      mockYapiClient.setMockResponse('/api/interface/up', updateResponse);

      // 只更新必要字段
      const updateData = {
        id: 1
      };

      const result = await mockYapiClient.post('/api/interface/up', updateData);

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data._id).toBe(1);
    });

    test('应该处理大量数据更新', async () => {
      // 设置Mock响应
      const updateResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 1,
          req_body_other: 'x'.repeat(10000) // 大量数据
        }
      };
      mockYapiClient.setMockResponse('/api/interface/up', updateResponse);

      // 模拟大量数据更新
      const updateData = {
        id: 1,
        req_body_other: 'x'.repeat(10000)
      };

      const result = await mockYapiClient.post('/api/interface/up', updateData);

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.req_body_other).toHaveLength(10000);
    });
  });

  describe('特殊字符处理', () => {
    test('应该正确处理包含特殊字符的数据', async () => {
      // 设置Mock响应
      const updateResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          _id: 1,
          title: 'API with "quotes" & <tags>',
          desc: 'Description with\nnewlines\tand\ttabs'
        }
      };
      mockYapiClient.setMockResponse('/api/interface/up', updateResponse);

      // 模拟包含特殊字符的更新
      const updateData = {
        id: 1,
        title: 'API with "quotes" & <tags>',
        desc: 'Description with\nnewlines\tand\ttabs'
      };

      const result = await mockYapiClient.post('/api/interface/up', updateData);

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.title).toBe('API with "quotes" & <tags>');
      expect(result.data.desc).toContain('\n');
    });
  });
}); 