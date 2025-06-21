import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';

/**
 * ImportData工具测试
 * 用于测试YAPI服务端数据导入功能，支持多种格式的API文档导入
 */
describe('ImportData工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('成功场景', () => {
    test('应该成功导入Swagger格式数据', async () => {
      // 设置Mock响应
      const importResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          count: 5,
          message: '成功导入5个接口',
          importType: 'swagger',
          details: [
            { title: 'Get Users', path: '/users', method: 'GET', status: 'imported' },
            { title: 'Create User', path: '/users', method: 'POST', status: 'imported' },
            { title: 'Update User', path: '/users/{id}', method: 'PUT', status: 'imported' },
            { title: 'Delete User', path: '/users/{id}', method: 'DELETE', status: 'imported' },
            { title: 'Get User Detail', path: '/users/{id}', method: 'GET', status: 'imported' }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/open/import_data', importResponse);

      // 模拟Swagger数据导入
      const swaggerData = {
        project_id: 1,
        type: 'swagger',
        data_type: 'json',
        merge: 'normal',
        data: JSON.stringify({
          swagger: '2.0',
          info: { title: 'User API', version: '1.0.0' },
          paths: {
            '/users': {
              get: { summary: 'Get Users', tags: ['User'] },
              post: { summary: 'Create User', tags: ['User'] }
            },
            '/users/{id}': {
              get: { summary: 'Get User Detail', tags: ['User'] },
              put: { summary: 'Update User', tags: ['User'] },
              delete: { summary: 'Delete User', tags: ['User'] }
            }
          }
        })
      };

      // 模拟工具调用
      const result = await mockYapiClient.post('/api/open/import_data', swaggerData);

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.errmsg).toBe('success');
      expect(result.data.count).toBe(5);
      expect(result.data.importType).toBe('swagger');
      expect(result.data.details).toHaveLength(5);

      // 验证导入的接口
      const importedApis = result.data.details;
      expect(importedApis[0].title).toBe('Get Users');
      expect(importedApis[0].method).toBe('GET');
      expect(importedApis[0].status).toBe('imported');

      // 验证调用历史
      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory).toHaveLength(1);
      expect(callHistory[0]?.method).toBe('POST');
      expect(callHistory[0]?.url).toBe('/api/open/import_data');
      expect(callHistory[0]?.data.type).toBe('swagger');
    });

    test('应该成功导入Postman格式数据', async () => {
      // 设置Mock响应
      const postmanImportResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          count: 3,
          message: '成功导入3个接口',
          importType: 'postman',
          details: [
            { title: 'Login', path: '/auth/login', method: 'POST', status: 'imported' },
            { title: 'Logout', path: '/auth/logout', method: 'POST', status: 'imported' },
            { title: 'Profile', path: '/auth/profile', method: 'GET', status: 'imported' }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/open/import_data', postmanImportResponse);

      // 模拟Postman数据导入
      const postmanData = {
        project_id: 1,
        type: 'postman',
        data_type: 'json',
        merge: 'normal',
        data: JSON.stringify({
          info: { name: 'Auth API Collection' },
          item: [
            {
              name: 'Login',
              request: {
                method: 'POST',
                url: '{{baseUrl}}/auth/login',
                body: { mode: 'raw', raw: '{"username":"test","password":"123456"}' }
              }
            },
            {
              name: 'Logout',
              request: {
                method: 'POST',
                url: '{{baseUrl}}/auth/logout'
              }
            },
            {
              name: 'Profile',
              request: {
                method: 'GET',
                url: '{{baseUrl}}/auth/profile'
              }
            }
          ]
        })
      };

      const result = await mockYapiClient.post('/api/open/import_data', postmanData);

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data.count).toBe(3);
      expect(result.data.importType).toBe('postman');
      expect(result.data.details).toHaveLength(3);
    });

    test('应该支持不同合并策略', async () => {
      // 设置Mock响应
      const mergeResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          count: 2,
          message: '成功合并2个接口',
          importType: 'swagger',
          mergeType: 'merge',
          details: [
            { title: 'Existing API', path: '/existing', method: 'GET', status: 'merged' },
            { title: 'New API', path: '/new', method: 'POST', status: 'imported' }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/open/import_data', mergeResponse);

      // 模拟合并模式导入
      const mergeData = {
        project_id: 1,
        type: 'swagger',
        data_type: 'json',
        merge: 'merge', // 合并模式
        data: JSON.stringify({
          swagger: '2.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {
            '/existing': { get: { summary: 'Existing API' } },
            '/new': { post: { summary: 'New API' } }
          }
        })
      };

      const result = await mockYapiClient.post('/api/open/import_data', mergeData);

      // 验证合并结果
      expect(result.errcode).toBe(0);
      expect(result.data.mergeType).toBe('merge');
      expect(result.data.details.some((item: any) => item.status === 'merged')).toBe(true);
      expect(result.data.details.some((item: any) => item.status === 'imported')).toBe(true);
    });

    test('应该支持URL导入方式', async () => {
      // 设置Mock响应
      const urlImportResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          count: 4,
          message: '成功从URL导入4个接口',
          importType: 'swagger',
          source: 'url',
          details: [
            { title: 'Get Items', path: '/items', method: 'GET', status: 'imported' },
            { title: 'Create Item', path: '/items', method: 'POST', status: 'imported' },
            { title: 'Update Item', path: '/items/{id}', method: 'PUT', status: 'imported' },
            { title: 'Delete Item', path: '/items/{id}', method: 'DELETE', status: 'imported' }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/open/import_data', urlImportResponse);

      // 模拟URL导入
      const urlImportData = {
        project_id: 1,
        type: 'swagger',
        data_type: 'url',
        merge: 'normal',
        url: 'https://api.example.com/swagger.json'
      };

      const result = await mockYapiClient.post('/api/open/import_data', urlImportData);

      // 验证URL导入结果
      expect(result.errcode).toBe(0);
      expect(result.data.source).toBe('url');
      expect(result.data.count).toBe(4);
    });
  });

  describe('错误场景', () => {
    test('应该处理无效JSON格式错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40020,
        errmsg: 'JSON格式不正确'
      };
      mockYapiClient.setMockResponse('/api/open/import_data', errorResponse);

      // 模拟无效JSON导入
      const invalidData = {
        project_id: 1,
        type: 'swagger',
        data_type: 'json',
        data: '{"invalid": json}' // 无效JSON
      };

      const result = await mockYapiClient.post('/api/open/import_data', invalidData);

      // 验证错误响应
      expect(result.errcode).toBe(40020);
      expect(result.errmsg).toBe('JSON格式不正确');
    });

    test('应该处理不支持的导入类型错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40021,
        errmsg: '不支持的导入类型'
      };
      mockYapiClient.setMockResponse('/api/open/import_data', errorResponse);

      // 模拟不支持的导入类型
      const unsupportedData = {
        project_id: 1,
        type: 'unknown-format',
        data_type: 'json',
        data: '{"test": "data"}'
      };

      const result = await mockYapiClient.post('/api/open/import_data', unsupportedData);

      // 验证错误响应
      expect(result.errcode).toBe(40021);
      expect(result.errmsg).toBe('不支持的导入类型');
    });

    test('应该处理项目权限错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40007,
        errmsg: '没有权限'
      };
      mockYapiClient.setMockResponse('/api/open/import_data', errorResponse);

      // 模拟无权限导入
      const noPermissionData = {
        project_id: 999,
        type: 'swagger',
        data_type: 'json',
        data: '{"swagger": "2.0"}'
      };

      const result = await mockYapiClient.post('/api/open/import_data', noPermissionData);

      // 验证错误响应
      expect(result.errcode).toBe(40007);
      expect(result.errmsg).toBe('没有权限');
    });

    test('应该处理URL访问失败错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40022,
        errmsg: 'URL访问失败，请检查网络连接'
      };
      mockYapiClient.setMockResponse('/api/open/import_data', errorResponse);

      // 模拟URL访问失败
      const failedUrlData = {
        project_id: 1,
        type: 'swagger',
        data_type: 'url',
        url: 'https://invalid-domain.com/swagger.json'
      };

      const result = await mockYapiClient.post('/api/open/import_data', failedUrlData);

      // 验证错误响应
      expect(result.errcode).toBe(40022);
      expect(result.errmsg).toBe('URL访问失败，请检查网络连接');
    });
  });

  describe('边界条件', () => {
    test('应该处理空数据导入', async () => {
      // 设置Mock响应
      const emptyResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          count: 0,
          message: '没有找到可导入的接口',
          importType: 'swagger',
          details: []
        }
      };
      mockYapiClient.setMockResponse('/api/open/import_data', emptyResponse);

      // 模拟空数据导入
      const emptyData = {
        project_id: 1,
        type: 'swagger',
        data_type: 'json',
        data: JSON.stringify({
          swagger: '2.0',
          info: { title: 'Empty API', version: '1.0.0' },
          paths: {}
        })
      };

      const result = await mockYapiClient.post('/api/open/import_data', emptyData);

      // 验证空导入结果
      expect(result.errcode).toBe(0);
      expect(result.data.count).toBe(0);
      expect(result.data.details).toHaveLength(0);
    });

    test('应该处理大型数据导入', async () => {
      // 设置Mock响应
      const largeResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          count: 100,
          message: '成功导入100个接口',
          importType: 'swagger',
          details: Array.from({ length: 100 }, (_, i) => ({
            title: `API ${i + 1}`,
            path: `/api/endpoint${i + 1}`,
            method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
            status: 'imported'
          }))
        }
      };
      mockYapiClient.setMockResponse('/api/open/import_data', largeResponse);

      // 模拟大型数据导入
      const largeData = {
        project_id: 1,
        type: 'swagger',
        data_type: 'json',
        data: JSON.stringify({
          swagger: '2.0',
          info: { title: 'Large API', version: '1.0.0' },
          paths: Object.fromEntries(
            Array.from({ length: 100 }, (_, i) => [
              `/api/endpoint${i + 1}`,
              {
                get: { summary: `API ${i + 1}` }
              }
            ])
          )
        })
      };

      const result = await mockYapiClient.post('/api/open/import_data', largeData);

      // 验证大型导入结果
      expect(result.errcode).toBe(0);
      expect(result.data.count).toBe(100);
      expect(result.data.details).toHaveLength(100);
    });
  });

  describe('数据验证', () => {
    test('应该验证必要参数', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40001,
        errmsg: 'project_id不能为空'
      };
      mockYapiClient.setMockResponse('/api/open/import_data', errorResponse);

      // 模拟缺少必要参数
      const incompleteData = {
        type: 'swagger',
        data_type: 'json',
        data: '{"test": "data"}'
      };

      const result = await mockYapiClient.post('/api/open/import_data', incompleteData);

      // 验证参数校验
      expect(result.errcode).toBe(40001);
      expect(result.errmsg).toBe('project_id不能为空');
    });

    test('应该正确处理复杂的Swagger结构', async () => {
      // 设置Mock响应
      const complexResponse = {
        errcode: 0,
        errmsg: 'success',
        data: {
          count: 3,
          message: '成功导入3个接口（包含复杂结构）',
          importType: 'swagger',
          details: [
            {
              title: 'Upload File',
              path: '/upload',
              method: 'POST',
              status: 'imported',
              hasFile: true,
              bodyType: 'form-data'
            },
            {
              title: 'Complex Query',
              path: '/search',
              method: 'GET',
              status: 'imported',
              hasParams: true,
              queryCount: 5
            },
            {
              title: 'Nested Response',
              path: '/nested',
              method: 'GET',
              status: 'imported',
              hasNestedResponse: true
            }
          ]
        }
      };
      mockYapiClient.setMockResponse('/api/open/import_data', complexResponse);

      // 模拟复杂Swagger结构导入
      const complexSwaggerData = {
        project_id: 1,
        type: 'swagger',
        data_type: 'json',
        data: JSON.stringify({
          swagger: '2.0',
          info: { title: 'Complex API', version: '1.0.0' },
          definitions: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                profile: { $ref: '#/definitions/Profile' }
              }
            },
            Profile: {
              type: 'object',
              properties: {
                avatar: { type: 'string' },
                bio: { type: 'string' }
              }
            }
          },
          paths: {
            '/upload': {
              post: {
                summary: 'Upload File',
                consumes: ['multipart/form-data'],
                parameters: [
                  {
                    name: 'file',
                    in: 'formData',
                    type: 'file',
                    required: true
                  }
                ]
              }
            }
          }
        })
      };

      const result = await mockYapiClient.post('/api/open/import_data', complexSwaggerData);

      // 验证复杂结构导入
      expect(result.errcode).toBe(0);
      expect(result.data.count).toBe(3);
      expect(result.data.details[0].hasFile).toBe(true);
      expect(result.data.details[1].hasParams).toBe(true);
      expect(result.data.details[2].hasNestedResponse).toBe(true);
    });
  });
}); 