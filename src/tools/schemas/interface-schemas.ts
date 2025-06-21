import { z } from 'zod';

/**
 * 接口操作的通用字段定义
 * 避免在三个工具中重复定义相同的Schema
 */

// 基础字段
export const commonInterfaceFields = {
  title: z.string().min(1).max(100)
    .describe('接口名称 - 长度1-100字符。建议使用清晰的描述如"获取用户信息"、"创建订单"等'),
  path: z.string().min(1).max(200)
    .describe('接口路径 - API路径如"/api/user/info"等。必须以/开头'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'])
    .describe('HTTP方法 - GET(查询)、POST(创建)、PUT(更新)、DELETE(删除)等'),
  project_id: z.number().int().positive()
    .describe('项目ID - 接口所属的YAPI项目ID'),
  catid: z.number().int().positive()
    .describe('分类ID - 接口所属的分类ID'),
  status: z.enum(['undone', 'done']).default('undone')
    .describe('接口状态 - undone(开发中)或done(已完成)'),
  desc: z.string().optional()
    .describe('接口描述（可选）'),
  req_body_other: z.string().optional()
    .describe('请求体Schema（可选）- JSON Schema格式。example对应"示例"列，default对应"默认值"列'),
  res_body_type: z.enum(['json']).default('json')
    .describe('响应体类型 - 默认为json'),
  res_body_is_json_schema: z.boolean().optional()
    .describe('是否启用JSON Schema（可选）'),
  res_body: z.string().optional()
    .describe('响应体Schema（可选）- JSON Schema格式。')
};

// AddInterface使用的Schema
export const AddInterfaceSchema = z.object({
  ...commonInterfaceFields
});

// UpdateInterface使用的Schema  
export const UpdateInterfaceSchema = z.object({
  id: z.number().int().positive()
    .describe('接口ID - 要更新的接口ID'),
  title: commonInterfaceFields.title.optional(),
  desc: commonInterfaceFields.desc,
  req_body_other: commonInterfaceFields.req_body_other,
  res_body_is_json_schema: commonInterfaceFields.res_body_is_json_schema,
  res_body: commonInterfaceFields.res_body
});

// SaveInterface使用的Schema
export const SaveInterfaceSchema = z.object({
  id: z.number().int().positive().optional()
    .describe('接口ID（可选）- 提供时更新，不提供时新增'),
  ...commonInterfaceFields,
  req_body_type: z.enum(['none', 'form', 'json', 'text', 'file', 'raw']).optional()
    .describe('请求体类型（可选）- json用于API接口'),
  req_body_is_json_schema: z.boolean().optional()
    .describe('是否启用JSON Schema（可选）'),
  api_opened: z.boolean().optional()
    .describe('是否开放接口（可选）'),
  switch_notice: z.boolean().optional()
    .describe('是否开启通知（可选）')
});

/**
 * 公共的Schema描述文本
 */
export const SCHEMA_DESCRIPTIONS = {
  JSON_SCHEMA_FIELDS: `🎯 JSON Schema字段说明：
- "example": 对应YAPI界面的"示例"列，显示字段的示例值
- "default": 对应YAPI界面的"默认值"列，字段的默认值
- "description": 对应字段的备注说明
- "required": 数组中列出必填字段名称
- "type": 字段类型，如string、number、boolean、object、array等`,

  COMMON_WARNINGS: `⚠️ 重要提示：
- 必须确保project_id和catid都是有效的
- 接口路径在同一项目中应该是唯一的
- 更新操作会修改接口的up_time字段
- req_body_other字段需要是有效的JSON Schema字符串`,

  API_VERIFICATION: `📝 真实验证：已通过真实API测试
- 成功创建GET接口ID 12569（带查询参数和请求头）
- 成功创建POST接口ID 12571（带JSON请求体和完整Schema）
- 验证了example vs default字段的关键区别`
}; 