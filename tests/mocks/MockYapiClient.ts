import { YapiConfig } from "../../src/config.js";
import {
  INTERFACE_ENDPOINTS,
  PROJECT_ENDPOINTS,
  OPEN_ENDPOINTS,
} from "../../src/constants/yapi-endpoints.js";
import { YapiResponse } from "../../src/utils/yapi-request.js";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  PATCH = "PATCH",
}

export enum InterfaceStatus {
  DONE = "done",
  UNDONE = "undone",
  DEPRECATED = "deprecated",
}

export enum RequestBodyType {
  NONE = "none",
  FORM = "form",
  JSON = "json",
  FILE = "file",
  RAW = "raw",
}

export enum ResponseBodyType {
  JSON = "json",
  RAW = "raw",
}

export interface ProjectInfo {
  _id: number;
  name: string;
  basepath: string;
  desc: string;
  group_id: number;
  uid: number;
  add_time: number;
  up_time: number;
  env?: { name: string; domain: string }[];
  tag?: string[];
  color?: string;
  project_type?: string;
  switch_notice?: boolean;
  is_mock_open?: boolean;
  strice?: boolean;
  is_json5?: boolean;
  icon?: string;
  cat?: { _id: number; name: string }[];
  role?: boolean;
}

export interface CategoryInfo {
  index: number;
  _id: number;
  name: string;
  project_id: number;
  desc: string;
  uid: number;
  add_time: number;
  up_time: number;
  __v?: number;
}

export interface InterfaceInfo {
  _id: number;
  title: string;
  path: string;
  method: HttpMethod;
  project_id: number;
  catid: number;
  status: InterfaceStatus;
  req_body_type: RequestBodyType;
  res_body_type: ResponseBodyType;
  res_body: string;
  uid: number;
  add_time: number;
  up_time: number;
  desc?: string;
  req_params: { name: string; desc: string; required: "0" | "1" }[];
  req_query: {
    name: string;
    desc: string;
    required: "0" | "1";
    type?: string;
    example?: string;
  }[];
  req_headers: {
    name: string;
    value: string;
    desc: string;
    required: "0" | "1";
  }[];
  tag?: string[];
  req_body_other?: string;
  res_body_is_json_schema?: boolean;
  req_body_is_json_schema?: boolean;
  api_opened?: boolean;
}

export interface InterfaceSummary {
  _id: number;
  title: string;
  path: string;
  method: HttpMethod;
  catid: number;
  status: InterfaceStatus;
  add_time: number;
  up_time?: number;
  desc?: string;
  uid?: number;
  username?: string;
}

export interface PaginationInfo<T> {
  total: number;
  list: T[];
}

export interface CategoryMenu extends CategoryInfo {
  list: InterfaceSummary[];
}

export interface ImportDataResult {
  count: number;
  message: string;
  importType: string;
  details: {
    title: string;
    path: string;
    method: string;
    status: string;
  }[];
}

/**
 * Mock YAPI客户端
 * 用于测试11个YAPI工具，现在使用统一的类型系统
 */
export class MockYapiClient {
  private mockResponses: Map<string, any> = new Map();
  private callHistory: Array<{ method: string; url: string; data?: any }> = [];

  constructor(private config: YapiConfig) {}

  /**
   * 设置Mock响应
   */
  setMockResponse(url: string, response: any): void {
    this.mockResponses.set(url, response);
  }

  /**
   * 获取调用历史
   */
  getCallHistory(): Array<{ method: string; url: string; data?: any }> {
    return [...this.callHistory];
  }

  /**
   * 清除调用历史
   */
  clearCallHistory(): void {
    this.callHistory = [];
  }

  /**
   * Mock GET请求
   */
  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    const fullUrl = this.buildUrl(url, params);
    this.callHistory.push({ method: "GET", url: fullUrl });

    const mockResponse = this.mockResponses.get(url);
    if (mockResponse) {
      return mockResponse;
    }

    // 默认成功响应
    return {
      errcode: 0,
      errmsg: "success",
      data: {},
    } as T;
  }

  /**
   * Mock POST请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    isFormData?: boolean
  ): Promise<T> {
    this.callHistory.push({ method: "POST", url, data });

    const mockResponse = this.mockResponses.get(url);
    if (mockResponse) {
      return mockResponse;
    }

    // 默认成功响应
    return {
      errcode: 0,
      errmsg: "success",
      data: { id: 1 },
    } as T;
  }

  /**
   * 构建完整URL
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    if (!params) return url;

    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");

    return queryString ? `${url}?${queryString}` : url;
  }
}

/**
 * 创建Mock YapiClient的工厂函数
 */
export function createMockYapiClient(
  config?: Partial<YapiConfig>
): MockYapiClient {
  const defaultConfig: YapiConfig = {
    baseUrl: "http://mock-yapi.com",
    token: "mock-token-123",
    timeout: 5000,
    debug: false,
    ...config,
  };

  return new MockYapiClient(defaultConfig);
}

/**
 * 标准化的Mock响应数据
 * 使用统一的类型定义
 */
export const MockResponses = {
  // 项目信息
  projectInfo: {
    errcode: 0,
    errmsg: "success",
    data: {
      _id: 1,
      name: "Test Project",
      basepath: "/api",
      desc: "Test project description",
      group_id: 1,
      uid: 1,
      add_time: 1640995200,
      up_time: 1640995200,
      env: [
        { name: "dev", domain: "https://dev.example.com" },
        { name: "prod", domain: "https://api.example.com" },
      ],
      tag: ["test", "api"],
      color: "blue",
      project_type: "private",
    } as ProjectInfo,
  } as YapiResponse<ProjectInfo>,

  // 分类菜单
  categoryMenu: {
    errcode: 0,
    errmsg: "成功！",
    data: [
      {
        index: 0,
        _id: 9877,
        name: "公共分类",
        project_id: 1339,
        desc: "公共分类",
        uid: 1803,
        add_time: 1750338018,
        up_time: 1750338018,
        __v: 0,
      } as CategoryInfo,
    ],
  } as YapiResponse<CategoryInfo[]>,

  // 接口信息
  interfaceInfo: {
    errcode: 0,
    errmsg: "success",
    data: {
      _id: 1,
      title: "Test API",
      path: "/test",
      method: HttpMethod.GET,
      project_id: 1,
      catid: 1,
      status: InterfaceStatus.DONE,
      desc: "Test API description",
      uid: 1,
      add_time: 1640995200,
      up_time: 1640995200,
      req_params: [],
      req_query: [
        {
          name: "page",
          desc: "页码",
          required: "0",
          type: "number",
          example: "1",
        },
      ],
      req_headers: [
        {
          name: "Authorization",
          value: "Bearer token",
          desc: "认证头",
          required: "1",
        },
      ],
      req_body_type: RequestBodyType.NONE,
      res_body_type: ResponseBodyType.JSON,
      res_body: '{"code": 0, "message": "success", "data": {}}',
      tag: ["test"],
    } as InterfaceInfo,
  } as YapiResponse<InterfaceInfo>,

  // 接口列表
  interfaceList: {
    errcode: 0,
    errmsg: "success",
    data: {
      total: 1,
      list: [
        {
          _id: 1,
          title: "Test API",
          path: "/test",
          method: HttpMethod.GET,
          catid: 1,
          status: InterfaceStatus.DONE,
          add_time: 1640995200,
          up_time: 1640995200,
          desc: "Test API description",
          uid: 1,
          username: "admin",
        } as InterfaceSummary,
      ],
    } as PaginationInfo<InterfaceSummary>,
  } as YapiResponse<PaginationInfo<InterfaceSummary>>,

  // 接口菜单
  interfaceMenu: {
    errcode: 0,
    errmsg: "success",
    data: [
      {
        _id: 1,
        name: "Default Category",
        project_id: 1,
        desc: "Default category",
        uid: 1,
        add_time: 1640995200,
        up_time: 1640995200,
        index: 0,
        list: [
          {
            _id: 1,
            title: "Test API",
            path: "/test",
            method: HttpMethod.GET,
            catid: 1,
            status: InterfaceStatus.DONE,
            add_time: 1640995200,
          } as InterfaceSummary,
        ],
      } as CategoryMenu,
    ],
  } as YapiResponse<CategoryMenu[]>,

  // 数据导入结果
  importResult: {
    errcode: 0,
    errmsg: "success",
    data: {
      count: 5,
      message: "成功导入5个接口",
      importType: "swagger",
      details: [
        {
          title: "Get Users",
          path: "/users",
          method: "GET",
          status: "imported",
        },
        {
          title: "Create User",
          path: "/users",
          method: "POST",
          status: "imported",
        },
        {
          title: "Update User",
          path: "/users/{id}",
          method: "PUT",
          status: "imported",
        },
        {
          title: "Delete User",
          path: "/users/{id}",
          method: "DELETE",
          status: "imported",
        },
        {
          title: "Get User Detail",
          path: "/users/{id}",
          method: "GET",
          status: "imported",
        },
      ],
    } as ImportDataResult,
  } as YapiResponse<ImportDataResult>,

  // 错误响应
  error: {
    errcode: 400,
    errmsg: "Bad Request",
  } as YapiResponse<never>,
};

/**
 * API端点常量，用于测试
 */
export const MockEndpoints = {
  PROJECT: PROJECT_ENDPOINTS,
  INTERFACE: INTERFACE_ENDPOINTS,
  OPEN: OPEN_ENDPOINTS,
} as const;

/**
 * 创建类型化的Mock响应
 */
export class TypedMockResponses {
  /**
   * 创建项目信息响应
   */
  static createProjectResponse(
    override?: Partial<ProjectInfo>
  ): YapiResponse<ProjectInfo> {
    return {
      errcode: 0,
      errmsg: "success",
      data: {
        _id: 1,
        name: "Test Project",
        basepath: "/api",
        desc: "Test project description",
        group_id: 1,
        uid: 1,
        add_time: 1640995200,
        up_time: 1640995200,
        ...override,
      },
    };
  }

  /**
   * 创建接口信息响应
   */
  static createInterfaceResponse(
    override?: Partial<InterfaceInfo>
  ): YapiResponse<InterfaceInfo> {
    return {
      errcode: 0,
      errmsg: "success",
      data: {
        _id: 1,
        title: "Test API",
        path: "/test",
        method: HttpMethod.GET,
        project_id: 1,
        catid: 1,
        status: InterfaceStatus.DONE,
        desc: "Test API description",
        uid: 1,
        add_time: 1640995200,
        up_time: 1640995200,
        req_params: [],
        req_query: [],
        req_headers: [],
        req_body_type: RequestBodyType.NONE,
        res_body_type: ResponseBodyType.JSON,
        res_body: "{}",
        ...override,
      },
    };
  }

  /**
   * 创建接口列表响应
   */
  static createInterfaceListResponse(
    interfaces: InterfaceSummary[],
    total?: number
  ): YapiResponse<PaginationInfo<InterfaceSummary>> {
    return {
      errcode: 0,
      errmsg: "success",
      data: {
        total: total ?? interfaces.length,
        list: interfaces,
      },
    };
  }

  /**
   * 创建错误响应
   */
  static createErrorResponse(
    errcode: number,
    errmsg: string
  ): YapiResponse<never> {
    return {
      errcode,
      errmsg,
      data: null as never,
    };
  }
}
