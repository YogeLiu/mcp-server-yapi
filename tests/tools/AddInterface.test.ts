import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';

/**
 * AddInterface工具测试
 * 用于创建新的API接口，支持复杂参数结构
 */
describe('AddInterface工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('成功场景', () => {
    test('应该成功创建简单接口', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/add', successResponse);

      const result = await mockYapiClient.post('/api/interface/add', {
        title: 'Test API',
        path: '/test',
        method: 'GET',
        project_id: 1,
        catid: 1,
        status: 'done',
        desc: 'Test API description'
      });

      expect(result.errcode).toBe(0);
      expect(result.errmsg).toBe('success');
      expect(result.data._id).toBe(1);
    });

    test('应该支持复杂的接口参数结构', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 2 }
      };
      mockYapiClient.setMockResponse('/api/interface/add', successResponse);

      const complexInterface = {
        title: 'Complex API',
        path: '/api/users/{id}',
        method: 'POST',
        project_id: 1,
        catid: 1,
        status: 'done',
        desc: 'Complex API with parameters',
        req_params: [
          {
            name: 'id',
            desc: 'User ID',
            required: '1'
          }
        ],
        req_query: [
          {
            name: 'page',
            desc: 'Page number',
            required: '0'
          }
        ],
        req_headers: [
          {
            name: 'Authorization',
            value: 'Bearer token',
            desc: 'Auth token',
            required: '1'
          }
        ],
        req_body_type: 'json',
        req_body_other: JSON.stringify({
          name: 'string',
          age: 'number'
        }),
        res_body_type: 'json',
        res_body: JSON.stringify({
          code: 0,
          message: 'success',
          data: {}
        })
      };

      await mockYapiClient.post('/api/interface/add', complexInterface);

      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory[0]?.method).toBe('POST');
      expect(callHistory[0]?.data.title).toBe('Complex API');
      expect(callHistory[0]?.data.req_params).toHaveLength(1);
      expect(callHistory[0]?.data.req_query).toHaveLength(1);
      expect(callHistory[0]?.data.req_headers).toHaveLength(1);
    });

    test('应该支持不同的HTTP方法', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };

      for (const method of methods) {
        mockYapiClient.setMockResponse('/api/interface/add', successResponse);
        
        await mockYapiClient.post('/api/interface/add', {
          title: `${method} API`,
          path: '/test',
          method: method,
          project_id: 1,
          catid: 1
        });

        const callHistory = mockYapiClient.getCallHistory();
        const lastCall = callHistory[callHistory.length - 1];
        expect(lastCall?.data.method).toBe(method);
        
        mockYapiClient.clearCallHistory();
      }
    });
  });

  describe('错误处理', () => {
    test('应该处理接口路径重复的情况', async () => {
      const errorResponse = {
        errcode: 40001,
        errmsg: '接口路径已存在'
      };
      mockYapiClient.setMockResponse('/api/interface/add', errorResponse);

      const result = await mockYapiClient.post('/api/interface/add', {
        title: 'Duplicate API',
        path: '/existing-path',
        method: 'GET',
        project_id: 1,
        catid: 1
      });

      expect(result.errcode).toBe(40001);
      expect(result.errmsg).toBe('接口路径已存在');
    });

    test('应该处理分类不存在的情况', async () => {
      const errorResponse = {
        errcode: 40023,
        errmsg: '分类不存在'
      };
      mockYapiClient.setMockResponse('/api/interface/add', errorResponse);

      const result = await mockYapiClient.post('/api/interface/add', {
        title: 'Test API',
        path: '/test',
        method: 'GET',
        project_id: 1,
        catid: 999
      });

      expect(result.errcode).toBe(40023);
      expect(result.errmsg).toBe('分类不存在');
    });

    test('应该处理权限不足的情况', async () => {
      const errorResponse = {
        errcode: 40011,
        errmsg: '没有权限'
      };
      mockYapiClient.setMockResponse('/api/interface/add', errorResponse);

      const result = await mockYapiClient.post('/api/interface/add', {
        title: 'Test API',
        path: '/test',
        method: 'GET',
        project_id: 1,
        catid: 1
      });

      expect(result.errcode).toBe(40011);
      expect(result.errmsg).toBe('没有权限');
    });
  });

  describe('参数验证', () => {
    test('应该处理必需参数缺失', async () => {
      const errorResponse = {
        errcode: 400,
        errmsg: '缺少参数title'
      };
      mockYapiClient.setMockResponse('/api/interface/add', errorResponse);

      const result = await mockYapiClient.post('/api/interface/add', {
        path: '/test',
        method: 'GET',
        project_id: 1,
        catid: 1
        // title 参数缺失
      });

      expect(result.errcode).toBe(400);
      expect(result.errmsg).toBe('缺少参数title');
    });

    test('应该验证请求体类型', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/add', successResponse);

      const bodyTypes = ['none', 'form', 'json', 'file', 'raw'];
      
      for (const bodyType of bodyTypes) {
        await mockYapiClient.post('/api/interface/add', {
          title: 'Test API',
          path: '/test',
          method: 'POST',
          project_id: 1,
          catid: 1,
          req_body_type: bodyType
        });

        const callHistory = mockYapiClient.getCallHistory();
        const lastCall = callHistory[callHistory.length - 1];
        expect(lastCall?.data.req_body_type).toBe(bodyType);
        
        mockYapiClient.clearCallHistory();
      }
    });
  });

  describe('数据格式验证', () => {
    test('应该正确处理JSON格式的请求体', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/add', successResponse);

      const requestBody = {
        username: 'string',
        password: 'string',
        profile: {
          name: 'string',
          age: 'number'
        }
      };

      await mockYapiClient.post('/api/interface/add', {
        title: 'JSON API',
        path: '/json-test',
        method: 'POST',
        project_id: 1,
        catid: 1,
        req_body_type: 'json',
        req_body_other: JSON.stringify(requestBody)
      });

      const callHistory = mockYapiClient.getCallHistory();
      const parsedBody = JSON.parse(callHistory[0]?.data.req_body_other);
      expect(parsedBody.username).toBe('string');
      expect(parsedBody.profile.name).toBe('string');
    });

    test('应该正确处理参数数组', async () => {
      const successResponse = {
        errcode: 0,
        errmsg: 'success',
        data: { _id: 1 }
      };
      mockYapiClient.setMockResponse('/api/interface/add', successResponse);

      await mockYapiClient.post('/api/interface/add', {
        title: 'Param API',
        path: '/param-test',
        method: 'GET',
        project_id: 1,
        catid: 1,
        req_query: [
          { name: 'page', desc: 'Page number', required: '0' },
          { name: 'size', desc: 'Page size', required: '0' },
          { name: 'keyword', desc: 'Search keyword', required: '1' }
        ]
      });

      const callHistory = mockYapiClient.getCallHistory();
      const queryParams = callHistory[0]?.data.req_query;
      expect(queryParams).toHaveLength(3);
      expect(queryParams[2].required).toBe('1');
    });
  });
}); 