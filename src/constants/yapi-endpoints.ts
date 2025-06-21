/**
 * YAPI API端点定义
 */

// 项目相关
export const PROJECT_ENDPOINTS = {
  GET: '/api/project/get'
} as const;

// 接口相关
export const INTERFACE_ENDPOINTS = {
  GET: '/api/interface/get',
  LIST: '/api/interface/list',
  LIST_CAT: '/api/interface/list_cat',
  LIST_MENU: '/api/interface/list_menu',
  ADD: '/api/interface/add',
  UP: '/api/interface/up',
  SAVE: '/api/interface/save',
  ADD_CAT: '/api/interface/add_cat',
  GET_CAT_MENU: '/api/interface/getCatMenu'
} as const;

// 开放API
export const OPEN_ENDPOINTS = {
  IMPORT_DATA: '/api/open/import_data'
} as const; 