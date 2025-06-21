import { YapiClient } from '../yapi-client.js';
import { INTERFACE_ENDPOINTS, PROJECT_ENDPOINTS, OPEN_ENDPOINTS } from '../constants/yapi-endpoints.js';
import {
  // 请求类型
  AddCategoryRequest,
  GetInterfaceRequest,
  ListInterfacesRequest,
  ListCategoryInterfacesRequest,
  GetInterfaceMenuRequest,
  AddInterfaceRequest,
  UpdateInterfaceRequest,
  SaveInterfaceRequest,
  ImportDataRequest,
  
  // 响应类型
  GetProjectResponse,
  AddCategoryResponse,
  GetCategoryMenuResponse,
  GetInterfaceResponse,
  ListInterfacesResponse,
  ListCategoryInterfacesResponse,
  GetInterfaceMenuResponse,
  AddInterfaceResponse,
  UpdateInterfaceResponse,
  SaveInterfaceResponse,
  ImportDataResponse
} from '../types/yapi-types.js';

/**
 * YAPI服务层
 * 提供类型安全的API调用接口，封装所有业务逻辑
 */
export class YapiService {
  constructor(private yapiClient: YapiClient) {}

  // ========================= 项目相关API =========================

  /**
   * 获取项目基本信息
   * 只需要token，无需其他参数
   * @returns 项目信息
   */
  async getProject(): Promise<GetProjectResponse> {
    return await this.yapiClient.get<GetProjectResponse>(PROJECT_ENDPOINTS.GET);
  }

  // ========================= 分类相关API =========================

  /**
   * 新增接口分类
   * @param params 请求参数
   * @returns 新增的分类信息
   */
  async addCategory(params: AddCategoryRequest): Promise<AddCategoryResponse> {
    return await this.yapiClient.post<AddCategoryResponse>(
      INTERFACE_ENDPOINTS.ADD_CAT,
      params
    );
  }

  /**
   * 获取分类菜单列表
   * @param project_id 项目ID
   * @returns 分类菜单列表
   */
  async getCategoryMenu(project_id: number): Promise<GetCategoryMenuResponse> {
    return await this.yapiClient.get<GetCategoryMenuResponse>(
      INTERFACE_ENDPOINTS.GET_CAT_MENU,
      { project_id }
    );
  }

  // ========================= 接口相关API =========================

  /**
   * 获取接口详情
   * @param params 请求参数
   * @returns 接口详细信息
   */
  async getInterface(params: GetInterfaceRequest): Promise<GetInterfaceResponse> {
    return await this.yapiClient.get<GetInterfaceResponse>(
      INTERFACE_ENDPOINTS.GET,
      params
    );
  }

  /**
   * 获取接口列表
   * @param params 请求参数
   * @returns 接口列表（分页）
   */
  async listInterfaces(params: ListInterfacesRequest): Promise<ListInterfacesResponse> {
    return await this.yapiClient.get<ListInterfacesResponse>(
      INTERFACE_ENDPOINTS.LIST,
      params
    );
  }

  /**
   * 获取某个分类下的接口列表
   * @param params 请求参数
   * @returns 分类下的接口列表（分页）
   */
  async listCategoryInterfaces(params: ListCategoryInterfacesRequest): Promise<ListCategoryInterfacesResponse> {
    return await this.yapiClient.get<ListCategoryInterfacesResponse>(
      INTERFACE_ENDPOINTS.LIST_CAT,
      params
    );
  }

  /**
   * 获取接口菜单列表
   * @param params 请求参数
   * @returns 接口菜单（树形结构）
   */
  async getInterfaceMenu(params: GetInterfaceMenuRequest): Promise<GetInterfaceMenuResponse> {
    return await this.yapiClient.get<GetInterfaceMenuResponse>(
      INTERFACE_ENDPOINTS.LIST_MENU,
      params
    );
  }

  /**
   * 新增接口
   * @param params 请求参数
   * @returns 新增的接口信息
   */
  async addInterface(params: AddInterfaceRequest): Promise<AddInterfaceResponse> {
    return await this.yapiClient.post<AddInterfaceResponse>(
      INTERFACE_ENDPOINTS.ADD,
      params
    );
  }

  /**
   * 更新接口
   * @param params 请求参数
   * @returns 更新后的接口信息
   */
  async updateInterface(params: UpdateInterfaceRequest): Promise<UpdateInterfaceResponse> {
    return await this.yapiClient.post<UpdateInterfaceResponse>(
      INTERFACE_ENDPOINTS.UP,
      params
    );
  }

  /**
   * 保存接口（新增或更新）
   * @param params 请求参数
   * @returns 保存后的接口信息
   */
  async saveInterface(params: SaveInterfaceRequest): Promise<SaveInterfaceResponse> {
    return await this.yapiClient.post<SaveInterfaceResponse>(
      INTERFACE_ENDPOINTS.SAVE,
      params
    );
  }

  // ========================= 数据导入API =========================

  /**
   * 服务端数据导入
   * @param params 请求参数
   * @returns 导入结果
   */
  async importData(params: ImportDataRequest): Promise<ImportDataResponse> {
    return await this.yapiClient.post<ImportDataResponse>(
      OPEN_ENDPOINTS.IMPORT_DATA,
      params
    );
  }

  // ========================= 批量操作API =========================

  /**
   * 批量获取接口详情
   * @param interfaceIds 接口ID列表
   * @returns 接口详情列表
   */
  async batchGetInterfaces(interfaceIds: number[]): Promise<GetInterfaceResponse[]> {
    const promises = interfaceIds.map(id => 
      this.getInterface({ id })
    );
    return await Promise.all(promises);
  }

  /**
   * 批量更新接口状态
   * @param updates 更新参数列表
   * @returns 更新结果列表
   */
  async batchUpdateInterfaces(updates: UpdateInterfaceRequest[]): Promise<UpdateInterfaceResponse[]> {
    const promises = updates.map(params => 
      this.updateInterface(params)
    );
    return await Promise.all(promises);
  }

  // ========================= 辅助方法 =========================

  /**
   * 检查项目是否存在
   * 只检查当前配置的项目
   * @returns 是否存在
   */
  async checkProjectExists(): Promise<boolean> {
    try {
      const response = await this.getProject();
      return response.errcode === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查接口是否存在
   * @param interfaceId 接口ID
   * @returns 是否存在
   */
  async checkInterfaceExists(interfaceId: number): Promise<boolean> {
    try {
      const response = await this.getInterface({ id: interfaceId });
      return response.errcode === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取项目下所有接口
   * @param projectId 项目ID
   * @returns 所有接口列表
   */
  async getAllProjectInterfaces(projectId: number): Promise<ListInterfacesResponse> {
    // 先获取第一页来确定总数
    const firstPage = await this.listInterfaces({ 
      project_id: projectId, 
      page: 1, 
      limit: 100 
    });

    if (firstPage.errcode !== 0) {
      return firstPage;
    }

    const { total } = firstPage.data;
    
    // 如果总数小于等于100，直接返回
    if (total <= 100) {
      return firstPage;
    }

    // 计算需要获取的页数
    const totalPages = Math.ceil(total / 100);
    const promises = [];
    
    // 从第2页开始获取剩余数据
    for (let page = 2; page <= totalPages; page++) {
      promises.push(
        this.listInterfaces({ 
          project_id: projectId, 
          page, 
          limit: 100 
        })
      );
    }

    const remainingPages = await Promise.all(promises);
    
    // 合并所有页面的数据
    const allInterfaces = [
      ...firstPage.data.list,
      ...remainingPages.flatMap((page: ListInterfacesResponse) => 
        page.errcode === 0 ? page.data.list : []
      )
    ];

    return {
      errcode: 0,
      errmsg: 'success',
      data: {
        total,
        list: allInterfaces
      }
    };
  }

  /**
   * 根据路径和方法查找接口
   * @param projectId 项目ID
   * @param path 接口路径
   * @param method 请求方法
   * @returns 匹配的接口信息
   */
  async findInterfaceByPath(
    projectId: number, 
    path: string, 
    method: string
  ): Promise<GetInterfaceResponse | null> {
    const allInterfaces = await this.getAllProjectInterfaces(projectId);
    
    if (allInterfaces.errcode !== 0) {
      return null;
    }

    const matchedInterface = allInterfaces.data.list.find(
      (item: any) => item.path === path && item.method.toUpperCase() === method.toUpperCase()
    );

    if (!matchedInterface) {
      return null;
    }

    return await this.getInterface({ id: matchedInterface._id });
  }
} 