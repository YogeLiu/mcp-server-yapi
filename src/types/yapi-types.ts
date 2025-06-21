/**
 * YAPI统一类型定义
 * 集中管理所有API的请求参数和响应类型
 */

// ========================= 基础类型 =========================

/**
 * YAPI统一响应格式
 */
export interface YapiResponse<T = any> {
  /** 错误码，0表示成功 */
  errcode: number;
  /** 错误消息 */
  errmsg: string;
  /** 响应数据 */
  data: T;
}

/**
 * HTTP方法枚举
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

/**
 * 接口状态枚举
 */
export enum InterfaceStatus {
  DONE = 'done',
  UNDONE = 'undone',
  DEPRECATED = 'deprecated'
}

/**
 * 请求体类型枚举
 */
export enum RequestBodyType {
  NONE = 'none',
  FORM = 'form',
  JSON = 'json',
  TEXT = 'text',
  FILE = 'file',
  RAW = 'raw'
}

/**
 * 响应体类型枚举
 */
export enum ResponseBodyType {
  JSON = 'json',
  TEXT = 'text',
  XML = 'xml',
  RAW = 'raw'
}

// ========================= 实体类型 =========================

/**
 * 环境配置信息
 */
export interface ProjectEnvironment {
  _id: string;
  name: string;
  domain: string;
  header: any[];  // 真实数据显示为空数组，具体结构待进一步确认
  global: any[];  // 真实数据显示为空数组，具体结构待进一步确认
}

/**
 * 项目信息
 */
export interface ProjectInfo {
  _id: number;
  name: string;
  basepath: string;
  desc?: string;
  group_id: number;
  uid: number;
  add_time: number;
  up_time: number;
  env?: ProjectEnvironment[];
  tag?: string[];
  cat?: any[]; // 分类数组，具体类型待定
  color?: string;
  icon?: string;
  project_type?: string;
  strice?: boolean;
  is_mock_open?: boolean;
  is_json5?: boolean;
  switch_notice?: boolean;
  role?: boolean;
}

/**
 * 接口分类信息
 */
export interface CategoryInfo {
  _id: number;
  name: string;
  project_id: number;
  desc?: string;
  uid: number;
  add_time: number;
  up_time: number;
  index?: number;
  __v?: number;  // MongoDB版本字段
}

/**
 * 接口参数
 */
export interface InterfaceParam {
  _id?: string;  // MongoDB生成的ID
  name: string;
  desc?: string;
  required: '0' | '1';
  type?: string;
  example?: string;
}

/**
 * 接口头部
 */
export interface InterfaceHeader {
  _id?: string;  // MongoDB生成的ID
  name: string;
  value: string;
  desc?: string;
  required: '0' | '1';
}

/**
 * 查询路径信息
 */
export interface QueryPath {
  path: string;
  params: any[];
}

/**
 * 接口信息
 */
export interface InterfaceInfo {
  _id: number;
  title: string;
  path: string;
  method: HttpMethod;
  project_id: number;
  catid: number;
  status: InterfaceStatus;
  desc?: string;
  markdown?: string;
  uid: number;
  add_time: number;
  up_time: number;
  
  // 请求相关
  req_params?: InterfaceParam[];
  req_query?: InterfaceParam[];
  req_headers?: InterfaceHeader[];
  req_body_type?: RequestBodyType;
  req_body_form?: InterfaceParam[];
  req_body_other?: string;
  req_body_is_json_schema?: boolean;
  
  // 响应相关
  res_body_type?: ResponseBodyType;
  res_body?: string;
  res_body_is_json_schema?: boolean;
  
  // 真实API返回的额外字段
  edit_uid?: number;
  type?: string;  // 如 "static"
  api_opened?: boolean;
  index?: number;
  tag?: string[];
  username?: string;
  query_path?: QueryPath;
  switch_notice?: boolean;
  __v?: number;  // MongoDB版本字段
}

/**
 * 接口简要信息（用于列表）
 */
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
  tag?: string[];
}

/**
 * 分页信息
 */
export interface PaginationInfo<T> {
  total: number;
  list: T[];
}

/**
 * 分类菜单（带接口列表）
 */
export interface CategoryMenu extends CategoryInfo {
  list: InterfaceSummary[];
}

// ========================= 请求参数类型 =========================

/**
 * 新增接口分类请求参数
 */
export interface AddCategoryRequest {
  name: string;
  project_id: number;
  desc?: string;
}

/**
 * 获取接口详情请求参数
 */
export interface GetInterfaceRequest {
  id: number;
}

/**
 * 获取接口列表请求参数
 */
export interface ListInterfacesRequest {
  project_id: number;
  page?: number;
  limit?: number;
  status?: InterfaceStatus;
  tag?: string;
}

/**
 * 获取分类下接口列表请求参数
 */
export interface ListCategoryInterfacesRequest {
  catid: number;
  page?: number;
  limit?: number;
  status?: InterfaceStatus;
}

/**
 * 获取接口菜单请求参数
 */
export interface GetInterfaceMenuRequest {
  project_id: number;
}

/**
 * 新增接口请求参数
 */
export interface AddInterfaceRequest {
  title: string;
  path: string;
  method: HttpMethod;
  project_id: number;
  catid: number;
  status?: InterfaceStatus;
  desc?: string;
  markdown?: string;
  req_params?: InterfaceParam[];
  req_query?: InterfaceParam[];
  req_headers?: InterfaceHeader[];
  req_body_type?: RequestBodyType;
  req_body_form?: InterfaceParam[];
  req_body_other?: string;
  req_body_is_json_schema?: boolean;
  res_body_type?: ResponseBodyType;
  res_body?: string;
  res_body_is_json_schema?: boolean;
  switch_notice?: boolean;
  api_opened?: boolean;
  tag?: string[];
}

/**
 * 更新接口请求参数
 */
export interface UpdateInterfaceRequest {
  id: number;
  title?: string;
  path?: string;
  method?: HttpMethod;
  catid?: number;
  status?: InterfaceStatus;
  desc?: string;
  req_params?: InterfaceParam[];
  req_query?: InterfaceParam[];
  req_headers?: InterfaceHeader[];
  req_body_type?: RequestBodyType;
  req_body_form?: InterfaceParam[];
  req_body_other?: string;
  res_body_type?: ResponseBodyType;
  res_body?: string;
  res_body_is_json_schema?: boolean;
}

/**
 * 保存接口请求参数（新增或更新）
 */
export interface SaveInterfaceRequest extends Omit<AddInterfaceRequest, 'project_id'> {
  id?: number;
  project_id: number;
}

/**
 * 数据导入请求参数
 */
export interface ImportDataRequest {
  project_id: number;
  type: 'swagger' | 'postman' | 'har' | 'json';
  data_type: 'json' | 'url';
  merge: 'normal' | 'good' | 'merge';
  json?: string;  // 当data_type为json时使用，YAPI真实API参数名为json
  url?: string;   // 当data_type为url时使用
}

// ========================= 响应数据类型 =========================

/**
 * 获取项目信息响应
 */
export type GetProjectResponse = YapiResponse<ProjectInfo>;

/**
 * 新增分类响应
 */
export type AddCategoryResponse = YapiResponse<CategoryInfo>;

/**
 * 获取分类菜单响应
 */
export type GetCategoryMenuResponse = YapiResponse<CategoryInfo[]>;

/**
 * 获取接口详情响应
 */
export type GetInterfaceResponse = YapiResponse<InterfaceInfo>;

/**
 * 获取接口列表响应
 */
export type ListInterfacesResponse = YapiResponse<PaginationInfo<InterfaceSummary>>;

/**
 * 获取分类下接口列表响应
 */
export type ListCategoryInterfacesResponse = YapiResponse<PaginationInfo<InterfaceSummary>>;

/**
 * 获取接口菜单响应
 */
export type GetInterfaceMenuResponse = YapiResponse<CategoryMenu[]>;

/**
 * 新增接口响应
 */
export type AddInterfaceResponse = YapiResponse<InterfaceInfo>;

/**
 * 更新接口响应
 */
export type UpdateInterfaceResponse = YapiResponse<InterfaceInfo>;

/**
 * 保存接口响应
 */
export type SaveInterfaceResponse = YapiResponse<InterfaceInfo>;

/**
 * 数据导入响应数据
 */
export interface ImportDataResult {
  count: number;
  message: string;
  importType: string;
  mergeType?: string;
  source?: string;
  details: Array<{
    title: string;
    path: string;
    method: string;
    status: 'imported' | 'merged' | 'skipped' | 'error';
    error?: string;
    [key: string]: any;
  }>;
}

/**
 * 数据导入响应
 */
export type ImportDataResponse = YapiResponse<ImportDataResult>;