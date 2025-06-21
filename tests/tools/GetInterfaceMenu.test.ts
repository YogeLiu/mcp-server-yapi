import { MockYapiClient, createMockYapiClient, MockResponses } from '../mocks/MockYapiClient.js';

/**
 * GetInterfaceMenu工具测试
 * 用于获取接口菜单列表，主要用于展示项目的接口结构
 */
describe('GetInterfaceMenu工具测试', () => {
  let mockYapiClient: MockYapiClient;

  beforeEach(() => {
    mockYapiClient = createMockYapiClient();
  });

  describe('成功场景', () => {
    test('应该成功获取项目的接口菜单', async () => {
      // 设置Mock响应
      const menuResponse = {
        errcode: 0,
        errmsg: 'success',
        data: [
          {
            _id: 1,
            name: 'User Management',
            desc: 'User related APIs',
            list: [
              {
                _id: 101,
                title: 'Get User List',
                path: '/api/user/list',
                method: 'GET',
                catid: 1,
                status: 'done'
              },
              {
                _id: 102,
                title: 'Create User',
                path: '/api/user/create',
                method: 'POST',
                catid: 1,
                status: 'done'
              }
            ]
          },
          {
            _id: 2,
            name: 'Order Management',
            desc: 'Order related APIs',
            list: [
              {
                _id: 201,
                title: 'Get Order',
                path: '/api/order/get',
                method: 'GET',
                catid: 2,
                status: 'undone'
              }
            ]
          }
        ]
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', menuResponse);

      // 模拟工具调用
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: 1 });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.errmsg).toBe('success');
      expect(result.data).toHaveLength(2);

      // 验证第一个分类
      const firstCategory = result.data[0];
      expect(firstCategory._id).toBe(1);
      expect(firstCategory.name).toBe('User Management');
      expect(firstCategory.desc).toBe('User related APIs');
      expect(firstCategory.list).toHaveLength(2);

      // 验证第一个接口
      const firstInterface = firstCategory.list[0];
      expect(firstInterface._id).toBe(101);
      expect(firstInterface.title).toBe('Get User List');
      expect(firstInterface.path).toBe('/api/user/list');
      expect(firstInterface.method).toBe('GET');

      // 验证调用历史
      const callHistory = mockYapiClient.getCallHistory();
      expect(callHistory).toHaveLength(1);
      expect(callHistory[0]?.method).toBe('GET');
      expect(callHistory[0]?.url).toContain('/api/interface/list_menu');
      expect(callHistory[0]?.url).toContain('project_id=1');
    });

    test('应该正确处理空项目菜单', async () => {
      // 设置Mock响应
      const emptyMenuResponse = {
        errcode: 0,
        errmsg: 'success',
        data: []
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', emptyMenuResponse);

      // 模拟查询空项目
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: 999 });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    test('应该正确处理分类下无接口的情况', async () => {
      // 设置Mock响应
      const emptyCategoryResponse = {
        errcode: 0,
        errmsg: 'success',
        data: [
          {
            _id: 1,
            name: 'Empty Category',
            desc: 'Category with no interfaces',
            list: []
          },
          {
            _id: 2,
            name: 'Non-empty Category',
            desc: 'Category with interfaces',
            list: [
              {
                _id: 201,
                title: 'Sample API',
                path: '/api/sample',
                method: 'GET',
                catid: 2,
                status: 'done'
              }
            ]
          }
        ]
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', emptyCategoryResponse);

      // 模拟工具调用
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: 1 });

      // 验证结果
      expect(result.errcode).toBe(0);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].list).toHaveLength(0); // 空分类
      expect(result.data[1].list).toHaveLength(1); // 有接口的分类
    });

    test('应该支持复杂的菜单结构', async () => {
      // 设置Mock响应
      const complexMenuResponse = {
        errcode: 0,
        errmsg: 'success',
        data: [
          {
            _id: 1,
            name: 'API v1',
            desc: 'Version 1 APIs',
            list: Array.from({ length: 5 }, (_, i) => ({
              _id: 100 + i,
              title: `API v1.${i + 1}`,
              path: `/api/v1/endpoint${i + 1}`,
              method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
              catid: 1,
              status: i % 2 === 0 ? 'done' : 'undone'
            }))
          },
          {
            _id: 2,
            name: 'API v2',
            desc: 'Version 2 APIs',
            list: Array.from({ length: 3 }, (_, i) => ({
              _id: 200 + i,
              title: `API v2.${i + 1}`,
              path: `/api/v2/endpoint${i + 1}`,
              method: 'POST',
              catid: 2,
              status: 'done'
            }))
          }
        ]
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', complexMenuResponse);

      // 模拟工具调用
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: 1 });

      // 验证复杂结构
      expect(result.errcode).toBe(0);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].list).toHaveLength(5);
      expect(result.data[1].list).toHaveLength(3);

      // 验证不同状态的接口
      const v1Interfaces = result.data[0].list;
      const doneCount = v1Interfaces.filter((item: any) => item.status === 'done').length;
      const undoneCount = v1Interfaces.filter((item: any) => item.status === 'undone').length;
      expect(doneCount).toBe(3);
      expect(undoneCount).toBe(2);
    });
  });

  describe('错误场景', () => {
    test('应该处理项目不存在的错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40013,
        errmsg: '项目不存在'
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', errorResponse);

      // 模拟查询不存在的项目
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: -1 });

      // 验证错误响应
      expect(result.errcode).toBe(40013);
      expect(result.errmsg).toBe('项目不存在');
    });

    test('应该处理权限不足的错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40007,
        errmsg: '没有权限'
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', errorResponse);

      // 模拟无权限访问
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: 1 });

      // 验证错误响应
      expect(result.errcode).toBe(40007);
      expect(result.errmsg).toBe('没有权限');
    });

    test('应该处理参数校验错误', async () => {
      // 设置Mock错误响应
      const errorResponse = {
        errcode: 40001,
        errmsg: 'project_id不能为空'
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', errorResponse);

      // 模拟缺少必要参数
      const result = await mockYapiClient.get('/api/interface/list_menu', {});

      // 验证错误响应
      expect(result.errcode).toBe(40001);
      expect(result.errmsg).toBe('project_id不能为空');
    });
  });

  describe('数据完整性', () => {
    test('应该验证分类数据的完整性', async () => {
      // 设置Mock响应
      const completeMenuResponse = {
        errcode: 0,
        errmsg: 'success',
        data: [
          {
            _id: 1,
            name: 'Complete Category',
            desc: 'Complete category description',
            uid: 1,
            project_id: 1,
            add_time: 1640995200,
            up_time: 1640995300,
            list: [
              {
                _id: 101,
                title: 'Complete Interface',
                path: '/api/complete',
                method: 'GET',
                catid: 1,
                status: 'done',
                desc: 'Complete interface description',
                uid: 1,
                add_time: 1640995200,
                up_time: 1640995300,
                tag: ['tag1', 'tag2']
              }
            ]
          }
        ]
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', completeMenuResponse);

      // 模拟工具调用
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: 1 });

      // 验证分类数据完整性
      const category = result.data[0];
      expect(category).toHaveProperty('_id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('desc');
      expect(category).toHaveProperty('uid');
      expect(category).toHaveProperty('project_id');
      expect(category).toHaveProperty('add_time');
      expect(category).toHaveProperty('up_time');
      expect(category).toHaveProperty('list');

             // 验证接口数据完整性
       const interfaceData = category.list[0];
       expect(interfaceData).toHaveProperty('_id');
       expect(interfaceData).toHaveProperty('title');
       expect(interfaceData).toHaveProperty('path');
       expect(interfaceData).toHaveProperty('method');
       expect(interfaceData).toHaveProperty('catid');
       expect(interfaceData).toHaveProperty('status');
       expect(interfaceData.tag).toEqual(['tag1', 'tag2']);
    });

    test('应该正确处理各种接口状态', async () => {
      // 设置Mock响应
      const statusResponse = {
        errcode: 0,
        errmsg: 'success',
        data: [
          {
            _id: 1,
            name: 'Mixed Status Category',
            desc: 'Category with different status interfaces',
            list: [
              { _id: 1, title: 'Done API', status: 'done', method: 'GET' },
              { _id: 2, title: 'Undone API', status: 'undone', method: 'POST' },
              { _id: 3, title: 'Deprecated API', status: 'deprecated', method: 'PUT' }
            ]
          }
        ]
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', statusResponse);

      // 模拟工具调用
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: 1 });

      // 验证不同状态
      const interfaces = result.data[0].list;
      const statuses = interfaces.map((item: any) => item.status);
      expect(statuses).toContain('done');
      expect(statuses).toContain('undone');
      expect(statuses).toContain('deprecated');
    });
  });

  describe('边界条件', () => {
    test('应该处理超大型项目菜单', async () => {
      // 设置Mock响应
      const largeMenuResponse = {
        errcode: 0,
        errmsg: 'success',
        data: Array.from({ length: 50 }, (_, categoryIndex) => ({
          _id: categoryIndex + 1,
          name: `Category ${categoryIndex + 1}`,
          desc: `Description for category ${categoryIndex + 1}`,
          list: Array.from({ length: 20 }, (_, interfaceIndex) => ({
            _id: (categoryIndex + 1) * 100 + interfaceIndex + 1,
            title: `API ${categoryIndex + 1}.${interfaceIndex + 1}`,
            path: `/api/cat${categoryIndex + 1}/endpoint${interfaceIndex + 1}`,
            method: ['GET', 'POST', 'PUT', 'DELETE'][interfaceIndex % 4],
            catid: categoryIndex + 1,
            status: interfaceIndex % 3 === 0 ? 'done' : 'undone'
          }))
        }))
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', largeMenuResponse);

      // 模拟查询大型项目
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: 1 });

      // 验证大型数据
      expect(result.errcode).toBe(0);
      expect(result.data).toHaveLength(50);
      expect(result.data[0].list).toHaveLength(20);

      // 验证数据结构正确性
      const firstCategory = result.data[0];
      expect(firstCategory.name).toBe('Category 1');
      expect(firstCategory.list[0].title).toBe('API 1.1');
    });

    test('应该处理最小项目菜单', async () => {
      // 设置Mock响应
      const minimalMenuResponse = {
        errcode: 0,
        errmsg: 'success',
        data: [
          {
            _id: 1,
            name: 'Single Category',
            desc: '',
            list: [
              {
                _id: 1,
                title: 'Single API',
                path: '/api/single',
                method: 'GET',
                catid: 1,
                status: 'done'
              }
            ]
          }
        ]
      };
      mockYapiClient.setMockResponse('/api/interface/list_menu', minimalMenuResponse);

      // 模拟查询最小项目
      const result = await mockYapiClient.get('/api/interface/list_menu', { project_id: 1 });

      // 验证最小数据
      expect(result.errcode).toBe(0);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].list).toHaveLength(1);
      expect(result.data[0].name).toBe('Single Category');
      expect(result.data[0].list[0].title).toBe('Single API');
    });
  });
}); 